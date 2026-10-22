import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  authError: string | null;
  isApproved: boolean;
  accessStatus: {
    checked: boolean;
    approved: boolean;
    role: 'admin' | 'user';
    email: string | null;
    message?: string;
  };
  loginWithGoogle: (rolePreference?: 'student' | 'admin') => Promise<UserProfile | null>;
  login: (email: string, rolePreference?: 'student' | 'admin') => Promise<UserProfile | null>;
  register: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  checkAccessStatus: (specificEmail?: string) => Promise<{
    approved: boolean;
    role: 'admin' | 'user';
  }>;
  switchUser: (userId: string) => Promise<void>;
  submitSurvey: (surveyData: {
    experienceLevel: string;
    programmingExposure: string[];
    careerGoal: string;
    dailyAvailableTime: string;
    skillConfidence: Record<string, number>;
  }) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  rewardXp: (amount: number) => Promise<number>;
  syncUser: (updatedUser: UserProfile) => void;
  setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ilp_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return null;
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('ilp_auth_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [accessStatus, setAccessStatus] = useState<{
    checked: boolean;
    approved: boolean;
    role: 'admin' | 'user';
    email: string | null;
    message?: string;
  }>({
    checked: false,
    approved: false,
    role: 'user',
    email: null,
  });

  const checkAccessStatus = async (specificEmail?: string): Promise<{
    approved: boolean;
    role: 'admin' | 'user';
  }> => {
    try {
      const targetEmail = specificEmail || user?.email || firebaseUser?.email || accessStatus.email;
      const data = await api.checkAccess(targetEmail || undefined);
      const status = {
        approved: Boolean(data.approved),
        role: data.approved && data.role === 'admin' ? 'admin' as const : 'user' as const,
      };

      setAccessStatus({
        checked: true,
        ...status,
        email: data.email || targetEmail || null,
        message: data.message,
      });

      if (status.approved && status.role === 'admin') {
        setUser((prev) => (prev && prev.role !== 'admin' ? { ...prev, role: 'admin' } : prev));
      }

      return status;
    } catch (e) {
      console.warn('Could not verify server access status:', e);
    }
    return { approved: false, role: 'user' };
  };

  // Sync token and user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('ilp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ilp_user');
    }
  }, [user]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('ilp_auth_token', authToken);
    } else {
      localStorage.removeItem('ilp_auth_token');
    }
  }, [authToken]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          setAuthToken(token);

          const userDocRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            setUser({
              ...profileData,
              id: profileData.id || fbUser.uid,
              firebaseUid: fbUser.uid,
              email: profileData.email || fbUser.email || '',
              name: profileData.name || fbUser.displayName || 'Learner',
              avatar: profileData.avatar || fbUser.photoURL || undefined,
              lastLoginAt: new Date().toISOString(),
            });
            await setDoc(userDocRef, { lastLoginAt: new Date().toISOString() }, { merge: true });
          } else {
            const newProfile: UserProfile = {
              id: fbUser.uid,
              firebaseUid: fbUser.uid,
              authProvider: 'google',
              name: fbUser.displayName || 'Google Learner',
              email: fbUser.email || 'user@unknown.com',
              avatar: fbUser.photoURL || undefined,
              college: '',
              educationLevel: '',
              department: '',
              yearOfStudy: '',
              experienceLevel: '' as any,
              targetJobRole: '',
              preferredLearningStyle: '',
              dailyAvailableTime: '',
              careerGoal: '',
              skillConfidence: {},
              onboardingCompleted: false,
              xp: 0,
              streakDays: 0,
              lastActiveDate: new Date().toISOString().split('T')[0],
              lastLoginAt: new Date().toISOString(),
              role: 'student',
              createdAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            });
            setUser(newProfile);
          }

          if (fbUser.email) {
            await checkAccessStatus(fbUser.email);
          }
        } catch (error) {
          console.error('Error syncing Firebase user profile:', error);
          setAuthError('Unable to load your account information.');
        }
      } else {
        setUser(null);
        setAuthToken(null);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // Google OAuth Login with verified server-side access control
  const loginWithGoogle = async (rolePreference: 'student' | 'admin' = 'student'): Promise<UserProfile | null> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (error: any) {
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, provider);
          return null;
        }
        throw error;
      }
      const fbUser = result.user;
      const token = await fbUser.getIdToken();
      setAuthToken(token);
      setFirebaseUser(fbUser);

      // Verify access status and role from authoritative backend
      const access = await checkAccessStatus(fbUser.email || undefined);
      const isApproved = access.approved;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userDocRef);

      let profileData: UserProfile;
      if (docSnap.exists()) {
        profileData = docSnap.data() as UserProfile;
        profileData = {
          ...profileData,
          id: profileData.id || fbUser.uid,
          firebaseUid: fbUser.uid,
          name: profileData.name || fbUser.displayName || 'Learner',
          email: profileData.email || fbUser.email || '',
          avatar: profileData.avatar || fbUser.photoURL || undefined,
          authProvider: 'google',
          role: isApproved && access.role === 'admin' ? 'admin' : 'student',
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, { ...profileData, lastLoginAt: new Date().toISOString() }, { merge: true });
      } else {
        profileData = {
          id: fbUser.uid,
          firebaseUid: fbUser.uid,
          authProvider: 'google',
          name: fbUser.displayName || (rolePreference === 'admin' ? 'Prof. Administrator' : 'Student Learner'),
          email: fbUser.email || 'user@example.com',
          avatar: fbUser.photoURL || undefined,
          college: 'Bannari Amman Institute of Technology',
          educationLevel: 'B.Tech / B.E.',
          department: 'Computer Science & Engineering',
          yearOfStudy: '3rd Year',
          experienceLevel: 'Intermediate',
          targetJobRole: rolePreference === 'admin' ? 'Curriculum Administrator' : 'Full Stack Software Developer',
          preferredLearningStyle: 'Hands-on projects & Code drills',
          dailyAvailableTime: '1–2 hours',
          careerGoal: rolePreference === 'admin' ? 'Student Performance Analytics' : 'Placement preparation',
          skillConfidence: {},
          onboardingCompleted: false,
          xp: 0,
          streakDays: 0,
          lastActiveDate: new Date().toISOString().split('T')[0],
          lastLoginAt: new Date().toISOString(),
          role: isApproved && access.role === 'admin' ? 'admin' : 'student',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, { ...profileData, createdAt: new Date().toISOString() });
      }

      setUser(profileData);
      return profileData;
    } catch (err: any) {
      console.error('Google OAuth sign-in error:', err);
      const msg = err.message || 'Google OAuth Authentication failed. Please verify credentials.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, rolePreference?: 'student' | 'admin'): Promise<UserProfile | null> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await api.loginWithEmail(email.trim(), rolePreference);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthToken(res.token);
        localStorage.setItem('ilp_user', JSON.stringify(res.user));
        localStorage.setItem('ilp_auth_token', res.token);
        setAccessStatus({
          checked: true,
          approved: true,
          role: res.user.role === 'admin' ? 'admin' : 'user',
          email: res.user.email,
          message: 'Access approved in real-time.',
        });
        return res.user;
      }
      return null;
    } catch (error: any) {
      const msg = error.message || 'Email authentication failed.';
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!data.email) throw new Error('Email is required.');
      const res = await api.loginWithEmail(data.email.trim(), data.role === 'admin' ? 'admin' : 'student');
      if (res.success && res.user) {
        // Update profile with onboarding fields if provided
        let userProfile = res.user;
        if (data.name || data.department || data.college || data.yearOfStudy) {
          const updated = await api.updateProfile(res.user.id, data);
          if (updated && updated.user) {
            userProfile = updated.user;
          }
        }
        setUser(userProfile);
        setAuthToken(res.token);
        localStorage.setItem('ilp_user', JSON.stringify(userProfile));
        localStorage.setItem('ilp_auth_token', res.token);
        return userProfile;
      }
      return null;
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setFirebaseUser(null);
    setAuthToken(null);
    localStorage.removeItem('ilp_user');
    localStorage.removeItem('ilp_auth_token');
  };

  const switchUser = async (_userId: string) => {
    setIsLoading(true);
    setAuthError('Demo user switching is disabled. Please log in with your Google account to access your real data.');
    setIsLoading(false);
  };

  const submitSurvey = async (surveyData: {
    experienceLevel: string;
    programmingExposure: string[];
    careerGoal: string;
    dailyAvailableTime: string;
    skillConfidence: Record<string, number>;
  }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updated: UserProfile = {
        ...user,
        experienceLevel: surveyData.experienceLevel as any,
        careerGoal: surveyData.careerGoal,
        dailyAvailableTime: surveyData.dailyAvailableTime,
        skillConfidence: surveyData.skillConfidence,
        onboardingCompleted: true,
      };

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, updated, { merge: true });
      }

      setUser(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    if (firebaseUser) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, updated, { merge: true });
    }
    setUser(updated);
  };

  const rewardXp = async (amount: number): Promise<number> => {
    if (!user) return 0;
    const currentXp = user.xp || 0;
    const newXp = Math.max(0, currentXp + amount);
    const updated = { ...user, xp: newXp };
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, { xp: newXp }, { merge: true });
      } catch (e) {
        console.warn('Could not sync XP update to Firestore:', e);
      }
    }
    setUser(updated);
    return newXp;
  };

  const syncUser = (updatedUser: UserProfile) => {
    if (!updatedUser) return;
    setUser(prev => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  useEffect(() => {
    if (authToken) {
      checkAccessStatus();
    } else {
      setAccessStatus({
        checked: true,
        approved: false,
        role: 'user',
        email: null,
      });
    }
  }, [authToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        authToken,
        isAuthenticated: Boolean(user),
        isLoaded,
        isLoading,
        authError,
        isApproved: Boolean(accessStatus.approved),
        accessStatus,
        loginWithGoogle,
        login,
        register,
        logout,
        checkAccessStatus,
        switchUser,
        submitSurvey,
        updateProfile,
        rewardXp,
        syncUser,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Lock,
  Mail,
  User,
  ArrowRight,
  Shield,
  Key,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { api } from '../services/api';

interface AuthPageProps {
  mode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode: initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register, loginWithGoogle, checkAccessStatus, isLoading, authError, setAuthError } = useAuth();
  const { setCurrentView } = useData();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [emailCheck, setEmailCheck] = useState<{ checked: boolean; approved: boolean; role?: string } | null>(null);

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [college, setCollege] = useState('Bannari Amman Institute of Technology');
  const [educationLevel, setEducationLevel] = useState('B.Tech / B.E.');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Basic' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [targetJobRole, setTargetJobRole] = useState('Full Stack Software Developer');
  const [preferredLearningStyle, setPreferredLearningStyle] = useState('Hands-on projects & Code drills');
  const [dailyAvailableTime, setDailyAvailableTime] = useState('1–2 hours');
  const [careerGoal, setCareerGoal] = useState('Placement preparation & Coding interviews');

  const [localError, setLocalError] = useState('');

  // Live real-time check as user types their email
  useEffect(() => {
    if (!loginEmail.includes('@') || loginEmail.length < 5) {
      setEmailCheck(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.verifyEmailAccess(loginEmail.trim());
        setEmailCheck({ checked: true, approved: res.approved, role: res.role });
      } catch (e) {
        setEmailCheck(null);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [loginEmail]);

  const handleGoogleLogin = async (role: 'student' | 'admin') => {
    setLocalError('');
    if (setAuthError) setAuthError(null);
    try {
      const userProfile = await loginWithGoogle(role);
      if (userProfile) {
        // Enforce backend access approval check
        const isApproved = await checkAccessStatus(userProfile.email);
        if (!isApproved) {
          setCurrentView('access-denied');
          return;
        }

        if (userProfile.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('dashboard');
        }
      }
    } catch (err: any) {
      console.error('Google Sign-In caught error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLocalError('Google sign-in popup was closed. Please try again or use direct Email Sign-In below.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setLocalError('Sign-in operation was cancelled.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setLocalError(`Google sign-in is not enabled for this address (${window.location.hostname}). Use Email Sign In below with your approved email.`);
      } else {
        setLocalError(err.message || 'Google OAuth failed. Please try again or sign in with your email below.');
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLocalError('Please provide an email address');
      return;
    }
    setLocalError('');
    try {
      const userProfile = await login(loginEmail.trim());
      if (userProfile) {
        if (userProfile.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('dashboard');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('not been approved')) {
        setCurrentView('access-denied');
      } else {
        setLocalError(err.message || 'Login failed. Please verify credentials or contact the administrator.');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setLocalError('Name and email are required');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    setLocalError('');
    try {
      const userProfile = await register({
        name,
        email: email.trim(),
        college,
        educationLevel,
        department,
        yearOfStudy,
        experienceLevel,
        targetJobRole,
        preferredLearningStyle,
        dailyAvailableTime,
        careerGoal,
      });
      if (userProfile) {
        if (userProfile.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('survey');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('not been approved')) {
        setCurrentView('access-denied');
      } else {
        setLocalError(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <div id="auth-page" className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div
          onClick={() => setCurrentView('landing')}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 mb-3 cursor-pointer hover:scale-105 transition-transform"
        >
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          IntelliLearn Portal
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Official Google OAuth Authentication with Firebase Token Management
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800">
          
          {/* PRIMARY GOOGLE OAUTH BUTTONS */}
          <div className="space-y-3 mb-6">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-center">
              Sign In with Google OAuth (Live Token Verification)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Student Google Login */}
              <button
                id="google-login-student-btn"
                type="button"
                disabled={isLoading}
                onClick={() => handleGoogleLogin('student')}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Login as <strong>Student</strong></span>
              </button>

              {/* Admin Google Login */}
              <button
                id="google-login-admin-btn"
                type="button"
                disabled={isLoading}
                onClick={() => handleGoogleLogin('admin')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Shield className="w-4 h-4 shrink-0 text-purple-200" />
                <span>Login as <strong>Admin</strong></span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              Generates a secure Bearer token synced with Firebase Firestore.
            </p>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Secure Google Sign-In
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setLocalError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Email Sign In
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => {
                setMode('register');
                setLocalError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              New Registration
            </button>
          </div>

          {(localError || authError) && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Institutional / Approved Email Address</label>
                  {emailCheck && (
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        emailCheck.approved ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {emailCheck.approved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved ({emailCheck.role?.toUpperCase()})</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>Pending Admin Approval</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="e.g. krishnaprasathm.ad23@bitsathy.ac.in"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-hidden ${
                      emailCheck?.approved
                        ? 'border-emerald-500/60 focus:border-emerald-500'
                        : emailCheck
                        ? 'border-amber-500/50'
                        : 'border-slate-700'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter your Gmail ID or institutional email approved by the platform administrator.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-login-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="register-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="priya@college.edu"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    id="register-confirm-password-input"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Academic Info */}
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Academic & Career Information
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">College / Organization</label>
                    <input
                      id="register-college-input"
                      type="text"
                      value={college}
                      onChange={e => setCollege(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Degree / Education Level</label>
                    <select
                      id="register-education-select"
                      value={educationLevel}
                      onChange={e => setEducationLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                      <option value="BCA / MCA">BCA / MCA</option>
                      <option value="B.Sc / M.Sc CS">B.Sc / M.Sc Computer Science</option>
                      <option value="Diploma">Diploma in Engineering</option>
                      <option value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Department / Branch</label>
                    <input
                      id="register-dept-input"
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Artificial Intelligence & DS"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Year of Study</label>
                    <select
                      id="register-year-select"
                      value={yearOfStudy}
                      onChange={e => setYearOfStudy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="Final Year">Final Year</option>
                      <option value="Graduate / Fresher">Graduate / Fresher</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Job Role</label>
                    <input
                      id="register-target-role-input"
                      type="text"
                      value={targetJobRole}
                      onChange={e => setTargetJobRole(e.target.value)}
                      placeholder="e.g. Backend Engineer"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Daily Available Study Time</label>
                    <select
                      id="register-daily-time-select"
                      value={dailyAvailableTime}
                      onChange={e => setDailyAvailableTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Less than 30 minutes">Less than 30 minutes</option>
                      <option value="30–60 minutes">30–60 minutes</option>
                      <option value="1–2 hours">1–2 hours</option>
                      <option value="2–4 hours">2–4 hours</option>
                      <option value="More than 4 hours">More than 4 hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-register-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Continue to Onboarding Survey'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

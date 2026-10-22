import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Skill,
  AssessmentResult,
  AIInsight,
  LearningRoadmap,
  Achievement,
  AnalyticsSummary,
  AppView,
  AssessmentConfig,
  AssessmentAttempt,
  AppNotification,
  Question,
} from '../types';
import { SEED_SKILLS } from '../data/seedData';
import { SEED_ASSESSMENT_CONFIGS } from '../data/seedAssessments';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export type { AppView };

interface DataContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedSkillId: string;
  setSelectedSkillId: (id: string) => void;
  selectedTopicIds: string[];
  setSelectedTopicIds: (ids: string[]) => void;
  activeAssessmentId: string | null;
  setActiveAssessmentId: (id: string | null) => void;
  activeInsightId: string | null;
  setActiveInsightId: (id: string | null) => void;
  // Test Portal & Exam Runner
  activeTestId: string | null;
  setActiveTestId: (id: string | null) => void;
  activeTestConfig: AssessmentConfig | null;
  setActiveTestConfig: (cfg: AssessmentConfig | null) => void;
  activeAttempt: AssessmentAttempt | null;
  setActiveAttempt: (att: AssessmentAttempt | null) => void;
  activeExamQuestions: Question[];
  setActiveExamQuestions: (questions: Question[]) => void;
  testsList: AssessmentConfig[];
  refreshTestsList: () => Promise<void>;
  openTestInstructions: (testId: string) => Promise<void>;
  eligibleReattempts: import('../types').ReattemptEligibility[];
  refreshEligibleReattempts: () => Promise<void>;
  startTestReattempt: (testId: string) => Promise<void>;
  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  // Existing skills & progress
  skills: Skill[];
  isLoadingSkills: boolean;
  refreshSkills: () => Promise<void>;
  recentAssessments: AssessmentResult[];
  refreshAssessments: () => Promise<void>;
  achievements: Achievement[];
  refreshAchievements: () => Promise<void>;
  currentRoadmap: LearningRoadmap | null;
  loadRoadmap: (skillId: string) => Promise<void>;
  toggleMilestone: (skillId: string, milestoneId: string) => Promise<void>;
  latestAssessmentResult: AssessmentResult | null;
  latestAIInsight: AIInsight | null;
  userAIInsights: AIInsight[];
  isLoadingInsights: boolean;
  refreshAIInsights: () => Promise<void>;
  diagnoseSkillWithAI: (params: {
    skillId: string;
    skillName?: string;
    currentLevel?: string;
    selfConfidence?: number;
    focusTopics?: string[];
    notes?: string;
  }) => Promise<AIInsight>;
  setLatestResult: (asm: AssessmentResult, insight: AIInsight) => void;
  analytics: AnalyticsSummary | null;
  refreshAnalytics: () => Promise<void>;
  startSkillAssessment: (skillId: string, topicIds?: string[]) => void;
  viewInsight: (insightId: string) => void;
  viewSkillRoadmap: (skillId: string) => void;
  tutorInitialPrompt: string;
  setTutorInitialPrompt: (prompt: string) => void;
  xpNotification: { amount: number; reason: string; id: string } | null;
  showXpReward: (amount: number, reason: string) => void;
  clearXpReward: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded: isAuthLoaded, syncUser, rewardXp } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (!user) return 'landing';
    if (user.role === 'admin') return 'admin';
    return user.onboardingCompleted ? 'dashboard' : 'survey';
  });

  const [selectedSkillId, setSelectedSkillId] = useState<string>('python');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);

  // Examination & Portal State
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [activeTestConfig, setActiveTestConfig] = useState<AssessmentConfig | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<AssessmentAttempt | null>(null);
  const [activeExamQuestions, setActiveExamQuestions] = useState<Question[]>([]);
  const [testsList, setTestsList] = useState<AssessmentConfig[]>(SEED_ASSESSMENT_CONFIGS);
  const [eligibleReattempts, setEligibleReattempts] = useState<import('../types').ReattemptEligibility[]>([]);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const [skills, setSkills] = useState<Skill[]>(() => SEED_SKILLS);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentResult[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<LearningRoadmap | null>(null);
  const [latestAssessmentResult, setLatestAssessmentResult] = useState<AssessmentResult | null>(null);
  const [latestAIInsight, setLatestAIInsight] = useState<AIInsight | null>(null);
  const [userAIInsights, setUserAIInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string>('');
  const [xpNotification, setXpNotification] = useState<{ amount: number; reason: string; id: string } | null>(null);

  const showXpReward = (amount: number, reason: string) => {
    setXpNotification({
      amount,
      reason,
      id: `${Date.now()}-${Math.random()}`,
    });
  };

  const clearXpReward = () => {
    setXpNotification(null);
  };

  const refreshTestsList = async () => {
    try {
      const res = await api.getTests();
      if (res && res.tests) {
        setTestsList(res.tests);
      }
    } catch (e) {
      console.warn('Error fetching test configs:', e);
    }
  };

  const openTestInstructions = async (testId: string) => {
    setActiveTestId(testId);
    try {
      const res = await api.getTestById(testId);
      setActiveTestConfig(res.test);
      setCurrentView('exam-instructions');
    } catch (e) {
      // Fallback to local config
      const found = testsList.find(t => t.id === testId);
      if (found) {
        setActiveTestConfig(found);
        setCurrentView('exam-instructions');
      }
    }
  };

  const refreshEligibleReattempts = async () => {
    if (!user) {
      setEligibleReattempts([]);
      return;
    }
    try {
      const res = await api.getEligibleReattempts();
      if (res && res.eligibleReattempts) {
        setEligibleReattempts(res.eligibleReattempts);
      }
    } catch (e) {
      console.warn('Error loading eligible reattempts:', e);
    }
  };

  const startTestReattempt = async (testId: string) => {
    setActiveTestId(testId);
    try {
      const res = await api.startTestReattempt(testId);
      const cfg = testsList.find(t => t.id === testId) || (await api.getTestById(testId)).test;
      setActiveTestConfig(cfg);
      setActiveAttempt(res.attempt);
      setActiveExamQuestions(res.questions);
      setCurrentView('assessment');
    } catch (err: any) {
      console.error('Failed to launch reattempt:', err);
      throw err;
    }
  };

  const refreshNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadNotificationsCount(0);
      return;
    }
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadNotificationsCount(res.unreadCount || 0);
    } catch (e) {
      console.warn('Error loading notifications:', e);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
    } catch (e) {
      console.error('Error marking all notifications read:', e);
    }
  };

  const refreshSkills = async () => {
    setIsLoadingSkills(true);
    try {
      const res = await api.getSkills(user?.id);
      if (res && res.skills && res.skills.length > 0) {
        setSkills(res.skills);
      } else {
        setSkills(SEED_SKILLS);
      }
    } catch (e) {
      console.warn('Falling back to local curriculum catalog:', e);
      setSkills(SEED_SKILLS);
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const refreshAssessments = async () => {
    if (!user) {
      setRecentAssessments([]);
      return;
    }
    try {
      const res = await api.getAssessmentHistory(user.id);
      setRecentAssessments(res.history);
    } catch (e) {
      console.error('Error loading assessments:', e);
    }
  };

  const refreshAchievements = async () => {
    if (!user) {
      setAchievements([]);
      return;
    }
    try {
      const res = await api.getAchievements(user.id);
      setAchievements(res.achievements);
    } catch (e) {
      console.error('Error loading achievements:', e);
    }
  };

  const refreshAnalytics = async () => {
    if (!user) {
      setAnalytics(null);
      return;
    }
    try {
      const res = await api.getProgressAnalytics(user.id);
      setAnalytics(res);
    } catch (e) {
      console.error('Error loading analytics:', e);
    }
  };

  const refreshAIInsights = async () => {
    if (!user) {
      setUserAIInsights([]);
      return;
    }
    setIsLoadingInsights(true);
    try {
      const res = await api.getAIInsights();
      if (res && res.insights && res.insights.length > 0) {
        setUserAIInsights(res.insights);
        // Default to most recent insight if not selected
        if (!activeInsightId || !latestAIInsight) {
          setLatestAIInsight(res.insights[0]);
          setActiveInsightId(res.insights[0].id);
        }
      }
    } catch (e) {
      console.warn('Error loading AI insights:', e);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const diagnoseSkillWithAI = async (params: {
    skillId: string;
    skillName?: string;
    currentLevel?: string;
    selfConfidence?: number;
    focusTopics?: string[];
    notes?: string;
  }): Promise<AIInsight> => {
    setIsLoadingInsights(true);
    try {
      const res = await api.diagnoseSkillWithAI(params);
      if (res.insight) {
        setLatestAIInsight(res.insight);
        setActiveInsightId(res.insight.id);
        setUserAIInsights(prev => [res.insight, ...prev.filter(i => i.id !== res.insight.id)]);
        if (res.xpGained) {
          showXpReward(res.xpGained, `AI Skill Diagnostic Completed (+${res.xpGained} XP)`);
          await rewardXp(res.xpGained);
        }
        refreshAchievements();
        return res.insight;
      }
      throw new Error('No insight returned from AI synthesis');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const loadRoadmap = async (skillId: string) => {
    if (!user) {
      setCurrentRoadmap(null);
      return;
    }
    try {
      const res = await api.getRoadmap(skillId, user.id);
      setCurrentRoadmap(res.roadmap || null);
    } catch (e) {
      console.error('Error loading roadmap:', e);
    }
  };

  const toggleMilestone = async (skillId: string, milestoneId: string) => {
    if (!user) return;
    try {
      const res = await api.toggleMilestone(skillId, milestoneId, user.id);
      if (res.roadmap) {
        setCurrentRoadmap(res.roadmap);
        if (res.user) {
          syncUser(res.user);
        } else if (res.xpGained) {
          await rewardXp(res.xpGained);
        }

        const milestone = res.roadmap.milestones.find(m => m.id === milestoneId);
        if (milestone?.completed) {
          showXpReward(100, `Completed Milestone: ${milestone.title}`);
        }

        refreshAchievements();
        refreshAnalytics();
      }
    } catch (e) {
      console.error('Error toggling milestone:', e);
    }
  };

  const setLatestResult = (asm: AssessmentResult, insight: AIInsight) => {
    setLatestAssessmentResult(asm);
    setLatestAIInsight(insight);
    setActiveAssessmentId(asm.id);
    setActiveInsightId(insight.id);
  };

  const startSkillAssessment = (skillId: string, topicIds?: string[]) => {
    setSelectedSkillId(skillId);
    setSelectedTopicIds(topicIds || []);
    setCurrentView(user ? 'assessment-setup' : 'auth');
  };

  const viewInsight = (insightId: string) => {
    setActiveInsightId(insightId);
    setCurrentView('ai-insights');
  };

  const viewSkillRoadmap = (skillId: string) => {
    setSelectedSkillId(skillId);
    loadRoadmap(skillId);
    setCurrentView('roadmap');
  };

  useEffect(() => {
    refreshTestsList();
    if (!isAuthLoaded) return;
    refreshSkills();
    if (user) {
      refreshAssessments();
      refreshEligibleReattempts();
      refreshAIInsights();
      refreshAchievements();
      refreshAnalytics();
      refreshNotifications();
      loadRoadmap(selectedSkillId);
    }
  }, [user, isAuthLoaded]);

  return (
    <DataContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedSkillId,
        setSelectedSkillId,
        selectedTopicIds,
        setSelectedTopicIds,
        activeAssessmentId,
        setActiveAssessmentId,
        activeInsightId,
        setActiveInsightId,
        activeTestId,
        setActiveTestId,
        activeTestConfig,
        setActiveTestConfig,
        activeAttempt,
        setActiveAttempt,
        activeExamQuestions,
        setActiveExamQuestions,
        testsList,
        refreshTestsList,
        openTestInstructions,
        eligibleReattempts,
        refreshEligibleReattempts,
        startTestReattempt,
        notifications,
        unreadNotificationsCount,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        skills,
        isLoadingSkills,
        refreshSkills,
        recentAssessments,
        refreshAssessments,
        achievements,
        refreshAchievements,
        currentRoadmap,
        loadRoadmap,
        toggleMilestone,
        latestAssessmentResult,
        latestAIInsight,
        userAIInsights,
        isLoadingInsights,
        refreshAIInsights,
        diagnoseSkillWithAI,
        setLatestResult,
        analytics,
        refreshAnalytics,
        startSkillAssessment,
        viewInsight,
        viewSkillRoadmap,
        tutorInitialPrompt,
        setTutorInitialPrompt,
        xpNotification,
        showXpReward,
        clearXpReward,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

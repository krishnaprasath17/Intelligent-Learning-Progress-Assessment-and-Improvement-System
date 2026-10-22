import {
  UserProfile,
  Skill,
  Topic,
  Question,
  AssessmentResult,
  AIInsight,
  LearningRoadmap,
  Achievement,
  AnalyticsSummary,
  AssessmentConfig,
  AssessmentAttempt,
  AppNotification,
  AdminAuditLog,
  AccessControlEntry,
} from '../types';

async function fetchJSON<T>(url: string, options?: RequestInit, timeoutMs = 45000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const authToken = localStorage.getItem('ilp_auth_token');
    const res = await fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn(`API request timed out on ${url}`);
      throw new Error(`Request timed out on ${url}`);
    }
    console.error(`API request error on ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Auth & Profile
  async login(email: string): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJSON('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async register(data: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJSON('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(userId?: string): Promise<{ user: UserProfile }> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJSON(`/api/auth/me${query}`);
  },

  async submitSurvey(data: {
    userId: string;
    experienceLevel: string;
    programmingExposure: string[];
    careerGoal: string;
    dailyAvailableTime: string;
    skillConfidence: Record<string, number>;
  }): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJSON('/api/auth/survey', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJSON('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ userId, updates }),
    });
  },

  // Skills
  async getSkills(userId?: string): Promise<{ skills: Skill[] }> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJSON(`/api/skills${query}`);
  },

  async getTopics(skillId: string): Promise<{ topics: Topic[] }> {
    return fetchJSON(`/api/skills/${skillId}/topics`);
  },

  // Assessment
  async startAssessment(skillId: string, topicIds?: string[], questionCount?: number): Promise<{
    skillId: string;
    totalQuestions: number;
    questions: Question[];
  }> {
    return fetchJSON('/api/assessment/start', {
      method: 'POST',
      body: JSON.stringify({ skillId, topicIds, questionCount }),
    });
  },

  async submitAssessment(data: {
    userId: string;
    skillId: string;
    responses: { questionId: string; selectedOptionId: string; responseTimeSeconds: number }[];
    durationSeconds: number;
  }): Promise<{ assessment: AssessmentResult; insight: AIInsight; roadmap: LearningRoadmap; user?: UserProfile; xpGained?: number }> {
    const payload = {
      ...data,
      userId: data.userId || 'guest-learner-1',
    };
    return fetchJSON('/api/assessment/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAssessmentResult(id: string): Promise<{ assessment: AssessmentResult; insight: AIInsight | null }> {
    return fetchJSON(`/api/assessment/${id}/result`);
  },

  async getAssessmentHistory(userId?: string): Promise<{ history: AssessmentResult[] }> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJSON(`/api/assessment/history${query}`);
  },

  // AI Insights & Roadmaps
  async getAIInsights(): Promise<{ insights: AIInsight[] }> {
    return fetchJSON('/api/ai/insights');
  },

  async getAIInsight(id: string): Promise<{ insight: AIInsight }> {
    return fetchJSON(`/api/ai/insight/${id}`);
  },

  async diagnoseSkillWithAI(data: {
    skillId: string;
    skillName?: string;
    currentLevel?: string;
    selfConfidence?: number;
    focusTopics?: string[];
    notes?: string;
  }): Promise<{ insight: AIInsight; xpGained: number }> {
    return fetchJSON('/api/ai/diagnose-skill', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getGapDeepDive(data: {
    skillName: string;
    topicOrGap: string;
    type: 'gap' | 'misconception' | 'priorityTopic';
  }): Promise<{
    deepDive: {
      title: string;
      executiveSummary: string;
      rootCauseAnalysis: string;
      antipatternCode: string;
      correctedCode: string;
      bestPractices: string[];
      selfCheckQuestion: {
        question: string;
        options: string[];
        correctIndex: number;
        explanation: string;
      };
    };
  }> {
    return fetchJSON('/api/ai/deep-dive', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getRoadmap(skillId: string, userId?: string): Promise<{ roadmap: LearningRoadmap | null }> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJSON(`/api/roadmap/${skillId}${query}`);
  },

  async toggleMilestone(skillId: string, milestoneId: string, userId?: string): Promise<{ success: boolean; roadmap: LearningRoadmap; user?: UserProfile; xpGained?: number }> {
    return fetchJSON(`/api/roadmap/${skillId}/toggle-milestone`, {
      method: 'POST',
      body: JSON.stringify({ milestoneId, userId }),
    });
  },

  async regenerateRoadmap(data: {
    userId: string;
    skillId: string;
    skillName: string;
    currentLevel: string;
    weakTopics: string[];
    strongTopics: string[];
  }): Promise<{ roadmap: LearningRoadmap }> {
    return fetchJSON('/api/ai/roadmap', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // AI Question Generation
  async generateQuestion(data: {
    skillName: string;
    topicName: string;
    targetDifficulty: string;
    questionType?: string;
  }): Promise<{ question: Question }> {
    return fetchJSON('/api/ai/generate-question', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // AI Tutor
  async askTutor(data: {
    message: string;
    chatHistory?: { role: 'user' | 'model'; text: string }[];
    userContext?: any;
  }): Promise<{ reply: string }> {
    return fetchJSON('/api/ai/tutor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Achievements & Analytics
  async getAchievements(userId?: string): Promise<{ achievements: Achievement[] }> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJSON(`/api/achievements${query}`);
  },

  async getProgressAnalytics(userId?: string): Promise<AnalyticsSummary> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJSON(`/api/progress${query}`);
  },

  // Admin
  async getDatabaseStatus(): Promise<{
    status: 'ok' | 'degraded';
    storage: {
      isServerless: boolean;
      isPersistent: boolean;
      isFirestoreActive: boolean;
      pendingFirestoreWrites: number;
      lastFirestoreWriteError: string | null;
      firestoreLoadErrors: string[];
    };
    firestore: {
      isAvailable: boolean;
      hasAdminCredentials: boolean;
      projectId: string;
      firestoreDatabaseId: string;
    };
    persistenceHealth: {
      isPersistent: boolean;
      mode: string;
      recommendation: string;
    };
  }> {
    return fetchJSON('/api/system/db-status');
  },

  async getAdminStats(): Promise<any> {
    return fetchJSON('/api/admin/stats');
  },

  async getAdminUsers(): Promise<{ users: UserProfile[] }> {
    return fetchJSON('/api/admin/users');
  },

  async getAdminQuestions(skillId?: string): Promise<{ questions: Question[] }> {
    const query = skillId ? `?skillId=${encodeURIComponent(skillId)}` : '';
    return fetchJSON(`/api/admin/questions${query}`);
  },

  async addAdminQuestion(question: Partial<Question>): Promise<{ success: boolean; question: Question }> {
    return fetchJSON('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
  },

  async toggleFlagQuestion(questionId: string, flagged: boolean): Promise<{ success: boolean }> {
    return fetchJSON(`/api/admin/questions/${questionId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ flagged }),
    });
  },

  // Tests Portal & Student Exam Engine
  async getTests(params?: { category?: string; status?: string; search?: string }): Promise<{ tests: (AssessmentConfig & { attemptStatus?: string; userAttemptCount?: number; lastScore?: number })[] }> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJSON(`/api/tests${query}`);
  },

  async getTestById(id: string): Promise<{ test: AssessmentConfig; userAttempts: AssessmentAttempt[] }> {
    return fetchJSON(`/api/tests/${id}`);
  },

  async startTestAttempt(assessmentId: string): Promise<{
    attempt: AssessmentAttempt;
    questions: Question[];
    isResumed: boolean;
    serverTime: string;
  }> {
    return fetchJSON(`/api/tests/${assessmentId}/start`, {
      method: 'POST',
    });
  },

  async startTestReattempt(assessmentId: string): Promise<{
    attempt: AssessmentAttempt;
    questions: Question[];
    isResumed: boolean;
    serverTime: string;
  }> {
    return fetchJSON(`/api/tests/${assessmentId}/reattempt`, {
      method: 'POST',
    });
  },

  async getEligibleReattempts(): Promise<{
    eligibleReattempts: import('../types').ReattemptEligibility[];
  }> {
    return fetchJSON('/api/tests/reattempts/eligible');
  },

  async recordViolation(
    attemptId: string,
    data: { type: string; details: string }
  ): Promise<{
    violationCount: number;
    warningNumber: number;
    maxAllowed: number;
    isTerminated: boolean;
    attempt: AssessmentAttempt;
  }> {
    return fetchJSON(`/api/tests/attempt/${attemptId}/violation`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSebConfigUrl(assessmentId: string): string {
    return `/api/tests/${assessmentId}/seb-config`;
  },

  async getAdminViolations(): Promise<{
    violations: import('../types').ViolationEvent[];
    terminatedAttempts: AssessmentAttempt[];
  }> {
    return fetchJSON('/api/admin/violations');
  },

  async resetAttemptViolations(
    attemptId: string,
    reason?: string
  ): Promise<{ success: boolean; attempt: AssessmentAttempt }> {
    return fetchJSON(`/api/admin/attempts/${attemptId}/reset-violations`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async autosaveAttempt(
    attemptId: string,
    data: {
      answers?: Record<string, string>;
      flagged?: Record<string, boolean>;
      codeSubmissions?: Record<string, { code: string; language: string }>;
      timeSpentSeconds?: number;
    }
  ): Promise<{ success: boolean; isExpired: boolean }> {
    return fetchJSON(`/api/tests/attempt/${attemptId}/autosave`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitTestAttempt(
    attemptId: string,
    data: {
      answers: Record<string, string>;
      durationSeconds: number;
      codeSubmissions?: Record<string, { code: string; language: string }>;
    }
  ): Promise<{
    attempt: AssessmentAttempt;
    assessmentResult: AssessmentResult;
    aiInsight?: AIInsight;
    xpRewarded: number;
    user: UserProfile;
  }> {
    return fetchJSON(`/api/tests/attempt/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getTestAttempt(attemptId: string): Promise<{
    attempt: AssessmentAttempt;
    config: AssessmentConfig;
    assessmentResult?: AssessmentResult;
    insight?: AIInsight;
  }> {
    return fetchJSON(`/api/tests/attempt/${attemptId}`);
  },

  async runCodingTest(data: {
    questionId: string;
    language: string;
    code: string;
  }): Promise<{
    success: boolean;
    passedTestCases: number;
    totalTestCases: number;
    runtimeMs: number;
    testResults: any[];
    feedback?: string;
    errorMessage?: string;
  }> {
    return fetchJSON('/api/tests/coding/run', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    return fetchJSON('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return fetchJSON(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return fetchJSON('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  // Admin Assessment Management
  async getAdminAssessments(): Promise<{ assessments: AssessmentConfig[] }> {
    return fetchJSON('/api/admin/assessments');
  },

  async createAdminAssessment(data: Partial<AssessmentConfig>): Promise<{ success: boolean; assessment: AssessmentConfig }> {
    return fetchJSON('/api/admin/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAdminAssessment(id: string, data: Partial<AssessmentConfig>): Promise<{ success: boolean; assessment: AssessmentConfig }> {
    return fetchJSON(`/api/admin/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async duplicateAdminAssessment(id: string): Promise<{ success: boolean; assessment: AssessmentConfig }> {
    return fetchJSON(`/api/admin/assessments/${id}/duplicate`, {
      method: 'POST',
    });
  },

  async archiveAdminAssessment(id: string): Promise<{ success: boolean }> {
    return fetchJSON(`/api/admin/assessments/${id}`, {
      method: 'DELETE',
    });
  },

  async importAdminQuestions(questions: any[], format = 'JSON'): Promise<{ success: boolean; importedCount: number; errors: string[] }> {
    return fetchJSON('/api/admin/questions/import', {
      method: 'POST',
      body: JSON.stringify({ questions, format }),
    });
  },

  async getAdminAttempts(assessmentId?: string): Promise<{ attempts: AssessmentAttempt[] }> {
    const query = assessmentId ? `?assessmentId=${encodeURIComponent(assessmentId)}` : '';
    return fetchJSON(`/api/admin/attempts${query}`);
  },

  async getAdminAuditLogs(): Promise<{ logs: AdminAuditLog[] }> {
    return fetchJSON('/api/admin/audit-logs');
  },

  // Access Control Client Methods
  async checkAccess(email?: string): Promise<{
    authenticated: boolean;
    approved: boolean;
    role: 'admin' | 'user';
    email: string | null;
    approvedAt?: string | null;
    notes?: string;
    message: string;
  }> {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    return fetchJSON(`/api/auth/check-access${q}`);
  },

  async verifyEmailAccess(email: string): Promise<{
    email: string;
    approved: boolean;
    role: 'admin' | 'user';
    notes?: string;
  }> {
    return fetchJSON('/api/auth/verify-email-access', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async loginWithEmail(email: string, rolePreference?: 'student' | 'admin'): Promise<{
    success: boolean;
    token: string;
    user: UserProfile;
    role: 'admin' | 'student';
    accessControl: AccessControlEntry;
  }> {
    return fetchJSON('/api/auth/email-login', {
      method: 'POST',
      body: JSON.stringify({ email, rolePreference }),
    });
  },

  async adminCreateUser(data: {
    name: string;
    email: string;
    role?: 'admin' | 'student';
    department?: string;
    college?: string;
    yearOfStudy?: string;
  }): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJSON('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminUpdateUser(
    id: string,
    updates: Partial<UserProfile> & { approveNow?: boolean }
  ): Promise<{ success: boolean; user: UserProfile }> {
    return fetchJSON(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async adminApproveUserEmail(id: string): Promise<{
    success: boolean;
    entry: AccessControlEntry;
    user: UserProfile;
  }> {
    return fetchJSON(`/api/admin/users/${encodeURIComponent(id)}/approve-email`, {
      method: 'POST',
    });
  },

  async getAccessControlList(): Promise<{ accessList: AccessControlEntry[] }> {
    return fetchJSON('/api/admin/access-control');
  },

  async approveEmail(data: { email: string; role?: 'admin' | 'user'; notes?: string }): Promise<{
    success: boolean;
    entry: AccessControlEntry;
  }> {
    return fetchJSON('/api/admin/access-control/approve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async revokeEmail(email: string): Promise<{ success: boolean }> {
    return fetchJSON('/api/admin/access-control/revoke', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async deleteAccessEntry(email: string): Promise<{ success: boolean }> {
    return fetchJSON(`/api/admin/access-control/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  },
};

export type SkillLevel = 'Beginner' | 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';

export type QuestionType = 'MCQ' | 'CodeOutput' | 'Debugging' | 'Conceptual' | 'Coding' | 'Scenario';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface UserProfile {
  id: string;
  firebaseUid?: string;
  authProvider?: 'google' | 'firebase' | 'email' | 'custom';
  name: string;
  email: string;
  avatar?: string;
  college: string;
  educationLevel: string; // e.g., "B.Tech / B.E.", "BCA / MCA", "B.Sc CS", "Self-Taught"
  department: string; // e.g., "Computer Science", "Information Technology", "AI & DS", "ECE"
  yearOfStudy: string; // e.g., "1st Year", "2nd Year", "3rd Year", "Final Year", "Graduate"
  experienceLevel: SkillLevel;
  targetJobRole: string; // e.g., "Full Stack Developer", "Data Scientist", "Software Engineer", "Backend Specialist"
  preferredLearningStyle: string; // e.g., "Hands-on projects", "Video & Code walkthroughs", "Conceptual & Problem Solving"
  dailyAvailableTime: string; // e.g., "1–2 hours", "30–60 minutes", "2–4 hours"
  careerGoal: string; // e.g., "Placement preparation", "Coding interviews", "Software development", "AI/ML"
  skillConfidence: Record<string, number>; // skillId -> 1 to 5 confidence
  onboardingCompleted: boolean;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  role: 'student' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Topic {
  id: string;
  skillId: string;
  name: string;
  difficulty: SkillLevel;
  description: string;
  order: number;
  proficiencyScore?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Programming' | 'Web Development' | 'Databases' | 'Core CS';
  description: string;
  iconName: string;
  topics: Topic[];
  totalQuestionsCount?: number;
  currentLevel?: SkillLevel;
  lastScore?: number;
  progressPercentage?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  skillId: string;
  topicId: string;
  topicName: string;
  question: string;
  questionType: QuestionType;
  difficulty: SkillLevel;
  codeSnippet?: string;
  language?: string;
  options: QuestionOption[];
  correctAnswerId: string; // matches QuestionOption.id
  explanation: string;
  scenarioContext?: string;
  hints?: string[];
  isAiGenerated?: boolean;
  isFlagged?: boolean;
  marks?: number;
  negativeMarks?: number;
  codingDetails?: CodingChallengeDetails;
}

export interface UserResponse {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  responseTimeSeconds: number;
  topicId: string;
  topicName: string;
  difficulty: SkillLevel;
  questionText?: string;
  codeSnippet?: string;
  options?: QuestionOption[];
  selectedOptionText?: string;
  correctAnswerId?: string;
  correctOptionText?: string;
  explanation?: string;
}

export interface TopicScore {
  topicId: string;
  topicName: string;
  totalQuestions: number;
  correctQuestions: number;
  percentage: number;
}

export interface DifficultyScore {
  difficulty: SkillLevel;
  totalQuestions: number;
  correctQuestions: number;
  percentage: number;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  score: number; // 0 - 100
  accuracy: number; // 0 - 100
  totalQuestions: number;
  correctQuestions: number;
  classifiedLevel: SkillLevel;
  durationSeconds: number;
  completedAt: string;
  topicScores: TopicScore[];
  difficultyScores: DifficultyScore[];
  strongTopics: string[];
  weakTopics: string[];
  responses: UserResponse[];
  aiInsightId?: string;
}

export interface PriorityTopic {
  topic: string;
  priority: PriorityLevel;
  reason: string;
}

export interface AIInsight {
  id: string;
  assessmentId: string;
  userId: string;
  skillName: string;
  classifiedLevel: SkillLevel;
  overallScore: number;
  confidenceVsActualAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  knowledgeGaps: string[];
  misconceptions: string[];
  priorityTopics: PriorityTopic[];
  keyObservation: string;
  recommendedNextStep: string;
  generatedAt: string;
}

export interface RoadmapMilestone {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
  learningResources: {
    title: string;
    type: 'Guide' | 'Practice' | 'Video' | 'Documentation';
    duration: string;
  }[];
  practiceExercise: {
    title: string;
    task: string;
    difficulty: SkillLevel;
  };
  miniProject: {
    title: string;
    description: string;
  };
  completed: boolean;
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  estimatedWeeks: number;
  totalMilestones: number;
  completedMilestones: number;
  milestones: RoadmapMilestone[];
  generatedAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'Assessment' | 'Streak' | 'Mastery' | 'AI Tutor' | 'Speed';
  xpReward: number;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  contextSnippet?: string;
  suggestedPrompts?: string[];
}

export interface AnalyticsSummary {
  totalAssessments: number;
  averageScore: number;
  averageAccuracy?: number;
  skillsAssessed?: number;
  studyHoursLogged?: number;
  overallGrowthPercentage: number;
  totalXp: number;
  xpEarned?: number;
  streakDays: number;
  skillsMasteredCount: number;
  skillProgressList: {
    skillId: string;
    skillName: string;
    level: SkillLevel;
    score: number;
    delta: number;
    assessmentCount: number;
  }[];
  assessmentTimeline: {
    date: string;
    score: number;
    skillName: string;
  }[];
  topicProficiency: {
    topicName: string;
    skillName: string;
    score: number;
    status: 'Mastered' | 'Developing' | 'Needs Attention';
  }[];
  difficultyDistribution?: Record<string, number>;
  topStrengths?: string[];
  priorityWeaknesses?: string[];
  skillGrowthTrend?: { date: string; score: number; skill: string }[];
}

export type TestCategory = 'Academic' | 'Technical' | 'Placement';

export type TestStatus = 'published' | 'upcoming' | 'archived' | 'draft';

export interface CodingTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface CodingChallengeDetails {
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleTestCases: CodingTestCase[];
  hiddenTestCases: CodingTestCase[];
  starterCode: {
    python?: string;
    javascript?: string;
    java?: string;
    cpp?: string;
  };
}

export interface AssessmentConfig {
  id: string;
  title: string;
  description: string;
  category: TestCategory;
  domain: string; // e.g. "Python", "Data Structures", "Quantitative Aptitude", "DBMS", "Operating Systems"
  difficulty: SkillLevel;
  durationMinutes: number;
  questionCount: number;
  maxMarks: number;
  negativeMarking: number; // e.g. 0.25 or 0
  maxAttempts: number;
  passPercentage: number;
  status: TestStatus;
  instructions: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  allowReview: boolean;
  isCodingSupported?: boolean;
  questionIds?: string[];
  scheduleStart?: string;
  scheduleEnd?: string;
  cooldownMinutes?: number; // e.g. 15 or 30 mins before reattempt
  requireSeb?: boolean; // Safe Exam Browser lockdown required
  sebQuitPassword?: string;
  sebBrowserExamKey?: string;
  autoSubmitOnViolationLimit?: boolean;
  maxViolationsAllowed?: number; // default 2
}

export interface ViolationEvent {
  id: string;
  attemptId: string;
  userId: string;
  assessmentId: string;
  type: 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'keyboard_shortcut' | 'window_exit' | 'other';
  details: string;
  timestamp: string;
  warningNumber: number;
}

export interface ReattemptEligibility {
  assessmentId: string;
  assessmentTitle: string;
  category: TestCategory;
  domain: string;
  difficulty: SkillLevel;
  durationMinutes: number;
  lastScore: number;
  passPercentage: number;
  maxAttempts: number;
  attemptCount: number;
  remainingAttempts: number;
  isEligible: boolean;
  inCooldown: boolean;
  cooldownRemainingMinutes: number;
  lastAttemptStatus: 'submitted' | 'evaluated' | 'expired' | 'terminated_due_to_violations';
  lastTerminationReason?: string;
  lastAttemptId: string;
  lastSubmittedAt?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  category: TestCategory;
  domain: string;
  userId: string;
  userEmail: string;
  userName: string;
  startedAt: string;
  serverDeadline: string; // ISO string, server-authoritative
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'evaluated' | 'expired' | 'terminated_due_to_violations';
  attemptNumber: number; // 1-indexed attempt count
  violationCount: number;
  violationHistory?: ViolationEvent[];
  terminationReason?: string;
  isPassed?: boolean;
  passPercentage?: number;
  cooldownUntil?: string;
  sebVerified?: boolean;
  answers: Record<string, string>; // questionId -> answerOptionId or code string
  codeSubmissions?: Record<string, { code: string; language: string; passedCases?: number; totalCases?: number }>;
  flagged: Record<string, boolean>;
  score?: number; // 0 - 100
  totalMarksObtained?: number;
  maxMarks?: number;
  accuracy?: number;
  correctCount?: number;
  incorrectCount?: number;
  unansweredCount?: number;
  timeSpentSeconds: number;
  xpRewarded?: number;
  xpTxId?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'assessment' | 'roadmap' | 'achievement' | 'level_up' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkView?: AppView;
  linkParam?: string;
}

export interface AccessControlEntry {
  email: string;
  approved: boolean;
  role: 'admin' | 'user';
  approvedAt: string;
  approvedBy: string;
  notes?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export type AppView =
  | 'landing'
  | 'login'
  | 'register'
  | 'auth'
  | 'access-denied'
  | 'survey'
  | 'onboarding'
  | 'dashboard'
  | 'tests'
  | 'reattempts'
  | 'reattempt-tests'
  | 'skills'
  | 'skill-detail'
  | 'assessment-setup'
  | 'assessment'
  | 'exam-instructions'
  | 'assessment-result'
  | 'coding-lab'
  | 'ai-insights'
  | 'roadmap'
  | 'learning-roadmap'
  | 'progress'
  | 'progress-analytics'
  | 'ai-tutor'
  | 'achievements'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'admin-dashboard';

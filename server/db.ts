import {
  Skill,
  Question,
  Achievement,
  UserProfile,
  AssessmentResult,
  AIInsight,
  LearningRoadmap,
  SkillLevel,
  AssessmentConfig,
  AssessmentAttempt,
  AppNotification,
  AdminAuditLog,
  ViolationEvent,
  ReattemptEligibility,
} from '../src/types';
import {
  SEED_SKILLS,
  SEED_QUESTIONS,
  SEED_ACHIEVEMENTS,
} from '../src/data/seedData';
import {
  SEED_ASSESSMENT_CONFIGS,
  SEED_TEST_QUESTIONS,
} from '../src/data/seedAssessments';
import { analyzeAssessmentWithAI, generateRoadmapWithAI } from './geminiService';
import { executeSandboxedCode } from './sandboxRunner';
import { firestore } from './firebaseAuth';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);

function resolveSafeDataFile(): string {
  if (process.env.APP_DATA_FILE) {
    return path.resolve(process.env.APP_DATA_FILE);
  }
  if (IS_SERVERLESS) {
    return path.resolve(os.tmpdir(), 'application-data.json');
  }
  const localDefault = path.resolve(process.cwd(), 'data', 'application-data.json');
  try {
    fs.mkdirSync(path.dirname(localDefault), { recursive: true });
    return localDefault;
  } catch {
    return path.resolve(os.tmpdir(), 'application-data.json');
  }
}

const DATA_FILE = resolveSafeDataFile();

class InMemoryDB {
  ready: Promise<void>;
  users: Map<string, UserProfile> = new Map();
  skills: Map<string, Skill> = new Map();
  questions: Map<string, Question> = new Map();
  assessments: Map<string, AssessmentResult> = new Map();
  aiInsights: Map<string, AIInsight> = new Map();
  roadmaps: Map<string, LearningRoadmap> = new Map();
  achievements: Map<string, Achievement> = new Map();
  assessmentConfigs: Map<string, AssessmentConfig> = new Map();
  assessmentAttempts: Map<string, AssessmentAttempt> = new Map();
  notifications: Map<string, AppNotification[]> = new Map(); // userId -> list
  auditLogs: AdminAuditLog[] = [];
  xpTransactions: Set<string> = new Set();

  constructor() {
    this.seed();
    this.load();
    this.ready = this.loadFromFirestore();
  }

  seed() {
    for (const s of SEED_SKILLS) {
      this.skills.set(s.id, { ...s });
    }

    for (const q of SEED_QUESTIONS) {
      this.questions.set(q.id, { ...q });
    }

    for (const a of SEED_ACHIEVEMENTS) {
      this.achievements.set(a.id, { ...a, earned: false, earnedAt: undefined, progress: 0 });
    }

    for (const c of SEED_ASSESSMENT_CONFIGS) {
      this.assessmentConfigs.set(c.id, { ...c });
    }

    for (const [_tId, qList] of Object.entries(SEED_TEST_QUESTIONS)) {
      for (const q of qList) {
        this.questions.set(q.id, { ...q });
      }
    }
  }

  private load() {
    if (!fs.existsSync(DATA_FILE)) return;
    try {
      const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      for (const [id, value] of saved.users || []) this.users.set(id, value);
      for (const [id, value] of saved.assessments || []) this.assessments.set(id, value);
      for (const [id, value] of saved.aiInsights || []) this.aiInsights.set(id, value);
      for (const [id, value] of saved.roadmaps || []) this.roadmaps.set(id, value);
      for (const [id, value] of saved.assessmentConfigs || []) this.assessmentConfigs.set(id, value);
      for (const [id, value] of saved.assessmentAttempts || []) this.assessmentAttempts.set(id, value);
      for (const [id, value] of saved.notifications || []) this.notifications.set(id, value);
      if (Array.isArray(saved.auditLogs)) this.auditLogs = saved.auditLogs;
      if (Array.isArray(saved.xpTransactions)) this.xpTransactions = new Set(saved.xpTransactions);
    } catch (error) {
      console.warn('Unable to load persisted application data.', error);
    }
  }

  private persist() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify({
        users: Array.from(this.users.entries()),
        assessments: Array.from(this.assessments.entries()),
        aiInsights: Array.from(this.aiInsights.entries()),
        roadmaps: Array.from(this.roadmaps.entries()),
        assessmentConfigs: Array.from(this.assessmentConfigs.entries()),
        assessmentAttempts: Array.from(this.assessmentAttempts.entries()),
        notifications: Array.from(this.notifications.entries()),
        auditLogs: this.auditLogs.slice(-200),
        xpTransactions: Array.from(this.xpTransactions),
      }, null, 2));
    } catch (err) {
      console.warn('Local database persist note:', (err as any)?.message || err);
    }
  }

  private async persistToFirestore(collection: string, id: string, value: unknown) {
    if (!firestore) return;
    try {
      await firestore.collection(collection).doc(id).set(value, { merge: true });
    } catch (err) {
      console.warn(`Firestore save to ${collection}/${id} skipped:`, err);
    }
  }

  private async loadFromFirestore() {
    if (!firestore) return;
    try {
      const [users, assessments, insights, roadmaps, attempts, configs, notifs, auditLogs] = await Promise.all([
        firestore.collection('users').get().catch(() => null),
        firestore.collection('assessments').get().catch(() => null),
        firestore.collection('insights').get().catch(() => null),
        firestore.collection('roadmaps').get().catch(() => null),
        firestore.collection('attempts').get().catch(() => null),
        firestore.collection('assessment_configs').get().catch(() => null),
        firestore.collection('notifications').get().catch(() => null),
        firestore.collection('audit_logs').limit(200).get().catch(() => null),
      ]);
      if (users) users.forEach(snapshot => this.users.set(snapshot.id, snapshot.data() as UserProfile));
      if (assessments) assessments.forEach(snapshot => this.assessments.set(snapshot.id, snapshot.data() as AssessmentResult));
      if (insights) insights.forEach(snapshot => this.aiInsights.set(snapshot.id, snapshot.data() as AIInsight));
      if (roadmaps) roadmaps.forEach(snapshot => this.roadmaps.set(snapshot.id, snapshot.data() as LearningRoadmap));
      if (attempts) attempts.forEach(snapshot => this.assessmentAttempts.set(snapshot.id, snapshot.data() as AssessmentAttempt));
      if (configs) configs.forEach(snapshot => this.assessmentConfigs.set(snapshot.id, snapshot.data() as AssessmentConfig));
      if (notifs) {
        notifs.forEach(snapshot => {
          const item = snapshot.data() as AppNotification;
          if (item?.userId) {
            const list = this.notifications.get(item.userId) || [];
            if (!list.some(n => n.id === item.id)) {
              list.push(item);
              this.notifications.set(item.userId, list);
            }
          }
        });
      }
      if (auditLogs) {
        const loadedLogs = auditLogs.docs.map(doc => doc.data() as AdminAuditLog);
        if (loadedLogs.length > 0) {
          this.auditLogs = loadedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
      }
    } catch (error) {
      console.warn('Firestore load skipped, relying on local state.', error);
    }
  }

  public getStorageDiagnostic() {
    return {
      isServerless: IS_SERVERLESS,
      dataFile: DATA_FILE,
      isFirestoreActive: Boolean(firestore),
      counts: {
        users: this.users.size,
        skills: this.skills.size,
        questions: this.questions.size,
        assessments: this.assessments.size,
        attempts: this.assessmentAttempts.size,
        configs: this.assessmentConfigs.size,
        notifications: Array.from(this.notifications.values()).reduce((sum, list) => sum + list.length, 0),
        auditLogs: this.auditLogs.length,
      },
    };
  }

  // --- USER METHODS ---
  getUserById(id: string): UserProfile | undefined {
    return this.users.get(id) || Array.from(this.users.values()).find(u => u.firebaseUid === id);
  }

  getUserByFirebaseUid(firebaseUid: string): UserProfile | undefined {
    return Array.from(this.users.values()).find(u => u.firebaseUid === firebaseUid) || this.users.get(firebaseUid);
  }

  getUserByEmail(email: string): UserProfile | undefined {
    return Array.from(this.users.values()).find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  createUser(profile: Partial<UserProfile>): UserProfile {
    const id = profile.firebaseUid || profile.id || `user-${Date.now()}`;
    const newUser: UserProfile = {
      id,
      firebaseUid: profile.firebaseUid || `fb_${id}`,
      name: profile.name || 'Learner',
      email: profile.email || `${id}@example.com`,
      college: profile.college || '',
      educationLevel: profile.educationLevel || '',
      department: profile.department || '',
      yearOfStudy: profile.yearOfStudy || '',
      experienceLevel: profile.experienceLevel || '' as any,
      targetJobRole: profile.targetJobRole || '',
      preferredLearningStyle: profile.preferredLearningStyle || '',
      dailyAvailableTime: profile.dailyAvailableTime || '',
      careerGoal: profile.careerGoal || '',
      skillConfidence: profile.skillConfidence || {},
      onboardingCompleted: profile.onboardingCompleted ?? false,
      xp: profile.xp || 0,
      streakDays: profile.streakDays || 0,
      lastActiveDate: profile.lastActiveDate || '',
      role: profile.role || 'student',
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    this.persistToFirestore('users', newUser.firebaseUid || newUser.id, newUser);
    this.persist();
    return newUser;
  }

  upsertUserFromFirebase(profile: Partial<UserProfile>): UserProfile {
    const firebaseUid = profile.firebaseUid || profile.id;
    if (!firebaseUid) {
      return this.createUser(profile);
    }

    const existing = this.getUserByFirebaseUid(firebaseUid);
    if (existing) {
      const updated = { ...existing, ...profile, firebaseUid, id: existing.id || firebaseUid, lastLoginAt: new Date().toISOString() };
      this.users.set(existing.id, updated);
      this.persistToFirestore('users', firebaseUid, updated);
      this.persist();
      return updated;
    }

    return this.createUser({ ...profile, firebaseUid, id: firebaseUid, lastLoginAt: new Date().toISOString() });
  }

  updateUser(idOrEmail: string, updates: Partial<UserProfile>): UserProfile | null {
    let existingKey = this.users.has(idOrEmail) ? idOrEmail : null;
    if (!existingKey) {
      for (const [key, u] of this.users.entries()) {
        if (
          u.id === idOrEmail ||
          u.firebaseUid === idOrEmail ||
          (u.email && u.email.toLowerCase() === idOrEmail.toLowerCase())
        ) {
          existingKey = key;
          break;
        }
      }
    }
    if (!existingKey) return null;
    const existing = this.users.get(existingKey)!;
    const updated = { ...existing, ...updates };
    this.users.set(existingKey, updated);
    this.persistToFirestore('users', updated.firebaseUid || existing.id, updated);
    this.persist();
    return updated;
  }

  getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  // --- SKILLS & TOPICS METHODS ---
  getAllSkills(userId?: string): Skill[] {
    const skillsList = Array.from(this.skills.values());
    if (!userId) return skillsList;

    // Attach user-specific progress to skills
    return skillsList.map(skill => {
      const userAssessments = Array.from(this.assessments.values())
        .filter(a => a.userId === userId && a.skillId === skill.id)
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      const lastAssessment = userAssessments[0];
      const skillQuestions = Array.from(this.questions.values()).filter(q => q.skillId === skill.id);

      return {
        ...skill,
        totalQuestionsCount: skillQuestions.length,
        lastScore: lastAssessment ? lastAssessment.score : undefined,
        currentLevel: lastAssessment ? lastAssessment.classifiedLevel : undefined,
        progressPercentage: lastAssessment ? Math.min(100, lastAssessment.score) : 0,
      };
    });
  }

  getSkillById(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  addSkill(skill: Skill): Skill {
    this.skills.set(skill.id, skill);
    return skill;
  }

  // --- QUESTION BANK METHODS ---
  getQuestions(filter?: {
    skillId?: string;
    topicId?: string;
    difficulty?: SkillLevel;
    limit?: number;
  }): Question[] {
    let list = Array.from(this.questions.values());

    if (filter?.skillId) {
      list = list.filter(q => q.skillId === filter.skillId);
    }
    if (filter?.topicId) {
      list = list.filter(q => q.topicId === filter.topicId);
    }
    if (filter?.difficulty) {
      list = list.filter(q => q.difficulty === filter.difficulty);
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  addQuestion(question: Question): Question {
    this.questions.set(question.id, question);
    return question;
  }

  updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const existing = this.questions.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.questions.set(id, updated);
    return updated;
  }

  toggleFlagQuestion(id: string, flagged: boolean): boolean {
    const existing = this.questions.get(id);
    if (!existing) return false;
    existing.isFlagged = flagged;
    return true;
  }

  // --- ASSESSMENT GENERATOR & EVALUATOR ---
  generateAdaptiveAssessmentQuestions(skillId: string, topicIds?: string[], count: number = 8): Question[] {
    // 1. Get all questions strictly for this skill
    const allSkillQuestions = Array.from(this.questions.values()).filter(q => q.skillId === skillId);

    let pool: Question[] = [];

    if (topicIds && topicIds.length > 0) {
      const topicMatches = allSkillQuestions.filter(q => topicIds.includes(q.topicId));
      pool = [...topicMatches];
      // If we need more questions to reach the requested count, supplement with other questions from the SAME skill
      if (pool.length < count) {
        const remaining = allSkillQuestions.filter(q => !topicIds.includes(q.topicId));
        pool.push(...remaining);
      }
    } else {
      pool = [...allSkillQuestions];
    }

    // If still no questions exist in DB for this skill, synthesize fallback questions for this specific skill
    if (pool.length === 0) {
      const skill = this.getSkillById(skillId) || { id: skillId, name: skillId, topics: [] };
      const topics = skill.topics && skill.topics.length > 0 ? skill.topics : [
        { id: `${skillId}-t1`, name: `${skill.name} Core Fundamentals`, questionCount: 0 },
        { id: `${skillId}-t2`, name: `${skill.name} Syntax & Data Handling`, questionCount: 0 },
        { id: `${skillId}-t3`, name: `${skill.name} Architecture & Optimization`, questionCount: 0 },
      ];

      const difficulties = ['Beginner', 'Basic', 'Intermediate', 'Advanced'];
      for (let i = 0; i < Math.min(count, 6); i++) {
        const t = topics[i % topics.length];
        const diff = difficulties[i % difficulties.length] as any;
        const synthQ: Question = {
          id: `q-synth-${skillId}-${i + 1}`,
          skillId: skillId,
          topicId: t.id,
          topicName: t.name,
          question: `Which approach best demonstrates idiomatic and robust design for ${t.name} in ${skill.name}?`,
          questionType: i % 2 === 0 ? 'Conceptual' : 'Scenario',
          difficulty: diff,
          options: [
            { id: 'opt1', text: `Follow established ${skill.name} standard specifications, enforcing modular separation and safe error boundaries.` },
            { id: 'opt2', text: `Hardcode global variables to bypass type checks and lifecycle hooks.` },
            { id: 'opt3', text: `Ignore memory and exception cleanup in synchronous execution routines.` },
            { id: 'opt4', text: `Disable compiler flags and static linting.` },
          ],
          correctAnswerId: 'opt1',
          explanation: `In ${skill.name}, adhering to standard specifications with modular architecture and error boundaries prevents resource leaks and unexpected edge-case failures.`,
        };
        pool.push(synthQ);
        this.questions.set(synthQ.id, synthQ);
      }
    }

    // Sort to give an adaptive progression: Beginner -> Basic -> Intermediate -> Advanced -> Expert
    const difficultyOrder: Record<string, number> = {
      Beginner: 1,
      Basic: 2,
      Intermediate: 3,
      Advanced: 4,
      Expert: 5,
    };

    const sorted = [...pool].sort(
      (a, b) => (difficultyOrder[a.difficulty] || 3) - (difficultyOrder[b.difficulty] || 3)
    );

    // Return up to the requested count of strictly skill-matched questions
    return sorted.slice(0, Math.min(sorted.length, Math.max(count, 5)));
  }

  async submitAssessment(data: {
    userId: string;
    skillId: string;
    responses: { questionId: string; selectedOptionId: string; responseTimeSeconds: number }[];
    durationSeconds: number;
  }): Promise<{ assessment: AssessmentResult; insight: AIInsight; roadmap: LearningRoadmap; user?: UserProfile | null; xpGained?: number }> {
    const user = this.getUserById(data.userId);
    const skill = this.getSkillById(data.skillId) || { id: data.skillId, name: data.skillId, topics: [] };

    let totalCorrect = 0;
    const totalQuestions = data.responses.length;
    const topicMap: Record<string, { total: number; correct: number; name: string }> = {};
    const difficultyMap: Record<string, { total: number; correct: number }> = {
      Beginner: { total: 0, correct: 0 },
      Basic: { total: 0, correct: 0 },
      Intermediate: { total: 0, correct: 0 },
      Advanced: { total: 0, correct: 0 },
      Expert: { total: 0, correct: 0 },
    };

    const detailedResponses = data.responses.map(resp => {
      const q = this.questions.get(resp.questionId);
      const isCorrect = q ? q.correctAnswerId === resp.selectedOptionId : false;
      if (isCorrect) totalCorrect++;

      const topicName = q ? q.topicName : 'General';
      const topicId = q ? q.topicId : 'gen';
      const diff = q ? q.difficulty : 'Intermediate';

      if (!topicMap[topicId]) {
        topicMap[topicId] = { total: 0, correct: 0, name: topicName };
      }
      topicMap[topicId].total++;
      if (isCorrect) topicMap[topicId].correct++;

      if (difficultyMap[diff]) {
        difficultyMap[diff].total++;
        if (isCorrect) difficultyMap[diff].correct++;
      }

      const selectedOption = q?.options?.find(o => o.id === resp.selectedOptionId);
      const correctOption = q?.options?.find(o => o.id === q?.correctAnswerId);

      return {
        questionId: resp.questionId,
        selectedOptionId: resp.selectedOptionId,
        isCorrect,
        responseTimeSeconds: resp.responseTimeSeconds,
        topicId,
        topicName,
        difficulty: diff,
        questionText: q?.question || 'Question prompt',
        codeSnippet: q?.codeSnippet,
        options: q?.options || [],
        selectedOptionText: selectedOption?.text || '',
        correctAnswerId: q?.correctAnswerId || '',
        correctOptionText: correctOption?.text || '',
        explanation: q?.explanation || '',
      };
    });

    const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const accuracy = score;

    let classifiedLevel: SkillLevel = 'Beginner';
    if (score >= 86) classifiedLevel = 'Expert';
    else if (score >= 71) classifiedLevel = 'Advanced';
    else if (score >= 51) classifiedLevel = 'Intermediate';
    else if (score >= 31) classifiedLevel = 'Basic';

    const topicScores = Object.keys(topicMap).map(tid => {
      const t = topicMap[tid];
      return {
        topicId: tid,
        topicName: t.name,
        totalQuestions: t.total,
        correctQuestions: t.correct,
        percentage: Math.round((t.correct / t.total) * 100),
      };
    });

    const difficultyScores = Object.keys(difficultyMap)
      .filter(d => difficultyMap[d].total > 0)
      .map(d => ({
        difficulty: d as SkillLevel,
        totalQuestions: difficultyMap[d].total,
        correctQuestions: difficultyMap[d].correct,
        percentage: Math.round((difficultyMap[d].correct / difficultyMap[d].total) * 100),
      }));

    const strongTopics = topicScores.filter(t => t.percentage >= 70).map(t => t.topicName);
    const weakTopics = topicScores.filter(t => t.percentage < 70).map(t => t.topicName);

    const assessmentId = `asm-${Date.now()}`;
    const insightId = `ins-${Date.now()}`;

    const newAssessment: AssessmentResult = {
      id: assessmentId,
      userId: data.userId,
      skillId: data.skillId,
      skillName: skill.name,
      score,
      accuracy,
      totalQuestions,
      correctQuestions: totalCorrect,
      classifiedLevel,
      durationSeconds: data.durationSeconds,
      completedAt: new Date().toISOString(),
      topicScores,
      difficultyScores,
      strongTopics,
      weakTopics,
      responses: detailedResponses,
      aiInsightId: insightId,
    };
    this.assessments.set(assessmentId, newAssessment);
    this.persistToFirestore('assessments', assessmentId, newAssessment);

    // Call GenAI in parallel for both assessment analysis and personalized roadmap with robust catch
    let aiAnalysis: any;
    let aiRoadmapData: any;

    try {
      [aiAnalysis, aiRoadmapData] = await Promise.all([
        analyzeAssessmentWithAI({
          skillName: skill.name,
          score,
          accuracy,
          totalQuestions,
          topicScores: topicScores.map(t => ({
            topicName: t.topicName,
            percentage: t.percentage,
            total: t.totalQuestions,
            correct: t.correctQuestions,
          })),
          difficultyScores,
          userSelfConfidence: user?.skillConfidence?.[data.skillId] || 3,
          userCareerGoal: user?.careerGoal,
          userExperience: user?.experienceLevel,
        }),
        generateRoadmapWithAI({
          skillName: skill.name,
          currentLevel: classifiedLevel,
          weakTopics: weakTopics.length > 0 ? weakTopics : ['Core topics'],
          strongTopics: strongTopics.length > 0 ? strongTopics : ['Basic syntax'],
          careerGoal: user?.careerGoal,
          dailyAvailableTime: user?.dailyAvailableTime,
        }),
      ]);
    } catch (aiErr) {
      console.warn('AI analysis in submitAssessment failed, using structured fallback:', aiErr);
      aiAnalysis = {
        skillName: skill.name,
        classifiedLevel,
        overallScore: score,
        confidenceVsActualAnalysis: `Assessed at ${score}% proficiency, aligning with ${classifiedLevel} mastery.`,
        strengths: strongTopics.length > 0 ? strongTopics : ['Core Fundamentals'],
        weaknesses: weakTopics.length > 0 ? weakTopics : ['Advanced patterns & optimization'],
        knowledgeGaps: ['Deep runtime internals', 'Complex edge case patterns'],
        misconceptions: ['Assuming initial solutions handle all scale and memory constraints'],
        priorityTopics: [
          { topic: weakTopics[0] || 'Core principles', priority: 'High', reason: 'High leverage area for improvement' },
        ],
        keyObservation: `Demonstrated solid baseline understanding with clear opportunity for acceleration.`,
        recommendedNextStep: `Follow the step-by-step roadmap and practice high-priority modules.`,
      };
      aiRoadmapData = {
        skillName: skill.name,
        targetLevel: 'Advanced' as SkillLevel,
        estimatedWeeks: 4,
        weeklyMilestones: [
          {
            weekNumber: 1,
            title: 'Foundation & Core Concepts',
            focusArea: weakTopics[0] || 'Key fundamentals',
            estimatedHours: 6,
            topics: [weakTopics[0] || 'Core fundamentals', 'Practical syntax exercises'],
            recommendedResources: [
              { title: `${skill.name} Official Documentation & Guides`, type: 'Documentation' as const, url: 'https://developer.mozilla.org', durationMinutes: 60 },
            ],
            practiceTask: `Complete 5 structured exercises on ${weakTopics[0] || 'fundamentals'}.`,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            title: 'Intermediate Patterns & Problem Solving',
            focusArea: 'Data handling and modular design',
            estimatedHours: 8,
            topics: ['Design patterns', 'Error handling and boundaries'],
            recommendedResources: [
              { title: `${skill.name} Architecture Patterns`, type: 'Article' as const, url: 'https://dev.to', durationMinutes: 45 },
            ],
            practiceTask: 'Build a modular prototype project applying clean architecture.',
            isCompleted: false,
          },
        ],
        adaptiveAdjustments: ['Targeting identified weak topics from latest assessment.'],
      };
    }

    const newInsight: AIInsight = {
      ...aiAnalysis,
      id: insightId,
      assessmentId,
      userId: data.userId,
      generatedAt: new Date().toISOString(),
    };
    this.aiInsights.set(insightId, newInsight);
    this.persistToFirestore('insights', insightId, newInsight);

    // Store personalized roadmap
    const roadmapKey = `${data.userId}-${data.skillId}`;
    const newRoadmap: LearningRoadmap = {
      ...aiRoadmapData,
      id: `rdm-${Date.now()}`,
      userId: data.userId,
      skillId: data.skillId,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roadmaps.set(roadmapKey, newRoadmap);
    this.persistToFirestore('roadmaps', roadmapKey, newRoadmap);

    // Update User XP & Gamification
    let xpGained = 150 + totalCorrect * 25;
    if (score === 100) {
      xpGained += 150;
    } else if (score >= 80) {
      xpGained += 75;
    }

    let updatedUser: UserProfile | null = null;
    if (user) {
      updatedUser = this.updateUser(user.id, {
        xp: (user.xp || 0) + xpGained,
        streakDays: (user.streakDays || 0) + 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      });
    }

    return { assessment: newAssessment, insight: newInsight, roadmap: newRoadmap, user: updatedUser, xpGained };
  }

  getAssessmentById(id: string): AssessmentResult | undefined {
    return this.assessments.get(id);
  }

  getUserAssessments(userId: string): AssessmentResult[] {
    return Array.from(this.assessments.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  getAIInsightById(id: string): AIInsight | undefined {
    return this.aiInsights.get(id);
  }

  saveAIInsight(insight: AIInsight): AIInsight {
    this.aiInsights.set(insight.id, insight);
    this.persistToFirestore('insights', insight.id, insight);
    this.persist();
    return insight;
  }

  getUserAIInsights(userId: string): AIInsight[] {
    const list = Array.from(this.aiInsights.values())
      .filter(i => i.userId === userId)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    if (list.length > 0) {
      return list;
    }

    // Initialize rich baseline AI insights for key skills so the learner immediately has high-value actionable diagnostics
    const user = this.getUserById(userId);
    const initialSkills = [
      { id: 'python', name: 'Python Core & Architecture' },
      { id: 'javascript', name: 'Modern JavaScript & Async' },
      { id: 'sql', name: 'Database Systems & SQL' },
    ];

    const baselines: AIInsight[] = [];
    initialSkills.forEach((s, idx) => {
      const insightId = `insight-init-${userId}-${s.id}`;
      const baseline: AIInsight = {
        id: insightId,
        assessmentId: `baseline-${s.id}`,
        userId,
        skillName: s.name,
        classifiedLevel: (user?.experienceLevel as any) || (idx === 0 ? 'Intermediate' : 'Basic'),
        overallScore: idx === 0 ? 76 : idx === 1 ? 68 : 64,
        confidenceVsActualAnalysis: `Your profile indicates an initial ${user?.experienceLevel || 'Intermediate'} baseline. Practical gap diagnostics highlight strong algorithmic foundations with opportunities to deepen architectural modularity, asynchronous race handling, and query efficiency.`,
        strengths: idx === 0
          ? ['Functional Syntax & Comprehensions', 'Standard Library Idioms & Data Models', 'Object-Oriented Encapsulation']
          : idx === 1
          ? ['ES6+ Syntax & Array Manipulations', 'DOM & Event Mechanics', 'Promise Chaining Basics']
          : ['Relational Schema Modeling', 'SELECT, JOIN & Aggregation Logic', 'Primary & Foreign Key Constraints'],
        weaknesses: idx === 0
          ? ['Memory Profiling & Garbage Collection', 'GIL Impact on Concurrency & AsyncIO', 'Advanced Metaclasses & Custom Decorators']
          : idx === 1
          ? ['Event Loop Microtask vs Macrotask Queues', 'Closure Memory Leaks in Complex Web Apps', 'Prototypal Inheritance Mechanics']
          : ['Index Execution Plans & Sequential Scans', 'Transaction Isolation Levels (ACID & Dirty Reads)', 'Subquery Optimization vs CTEs'],
        knowledgeGaps: idx === 0
          ? [
              'Understanding how AsyncIO event loop schedules coroutines under high I/O wait times.',
              'Memory allocation overhead in large dict/object representations and memory leak debugging.',
            ]
          : idx === 1
          ? [
              'Distinguishing call stack execution order when combining async/await with setTimeout.',
              'Handling unhandled Promise rejections and asynchronous race conditions.',
            ]
          : [
              'How B-Tree indexes degrade during heavy write workloads and composite index column ordering.',
              'Optimizing N+1 relational query patterns in backend APIs.',
            ],
        misconceptions: idx === 0
          ? [
              'Assuming threading in standard Python provides true multicore CPU parallelism without multiprocessing.',
              'Believing default mutable arguments (e.g. def fn(arg=[])) reset on each function invocation.',
            ]
          : idx === 1
          ? [
              'Assuming async/await executes in parallel on background threads rather than cooperative non-blocking scheduling on a single thread.',
              'Confusing arrow function lexical "this" binding with traditional function context binding.',
            ]
          : [
              'Believing adding more indexes to every table column will always speed up total database performance without penalizing writes.',
              'Assuming LIMIT 1 without an explicit ORDER BY returns deterministic records.',
            ],
        priorityTopics: idx === 0
          ? [
              { topic: 'AsyncIO & Concurrency Architecture', priority: 'High', reason: 'Critical for high-performance backend microservices and API gateways.' },
              { topic: 'Memory Optimization & Profiling Tools', priority: 'Medium', reason: 'Prevents memory spikes and latency degradation in production services.' },
              { topic: 'Advanced Object-Oriented Design & Dunder Methods', priority: 'Low', reason: 'Enables clean framework development and reusable enterprise abstractions.' },
            ]
          : idx === 1
          ? [
              { topic: 'Event Loop & Concurrency Mechanics', priority: 'High', reason: 'Fundamental for writing responsive web applications and debugging asynchronous bugs.' },
              { topic: 'State Management & Memory Safety', priority: 'Medium', reason: 'Eliminates subtle state mutation bugs and memory leaks in production UI.' },
            ]
          : [
              { topic: 'Query Plan Indexing & Execution Profiling (EXPLAIN ANALYZE)', priority: 'High', reason: 'Eliminates 90% of database latency bottlenecks in production.' },
              { topic: 'Transactions & Concurrency Locks', priority: 'Medium', reason: 'Guarantees financial-grade data integrity under concurrent user operations.' },
            ],
        keyObservation: `Strong intuitive foundation in core idioms; targeted focus on runtime internals will elevate engineering competency to senior tier.`,
        recommendedNextStep: `Review the high-priority concurrency module and test your understanding with the AI Socrates Tutor.`,
        generatedAt: new Date(Date.now() - idx * 86400000).toISOString(),
      };
      this.aiInsights.set(insightId, baseline);
      this.persistToFirestore('insights', insightId, baseline);
      baselines.push(baseline);
    });

    this.persist();
    return baselines;
  }

  getRoadmap(userId: string, skillId: string): LearningRoadmap | undefined {
    const key = `${userId}-${skillId}`;
    return this.roadmaps.get(key);
  }

  toggleRoadmapMilestone(userId: string, skillId: string, milestoneId: string): { roadmap: LearningRoadmap; xpGained: number; user: UserProfile | null } | null {
    const key = `${userId}-${skillId}`;
    const roadmap = this.roadmaps.get(key);
    if (!roadmap) return null;

    const milestone = roadmap.milestones.find(m => m.id === milestoneId);
    let xpGained = 0;
    let updatedUser: UserProfile | null = null;

    if (milestone) {
      milestone.completed = !milestone.completed;
      roadmap.completedMilestones = roadmap.milestones.filter(m => m.completed).length;
      roadmap.updatedAt = new Date().toISOString();
      this.roadmaps.set(key, roadmap);
      this.persistToFirestore('roadmaps', key, roadmap);

      // Award XP for completing milestone
      const user = this.getUserById(userId);
      if (user) {
        if (milestone.completed) {
          xpGained = 100;
          updatedUser = this.updateUser(userId, { xp: (user.xp || 0) + 100 });
        } else {
          xpGained = -100;
          updatedUser = this.updateUser(userId, { xp: Math.max(0, (user.xp || 0) - 100) });
        }
      }
    }
    return { roadmap, xpGained, user: updatedUser };
  }

  // --- ACHIEVEMENTS & GAMIFICATION ---
  getUserAchievements(userId: string): Achievement[] {
    const user = this.getUserById(userId);
    const userAssessments = this.getUserAssessments(userId);
    const achievementsList = Array.from(this.achievements.values());

    return achievementsList.map(ach => {
      let earned = ach.earned;
      let progress = ach.progress || 0;

      if (ach.key === 'first_assessment' && userAssessments.length >= 1) {
        earned = true;
        progress = 1;
      } else if (ach.key === 'hundred_questions') {
        const questionsSolved = userAssessments.reduce((sum, a) => sum + a.totalQuestions, 0);
        progress = questionsSolved;
        if (questionsSolved >= 100) earned = true;
      } else if (ach.key === 'streak_7_days' && (user?.streakDays || 0) >= 7) {
        earned = true;
        progress = Math.min(7, user?.streakDays || 0);
      }

      return {
        ...ach,
        earned,
        progress,
      };
    });
  }

  // --- ADMIN & ANALYTICS ---
  getAdminStats() {
    const allUsers = Array.from(this.users.values());
    const allAssessments = Array.from(this.assessments.values());
    const allQuestions = Array.from(this.questions.values());

    const activeUsers = allUsers.filter(u => u.onboardingCompleted).length;
    const avgScore = allAssessments.length > 0
      ? Math.round(allAssessments.reduce((sum, a) => sum + a.score, 0) / allAssessments.length)
      : 0;

    const skillCounts: Record<string, number> = {};
    const skillScoreSum: Record<string, { total: number; sum: number }> = {};

    for (const a of allAssessments) {
      skillCounts[a.skillName] = (skillCounts[a.skillName] || 0) + 1;
      if (!skillScoreSum[a.skillName]) {
        skillScoreSum[a.skillName] = { total: 0, sum: 0 };
      }
      skillScoreSum[a.skillName].total++;
      skillScoreSum[a.skillName].sum += a.score;
    }

    const popularSkills = Object.keys(skillCounts)
      .map(k => ({ skillName: k, count: skillCounts[k] }))
      .sort((a, b) => b.count - a.count);

    const weakestSkills = Object.keys(skillScoreSum)
      .map(k => ({ skillName: k, avgScore: Math.round(skillScoreSum[k].sum / skillScoreSum[k].total) }))
      .sort((a, b) => a.avgScore - b.avgScore);

    return {
      totalUsers: allUsers.length,
      activeUsers,
      totalAssessments: allAssessments.length,
      averageScore: avgScore,
      totalQuestions: allQuestions.length,
      flaggedQuestionsCount: allQuestions.filter(q => q.isFlagged).length,
      popularSkills,
      weakestSkills,
      recentAssessments: allAssessments.slice(-10).reverse(),
    };
  }

  // --- ASSESSMENT CONFIG & ATTEMPT ENGINE ---
  getAssessmentConfigs(filters?: { category?: string; status?: string; search?: string }): AssessmentConfig[] {
    let configs = Array.from(this.assessmentConfigs.values());

    if (filters?.category && filters.category !== 'All') {
      configs = configs.filter(c => c.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters?.status && filters.status !== 'All') {
      configs = configs.filter(c => c.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      configs = configs.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return configs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAssessmentConfigById(id: string): AssessmentConfig | undefined {
    return this.assessmentConfigs.get(id);
  }

  createAssessmentConfig(data: Partial<AssessmentConfig>, adminUser: UserProfile): AssessmentConfig {
    const id = data.id || `test-cfg-${Date.now()}`;
    const newConfig: AssessmentConfig = {
      id,
      title: data.title || 'Untitled Assessment',
      description: data.description || 'Standard technical evaluation',
      category: data.category || 'Technical',
      domain: data.domain || 'General',
      difficulty: data.difficulty || 'Intermediate',
      durationMinutes: data.durationMinutes || 30,
      questionCount: data.questionCount || 8,
      maxMarks: data.maxMarks || 40,
      negativeMarking: data.negativeMarking ?? 0,
      maxAttempts: data.maxAttempts || 3,
      passPercentage: data.passPercentage || 50,
      status: data.status || 'draft',
      instructions: data.instructions || [
        'Read each question carefully before submitting your answer.',
        'The examination will auto-submit when the countdown expires.',
      ],
      tags: data.tags || [data.domain || 'Assessment'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      allowReview: data.allowReview ?? true,
      isCodingSupported: Boolean(data.isCodingSupported),
      questionIds: data.questionIds || [],
    };

    this.assessmentConfigs.set(id, newConfig);
    this.persist();
    this.persistToFirestore('assessment_configs', id, newConfig);
    this.recordAuditLog(adminUser, 'CREATE_ASSESSMENT', 'AssessmentConfig', id, `Created assessment "${newConfig.title}"`);
    return newConfig;
  }

  updateAssessmentConfig(id: string, data: Partial<AssessmentConfig>, adminUser: UserProfile): AssessmentConfig | null {
    const existing = this.assessmentConfigs.get(id);
    if (!existing) return null;

    const updated: AssessmentConfig = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.assessmentConfigs.set(id, updated);
    this.persist();
    this.persistToFirestore('assessment_configs', id, updated);
    this.recordAuditLog(adminUser, 'UPDATE_ASSESSMENT', 'AssessmentConfig', id, `Updated settings/status to "${updated.status}"`);
    return updated;
  }

  duplicateAssessmentConfig(id: string, adminUser: UserProfile): AssessmentConfig | null {
    const existing = this.assessmentConfigs.get(id);
    if (!existing) return null;

    const newId = `${existing.id}-copy-${Date.now().toString(36)}`;
    const duplicate: AssessmentConfig = {
      ...existing,
      id: newId,
      title: `${existing.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.assessmentConfigs.set(newId, duplicate);
    this.persist();
    this.persistToFirestore('assessment_configs', newId, duplicate);
    this.recordAuditLog(adminUser, 'DUPLICATE_ASSESSMENT', 'AssessmentConfig', newId, `Duplicated from ${id}`);
    return duplicate;
  }

  archiveAssessmentConfig(id: string, adminUser: UserProfile): boolean {
    const existing = this.assessmentConfigs.get(id);
    if (!existing) return false;

    existing.status = 'archived';
    existing.updatedAt = new Date().toISOString();
    this.assessmentConfigs.set(id, existing);
    this.persist();
    this.persistToFirestore('assessment_configs', id, existing);
    this.recordAuditLog(adminUser, 'ARCHIVE_ASSESSMENT', 'AssessmentConfig', id, `Archived assessment ${existing.title}`);
    return true;
  }

  getQuestionsForAssessment(config: AssessmentConfig): Question[] {
    // 1. Direct configured questions from seed test questions
    if (SEED_TEST_QUESTIONS[config.id] && SEED_TEST_QUESTIONS[config.id].length > 0) {
      return SEED_TEST_QUESTIONS[config.id];
    }

    // 2. Explicit question IDs
    if (config.questionIds && config.questionIds.length > 0) {
      const explicit = config.questionIds
        .map(qid => this.questions.get(qid))
        .filter((q): q is Question => q !== undefined);
      if (explicit.length > 0) return explicit;
    }

    // 3. Match by domain or skill ID
    const domainKey = config.domain.toLowerCase().replace(/[^a-z0-9]/g, '');
    let matched = Array.from(this.questions.values()).filter(q =>
      q.skillId.toLowerCase() === domainKey ||
      q.topicName.toLowerCase().includes(config.domain.toLowerCase()) ||
      config.tags.some(t => q.topicName.toLowerCase().includes(t.toLowerCase()))
    );

    if (matched.length >= config.questionCount) {
      return matched.slice(0, config.questionCount);
    }

    // 4. Fill with general questions if needed
    const all = Array.from(this.questions.values());
    const needed = config.questionCount - matched.length;
    const fillers = all.filter(q => !matched.some(m => m.id === q.id)).slice(0, needed);
    return [...matched, ...fillers];
  }

  startOrResumeAttempt(
    assessmentId: string,
    user: UserProfile,
    options?: { sebHeader?: string; isReattempt?: boolean }
  ): { attempt: AssessmentAttempt; questions: Question[]; isResumed: boolean } {
    const config = this.assessmentConfigs.get(assessmentId);
    if (!config) throw new Error('Assessment not found');

    const existingAttempts = Array.from(this.assessmentAttempts.values())
      .filter(a => a.assessmentId === assessmentId && a.userId === user.id)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

    const inProgressAttempt = existingAttempts.find(a => a.status === 'in_progress');
    const now = new Date();

    if (inProgressAttempt && !options?.isReattempt) {
      const deadline = new Date(inProgressAttempt.serverDeadline);
      if (now > deadline) {
        // Automatically submit expired attempt
        this.submitAttempt(inProgressAttempt.id, user.id, inProgressAttempt.answers, config.durationMinutes * 60);
      } else {
        const questions = this.getQuestionsForAssessment(config);
        return { attempt: inProgressAttempt, questions, isResumed: true };
      }
    }

    // Filter finished attempts
    const finishedAttempts = existingAttempts.filter(
      a => a.status === 'submitted' || a.status === 'evaluated' || a.status === 'expired' || a.status === 'terminated_due_to_violations'
    );

    // Enforce maxAttempts limit
    const maxAttemptsAllowed = config.maxAttempts || 3;
    if (finishedAttempts.length >= maxAttemptsAllowed) {
      throw new Error(`Maximum attempt limit (${maxAttemptsAllowed}) reached for this assessment.`);
    }

    // Enforce cooldown period if applicable
    const lastAttempt = finishedAttempts[finishedAttempts.length - 1];
    const cooldownMins = config.cooldownMinutes ?? 0;
    if (lastAttempt && lastAttempt.submittedAt && cooldownMins > 0) {
      const submittedTime = new Date(lastAttempt.submittedAt).getTime();
      const cooldownEndTime = submittedTime + cooldownMins * 60 * 1000;
      if (now.getTime() < cooldownEndTime) {
        const minsRemaining = Math.ceil((cooldownEndTime - now.getTime()) / 60000);
        throw new Error(`Reattempt cooldown active. Please wait ${minsRemaining} minute(s) before starting a new attempt.`);
      }
    }

    const attemptNumber = finishedAttempts.length + 1;
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = now.toISOString();
    const serverDeadline = new Date(now.getTime() + config.durationMinutes * 60 * 1000).toISOString();

    const sebVerified = Boolean(
      options?.sebHeader && (options.sebHeader.includes('SEB') || options.sebHeader.includes('SafeExamBrowser'))
    );

    const newAttempt: AssessmentAttempt = {
      id: attemptId,
      assessmentId: config.id,
      assessmentTitle: config.title,
      category: config.category,
      domain: config.domain,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      startedAt,
      serverDeadline,
      status: 'in_progress',
      attemptNumber,
      violationCount: 0,
      violationHistory: [],
      answers: {},
      flagged: {},
      timeSpentSeconds: 0,
      maxMarks: config.maxMarks,
      passPercentage: config.passPercentage || 70,
      sebVerified,
    };

    this.assessmentAttempts.set(attemptId, newAttempt);
    this.persist();
    this.persistToFirestore('attempts', attemptId, newAttempt);

    this.recordAuditLog(
      user,
      'START_EXAM_ATTEMPT',
      'AssessmentAttempt',
      attemptId,
      `Candidate ${user.name} started attempt #${attemptNumber} for assessment "${config.title}" (SEB Verified: ${sebVerified})`
    );

    const questions = this.getQuestionsForAssessment(config);
    return { attempt: newAttempt, questions, isResumed: false };
  }

  async recordViolation(
    attemptId: string,
    userId: string,
    violationType: 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'keyboard_shortcut' | 'window_exit' | 'other',
    details: string
  ): Promise<{
    violationCount: number;
    warningNumber: number;
    maxAllowed: number;
    isTerminated: boolean;
    attempt: AssessmentAttempt;
  }> {
    const attempt = this.assessmentAttempts.get(attemptId);
    if (!attempt || attempt.userId !== userId) {
      throw new Error('Attempt not found or unauthorized');
    }

    const config = this.assessmentConfigs.get(attempt.assessmentId);
    const maxViolationsAllowed = config?.maxViolationsAllowed ?? 2;

    if (attempt.status !== 'in_progress') {
      return {
        violationCount: attempt.violationCount || 0,
        warningNumber: attempt.violationCount || 0,
        maxAllowed: maxViolationsAllowed,
        isTerminated: attempt.status === 'terminated_due_to_violations',
        attempt,
      };
    }

    // Debounce duplicate events within 3000ms
    const history = attempt.violationHistory || [];
    const now = Date.now();
    const recentDuplicate = history.find(v => {
      const diff = now - new Date(v.timestamp).getTime();
      return diff < 3000 && (v.type === violationType || diff < 1500);
    });

    if (recentDuplicate) {
      return {
        violationCount: attempt.violationCount,
        warningNumber: attempt.violationCount,
        maxAllowed: maxViolationsAllowed,
        isTerminated: false,
        attempt,
      };
    }

    const newViolationCount = (attempt.violationCount || 0) + 1;
    const warningNumber = newViolationCount;
    const newViolationEvent: ViolationEvent = {
      id: `viol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      attemptId,
      userId,
      assessmentId: attempt.assessmentId,
      type: violationType,
      details,
      timestamp: new Date().toISOString(),
      warningNumber,
    };

    attempt.violationCount = newViolationCount;
    attempt.violationHistory = [...history, newViolationEvent];

    const user = this.getUserById(userId) || ({ id: userId, email: attempt.userEmail, name: attempt.userName, role: 'student' } as any);

    this.recordAuditLog(
      user,
      'EXAM_SECURITY_VIOLATION',
      'AssessmentAttempt',
      attemptId,
      `Violation #${newViolationCount}/${maxViolationsAllowed} for ${attempt.userName}: ${details} [Type: ${violationType}]`
    );

    if (newViolationCount >= maxViolationsAllowed) {
      attempt.status = 'terminated_due_to_violations';
      attempt.terminationReason = `Terminated due to exceeding maximum allowed examination security violations (${newViolationCount}/${maxViolationsAllowed}): ${details}`;
      attempt.submittedAt = new Date().toISOString();

      // Automatically evaluate answers collected so far and store AssessmentResult (never discard answers!)
      await this.submitAttempt(
        attemptId,
        userId,
        attempt.answers,
        attempt.timeSpentSeconds || 60,
        attempt.codeSubmissions
      );

      // Re-fetch updated attempt to ensure status remains terminated_due_to_violations
      const updatedAttempt = this.assessmentAttempts.get(attemptId)!;
      updatedAttempt.status = 'terminated_due_to_violations';
      updatedAttempt.terminationReason = `Terminated due to exceeding maximum allowed examination security violations (${newViolationCount}/${maxViolationsAllowed})`;
      this.assessmentAttempts.set(attemptId, updatedAttempt);
      this.persist();
      this.persistToFirestore('attempts', attemptId, updatedAttempt);

      this.recordAuditLog(
        user,
        'EXAM_TERMINATED_VIOLATIONS',
        'AssessmentAttempt',
        attemptId,
        `Assessment terminated automatically due to repeated violations (${newViolationCount}/${maxViolationsAllowed}). All answers evaluated and stored securely.`
      );

      return {
        violationCount: newViolationCount,
        warningNumber,
        maxAllowed: maxViolationsAllowed,
        isTerminated: true,
        attempt: updatedAttempt,
      };
    }

    this.assessmentAttempts.set(attemptId, attempt);
    this.persist();
    this.persistToFirestore('attempts', attemptId, attempt);

    return {
      violationCount: newViolationCount,
      warningNumber,
      maxAllowed: maxViolationsAllowed,
      isTerminated: false,
      attempt,
    };
  }

  getEligibleReattempts(userId: string): ReattemptEligibility[] {
    const userAttempts = Array.from(this.assessmentAttempts.values()).filter(a => a.userId === userId);
    const configs = Array.from(this.assessmentConfigs.values());

    const result: ReattemptEligibility[] = [];
    const now = Date.now();

    for (const config of configs) {
      const attemptsForConfig = userAttempts
        .filter(a => a.assessmentId === config.id)
        .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

      if (attemptsForConfig.length === 0) continue;

      const finishedAttempts = attemptsForConfig.filter(
        a => a.status === 'submitted' || a.status === 'evaluated' || a.status === 'expired' || a.status === 'terminated_due_to_violations'
      );

      if (finishedAttempts.length === 0) continue;

      const latestAttempt = finishedAttempts[finishedAttempts.length - 1];
      const passPercentage = config.passPercentage || 70;
      const lastScore = latestAttempt.score ?? 0;
      const isFailedOrTerminated = lastScore < passPercentage || latestAttempt.status === 'terminated_due_to_violations';

      if (!isFailedOrTerminated) {
        continue;
      }

      const maxAttempts = config.maxAttempts || 3;
      const remainingAttempts = Math.max(0, maxAttempts - finishedAttempts.length);
      const cooldownMins = config.cooldownMinutes ?? 0;

      let inCooldown = false;
      let cooldownRemainingMinutes = 0;

      if (latestAttempt.submittedAt && cooldownMins > 0) {
        const submittedTime = new Date(latestAttempt.submittedAt).getTime();
        const cooldownEndTime = submittedTime + cooldownMins * 60 * 1000;
        if (now < cooldownEndTime) {
          inCooldown = true;
          cooldownRemainingMinutes = Math.ceil((cooldownEndTime - now) / 60000);
        }
      }

      const isEligible = remainingAttempts > 0 && !inCooldown;

      result.push({
        assessmentId: config.id,
        assessmentTitle: config.title,
        category: config.category,
        domain: config.domain,
        difficulty: config.difficulty,
        durationMinutes: config.durationMinutes,
        lastScore,
        passPercentage,
        maxAttempts,
        attemptCount: finishedAttempts.length,
        remainingAttempts,
        isEligible,
        inCooldown,
        cooldownRemainingMinutes,
        lastAttemptStatus: latestAttempt.status as any,
        lastTerminationReason: latestAttempt.terminationReason,
        lastAttemptId: latestAttempt.id,
        lastSubmittedAt: latestAttempt.submittedAt,
      });
    }

    return result;
  }

  generateSebConfigFile(config: AssessmentConfig, baseUrl: string): string {
    const examUrl = `${baseUrl}/?testId=${config.id}&seb=1`;
    return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>originatorVersion</key>
    <string>SEB_AI_Assessment_Portal_v2.4</string>
    <key>startURL</key>
    <string>${examUrl}</string>
    <key>title</key>
    <string>${config.title} - Lockdown Mode</string>
    <key>allowQuit</key>
    <true/>
    <key>quitURL</key>
    <string>${baseUrl}/</string>
    <key>quitURLConfirm</key>
    <true/>
    <key>allowPreferencesWindow</key>
    <false/>
    <key>allowFlashFullscreen</key>
    <false/>
    <key>browserWindowAllowReload</key>
    <false/>
    <key>allowDownAndUploads</key>
    <false/>
    <key>allowUserSwitching</key>
    <false/>
    <key>browserExamKey</key>
    <string>${config.sebBrowserExamKey || 'seb-ai-portal-key-2026'}</string>
    <key>enableAltTab</key>
    <false/>
    <key>enableF1</key>
    <false/>
    <key>enableF2</key>
    <false/>
    <key>enableF3</key>
    <false/>
    <key>enableF4</key>
    <false/>
    <key>enableF5</key>
    <false/>
    <key>enableF6</key>
    <false/>
    <key>enableF7</key>
    <false/>
    <key>enableF8</key>
    <false/>
    <key>enableF9</key>
    <false/>
    <key>enableF10</key>
    <false/>
    <key>enableF11</key>
    <false/>
    <key>enableF12</key>
    <false/>
    <key>hookKeys</key>
    <true/>
    <key>taskBarNotificationArea</key>
    <false/>
    <key>kioskMode</key>
    <true/>
  </dict>
</plist>`;
  }

  getAllViolations(): {
    violations: ViolationEvent[];
    terminatedAttempts: AssessmentAttempt[];
  } {
    const allEvents: ViolationEvent[] = [];
    const terminatedAttempts: AssessmentAttempt[] = [];

    for (const attempt of this.assessmentAttempts.values()) {
      if (attempt.violationHistory && attempt.violationHistory.length > 0) {
        allEvents.push(...attempt.violationHistory);
      }
      if (attempt.status === 'terminated_due_to_violations') {
        terminatedAttempts.push(attempt);
      }
    }

    allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    terminatedAttempts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return {
      violations: allEvents,
      terminatedAttempts,
    };
  }

  resetAttemptViolations(attemptId: string, adminUser: any, reason?: string): { success: boolean; attempt: AssessmentAttempt } {
    const attempt = this.assessmentAttempts.get(attemptId);
    if (!attempt) throw new Error('Attempt not found');

    const previousStatus = attempt.status;
    const previousViolations = attempt.violationCount || 0;

    attempt.violationCount = 0;
    attempt.status = 'in_progress';
    attempt.terminationReason = undefined;

    // Extend deadline by 15 mins to give student time if they were locked out
    const now = new Date();
    attempt.serverDeadline = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    this.assessmentAttempts.set(attemptId, attempt);
    this.persist();
    this.persistToFirestore('attempts', attemptId, attempt);

    this.recordAuditLog(
      adminUser,
      'ADMIN_RESET_VIOLATIONS',
      'AssessmentAttempt',
      attemptId,
      `Administrator ${adminUser.email || adminUser.name} reset ${previousViolations} violations for attempt ${attemptId} (previous status: ${previousStatus}). Extended deadline by 15 minutes. Reason: ${reason || 'Administrative override'}`
    );

    return { success: true, attempt };
  }

  autosaveAttempt(
    attemptId: string,
    userId: string,
    data: { answers?: Record<string, string>; flagged?: Record<string, boolean>; codeSubmissions?: any; timeSpentSeconds?: number }
  ): { success: boolean; isExpired: boolean } {
    const attempt = this.assessmentAttempts.get(attemptId);
    if (!attempt || attempt.userId !== userId) throw new Error('Attempt not found or unauthorized');
    if (attempt.status !== 'in_progress') return { success: false, isExpired: true };

    const now = new Date();
    if (now > new Date(attempt.serverDeadline)) {
      this.submitAttempt(attemptId, userId, data.answers || attempt.answers, (attempt.timeSpentSeconds || 0) + 5);
      return { success: false, isExpired: true };
    }

    if (data.answers) attempt.answers = { ...attempt.answers, ...data.answers };
    if (data.flagged) attempt.flagged = { ...attempt.flagged, ...data.flagged };
    if (data.codeSubmissions) attempt.codeSubmissions = { ...attempt.codeSubmissions, ...data.codeSubmissions };
    if (typeof data.timeSpentSeconds === 'number') attempt.timeSpentSeconds = data.timeSpentSeconds;

    this.assessmentAttempts.set(attemptId, attempt);
    this.persist();
    this.persistToFirestore('attempts', attemptId, attempt);
    return { success: true, isExpired: false };
  }

  async submitAttempt(
    attemptId: string,
    userId: string,
    answers: Record<string, string>,
    durationSeconds: number,
    codeSubmissions?: Record<string, { code: string; language: string }>
  ): Promise<{
    attempt: AssessmentAttempt;
    assessmentResult: AssessmentResult;
    aiInsight?: AIInsight;
    xpRewarded: number;
    user: UserProfile;
  }> {
    const attempt = this.assessmentAttempts.get(attemptId);
    if (!attempt || attempt.userId !== userId) {
      throw new Error('Attempt not found or unauthorized');
    }

    // Idempotent return if already submitted
    if (attempt.status === 'submitted' || attempt.status === 'evaluated' || attempt.status === 'terminated_due_to_violations') {
      const existingAsm = this.assessments.get(`asm-${attemptId}`) || Array.from(this.assessments.values()).find(a => a.id === `asm-${attemptId}`);
      if (existingAsm) {
        const existingInsight = existingAsm?.aiInsightId ? this.aiInsights.get(existingAsm.aiInsightId) : undefined;
        const user = this.getUserById(userId) || this.createUser({ id: userId });
        return {
          attempt,
          assessmentResult: existingAsm,
          aiInsight: existingInsight,
          xpRewarded: attempt.xpRewarded || 0,
          user,
        };
      }
    }

    const config = this.assessmentConfigs.get(attempt.assessmentId);
    const questions = config ? this.getQuestionsForAssessment(config) : [];
    const questionCount = questions.length || 1;
    const defaultMarkPerQ = config ? config.maxMarks / questionCount : 5;

    let marksObtained = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const userResponses: any[] = [];
    const topicScoresMap = new Map<string, { topicName: string; total: number; correct: number }>();
    const diffScoresMap = new Map<string, { total: number; correct: number }>();

    for (const q of questions) {
      const qMark = q.marks || defaultMarkPerQ;
      const userAns = answers[q.id] || attempt.answers[q.id];
      const codeSub = codeSubmissions?.[q.id] || attempt.codeSubmissions?.[q.id];

      // Init topic tracking
      if (!topicScoresMap.has(q.topicId)) {
        topicScoresMap.set(q.topicId, { topicName: q.topicName, total: 0, correct: 0 });
      }
      const tStat = topicScoresMap.get(q.topicId)!;
      tStat.total++;

      // Init difficulty tracking
      if (!diffScoresMap.has(q.difficulty)) {
        diffScoresMap.set(q.difficulty, { total: 0, correct: 0 });
      }
      const dStat = diffScoresMap.get(q.difficulty)!;
      dStat.total++;

      let isCorrect = false;

      if (q.questionType === 'Coding') {
        if (codeSub && q.codingDetails) {
          const testCases = [...q.codingDetails.sampleTestCases, ...q.codingDetails.hiddenTestCases];
          const execRes = await executeSandboxedCode({
            language: codeSub.language || 'javascript',
            code: codeSub.code || '',
            testCases,
          });

          if (execRes.success) {
            isCorrect = true;
            marksObtained += qMark;
            correctCount++;
            tStat.correct++;
            dStat.correct++;
          } else if (execRes.passedTestCases > 0) {
            const partialMark = (execRes.passedTestCases / testCases.length) * qMark;
            marksObtained += partialMark;
            incorrectCount++;
          } else {
            incorrectCount++;
          }
        } else {
          unansweredCount++;
        }
      } else {
        if (!userAns) {
          unansweredCount++;
        } else if (userAns === q.correctAnswerId) {
          isCorrect = true;
          marksObtained += qMark;
          correctCount++;
          tStat.correct++;
          dStat.correct++;
        } else {
          incorrectCount++;
          if (config && config.negativeMarking > 0) {
            marksObtained -= (qMark * config.negativeMarking);
          }
        }
      }

      userResponses.push({
        questionId: q.id,
        selectedOptionId: userAns || '',
        isCorrect,
        responseTimeSeconds: Math.round(durationSeconds / questionCount),
        topicId: q.topicId,
        topicName: q.topicName,
        difficulty: q.difficulty,
        questionText: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        selectedOptionText: q.options.find(o => o.id === userAns)?.text,
        correctAnswerId: q.correctAnswerId,
        correctOptionText: q.options.find(o => o.id === q.correctAnswerId)?.text,
        explanation: q.explanation,
      });
    }

    const maxMarks = config ? config.maxMarks : (questionCount * 5);
    const score = Math.max(0, Math.min(100, Math.round((marksObtained / maxMarks) * 100)));
    const totalAnswered = correctCount + incorrectCount;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    let classifiedLevel: SkillLevel = 'Beginner';
    if (score >= 86) classifiedLevel = 'Expert';
    else if (score >= 71) classifiedLevel = 'Advanced';
    else if (score >= 51) classifiedLevel = 'Intermediate';
    else if (score >= 31) classifiedLevel = 'Basic';

    const topicScores = Array.from(topicScoresMap.entries()).map(([topicId, val]) => ({
      topicId,
      topicName: val.topicName,
      totalQuestions: val.total,
      correctQuestions: val.correct,
      percentage: Math.round((val.correct / (val.total || 1)) * 100),
    }));

    const difficultyScores = Array.from(diffScoresMap.entries()).map(([diff, val]) => ({
      difficulty: diff as SkillLevel,
      totalQuestions: val.total,
      correctQuestions: val.correct,
      percentage: Math.round((val.correct / (val.total || 1)) * 100),
    }));

    const strongTopics = topicScores.filter(t => t.percentage >= 70).map(t => t.topicName);
    const weakTopics = topicScores.filter(t => t.percentage < 70).map(t => t.topicName);

    // XP Reward Calculation with Duplicate Prevention
    const txId = `xp-att-${attemptId}`;
    let xpRewarded = 0;
    if (!this.xpTransactions.has(txId)) {
      xpRewarded = 150 + (correctCount * 25);
      if (score === 100) {
        xpRewarded += 150;
      } else if (score >= 80) {
        xpRewarded += 75;
      }
      this.xpTransactions.add(txId);
    }

    let user = this.getUserById(userId);
    if (user) {
      user = this.updateUser(user.id, {
        xp: (user.xp || 0) + xpRewarded,
        streakDays: (user.streakDays || 0) + 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      });
    } else {
      user = this.createUser({ id: userId, xp: xpRewarded });
    }

    // Call Gemini AI for diagnostic insight
    const assessmentResultId = `asm-${attemptId}`;
    const insightId = `ins-${attemptId}`;
    let aiAnalysis: any = null;

    try {
      aiAnalysis = await analyzeAssessmentWithAI({
        skillName: config?.domain || config?.title || 'Technical',
        score,
        accuracy,
        totalQuestions: questionCount,
        topicScores: topicScores.map(t => ({
          topicName: t.topicName,
          percentage: t.percentage,
          total: t.totalQuestions,
          correct: t.correctQuestions,
        })),
        difficultyScores: difficultyScores.map(d => ({
          difficulty: d.difficulty,
          percentage: d.percentage,
        })),
        userSelfConfidence: user?.skillConfidence?.[config?.domain || ''] || 3,
        userCareerGoal: user?.careerGoal,
        userExperience: user?.experienceLevel,
      });
    } catch (err) {
      console.warn('AI analysis in submitAttempt skipped (fallback generated):', err);
      aiAnalysis = {
        skillName: config?.domain || 'Technical Assessment',
        classifiedLevel,
        overallScore: score,
        confidenceVsActualAnalysis: `Achieved ${score}% accuracy on ${config?.title}.`,
        strengths: strongTopics.length > 0 ? strongTopics : ['Core Fundamentals'],
        weaknesses: weakTopics.length > 0 ? weakTopics : ['Edge cases & optimization'],
        knowledgeGaps: ['Deep execution details', 'High-speed problem solving'],
        misconceptions: ['Assuming baseline logic generalizes without boundary assertions'],
        priorityTopics: [{ topic: weakTopics[0] || 'Core topics', priority: 'High', reason: 'High impact for mastery' }],
        keyObservation: `Completed in ${Math.round(durationSeconds / 60)} minutes with ${correctCount} correct answers.`,
        recommendedNextStep: 'Review missed questions in the solutions review and complete related roadmap tasks.',
      };
    }

    const newInsight: AIInsight = {
      ...aiAnalysis,
      id: insightId,
      assessmentId: assessmentResultId,
      userId,
      generatedAt: new Date().toISOString(),
    };
    this.aiInsights.set(insightId, newInsight);
    this.persistToFirestore('insights', insightId, newInsight);

    const assessmentResult: AssessmentResult = {
      id: assessmentResultId,
      userId,
      skillId: config?.domain.toLowerCase().replace(/[^a-z0-9]/g, '') || 'assessment',
      skillName: config?.title || 'Assessment',
      score,
      accuracy,
      totalQuestions: questionCount,
      correctQuestions: correctCount,
      classifiedLevel,
      durationSeconds,
      completedAt: new Date().toISOString(),
      topicScores,
      difficultyScores,
      strongTopics,
      weakTopics,
      responses: userResponses,
      aiInsightId: insightId,
    };

    this.assessments.set(assessmentResultId, assessmentResult);
    this.persistToFirestore('assessments', assessmentResultId, assessmentResult);

    // Update Attempt Document
    if (attempt.status !== 'terminated_due_to_violations') {
      attempt.status = 'evaluated';
    }
    attempt.submittedAt = attempt.submittedAt || new Date().toISOString();
    attempt.answers = answers;
    if (codeSubmissions) attempt.codeSubmissions = codeSubmissions;
    attempt.score = score;
    const passPercentage = config?.passPercentage ?? 70;
    attempt.isPassed = score >= passPercentage;
    attempt.passPercentage = passPercentage;
    attempt.totalMarksObtained = Math.round(marksObtained);
    attempt.accuracy = accuracy;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = unansweredCount;
    attempt.timeSpentSeconds = durationSeconds;
    attempt.xpRewarded = xpRewarded;
    attempt.xpTxId = txId;

    this.assessmentAttempts.set(attemptId, attempt);
    this.persist();
    this.persistToFirestore('attempts', attemptId, attempt);

    // Emit in-app notification
    this.addNotification(userId, {
      type: 'assessment',
      title: 'Assessment Complete!',
      message: `You scored ${score}% on "${config?.title || 'Test'}". +${xpRewarded} XP rewarded.`,
      linkView: 'assessment-result',
      linkParam: assessmentResultId,
    });

    return {
      attempt,
      assessmentResult,
      aiInsight: newInsight,
      xpRewarded,
      user: user!,
    };
  }

  getAttemptById(attemptId: string): AssessmentAttempt | undefined {
    return this.assessmentAttempts.get(attemptId);
  }

  getUserAttempts(userId: string, assessmentId?: string): AssessmentAttempt[] {
    let list = Array.from(this.assessmentAttempts.values()).filter(a => a.userId === userId);
    if (assessmentId) {
      list = list.filter(a => a.assessmentId === assessmentId);
    }
    return list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  getAllAttempts(assessmentId?: string): AssessmentAttempt[] {
    let list = Array.from(this.assessmentAttempts.values());
    if (assessmentId) {
      list = list.filter(a => a.assessmentId === assessmentId);
    }
    return list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  // --- NOTIFICATIONS ---
  addNotification(userId: string, data: Omit<AppNotification, 'id' | 'userId' | 'createdAt' | 'read'>): AppNotification {
    const list = this.notifications.get(userId) || [];
    const notif: AppNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      read: false,
      createdAt: new Date().toISOString(),
    };

    list.unshift(notif);
    this.notifications.set(userId, list.slice(0, 50));
    this.persist();
    this.persistToFirestore('notifications', notif.id, notif);
    return notif;
  }

  getUserNotifications(userId: string): AppNotification[] {
    return this.notifications.get(userId) || [];
  }

  markNotificationRead(userId: string, notifId: string): boolean {
    const list = this.notifications.get(userId) || [];
    const target = list.find(n => n.id === notifId);
    if (target) {
      target.read = true;
      this.persist();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): boolean {
    const list = this.notifications.get(userId) || [];
    list.forEach(n => { n.read = true; });
    this.persist();
    return true;
  }

  // --- AUDIT LOGS ---
  recordAuditLog(adminUser: UserProfile, action: string, targetType: string, targetId: string, details: string) {
    const entry: AdminAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    this.persist();
    this.persistToFirestore('audit_logs', entry.id, entry);
  }

  getAuditLogs(limit: number = 50): AdminAuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  exportAssessmentReportCsv(assessmentId: string): string {
    const config = this.assessmentConfigs.get(assessmentId);
    const attempts = this.getAllAttempts(assessmentId);

    const headers = ['Attempt ID', 'Student Name', 'Student Email', 'Status', 'Started At', 'Submitted At', 'Score (%)', 'Marks Obtained', 'Max Marks', 'Correct', 'Incorrect', 'Unanswered', 'Time Spent (s)'];
    const rows = attempts.map(a => [
      a.id,
      `"${a.userName.replace(/"/g, '""')}"`,
      `"${a.userEmail.replace(/"/g, '""')}"`,
      a.status,
      a.startedAt,
      a.submittedAt || '',
      a.score ?? '',
      a.totalMarksObtained ?? '',
      a.maxMarks ?? (config?.maxMarks || ''),
      a.correctCount ?? '',
      a.incorrectCount ?? '',
      a.unansweredCount ?? '',
      a.timeSpentSeconds || 0,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const db = new InMemoryDB();

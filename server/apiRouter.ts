import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { requireFirebaseAuth, getFirestoreDiagnostic } from './firebaseAuth';
import { accessControlService, normalizeEmail } from './accessControl';
import { SkillLevel, Question } from '../src/types';
import {
  analyzeAssessmentWithAI,
  generateRoadmapWithAI,
  generateAdaptiveQuestionWithAI,
  askAITutor,
  generateSkillDiagnosticInsightWithAI,
  generateGapDeepDiveWithAI,
} from './geminiService';
import { executeSandboxedCode } from './sandboxRunner';

export const apiRouter = Router();

apiRouter.use(async (_req, _res, next) => {
  try {
    await Promise.all([db.ready, accessControlService.ready]);
  } catch (err) {
    console.warn('DB / AccessControl ready check warning:', err);
  }
  next();
});

function getNormalizedPath(req: Request): string {
  const full = (req.originalUrl || req.url || '').split('?')[0];
  const stripped = full.replace(/^\/api/, '') || '/';
  return stripped;
}

function isPublicEndpoint(req: Request): boolean {
  const p = getNormalizedPath(req);
  return (
    p === '/health' ||
    p === '/healthz' ||
    p === '/system/db-status' ||
    p === '/auth/status' ||
    p === '/auth/login' ||
    p === '/auth/register' ||
    p === '/auth/email-login' ||
    p === '/auth/verify-email-access' ||
    p === '/auth/check-access' ||
    p === '/auth/me' ||
    (req.method === 'GET' && (
      p === '/skills' ||
      p.startsWith('/skills/') ||
      p === '/tests' ||
      p.startsWith('/tests/')
    ))
  );
}

const getAuthenticatedUser = (req: Request & { user?: any }) => {
  const firebaseUid = req.user?.uid || (req.query?.userId as string) || (req.body?.userId as string) || 'guest-learner-1';

  let user = db.getUserByFirebaseUid(firebaseUid) || db.getUserById(firebaseUid);
  if (!user) {
    user = db.upsertUserFromFirebase({
      firebaseUid,
      id: firebaseUid,
      name: req.user?.name || (req.user?.email ? req.user.email.split('@')[0] : 'Learner'),
      email: req.user?.email || `${firebaseUid}@firebase.local`,
      avatar: req.user?.picture || undefined,
      role: 'student',
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
  }

  return user;
};

// Middleware: Authenticate request via Firebase Bearer Token
const requireAuthenticatedUser = (req: Request, res: Response, next: NextFunction) => {
  if (isPublicEndpoint(req)) {
    return next();
  }
  return requireFirebaseAuth(req, res, next);
};

// Middleware: Strict Admin-Approved Email Access Control
const requireApprovedEmail = async (req: Request & { user?: any; accessControl?: any }, res: Response, next: NextFunction) => {
  if (isPublicEndpoint(req)) {
    return next();
  }

  const userEmail = normalizeEmail(req.user?.email);

  if (!userEmail) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'You must sign in with a verified Google account to access this resource.',
      accessDenied: true,
    });
  }

  // Check email approval status in Firestore / AccessControl
  const entry = await accessControlService.getEntry(userEmail);

  if (!entry || !entry.approved) {
    return res.status(403).json({
      error: 'Access Restricted',
      message: 'Your email address has not been approved by the administrator. Please contact the administrator to request access.',
      accessDenied: true,
      email: userEmail,
      approved: false,
    });
  }

  // Attach verified access metadata to request
  req.accessControl = entry;

  // Sync role to user document in database
  const user = getAuthenticatedUser(req);
  if (user && entry.role === 'admin' && user.role !== 'admin') {
    db.updateUser(user.id, { role: 'admin' });
  }

  return next();
};

const requireAdmin = async (req: Request & { user?: any; accessControl?: any }, res: Response, next: NextFunction) => {
  try {
    const userEmail = normalizeEmail(req.user?.email);
    if (!userEmail) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isAdmin = await accessControlService.isAdmin(userEmail);
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Access denied: Institutional Administrator privileges required.',
        email: userEmail,
      });
    }

    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }
};

function sanitizeQuestionsForStudent(questions: Question[]): any[] {
  return questions.map(q => {
    const { correctAnswerId, explanation, ...sanitized } = q;
    if (sanitized.codingDetails) {
      const { hiddenTestCases, ...safeCodingDetails } = sanitized.codingDetails;
      return {
        ...sanitized,
        codingDetails: safeCodingDetails,
      };
    }
    return sanitized;
  });
}

apiRouter.use(requireAuthenticatedUser);

// Health check endpoint
apiRouter.get(['/health', '/healthz'], (_req: Request, res: Response) => {
  const storageInfo = (db as any).getStorageDiagnostic?.() || {};
  const firestoreInfo = getFirestoreDiagnostic();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node',
    storage: storageInfo,
    firestore: firestoreInfo,
  });
});

// Database and cloud persistence status endpoint for Vercel troubleshooting
apiRouter.get('/system/db-status', (_req: Request, res: Response) => {
  const storageInfo = (db as any).getStorageDiagnostic?.() || {};
  const firestoreInfo = getFirestoreDiagnostic();
  res.status(200).json({
    status: 'ok',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node',
    storage: storageInfo,
    firestore: firestoreInfo,
    persistenceHealth: {
      isPersistent: firestoreInfo.isAvailable,
      mode: firestoreInfo.isAvailable ? 'firebase_firestore_cloud' : 'ephemeral_local_cache',
      recommendation: firestoreInfo.isAvailable
        ? 'Database is fully connected to Cloud Firestore. Changes are permanently persisted.'
        : 'Running in ephemeral serverless cache mode. To enable permanent database persistence across Vercel deployments, configure FIREBASE_SERVICE_ACCOUNT_JSON in Vercel project environment variables.',
    },
    vercelSetupInstructions: [
      '1. Open Firebase Console (https://console.firebase.google.com).',
      '2. Navigate to Project Settings -> Service accounts.',
      '3. Click "Generate new private key" to download the JSON credentials file.',
      '4. Open your Vercel Dashboard -> Project -> Settings -> Environment Variables.',
      '5. Add a new variable named FIREBASE_SERVICE_ACCOUNT_JSON and paste the entire JSON content.',
      '6. Alternatively, add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY as separate variables.',
      '7. Redeploy your project in Vercel.',
    ],
  });
});

// Access-check endpoint for frontend verification without failing with 403
apiRouter.get('/auth/check-access', async (req: Request & { user?: any }, res: Response) => {
  try {
    const queryEmail = req.query.email as string | undefined;
    const rawEmail = queryEmail || req.user?.email;
    const userEmail = normalizeEmail(rawEmail);

    if (!userEmail) {
      return res.status(200).json({
        authenticated: false,
        approved: false,
        role: 'user',
        email: null,
        message: 'No email provided for access check',
      });
    }

    const entry = await accessControlService.getEntry(userEmail);
    const approved = Boolean(entry && entry.approved);
    const role = entry?.role === 'admin' ? 'admin' : 'user';

    return res.status(200).json({
      authenticated: Boolean(req.user?.email || req.user?.uid),
      approved,
      role,
      email: userEmail,
      approvedAt: entry?.approvedAt || null,
      notes: entry?.notes || '',
      message: approved
        ? 'Email is authorized for assessment and learning features.'
        : 'Your email address has not been approved by the administrator. Please contact the administrator to request access.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Access check failed' });
  }
});

// Quick live verification for frontend as user types
apiRouter.post('/auth/verify-email-access', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userEmail = normalizeEmail(email);
    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const entry = await accessControlService.getEntry(userEmail);
    const approved = Boolean(entry && entry.approved);
    const role = entry?.role === 'admin' ? 'admin' : 'user';

    return res.json({
      email: userEmail,
      approved,
      role,
      notes: entry?.notes || '',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

// Real-time direct email login for approved institutional users & admins
apiRouter.post('/auth/email-login', async (req: Request, res: Response) => {
  try {
    const { email, rolePreference } = req.body;
    const userEmail = normalizeEmail(email);

    if (!userEmail) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const entry = await accessControlService.getEntry(userEmail);
    if (!entry || !entry.approved) {
      return res.status(403).json({
        error: 'Access Restricted',
        message: 'Your email address has not been approved by the administrator. Please contact the administrator to request access.',
        accessDenied: true,
        email: userEmail,
        approved: false,
      });
    }

    const role = entry.role === 'admin' ? 'admin' : (rolePreference === 'admin' ? 'admin' : 'student');
    let user = db.getUserByEmail(userEmail);

    if (!user) {
      const generatedUid = `usr_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      user = db.createUser({
        id: generatedUid,
        firebaseUid: generatedUid,
        name: userEmail.split('@')[0],
        email: userEmail,
        role,
        college: 'Bannari Amman Institute of Technology',
        department: 'Computer Science & Engineering',
        educationLevel: 'B.Tech / B.E.',
        yearOfStudy: '3rd Year',
        experienceLevel: 'Intermediate',
        targetJobRole: role === 'admin' ? 'Curriculum Administrator' : 'Full Stack Software Developer',
        onboardingCompleted: true,
      });
    } else if (entry.role === 'admin' && user.role !== 'admin') {
      user = db.updateUser(user.id, { role: 'admin' }) || user;
    }

    // Generate standard JWT payload parsed by verifyFirebaseToken
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.id,
        uid: user.id,
        user_id: user.id,
        email: user.email,
        email_verified: true,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 3600,
      })
    ).toString('base64url');
    const token = `${header}.${payload}.sig`;

    return res.json({
      success: true,
      token,
      user,
      role: user.role,
      accessControl: entry,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Enforce email-approval gate across all remaining protected routes
apiRouter.use(requireApprovedEmail);

// --- AUTH & PROFILE ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, firebaseUid, name, picture } = req.body;
  if (!firebaseUid && !email) {
    return res.status(400).json({ error: 'Firebase UID or email is required.' });
  }

  const user = db.upsertUserFromFirebase({
    firebaseUid: firebaseUid || `fb_${Date.now()}`,
    name: name || (email ? email.split('@')[0] : 'Learner'),
    email: email || `${firebaseUid}@firebase.local`,
    avatar: picture,
    role: email?.toLowerCase().includes('admin') ? 'admin' : 'student',
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  });

  res.json({ success: true, user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, college, educationLevel, department, yearOfStudy, experienceLevel, targetJobRole, preferredLearningStyle, dailyAvailableTime, careerGoal } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    const updated = db.updateUser(existing.id, {
      name,
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
    return res.json({ success: true, user: updated });
  }

  const newUser = db.createUser({
    name,
    email,
    college,
    educationLevel,
    department,
    yearOfStudy,
    experienceLevel: experienceLevel || 'Beginner',
    targetJobRole,
    preferredLearningStyle,
    dailyAvailableTime,
    careerGoal,
    onboardingCompleted: false,
    role: email.toLowerCase().includes('admin') ? 'admin' : 'student',
  });

  res.json({ success: true, user: newUser });
});

apiRouter.get('/auth/me', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

apiRouter.post('/auth/survey', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { experienceLevel, programmingExposure, careerGoal, dailyAvailableTime, skillConfidence } = req.body;

    const updated = db.updateUser(user.id, {
      experienceLevel,
      careerGoal,
      dailyAvailableTime,
      skillConfidence: skillConfidence || {},
      onboardingCompleted: true,
    });

    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

apiRouter.put('/auth/profile', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { updates } = req.body;
    const updated = db.updateUser(user.id, updates);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

// --- SKILLS & TOPICS ---
apiRouter.get('/skills', (req: Request & { user?: any }, res: Response) => {
  try {
    const firebaseUid = req.user?.uid || (req.query?.userId as string);
    const user = firebaseUid ? (db.getUserByFirebaseUid(firebaseUid) || db.getUserById(firebaseUid)) : undefined;
    const skills = db.getAllSkills(user?.id);
    res.json({ skills });
  } catch (error: any) {
    console.error('Error fetching skills:', error);
    res.json({ skills: db.getAllSkills() });
  }
});

apiRouter.get('/skills/:id/topics', (req: Request, res: Response) => {
  const skill = db.getSkillById(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  res.json({ topics: skill.topics });
});

// --- ASSESSMENTS ---
apiRouter.post('/assessment/start', (req: Request, res: Response) => {
  const { skillId, topicIds, questionCount } = req.body;
  if (!skillId) return res.status(400).json({ error: 'skillId is required' });

  const count = typeof questionCount === 'number' && questionCount > 0 ? questionCount : 8;
  const questions = db.generateAdaptiveAssessmentQuestions(skillId, topicIds, count);
  res.json({
    skillId,
    totalQuestions: questions.length,
    questions,
  });
});

apiRouter.post('/assessment/submit', async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { skillId, responses, durationSeconds } = req.body;
    if (!skillId || !responses) {
      return res.status(400).json({ error: 'Missing required assessment submission payload' });
    }

    const result = await db.submitAssessment({
      userId: user.id,
      skillId,
      responses,
      durationSeconds: durationSeconds || 120,
    });

    res.json(result);
  } catch (error) {
    console.error('Assessment submit error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process assessment',
    });
  }
});

apiRouter.get('/assessment/:id/result', (req: Request & { user?: any }, res: Response) => {
  const asm = db.getAssessmentById(req.params.id);
  const user = getAuthenticatedUser(req);
  if (!asm || asm.userId !== user.id) return res.status(404).json({ error: 'Assessment not found' });

  const insight = asm.aiInsightId ? db.getAIInsightById(asm.aiInsightId) : null;
  res.json({ assessment: asm, insight });
});

apiRouter.get('/assessment/history', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const history = db.getUserAssessments(user.id);
    res.json({ history });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

// --- AI INSIGHTS & ROADMAPS ---
apiRouter.get('/ai/insights', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const insights = db.getUserAIInsights(user.id);
    res.json({ insights });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch insights' });
  }
});

apiRouter.get('/ai/insight/:id', (req: Request & { user?: any }, res: Response) => {
  const insight = db.getAIInsightById(req.params.id);
  const user = getAuthenticatedUser(req);
  if (!insight || insight.userId !== user.id) return res.status(404).json({ error: 'AI Insight not found' });
  res.json({ insight });
});

apiRouter.post('/ai/diagnose-skill', async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { skillId, skillName, currentLevel, selfConfidence, focusTopics, notes } = req.body;

    const skill = db.getSkillById(skillId);
    const targetSkillName = skillName || skill?.name || skillId || 'Software Development';

    const analysis = await generateSkillDiagnosticInsightWithAI({
      skillName: targetSkillName,
      currentLevel: currentLevel || user.experienceLevel || 'Intermediate',
      userCareerGoal: user.careerGoal || 'Software Engineer',
      userExperience: user.experienceLevel || 'Student / Learner',
      selfConfidence: selfConfidence || user.skillConfidence?.[skillId] || 3,
      focusTopics: focusTopics || (skill?.topics || []).map(t => t.name),
      notes,
    });

    const insightId = `insight-diag-${user.id}-${Date.now()}`;
    const newInsight = {
      ...analysis,
      id: insightId,
      assessmentId: `ondemand-${skillId || 'gen'}-${Date.now()}`,
      userId: user.id,
      generatedAt: new Date().toISOString(),
    };

    db.saveAIInsight(newInsight);

    // Award XP for running deep diagnostic
    db.updateUser(user.id, {
      xp: (user.xp || 0) + 75,
      lastActiveDate: new Date().toISOString().split('T')[0],
    });

    res.json({ insight: newInsight, xpGained: 75 });
  } catch (error: any) {
    console.error('Error in /ai/diagnose-skill:', error);
    res.status(500).json({ error: error.message || 'Failed to generate diagnostic insight' });
  }
});

apiRouter.post('/ai/deep-dive', async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { skillName, topicOrGap, type } = req.body;
    if (!topicOrGap) {
      return res.status(400).json({ error: 'topicOrGap is required' });
    }

    const deepDive = await generateGapDeepDiveWithAI({
      skillName: skillName || 'Computer Science',
      topicOrGap,
      type: type || 'gap',
      studentLevel: user.experienceLevel || 'Intermediate',
    });

    res.json({ deepDive });
  } catch (error: any) {
    console.error('Error in /ai/deep-dive:', error);
    res.status(500).json({ error: error.message || 'Deep dive unavailable' });
  }
});

apiRouter.post('/ai/analyze', async (req: Request, res: Response) => {
  try {
    const analysis = await analyzeAssessmentWithAI(req.body);
    res.json({ insight: analysis });
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

apiRouter.post('/ai/roadmap', async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { skillId, skillName, currentLevel } = req.body;
    const latestAssessment = db.getUserAssessments(user.id).find(assessment => assessment.skillId === skillId);
    if (!latestAssessment) {
      return res.status(400).json({ error: 'Complete an assessment before generating a roadmap.' });
    }
    const roadmapData = await generateRoadmapWithAI({
      skillName,
      currentLevel: latestAssessment.classifiedLevel || currentLevel,
      weakTopics: latestAssessment.weakTopics,
      strongTopics: latestAssessment.strongTopics,
      careerGoal: user.careerGoal,
      dailyAvailableTime: user.dailyAvailableTime,
    });

    const key = `${user.id}-${skillId}`;
    const newRoadmap = {
      ...roadmapData,
      id: `rdm-${Date.now()}`,
      userId: user.id,
      skillId,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.roadmaps.set(key, newRoadmap);

    res.json({ roadmap: newRoadmap });
  } catch (error) {
    console.error('AI roadmap error:', error);
    res.status(500).json({ error: 'Roadmap generation failed' });
  }
});

apiRouter.get('/roadmap/:skillId', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const skillId = req.params.skillId;
    let roadmap = db.getRoadmap(user.id, skillId);

    if (!roadmap) {
      const skill = db.getSkillById(skillId);
      const skillName = skill ? skill.name : skillId.toUpperCase();
      const currentLevel: SkillLevel = (user.experienceLevel || 'Beginner') as SkillLevel;
      const targetLevel: SkillLevel = currentLevel === 'Beginner' ? 'Basic' : currentLevel === 'Basic' ? 'Intermediate' : currentLevel === 'Intermediate' ? 'Advanced' : 'Expert';
      const topicsList = (skill?.topics || []).map(t => t.name);

      const starterMilestones = [
        {
          id: `m-${skillId}-1`,
          weekNumber: 1,
          title: `Solidify ${skillName} Core Fundamentals`,
          description: `Master fundamental syntax, standard library idioms, and problem patterns in ${skillName}.`,
          topics: topicsList.slice(0, 2).length > 0 ? topicsList.slice(0, 2) : ['Syntax & Data Types', 'Control Flow'],
          learningResources: [
            { title: `${skillName} Official Documentation & Tour`, type: 'Documentation' as const, duration: '45 mins' },
            { title: `${skillName} Foundational Patterns Guide`, type: 'Guide' as const, duration: '30 mins' },
          ],
          practiceExercise: {
            title: `Hands-on ${skillName} Core Implementation Drill`,
            task: `Implement core data structures and error handling using canonical idioms.`,
            difficulty: currentLevel,
          },
          miniProject: {
            title: `CLI Utility & Data Transformer`,
            description: `Build a clean command-line data processing pipeline validating input streams.`,
          },
          completed: false,
        },
        {
          id: `m-${skillId}-2`,
          weekNumber: 2,
          title: `Intermediate Architecture & Data Structures`,
          description: `Implement modular design patterns, concurrency basics, and optimal algorithms.`,
          topics: topicsList.slice(2, 4).length > 0 ? topicsList.slice(2, 4) : ['Data Structures', 'Modular Architecture'],
          learningResources: [
            { title: `High Performance ${skillName} Deep Dive`, type: 'Guide' as const, duration: '60 mins' },
            { title: `Design Patterns in ${skillName}`, type: 'Documentation' as const, duration: '45 mins' },
          ],
          practiceExercise: {
            title: `Refactor Legacy Module with Clean Design`,
            task: `Refactor tightly-coupled logic into decoupled, testable components.`,
            difficulty: 'Intermediate' as SkillLevel,
          },
          miniProject: {
            title: `Real-time Cache & In-Memory Store`,
            description: `Implement an LRU cache with eviction policies and concurrency safety.`,
          },
          completed: false,
        },
        {
          id: `m-${skillId}-3`,
          weekNumber: 3,
          title: `Advanced Performance & Edge Case Optimization`,
          description: `Master profiling, memory management, and asynchronous streams.`,
          topics: topicsList.slice(4, 6).length > 0 ? topicsList.slice(4, 6) : ['Async I/O', 'Optimization & Testing'],
          learningResources: [
            { title: `Benchmarking and Memory Profiling Guide`, type: 'Guide' as const, duration: '50 mins' },
            { title: `Automated Test Suites & Mocking`, type: 'Documentation' as const, duration: '40 mins' },
          ],
          practiceExercise: {
            title: `Bottleneck Profiling & Asynchronous Flow`,
            task: `Identify 3 performance bottlenecks and rewrite with asynchronous worker pools.`,
            difficulty: 'Advanced' as SkillLevel,
          },
          miniProject: {
            title: `High-Throughput Event Processor`,
            description: `Build an asynchronous event ingestion worker handling 5k ops/sec with backpressure.`,
          },
          completed: false,
        },
        {
          id: `m-${skillId}-4`,
          weekNumber: 4,
          title: `Production Capstone & Interview Mastery`,
          description: `Build and deploy an enterprise-ready microservice with full test coverage and monitoring.`,
          topics: ['System Design', 'Production Readiness', 'Interview Drills'],
          learningResources: [
            { title: `Production Checklist & SRE Best Practices`, type: 'Documentation' as const, duration: '60 mins' },
            { title: `Technical Interview Coding Challenges`, type: 'Practice' as const, duration: '90 mins' },
          ],
          practiceExercise: {
            title: `System Architecture Simulation`,
            task: `Design end-to-end telemetry and rate limiting for multi-tenant services.`,
            difficulty: 'Expert' as SkillLevel,
          },
          miniProject: {
            title: `Production Ready Service with Health Metrics`,
            description: `Finalize a comprehensive service with structured logging, Docker configuration, and unit test suites.`,
          },
          completed: false,
        },
      ];

      roadmap = {
        id: `rdm-${skillId}-${Date.now()}`,
        userId: user.id,
        skillId,
        skillName,
        currentLevel,
        targetLevel,
        estimatedWeeks: 4,
        totalMilestones: starterMilestones.length,
        completedMilestones: 0,
        milestones: starterMilestones,
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.roadmaps.set(`${user.id}-${skillId}`, roadmap);
    }

    res.json({ roadmap });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load roadmap' });
  }
});

apiRouter.post('/roadmap/:skillId/toggle-milestone', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { milestoneId } = req.body;
    const result = db.toggleRoadmapMilestone(user.id, req.params.skillId, milestoneId);
    if (!result) {
      return res.status(404).json({ error: 'Roadmap or milestone not found' });
    }
    res.json({
      success: true,
      roadmap: result.roadmap,
      user: result.user,
      xpGained: result.xpGained,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

// --- AI QUESTION GENERATOR ---
apiRouter.post('/ai/generate-question', async (req: Request, res: Response) => {
  try {
    const { skillName, topicName, targetDifficulty, questionType } = req.body;
    const generated = await generateAdaptiveQuestionWithAI({
      skillName,
      topicName,
      targetDifficulty,
      questionType,
    });
    db.addQuestion(generated);
    res.json({ question: generated });
  } catch (error) {
    console.error('AI question generation error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// --- AI TUTOR ---
apiRouter.post('/ai/tutor', async (req: Request, res: Response) => {
  try {
    const { message, chatHistory, userContext } = req.body;
    const answer = await askAITutor({
      message,
      chatHistory: chatHistory || [],
      userContext: userContext || { name: 'Learner' },
    });
    res.json({ reply: answer });
  } catch (error) {
    console.error('AI Tutor error:', error);
    res.status(500).json({ error: 'AI Tutor service unavailable' });
  }
});

// --- ACHIEVEMENTS & GAMIFICATION ---
apiRouter.get('/achievements', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const achievements = db.getUserAchievements(user.id);
    res.json({ achievements });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

// --- PROGRESS ANALYTICS ---
apiRouter.get('/progress', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const assessments = db.getUserAssessments(user.id);
    const skills = db.getAllSkills(user.id);

  const totalAssessments = assessments.length;
  const averageScore = totalAssessments > 0
    ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / totalAssessments)
    : 0;

  // Compute skill progress list
  const skillProgressList = skills.map(skill => {
    const skillAsms = assessments.filter(a => a.skillId === skill.id);
    const lastScore = skillAsms[0]?.score || 0;
    const prevScore = skillAsms[1]?.score || lastScore;
    const delta = lastScore - prevScore;

    return {
      skillId: skill.id,
      skillName: skill.name,
      level: (skillAsms[0]?.classifiedLevel || 'Beginner') as any,
      score: lastScore,
      delta,
      assessmentCount: skillAsms.length,
    };
  });

  const assessmentTimeline = assessments
    .slice()
    .reverse()
    .map(a => ({
      date: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: a.score,
      skillName: a.skillName,
    }));

  const latestTopicScores = assessments.reduce((topics, assessment) => {
    for (const topic of assessment.topicScores) {
      if (!topics.has(`${assessment.skillId}:${topic.topicId}`)) {
        topics.set(`${assessment.skillId}:${topic.topicId}`, {
          topicName: topic.topicName,
          skillName: assessment.skillName,
          score: topic.percentage,
          status: topic.percentage >= 80 ? 'Mastered' : topic.percentage >= 50 ? 'Developing' : 'Needs Attention',
        });
      }
    }
    return topics;
  }, new Map<string, { topicName: string; skillName: string; score: number; status: 'Mastered' | 'Developing' | 'Needs Attention' }> ());
  const topicProficiency = Array.from(latestTopicScores.values());
  const growthValues = skillProgressList.filter(item => item.assessmentCount > 1).map(item => item.delta);
  const overallGrowthPercentage = growthValues.length > 0
    ? Math.round(growthValues.reduce((sum, delta) => sum + delta, 0) / growthValues.length)
    : 0;

    res.json({
      totalAssessments,
      averageScore,
      overallGrowthPercentage,
      totalXp: user?.xp || 0,
      streakDays: user?.streakDays || 0,
      skillsMasteredCount: skillProgressList.filter(s => s.score >= 70).length,
      skillProgressList,
      assessmentTimeline,
      topicProficiency,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

// --- ADMIN DASHBOARD ---
apiRouter.get('/admin/stats', (req: Request, res: Response) => {
  const stats = db.getAdminStats();
  res.json(stats);
});

apiRouter.get('/admin/users', (_req: Request, res: Response) => {
  const users = db.getAllUsers();
  res.json({ users });
});

apiRouter.post('/admin/users', requireAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { name, email, role, department, college, yearOfStudy } = req.body;
    const normEmail = normalizeEmail(email);

    if (!normEmail || !name) {
      return res.status(400).json({ error: 'Name and a valid Email address are required.' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';

    // 1. Whitelist in Access Control immediately
    await accessControlService.setApproval(normEmail, {
      approved: true,
      role: assignedRole === 'admin' ? 'admin' : 'user',
      approvedBy: adminUser.email || adminUser.id,
      notes: department || 'Added via Admin Users Portal',
    });

    // 2. Create or update user in database
    let existing = db.getUserByEmail(normEmail);
    let user;
    if (existing) {
      user = db.updateUser(existing.id, {
        name,
        email: normEmail,
        role: assignedRole,
        department: department || existing.department,
        college: college || existing.college,
        yearOfStudy: yearOfStudy || existing.yearOfStudy,
      });
    } else {
      const generatedUid = `usr_${normEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      user = db.createUser({
        id: generatedUid,
        firebaseUid: generatedUid,
        name,
        email: normEmail,
        role: assignedRole,
        department: department || 'Computer Science & Engineering',
        college: college || 'Bannari Amman Institute of Technology',
        yearOfStudy: yearOfStudy || '3rd Year',
        experienceLevel: 'Intermediate',
        targetJobRole: assignedRole === 'admin' ? 'Curriculum Administrator' : 'Software Engineer',
        onboardingCompleted: true,
      });
    }

    db.recordAuditLog(
      adminUser,
      'CREATE_OR_ENROLL_USER',
      'Users',
      normEmail,
      `Enrolled/Approved user ${name} (${normEmail}) with role ${assignedRole}`
    );

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create user' });
  }
});

apiRouter.put('/admin/users/:id', requireAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const userId = req.params.id;
    const { name, email, role, department, college, yearOfStudy, approveNow } = req.body;

    const existingUser = db.getUserById(userId) || db.getUserByEmail(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldEmail = normalizeEmail(existingUser.email);
    const newEmail = email ? normalizeEmail(email) : oldEmail;
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    // If email changed or approveNow requested, update Access Control
    if (newEmail) {
      await accessControlService.setApproval(newEmail, {
        approved: approveNow !== undefined ? Boolean(approveNow) : true,
        role: assignedRole === 'admin' ? 'admin' : 'user',
        approvedBy: adminUser.email || adminUser.id,
        notes: department || existingUser.department || 'Updated via Admin Portal',
      });
    }

    const updated = db.updateUser(existingUser.id, {
      ...(name ? { name } : {}),
      ...(email ? { email: newEmail } : {}),
      ...(role ? { role: assignedRole } : {}),
      ...(department !== undefined ? { department } : {}),
      ...(college !== undefined ? { college } : {}),
      ...(yearOfStudy !== undefined ? { yearOfStudy } : {}),
    });

    db.recordAuditLog(
      adminUser,
      'UPDATE_USER',
      'Users',
      newEmail || existingUser.id,
      `Updated user profile for ${newEmail} (Role: ${assignedRole})`
    );

    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update user' });
  }
});

apiRouter.post('/admin/users/:id/approve-email', requireAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const userId = req.params.id;
    const targetUser = db.getUserById(userId) || db.getUserByEmail(userId);

    if (!targetUser || !targetUser.email) {
      return res.status(404).json({ error: 'User or user email not found' });
    }

    const normEmail = normalizeEmail(targetUser.email);
    const entry = await accessControlService.setApproval(normEmail, {
      approved: true,
      role: targetUser.role === 'admin' ? 'admin' : 'user',
      approvedBy: adminUser.email || adminUser.id,
      notes: targetUser.department || 'Approved via Student Directory',
    });

    db.recordAuditLog(
      adminUser,
      'APPROVE_USER_EMAIL',
      'Users',
      normEmail,
      `Quick-approved access for enrolled student ${normEmail}`
    );

    res.json({ success: true, entry, user: targetUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to approve email' });
  }
});

apiRouter.get('/admin/questions', (req: Request, res: Response) => {
  const skillId = req.query.skillId as string | undefined;
  const questions = db.getQuestions({ skillId });
  res.json({ questions });
});

apiRouter.post('/admin/questions', (req: Request, res: Response) => {
  const question = req.body;
  if (!question.question || !question.skillId) {
    return res.status(400).json({ error: 'Missing question details' });
  }
  const created = db.addQuestion({
    ...question,
    id: `q-admin-${Date.now()}`,
  });
  res.json({ success: true, question: created });
});

apiRouter.put('/admin/questions/:id', (req: Request, res: Response) => {
  const updated = db.updateQuestion(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Question not found' });
  res.json({ success: true, question: updated });
});

apiRouter.post('/admin/questions/:id/flag', (req: Request, res: Response) => {
  const flagged = req.body.flagged ?? true;
  const success = db.toggleFlagQuestion(req.params.id, flagged);
  res.json({ success });
});

// --- STUDENT TEST PORTAL & DISCOVERY ---
apiRouter.get('/tests', (req: Request & { user?: any }, res: Response) => {
  try {
    const { category, status, search } = req.query as { category?: string; status?: string; search?: string };
    const configs = db.getAssessmentConfigs({ category, status, search });

    let userId: string | null = null;
    try {
      const user = getAuthenticatedUser(req);
      userId = user.id;
    } catch (e) {}

    // Enhance with attempt status for this student
    const result = configs.map(cfg => {
      let attemptStatus: 'available' | 'in_progress' | 'completed' | 'upcoming' | 'limit_reached' = 'available';
      let userAttemptCount = 0;
      let lastScore: number | undefined;

      if (cfg.status === 'upcoming') {
        attemptStatus = 'upcoming';
      } else if (userId) {
        const attempts = db.getUserAttempts(userId, cfg.id);
        userAttemptCount = attempts.length;
        const inProgress = attempts.find(a => a.status === 'in_progress');
        const completed = attempts.filter(a => a.status === 'submitted' || a.status === 'evaluated');

        if (inProgress) {
          attemptStatus = 'in_progress';
        } else if (completed.length >= cfg.maxAttempts) {
          attemptStatus = 'limit_reached';
          lastScore = completed[0]?.score;
        } else if (completed.length > 0) {
          attemptStatus = 'completed';
          lastScore = completed[0]?.score;
        }
      }

      return {
        ...cfg,
        attemptStatus,
        userAttemptCount,
        lastScore,
      };
    });

    res.json({ tests: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list tests' });
  }
});

apiRouter.get('/tests/:id', (req: Request & { user?: any }, res: Response) => {
  const config = db.getAssessmentConfigById(req.params.id);
  if (!config) return res.status(404).json({ error: 'Assessment not found' });

  let userAttempts: any[] = [];
  try {
    const user = getAuthenticatedUser(req);
    userAttempts = db.getUserAttempts(user.id, config.id);
  } catch (e) {}

  res.json({
    test: config,
    userAttempts,
  });
});

// --- RELIABLE EXAMINATION ENGINE ---
apiRouter.post('/tests/:id/start', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const sebHeader = (req.headers['user-agent'] || req.headers['x-safexambrowser-requesthash'] || '') as string;
    const { attempt, questions, isResumed } = db.startOrResumeAttempt(req.params.id, user, { sebHeader });

    res.json({
      attempt,
      questions: sanitizeQuestionsForStudent(questions),
      isResumed,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to start assessment' });
  }
});

// Reattempt endpoint: starts a verified new attempt (attempt #2, #3, etc.)
apiRouter.post('/tests/:id/reattempt', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const sebHeader = (req.headers['user-agent'] || req.headers['x-safexambrowser-requesthash'] || '') as string;
    const { attempt, questions, isResumed } = db.startOrResumeAttempt(req.params.id, user, {
      sebHeader,
      isReattempt: true,
    });

    res.json({
      attempt,
      questions: sanitizeQuestionsForStudent(questions),
      isResumed,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to start reattempt' });
  }
});

// Query eligible reattempts for student
apiRouter.get('/tests/reattempts/eligible', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const eligibleReattempts = db.getEligibleReattempts(user.id);
    res.json({ eligibleReattempts });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch eligible reattempts' });
  }
});

// Safe Exam Browser .seb configuration file generator
apiRouter.get('/tests/:id/seb-config', (req: Request, res: Response) => {
  try {
    const config = db.getAssessmentConfigById(req.params.id);
    if (!config) return res.status(404).json({ error: 'Assessment not found' });

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const xmlConfig = db.generateSebConfigFile(config, baseUrl);
    res.setHeader('Content-Type', 'application/seb');
    res.setHeader('Content-Disposition', `attachment; filename="${config.id}-lockdown.seb"`);
    res.send(xmlConfig);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate SEB configuration' });
  }
});

// Record violation during active exam lockdown
apiRouter.post('/tests/attempt/:attemptId/violation', async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { type, details } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Violation type is required' });
    }

    const result = await db.recordViolation(
      req.params.attemptId,
      user.id,
      type,
      details || 'Examination lockdown violation detected'
    );

    res.json(result);
  } catch (error: any) {
    console.error('Record violation error:', error);
    res.status(400).json({ error: error.message || 'Failed to log violation' });
  }
});

apiRouter.post('/tests/attempt/:attemptId/autosave', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { answers, flagged, codeSubmissions, timeSpentSeconds } = req.body;
    const result = db.autosaveAttempt(req.params.attemptId, user.id, {
      answers,
      flagged,
      codeSubmissions,
      timeSpentSeconds,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Autosave failed' });
  }
});

apiRouter.post('/tests/attempt/:attemptId/submit', async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { answers, durationSeconds, codeSubmissions } = req.body;

    const result = await db.submitAttempt(
      req.params.attemptId,
      user.id,
      answers || {},
      durationSeconds || 60,
      codeSubmissions
    );

    res.json(result);
  } catch (error: any) {
    console.error('Submit attempt error:', error);
    res.status(400).json({ error: error.message || 'Failed to submit test' });
  }
});

apiRouter.get('/tests/attempt/:attemptId', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const attempt = db.getAttemptById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    // Only allow attempt owner or admin
    if (attempt.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden to this attempt.' });
    }

    const config = db.getAssessmentConfigById(attempt.assessmentId);
    const asm = db.assessments.get(`asm-${attempt.id}`) || Array.from(db.assessments.values()).find(a => a.id === `asm-${attempt.id}`);
    const insight = asm?.aiInsightId ? db.aiInsights.get(asm.aiInsightId) : null;

    res.json({
      attempt,
      config,
      assessmentResult: asm,
      insight,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

// Interactive Coding Test Execution Sandbox
apiRouter.post('/tests/coding/run', async (req: Request, res: Response) => {
  try {
    const { language, code, questionId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No code provided.' });
    }

    const question = db.questions.get(questionId);
    if (!question || !question.codingDetails) {
      return res.status(400).json({ error: 'Invalid coding question.' });
    }

    // Only run sample test cases during interactive testing!
    const sampleCases = question.codingDetails.sampleTestCases;
    const execResult = await executeSandboxedCode({
      language: language || 'javascript',
      code,
      testCases: sampleCases,
    });

    res.json(execResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Code execution failed' });
  }
});

// --- NOTIFICATIONS ---
apiRouter.get('/notifications', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const notifications = db.getUserNotifications(user.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

apiRouter.post('/notifications/:id/read', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const success = db.markNotificationRead(user.id, req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

apiRouter.post('/notifications/read-all', (req: Request & { user?: any }, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const success = db.markAllNotificationsRead(user.id);
    res.json({ success });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
});

// --- ADMIN ASSESSMENT & EXAM MANAGEMENT ---
apiRouter.get('/admin/assessments', requireAdmin, (_req: Request, res: Response) => {
  const configs = Array.from(db.assessmentConfigs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ assessments: configs });
});

apiRouter.post('/admin/assessments', requireAdmin, (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const created = db.createAssessmentConfig(req.body, adminUser);
    res.json({ success: true, assessment: created });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create assessment' });
  }
});

apiRouter.put('/admin/assessments/:id', requireAdmin, (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const updated = db.updateAssessmentConfig(req.params.id, req.body, adminUser);
    if (!updated) return res.status(404).json({ error: 'Assessment not found' });
    res.json({ success: true, assessment: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update assessment' });
  }
});

apiRouter.post('/admin/assessments/:id/duplicate', requireAdmin, (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const duplicate = db.duplicateAssessmentConfig(req.params.id, adminUser);
    if (!duplicate) return res.status(404).json({ error: 'Assessment not found' });
    res.json({ success: true, assessment: duplicate });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to duplicate assessment' });
  }
});

apiRouter.delete('/admin/assessments/:id', requireAdmin, (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const success = db.archiveAssessmentConfig(req.params.id, adminUser);
    res.json({ success });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to archive assessment' });
  }
});

apiRouter.post('/admin/questions/import', requireAdmin, (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { questions: incomingQuestions, format } = req.body;

    if (!Array.isArray(incomingQuestions)) {
      return res.status(400).json({ error: 'Expected an array of question objects.' });
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < incomingQuestions.length; i++) {
      const q = incomingQuestions[i];
      if (!q.question || !q.skillId || !q.correctAnswerId) {
        errors.push(`Row ${i + 1}: Missing required fields (question, skillId, correctAnswerId).`);
        continue;
      }

      const qId = q.id || `q-imp-${Date.now()}-${i}`;
      db.addQuestion({
        ...q,
        id: qId,
        questionType: q.questionType || 'MCQ',
        difficulty: q.difficulty || 'Intermediate',
        options: q.options || [
          { id: 'opt1', text: 'Option A' },
          { id: 'opt2', text: 'Option B' },
        ],
        explanation: q.explanation || 'No explanation provided.',
      });
      importedCount++;
    }

    db.recordAuditLog(
      adminUser,
      'IMPORT_QUESTIONS',
      'QuestionBank',
      `bulk-${importedCount}`,
      `Imported ${importedCount} questions via ${format || 'JSON'}`
    );

    res.json({
      success: true,
      importedCount,
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Import failed' });
  }
});

apiRouter.get('/admin/assessments/:id/report', requireAdmin, (req: Request, res: Response) => {
  try {
    const csvData = db.exportAssessmentReportCsv(req.params.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="assessment-report-${req.params.id}.csv"`);
    res.send(csvData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

apiRouter.get('/admin/attempts', requireAdmin, (req: Request, res: Response) => {
  const assessmentId = req.query.assessmentId as string | undefined;
  const attempts = db.getAllAttempts(assessmentId);
  res.json({ attempts });
});

apiRouter.get('/admin/violations', requireAdmin, (_req: Request, res: Response) => {
  try {
    const violationData = db.getAllViolations();
    res.json(violationData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list violations' });
  }
});

apiRouter.post('/admin/attempts/:attemptId/reset-violations', requireAdmin, (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { reason } = req.body;
    const result = db.resetAttemptViolations(req.params.attemptId, adminUser, reason);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to reset violations' });
  }
});

apiRouter.get('/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  const logs = db.getAuditLogs(100);
  res.json({ logs });
});

// --- ADMIN ACCESS CONTROL ENDPOINTS ---
apiRouter.get('/admin/access-control', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const list = await accessControlService.listAll();
    res.json({ accessList: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list access control entries' });
  }
});

apiRouter.post('/admin/access-control/approve', requireAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { email, role, notes } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'user';
    const entry = await accessControlService.setApproval(email, {
      approved: true,
      role: assignedRole,
      approvedBy: adminUser.email || adminUser.id,
      notes: notes || '',
    });

    // Record audit log
    db.recordAuditLog(
      adminUser,
      'APPROVE_USER_EMAIL',
      'AccessControl',
      normalizeEmail(email),
      `Approved access with role "${assignedRole}" for ${normalizeEmail(email)}`
    );

    res.json({ success: true, entry });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to approve email' });
  }
});

apiRouter.post('/admin/access-control/revoke', requireAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const success = await accessControlService.revokeApproval(email, adminUser.email || adminUser.id);

    db.recordAuditLog(
      adminUser,
      'REVOKE_USER_EMAIL',
      'AccessControl',
      normalizeEmail(email),
      `Revoked access for ${normalizeEmail(email)}`
    );

    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to revoke email' });
  }
});

apiRouter.delete('/admin/access-control/:email', requireAdmin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const success = await accessControlService.deleteEntry(email);

    db.recordAuditLog(
      adminUser,
      'DELETE_ACCESS_ENTRY',
      'AccessControl',
      normalizeEmail(email),
      `Deleted access control entry for ${normalizeEmail(email)}`
    );

    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete access control entry' });
  }
});

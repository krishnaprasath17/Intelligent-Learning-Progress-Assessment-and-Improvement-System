import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { AIInsight, LearningRoadmap, Question, SkillLevel } from '../src/types';

let genAIClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return genAIClient;
}

/**
 * Resilient helper to run Gemini generation across prioritized models with rapid fallback.
 * Uses gemini-3.8-flash as primary model per standard guidelines.
 */
async function generateWithModelFallback(
  requestBuilder: (modelName: string, configOverrides?: any) => Promise<any>
): Promise<any> {
  const modelCandidates = [
    { name: 'gemini-3.8-flash', hasThinking: false },
    { name: 'gemini-flash-latest', hasThinking: false },
    { name: 'gemini-3.1-flash-lite', hasThinking: false },
  ];

  let lastError: any = null;

  for (const candidate of modelCandidates) {
    try {
      const configOverrides = candidate.hasThinking
        ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
        : {};
      
      // 14s timeout per candidate to allow robust structured JSON generation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout on model ${candidate.name}`)), 14000)
      );

      const response = await Promise.race([
        requestBuilder(candidate.name, configOverrides),
        timeoutPromise
      ]);

      if (response && (response.text || response.candidates)) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      // Immediately try next candidate on error or timeout
      continue;
    }
  }

  throw lastError || new Error('All Gemini model fallbacks exhausted');
}

export async function analyzeAssessmentWithAI(params: {
  skillName: string;
  score: number;
  accuracy: number;
  totalQuestions: number;
  topicScores: { topicName: string; percentage: number; total: number; correct: number }[];
  difficultyScores: { difficulty: string; percentage: number }[];
  userSelfConfidence?: number;
  userCareerGoal?: string;
  userExperience?: string;
}): Promise<Omit<AIInsight, 'id' | 'assessmentId' | 'userId' | 'generatedAt'>> {
  const { skillName, score, accuracy, topicScores, difficultyScores, userSelfConfidence, userCareerGoal, userExperience } = params;

  // Classify level mathematically and pedagogically
  let fallbackLevel: SkillLevel = 'Beginner';
  if (score >= 86) fallbackLevel = 'Expert';
  else if (score >= 71) fallbackLevel = 'Advanced';
  else if (score >= 51) fallbackLevel = 'Intermediate';
  else if (score >= 31) fallbackLevel = 'Basic';

  const strengthsList = topicScores.filter(t => t.percentage >= 70).map(t => t.topicName);
  const weaknessesList = topicScores.filter(t => t.percentage < 70).map(t => t.topicName);

  const prompt = `You are a Lead Tech Educator & Assessment AI Evaluator for computer science and software development.
Evaluate a student's recent technical assessment for "${skillName}".

Assessment Performance Data:
- Overall Score: ${score}% (Accuracy: ${accuracy}%)
- Topic Scores: ${JSON.stringify(topicScores, null, 2)}
- Difficulty Performance: ${JSON.stringify(difficultyScores, null, 2)}
- Student Self-Reported Confidence (1-5 scale): ${userSelfConfidence || 'Not provided'}/5
- Student Background/Experience: ${userExperience || 'Student'}
- Student Career Goal: ${userCareerGoal || 'Software Engineer'}

Tasks:
1. Classify Skill Level strictly into one of: 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'.
2. Provide a clear "confidenceVsActualAnalysis" comparing their self-confidence with test results.
3. List 2-4 Strong Areas where they demonstrated consistent competency.
4. List 2-4 Weak Areas that need direct improvement.
5. Identify 2-3 Knowledge Gaps (prerequisite concepts needed before advanced work).
6. Detect 1-2 Common Misconceptions or potential pitfalls reflected in their weak areas.
7. Provide 2-4 Priority Topics with urgency ('High', 'Medium', 'Low') and educational reasons.
8. Write an insightful 2-sentence Key Observation.
9. Provide a concise, motivating Recommended Next Step.

Return strictly valid JSON conforming to the requested schema.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback((model, configOverrides) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                skillName: { type: Type.STRING },
                classifiedLevel: { type: Type.STRING, enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'] },
                overallScore: { type: Type.NUMBER },
                confidenceVsActualAnalysis: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                knowledgeGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                priorityTopics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                      reason: { type: Type.STRING },
                    },
                    required: ['topic', 'priority', 'reason'],
                  },
                },
                keyObservation: { type: Type.STRING },
                recommendedNextStep: { type: Type.STRING },
              },
              required: [
                'skillName',
                'classifiedLevel',
                'overallScore',
                'confidenceVsActualAnalysis',
                'strengths',
                'weaknesses',
                'knowledgeGaps',
                'misconceptions',
                'priorityTopics',
                'keyObservation',
                'recommendedNextStep',
              ],
            },
          },
        })
      );

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          skillName,
          classifiedLevel: parsed.classifiedLevel || fallbackLevel,
          overallScore: score,
          confidenceVsActualAnalysis: parsed.confidenceVsActualAnalysis || `Your score of ${score}% reflects a solid ${fallbackLevel} understanding.`,
          strengths: parsed.strengths?.length ? parsed.strengths : (strengthsList.length ? strengthsList : ['Fundamentals']),
          weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : (weaknessesList.length ? weaknessesList : ['Advanced edge cases']),
          knowledgeGaps: parsed.knowledgeGaps || ['Practical implementation patterns'],
          misconceptions: parsed.misconceptions || ['Applying beginner heuristics to complex scenarios'],
          priorityTopics: parsed.priorityTopics || [
            { topic: weaknessesList[0] || 'Core topics', priority: 'High', reason: 'Critical for next-stage mastery' },
          ],
          keyObservation: parsed.keyObservation || `Demonstrated good understanding in fundamental topics with room to master complex modules.`,
          recommendedNextStep: parsed.recommendedNextStep || `Proceed with the personalized learning roadmap for ${skillName}.`,
        };
      }
    }
  } catch (error) {
    console.error('Error generating AI assessment analysis (using fallback):', error);
  }

  // Graceful fallback with rich structured educational data
  return {
    skillName,
    classifiedLevel: fallbackLevel,
    overallScore: score,
    confidenceVsActualAnalysis: userSelfConfidence
      ? `Your self-rated confidence was ${userSelfConfidence}/5. The evaluation score of ${score}% aligns with a ${fallbackLevel} proficiency, highlighting clear growth vectors.`
      : `Your performance score of ${score}% establishes an initial ${fallbackLevel} baseline in ${skillName}.`,
    strengths: strengthsList.length > 0 ? strengthsList : ['Basic Syntax & Execution', 'Fundamental logic flow'],
    weaknesses: weaknessesList.length > 0 ? weaknessesList : ['Complex problem solving', 'Advanced optimization'],
    knowledgeGaps: [
      `Deep architectural nuances in ${weaknessesList[0] || skillName}`,
      'Memory management and edge case handling',
    ],
    misconceptions: [
      'Assuming syntactic correctness guarantees optimal runtime efficiency.',
    ],
    priorityTopics: [
      {
        topic: weaknessesList[0] || 'Core Concepts',
        priority: 'High',
        reason: 'Essential prerequisite for standard technical interviews and real-world projects.',
      },
      {
        topic: weaknessesList[1] || 'Intermediate Principles',
        priority: 'Medium',
        reason: 'Improves code maintainability and test reliability.',
      },
    ],
    keyObservation: `You possess a workable baseline in ${skillName}. Addressing targeted weak modules will rapidly accelerate your trajectory toward Advanced proficiency.`,
    recommendedNextStep: `Follow the step-by-step 4-week roadmap and attempt the targeted topic quiz after completing week 1 exercises.`,
  };
}

export async function generateRoadmapWithAI(params: {
  skillName: string;
  currentLevel: SkillLevel;
  targetLevel?: SkillLevel;
  weakTopics: string[];
  strongTopics: string[];
  careerGoal?: string;
  dailyAvailableTime?: string;
}): Promise<Omit<LearningRoadmap, 'id' | 'userId' | 'skillId' | 'generatedAt' | 'updatedAt'>> {
  const { skillName, currentLevel, weakTopics, strongTopics, careerGoal, dailyAvailableTime } = params;
  const targetLevel: SkillLevel = params.targetLevel || (currentLevel === 'Expert' ? 'Expert' : currentLevel === 'Advanced' ? 'Expert' : currentLevel === 'Intermediate' ? 'Advanced' : 'Intermediate');

  const prompt = `You are a Tech Curriculum Architect. Generate a personalized, highly structured 4-week upskilling roadmap for a student learning "${skillName}".

Learner Context:
- Current Skill Level: ${currentLevel}
- Target Skill Level: ${targetLevel}
- Weak Topics to prioritize: ${weakTopics.join(', ') || 'Intermediate core topics'}
- Already Mastered Topics: ${strongTopics.join(', ') || 'Basic syntax'}
- Career Goal: ${careerGoal || 'Software Engineer / Full Stack'}
- Daily Study Time: ${dailyAvailableTime || '1–2 hours'}

Generate exactly 4 comprehensive weekly milestone units:
- Week 1: Solidify foundations & tackle the highest priority weak topic.
- Week 2: Intermediate architecture & practical hands-on exercises.
- Week 3: Advanced patterns, debugging, and robust implementation.
- Week 4: Capstone integration mini-project, performance tuning, and interview readiness.

Return strictly valid JSON adhering to the schema.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback((model, configOverrides) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                skillName: { type: Type.STRING },
                currentLevel: { type: Type.STRING },
                targetLevel: { type: Type.STRING },
                estimatedWeeks: { type: Type.INTEGER },
                milestones: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      weekNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                      learningResources: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['Guide', 'Practice', 'Video', 'Documentation'] },
                            duration: { type: Type.STRING },
                          },
                          required: ['title', 'type', 'duration'],
                        },
                      },
                      practiceExercise: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          task: { type: Type.STRING },
                          difficulty: { type: Type.STRING, enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'] },
                        },
                        required: ['title', 'task', 'difficulty'],
                      },
                      miniProject: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                        required: ['title', 'description'],
                      },
                      completed: { type: Type.BOOLEAN },
                    },
                    required: ['id', 'weekNumber', 'title', 'description', 'topics', 'learningResources', 'practiceExercise', 'miniProject', 'completed'],
                  },
                },
              },
              required: ['skillName', 'currentLevel', 'targetLevel', 'estimatedWeeks', 'milestones'],
            },
          },
        })
      );

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const milestones = (parsed.milestones || []).map((m: any, idx: number) => ({
          ...m,
          id: `m-gen-${idx + 1}`,
          weekNumber: idx + 1,
          completed: false,
        }));
        return {
          skillName,
          currentLevel,
          targetLevel,
          estimatedWeeks: 4,
          totalMilestones: milestones.length,
          completedMilestones: 0,
          milestones,
        };
      }
    }
  } catch (error) {
    console.error('Error generating AI roadmap (using fallback):', error);
  }

  // Robust Fallback Roadmap
  return {
    skillName,
    currentLevel,
    targetLevel,
    estimatedWeeks: 4,
    totalMilestones: 4,
    completedMilestones: 0,
    milestones: [
      {
        id: 'm-fb-1',
        weekNumber: 1,
        title: `Week 1 – ${skillName} Fundamentals & High-Priority Gaps`,
        description: `Address primary weaknesses: ${weakTopics[0] || 'Core syntax'} through guided drills.`,
        topics: [weakTopics[0] || 'Core Architecture', 'Syntax Review', 'Debugging Techniques'],
        learningResources: [
          { title: `${skillName} Official Documentation & Specification`, type: 'Documentation', duration: '45 mins' },
          { title: 'Interactive Guided Exercises', type: 'Practice', duration: '40 mins' },
        ],
        practiceExercise: {
          title: 'Foundational Problem Drill',
          task: `Implement a standard algorithm demonstrating proper use of ${weakTopics[0] || 'core concepts'}.`,
          difficulty: 'Basic',
        },
        miniProject: {
          title: 'Command Line Data Processor',
          description: `Build a functional terminal utility utilizing ${skillName} best practices.`,
        },
        completed: false,
      },
      {
        id: 'm-fb-2',
        weekNumber: 2,
        title: `Week 2 – Intermediate Architecture & ${skillName} Patterns`,
        description: `Dive deeper into modular design, error handling, and structured data handling.`,
        topics: [weakTopics[1] || 'Modular Design', 'Error Handling', 'Collections & Memory'],
        learningResources: [
          { title: 'Best Practices & Clean Code Guidelines', type: 'Guide', duration: '50 mins' },
          { title: 'Systematic Debugging Workshop', type: 'Video', duration: '35 mins' },
        ],
        practiceExercise: {
          title: 'Modular Logic Refactor',
          task: 'Refactor procedural spaghetti code into reusable, encapsulated functions and classes.',
          difficulty: 'Intermediate',
        },
        miniProject: {
          title: 'Record Management Service',
          description: 'Develop a persistent in-memory data store with validation and structured queries.',
        },
        completed: false,
      },
      {
        id: 'm-fb-3',
        weekNumber: 3,
        title: `Week 3 – Advanced Features & Performance Optimization`,
        description: `Learn concurrency, asynchronous processing, and profiling bottlenecks.`,
        topics: ['Performance Optimization', 'Advanced APIs', 'Clean Architecture'],
        learningResources: [
          { title: 'Advanced Performance Profiling & Optimization', type: 'Guide', duration: '60 mins' },
          { title: 'Complex Problem Solving in Code', type: 'Practice', duration: '45 mins' },
        ],
        practiceExercise: {
          title: 'Benchmark & Speed Test Challenge',
          task: 'Optimize an O(N^2) search and transformation routine down to O(N log N) or O(N).',
          difficulty: 'Advanced',
        },
        miniProject: {
          title: 'High-Throughput Analytics Engine',
          description: 'Process batch inputs efficiently and output structured summary metrics.',
        },
        completed: false,
      },
      {
        id: 'm-fb-4',
        weekNumber: 4,
        title: `Week 4 – Capstone Project & Placement Interview Readiness`,
        description: `Bring everything together in a production-ready application and mock technical assessment.`,
        topics: ['End-to-End System Design', 'Interview Problem Types', 'Final Targeted Assessment'],
        learningResources: [
          { title: 'Technical Interview Coding Questions Handbook', type: 'Guide', duration: '60 mins' },
          { title: 'Mock Timed Assessment', type: 'Practice', duration: '30 mins' },
        ],
        practiceExercise: {
          title: 'End-to-End System Test',
          task: 'Solve 3 timed algorithm challenges and conduct self-code review.',
          difficulty: 'Advanced',
        },
        miniProject: {
          title: 'Production-Grade Showcase Application',
          description: `Build a complete, tested, and documented portfolio project in ${skillName}.`,
        },
        completed: false,
      },
    ],
  };
}

export async function generateAdaptiveQuestionWithAI(params: {
  skillName: string;
  topicName: string;
  targetDifficulty: SkillLevel;
  questionType?: string;
}): Promise<Question> {
  const { skillName, topicName, targetDifficulty, questionType = 'MCQ' } = params;

  const prompt = `You are a Technical Assessment Author. Generate a unique, high-quality assessment question for:
Skill: ${skillName}
Topic: ${topicName}
Target Difficulty: ${targetDifficulty}
Preferred Question Type: ${questionType} (e.g. MCQ, CodeOutput, Debugging, Conceptual, Scenario)

Requirements:
- Valid technical question with clear concise wording.
- If CodeOutput or Debugging, provide a realistic 3-8 line code snippet in "codeSnippet".
- Exactly 4 distinct options with ids "opt1", "opt2", "opt3", "opt4".
- Specify the exact "correctAnswerId" (e.g., "opt1").
- Provide a detailed educational "explanation" explaining why the correct answer is right and why others are wrong.
- Provide 1 hint.

Return strictly valid JSON matching the schema.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback((model, configOverrides) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                questionType: { type: Type.STRING, enum: ['MCQ', 'CodeOutput', 'Debugging', 'Conceptual', 'Coding', 'Scenario'] },
                difficulty: { type: Type.STRING, enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'] },
                codeSnippet: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                    },
                    required: ['id', 'text'],
                  },
                },
                correctAnswerId: { type: Type.STRING },
                explanation: { type: Type.STRING },
                scenarioContext: { type: Type.STRING },
                hints: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['question', 'questionType', 'difficulty', 'options', 'correctAnswerId', 'explanation'],
            },
          },
        })
      );

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          id: `q-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          skillId: skillName.toLowerCase().replace(/[^a-z0-9]/g, ''),
          topicId: topicName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          topicName,
          question: parsed.question,
          questionType: parsed.questionType || 'MCQ',
          difficulty: parsed.difficulty || targetDifficulty,
          codeSnippet: parsed.codeSnippet || undefined,
          scenarioContext: parsed.scenarioContext || undefined,
          options: parsed.options,
          correctAnswerId: parsed.correctAnswerId,
          explanation: parsed.explanation,
          hints: parsed.hints || ['Break the logic step by step to identify state transitions.'],
        };
      }
    }
  } catch (error) {
    console.error('Error generating AI adaptive question (using fallback template):', error);
  }

  // Graceful fallback question
  return {
    id: `q-fb-${Date.now()}`,
    skillId: skillName.toLowerCase().replace(/[^a-z0-9]/g, ''),
    topicId: topicName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    topicName,
    question: `In ${skillName}, which design choice best optimizes code clarity and execution safety when dealing with ${topicName}?`,
    questionType: 'MCQ',
    difficulty: targetDifficulty,
    options: [
      { id: 'opt1', text: 'Encapsulate state within dedicated handlers and validate boundaries explicitly' },
      { id: 'opt2', text: 'Use global mutable variables across modules without locks' },
      { id: 'opt3', text: 'Ignore exception handling to minimize call stack overhead' },
      { id: 'opt4', text: 'Rely purely on implicit type coercion at runtime' },
    ],
    correctAnswerId: 'opt1',
    explanation: 'Encapsulation with explicit validation ensures maintainability, predictable state flow, and prevents cascading side-effects.',
    hints: ['Think about defensive programming and clean architectural isolation.'],
  };
}

export async function askAITutor(params: {
  message: string;
  chatHistory: { role: 'user' | 'model'; text: string }[];
  userContext: {
    name: string;
    skillName?: string;
    recentScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    experienceLevel?: string;
    careerGoal?: string;
  };
}): Promise<string> {
  const { message, chatHistory, userContext } = params;

  const systemInstruction = `You are "Socrates AI", the dedicated adaptive tutor and tech educator for computer science and software development.
You help students, freshers, and developers master programming (Python, Java, C++, C, SQL, JavaScript, React, DSA, OOP).

Student Context:
- Name: ${userContext.name}
- Target Career Goal: ${userContext.careerGoal || 'Software Engineer'}
- Current Skill in focus: ${userContext.skillName || 'Computer Science'}
- Recent Assessment Score: ${userContext.recentScore !== undefined ? userContext.recentScore + '%' : 'Pending'}
- Demonstrated Strengths: ${(userContext.strengths || []).join(', ') || 'Core concepts'}
- Identified Weak Areas / Gaps: ${(userContext.weaknesses || []).join(', ') || 'Advanced topics'}

Pedagogical Rules:
1. DIRECT & ENGAGING EXPLANATIONS:
   - When the user asks about an assessment question, missed topic, or bug, IMMEDIATELY explain the core concept with crisp clarity and structured markdown.
   - If question details (chosen answer, correct answer, code snippet) are provided, immediately break down:
     a) Why the correct answer is right (the underlying execution logic / language spec).
     b) Why their chosen answer was a common misconception (mental model trap).
     c) Practical code snippet demonstrating the right pattern vs pitfall.
     d) Quick Socratic check question to verify they understood.
   - NEVER ask the user to re-paste a question or say you are waiting if context or topic is provided. Always deliver immediate educational value.
2. ACCESSIBLE ANALOGIES & VISUAL CODE:
   - Connect complex abstract concepts to relatable analogies or topics they already know.
   - Keep code modern, clean, and properly commented.
3. CONSTRUCTIVE & ENCOURAGING:
   - Be positive, insightful, and pedagogical.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const contents = [
        ...chatHistory.map(h => ({
          role: h.role,
          parts: [{ text: h.text }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await generateWithModelFallback((model, configOverrides) =>
        ai.models.generateContent({
          model,
          contents,
          config: {
            ...configOverrides,
            systemInstruction,
          },
        })
      );

      if (response && response.text) {
        return response.text;
      }
    }
  } catch (error) {
    console.error('Error generating AI Tutor response (using fallback):', error);
  }

  // Graceful fallback response if all models are temporarily busy
  const focusSkill = userContext.skillName || 'Programming';
  return `### Understanding ${focusSkill} & Key Principles

Great question, **${userContext.name}**! Let's break down this concept step-by-step:

1. **Core Concept Intuition**: 
   When learning ${focusSkill}, concepts build progressively. Since your profile indicates strength in *${(userContext.strengths || ['algorithmic fundamentals'])[0]}*, you can think of this as an extension of structured state management and clear flow control.

2. **Practical Pattern**:
\`\`\`${focusSkill.toLowerCase().includes('python') ? 'python' : focusSkill.toLowerCase().includes('java') ? 'java' : 'javascript'}
// Clean implementation pattern
function solveConceptExample(inputData) {
  if (!inputData) return null; // Defensive check
  
  // Transform or process with explicit state
  const result = processStep(inputData);
  return result;
}
\`\`\`

3. **Key Takeaway**:
   Focus on modular separation and verifying edge cases before scaling up complexity.

💡 **Quick Socratic Challenge:**
*What would happen if the input to this function was empty or unexpected? How would you handle it gracefully?*`;
}

/**
 * On-demand AI Diagnostic synthesis for any skill without requiring an initial 20-minute test.
 * Evaluates skill competencies, pinpoints real-world knowledge gaps, detects mental model flaws,
 * and sets actionable mastery goals.
 */
export async function generateSkillDiagnosticInsightWithAI(params: {
  skillName: string;
  currentLevel?: string;
  userCareerGoal?: string;
  userExperience?: string;
  selfConfidence?: number;
  focusTopics?: string[];
  notes?: string;
}): Promise<Omit<AIInsight, 'id' | 'assessmentId' | 'userId' | 'generatedAt'>> {
  const {
    skillName,
    currentLevel = 'Intermediate',
    userCareerGoal = 'Software Engineer',
    userExperience = 'Student / Aspiring Engineer',
    selfConfidence = 3,
    focusTopics = [],
    notes = '',
  } = params;

  const validLevel: SkillLevel = (['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'].includes(currentLevel)
    ? currentLevel
    : 'Intermediate') as SkillLevel;

  const prompt = `You are an elite Senior Staff Engineer and Lead Computer Science Educator.
Conduct a deep diagnostic knowledge gap evaluation for a learner in "${skillName}".

Learner Context:
- Self-Assessed Skill Level: ${validLevel}
- Target Career Role: ${userCareerGoal}
- Experience Background: ${userExperience}
- Self Confidence Rating: ${selfConfidence}/5
- Focus Topics of Interest: ${focusTopics.length ? focusTopics.join(', ') : 'Core architecture & modern idioms'}
- Student Notes / Background: ${notes || 'Seeking high-leverage industry readiness'}

Tasks:
1. Re-evaluate and classify their pedagogical level: 'Beginner', 'Basic', 'Intermediate', 'Advanced', or 'Expert'.
2. Provide an overall score (integer 40-95) reflecting realistic diagnostic baseline proficiency.
3. Write an insightful "confidenceVsActualAnalysis" addressing the gap between self-perception and actual industry expectations.
4. List 3-4 Concrete Strengths typical or evident for their level.
5. List 3-4 Weak Areas / Growth Blindspots that routinely prevent progression to the next tier.
6. Detail 2-3 Deep Knowledge Gaps (conceptual building blocks missed or misunderstood).
7. Uncover 2 Common Misconceptions or anti-patterns engineers frequently commit in ${skillName}.
8. Provide 3-4 Priority Topics with urgency ('High', 'Medium', 'Low') and clear architectural reasons.
9. Write a 2-sentence Key Observation highlighting their exact cognitive bottleneck.
10. Give an inspiring, specific Recommended Next Step.

Return strictly valid JSON conforming to the schema.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback((model, configOverrides) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                skillName: { type: Type.STRING },
                classifiedLevel: { type: Type.STRING, enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'] },
                overallScore: { type: Type.NUMBER },
                confidenceVsActualAnalysis: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                knowledgeGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                priorityTopics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                      reason: { type: Type.STRING },
                    },
                    required: ['topic', 'priority', 'reason'],
                  },
                },
                keyObservation: { type: Type.STRING },
                recommendedNextStep: { type: Type.STRING },
              },
              required: [
                'skillName',
                'classifiedLevel',
                'overallScore',
                'confidenceVsActualAnalysis',
                'strengths',
                'weaknesses',
                'knowledgeGaps',
                'misconceptions',
                'priorityTopics',
                'keyObservation',
                'recommendedNextStep',
              ],
            },
          },
        })
      );

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          skillName,
          classifiedLevel: parsed.classifiedLevel || validLevel,
          overallScore: Number(parsed.overallScore) || 72,
          confidenceVsActualAnalysis: parsed.confidenceVsActualAnalysis || `Self-confidence of ${selfConfidence}/5 calibrated against ${validLevel} competency benchmarks.`,
          strengths: parsed.strengths?.length ? parsed.strengths : ['Fundamental Language Idioms', 'Basic Control Flow'],
          weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : ['Complex Asynchronous Flows', 'Performance Profiling'],
          knowledgeGaps: parsed.knowledgeGaps?.length ? parsed.knowledgeGaps : ['Underlying memory model and lifecycle', 'Scale optimization patterns'],
          misconceptions: parsed.misconceptions?.length ? parsed.misconceptions : ['Treating high-level abstractions as zero-cost in time-critical paths'],
          priorityTopics: parsed.priorityTopics?.length ? parsed.priorityTopics : [
            { topic: 'Runtime Architecture & Concurrency', priority: 'High', reason: 'Critical for production-grade system reliability.' }
          ],
          keyObservation: parsed.keyObservation || `Solid functional baseline in ${skillName} with immediate upside upon conquering runtime internals.`,
          recommendedNextStep: parsed.recommendedNextStep || `Engage with the high-priority gap remediation module and practice with the Socrates AI Tutor.`,
        };
      }
    }
  } catch (err) {
    console.error('Error generating on-demand AI skill diagnostic (using structured fallback):', err);
  }

  // Graceful pedagogical fallback
  const fallbackScore = validLevel === 'Expert' ? 88 : validLevel === 'Advanced' ? 78 : validLevel === 'Intermediate' ? 68 : validLevel === 'Basic' ? 52 : 42;
  return {
    skillName,
    classifiedLevel: validLevel,
    overallScore: fallbackScore,
    confidenceVsActualAnalysis: `Your self-rated confidence of ${selfConfidence}/5 reflects a healthy starting perspective. In ${skillName}, your ${validLevel} baseline gives you the tools to build features, but unlocking enterprise readiness requires tackling asynchronous runtime flows and systematic debugging.`,
    strengths: [
      `Canonical ${skillName} Syntax & Logic Flow`,
      'Modular Function & Data Abstractions',
      'Standard Library Navigation',
    ],
    weaknesses: [
      `Memory Efficiency & Resource Management in ${skillName}`,
      'Handling Unhandled Edge-Cases and Race Conditions',
      'Automated Test Driven Verification',
    ],
    knowledgeGaps: [
      `Deep mechanics of how ${skillName} manages state and memory underneath the surface.`,
      'Architectural tradeoffs between abstraction layers and execution latency.',
    ],
    misconceptions: [
      `Assuming syntactic correctness guarantees optimal concurrency or scale under load.`,
      `Over-relying on global or shared mutable state rather than functional boundaries.`,
    ],
    priorityTopics: [
      {
        topic: `${skillName} Concurrency & Asynchronous Patterns`,
        priority: 'High',
        reason: 'Essential for high-throughput applications and technical interviews.',
      },
      {
        topic: 'Error Handling Boundaries & Defensive Programming',
        priority: 'High',
        reason: 'Prevents catastrophic failures in production workloads.',
      },
      {
        topic: 'Performance Profiling & Bottleneck Identification',
        priority: 'Medium',
        reason: 'Differentiates junior coders from experienced software engineers.',
      },
    ],
    keyObservation: `You possess workable practical intuition in ${skillName}; focusing your deliberate practice on edge cases and runtime lifecycle will rapidly unlock advanced mastery.`,
    recommendedNextStep: `Launch the AI Socrates Tutor for a 5-minute Socratic drill on your high-priority concurrency gap.`,
  };
}

/**
 * Deep Dive explanation generator for any specific Knowledge Gap or Misconception.
 * Breaks down root causes, gives real code anti-patterns vs fixes, and includes a quick check.
 */
export async function generateGapDeepDiveWithAI(params: {
  skillName: string;
  topicOrGap: string;
  type: 'gap' | 'misconception' | 'priorityTopic';
  studentLevel?: string;
}): Promise<{
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
}> {
  const { skillName, topicOrGap, type, studentLevel = 'Intermediate' } = params;

  const prompt = `You are a Principal Software Engineer & CS Professor.
Produce an in-depth interactive remediation guide for a student struggling with:
Skill: ${skillName}
Issue Type: ${type}
Target Topic / Gap: "${topicOrGap}"
Student Level: ${studentLevel}

Provide:
1. "title": A clear descriptive title.
2. "executiveSummary": 2-3 sentences explaining why this concept matters in real industry production systems.
3. "rootCauseAnalysis": Explanation of the mental model trap that causes learners to fail here.
4. "antipatternCode": A clean, realistic code snippet (5-10 lines) demonstrating the flawed approach or bug.
5. "correctedCode": The canonical, modern, idiomatic fix with inline comments explaining why it works.
6. "bestPractices": 3 concise golden rules for production code.
7. "selfCheckQuestion": An interactive multiple-choice question with 4 options, a correct 0-indexed option, and a crystal-clear pedagogical explanation.

Return strictly valid JSON adhering to the schema.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback((model, configOverrides) =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                executiveSummary: { type: Type.STRING },
                rootCauseAnalysis: { type: Type.STRING },
                antipatternCode: { type: Type.STRING },
                correctedCode: { type: Type.STRING },
                bestPractices: { type: Type.ARRAY, items: { type: Type.STRING } },
                selfCheckQuestion: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                  required: ['question', 'options', 'correctIndex', 'explanation'],
                },
              },
              required: ['title', 'executiveSummary', 'rootCauseAnalysis', 'antipatternCode', 'correctedCode', 'bestPractices', 'selfCheckQuestion'],
            },
          },
        })
      );

      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    }
  } catch (err) {
    console.error('Error generating AI gap deep-dive (using structured fallback):', err);
  }

  // Graceful fallback
  return {
    title: `Remediating: ${topicOrGap}`,
    executiveSummary: `Mastering ${topicOrGap} in ${skillName} is a prerequisite for writing resilient, scalable code that functions reliably under real production traffic.`,
    rootCauseAnalysis: `Learners frequently assume standard linear execution without accounting for edge cases, memory lifecycle, or asynchronous scheduling.`,
    antipatternCode: `// Anti-pattern: Unchecked side-effects or improper boundary handling\nfunction handleRequest(input) {\n  // Dangerous: Assumes input is valid and mutation is safe\n  input.cached = true;\n  return executeDirectly(input);\n}`,
    correctedCode: `// Corrected: Defensive validation and immutable boundaries\nfunction handleRequest(input) {\n  if (!input || typeof input !== 'object') {\n    throw new TypeError('Invalid payload format');\n  }\n  const sanitized = { ...input, timestamp: Date.now() };\n  return executeWithTelemetry(sanitized);\n}`,
    bestPractices: [
      'Always treat external inputs as untrusted and validate at boundaries.',
      'Prefer immutable state transitions to prevent cross-scope pollution.',
      'Write targeted unit tests asserting failure modes before asserting happy paths.',
    ],
    selfCheckQuestion: {
      question: `What is the primary risk of mutating arguments in place rather than creating clean transformations in ${skillName}?`,
      options: [
        'It causes compiler syntax warnings',
        'It introduces silent bugs and side effects for other callers relying on that data',
        'It prevents the function from ever returning a value',
        'It automatically reduces memory usage by 50%',
      ],
      correctIndex: 1,
      explanation: 'In-place mutations lead to spooky action at a distance, making bugs non-deterministic and difficult to trace across asynchronous lifecycles.',
    },
  };
}


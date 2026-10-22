import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Bot,
  Map,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LevelBadge } from '../components/common/LevelBadge';
import { getUserLevelInfo, calculateAssessmentXp } from '../utils/xpLevel';

export const AssessmentResultPage: React.FC = () => {
  const {
    latestAssessmentResult,
    latestAIInsight,
    recentAssessments,
    setCurrentView,
    viewInsight,
    viewSkillRoadmap,
    setTutorInitialPrompt,
    startSkillAssessment,
    selectedSkillId,
    activeAttempt,
    activeTestConfig,
    eligibleReattempts,
    startTestReattempt,
  } = useData();
  const { user } = useAuth();

  const assessment = latestAssessmentResult || recentAssessments[0];
  const insight = latestAIInsight;
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const isTerminated =
    activeAttempt?.status === 'terminated_due_to_violations' ||
    (assessment as any)?.status === 'terminated_due_to_violations';
  const passPercentage = activeTestConfig?.passPercentage || 70;
  const isPassed = assessment ? assessment.score >= passPercentage : false;

  const levelInfo = getUserLevelInfo(user?.xp || 0);
  const earnedXp = assessment ? calculateAssessmentXp(assessment.score, assessment.correctQuestions) : 150;

  // Trigger celebration confetti only if passed without violation termination
  useEffect(() => {
    if (isPassed && !isTerminated) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // safe fallback
      }
    }
  }, [isPassed, isTerminated]);

  if (!assessment) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">No recent assessment found.</p>
        <button
          onClick={() => setCurrentView('skills')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Take an assessment
        </button>
      </div>
    );
  }

  const handleAskTutorQuestion = (resp: any) => {
    let prompt = `Hi Socrates! In my ${assessment.skillName} assessment, I missed this question on "${resp.topicName}":\n\n`;
    if (resp.questionText) {
      prompt += `**Question:** ${resp.questionText}\n`;
    }
    if (resp.codeSnippet) {
      prompt += `\`\`\`${assessment.skillName.toLowerCase().includes('python') ? 'python' : assessment.skillName.toLowerCase().includes('java') ? 'java' : 'javascript'}\n${resp.codeSnippet}\n\`\`\`\n`;
    }
    if (resp.selectedOptionText) {
      prompt += `- **My chosen answer:** ${resp.selectedOptionText}\n`;
    }
    if (resp.correctOptionText) {
      prompt += `- **Correct answer:** ${resp.correctOptionText}\n`;
    }
    if (resp.explanation) {
      prompt += `- **Reference explanation:** ${resp.explanation}\n`;
    }
    prompt += `\nCould you please break down why the correct answer is right, explain the underlying logic step-by-step, clarify why my chosen option was a misconception, and give me a quick mini-challenge to master it?`;

    setTutorInitialPrompt(prompt);
    setCurrentView('ai-tutor');
  };

  const handleReattemptClick = async () => {
    setIsRetrying(true);
    try {
      if (activeTestConfig) {
        await startTestReattempt(activeTestConfig.id);
      } else {
        setCurrentView('reattempts');
      }
    } catch (err: any) {
      console.warn('Reattempt launch:', err);
      setCurrentView('reattempts');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div id="assessment-result-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Violation Termination Alert Banner (if applicable) */}
      {isTerminated && (
        <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 border-2 border-rose-500 shadow-md space-y-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                  Terminated Due to Security Violations
                </span>
                <span className="text-xs font-bold text-rose-800">
                  Maximum Limit Exceeded ({activeAttempt?.violationCount || 2} of 2)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-rose-950">
                Examination Environment Policy Enforcement
              </h2>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-normal">
                {activeAttempt?.terminationReason ||
                  'The session was automatically submitted after repeated attempts to navigate away from the examination window.'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              <strong>Integrity Guarantee:</strong> All responses submitted prior to termination were scored securely. You may take an authorized reattempt if eligible under retake rules.
            </span>
            <button
              onClick={() => setCurrentView('reattempts')}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 shadow-2xs"
            >
              Check Reattempt Eligibility
            </button>
          </div>

          {/* Audit trail of recorded violations */}
          {activeAttempt?.violationHistory && activeAttempt.violationHistory.length > 0 && (
            <div className="pt-2 border-t border-rose-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                Audit Trail of Recorded Incidents:
              </span>
              <div className="space-y-1">
                {activeAttempt.violationHistory.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="flex items-center justify-between text-[11px] bg-rose-100/70 px-2.5 py-1 rounded text-rose-900"
                  >
                    <span>
                      Violation #{v.warningNumber || i + 1}: <strong>{v.details}</strong> ({v.type})
                    </span>
                    <span className="text-rose-700 text-[10px]">
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Banner Card with Score */}
      <div
        className={`p-6 sm:p-8 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isTerminated
            ? 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-800/40'
            : isPassed
            ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900'
            : 'bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-800/40'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {isTerminated ? (
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                Terminated (Violations)
              </span>
            ) : isPassed ? (
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Passed • Cleared</span>
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Score Below Passing ({passPercentage}% req)</span>
              </span>
            )}
            <LevelBadge level={assessment.classifiedLevel} size="sm" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {assessment.skillName} Assessment Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {isPassed
              ? `Congratulations! You scored ${assessment.score}% (passing score was ${passPercentage}%). Your level is classified as ${assessment.classifiedLevel}.`
              : `Your score is ${assessment.score}%, which is below the passing mark of ${passPercentage}%. Review your weak topics with AI Socrates or start an authorized reattempt.`}
          </p>
        </div>

        {/* Circular / Big Score Dial */}
        <div className="flex items-center space-x-6 bg-white/10 p-5 rounded-2xl border border-white/15 shrink-0">
          <div className="text-center">
            <div className={`text-4xl sm:text-5xl font-black tracking-tight ${isPassed ? 'text-white' : 'text-amber-300'}`}>
              {assessment.score}%
            </div>
            <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider mt-1">
              {isPassed ? 'Mastery Score' : 'Obtained Score'}
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-slate-200 border-l border-white/20 pl-4">
            <div>
              <span className="text-slate-400">Passing Mark:</span>{' '}
              <strong className="text-white">{passPercentage}%</strong>
            </div>
            <div>
              <span className="text-slate-400">Correct:</span>{' '}
              <strong className={isPassed ? 'text-emerald-300' : 'text-amber-300'}>
                {assessment.correctQuestions}
              </strong>{' '}
              / {assessment.totalQuestions}
            </div>
            <div>
              <span className="text-slate-400">Duration:</span>{' '}
              <strong>{Math.round(assessment.durationSeconds / 60)} mins</strong>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-slate-400">XP Rewarded:</span>{' '}
              <strong className="text-amber-300 font-extrabold text-sm">+{earnedXp} XP</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Quick AI Observation Callout */}
      {insight && (
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-xs flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              AI Evaluator Observation & Confidence Calibration
            </h3>
            <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed font-medium">
              "{insight.keyObservation}"
            </p>
            <p className="text-xs text-indigo-800 pt-1">
              <strong>Confidence Analysis:</strong> {insight.confidenceVsActualAnalysis}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons to Drive Next Step in Loop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* If Failed or Terminated, Primary CTA is Reattempt Test */}
        {!isPassed || isTerminated ? (
          <button
            id="result-reattempt-test-btn"
            onClick={handleReattemptClick}
            disabled={isRetrying}
            className="p-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
          >
            {isRetrying ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Launching Reattempt...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Reattempt Assessment</span>
              </>
            )}
          </button>
        ) : (
          <button
            id="result-retake-asm-btn"
            onClick={() => startSkillAssessment(assessment.skillId)}
            className="p-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold shadow-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake for Higher Mastery</span>
          </button>
        )}

        <button
          id="result-view-ai-insights-btn"
          onClick={() => {
            if (assessment.aiInsightId) {
              viewInsight(assessment.aiInsightId);
            } else {
              setCurrentView('ai-insights');
            }
          }}
          className="p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          <span>View Deep AI Gap Diagnostics</span>
        </button>

        <button
          id="result-view-roadmap-btn"
          onClick={() => viewSkillRoadmap(assessment.skillId)}
          className="p-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
        >
          <Map className="w-4 h-4" />
          <span>View 4-Week Roadmap</span>
        </button>
      </div>

      {/* Two Column Diagnostic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Breakdown Progress */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Topic-by-Topic Performance</h3>
          <div className="space-y-3">
            {assessment.topicScores.map((t, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{t.topicName}</span>
                  <span className="font-bold text-slate-900">
                    {t.correctQuestions}/{t.totalQuestions} ({t.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      t.percentage >= 70
                        ? 'bg-emerald-500'
                        : t.percentage >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${t.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Difficulty Tier Accuracy</h3>
          <div className="space-y-3">
            {assessment.difficultyScores.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <LevelBadge level={d.difficulty} size="sm" />
                    <span className="text-slate-500">{d.correctQuestions} of {d.totalQuestions} solved</span>
                  </div>
                  <span className="font-bold text-slate-900">{d.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Question Review & Detailed Explanations ({assessment.responses.length})
        </h3>
        <p className="text-xs text-slate-500">
          Inspect each evaluated question to understand correct reasoning and eliminate misconceptions.
        </p>

        <div className="space-y-3">
          {assessment.responses.map((resp, idx) => {
            const isExpanded = expandedQuestionId === resp.questionId;
            return (
              <div
                key={resp.questionId}
                id={`review-item-${resp.questionId}`}
                className={`p-4 rounded-xl border transition-all ${
                  resp.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : resp.questionId)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3">
                    {resp.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">Question {idx + 1}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {resp.topicName}
                        </span>
                        <LevelBadge level={resp.difficulty} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {resp.isCorrect ? 'Answered correctly' : 'Incorrectly answered'} • Response time: {resp.responseTimeSeconds}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!resp.isCorrect && (
                      <button
                        id={`ask-ai-tutor-q-${idx + 1}`}
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleAskTutorQuestion(resp);
                        }}
                        className="text-[11px] font-bold text-rose-700 bg-white border border-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-50 flex items-center space-x-1 shadow-2xs"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Explain with AI</span>
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-700 space-y-3">
                    {resp.questionText && (
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {resp.questionText}
                      </div>
                    )}

                    {resp.codeSnippet && (
                      <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] sm:text-xs overflow-x-auto">
                        <code>{resp.codeSnippet}</code>
                      </pre>
                    )}

                    {resp.options && resp.options.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Options & Evaluation:
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {resp.options.map((opt: any) => {
                            const isSelected = opt.id === resp.selectedOptionId;
                            const isCorrectAnswer = opt.id === (resp.correctAnswerId || (resp.isCorrect ? resp.selectedOptionId : ''));
                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                                  isCorrectAnswer
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                                    : isSelected && !resp.isCorrect
                                    ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {opt.id.replace('opt', '')}
                                  </span>
                                  <span>{opt.text}</span>
                                </div>
                                <div className="flex items-center space-x-1 shrink-0 ml-2">
                                  {isCorrectAnswer && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center space-x-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Correct Answer</span>
                                    </span>
                                  )}
                                  {isSelected && !resp.isCorrect && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white flex items-center space-x-1">
                                      <XCircle className="w-3 h-3" />
                                      <span>Your Answer</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {resp.explanation && (
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          <span>Detailed Explanation:</span>
                        </div>
                        <p className="text-blue-950 leading-relaxed font-normal">
                          {resp.explanation}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleAskTutorQuestion(resp);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Discuss this question with Socrates AI</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

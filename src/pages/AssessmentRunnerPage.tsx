import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Code2,
  XCircle,
  Play,
  RotateCcw,
  Check,
  FileCode,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Question } from '../types';
import { LevelBadge } from '../components/common/LevelBadge';
import { api } from '../services/api';

export const AssessmentRunnerPage: React.FC = () => {
  const {
    activeAttempt,
    activeExamQuestions,
    activeTestConfig,
    setLatestResult,
    setCurrentView,
    refreshAssessments,
    refreshSkills,
    refreshAchievements,
    refreshAnalytics,
    refreshNotifications,
    showXpReward,
    refreshEligibleReattempts,
  } = useData();
  const { user, syncUser, rewardXp } = useAuth();

  const [questions, setQuestions] = useState<Question[]>(() => activeExamQuestions || []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => activeAttempt?.answers || {});
  const [flagged, setFlagged] = useState<Record<string, boolean>>(() => activeAttempt?.flagged || {});
  const [codeAnswers, setCodeAnswers] = useState<Record<string, { code: string; language: string }>>(() => activeAttempt?.codeSubmissions || {});

  // Interactive Code Runner state
  const [activeCodeLang, setActiveCodeLang] = useState<string>('javascript');
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [codeRunResult, setCodeRunResult] = useState<any | null>(null);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // Timer & Deadline
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    if (activeAttempt?.serverDeadline) {
      const remaining = Math.max(0, Math.round((new Date(activeAttempt.serverDeadline).getTime() - Date.now()) / 1000));
      return remaining > 0 ? remaining : (activeTestConfig?.durationMinutes || 20) * 60;
    }
    return (activeTestConfig?.durationMinutes || 20) * 60;
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitWarningModal, setShowExitWarningModal] = useState<boolean>(false);

  // Examination Lockdown & Violation Management
  const [violationCount, setViolationCount] = useState<number>(() => activeAttempt?.violationCount || 0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [violationModal, setViolationModal] = useState<{
    show: boolean;
    warningNumber: number;
    details: string;
    isTerminated: boolean;
  }>({
    show: false,
    warningNumber: 1,
    details: '',
    isTerminated: activeAttempt?.status === 'terminated_due_to_violations',
  });
  const [terminationCountdown, setTerminationCountdown] = useState<number>(5);

  const lastViolationTimestampRef = useRef<number>(0);
  const isSebEnvironment = typeof navigator !== 'undefined' && (
    navigator.userAgent.includes('SEB') ||
    navigator.userAgent.includes('SafeExamBrowser') ||
    Boolean((window as any).SafeExamBrowser)
  );

  const startTimeRef = useRef<number>(Date.now());
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const flaggedRef = useRef(flagged);
  flaggedRef.current = flagged;
  const codeAnswersRef = useRef(codeAnswers);
  codeAnswersRef.current = codeAnswers;

  // Record lockdown violation to server with anti-duplicate debounce
  const triggerViolation = useCallback(
    async (
      type: 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'keyboard_shortcut' | 'window_exit' | 'other',
      details: string
    ) => {
      if (!activeAttempt || isSubmitting || violationModal.isTerminated) return;
      const now = Date.now();
      // Debounce duplicate triggers within 2500ms
      if (now - lastViolationTimestampRef.current < 2500) return;
      lastViolationTimestampRef.current = now;

      try {
        setIsTimerPaused(true);
        const res = await api.recordViolation(activeAttempt.id, { type, details });
        setViolationCount(res.violationCount);

        if (res.isTerminated || res.violationCount >= 2) {
          setViolationModal({
            show: true,
            warningNumber: res.violationCount,
            details,
            isTerminated: true,
          });
          // Synchronize candidate assessments
          refreshAssessments();
          refreshEligibleReattempts();
        } else {
          setViolationModal({
            show: true,
            warningNumber: 1,
            details,
            isTerminated: false,
          });
        }
      } catch (err) {
        console.warn('Error recording violation:', err);
      }
    },
    [activeAttempt, isSubmitting, violationModal.isTerminated, refreshAssessments, refreshEligibleReattempts]
  );

  // Monitor keyboard shortcuts & browser exit attempts
  useEffect(() => {
    if (violationModal.isTerminated || isSubmitting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (violationModal.isTerminated || isSubmitting) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      // 1. Page reload shortcuts: F5, Ctrl+R, Cmd+R
      if (e.key === 'F5' || (isCtrl && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        triggerViolation('keyboard_shortcut', 'Browser page reload attempted (F5 / Ctrl+R)');
        return;
      }

      // 2. Tab close shortcuts: Ctrl+W, Cmd+W
      if (isCtrl && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        triggerViolation('keyboard_shortcut', 'Browser tab close shortcut attempted (Ctrl+W / Cmd+W)');
        return;
      }

      // 3. Tab switching: Ctrl+Tab, Ctrl+PageUp/Down
      if (isCtrl && (e.key === 'Tab' || e.key === 'PageDown' || e.key === 'PageUp')) {
        e.preventDefault();
        triggerViolation('keyboard_shortcut', 'Tab switching keyboard shortcut attempted (Ctrl+Tab)');
        return;
      }

      // 4. Alt+Tab or Alt+F4
      if (isAlt && (e.key === 'Tab' || e.key === 'F4')) {
        e.preventDefault();
        triggerViolation('keyboard_shortcut', `Application switching shortcut attempted (Alt+${e.key})`);
        return;
      }

      // 5. Escape key
      if (e.key === 'Escape') {
        triggerViolation('keyboard_shortcut', 'Escape key pressed (exam window exit attempt)');
        return;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !violationModal.isTerminated && !isSubmitting) {
        triggerViolation('tab_switch', 'Candidate switched browser tab or minimized window');
      }
    };

    const handleWindowBlur = () => {
      if (!violationModal.isTerminated && !isSubmitting && !showSubmitModal && !showExitWarningModal) {
        triggerViolation('window_blur', 'Window focus lost (candidate navigated away from portal)');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !violationModal.isTerminated && !isSubmitting) {
        triggerViolation('fullscreen_exit', 'Exited fullscreen examination environment');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [triggerViolation, violationModal.isTerminated, isSubmitting, showSubmitModal, showExitWarningModal]);

  // Termination countdown timer to auto-redirect after second violation
  useEffect(() => {
    if (!violationModal.isTerminated) return;

    const timer = setInterval(() => {
      setTerminationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleViewTerminatedResult();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [violationModal.isTerminated]);

  const handleReturnFromFirstWarning = () => {
    setIsTimerPaused(false);
    setViolationModal(prev => ({ ...prev, show: false }));
  };

  const handleViewTerminatedResult = async () => {
    if (!activeAttempt) {
      setCurrentView('tests');
      return;
    }
    try {
      const res = await api.getTestAttempt(activeAttempt.id);
      if (res.assessmentResult) {
        setLatestResult(res.assessmentResult, res.insight || ({} as any));
      }
      await refreshAssessments();
      await refreshEligibleReattempts();
      setCurrentView('assessment-result');
    } catch (e) {
      setCurrentView('assessment-result');
    }
  };

  // Browser leave warning (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an active exam in progress. Your progress will be saved, but the timer will continue.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Periodic autosave every 15 seconds
  useEffect(() => {
    if (!activeAttempt || isSubmitting || violationModal.isTerminated) return;

    const autoSaveInterval = setInterval(async () => {
      setSaveStatus('saving');
      try {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        const res = await api.autosaveAttempt(activeAttempt.id, {
          answers: answersRef.current,
          flagged: flaggedRef.current,
          codeSubmissions: codeAnswersRef.current,
          timeSpentSeconds: timeSpent,
        });

        if (res.isExpired) {
          // Auto-submit expired exam
          handleSubmitAssessment();
          return;
        }

        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('Autosave warning:', err);
        setSaveStatus('error');
      }
    }, 15000);

    return () => clearInterval(autoSaveInterval);
  }, [activeAttempt, isSubmitting, violationModal.isTerminated]);

  // Synchronized countdown timer (pauses during Warning 1)
  useEffect(() => {
    if (isSubmitting || isTimerPaused || violationModal.isTerminated) return;

    const timerInterval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isSubmitting, isTimerPaused, violationModal.isTerminated]);

  // If questions empty, fallback
  useEffect(() => {
    if (questions.length === 0 && activeTestConfig) {
      api.startTestAttempt(activeTestConfig.id).then(res => {
        setQuestions(res.questions);
      }).catch(e => console.error(e));
    }
  }, [questions.length, activeTestConfig]);

  const currentQ = questions[currentIndex];

  // Initialize coding template if needed
  useEffect(() => {
    if (currentQ?.questionType === 'Coding' && currentQ.codingDetails) {
      if (!codeAnswers[currentQ.id]) {
        const defaultCode = currentQ.codingDetails.starterCode?.javascript || '// Write your solution here\nfunction solve(input) {\n  \n}';
        setCodeAnswers(prev => ({
          ...prev,
          [currentQ.id]: { code: defaultCode, language: 'javascript' },
        }));
      }
    }
  }, [currentQ]);

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
    setSaveStatus('saving');
    // Immediate debounced local save indicator
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSavedTime('Just now');
    }, 400);
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlagged(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleCodeChange = (newCode: string) => {
    if (!currentQ) return;
    setCodeAnswers(prev => ({
      ...prev,
      [currentQ.id]: { code: newCode, language: activeCodeLang },
    }));
  };

  const handleRunCodeTest = async () => {
    if (!currentQ || !currentQ.codingDetails) return;
    const currentCode = codeAnswers[currentQ.id]?.code || '';
    setIsRunningCode(true);
    setCodeRunResult(null);

    try {
      const res = await api.runCodingTest({
        questionId: currentQ.id,
        language: activeCodeLang,
        code: currentCode,
      });
      setCodeRunResult(res);
    } catch (e: any) {
      setCodeRunResult({
        success: false,
        passedTestCases: 0,
        totalTestCases: currentQ.codingDetails.sampleTestCases.length,
        errorMessage: e.message || 'Execution failed',
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmitAssessment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      if (activeAttempt) {
        const res = await api.submitTestAttempt(activeAttempt.id, {
          answers,
          durationSeconds: totalDuration,
          codeSubmissions: codeAnswers,
        });

        setLatestResult(res.assessmentResult, res.aiInsight || ({} as any));
        if (res.user) syncUser(res.user);
        if (res.xpRewarded > 0) {
          showXpReward(res.xpRewarded, `Completed ${activeTestConfig?.title || 'Assessment'}`);
        }

        await Promise.all([
          refreshAssessments(),
          refreshSkills(),
          refreshAchievements(),
          refreshAnalytics(),
          refreshNotifications(),
        ]);

        setCurrentView('assessment-result');
      } else {
        // Fallback generic submit
        const res = await api.submitAssessment({
          userId: user?.id || '',
          skillId: activeTestConfig?.domain || 'python',
          responses: questions.map(q => ({
            questionId: q.id,
            selectedOptionId: answers[q.id] || '',
            responseTimeSeconds: Math.round(totalDuration / (questions.length || 1)),
          })),
          durationSeconds: totalDuration,
        });

        setLatestResult(res.assessment, res.insight);
        if (res.user) syncUser(res.user);
        setCurrentView('assessment-result');
      }
    } catch (err: any) {
      console.error('Error submitting exam:', err);
      alert(`Submission could not be completed: ${err.message || 'Server error'}`);
      setIsSubmitting(false);
    }
  };

  // Metrics
  const answeredCount = Object.keys(answers).length + Object.keys(codeAnswers).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <h3 className="text-base font-extrabold text-slate-800">Finalizing & Grading Examination...</h3>
        <p className="text-xs text-slate-500 text-center max-w-md">
          Executing sandboxed test cases, recording verified XP rewards, and synthesizing personalized Gemini AI gap analysis.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">Loading examination environment...</p>
      </div>
    );
  }

  return (
    <div id="examination-engine" className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Top Authoritative Exam Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowExitWarningModal(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Exit Exam"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
              {activeTestConfig?.title || 'Standardized Assessment'}
            </h2>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <span>{activeTestConfig?.domain}</span>
              <span>•</span>
              <span>Question {currentIndex + 1} of {questions.length}</span>
            </div>
          </div>
        </div>

        {/* Center: Lockdown / SEB & Autosave Indicators */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          {isSebEnvironment ? (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Safe Exam Browser (SEB) Verified</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              <span>Lockdown Active</span>
            </span>
          )}

          {violationCount > 0 && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Warning {violationCount}/2</span>
            </span>
          )}

          {saveStatus === 'saving' ? (
            <span className="flex items-center space-x-1.5 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Saving responses...</span>
            </span>
          ) : saveStatus === 'error' ? (
            <span className="flex items-center space-x-1 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Offline: changes cached</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-emerald-600 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Autosaved ({lastSavedTime})</span>
            </span>
          )}
        </div>

        {/* Right: Timer & Submit Button */}
        <div className="flex items-center space-x-3">
          {/* Synchronized Timer */}
          <div
            id="exam-countdown-timer"
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold ${
              timeLeftSeconds < 180
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : timeLeftSeconds < 300
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Time Left: {timeFormatted}</span>
          </div>

          <button
            id="finish-exam-trigger-btn"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Main Examination Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Active Question Canvas */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Question Header Meta */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                    Q{currentIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Topic: {currentQ?.topicName}
                  </span>
                  <LevelBadge level={currentQ?.difficulty || 'Intermediate'} size="sm" />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleFlag}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                      flagged[currentQ?.id]
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${flagged[currentQ?.id] ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>{flagged[currentQ?.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  {answers[currentQ?.id] && (
                    <button
                      onClick={handleClearResponse}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      Clear Response
                    </button>
                  )}
                </div>
              </div>

              {/* Question Statement */}
              <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {currentQ?.question}
              </div>

              {/* Code Snippet for MCQ if present */}
              {currentQ?.codeSnippet && (
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Interactive Coding Challenge Mode */}
              {currentQ?.questionType === 'Coding' && currentQ.codingDetails ? (
                <div className="space-y-4 pt-2">
                  {/* Problem Details */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <p className="font-bold text-slate-800">Problem Statement:</p>
                    <p className="text-slate-600">{currentQ.codingDetails.problemStatement}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      <div>
                        <span className="font-bold text-slate-700">Input Format: </span>
                        <code className="text-slate-600">{currentQ.codingDetails.inputFormat}</code>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Constraints: </span>
                        <code className="text-slate-600">{currentQ.codingDetails.constraints}</code>
                      </div>
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                        <Code2 className="w-4 h-4 text-indigo-600" />
                        <span>Solution Code:</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <select
                          value={activeCodeLang}
                          onChange={e => setActiveCodeLang(e.target.value)}
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="javascript">JavaScript (Node.js)</option>
                          <option value="python">Python 3</option>
                        </select>
                        <button
                          onClick={handleRunCodeTest}
                          disabled={isRunningCode}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs"
                        >
                          <Play className="w-3 h-3" />
                          <span>{isRunningCode ? 'Running...' : 'Run Test Cases'}</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={12}
                      value={codeAnswers[currentQ.id]?.code || ''}
                      onChange={e => handleCodeChange(e.target.value)}
                      className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                      placeholder="// Implement solve(input) here..."
                    />
                  </div>

                  {/* Code Run Test Output */}
                  {codeRunResult && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                      codeRunResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className={codeRunResult.success ? 'text-emerald-800' : 'text-rose-800'}>
                          {codeRunResult.success ? '✓ All Sample Cases Passed!' : '✗ Some Test Cases Failed'}
                        </span>
                        <span className="text-slate-500">{codeRunResult.runtimeMs}ms</span>
                      </div>
                      <p className="text-slate-700">{codeRunResult.feedback || codeRunResult.errorMessage}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* MCQ Options List */
                <div className="space-y-2.5 pt-2">
                  {currentQ?.options.map(option => {
                    const isSelected = answers[currentQ.id] === option.id;
                    return (
                      <div
                        key={option.id}
                        id={`option-${currentQ.id}-${option.id}`}
                        onClick={() => handleSelectOption(option.id)}
                        className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs ring-1 ring-indigo-500'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="leading-relaxed">{option.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                id="prev-question-btn"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                  currentIndex === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>

              <div className="text-xs text-slate-400 font-medium">
                {currentIndex + 1} of {questions.length}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  id="next-question-btn"
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="final-review-submit-btn"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <span>Review & Submit</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette & Overview */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Question Palette</h3>
              <p className="text-[11px] text-slate-500">Jump to any question instantly</p>
            </div>

            {/* Question Palette Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id] || codeAnswers[q.id]);
                const isFlagged = Boolean(flagged[q.id]);

                let style = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isCurrent) {
                  style = 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/40 font-bold';
                } else if (isFlagged) {
                  style = 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
                } else if (isAnswered) {
                  style = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    id={`palette-btn-${idx + 1}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-medium flex items-center justify-center transition-all ${style}`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Flagged ({flaggedCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600" />
                <span>Current</span>
              </div>
            </div>

            {/* Negative Marking reminder */}
            {activeTestConfig?.negativeMarking && activeTestConfig.negativeMarking > 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 leading-relaxed">
                <strong>Penalty Notice:</strong> Incorrect answers incur -{activeTestConfig.negativeMarking * 100}% negative marking. Skip questions you are uncertain of.
              </div>
            ) : null}

            {/* Final Submission Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Finalize & Submit Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Confirm Exam Submission</h3>
                <p className="text-xs text-slate-500">Review your answered questions</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Questions:</span>
                <strong className="text-slate-900">{questions.length}</strong>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Answered:</span>
                <span>{answeredCount}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Flagged for Review:</span>
                <span>{flaggedCount}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold">
                <span>Unanswered:</span>
                <span>{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                You still have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. You cannot change your answers after submission.
              </p>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Return to Exam
              </button>
              <button
                id="modal-confirm-submit-btn"
                onClick={handleSubmitAssessment}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Exam Warning Modal */}
      {showExitWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-base font-extrabold text-slate-900">Leave Active Examination?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your exam timer will <strong>continue running on the server</strong> even if you leave this page.
              Your current responses have been autosaved.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowExitWarningModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Resume Exam
              </button>
              <button
                onClick={() => {
                  setShowExitWarningModal(false);
                  setCurrentView('tests');
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                Exit to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First Violation Warning Modal (Timer Paused) */}
      {violationModal.show && !violationModal.isTerminated && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border-2 border-amber-400">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Security Alert • Lockdown Triggered
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  Warning 1 of 2: Examination Environment Alert
                </h3>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <p className="font-bold text-sm text-amber-900">
                Warning 1 of 2: You have attempted to leave the examination environment. Please remain in the assessment portal.
              </p>
              {violationModal.details && (
                <p className="text-amber-800 bg-white/70 p-2 rounded-lg border border-amber-200/60 font-mono text-[11px]">
                  <strong>Incident logged:</strong> {violationModal.details}
                </p>
              )}
              <div className="flex items-center space-x-1.5 text-slate-600 text-[11px] pt-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Assessment timer has been temporarily paused while this warning is displayed.</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Strict 2-Violation Examination Policy:</p>
              <p className="text-[11px] leading-relaxed">
                If another violation (such as Alt+Tab, closing tabs, opening new windows, or losing focus) is detected,
                your examination attempt will be <strong>immediately terminated</strong> and submitted automatically with all answers scored to that point.
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                id="btn-return-active-assessment"
                onClick={handleReturnFromFirstWarning}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>I Understand, Return to Active Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second Violation Final Warning & Termination Modal */}
      {violationModal.show && violationModal.isTerminated && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border-2 border-rose-500">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Examination Terminated
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  Final Warning: Security Violations Limit Exceeded
                </h3>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-2.5">
              <p className="font-bold text-sm text-rose-900">
                Warning 2 of 2: Another examination violation has been detected.
              </p>
              <p className="leading-relaxed">
                Your examination has been <strong>automatically terminated</strong> in accordance with institutional security policies.
                Attempt status has been finalized as <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-rose-900 font-bold">terminated_due_to_violations</code>.
              </p>
              {violationModal.details && (
                <div className="p-2.5 bg-white/80 rounded-xl border border-rose-200 text-[11px] font-mono text-rose-900">
                  <strong>Trigger:</strong> {violationModal.details}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Answers Preserved & Scored Securely</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                All {answeredCount} responses and code submissions entered prior to termination were securely evaluated.
                Your partial marks have been archived, and you are eligible to review the attempt report or request a verified reattempt according to the test retake policy.
              </p>
              <div className="pt-1 text-[11px] text-slate-500 flex justify-between border-t border-slate-200">
                <span>Attempt ID: <code className="text-slate-700 font-mono">{activeAttempt?.id}</code></span>
                <span>Violations Logged: <strong className="text-rose-600">2 of 2</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Redirecting to results in {terminationCountdown}s...
              </span>
              <button
                id="btn-view-terminated-results"
                onClick={handleViewTerminatedResult}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>View Results & Retake Policy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

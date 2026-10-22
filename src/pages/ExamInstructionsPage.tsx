import React, { useState } from 'react';
import {
  Shield,
  Clock,
  Award,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  FileText,
  Lock,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LevelBadge } from '../components/common/LevelBadge';

export const ExamInstructionsPage: React.FC = () => {
  const {
    activeTestConfig,
    setActiveAttempt,
    setActiveExamQuestions,
    setCurrentView,
  } = useData();
  const { user } = useAuth();

  const [acknowledged, setAcknowledged] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!activeTestConfig) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">No assessment selected.</p>
        <button
          onClick={() => setCurrentView('tests')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  const handleStartExam = async () => {
    if (!acknowledged) return;
    setIsStarting(true);
    setErrorMessage(null);

    try {
      const res = await api.startTestAttempt(activeTestConfig.id);
      setActiveAttempt(res.attempt);
      setActiveExamQuestions(res.questions);
      setCurrentView('assessment');
    } catch (err: any) {
      console.error('Failed to start exam:', err);
      setErrorMessage(err.message || 'Unable to launch examination. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div id="exam-instructions-view" className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              {activeTestConfig.category} Assessment
            </span>
            <LevelBadge level={activeTestConfig.difficulty} size="sm" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {activeTestConfig.title}
          </h2>
          <p className="text-xs text-slate-300">
            Domain: {activeTestConfig.domain}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Duration</span>
            <p className="font-extrabold text-slate-900 text-sm flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeTestConfig.durationMinutes} Minutes</span>
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Questions</span>
            <p className="font-extrabold text-slate-900 text-sm flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeTestConfig.questionCount} Questions</span>
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Max Marks</span>
            <p className="font-extrabold text-slate-900 text-sm flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeTestConfig.maxMarks} Marks</span>
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Negative Marks</span>
            <p className="font-extrabold text-slate-900 text-sm">
              {activeTestConfig.negativeMarking > 0 ? `-${activeTestConfig.negativeMarking * 100}%` : 'None'}
            </p>
          </div>
        </div>

        {/* Instructions Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Examination Rules & Instructions</span>
            </h3>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-700 leading-relaxed">
              {(activeTestConfig.instructions || []).map((ins, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="font-bold text-indigo-600 mt-0.5">•</span>
                  <span>{ins}</span>
                </div>
              ))}

              {/* Strict Examination Lockdown & SEB Protocol */}
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-1.5 text-rose-950">
                <div className="flex items-center space-x-1.5 font-bold text-rose-800">
                  <Shield className="w-4 h-4 text-rose-600" />
                  <span>Strict 2-Warning Exit & Shortcut Policy:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-900 font-normal">
                  Leaving the portal, switching tabs, minimizing the window, or pressing prohibited shortcuts (such as Alt+Tab, Ctrl+Tab, Ctrl+W, F5, or Esc) will register a security violation.
                  The <strong>1st violation</strong> pauses the timer with an on-screen warning. A <strong>2nd violation</strong> automatically terminates and submits your assessment.
                </p>
              </div>

              {/* Safe Exam Browser (SEB) Integration Card */}
              <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-950">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 font-bold text-indigo-900 text-xs">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Safe Exam Browser (SEB) Lockdown:</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    For institutional proctoring, download the official .seb configuration file to lock shortcuts and navigation.
                  </p>
                </div>
                <a
                  href={api.getSebConfigUrl(activeTestConfig.id)}
                  download={`${activeTestConfig.id}-lockdown.seb`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors inline-flex items-center space-x-1.5 shadow-2xs"
                >
                  <Lock className="w-3 h-3" />
                  <span>Download .seb File</span>
                </a>
              </div>

              <div className="flex items-start space-x-2 text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Server-Authoritative Timer:</strong> The countdown timer runs on the central server.
                  Closing the browser tab will <strong>not</strong> pause your exam. Your answers autosave automatically every 15 seconds.
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Honor Code Checkbox */}
          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <input
              id="acknowledge-rules-checkbox"
              type="checkbox"
              checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 leading-normal">
              I have read and agree to follow all instructions. I confirm that I will complete this assessment independently under authentic exam standards.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 gap-3">
            <button
              onClick={() => setCurrentView('tests')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </button>

            <button
              id="confirm-start-exam-btn"
              onClick={handleStartExam}
              disabled={!acknowledged || isStarting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-all ${
                acknowledged && !isStarting
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 hover:scale-105'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{isStarting ? 'Launching Exam...' : 'Begin Examination'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

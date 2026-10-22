import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  Bot,
  Map,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LevelBadge } from '../components/common/LevelBadge';
import { ReattemptEligibility } from '../types';

export const ReattemptManagementPage: React.FC = () => {
  const {
    eligibleReattempts,
    refreshEligibleReattempts,
    startTestReattempt,
    setCurrentView,
    setSelectedSkillId,
    setTutorInitialPrompt,
    viewSkillRoadmap,
  } = useData();
  const { user } = useAuth();

  const [loadingTestId, setLoadingTestId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ready' | 'cooldown' | 'terminated'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshEligibleReattempts();
  }, []);

  const handleLaunchReattempt = async (assessmentId: string) => {
    setLoadingTestId(assessmentId);
    setErrorMessage(null);
    try {
      await startTestReattempt(assessmentId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start reattempt. Please check cooldown or attempt limits.');
      setLoadingTestId(null);
    }
  };

  const handleAskTutorAboutFailedTest = (item: ReattemptEligibility) => {
    const prompt = `Hi Socrates! I recently attempted the "${item.assessmentTitle}" (${item.domain}) assessment and scored ${item.lastScore}%, which is below the passing mark of ${item.passPercentage}%. ${
      item.lastAttemptStatus === 'terminated_due_to_violations'
        ? `Additionally, my attempt was terminated due to environment violations: "${item.lastTerminationReason}".`
        : ''
    } Could you please help me identify key conceptual focus areas for ${item.domain}, provide a structured revision checklist, and give me a quick diagnostic question to practice before I take my next reattempt?`;

    setTutorInitialPrompt(prompt);
    setCurrentView('ai-tutor');
  };

  const filteredItems = eligibleReattempts.filter(item => {
    const matchesSearch =
      item.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'ready') return item.isEligible && !item.inCooldown;
    if (selectedFilter === 'cooldown') return item.inCooldown;
    if (selectedFilter === 'terminated') return item.lastAttemptStatus === 'terminated_due_to_violations';
    return true;
  });

  const readyCount = eligibleReattempts.filter(r => r.isEligible && !r.inCooldown).length;
  const inCooldownCount = eligibleReattempts.filter(r => r.inCooldown).length;
  const terminatedCount = eligibleReattempts.filter(r => r.lastAttemptStatus === 'terminated_due_to_violations').length;

  return (
    <div id="reattempt-management-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center space-x-1">
              <RotateCcw className="w-3 h-3 text-amber-300" />
              <span>Dedicated Reattempt Portal</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
              {eligibleReattempts.length} Eligible for Retake
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Failed Assessment & Reattempt Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Review your previous scores, examination violation logs, and cooldown deadlines.
            Launch a verified new attempt record without overwriting past attempts, score histories, or security logs.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setCurrentView('tests')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center space-x-2"
          >
            <span>All Standard Tests</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Failed / Retakes</span>
          <p className="text-2xl font-black text-slate-900">{eligibleReattempts.length}</p>
          <p className="text-[11px] text-slate-500">Assessments needing score clearance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Eligible Now</span>
          <p className="text-2xl font-black text-emerald-600">{readyCount}</p>
          <p className="text-[11px] text-slate-500">Cooldown cleared, ready to retake</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-600">In Cooldown</span>
          <p className="text-2xl font-black text-amber-600">{inCooldownCount}</p>
          <p className="text-[11px] text-slate-500">Study interval required before reattempt</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-rose-600">Terminated by Policy</span>
          <p className="text-2xl font-black text-rose-600">{terminatedCount}</p>
          <p className="text-[11px] text-slate-500">Exceeded 2-violation security limit</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Reattempt Launch Alert</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search eligible reattempts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: `All (${eligibleReattempts.length})` },
            { id: 'ready', label: `Ready (${readyCount})` },
            { id: 'cooldown', label: `Cooldown (${inCooldownCount})` },
            { id: 'terminated', label: `Terminated (${terminatedCount})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reattempts Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-slate-900">
              {eligibleReattempts.length === 0
                ? 'No Pending Reattempts'
                : 'No assessments matched your filter criteria'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {eligibleReattempts.length === 0
                ? 'All your past assessments have been cleared successfully, or you do not have any failed attempts. Continue learning or explore new tests.'
                : 'Try adjusting your search query or reset the filter to view all eligible reattempts.'}
            </p>
          </div>
          <button
            onClick={() => setCurrentView('tests')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Explore Test Portal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map(item => {
            const isTerminated = item.lastAttemptStatus === 'terminated_due_to_violations';
            const attemptsRemaining = item.remainingAttempts;
            const nextAttemptNumber = item.attemptCount + 1;

            return (
              <div
                key={item.assessmentId}
                id={`reattempt-card-${item.assessmentId}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Top status indicator line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isTerminated ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                />

                <div className="space-y-3">
                  {/* Category and Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <LevelBadge level={item.difficulty} size="sm" />
                    </div>

                    {isTerminated ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        <span>Terminated by Policy</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Score Below Passing</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Domain */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                      {item.assessmentTitle}
                    </h3>
                    <p className="text-xs text-slate-500">Domain: {item.domain} • {item.durationMinutes} Minutes</p>
                  </div>

                  {/* Score & Passing Bar */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Previous Score Obtained:</span>
                      <strong className={`font-black ${item.lastScore >= item.passPercentage ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.lastScore}%
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Passing Score Required:</span>
                      <strong className="text-slate-900 font-extrabold">{item.passPercentage}%</strong>
                    </div>

                    {/* Visual Progress Comparison */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full ${item.lastScore >= item.passPercentage ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, item.lastScore)}%` }}
                      />
                      {/* Passing Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                        style={{ left: `${item.passPercentage}%` }}
                        title={`Passing Threshold: ${item.passPercentage}%`}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Attempts Consumed: <strong>{item.attemptCount} of {item.maxAttempts}</strong></span>
                      <span>Remaining Attempts: <strong className="text-indigo-600">{attemptsRemaining}</strong></span>
                    </div>
                  </div>

                  {/* Specific Termination or Cooldown Notice */}
                  {isTerminated && item.lastTerminationReason && (
                    <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                      <div className="flex items-center space-x-1 font-bold text-rose-800">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Security Violation Recorded:</span>
                      </div>
                      <p className="text-[11px] text-rose-800/90 leading-relaxed font-normal">
                        {item.lastTerminationReason}
                      </p>
                    </div>
                  )}

                  {item.inCooldown && (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Cooldown active: Please wait <strong>{item.cooldownRemainingMinutes} minute(s)</strong> before starting your next attempt.
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    id={`btn-tutor-${item.assessmentId}`}
                    onClick={() => handleAskTutorAboutFailedTest(item)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    title="Consult Socrates AI to resolve weak areas before retrying"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ask Socrates AI</span>
                  </button>

                  <button
                    id={`btn-roadmap-${item.assessmentId}`}
                    onClick={() => viewSkillRoadmap(item.domain.toLowerCase())}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Map className="w-3.5 h-3.5 text-slate-600" />
                    <span>Roadmap</span>
                  </button>

                  <div className="flex-1 w-full sm:w-auto flex justify-end">
                    {item.isEligible ? (
                      <button
                        id={`btn-start-reattempt-${item.assessmentId}`}
                        onClick={() => handleLaunchReattempt(item.assessmentId)}
                        disabled={loadingTestId === item.assessmentId}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2"
                      >
                        {loadingTestId === item.assessmentId ? (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Launching Reattempt...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Start Reattempt (Attempt #{nextAttemptNumber})</span>
                          </>
                        )}
                      </button>
                    ) : item.inCooldown ? (
                      <button
                        disabled
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center justify-center space-x-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>In Cooldown ({item.cooldownRemainingMinutes}m)</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
                      >
                        Attempts Exhausted ({item.maxAttempts} of {item.maxAttempts})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security & Retake Policy Explanation Footer */}
      <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-slate-800">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Institutional Examination Integrity & Reattempt Policy</span>
        </div>
        <p className="leading-relaxed">
          Each reattempt generates an independent assessment session record. Original answers, marks obtained, timestamps, and violation logs from past attempts remain permanently archived in your academic audit trail.
          Attempt limits and cooldown intervals are server-enforced and cannot be reset by client-side browser actions.
        </p>
      </div>
    </div>
  );
};

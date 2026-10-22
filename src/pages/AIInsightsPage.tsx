import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  Map,
  Bot,
  Layers,
  HelpCircle,
  Clock,
  RotateCcw,
  Zap,
  Target,
  ChevronRight,
  Code2,
  BookOpen,
  PlusCircle,
  X,
  FileCode,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LevelBadge } from '../components/common/LevelBadge';
import { AIInsight, SkillLevel } from '../types';
import { api } from '../services/api';

export const AIInsightsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    activeInsightId,
    setActiveInsightId,
    latestAIInsight,
    userAIInsights,
    skills,
    viewSkillRoadmap,
    setTutorInitialPrompt,
    setCurrentView,
    startSkillAssessment,
    selectedSkillId,
    diagnoseSkillWithAI,
  } = useData();

  // Selected insight state
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(() => {
    if (activeInsightId && userAIInsights.length > 0) {
      return userAIInsights.find(i => i.id === activeInsightId) || userAIInsights[0];
    }
    return latestAIInsight || (userAIInsights.length > 0 ? userAIInsights[0] : null);
  });

  const [isLoading, setIsLoading] = useState(false);

  // Modal for running on-demand AI diagnostic
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [diagnosticSkillId, setDiagnosticSkillId] = useState<string>(skills[0]?.id || 'python');
  const [diagnosticLevel, setDiagnosticLevel] = useState<SkillLevel>('Intermediate');
  const [diagnosticConfidence, setDiagnosticConfidence] = useState<number>(3);
  const [diagnosticNotes, setDiagnosticNotes] = useState<string>('');
  const [isGeneratingDiagnostic, setIsGeneratingDiagnostic] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // State for interactive Deep Dive modal
  const [activeDeepDiveTopic, setActiveDeepDiveTopic] = useState<{ topic: string; type: 'gap' | 'misconception' } | null>(null);
  const [deepDiveData, setDeepDiveData] = useState<any | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Sync currentInsight when activeInsightId or userAIInsights change
  useEffect(() => {
    if (activeInsightId && userAIInsights.length > 0) {
      const found = userAIInsights.find(i => i.id === activeInsightId);
      if (found) {
        setCurrentInsight(found);
        return;
      }
    }
    if (!currentInsight && userAIInsights.length > 0) {
      setCurrentInsight(userAIInsights[0]);
    } else if (latestAIInsight && !currentInsight) {
      setCurrentInsight(latestAIInsight);
    }
  }, [activeInsightId, userAIInsights, latestAIInsight]);

  // Load insight if specific ID was requested but not in memory
  useEffect(() => {
    async function load() {
      if (activeInsightId && (!currentInsight || currentInsight.id !== activeInsightId)) {
        setIsLoading(true);
        try {
          const res = await api.getAIInsight(activeInsightId);
          if (res?.insight) {
            setCurrentInsight(res.insight);
          }
        } catch (e) {
          console.warn('Error fetching AI insight by id:', e);
        } finally {
          setIsLoading(false);
        }
      }
    }
    load();
  }, [activeInsightId]);

  const handleSelectInsight = (insight: AIInsight) => {
    setCurrentInsight(insight);
    setActiveInsightId(insight.id);
  };

  const handleAskTutorTopic = (topic: string, reason?: string) => {
    setTutorInitialPrompt(
      `Hi Socrates! My AI diagnostic report for ${currentInsight?.skillName || 'programming'} flagged "${topic}" as a high-priority gap (${reason || 'needs mastery'}). Can you give me an intuitive explanation, common pitfalls to avoid, and a practical code challenge?`
    );
    setCurrentView('ai-tutor');
  };

  const handleOpenDeepDive = async (topic: string, type: 'gap' | 'misconception') => {
    setActiveDeepDiveTopic({ topic, type });
    setSelectedQuizOption(null);
    setShowQuizResult(false);
    setIsLoadingDeepDive(true);
    setDeepDiveData(null);
    try {
      const res = await api.getGapDeepDive({
        skillName: currentInsight?.skillName || 'Computer Science',
        topicOrGap: topic,
        type,
      });
      if (res?.deepDive) {
        setDeepDiveData(res.deepDive);
      }
    } catch (err) {
      console.warn('Error fetching deep dive:', err);
    } finally {
      setIsLoadingDeepDive(false);
    }
  };

  const handleRunNewDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingDiagnostic(true);
    setGenerationStep('Analyzing developer context with Gemini 3.8 Flash...');

    try {
      const skill = skills.find(s => s.id === diagnosticSkillId);
      const skillName = skill?.name || diagnosticSkillId;

      setTimeout(() => setGenerationStep('Calibrating cognitive model & detecting blindspots...'), 1200);
      setTimeout(() => setGenerationStep('Synthesizing priority remediation plan...'), 2400);

      const newInsight = await diagnoseSkillWithAI({
        skillId: diagnosticSkillId,
        skillName,
        currentLevel: diagnosticLevel,
        selfConfidence: diagnosticConfidence,
        notes: diagnosticNotes,
      });

      setCurrentInsight(newInsight);
      setActiveInsightId(newInsight.id);
      setIsDiagnosticModalOpen(false);
      setDiagnosticNotes('');
    } catch (err) {
      console.error('Failed to run diagnostic:', err);
      alert('Unable to synthesize AI diagnostic at this moment. Please check network connection and try again.');
    } finally {
      setIsGeneratingDiagnostic(false);
      setGenerationStep('');
    }
  };

  return (
    <div id="ai-insights-page" className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Cognitive Diagnostic Engine</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Powered by Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            AI Skill Gap Diagnostics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-0.5">
            Real-time pedagogical evaluation synthesizing your code telemetry, response times, and self-confidence survey to detect subtle blindspots before real interviews and production code.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="insights-run-diagnostic-btn"
            onClick={() => setIsDiagnosticModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Run New AI Diagnostic (+75 XP)</span>
          </button>
        </div>
      </div>

      {/* Available Insight Reports Tab Bar */}
      {userAIInsights.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2">
            Reports:
          </span>
          {userAIInsights.map(report => {
            const isSelected = currentInsight?.id === report.id;
            return (
              <button
                key={report.id}
                onClick={() => handleSelectInsight(report)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{report.skillName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                    isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {report.overallScore}%
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State fallback if somehow zero insights exist */}
      {!currentInsight ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-xl mx-auto space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">No Skill Diagnostics Generated Yet</h3>
            <p className="text-xs text-slate-500">
              Run an on-demand AI diagnostic analysis on any technical skill to instantly uncover your knowledge gaps, mental model bugs, and a step-by-step remediation roadmap.
            </p>
          </div>
          <button
            onClick={() => setIsDiagnosticModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700"
          >
            Synthesize First AI Diagnostic Report
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Hero Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>Gemini 3.8 Flash Diagnostic</span>
                  </span>
                  <LevelBadge level={currentInsight.classifiedLevel} size="sm" />
                  <span className="text-[11px] font-semibold text-slate-300">
                    Generated {new Date(currentInsight.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-baseline space-x-4">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {currentInsight.skillName}
                  </h2>
                  <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10 text-cyan-300 text-xs font-black">
                    <Zap className="w-3.5 h-3.5 fill-cyan-300" />
                    <span>{currentInsight.overallScore}% Proficiency Baseline</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {currentInsight.confidenceVsActualAnalysis}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
                <button
                  id="insights-view-roadmap-btn"
                  onClick={() => viewSkillRoadmap(selectedSkillId)}
                  className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-105"
                >
                  <Map className="w-4 h-4" />
                  <span>Generate Custom Roadmap</span>
                </button>
                <button
                  id="insights-open-tutor-btn"
                  onClick={() => {
                    setTutorInitialPrompt(
                      `Hi Socrates! I'm reviewing my AI Diagnostic Report for ${currentInsight.skillName}. My current proficiency is ${currentInsight.overallScore}% (${currentInsight.classifiedLevel}). Key gaps include: ${currentInsight.knowledgeGaps.join(', ')}. Where should we begin?`
                    );
                    setCurrentView('ai-tutor');
                  }}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Bot className="w-4 h-4 text-cyan-300" />
                  <span>Consult Socrates AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Observation & Cognitive Calibration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center space-x-2 text-indigo-600">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Key Cognitive Observation</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                "{currentInsight.keyObservation}"
              </p>
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-indigo-900">Recommended Next Step:</strong>{' '}
                  <span>{currentInsight.recommendedNextStep}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center space-x-2 text-emerald-600">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Career Competency & Industry Alignment</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Target Role Readiness ({user?.careerGoal || 'Software Engineer'})</span>
                  <span className="text-emerald-700 font-extrabold">{Math.min(95, currentInsight.overallScore + 4)}% Ready</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                    style={{ width: `${Math.min(95, currentInsight.overallScore + 4)}%` }}
                  />
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Industry Competency Calibration</span>
                  </div>
                  <p className="text-emerald-800">
                    Your baseline demonstrates core programming aptitude. Eliminating the {currentInsight.knowledgeGaps.length} identified knowledge gaps will transition your profile from standard syntax execution to senior systems thinking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confirmed Strengths */}
            <div className="p-6 rounded-2xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Demonstrated Strengths ({currentInsight.strengths.length})
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Mastered
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Core competencies where your understanding and code implementation showed sound mental models and syntactic fluency.
              </p>
              <div className="space-y-2">
                {currentInsight.strengths.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Weak Areas */}
            <div className="p-6 rounded-2xl bg-white border border-rose-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-700">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Identified Weak Areas ({currentInsight.weaknesses.length})
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  Needs Practice
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sub-topics requiring targeted problem drills before taking placement examinations and system design interviews.
              </p>
              <div className="space-y-2">
                {currentInsight.weaknesses.map((w, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-rose-900 font-medium"
                  >
                    <div className="flex items-center space-x-2.5 truncate pr-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="truncate">{w}</span>
                    </div>
                    <button
                      id={`ask-tutor-weak-${idx}`}
                      onClick={() => handleAskTutorTopic(w)}
                      className="text-[10px] font-bold bg-white text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg shadow-2xs shrink-0 hover:bg-rose-50 flex items-center space-x-1"
                    >
                      <Bot className="w-3 h-3 text-rose-600" />
                      <span>Learn with Socrates</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deep Knowledge Gaps & Common Misconceptions with Deep Dive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Knowledge Gaps */}
            <div className="p-6 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-700">
                  <Layers className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Underlying Knowledge Gaps</h3>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Root Cause
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Fundamental architectural or algorithmic concepts that must be solidified to unlock advanced engineering.
              </p>
              <div className="space-y-3">
                {currentInsight.knowledgeGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{gap}</span>
                    </div>
                    <button
                      onClick={() => handleOpenDeepDive(gap, 'gap')}
                      className="text-[10px] font-bold bg-white text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100 shrink-0 self-end sm:self-auto flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>AI Deep Dive</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cognitive Misconceptions */}
            <div className="p-6 rounded-2xl bg-white border border-purple-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-700">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">Common Misconceptions Detected</h3>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Mental Model Bugs
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Cognitive fallacies and anti-patterns that lead to subtle runtime bugs under production concurrency or memory pressure.
              </p>
              <div className="space-y-3">
                {currentInsight.misconceptions.map((misc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                      <span className="font-medium">{misc}</span>
                    </div>
                    <button
                      onClick={() => handleOpenDeepDive(misc, 'misconception')}
                      className="text-[10px] font-bold bg-white text-purple-900 border border-purple-300 px-2.5 py-1 rounded-lg hover:bg-purple-100 shrink-0 self-end sm:self-auto flex items-center space-x-1"
                    >
                      <Code2 className="w-3 h-3 text-purple-600" />
                      <span>Explain Bug</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ranked Priority Topics to Upskill */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ranked Priority Action Plan
                </h3>
                <p className="text-xs text-slate-500">
                  Urgency-ordered learning modules calibrated to provide maximum return on your study hours.
                </p>
              </div>
              <button
                onClick={() => viewSkillRoadmap(selectedSkillId)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>View Full Roadmap</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentInsight.priorityTopics.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          pt.priority === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : pt.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {pt.priority} Priority
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Step {idx + 1}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{pt.topic}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{pt.reason}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      id={`study-priority-${idx}`}
                      onClick={() => handleAskTutorTopic(pt.topic, pt.reason)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                    >
                      <span>Drill with AI</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleOpenDeepDive(pt.topic, 'gap')}
                      className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Deep Dive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Run New On-Demand AI Diagnostic */}
      {isDiagnosticModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => !isGeneratingDiagnostic && setIsDiagnosticModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  Instant Analysis
                </span>
                <span className="text-xs text-slate-400">Gemini 3.8 Flash</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Synthesize AI Skill Diagnostic
              </h3>
              <p className="text-xs text-slate-500">
                Select any technical skill to evaluate your knowledge gaps, mental model bugs, and priority topics.
              </p>
            </div>

            {isGeneratingDiagnostic ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-spin">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Synthesizing Diagnostic with Gemini...</h4>
                  <p className="text-xs text-indigo-600 font-medium">{generationStep || 'Processing...'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRunNewDiagnostic} className="space-y-4">
                {/* Skill selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Technical Skill</label>
                  <select
                    value={diagnosticSkillId}
                    onChange={e => setDiagnosticSkillId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {skills.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Perceived level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Current Experience Tier</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'] as SkillLevel[]).map(lvl => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setDiagnosticLevel(lvl)}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                          diagnosticLevel === lvl
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Self Confidence Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Self-Assessed Confidence:</span>
                    <span className="text-indigo-600">{diagnosticConfidence} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={diagnosticConfidence}
                    onChange={e => setDiagnosticConfidence(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Novice / Hesitant</span>
                    <span>Fully Confident</span>
                  </div>
                </div>

                {/* Optional focus notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Specific Learning Goal or Known Weaknesses <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={diagnosticNotes}
                    onChange={e => setDiagnosticNotes(e.target.value)}
                    placeholder="e.g., Preparing for backend interviews, struggling with AsyncIO, memory leaks, or recursive data structures..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsDiagnosticModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run AI Diagnostic (+75 XP)</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Interactive AI Deep Dive on Specific Knowledge Gap / Misconception */}
      {activeDeepDiveTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveDeepDiveTopic(null)}
              className="absolute top-6 right-6 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                  {activeDeepDiveTopic.type === 'gap' ? 'Knowledge Gap Remediation' : 'Mental Model Bug Fix'}
                </span>
                <span className="text-xs text-slate-400">{currentInsight?.skillName}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {activeDeepDiveTopic.topic}
              </h3>
            </div>

            {isLoadingDeepDive ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-600">Generating architectural breakdown with Gemini...</p>
              </div>
            ) : deepDiveData ? (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1 leading-relaxed">
                  <span className="font-bold text-indigo-900 block">Why this matters in production:</span>
                  <p>{deepDiveData.executiveSummary}</p>
                </div>

                {/* Root Cause Analysis */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Underlying Root Cause Analysis
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {deepDiveData.rootCauseAnalysis}
                  </p>
                </div>

                {/* Code Anti-Pattern vs Fix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-rose-700 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Flawed Anti-Pattern:</span>
                    </span>
                    <pre className="p-3 rounded-xl bg-slate-900 text-rose-300 text-[11px] font-mono overflow-x-auto leading-relaxed border border-rose-900/50">
                      <code>{deepDiveData.antipatternCode}</code>
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Idiomatic Corrected Pattern:</span>
                    </span>
                    <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-[11px] font-mono overflow-x-auto leading-relaxed border border-emerald-900/50">
                      <code>{deepDiveData.correctedCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Core Architectural Rules
                  </h4>
                  <div className="space-y-1.5">
                    {deepDiveData.bestPractices?.map((bp: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{bp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Self-Check Quiz Question */}
                {deepDiveData.selfCheckQuestion && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                      <HelpCircle className="w-4 h-4" />
                      <span>Interactive Socratic Check:</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-snug">
                      {deepDiveData.selfCheckQuestion.question}
                    </p>
                    <div className="space-y-2">
                      {deepDiveData.selfCheckQuestion.options.map((opt: string, optIdx: number) => {
                        const isChosen = selectedQuizOption === optIdx;
                        const isCorrect = deepDiveData.selfCheckQuestion.correctIndex === optIdx;
                        let btnStyle = 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100';
                        if (showQuizResult) {
                          if (isCorrect) btnStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                          else if (isChosen) btnStyle = 'bg-rose-100 text-rose-900 border-rose-300';
                        } else if (isChosen) {
                          btnStyle = 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold';
                        }
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setSelectedQuizOption(optIdx);
                              setShowQuizResult(true);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showQuizResult && isCorrect && <Check className="w-4 h-4 text-emerald-700" />}
                          </button>
                        );
                      })}
                    </div>
                    {showQuizResult && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900">Explanation:</span>
                        <p>{deepDiveData.selfCheckQuestion.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      handleAskTutorTopic(activeDeepDiveTopic.topic);
                      setActiveDeepDiveTopic(null);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Practice further with Socrates AI Tutor</span>
                  </button>
                  <button
                    onClick={() => setActiveDeepDiveTopic(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    Close Deep Dive
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Could not retrieve deep dive content.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

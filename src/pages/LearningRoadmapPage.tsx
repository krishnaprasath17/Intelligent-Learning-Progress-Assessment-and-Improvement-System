import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Map,
  Sparkles,
  CheckCircle2,
  Circle,
  BookOpen,
  Code2,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  RotateCcw,
  Bot,
  Target,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LevelBadge } from '../components/common/LevelBadge';
import { api } from '../services/api';

export const LearningRoadmapPage: React.FC = () => {
  const {
    selectedSkillId,
    currentRoadmap,
    loadRoadmap,
    toggleMilestone,
    startSkillAssessment,
    setTutorInitialPrompt,
    setCurrentView,
  } = useData();
  const { user } = useAuth();

  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (selectedSkillId) {
      loadRoadmap(selectedSkillId);
    }
  }, [selectedSkillId]);

  const roadmap = currentRoadmap;

  const handleToggle = async (milestoneId: string) => {
    if (!roadmap) return;
    await toggleMilestone(roadmap.skillId, milestoneId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // safe fallback
    }
  };

  const handleRegenerate = async () => {
    if (!roadmap) return;
    setIsRegenerating(true);
    try {
      await api.regenerateRoadmap({
        userId: user?.id || '',
        skillId: roadmap.skillId,
        skillName: roadmap.skillName,
        currentLevel: roadmap.currentLevel,
        weakTopics: roadmap.milestones.flatMap(m => m.topics),
        strongTopics: [],
      });
      await loadRoadmap(roadmap.skillId);
    } catch (e) {
      console.error('Failed to regenerate roadmap:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAskTutorMilestone = (milestone: any) => {
    setTutorInitialPrompt(`Hi Socrates! I'm working on ${roadmap?.skillName} ${milestone.title}. Can you guide me through the hands-on exercise: "${milestone.practiceExercise?.task}"?`);
    setCurrentView('ai-tutor');
  };

  if (!roadmap) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Your personalized roadmap will be generated after your first assessment.</p>
        <button onClick={() => startSkillAssessment(selectedSkillId)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
          Complete Assessment
        </button>
      </div>
    );
  }

  const completionPct = Math.round((roadmap.completedMilestones / roadmap.totalMilestones) * 100);

  return (
    <div id="learning-roadmap-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Roadmap Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Personalized GenAI Upskilling Path</span>
            </span>
            <span className="text-xs text-slate-300">
              {roadmap.estimatedWeeks} Weeks • {roadmap.milestones.length} Milestones
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {roadmap.skillName} Upskilling Roadmap
          </h1>

          <div className="flex items-center space-x-2 pt-1 text-xs">
            <span className="text-slate-300">Current Level:</span>
            <LevelBadge level={roadmap.currentLevel} size="sm" />
            <span className="text-slate-400">→</span>
            <span className="text-slate-300">Target Level:</span>
            <LevelBadge level={roadmap.targetLevel} size="sm" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            id="regenerate-roadmap-btn"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Path with AI'}</span>
          </button>

          <button
            id="roadmap-take-reassessment-btn"
            onClick={() => startSkillAssessment(roadmap.skillId)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
          >
            <Target className="w-4 h-4" />
            <span>Take Progress Check</span>
          </button>
        </div>
      </div>

      {/* Progress Metric Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900">Overall Roadmap Progress</h3>
            <span className="text-xs font-bold text-blue-600">
              {roadmap.completedMilestones} of {roadmap.totalMilestones} Completed ({completionPct}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark milestones as completed after finishing the recommended exercises to gain XP points.
          </p>
        </div>

        <div className="w-full sm:w-64 h-3 bg-slate-100 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* 4 Weekly Milestone Cards */}
      <div className="space-y-4">
        {roadmap.milestones.map((m, idx) => (
          <div
            key={m.id}
            id={`roadmap-milestone-${m.weekNumber}`}
            className={`p-6 rounded-2xl border transition-all ${
              m.completed
                ? 'bg-emerald-50/20 border-emerald-200 shadow-xs'
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              {/* Left Info */}
              <div className="flex items-start space-x-4">
                <button
                  id={`toggle-milestone-${m.id}`}
                  onClick={() => handleToggle(m.id)}
                  className="mt-1 shrink-0 transition-transform hover:scale-110"
                  title="Mark milestone completed"
                >
                  {m.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 hover:text-blue-500" />
                  )}
                </button>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      Week {m.weekNumber}
                    </span>
                    {m.completed ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        Completed (+100 XP)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Rewards +100 XP</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{m.description}</p>

                  {/* Focus Topics Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.topics.map((t, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Action */}
              <div className="shrink-0 flex items-center space-x-2">
                <button
                  id={`ask-tutor-milestone-${m.weekNumber}`}
                  onClick={() => handleAskTutorMilestone(m)}
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center space-x-1.5 transition-colors"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Tutor Guide</span>
                </button>
              </div>
            </div>

            {/* Practice Exercise & Mini-Project Sub-Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
              {/* Practice Exercise */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                    <Code2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hands-On Drill</span>
                  </span>
                  <LevelBadge level={m.practiceExercise.difficulty} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{m.practiceExercise.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{m.practiceExercise.task}</p>
              </div>

              {/* Mini Project */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Practical Mini-Project</span>
                </span>
                <h4 className="text-xs font-bold text-slate-900">{m.miniProject.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{m.miniProject.description}</p>
              </div>
            </div>

            {/* Curated Resources List */}
            {m.learningResources && m.learningResources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Resources:</span>
                {m.learningResources.map((res, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200"
                  >
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    <span>{res.title}</span>
                    <span className="text-[10px] text-slate-400">({res.duration})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

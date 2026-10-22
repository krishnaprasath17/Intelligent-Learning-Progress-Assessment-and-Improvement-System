import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  Zap,
  Target,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LevelBadge } from '../components/common/LevelBadge';
import { AnalyticsSummary } from '../types';
import { api } from '../services/api';

export const ProgressAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { analytics, recentAssessments, startSkillAssessment, viewInsight, setCurrentView } = useData();

  const [localAnalytics, setLocalAnalytics] = useState<AnalyticsSummary | null>(analytics);

  useEffect(() => {
    async function load() {
      if (user) {
        try {
          const res = await api.getProgressAnalytics(user.id);
          setLocalAnalytics(res);
        } catch (e) {
          console.error('Failed to load progress analytics:', e);
        }
      }
    }
    load();
  }, [user]);

  const summary: AnalyticsSummary = localAnalytics || {
    totalAssessments: 0,
    averageScore: 0,
    overallGrowthPercentage: 0,
    totalXp: user?.xp || 0,
    streakDays: user?.streakDays || 0,
    skillsMasteredCount: 0,
    skillProgressList: [],
    assessmentTimeline: [],
    topicProficiency: [],
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="progress-analytics-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learning Progress & Mastery Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Quantified before-and-after assessment comparison, topic mastery spectrum, and longitudinal progress tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="print-report-btn"
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Progress PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Growth Velocity</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center text-emerald-600">
            <TrendingUp className="w-6 h-6 mr-1" />
            <span>+{summary.overallGrowthPercentage}%</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Compared to initial diagnostic baselines</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Average Assessment Score</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{summary.averageScore}%</h3>
          <p className="text-[11px] text-slate-500 mt-1">Across {summary.totalAssessments} completed assessments</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Active Learning Streak</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center text-orange-500">
            <Flame className="w-6 h-6 mr-1 fill-orange-500" />
            <span>{summary.streakDays} Days</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Daily consistency maintained</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total XP Gained</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center text-amber-500">
            <Zap className="w-6 h-6 mr-1 fill-amber-500" />
            <span>{summary.totalXp} XP</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Rank: Level 4 Advanced Student</p>
        </div>
      </div>

      {/* Before vs. After Skill Progress Comparison Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Before & After Skill Progression Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Demonstrates tangible skill improvement after applying AI roadmaps
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Technical Skill</th>
                <th className="py-2.5 px-3">Classified Tier</th>
                <th className="py-2.5 px-3">Baseline Score</th>
                <th className="py-2.5 px-3">Latest Score</th>
                <th className="py-2.5 px-3">Growth Delta</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.skillProgressList.map(item => (
                <tr key={item.skillId} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-3 font-bold text-slate-900">{item.skillName}</td>
                  <td className="py-3.5 px-3">
                    <LevelBadge level={item.level} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-semibold">{item.score - item.delta}%</td>
                  <td className="py-3.5 px-3 font-bold text-blue-600">{item.score}%</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{item.delta}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      id={`reassess-from-progress-${item.skillId}`}
                      onClick={() => startSkillAssessment(item.skillId)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
                    >
                      Reassess Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topic Mastery Spectrum Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Topic Proficiency Spectrum
        </h3>
        <p className="text-xs text-slate-500">
          Categorized into Mastered (≥80%), Developing (50–79%), and Needs Attention (&lt;50%).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mastered */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mastered Concepts (≥80%)</span>
            </div>
            <div className="space-y-2">
              {summary.topicProficiency
                .filter(t => t.status === 'Mastered')
                .map((t, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-emerald-100 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{t.topicName}</span>
                      <span className="text-emerald-600 font-bold">{t.score}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.skillName}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Developing */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
            <div className="flex items-center space-x-2 text-blue-800 font-bold text-xs">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Developing (50–79%)</span>
            </div>
            <div className="space-y-2">
              {summary.topicProficiency
                .filter(t => t.status === 'Developing')
                .map((t, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-blue-100 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{t.topicName}</span>
                      <span className="text-blue-600 font-bold">{t.score}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.skillName}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
            <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Needs Attention (&lt;50%)</span>
            </div>
            <div className="space-y-2">
              {summary.topicProficiency
                .filter(t => t.status === 'Needs Attention')
                .map((t, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-rose-100 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{t.topicName}</span>
                      <span className="text-rose-600 font-bold">{t.score}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.skillName}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

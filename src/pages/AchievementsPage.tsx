import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Target,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { getUserLevelInfo } from '../utils/xpLevel';

export const AchievementsPage: React.FC = () => {
  const { achievements, refreshAchievements, setCurrentView, startSkillAssessment } = useData();
  const { user } = useAuth();

  useEffect(() => {
    refreshAchievements();
  }, []);

  const earnedCount = achievements.filter(a => a.earned).length;
  const levelInfo = getUserLevelInfo(user?.xp || 0);

  return (
    <div id="achievements-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
              Gamified Mastery Milestones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Badges, XP & Daily Streaks
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
            Complete adaptive assessments, hit daily learning streaks, and complete weekly roadmap milestones to unlock badges and rank up.
          </p>
        </div>

        {/* User XP & Level Display */}
        <div className="bg-white/10 p-5 rounded-2xl border border-white/20 flex items-center space-x-6 shrink-0">
          <div className="text-center">
            <div className="text-xs uppercase font-extrabold text-amber-300">Level {levelInfo.level}</div>
            <div className="text-3xl sm:text-4xl font-black text-white">{user?.xp || 0}</div>
            <div className="text-[10px] text-amber-200 uppercase font-bold tracking-wider mt-0.5">
              {levelInfo.title}
            </div>
          </div>
          <div className="border-l border-white/20 pl-4 space-y-1 text-xs">
            <div>
              <span className="text-amber-200">Rank:</span>{' '}
              <strong>{levelInfo.badgeName}</strong>
            </div>
            <div>
              <span className="text-amber-200">Badges:</span>{' '}
              <strong>{earnedCount} / {achievements.length}</strong>
            </div>
            <div>
              <span className="text-amber-200">Streak:</span>{' '}
              <strong>{user?.streakDays || 0} Days</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">All Achievement Badges ({achievements.length})</h3>
            <p className="text-xs text-slate-500">Unlock each milestone as you progress through the system</p>
          </div>
          <span className="text-xs font-bold text-blue-600">
            {earnedCount} of {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              id={`badge-card-${ach.key}`}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                ach.earned
                  ? 'bg-amber-50/40 border-amber-200 shadow-2xs hover:scale-[1.02]'
                  : 'bg-slate-50/50 border-slate-200/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl">{ach.icon}</div>
                {ach.earned ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{ach.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ach.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-700">+{ach.xpReward} XP Reward</span>
                {ach.earnedAt && (
                  <span className="text-slate-400">
                    {new Date(ach.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

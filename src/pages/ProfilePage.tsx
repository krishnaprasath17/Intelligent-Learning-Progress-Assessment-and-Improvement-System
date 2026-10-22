import React, { useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Clock,
  Target,
  BookOpen,
  Save,
  CheckCircle2,
  Zap,
  Award,
  Star,
  Lock,
  ChevronRight,
  Sparkles,
  Flame,
  Map,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getUserLevelInfo, LEVEL_TIERS, XP_REWARDS } from '../utils/xpLevel';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { setCurrentView, recentAssessments, currentRoadmap, startSkillAssessment, viewSkillRoadmap } = useData();

  const [activeTab, setActiveTab] = useState<'mastery' | 'settings'>('mastery');

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'B.Tech / B.E.');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [yearOfStudy, setYearOfStudy] = useState(user?.yearOfStudy || '3rd Year');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Intermediate');
  const [targetJobRole, setTargetJobRole] = useState(user?.targetJobRole || 'Full Stack Developer');
  const [preferredLearningStyle, setPreferredLearningStyle] = useState(user?.preferredLearningStyle || 'Hands-on projects');
  const [dailyAvailableTime, setDailyAvailableTime] = useState(user?.dailyAvailableTime || '1–2 hours');
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal || 'Placement preparation');

  const [savedMsg, setSavedMsg] = useState(false);

  const levelInfo = getUserLevelInfo(user?.xp || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      college,
      educationLevel,
      department,
      yearOfStudy,
      experienceLevel: experienceLevel as any,
      targetJobRole,
      preferredLearningStyle,
      dailyAvailableTime,
      careerGoal,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const completedMilestonesCount = currentRoadmap?.completedMilestones || 0;

  return (
    <div id="profile-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Hero Level & Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            {/* Level Crest Badge */}
            <div className="relative shrink-0">
              <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${levelInfo.badgeColor} text-white flex flex-col items-center justify-center shadow-lg border border-white/20 relative overflow-hidden`}>
                <span className="text-[10px] uppercase font-black tracking-wider text-white/80">LEVEL</span>
                <span className="text-3xl font-black leading-none">{levelInfo.level}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md border-2 border-slate-900" title={levelInfo.badgeName}>
                <Star className="w-3.5 h-3.5 fill-slate-950" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {levelInfo.badgeName}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {user?.role === 'admin' ? 'Administrator Account' : 'Student Scholar'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{user?.name || 'Academic Learner'}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="text-amber-300 font-bold">{levelInfo.title}</span>
                <span>•</span>
                <span className="text-slate-300">{user?.email}</span>
                {user?.college && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">{user.college}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick XP Summary Stats Box */}
          <div className="bg-white/10 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-white/15 flex items-center space-x-6 shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                <Zap className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span>{levelInfo.totalXp.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-slate-300 uppercase font-extrabold tracking-wider mt-0.5">
                Lifetime XP Points
              </div>
            </div>

            <div className="border-l border-white/20 pl-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-slate-300">Streak:</span>{' '}
                <strong className="text-white">{user?.streakDays || 0} Days</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-slate-300">Milestones:</span>{' '}
                <strong className="text-white">{completedMilestonesCount} Done</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-slate-300">Tests:</span>{' '}
                <strong className="text-white">{recentAssessments.length} Completed</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar in Banner */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-1">
            <span className="text-slate-300">
              Level {levelInfo.level} Mastery Progress ({levelInfo.progressPercentage}%)
            </span>
            <span className="text-amber-300 font-bold">
              {levelInfo.isMaxLevel 
                ? 'Maximum Level Attained!' 
                : `${levelInfo.xpInCurrentLevel} / ${levelInfo.nextLevelXp - levelInfo.currentLevelMinXp} XP (${levelInfo.xpNeededForNextLevel} XP to Level ${levelInfo.level + 1})`}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(4, levelInfo.progressPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('mastery')}
          className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'mastery'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>XP & Level Mastery Hub</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Academic & Career Details</span>
        </button>
      </div>

      {/* TAB 1: XP & LEVEL MASTERY HUB */}
      {activeTab === 'mastery' && (
        <div className="space-y-6">
          {/* How to Earn XP & Rewards Callout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Adaptive Assessments</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Take tests on Python, JS, SQL, and DSA to evaluate proficiency and earn XP.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600">
                  +{XP_REWARDS.ASSESSMENT_COMPLETION}–350 XP
                </span>
                <button
                  onClick={() => startSkillAssessment('python')}
                  className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-0.5"
                >
                  <span>Start Test</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Roadmap Milestones</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Complete hands-on programming exercises and mini-projects on your personalized path.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600">
                  +{XP_REWARDS.ROADMAP_MILESTONE} XP Each
                </span>
                <button
                  onClick={() => viewSkillRoadmap('python')}
                  className="text-xs font-bold text-slate-700 hover:text-emerald-600 flex items-center gap-0.5"
                >
                  <span>Open Roadmap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Active Learning Streaks</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Log in, review concepts, and complete exercises consecutively to build consistency.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-amber-600">
                  {user?.streakDays || 0} Day Streak
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Multiplies Score
                </span>
              </div>
            </div>
          </div>

          {/* Level Progression Ladder & Unlocked Perks */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>Level Tier Ladder & Perks</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every milestone you achieve unlocks higher tier capabilities and engineering badges.
                </p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full shrink-0">
                Current: Level {levelInfo.level} ({levelInfo.badgeName})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {LEVEL_TIERS.map(tier => {
                const isCurrent = tier.level === levelInfo.level;
                const isUnlocked = levelInfo.totalXp >= tier.minXp;

                return (
                  <div
                    key={tier.level}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                        : isUnlocked
                        ? 'border-emerald-200 bg-emerald-50/20 text-slate-800'
                        : 'border-slate-200 bg-slate-50/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}
                        >
                          L{tier.level}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900">{tier.title}</h4>
                            <span className="text-[10px] text-slate-400 font-bold">
                              ({tier.badgeName})
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {tier.minXp.toLocaleString()}–{tier.maxXp === Infinity ? '∞' : tier.maxXp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-white" />
                          <span>Active</span>
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>{tier.minXp - levelInfo.totalXp} XP to unlock</span>
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Unlocked Capabilities
                      </p>
                      <ul className="space-y-1">
                        {tier.perks.map((perk, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC & CAREER SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          {savedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Academic profile successfully updated! Adaptive calibration refreshed.</span>
            </div>
          )}

          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900">Personal & Academic Details</h3>
            <p className="text-xs text-slate-500">Keep your academic level up to date for precise question difficulty mapping.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree</label>
              <select
                value={educationLevel}
                onChange={e => setEducationLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                <option value="BCA / MCA">BCA / MCA</option>
                <option value="B.Sc / M.Sc CS">B.Sc / M.Sc CS</option>
                <option value="Diploma">Diploma in Engineering</option>
                <option value="Bootcamp">Bootcamp / Self-Taught</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year of Study</label>
              <select
                value={yearOfStudy}
                onChange={e => setYearOfStudy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="Final Year">Final Year</option>
                <option value="Graduate / Fresher">Graduate / Fresher</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Target Career & Study Commitment</h3>
            <p className="text-xs text-slate-500 mb-4">Our GenAI uses these parameters to estimate roadmap timelines.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Engineering Role</label>
                <input
                  type="text"
                  value={targetJobRole}
                  onChange={e => setTargetJobRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Daily Available Study Time</label>
                <select
                  value={dailyAvailableTime}
                  onChange={e => setDailyAvailableTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="30–60 minutes">30–60 minutes</option>
                  <option value="1–2 hours">1–2 hours</option>
                  <option value="2–4 hours">2–4 hours</option>
                  <option value="More than 4 hours">More than 4 hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

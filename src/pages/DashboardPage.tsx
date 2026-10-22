import React from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  Map,
  Bot,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code2,
  ChevronRight,
  Award,
  BookOpen,
  ShieldCheck,
  Star,
  Check,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { SkillIcon } from '../components/common/SkillIcon';
import { LevelBadge } from '../components/common/LevelBadge';
import { getUserLevelInfo, calculateAssessmentXp } from '../utils/xpLevel';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    skills,
    recentAssessments,
    currentRoadmap,
    latestAIInsight,
    userAIInsights,
    analytics,
    startSkillAssessment,
    setCurrentView,
    setSelectedSkillId,
    viewInsight,
    viewSkillRoadmap,
    setTutorInitialPrompt,
    toggleMilestone,
    eligibleReattempts,
    startTestReattempt,
  } = useData();

  const levelInfo = getUserLevelInfo(user?.xp || 0);
  const lastAssessment = recentAssessments[0];
  const activeInsight = latestAIInsight || (userAIInsights.length > 0 ? userAIInsights[0] : null);

  const handleAskTutorAboutWeakness = (weakTopic: string) => {
    setTutorInitialPrompt(`Hi Socrates! My recent assessment identified "${weakTopic}" as a key weak area. Can you explain the core concepts step-by-step with code examples and give me a practice challenge?`);
    setCurrentView('ai-tutor');
  };

  const handleToggleDashboardMilestone = async (milestoneId: string) => {
    if (!currentRoadmap) return;
    await toggleMilestone(currentRoadmap.skillId, milestoneId);
  };

  const pythonSkill = skills.find(s => s.id === 'python') || skills[0];
  const jsSkill = skills.find(s => s.id === 'javascript') || skills[1];
  const sqlSkill = skills.find(s => s.id === 'sql') || skills[2];

  return (
    <div id="dashboard-page" className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto bg-[#F8FAFC]">
      {/* Welcome Section */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Sarah'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {analytics?.totalAssessments ? `Your current average assessment score is ${Math.round(analytics.averageScore)}%.` : 'Complete your first assessment to start your learning path.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="dash-take-assessment-btn"
            onClick={() => startSkillAssessment('python')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Start Assessment (+200 XP)</span>
          </button>
        </div>
      </section>

      {/* Level & XP Progression Hero Card */}
      <section id="dash-xp-level-card" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-indigo-50/80 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Level Crest & Title */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="relative shrink-0">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${levelInfo.badgeColor} text-white flex flex-col items-center justify-center shadow-md relative overflow-hidden`}>
                <span className="text-[10px] font-black uppercase tracking-wider text-white/80">Level</span>
                <span className="text-2xl sm:text-3xl font-black leading-none">{levelInfo.level}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-xs border-2 border-white" title={levelInfo.badgeName}>
                <Star className="w-3.5 h-3.5 fill-slate-950" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 tracking-wider">
                  {levelInfo.badgeName}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {levelInfo.isMaxLevel ? 'Maximum Mastery Tier' : `Rank Tier ${levelInfo.level} of 10`}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {levelInfo.title}
              </h2>
              <p className="text-xs text-slate-500">
                {levelInfo.isMaxLevel 
                  ? 'You have reached maximum rank! Continue conquering skill assessments.' 
                  : `Earn ${levelInfo.xpNeededForNextLevel} more XP to reach Level ${levelInfo.level + 1}`}
              </p>
            </div>
          </div>

          {/* XP Progress & Quick Metrics */}
          <div className="flex-1 max-w-lg lg:px-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <Zap className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                <span>{levelInfo.totalXp.toLocaleString()} Total XP</span>
              </span>
              <span className="text-slate-500 font-medium">
                {levelInfo.isMaxLevel ? 'MAX LEVEL' : `${levelInfo.xpInCurrentLevel} / ${levelInfo.nextLevelXp - levelInfo.currentLevelMinXp} XP (${levelInfo.progressPercentage}%)`}
              </span>
            </div>

            {/* Glowing progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-amber-500 rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${Math.max(5, levelInfo.progressPercentage)}%` }}
              />
            </div>

            {/* Micro badges on how to earn XP */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Assessments: <strong className="text-slate-700">+150–350 XP</strong>
              </span>
              <span className="flex items-center gap-1">
                <Map className="w-3.5 h-3.5 text-indigo-600" />
                Milestones: <strong className="text-slate-700">+100 XP</strong>
              </span>
              <button
                id="dash-view-level-ladder-btn"
                onClick={() => setCurrentView('profile')}
                className="text-indigo-600 hover:text-indigo-800 font-bold ml-auto flex items-center gap-0.5 hover:underline"
              >
                <span>View Level Ladder</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main 12-Column Grid (Clean Minimalism Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): AI Insights & Skills Grid */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Insights & Recommendations Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Gemini AI Skill Gap Diagnostics</span>
                </h2>
              </div>
              {activeInsight && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {activeInsight.skillName} • {activeInsight.classifiedLevel} Tier
                </span>
              )}
            </div>

            {activeInsight ? (
              <div className="space-y-3">
                <p className="text-sm sm:text-base leading-relaxed text-slate-800 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  "{activeInsight.keyObservation}"
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full font-bold">
                    Proficiency: {activeInsight.overallScore}%
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-full font-semibold">
                    Top Gap: {activeInsight.priorityTopics[0]?.topic || activeInsight.weaknesses[0] || 'Core Concurrency'}
                  </span>
                  <button
                    id="dash-view-ai-insight-link"
                    onClick={() => {
                      if (activeInsight.id) viewInsight(activeInsight.id);
                      else setCurrentView('ai-insights');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline ml-auto flex items-center gap-1"
                  >
                    Inspect Full Diagnostic & Gaps <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                  {lastAssessment ? (
                    <>
                      Your <span className="font-bold text-slate-900">{lastAssessment.skillName} assessment</span> score is {lastAssessment.score}%. Focus on{' '}
                      <span className="text-indigo-600 font-semibold">{lastAssessment.weakTopics.join(', ') || 'continued practice'}</span>.
                    </>
                  ) : (
                    'Discover your exact technical blindspots, cognitive mental model bugs, and priority topics with instant Gemini diagnostics.'
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => setCurrentView('ai-insights')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run AI Diagnostic Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Skill Cards (Python, JavaScript, SQL) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Python Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold text-sm">
                    Py
                  </div>
                  <span className="text-xs font-bold text-slate-400">{pythonSkill?.lastScore !== undefined ? `${pythonSkill.lastScore}%` : 'Not assessed'}</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">Python</p>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pythonSkill?.lastScore || 0}%` }}></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
                {pythonSkill?.currentLevel || 'Not assessed'}
              </p>
            </div>

            {/* JavaScript Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-sm">
                    JS
                  </div>
                  <span className="text-xs font-bold text-slate-400">{jsSkill?.lastScore !== undefined ? `${jsSkill.lastScore}%` : 'Not assessed'}</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">JavaScript</p>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${jsSkill?.lastScore || 0}%` }}></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
                {jsSkill?.currentLevel || 'Not assessed'}
              </p>
            </div>

            {/* SQL Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm">
                    SQL
                  </div>
                  <span className="text-xs font-bold text-slate-400">{sqlSkill?.lastScore !== undefined ? `${sqlSkill.lastScore}%` : 'Not assessed'}</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">Database (SQL)</p>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${sqlSkill?.lastScore || 0}%` }}></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
                {sqlSkill?.currentLevel || 'Not assessed'}
              </p>
            </div>
          </div>

          {/* Active Roadmap Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {currentRoadmap ? 'Recommended Milestone' : 'Personalized Roadmap'}
                  </span>
                  <span className="text-xs text-slate-500">{currentRoadmap ? `${currentRoadmap.skillName} roadmap` : 'Not generated yet'}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {currentRoadmap?.milestones.find(m => !m.completed)?.title || 'Complete your first assessment to generate a roadmap.'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentRoadmap?.milestones.find(m => !m.completed)?.description || 'Your personalized learning plan will appear here after assessment.'}
                </p>
              </div>
            </div>
            <button
              id="dash-resume-roadmap-btn"
              onClick={() => viewSkillRoadmap(lastAssessment?.skillId || pythonSkill?.id || 'python')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 shrink-0"
            >
              <span>{currentRoadmap ? 'Continue Roadmap' : 'View Roadmap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Technical Skills Catalog Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Curriculum & Technical Skills</h3>
                <p className="text-xs text-slate-500">Assess any domain to detect knowledge gaps</p>
              </div>
              <button
                id="dash-view-all-skills"
                onClick={() => setCurrentView('skills')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View all {skills.length} skills</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.slice(0, 4).map(skill => {
                const isAssessed = skill.lastScore !== undefined;
                return (
                  <div
                    key={skill.id}
                    id={`dash-skill-${skill.id}`}
                    className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3 bg-slate-50/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          <SkillIcon name={skill.id} className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{skill.name}</h4>
                          <p className="text-[10px] text-slate-500">{skill.topics.length} Syllabus Topics</p>
                        </div>
                      </div>
                      {isAssessed && skill.currentLevel ? (
                        <LevelBadge level={skill.currentLevel} size="sm" />
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                          New
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        id={`btn-assess-${skill.id}`}
                        onClick={() => startSkillAssessment(skill.id)}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors"
                      >
                        {isAssessed ? 'Reassess' : 'Assess'}
                      </button>
                      <button
                        id={`btn-roadmap-${skill.id}`}
                        onClick={() => viewSkillRoadmap(skill.id)}
                        className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] transition-colors"
                      >
                        Roadmap
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Learning Streak & Milestones */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-indigo-600" />
                Learning Streak
              </h3>

              <div className="flex justify-between items-center mb-6">
                <span className="text-4xl font-black text-slate-900">{user?.streakDays || 0}</span>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days Active</p>
                  <p className="text-xs text-slate-500 font-bold">Based on completed activity</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Weekly Roadmap Tasks</span>
                  <span className="text-indigo-600 font-extrabold">+100 XP Each</span>
                </div>
                {currentRoadmap?.milestones.slice(0, 3).map(milestone => (
                  <div
                    key={milestone.id}
                    id={`dash-milestone-${milestone.id}`}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      milestone.completed 
                        ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-950'
                        : 'bg-slate-50/70 border-slate-200/70 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleDashboardMilestone(milestone.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          milestone.completed
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border-2 border-slate-300 text-transparent hover:border-indigo-500'
                        }`}
                        title={milestone.completed ? 'Completed (+100 XP earned)' : 'Click to complete and earn +100 XP'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {milestone.title}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                          Week {milestone.weekNumber}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDashboardMilestone(milestone.id)}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                        milestone.completed
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:scale-105'
                      }`}
                    >
                      {milestone.completed ? '✓ +100 XP' : 'Claim +100 XP'}
                    </button>
                  </div>
                )) || <p className="text-xs text-slate-500">Your roadmap milestones will appear after your first assessment.</p>}
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Upcoming Milestones
              </h4>
              {currentRoadmap ? <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{currentRoadmap.completedMilestones} of {currentRoadmap.totalMilestones} milestones complete</p>
                  <p className="text-[10px] text-slate-500">Continue your personalized roadmap</p>
                </div>
              </div> : <p className="text-xs text-slate-500">No milestones yet.</p>}
            </div>
          </div>

          {/* Quick AI Socrates Helper Card */}
          <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-indigo-900">AI Socrates Tutor</h4>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Have questions about tricky concepts or edge cases? Socrates guides your understanding through step-by-step reasoning.
            </p>
            <button
              onClick={() => setCurrentView('ai-tutor')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Open AI Chat
            </button>
          </div>
        </div>
      </div>

      {/* Assessments Eligible for Reattempt Section (if any failed or terminated) */}
      {eligibleReattempts.length > 0 && (
        <div id="dash-reattempts-banner" className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center space-x-1.5">
                  <span>Assessments Eligible for Reattempt ({eligibleReattempts.length})</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black uppercase">
                    Action Needed
                  </span>
                </h3>
                <p className="text-[11px] text-amber-800">
                  Assessments below required passing marks or terminated by security policy can be retaken independently.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('reattempts')}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs transition-colors flex items-center space-x-1 shrink-0"
            >
              <span>Manage All Reattempts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {eligibleReattempts.slice(0, 2).map(r => (
              <div
                key={r.assessmentId}
                className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{r.assessmentTitle}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">{r.domain}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <span>Previous: <strong className="text-rose-600">{r.lastScore}%</strong></span>
                    <span>•</span>
                    <span>Required: <strong className="text-slate-800">{r.passPercentage}%</strong></span>
                    <span>•</span>
                    <span>Attempt {r.attemptCount} of {r.maxAttempts}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {r.isEligible ? (
                    <button
                      onClick={() => startTestReattempt(r.assessmentId)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retake Now</span>
                    </button>
                  ) : r.inCooldown ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                      Cooldown: {r.cooldownRemainingMinutes}m
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      Exhausted ({r.maxAttempts}/{r.maxAttempts})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Assessment History</h3>
            <p className="text-xs text-slate-500">Track score progression across attempts</p>
          </div>
          <button
            id="dash-view-analytics-btn"
            onClick={() => setCurrentView('progress')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View Progress Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Skill & Topic</th>
                <th className="py-3 px-3">Score & Status</th>
                <th className="py-3 px-3">XP Earned</th>
                <th className="py-3 px-3">Classified Level</th>
                <th className="py-3 px-3">Completed Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAssessments.map(asm => {
                const isPassed = asm.score >= 70;
                const isTerminated = (asm as any).status === 'terminated_due_to_violations';

                return (
                  <tr key={asm.id} id={`history-row-${asm.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{asm.skillName}</div>
                      <div className="text-[10px] text-slate-500">{asm.totalQuestions} Questions Evaluated</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className={`font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {asm.score}%
                        </span>
                        {isTerminated ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold flex items-center space-x-1">
                            <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                            <span>Terminated</span>
                          </span>
                        ) : isPassed ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            Passed
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            Failed
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {asm.correctQuestions} of {asm.totalQuestions} correct
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200/80">
                        <Zap className="w-3 h-3 fill-amber-600 text-amber-600" />
                        <span>+{calculateAssessmentXp(asm.score, asm.correctQuestions)} XP</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <LevelBadge level={asm.classifiedLevel} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(asm.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        id={`view-result-btn-${asm.id}`}
                        onClick={() => {
                          setSelectedSkillId(asm.skillId);
                          setCurrentView('assessment-result');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        View Report
                      </button>
                      {!isPassed && (
                        <button
                          onClick={() => {
                            const foundReattempt = eligibleReattempts.find(r => r.domain.toLowerCase() === asm.skillId.toLowerCase());
                            if (foundReattempt) {
                              startTestReattempt(foundReattempt.assessmentId);
                            } else {
                              setCurrentView('reattempts');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] transition-colors inline-flex items-center space-x-1"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Reattempt Test</span>
                        </button>
                      )}
                      {asm.aiInsightId && (
                        <button
                          id={`view-insight-btn-${asm.id}`}
                          onClick={() => viewInsight(asm.aiInsightId!)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors"
                        >
                          AI Insights
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

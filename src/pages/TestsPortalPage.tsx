import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Clock,
  Award,
  CheckCircle2,
  Play,
  ArrowRight,
  BookOpen,
  Code2,
  Target,
  Sparkles,
  Layers,
  AlertCircle,
  FileCode,
  Check,
  Zap,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AssessmentConfig, TestCategory, SkillLevel } from '../types';
import { LevelBadge } from '../components/common/LevelBadge';

export const TestsPortalPage: React.FC = () => {
  const {
    testsList,
    refreshTestsList,
    openTestInstructions,
    setCurrentView,
    eligibleReattempts,
    startTestReattempt,
  } = useData();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'duration' | 'marks'>('newest');

  useEffect(() => {
    refreshTestsList();
  }, []);

  const categories = ['All', 'Academic', 'Technical', 'Placement'];
  const statuses = ['All', 'Available', 'In Progress', 'Completed', 'Upcoming'];
  const difficulties = ['All', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

  const filteredTests = testsList.filter((test: any) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || test.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesDifficulty =
      selectedDifficulty === 'All' || test.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    let matchesStatus = true;
    if (selectedStatus === 'Available') {
      matchesStatus = test.attemptStatus === 'available' || !test.attemptStatus;
    } else if (selectedStatus === 'In Progress') {
      matchesStatus = test.attemptStatus === 'in_progress';
    } else if (selectedStatus === 'Completed') {
      matchesStatus = test.attemptStatus === 'completed' || test.attemptStatus === 'limit_reached';
    } else if (selectedStatus === 'Upcoming') {
      matchesStatus = test.status === 'upcoming' || test.attemptStatus === 'upcoming';
    }

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  // Sorting
  const sortedTests = [...filteredTests].sort((a, b) => {
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
    if (sortBy === 'marks') return b.maxMarks - a.maxMarks;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getCategoryIcon = (category: TestCategory) => {
    switch (category) {
      case 'Academic':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'Technical':
        return <Code2 className="w-5 h-5 text-indigo-600" />;
      case 'Placement':
        return <Target className="w-5 h-5 text-emerald-600" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleTestCardClick = (testId: string) => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    openTestInstructions(testId);
  };

  return (
    <div id="tests-portal-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>Standardized Assessment Portal</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {testsList.length} Tests Available
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Student Assessment Discovery & Examination Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Choose from curricular academic examinations, technical engineering benchmarks, or campus placement screening drives with server-synchronized deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {eligibleReattempts.length > 0 && (
            <button
              onClick={() => setCurrentView('reattempts')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reattempt Failed Tests ({eligibleReattempts.length})</span>
            </button>
          )}
          <button
            onClick={() => setCurrentView('coding-lab')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <FileCode className="w-4 h-4" />
            <span>Open Coding Sandbox Lab</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {categories.map(cat => (
          <button
            key={cat}
            id={`tab-category-${cat.toLowerCase()}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat === 'All' ? 'All Assessments' : cat}
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="test-search-input"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tests by title, topic, or tags (e.g. BCNF, TCP, Quant, Java)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statuses.map(s => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {difficulties.map(d => (
              <option key={d} value={d}>Difficulty: {d}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Sort: Newest</option>
            <option value="duration">Sort: Duration</option>
            <option value="marks">Sort: Max Marks</option>
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      {sortedTests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching assessments found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or resetting filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedStatus('All');
              setSelectedDifficulty('All');
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedTests.map((test: any) => {
            const reattemptInfo = eligibleReattempts.find(r => r.assessmentId === test.id);
            const isCompleted = test.attemptStatus === 'completed' || test.attemptStatus === 'limit_reached';
            const isInProgress = test.attemptStatus === 'in_progress';
            const isUpcoming = test.status === 'upcoming' || test.attemptStatus === 'upcoming';

            return (
              <div
                key={test.id}
                id={`test-card-${test.id}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                        {getCategoryIcon(test.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {test.category} • {test.domain}
                        </span>
                        <LevelBadge level={test.difficulty} size="sm" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    {reattemptInfo ? (
                      reattemptInfo.lastAttemptStatus === 'terminated_due_to_violations' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1">
                          <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                          <span>Terminated (Violations)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center space-x-1">
                          <RotateCcw className="w-2.5 h-2.5 text-amber-700" />
                          <span>Retake Ready ({reattemptInfo.lastScore}%)</span>
                        </span>
                      )
                    ) : isInProgress ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1 animate-pulse">
                        <Play className="w-2.5 h-2.5" />
                        <span>In Progress</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Passed: {test.lastScore ?? 80}%</span>
                      </span>
                    ) : isUpcoming ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Upcoming
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Available
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  {/* Test Metrics Pill Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{test.durationMinutes} mins</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{test.questionCount} Qs</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{test.maxMarks} Marks</span>
                    </div>
                  </div>

                  {/* Negative marking & Coding badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    {test.negativeMarking > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">
                        -{test.negativeMarking * 100}% Negative Marking
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        No Negative Marking
                      </span>
                    )}
                    {test.isCodingSupported && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold flex items-center space-x-1">
                        <FileCode className="w-3 h-3" />
                        <span>Code Lab</span>
                      </span>
                    )}
                    <span className="text-slate-400">Max Attempts: {test.maxAttempts}</span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-2 border-t border-slate-100">
                  {reattemptInfo?.isEligible ? (
                    <button
                      id={`reattempt-btn-${test.id}`}
                      onClick={() => startTestReattempt(test.id)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reattempt Test (Attempt #{reattemptInfo.attemptCount + 1})</span>
                    </button>
                  ) : reattemptInfo?.inCooldown ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center space-x-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>In Cooldown ({reattemptInfo.cooldownRemainingMinutes}m)</span>
                    </button>
                  ) : (
                    <button
                      id={`start-test-btn-${test.id}`}
                      onClick={() => handleTestCardClick(test.id)}
                      disabled={isUpcoming}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                        isInProgress
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                          : isUpcoming
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-indigo-600/20'
                      }`}
                    >
                      <span>
                        {isInProgress ? 'Resume Active Exam' : isCompleted ? 'Retake Assessment' : isUpcoming ? 'Opens Soon' : 'Start Assessment'}
                      </span>
                      {!isUpcoming && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

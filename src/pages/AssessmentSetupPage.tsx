import React, { useState } from 'react';
import {
  Target,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SkillIcon } from '../components/common/SkillIcon';

export const AssessmentSetupPage: React.FC = () => {
  const { selectedSkillId, selectedTopicIds, skills, setCurrentView } = useData();
  const skill = skills.find(s => s.id === selectedSkillId) || skills[0] || {
    id: 'python',
    name: 'Python',
    description: 'Core syntax, data types, control flow, functions, OOP, and exceptions.',
    topics: [],
  };

  const [questionCount, setQuestionCount] = useState<number>(8);
  const [timerOption, setTimerOption] = useState<number>(10); // 10 minutes default
  const [includeCodeOutput, setIncludeCodeOutput] = useState<boolean>(true);
  const [includeDebugging, setIncludeDebugging] = useState<boolean>(true);

  const handleLaunch = () => {
    setCurrentView('assessment');
  };

  return (
    <div id="assessment-setup-page" className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <button
        id="asm-setup-back-btn"
        onClick={() => setCurrentView('skills')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Skills</span>
      </button>

      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
            <SkillIcon name={skill.id} className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30">
                Adaptive Evaluation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {skill.name} Skill Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {selectedTopicIds.length > 0
                ? `Customized focus on ${selectedTopicIds.length} chosen topics.`
                : 'Full diagnostic covering syntax, algorithmic logic, and error handling.'}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <button
            id="start-assessment-now-btn"
            onClick={handleLaunch}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
          >
            <span>Begin Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Setup Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instructions & Format */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Assessment Rules & Mechanics</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start space-x-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </div>
              <p>
                <strong>Adaptive Difficulty:</strong> The engine automatically serves questions tailored across Beginner, Basic, Intermediate, and Advanced tiers.
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </div>
              <p>
                <strong>Multi-Format Questions:</strong> Includes conceptual MCQs, code output tracing, and debugging scenarios.
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </div>
              <p>
                <strong>Zero Guess Penalty:</strong> You can skip or flag questions for review before submitting.
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                4
              </div>
              <p>
                <strong>Immediate GenAI Diagnostics:</strong> Generates instant knowledge gap breakdown, misconceptions audit, and an updated 4-week roadmap.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Parameters */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Session Configuration</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Question Volume ({questionCount} questions)
              </label>
              <div className="flex items-center space-x-2">
                {[5, 8, 10, 15].map(cnt => (
                  <button
                    key={cnt}
                    id={`btn-cnt-${cnt}`}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      questionCount === cnt
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time Limit ({timerOption} minutes)
              </label>
              <div className="flex items-center space-x-2">
                {[5, 10, 15, 20].map(mins => (
                  <button
                    key={mins}
                    id={`btn-time-${mins}`}
                    type="button"
                    onClick={() => setTimerOption(mins)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      timerOption === mins
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCodeOutput}
                  onChange={e => setIncludeCodeOutput(e.target.checked)}
                  className="rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Include Code Snippet Output Tracing</span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDebugging}
                  onChange={e => setIncludeDebugging(e.target.checked)}
                  className="rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Include Debugging & Edge-Case Questions</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button Container */}
      <div className="flex justify-end pt-2">
        <button
          id="launch-assessment-bottom-btn"
          onClick={handleLaunch}
          className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02]"
        >
          <span>Start Assessment Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

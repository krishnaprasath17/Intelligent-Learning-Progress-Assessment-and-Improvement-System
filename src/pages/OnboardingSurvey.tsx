import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Check,
  ArrowRight,
  Star,
  BookOpen,
  Target,
  Clock,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const OnboardingSurvey: React.FC = () => {
  const { user, submitSurvey, isLoading } = useAuth();
  const { setCurrentView, startSkillAssessment } = useData();

  const [experienceLevel, setExperienceLevel] = useState<string>(user?.experienceLevel || 'Intermediate');
  const [selectedExposures, setSelectedExposures] = useState<string[]>(['Python', 'SQL', 'C']);
  const [careerGoal, setCareerGoal] = useState<string>(user?.careerGoal || 'Campus Placements & Tech Interviews');
  const [dailyTime, setDailyTime] = useState<string>(user?.dailyAvailableTime || '1–2 hours');
  const [learningStyle, setLearningStyle] = useState<string>(user?.preferredLearningStyle || 'Hands-on coding & problem solving');

  // Confidence sliders for core skills (1 to 5)
  const [confidences, setConfidences] = useState<Record<string, number>>({
    python: 4,
    sql: 3,
    cpp: 2,
    java: 3,
    javascript: 3,
    dsa: 2,
  });

  const skillsForRating = [
    { id: 'python', name: 'Python' },
    { id: 'sql', name: 'SQL & Databases' },
    { id: 'cpp', name: 'C++ & OOP' },
    { id: 'java', name: 'Java' },
    { id: 'javascript', name: 'JavaScript & React' },
    { id: 'dsa', name: 'Data Structures & Algorithms' },
  ];

  const exposureOptions = [
    'C',
    'C++',
    'Python',
    'Java',
    'SQL',
    'HTML / CSS',
    'JavaScript',
    'React.js',
    'Data Structures',
    'OOP Principles',
  ];

  const toggleExposure = (item: string) => {
    if (selectedExposures.includes(item)) {
      setSelectedExposures(selectedExposures.filter(x => x !== item));
    } else {
      setSelectedExposures([...selectedExposures, item]);
    }
  };

  const handleConfidenceChange = (skillId: string, val: number) => {
    setConfidences({ ...confidences, [skillId]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitSurvey({
      experienceLevel,
      programmingExposure: selectedExposures,
      careerGoal,
      dailyAvailableTime: dailyTime,
      skillConfidence: confidences,
    });
    // Jump straight to dashboard or Python assessment
    setCurrentView('dashboard');
  };

  return (
    <div id="onboarding-survey-page" className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Personalization Calibration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalize Your Learning Baseline
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Tell us about your background, career targets, and self-confidence so our GenAI can calibrate assessment difficulty and customize your upskilling roadmap.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Experience Level */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Overall Programming Experience Level</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4 ml-7">How would you describe your current technical depth?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-7">
              {[
                { id: 'Beginner', title: 'Complete Beginner', desc: 'New to coding, learning core syntax and logic.' },
                { id: 'Basic', title: 'Basic Knowledge', desc: 'Can write simple programs and small functions.' },
                { id: 'Intermediate', title: 'Intermediate Student', desc: 'Familiar with OOP, data structures, and small projects.' },
                { id: 'Advanced', title: 'Advanced / Pre-Placement', desc: 'Practicing competitive programming and complex systems.' },
              ].map(opt => (
                <div
                  key={opt.id}
                  id={`exp-opt-${opt.id}`}
                  onClick={() => setExperienceLevel(opt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    experienceLevel === opt.id
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                    {experienceLevel === opt.id && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Prior Programming Exposure */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Prior Programming Exposure</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4 ml-7">Select all languages or domains you have encountered:</p>

            <div className="flex flex-wrap gap-2 ml-7">
              {exposureOptions.map(exp => {
                const isSelected = selectedExposures.includes(exp);
                return (
                  <button
                    key={exp}
                    id={`exposure-chip-${exp.replace(/[^a-z0-9]/gi, '').toLowerCase()}`}
                    type="button"
                    onClick={() => toggleExposure(exp)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{exp}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Self-Perceived Skill Confidence Rating */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Self-Reported Confidence (1 to 5 Scale)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4 ml-7">
              Our AI compares your confidence with actual assessment accuracy to spot overconfidence or hidden strengths.
            </p>

            <div className="space-y-4 ml-7">
              {skillsForRating.map(skill => {
                const currentRating = confidences[skill.id] || 3;
                return (
                  <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                      <p className="text-[10px] text-slate-500">
                        {currentRating === 1
                          ? '1 - Need basic guidance'
                          : currentRating === 3
                          ? '3 - Moderate confidence'
                          : currentRating === 5
                          ? '5 - Highly confident & interview ready'
                          : `${currentRating}/5 Confidence level`}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          id={`conf-btn-${skill.id}-${star}`}
                          type="button"
                          onClick={() => handleConfidenceChange(skill.id, star)}
                          className="p-1 rounded hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= currentRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Career Target & Daily Study Schedule */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>Learning Objective & Daily Study Time</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4 ml-7">Set goals to tailor the 4-week timeline pace.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-7">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Objective</label>
                <select
                  id="survey-career-goal"
                  value={careerGoal}
                  onChange={e => setCareerGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Campus Placements & Tech Interviews">Campus Placements & Tech Interviews</option>
                  <option value="Internship Preparation">Internship Preparation</option>
                  <option value="Competitive Programming & DSA">Competitive Programming & DSA</option>
                  <option value="Academic Semester Exam Prep">Academic Semester Exam Prep</option>
                  <option value="Building Full-Stack Portfolio Projects">Building Full-Stack Portfolio Projects</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Daily Study Time</label>
                <select
                  id="survey-daily-time"
                  value={dailyTime}
                  onChange={e => setDailyTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="30–60 minutes">30–60 minutes</option>
                  <option value="1–2 hours">1–2 hours</option>
                  <option value="2–4 hours">2–4 hours</option>
                  <option value="Full time immersion (4+ hours)">Full time immersion (4+ hours)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="submit-onboarding-survey-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <span>{isLoading ? 'Saving Calibration...' : 'Complete Calibration & Enter Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Map,
  Code2,
  ChevronRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SkillIcon } from '../components/common/SkillIcon';
import { LevelBadge } from '../components/common/LevelBadge';

export const SkillDetailPage: React.FC = () => {
  const {
    selectedSkillId,
    skills,
    setCurrentView,
    startSkillAssessment,
    viewSkillRoadmap,
    setTutorInitialPrompt,
  } = useData();

  const skill = skills.find(s => s.id === selectedSkillId) || skills[0];
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  if (!skill) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Skill not found.</p>
        <button
          onClick={() => setCurrentView('skills')}
          className="mt-3 text-blue-600 font-bold text-xs"
        >
          Back to catalog
        </button>
      </div>
    );
  }

  const toggleTopic = (tid: string) => {
    if (selectedTopicIds.includes(tid)) {
      setSelectedTopicIds(selectedTopicIds.filter(id => id !== tid));
    } else {
      setSelectedTopicIds([...selectedTopicIds, tid]);
    }
  };

  const handleLaunchTargetedAssessment = () => {
    startSkillAssessment(skill.id, selectedTopicIds.length > 0 ? selectedTopicIds : undefined);
  };

  const handleAskTutorTopic = (topicName: string) => {
    setTutorInitialPrompt(`Hi Socrates! Please give me a deep dive explanation of "${topicName}" in ${skill.name} with real-world code examples and common mistakes to avoid.`);
    setCurrentView('ai-tutor');
  };

  return (
    <div id="skill-detail-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        id="skill-detail-back-btn"
        onClick={() => setCurrentView('skills')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Skills Catalog</span>
      </button>

      {/* Skill Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <SkillIcon name={skill.id} className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {skill.category}
              </span>
              {skill.currentLevel && <LevelBadge level={skill.currentLevel} size="sm" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {skill.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {skill.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="skill-detail-start-asm-btn"
            onClick={handleLaunchTargetedAssessment}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <Target className="w-4 h-4" />
            <span>
              {selectedTopicIds.length > 0
                ? `Assess Selected (${selectedTopicIds.length}) Topics`
                : 'Start Full Skill Assessment'}
            </span>
          </button>

          <button
            id="skill-detail-roadmap-btn"
            onClick={() => viewSkillRoadmap(skill.id)}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 flex items-center space-x-1.5 transition-colors"
          >
            <Map className="w-4 h-4" />
            <span>View Roadmap</span>
          </button>
        </div>
      </div>

      {/* Topic List Breakdown */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Syllabus Topics & Knowledge Breakdown ({skill.topics.length})
            </h3>
            <p className="text-xs text-slate-500">
              Check specific topics to launch a targeted diagnostic quiz or click "Ask AI" to learn instantly.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setSelectedTopicIds(skill.topics.map(t => t.id))}
              className="text-blue-600 font-semibold hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setSelectedTopicIds([])}
              className="text-slate-500 font-semibold hover:underline"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skill.topics.map((topic, idx) => {
            const isSelected = selectedTopicIds.includes(topic.id);
            return (
              <div
                key={topic.id}
                id={`topic-item-${topic.id}`}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      id={`checkbox-topic-${topic.id}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTopic(topic.id)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{topic.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{topic.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <LevelBadge level={topic.difficulty} size="sm" />
                    {topic.proficiencyScore !== undefined && (
                      <span className="text-xs font-bold text-blue-600">
                        {topic.proficiencyScore}% Mastery
                      </span>
                    )}
                  </div>

                  <button
                    id={`topic-ask-tutor-${topic.id}`}
                    onClick={() => handleAskTutorTopic(topic.name)}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Tutor Guide</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

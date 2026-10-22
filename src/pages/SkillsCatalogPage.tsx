import React, { useState } from 'react';
import {
  Code2,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Target,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SkillIcon } from '../components/common/SkillIcon';
import { LevelBadge } from '../components/common/LevelBadge';

export const SkillsCatalogPage: React.FC = () => {
  const { skills, startSkillAssessment, setSelectedSkillId, setCurrentView, viewSkillRoadmap } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Programming', 'Web Development', 'Databases', 'Core CS'];

  const filteredSkills = skills.filter(skill => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.topics.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenDetail = (skillId: string) => {
    setSelectedSkillId(skillId);
    setCurrentView('skill-detail');
  };

  return (
    <div id="skills-catalog-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Technical Skills & Topic Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Choose any core engineering domain to test your skills adaptively, identify hidden gaps, and generate tailored learning roadmaps.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            {skills.length} Technical Domains Available
          </span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="skill-search-input"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by skill name or topic (e.g. OOP, Pointers, React Hooks)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              id={`cat-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSkills.map(skill => {
          const isAssessed = skill.lastScore !== undefined;
          return (
            <div
              key={skill.id}
              id={`catalog-card-${skill.id}`}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors shadow-xs">
                      <SkillIcon name={skill.id} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {skill.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                        {skill.category}
                      </span>
                    </div>
                  </div>

                  {isAssessed && skill.currentLevel ? (
                    <LevelBadge level={skill.currentLevel} size="sm" />
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                      Unassessed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>

                {/* Topics Preview Chips */}
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                    Topics ({skill.topics.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {skill.topics.slice(0, 3).map(t => (
                      <span
                        key={t.id}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                      >
                        {t.name}
                      </span>
                    ))}
                    {skill.topics.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 font-semibold">
                        +{skill.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {isAssessed && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Current Mastery</span>
                      <span className="font-bold text-blue-600">{skill.lastScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${skill.lastScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-1.5">
                <button
                  id={`catalog-assess-btn-${skill.id}`}
                  onClick={() => startSkillAssessment(skill.id)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isAssessed ? 'Reassess' : 'Assessment'}</span>
                </button>

                <button
                  id={`catalog-ai-btn-${skill.id}`}
                  onClick={() => {
                    setSelectedSkillId(skill.id);
                    setCurrentView('ai-insights');
                  }}
                  className="px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-colors flex items-center space-x-1"
                  title="View AI Gap Diagnostic"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>AI Gap</span>
                </button>

                <button
                  id={`catalog-syllabus-btn-${skill.id}`}
                  onClick={() => handleOpenDetail(skill.id)}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  title="View full topic breakdown and questions"
                >
                  Topics
                </button>

                <button
                  id={`catalog-roadmap-btn-${skill.id}`}
                  onClick={() => viewSkillRoadmap(skill.id)}
                  className="px-2.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                  title="View personalized learning roadmap"
                >
                  Roadmap
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

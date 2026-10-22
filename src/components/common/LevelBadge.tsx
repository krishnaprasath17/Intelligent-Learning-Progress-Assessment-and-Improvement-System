import React from 'react';
import { SkillLevel } from '../../types';

interface LevelBadgeProps {
  level: SkillLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className = '', size = 'md' }) => {
  const getBadgeStyle = (lvl: SkillLevel) => {
    switch (lvl) {
      case 'Expert':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20';
      case 'Advanced':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
      case 'Basic':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'Beginner':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20';
    }
  };

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3 py-1.5 font-semibold tracking-wide',
  }[size];

  return (
    <span
      id={`level-badge-${level.toLowerCase()}`}
      className={`inline-flex items-center rounded-md border shadow-xs ${getBadgeStyle(level)} ${sizeClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {level}
    </span>
  );
};

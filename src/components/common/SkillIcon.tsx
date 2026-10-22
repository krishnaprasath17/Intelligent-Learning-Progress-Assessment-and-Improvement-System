import React from 'react';
import {
  Code2,
  Cpu,
  Terminal,
  Layers,
  Database,
  FileCode,
  Atom,
  Binary,
  Boxes,
  Code,
  Palette,
  Sparkles,
} from 'lucide-react';

interface SkillIconProps {
  name: string;
  className?: string;
}

export const SkillIcon: React.FC<SkillIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  switch (normalized) {
    case 'python':
      return <Code2 className={className} />;
    case 'cpp':
    case 'c':
      return <Cpu className={className} />;
    case 'terminal':
      return <Terminal className={className} />;
    case 'java':
      return <Layers className={className} />;
    case 'sql':
      return <Database className={className} />;
    case 'javascript':
    case 'js':
      return <FileCode className={className} />;
    case 'react':
    case 'reactjs':
      return <Atom className={className} />;
    case 'dsa':
    case 'datastructures':
    case 'datastructuresandalgorithms':
      return <Binary className={className} />;
    case 'oop':
    case 'objectorientedprogramming':
      return <Boxes className={className} />;
    case 'html':
    case 'html5':
      return <Code className={className} />;
    case 'css':
    case 'css3':
      return <Palette className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

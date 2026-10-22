import React from 'react';
import {
  LayoutDashboard,
  Code2,
  CheckCircle2,
  Sparkles,
  Map,
  BarChart3,
  Bot,
  Award,
  User,
  Settings,
  Shield,
  X,
  Target,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import { useData, AppView } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, eligibleReattempts } = useData();
  const { user } = useAuth();

  const navItems: { id: string; view: AppView; label: string; icon: React.FC<any>; badge?: string }[] = [
    { id: 'nav-dash', view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'nav-tests', view: 'tests', label: 'Test Portal', icon: Target, badge: 'Tests' },
    {
      id: 'nav-reattempts',
      view: 'reattempts',
      label: 'Reattempt Test',
      icon: RotateCcw,
      badge: eligibleReattempts.length > 0 ? `${eligibleReattempts.length} Retakes` : undefined,
    },
    { id: 'nav-coding-lab', view: 'coding-lab', label: 'Coding Lab', icon: FileCode },
    { id: 'nav-skills', view: 'skills', label: 'Skills Catalog', icon: Code2 },
    { id: 'nav-insights', view: 'ai-insights', label: 'AI Gap Insights', icon: Sparkles, badge: 'AI' },
    { id: 'nav-roadmap', view: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'nav-analytics', view: 'progress', label: 'Progress & Analytics', icon: BarChart3 },
    { id: 'nav-tutor', view: 'ai-tutor', label: 'AI Tutor', icon: Bot },
    { id: 'nav-achievements', view: 'achievements', label: 'Achievements & XP', icon: Award },
    { id: 'nav-profile', view: 'profile', label: 'Profile', icon: User },
    { id: 'nav-settings', view: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({
      id: 'nav-admin',
      view: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      badge: 'Admin',
    });
  }

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 shrink-0 transition-transform duration-200 z-40 ${
          isOpen ? 'translate-x-0 fixed inset-y-0 left-0 top-0 h-full z-50 shadow-xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
              <span className="font-bold text-slate-900 text-sm">AssessAI</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1">
              Main Menu
            </p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.id}
                  id={item.id}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-indigo-700 font-semibold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Feature Widget: Pro Plan / AI Tutor */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">PRO PLAN</p>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Unlock unlimited AI mock assessments and live coaching.
            </p>
            <button
              id="sidebar-upgrade-btn"
              onClick={() => handleNavClick('ai-tutor')}
              className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold py-2 px-3 rounded-lg w-full transition-colors"
            >
              Ask AI Socrates
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

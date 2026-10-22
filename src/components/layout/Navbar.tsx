import React, { useState } from 'react';
import {
  BrainCircuit,
  Flame,
  Zap,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  Search,
  BookOpen,
  LayoutDashboard,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { getUserLevelInfo } from '../../utils/xpLevel';
import { NotificationPopover } from '../common/NotificationPopover';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, switchUser } = useAuth();
  const { currentView, setCurrentView } = useData();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      setCurrentView('skills');
    }
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Brand Logo */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              id="mobile-sidebar-toggle"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            id="nav-brand-logo"
            onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Assess<span className="text-indigo-600">AI</span>
                </span>
                <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Adaptive
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search Bar (Clean Minimalism Style) or Public Nav Links */}
        {user ? (
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-72 lg:w-80 text-sm text-slate-600 border border-transparent focus-within:border-slate-300 focus-within:bg-white transition-all"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={navSearch}
              onChange={e => setNavSearch(e.target.value)}
              placeholder="Search skills, topics or roadmaps..."
              className="bg-transparent text-xs sm:text-sm outline-none w-full text-slate-800 placeholder-slate-400"
            />
          </form>
        ) : (
          <nav className="hidden md:flex items-center space-x-6">
            <button
              id="nav-link-home"
              onClick={() => setCurrentView('landing')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'landing' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              id="nav-link-tests"
              onClick={() => setCurrentView('tests')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'tests' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Assessments
            </button>
            <button
              id="nav-link-skills"
              onClick={() => setCurrentView('skills')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'skills' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Skills Catalog
            </button>
            <button
              id="nav-link-coding-lab"
              onClick={() => setCurrentView('coding-lab')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'coding-lab' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Coding Lab
            </button>
          </nav>
        )}

        {/* Right: Streak, XP & User Profile */}
        <div className="flex items-center space-x-3">
          {!user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                id="nav-login-btn"
                onClick={() => setCurrentView('auth')}
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Login
              </button>
              <button
                id="nav-register-btn"
                onClick={() => setCurrentView('auth')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {/* Notifications Center */}
              <NotificationPopover />

              {/* Streak Pill */}
              <div
                id="streak-counter-pill"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold"
                title="Active Daily Streak"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{user.streakDays || 0}d</span>
              </div>

              {/* Level & XP Pill */}
              <div
                id="xp-counter-pill"
                onClick={() => setCurrentView('profile')}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs border border-indigo-100"
                title={`${getUserLevelInfo(user.xp || 0).title} • Click to view Level breakdown in Profile`}
              >
                <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  Lvl {getUserLevelInfo(user.xp || 0).level}
                </span>
                <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span>{user.xp || 0} XP</span>
              </div>

              {/* Profile info & Dropdown */}
              <div className="relative">
                <button
                  id="user-profile-dropdown-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {user.yearOfStudy || 'Year 3'} • {user.department || 'Computer Science'}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-xs overflow-hidden flex items-center justify-center font-bold text-xs text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    id="user-profile-menu"
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-semibold">
                          {user.department || 'Computer Science'}
                        </span>
                        {user.role === 'admin' && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-semibold flex items-center space-x-1">
                            <Shield className="w-2.5 h-2.5" />
                            <span>Admin</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        id="menu-goto-profile"
                        onClick={() => {
                          setCurrentView('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Academic & Career Profile</span>
                      </button>
                      <button
                        id="menu-goto-dashboard"
                        onClick={() => {
                          setCurrentView('dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Learning Dashboard</span>
                      </button>
                      {user.role === 'admin' && (
                        <button
                          id="menu-goto-admin"
                          onClick={() => {
                            setCurrentView('admin-dashboard');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-purple-700 font-semibold hover:bg-purple-50 flex items-center space-x-2"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                          <span>Admin Control Center</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        id="menu-logout-btn"
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          setCurrentView('landing');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

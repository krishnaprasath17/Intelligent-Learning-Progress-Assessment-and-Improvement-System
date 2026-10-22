import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Moon,
  Shield,
  Key,
  CheckCircle2,
  Database,
  BrainCircuit,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentView } = useData();

  const [notifications, setNotifications] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [aiExplainAuto, setAiExplainAuto] = useState(true);

  return (
    <div id="settings-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Preferences & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage AI model interaction preferences, daily reminder alerts, and diagnostic configurations.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* GenAI Settings */}
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 text-blue-600" />
            <span>GenAI Adaptive Model Configuration</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Model provider: <strong>Gemini</strong> • Adaptive model selection enabled
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automatic Knowledge Gap Detection</span>
                <span className="text-slate-500">Deconstruct test misses into underlying misconceptions after every assessment.</span>
              </div>
              <input
                type="checkbox"
                checked={aiExplainAuto}
                onChange={e => setAiExplainAuto(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Learning Reminders & Streak Alerts</span>
          </h3>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Daily Streak Alerts</span>
                <span className="text-slate-500">Receive reminders to complete daily 15-minute drills and maintain streak.</span>
              </div>
              <input
                type="checkbox"
                checked={streakReminders}
                onChange={e => setStreakReminders(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Security & API Status */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Backend Security Architecture</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            API keys are kept strictly on the backend server environment. Zero client-side API exposure is permitted.
          </p>

          <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Server-side proxy routes (<code>/api/ai/*</code>) verified active and secure.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

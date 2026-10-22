import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Zap, Award, Sparkles, X, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { getUserLevelInfo } from '../../utils/xpLevel';

export const XpRewardToast: React.FC = () => {
  const { xpNotification, clearXpReward, setCurrentView } = useData();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (xpNotification) {
      setVisible(true);
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.85, x: 0.9 },
        });
      } catch (e) {
        // Safe fallback
      }

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(clearXpReward, 300);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [xpNotification]);

  if (!xpNotification) return null;

  const levelInfo = getUserLevelInfo(user?.xp || 0);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full transition-all duration-300 ease-out transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-indigo-500/40 p-4 rounded-2xl shadow-2xl flex items-start space-x-3.5 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />

        {/* XP Badge Icon */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
          <Zap className="w-6 h-6 fill-slate-950 stroke-slate-950" />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-amber-300 tracking-wide uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              +{xpNotification.amount} XP Earned!
            </span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
              Lvl {levelInfo.level}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-100 mt-1 truncate">
            {xpNotification.reason}
          </p>

          {/* Mini Level progress line */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>{levelInfo.title}</span>
            <span className="font-bold text-slate-300">{levelInfo.progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-400">
              Total: <strong className="text-white">{levelInfo.totalXp} XP</strong>
            </span>
            <button
              onClick={() => {
                setVisible(false);
                clearXpReward();
                setCurrentView('profile');
              }}
              className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-0.5 transition-colors"
            >
              <span>View Level Perks</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(clearXpReward, 250);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Dismiss XP notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

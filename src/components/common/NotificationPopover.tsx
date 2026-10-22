import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Award,
  Sparkles,
  BookOpen,
  X,
  ChevronRight,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const NotificationPopover: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    setCurrentView,
  } = useData();

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    if (notif.linkView) {
      setCurrentView(notif.linkView);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden font-sans">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-sm">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </div>

              {notifications.length > 0 && unreadNotificationsCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-600">No notifications yet</p>
                  <p>Assessment completions and roadmap alerts will appear here.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 text-xs ${
                      !n.read ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'achievement' || n.type === 'level_up'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {n.type === 'achievement' || n.type === 'level_up' ? (
                        <Award className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold line-clamp-1 ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

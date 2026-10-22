import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Mail, RefreshCw, KeyRound, CheckCircle2, AlertCircle, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const AccessDeniedPage: React.FC = () => {
  const { user, firebaseUser, accessStatus, checkAccessStatus, logout } = useAuth();
  const { setCurrentView } = useData();
  const [isChecking, setIsChecking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const displayEmail = accessStatus.email || user?.email || firebaseUser?.email || 'your account';

  // Real-time automatic polling every 2.5 seconds
  useEffect(() => {
    let timer: any;
    let isSubscribed = true;

    const checkRealtime = async () => {
      try {
        const approved = await checkAccessStatus(displayEmail);
        if (approved && isSubscribed) {
          setNotice('Access granted by administrator in real-time! Redirecting to platform...');
          setTimeout(() => {
            if (accessStatus.role === 'admin' || user?.role === 'admin') {
              setCurrentView('admin');
            } else {
              setCurrentView('dashboard');
            }
          }, 700);
        }
      } catch (e) {
        // quiet retry
      }
    };

    // Immediate check + interval
    checkRealtime();
    timer = setInterval(checkRealtime, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(timer);
    };
  }, [displayEmail, accessStatus.role, user?.role, setCurrentView]);

  const handleRecheck = async () => {
    setIsChecking(true);
    setNotice(null);
    try {
      const approved = await checkAccessStatus(displayEmail);
      if (approved) {
        setNotice('Access approved! Redirecting to platform...');
        setTimeout(() => {
          if (accessStatus.role === 'admin' || user?.role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('dashboard');
          }
        }, 700);
      } else {
        setNotice('Access is still pending. The page is automatically checking in real-time as the admin updates your access.');
      }
    } catch (e: any) {
      setNotice(e?.message || 'Could not reach server to verify access approval.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('login');
  };

  return (
    <div
      id="access-restricted-page"
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 font-sans selection:bg-rose-500 selection:text-white"
    >
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-md rounded-3xl border border-rose-900/30 p-8 shadow-2xl shadow-rose-950/40 text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-9 h-9" />
        </div>

        {/* Live Real-time Indicator Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Sync Active: Auto-detecting admin changes in real time</span>
        </div>

        {/* Required Headline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Access Restricted
        </h1>

        {/* Required Message */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
          Your email address has not been approved by the administrator.
          Please contact the administrator to request access.
        </p>

        {/* Current Authenticated Email Card */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 mb-6 text-left">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>Attempted Login Email</span>
          </div>
          <div className="text-sm font-mono font-semibold text-slate-200 truncate">
            {displayEmail}
          </div>
          <div className="mt-2 text-[11px] text-amber-400/90 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Status: <strong>Pending Administrator Whitelist Approval</strong></span>
          </div>
        </div>

        {notice && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-5 flex items-center space-x-2 font-medium ${
              notice.includes('granted') || notice.includes('approved')
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
            }`}
          >
            {notice.includes('granted') || notice.includes('approved') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{notice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            id="recheck-access-btn"
            onClick={handleRecheck}
            disabled={isChecking}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Verifying with Server...' : 'Check Approval Status Now'}</span>
          </button>

          <button
            id="logout-restricted-btn"
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign In with Different Account</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span>Access control enforced via Firestore Whitelist & Backend Gate</span>
        </div>
      </div>
    </div>
  );
};

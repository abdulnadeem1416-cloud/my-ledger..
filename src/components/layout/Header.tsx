import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Bell,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';

interface HeaderProps {
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTabTitle }) => {
  const {
    preferences,
    updatePreferences,
    setCommandPaletteOpen,
    setActiveModal,
    lockApp,
    currentLoginId,
  } = useLedger();

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsList = [
    {
      id: 1,
      title: 'Welcome to My Ledger! 🎉',
      desc: 'Set your daily budget to start your personal savings journey.',
      time: 'Just now',
    },
    {
      id: 2,
      title: 'Daily Money Journal',
      desc: 'Log every expense today to build high financial score.',
      time: 'Today',
    },
  ];

  const toggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: nextTheme });
  };

  const toggleHideBalances = () => {
    updatePreferences({ hideBalances: !preferences.hideBalances });
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-sidebar flex items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
      {/* Left: macOS Traffic Lights & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition-opacity cursor-pointer shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-amber-500 hover:opacity-80 transition-opacity cursor-pointer shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-emerald-500 hover:opacity-80 transition-opacity cursor-pointer shadow-sm" />
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            My Ledger
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
            {activeTabTitle}
          </span>
        </div>
      </div>

      {/* Center: Command Bar Search Trigger (Raycast style) */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span>Search expenses, categories, actions...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* New Transaction Button */}
        <button
          onClick={() => setActiveModal('new-transaction')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>

        {/* Hide/Show Balances Toggle */}
        <button
          onClick={toggleHideBalances}
          title={preferences.hideBalances ? 'Show Balances' : 'Hide Balances'}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {preferences.hideBalances ? (
            <EyeOff className="w-4 h-4 text-amber-500" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Companion Updates
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {notificationsList.length} New
                </span>
              </div>
              <div className="space-y-2.5">
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {n.title}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {n.desc}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {preferences.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Lock Vault Button */}
        <button
          onClick={lockApp}
          title="Lock App Session"
          className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lock</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-1" title={`Logged in as ${currentLoginId || preferences.userName}`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {(currentLoginId || preferences.userName).charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

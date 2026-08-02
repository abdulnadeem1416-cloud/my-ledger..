import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Target,
  Settings,
  Shield,
  Sparkles,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Journal', icon: LayoutDashboard, shortcut: '⌘1' },
  { path: '/ledger', label: 'Ledger', icon: Receipt, shortcut: '⌘2', badge: 'Live' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, shortcut: '⌘3' },
  { path: '/goals', label: 'Goals', icon: Target, shortcut: '⌘4' },
  { path: '/settings', label: 'Settings', icon: Settings, shortcut: '⌘5' },
];

export const Sidebar: React.FC = () => {
  const { preferences, formatCurrency, goals, transactions } = useLedger();

  // Total savings
  const goalsSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalIncome = transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const totalSaved = goalsSavings + Math.max(0, totalIncome - totalExpenses);

  return (
    <aside className="w-64 glass-sidebar h-screen sticky top-0 flex flex-col justify-between p-4 select-none z-20">
      <div className="space-y-6">
        {/* Companion Header */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                {preferences.userName}&apos;s Companion
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Personal Finance Journal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl border border-indigo-500/20"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="relative z-10 flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {item.shortcut}
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Companion Motivation Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" /> Daily Habit Tracker
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            Track every rupee you spend or save each day to build financial discipline.
          </p>
        </div>
      </div>

      {/* Footer Total Money Saved Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-lg space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Money Saved
          </span>
          <span className="text-emerald-400 font-bold">Goal Tracker</span>
        </div>
        <div className="text-xl font-bold font-mono tracking-tight text-white">
          {formatCurrency(totalSaved)}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 dark:border-slate-700/80 text-[10px] text-slate-400">
          <span>Personal Savings Vault</span>
          <Shield className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>
    </aside>
  );
};

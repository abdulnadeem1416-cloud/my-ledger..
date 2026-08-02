import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  ArrowDownRight,
  Utensils,
  Plane,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Stethoscope,
  MoreHorizontal,
  Wallet,
  ShieldCheck,
  Zap,
  Settings,
  Receipt,
  PiggyBank,
  HeartHandshake,
  Flame,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { GlassCard } from '../common/GlassCard';

export const DashboardPage: React.FC = () => {
  const { preferences, setActiveModal, formatCurrency, transactions, goals } = useLedger();

  // Time-based greeting calculation
  const [greeting, setGreeting] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDateStr(now.toLocaleDateString('en-IN', options));
  }, []);

  // Standard categories for the companion journal
  const STANDARD_CATEGORIES = useMemo(
    () => [
      { name: 'Food & Dining', icon: Utensils, color: 'text-amber-500 bg-amber-500/10' },
      { name: 'Shopping', icon: ShoppingBag, color: 'text-pink-500 bg-pink-500/10' },
      { name: 'Travel & Transport', icon: Plane, color: 'text-blue-500 bg-blue-500/10' },
      { name: 'Utilities & Bills', icon: Zap, color: 'text-indigo-500 bg-indigo-500/10' },
      { name: 'Healthcare & Medical', icon: Stethoscope, color: 'text-rose-500 bg-rose-500/10' },
      { name: 'Education & Learning', icon: GraduationCap, color: 'text-purple-500 bg-purple-500/10' },
      { name: 'Business & Work', icon: Briefcase, color: 'text-emerald-500 bg-emerald-500/10' },
      { name: 'Others', icon: MoreHorizontal, color: 'text-slate-500 bg-slate-500/10' },
    ],
    []
  );

  // 1. Calculate Spent Today dynamically ONLY from real user transactions
  const todayDateStr = new Date().toISOString().split('T')[0];
  const localDateStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD in local time

  const expenseTransactions = useMemo(
    () => transactions.filter((tx) => tx.type === 'expense'),
    [transactions]
  );

  const todayExpenses = useMemo(
    () =>
      expenseTransactions.filter(
        (tx) => tx.date === todayDateStr || tx.date === localDateStr
      ),
    [expenseTransactions, todayDateStr, localDateStr]
  );

  const spentToday = useMemo(
    () => todayExpenses.reduce((sum, tx) => sum + tx.amount, 0),
    [todayExpenses]
  );

  const todaysBudget = preferences.dailyBudget || 0;

  // Remaining budget is 0 until a daily budget is set
  const remainingToday = todaysBudget > 0 ? Math.max(0, todaysBudget - spentToday) : 0;

  const spentPercentage =
    todaysBudget > 0 ? Math.min(100, Math.round((spentToday / todaysBudget) * 100)) : 0;

  // Calculate Savings This Month
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthIncome = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'income' && tx.date.startsWith(currentMonthStr))
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions, currentMonthStr]
  );

  const monthExpenses = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthStr))
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions, currentMonthStr]
  );

  const savingsThisMonth = Math.max(0, monthIncome - monthExpenses);

  // Money Saved: sum of custom goals savings + all-time net savings
  const goalsSavings = useMemo(
    () => goals.reduce((sum, g) => sum + g.currentAmount, 0),
    [goals]
  );

  const totalIncomeAllTime = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const totalExpensesAllTime = useMemo(
    () => expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    [expenseTransactions]
  );

  const moneySaved = goalsSavings + Math.max(0, totalIncomeAllTime - totalExpensesAllTime);

  // Financial Score: "--" or "Start Tracking" if no transactions
  const hasData = transactions.length > 0;
  const financialScore = hasData
    ? Math.max(50, Math.min(100, 85 - Math.floor((spentToday / (todaysBudget || 1)) * 20)))
    : null;

  // Category Overview: calculate real expense amounts per standard category
  const categoriesOverview = useMemo(() => {
    const totals: Record<string, number> = {};
    expenseTransactions.forEach((tx) => {
      const cat = tx.category || 'Others';
      totals[cat] = (totals[cat] || 0) + tx.amount;
    });

    return STANDARD_CATEGORIES.map((cat) => ({
      ...cat,
      spent: totals[cat.name] || totals[cat.name.split(' ')[0]] || 0,
    }));
  }, [expenseTransactions, STANDARD_CATEGORIES]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Section: Greeting & Date */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{currentDateStr}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            {greeting}, {preferences.userName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your personal money journal & daily savings companion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal('new-transaction')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </motion.button>
        </div>
      </motion.div>

      {/* Welcome Banner when user opens for the first time */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    Welcome to My Ledger.
                  </h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Start by setting your daily budget and adding your first expense.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveModal('settings')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" /> Set Daily Budget
                </button>
                <button
                  onClick={() => setActiveModal('new-transaction')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Expense
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* 2. Core Financial Cards (Required metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Today's Budget */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-15 bg-blue-500 group-hover:opacity-25 transition-opacity" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Budget
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
              {formatCurrency(todaysBudget)}
            </h3>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
            {todaysBudget > 0 ? 'Allocated cap' : 'Set limit'}
          </div>
        </GlassCard>

        {/* Metric 2: Today's Spending */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-15 bg-rose-500 group-hover:opacity-25 transition-opacity" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Spending
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
              {formatCurrency(spentToday)}
            </h3>
          </div>
          <div className="mt-2 text-[10px] text-rose-500 font-semibold">
            {todaysBudget > 0 ? `${spentPercentage}% of cap` : '₹0 spent'}
          </div>
        </GlassCard>

        {/* Metric 3: Remaining Budget */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-15 bg-emerald-500 group-hover:opacity-25 transition-opacity" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Remaining Budget
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(remainingToday)}
            </h3>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
            {todaysBudget > 0 ? 'Safe limit' : 'Set daily budget'}
          </div>
        </GlassCard>

        {/* Metric 4: Savings This Month */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-15 bg-purple-500 group-hover:opacity-25 transition-opacity" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Savings This Month
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400 font-mono">
              {formatCurrency(savingsThisMonth)}
            </h3>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
            Current month savings
          </div>
        </GlassCard>

        {/* Metric 5: Financial Score */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-15 bg-amber-500 group-hover:opacity-25 transition-opacity" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Financial Score
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 font-mono">
              {financialScore !== null ? `${financialScore}/100` : '--'}
            </h3>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {financialScore !== null ? 'Active' : 'Start Tracking'}
          </div>
        </GlassCard>

        {/* Metric 6: Money Saved */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-15 bg-indigo-500 group-hover:opacity-25 transition-opacity" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Money Saved
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
              {formatCurrency(moneySaved)}
            </h3>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
            Total accumulated
          </div>
        </GlassCard>
      </div>

      {/* 3. Motivational Money Companion & Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Companion Motivation Card */}
        <GlassCard hoverEffect={false} className="space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-pink-500" /> Daily Companion Motivation
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                Mindful Money Journal
              </h2>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" /> Habit Streak: 1 Day
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed italic">
              &ldquo;Small daily savings compound into massive financial independence. Record every expense with intention today.&rdquo;
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your money companion is watching your daily budget pace to ensure you stay on track.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {hasData
                ? 'Your personal money companion is active and calculating live stats.'
                : 'Log your first transaction to unlock deep companion analytics.'}
            </span>
          </div>
        </GlassCard>

        {/* Today's Budget Pace Ring */}
        <GlassCard hoverEffect={false} className="flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Today&apos;s Budget Pace
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                {todaysBudget > 0 ? `${spentPercentage}% Utilized` : 'No Budget Set'}
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {formatCurrency(remainingToday)} left
            </span>
          </div>

          <div className="flex items-center justify-center py-1">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200 dark:text-slate-800"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#ringGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * spentPercentage) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute text-center">
                <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100">
                  {spentPercentage}%
                </span>
                <span className="block text-[9px] uppercase font-bold text-slate-400">
                  Used
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 4. Expense Categories (Start at ₹0 until expenses added) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Overview */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Expense Categories
              </h2>
              <p className="text-xs text-slate-400">
                All categories start at ₹0 until you record your own expenses.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {categoriesOverview.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categoriesOverview.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${cat.color} shadow-xs`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0">
                    {formatCurrency(cat.spent)}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Recent Journal Expenses Today */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Today&apos;s Expense Log
              </h2>
              <p className="text-xs text-slate-400">Logged journal entries for today</p>
            </div>
            <button
              onClick={() => setActiveModal('new-transaction')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Add Expense <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayExpenses.length > 0 ? (
            <div className="space-y-2.5">
              {todayExpenses.slice(0, 5).map((tx) => (
                <motion.div
                  key={tx.id}
                  whileHover={{ x: 2 }}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {tx.category} • {tx.paymentMethod || 'Cash Journal'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                      -{formatCurrency(tx.amount)}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {tx.date}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No expenses logged today. Click Add Expense above to record your first entry.
              </p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/30 text-center text-xs text-slate-500">
            All journal records stored securely in your private vault.
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

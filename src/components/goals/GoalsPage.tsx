import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  ShieldAlert,
  Wallet,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  PiggyBank,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Percent,
  RefreshCw,
  Sliders,
  Check,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SavingsGoal } from '../../types';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoalAmount,
    formatCurrency,
    getTotalExpenses,
    transactions,
  } = useLedger();

  // LOCAL STORAGE PERSISTED GOAL & BUDGET TARGETS
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('myledger_monthly_budget');
    return saved ? parseFloat(saved) : 0;
  });

  const [savingsGoalTarget, setSavingsGoalTarget] = useState<number>(() => {
    const saved = localStorage.getItem('myledger_savings_goal_target');
    return saved ? parseFloat(saved) : 0;
  });

  const [savingsGoalCurrent, setSavingsGoalCurrent] = useState<number>(() => {
    const saved = localStorage.getItem('myledger_savings_goal_current');
    return saved ? parseFloat(saved) : 0;
  });

  const [emergencyFundTarget, setEmergencyFundTarget] = useState<number>(() => {
    const saved = localStorage.getItem('myledger_emergency_fund_target');
    return saved ? parseFloat(saved) : 0;
  });

  const [emergencyFundCurrent, setEmergencyFundCurrent] = useState<number>(() => {
    const saved = localStorage.getItem('myledger_emergency_fund_current');
    return saved ? parseFloat(saved) : 0;
  });

  // Save changes to localStorage whenever states change
  useEffect(() => {
    localStorage.setItem('myledger_monthly_budget', String(monthlyBudget));
  }, [monthlyBudget]);

  useEffect(() => {
    localStorage.setItem('myledger_savings_goal_target', String(savingsGoalTarget));
  }, [savingsGoalTarget]);

  useEffect(() => {
    localStorage.setItem('myledger_savings_goal_current', String(savingsGoalCurrent));
  }, [savingsGoalCurrent]);

  useEffect(() => {
    localStorage.setItem('myledger_emergency_fund_target', String(emergencyFundTarget));
  }, [emergencyFundTarget]);

  useEffect(() => {
    localStorage.setItem('myledger_emergency_fund_current', String(emergencyFundCurrent));
  }, [emergencyFundCurrent]);

  // Modal State for Editing Main Goals & Budgets
  const [activeEditModal, setActiveEditModal] = useState<
    'monthlyBudget' | 'savingsGoal' | 'emergencyFund' | 'newCustomGoal' | null
  >(null);

  // Form Inputs for Modals
  const [tempBudgetInput, setTempBudgetInput] = useState('');
  const [tempSavingsTargetInput, setTempSavingsTargetInput] = useState('');
  const [tempSavingsCurrentInput, setTempSavingsCurrentInput] = useState('');
  const [tempEmergencyTargetInput, setTempEmergencyTargetInput] = useState('');
  const [tempEmergencyCurrentInput, setTempEmergencyCurrentInput] = useState('');

  // Quick Deposit State for Cards
  const [quickDepositSavings, setQuickDepositSavings] = useState('');
  const [quickDepositEmergency, setQuickDepositEmergency] = useState('');

  // Custom Goal Form State
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customGoalTarget, setCustomGoalTarget] = useState('');
  const [customGoalCurrent, setCustomGoalCurrent] = useState('');
  const [customGoalCategory, setCustomGoalCategory] = useState('Savings');
  const [customGoalDeadline, setCustomGoalDeadline] = useState('2026-12-31');

  // Filter state for custom goals list
  const [goalFilter, setGoalFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [quickAddAmount, setQuickAddAmount] = useState<Record<string, string>>({});

  // CALCULATIONS
  // 1. Current Month Expenses calculated from transactions
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const curYearMonth = now.toISOString().substring(0, 7);
    return transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(curYearMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Budget Remaining
  const budgetRemaining = Math.max(0, monthlyBudget - currentMonthExpenses);
  const budgetUsedPct = Math.min(100, Math.round((currentMonthExpenses / (monthlyBudget || 1)) * 100));

  // Savings Goal %
  const savingsPct = Math.min(100, Math.round((savingsGoalCurrent / (savingsGoalTarget || 1)) * 100));

  // Emergency Fund Goal %
  const emergencyPct = Math.min(
    100,
    Math.round((emergencyFundCurrent / (emergencyFundTarget || 1)) * 100)
  );

  // Total Money Saved across Savings Goal + Emergency Fund + Custom Goals
  const customGoalsSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalMoneySaved = savingsGoalCurrent + emergencyFundCurrent + customGoalsSaved;

  // Total Target across all
  const customGoalsTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalTargetSum = savingsGoalTarget + emergencyFundTarget + customGoalsTarget;

  // Overall Goal Completion %
  const totalCurrentSum = savingsGoalCurrent + emergencyFundCurrent + customGoalsSaved;
  const overallGoalCompletionPct =
    totalTargetSum > 0 ? Math.min(100, Math.round((totalCurrentSum / totalTargetSum) * 100)) : 0;

  // Open Edit Modal handlers
  const openEditMonthlyBudget = () => {
    setTempBudgetInput(String(monthlyBudget));
    setActiveEditModal('monthlyBudget');
  };

  const openEditSavingsGoal = () => {
    setTempSavingsTargetInput(String(savingsGoalTarget));
    setTempSavingsCurrentInput(String(savingsGoalCurrent));
    setActiveEditModal('savingsGoal');
  };

  const openEditEmergencyFund = () => {
    setTempEmergencyTargetInput(String(emergencyFundTarget));
    setTempEmergencyCurrentInput(String(emergencyFundCurrent));
    setActiveEditModal('emergencyFund');
  };

  // Submit Save Handlers
  const handleSaveMonthlyBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempBudgetInput);
    if (!isNaN(val) && val >= 0) {
      setMonthlyBudget(val);
    }
    setActiveEditModal(null);
  };

  const handleSaveSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(tempSavingsTargetInput);
    const currentVal = parseFloat(tempSavingsCurrentInput);
    if (!isNaN(targetVal) && targetVal >= 0) setSavingsGoalTarget(targetVal);
    if (!isNaN(currentVal) && currentVal >= 0) setSavingsGoalCurrent(currentVal);
    setActiveEditModal(null);
  };

  const handleSaveEmergencyFund = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(tempEmergencyTargetInput);
    const currentVal = parseFloat(tempEmergencyCurrentInput);
    if (!isNaN(targetVal) && targetVal >= 0) setEmergencyFundTarget(targetVal);
    if (!isNaN(currentVal) && currentVal >= 0) setEmergencyFundCurrent(currentVal);
    setActiveEditModal(null);
  };

  // Quick Deposits
  const handleDepositSavings = () => {
    const amt = parseFloat(quickDepositSavings);
    if (!isNaN(amt) && amt > 0) {
      setSavingsGoalCurrent((prev) => prev + amt);
      setQuickDepositSavings('');
    }
  };

  const handleDepositEmergency = () => {
    const amt = parseFloat(quickDepositEmergency);
    if (!isNaN(amt) && amt > 0) {
      setEmergencyFundCurrent((prev) => prev + amt);
      setQuickDepositEmergency('');
    }
  };

  // Custom Goal creation
  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(customGoalTarget);
    const current = parseFloat(customGoalCurrent) || 0;
    if (!customGoalTitle.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      title: customGoalTitle.trim(),
      targetAmount: target,
      currentAmount: current,
      category: customGoalCategory,
      deadline: customGoalDeadline,
      isCompleted: current >= target,
      color: 'from-purple-500 to-indigo-600',
    });

    setCustomGoalTitle('');
    setCustomGoalTarget('');
    setCustomGoalCurrent('');
    setActiveEditModal(null);
  };

  const handleQuickAddCustom = (goalId: string, currentVal: number) => {
    const addVal = parseFloat(quickAddAmount[goalId] || '250');
    if (!isNaN(addVal) && addVal > 0) {
      updateGoalAmount(goalId, currentVal + addVal);
      setQuickAddAmount((prev) => ({ ...prev, [goalId]: '' }));
    }
  };

  const filteredCustomGoals = goals.filter((g) => {
    if (goalFilter === 'active') return !g.isCompleted;
    if (goalFilter === 'completed') return g.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Overview Banner */}
      <GlassCard hoverEffect={false} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Target className="w-5 h-5" />
              </div>
              Financial Goals & Budget Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure your monthly budget limits, savings targets, and emergency safety reserves.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveEditModal('newCustomGoal')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Custom Goal
          </motion.button>
        </div>

        {/* Aggregate Key Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
          {/* Metric 1: Budget Remaining */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Budget Remaining
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {formatCurrency(budgetRemaining)}
              </span>
              <span className="text-[11px] text-slate-500">
                of {formatCurrency(monthlyBudget)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Spent so far: {formatCurrency(currentMonthExpenses)} ({budgetUsedPct}% used)
            </p>
          </div>

          {/* Metric 2: Money Saved */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Money Saved
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalMoneySaved)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Combined reserve across all savings & emergency accounts
            </p>
          </div>

          {/* Metric 3: Overall Goal Completion */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Goal Completion %
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                {overallGoalCompletionPct}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {formatCurrency(totalCurrentSum)} of {formatCurrency(totalTargetSum)} achieved
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 2. Three Featured Cards (Monthly Budget, Savings Goal, Emergency Fund Goal) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Monthly Budget */}
        <GlassCard hoverEffect={false} className="space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <button
                onClick={openEditMonthlyBudget}
                className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                title="Edit Monthly Budget"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Primary Allowance
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Monthly Budget
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  {formatCurrency(monthlyBudget)}
                </span>
                <span className="text-slate-500 font-semibold">
                  Used: {budgetUsedPct}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetUsedPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    budgetUsedPct > 90
                      ? 'bg-rose-500'
                      : budgetUsedPct > 75
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                <span>Spent: {formatCurrency(currentMonthExpenses)}</span>
                <span className="font-bold text-emerald-500">
                  Left: {formatCurrency(budgetRemaining)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <button
              onClick={openEditMonthlyBudget}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" /> Adjust Budget Limit
            </button>
          </div>
        </GlassCard>

        {/* CARD 2: Savings Goal */}
        <GlassCard hoverEffect={false} className="space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <PiggyBank className="w-5 h-5" />
              </div>
              <button
                onClick={openEditSavingsGoal}
                className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                title="Edit Savings Goal"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Wealth Building
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Savings Goal
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  {formatCurrency(savingsGoalCurrent)}
                </span>
                <span className="text-slate-500 font-semibold">
                  Target: {formatCurrency(savingsGoalTarget)}
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${savingsPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                <span className="font-bold text-emerald-500">{savingsPct}% Achieved</span>
                <span>To Go: {formatCurrency(Math.max(0, savingsGoalTarget - savingsGoalCurrent))}</span>
              </div>
            </div>
          </div>

          {/* Quick Deposit Input */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="number"
                  placeholder="Deposit amount"
                  value={quickDepositSavings}
                  onChange={(e) => setQuickDepositSavings(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <button
                onClick={handleDepositSavings}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                + Save
              </button>
            </div>
          </div>
        </GlassCard>

        {/* CARD 3: Emergency Fund Goal */}
        <GlassCard hoverEffect={false} className="space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <button
                onClick={openEditEmergencyFund}
                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                title="Edit Emergency Fund"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Safety Reserve
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Emergency Fund Goal
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  {formatCurrency(emergencyFundCurrent)}
                </span>
                <span className="text-slate-500 font-semibold">
                  Target: {formatCurrency(emergencyFundTarget)}
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emergencyPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                <span className="font-bold text-amber-500">{emergencyPct}% Covered</span>
                <span>
                  To Go: {formatCurrency(Math.max(0, emergencyFundTarget - emergencyFundCurrent))}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Deposit Input */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="number"
                  placeholder="Reserve amount"
                  value={quickDepositEmergency}
                  onChange={(e) => setQuickDepositEmergency(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <button
                onClick={handleDepositEmergency}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                + Fund
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 3. Custom Goals Section */}
      <GlassCard hoverEffect={false} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Custom Financial Milestones
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vacation funds, gadget upgrades, investment capital, and vehicle purchases.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setGoalFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                goalFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({goals.length})
            </button>
            <button
              onClick={() => setGoalFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                goalFilter === 'active'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Active ({goals.filter((g) => !g.isCompleted).length})
            </button>
            <button
              onClick={() => setGoalFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                goalFilter === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Completed ({goals.filter((g) => g.isCompleted).length})
            </button>
          </div>
        </div>

        {/* Custom Goals Grid */}
        {filteredCustomGoals.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Target className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No goals set yet.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create a savings milestone or financial goal to start tracking progress.
            </p>
            <button
              onClick={() => setActiveEditModal('newCustomGoal')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCustomGoals.map((goal) => {
              const pct = Math.min(
                100,
                Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100)
              );

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-bold text-[10px] uppercase">
                        {goal.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {goal.title}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${goal.color} flex items-center justify-center text-white shrink-0`}
                    >
                      <Target className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-slate-500 font-semibold">
                        Target: {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                      <span>Deadline: {goal.deadline}</span>
                      <span className="font-bold text-indigo-500">{pct}% Complete</span>
                    </div>
                  </div>

                  {!goal.isCompleted && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Add deposit"
                        value={quickAddAmount[goal.id] || ''}
                        onChange={(e) =>
                          setQuickAddAmount({ ...quickAddAmount, [goal.id]: e.target.value })
                        }
                        className="w-full px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <button
                        onClick={() => handleQuickAddCustom(goal.id, goal.currentAmount)}
                        className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        + Deposit
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        )}
      </GlassCard>

      {/* EDIT MODAL: Monthly Budget */}
      <Modal
        isOpen={activeEditModal === 'monthlyBudget'}
        onClose={() => setActiveEditModal(null)}
        title="Adjust Monthly Budget Target"
        subtitle="Set your overall monthly expenditure ceiling."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveMonthlyBudget} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Monthly Budget Amount ($) *
            </label>
            <input
              type="number"
              required
              step="50"
              value={tempBudgetInput}
              onChange={(e) => setTempBudgetInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveEditModal(null)}
              className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              Save Budget
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL: Savings Goal */}
      <Modal
        isOpen={activeEditModal === 'savingsGoal'}
        onClose={() => setActiveEditModal(null)}
        title="Configure Savings Goal"
        subtitle="Set your primary savings target and current saved balance."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveSavingsGoal} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Savings Target ($) *
            </label>
            <input
              type="number"
              required
              value={tempSavingsTargetInput}
              onChange={(e) => setTempSavingsTargetInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Current Saved Balance ($) *
            </label>
            <input
              type="number"
              required
              value={tempSavingsCurrentInput}
              onChange={(e) => setTempSavingsCurrentInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveEditModal(null)}
              className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
            >
              Save Target
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL: Emergency Fund */}
      <Modal
        isOpen={activeEditModal === 'emergencyFund'}
        onClose={() => setActiveEditModal(null)}
        title="Configure Emergency Reserve"
        subtitle="Update safety net reserve goals and accumulated capital."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveEmergencyFund} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Emergency Fund Target ($) *
            </label>
            <input
              type="number"
              required
              value={tempEmergencyTargetInput}
              onChange={(e) => setTempEmergencyTargetInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Current Reserve Balance ($) *
            </label>
            <input
              type="number"
              required
              value={tempEmergencyCurrentInput}
              onChange={(e) => setTempEmergencyCurrentInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveEditModal(null)}
              className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-600/20"
            >
              Save Reserve
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE MODAL: Custom Goal */}
      <Modal
        isOpen={activeEditModal === 'newCustomGoal'}
        onClose={() => setActiveEditModal(null)}
        title="Create New Custom Goal"
        subtitle="Set up a target milestone for a vehicle, property, or event."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCustomGoal} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Japan Trip 2027"
              value={customGoalTitle}
              onChange={(e) => setCustomGoalTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Target ($) *
              </label>
              <input
                type="number"
                required
                placeholder="5000"
                value={customGoalTarget}
                onChange={(e) => setCustomGoalTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Initial Saved ($)
              </label>
              <input
                type="number"
                placeholder="1000"
                value={customGoalCurrent}
                onChange={(e) => setCustomGoalCurrent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={customGoalCategory}
                onChange={(e) => setCustomGoalCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Savings">Savings</option>
                <option value="Travel">Travel</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Housing">Housing</option>
                <option value="Investments">Investments</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={customGoalDeadline}
                onChange={(e) => setCustomGoalDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveEditModal(null)}
              className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              Create Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

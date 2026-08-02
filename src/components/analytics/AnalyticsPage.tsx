import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShoppingBag,
  Sparkles,
  Award,
  Plus,
  Utensils,
  Plane,
  GraduationCap,
  Briefcase,
  Stethoscope,
  MoreHorizontal,
  Flame,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useLedger } from '../../context/LedgerContext';
import { GlassCard } from '../common/GlassCard';
import { StatCard } from '../common/StatCard';

export const AnalyticsPage: React.FC = () => {
  const { transactions, formatCurrency, setActiveModal } = useLedger();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Filter expenses only
  const expenses = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense');
  }, [transactions]);

  // CATEGORY COLORS
  const categoryColors: Record<string, string> = {
    Food: '#f59e0b',
    Travel: '#3b82f6',
    Shopping: '#ec4899',
    Education: '#8b5cf6',
    Business: '#10b981',
    Medical: '#ef4444',
    Others: '#64748b',
    Housing: '#6366f1',
    Utilities: '#06b6d4',
  };

  // 1. TOP SPENDING CATEGORY
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((tx) => {
      const cat = tx.category || 'Others';
      totals[cat] = (totals[cat] || 0) + tx.amount;
    });
    return totals;
  }, [expenses]);

  const topCategory = useMemo(() => {
    let topName = 'None';
    let maxVal = 0;
    Object.keys(categoryTotals).forEach((cat) => {
      const amount = categoryTotals[cat];
      if (amount > maxVal) {
        maxVal = amount;
        topName = cat;
      }
    });
    const totalAll = (Object.values(categoryTotals) as number[]).reduce((a, b) => a + b, 0);
    const pct = totalAll > 0 ? Math.round((maxVal / totalAll) * 100) : 0;
    return { name: topName, amount: maxVal, pct };
  }, [categoryTotals]);

  // 2. NECESSARY VS UNNECESSARY
  const necessaryStats = useMemo(() => {
    let necessaryTotal = 0;
    let unnecessaryTotal = 0;

    expenses.forEach((tx) => {
      if (tx.isNecessary === false) {
        unnecessaryTotal += tx.amount;
      } else {
        necessaryTotal += tx.amount;
      }
    });

    const total = necessaryTotal + unnecessaryTotal;
    const necessaryPct = total > 0 ? Math.round((necessaryTotal / total) * 100) : 0;
    const unnecessaryPct = total > 0 ? 100 - necessaryPct : 0;

    return {
      necessaryTotal,
      unnecessaryTotal,
      necessaryPct,
      unnecessaryPct,
    };
  }, [expenses]);

  // 3. HIGHEST SINGLE EXPENSE
  const highestExpense = useMemo(() => {
    if (expenses.length === 0) return null;

    let maxTx = expenses[0];
    expenses.forEach((tx) => {
      if (tx.amount > maxTx.amount) {
        maxTx = tx;
      }
    });

    return maxTx;
  }, [expenses]);

  // 4. AVERAGE DAILY SPENDING
  const dailyAggregates = useMemo(() => {
    if (expenses.length === 0) return { avgDaily: 0, totalSpent: 0 };
    const dayMap: Record<string, number> = {};

    expenses.forEach((tx) => {
      dayMap[tx.date] = (dayMap[tx.date] || 0) + tx.amount;
    });

    let totalSpent = 0;
    const daysCount = Object.keys(dayMap).length || 1;

    Object.values(dayMap).forEach((amt) => {
      totalSpent += amt;
    });

    const avgDaily = Math.round((totalSpent / daysCount) * 100) / 100;
    return { avgDaily, totalSpent };
  }, [expenses]);

  // CHART DATA: Daily Spending (Past 7 Days)
  const dailyChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = days[d.getDay()];

      let dayTotal = 0;
      expenses
        .filter((tx) => tx.date === dateStr)
        .forEach((tx) => (dayTotal += tx.amount));

      result.push({
        day: dayLabel,
        date: dateStr,
        amount: Math.round(dayTotal * 100) / 100,
      });
    }

    return result;
  }, [expenses]);

  // PIE CHART DATA (Category Breakdown)
  const pieData = useMemo(() => {
    return Object.keys(categoryTotals).map((name) => {
      const value = categoryTotals[name];
      return {
        name,
        value: Math.round(value * 100) / 100,
        color: categoryColors[name] || '#6366f1',
      };
    });
  }, [categoryTotals]);

  const hasData = expenses.length > 0;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Control */}
      <GlassCard hoverEffect={false} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            Analytics & Financial Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics and category breakdowns calculated from your ledger.
          </p>
        </div>

        {hasData && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'daily'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
          </div>
        )}
      </GlassCard>

      {!hasData ? (
        /* Empty State */
        <GlassCard hoverEffect={false} className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              No Analytics Available Yet
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add your first expense or income to unlock real-time spending charts, category breakdowns, and AI intelligence.
            </p>
          </div>
          <button
            onClick={() => setActiveModal('new-transaction')}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Expense
          </button>
        </GlassCard>
      ) : (
        /* Real Data Dashboard */
        <>
          {/* 2. Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Top Category"
              value={topCategory.name}
              subtext={`${formatCurrency(topCategory.amount)} (${topCategory.pct}% of total)`}
              icon={<ShoppingBag className="w-5 h-5 text-amber-500" />}
              color="amber"
            />
            <StatCard
              title="Needs Ratio"
              value={`${necessaryStats.necessaryPct}%`}
              subtext={`Essential spending (${formatCurrency(necessaryStats.necessaryTotal)})`}
              icon={<Award className="w-5 h-5 text-emerald-500" />}
              color="emerald"
            />
            <StatCard
              title="Single Highest"
              value={highestExpense ? formatCurrency(highestExpense.amount) : formatCurrency(0)}
              subtext={highestExpense ? highestExpense.description : 'None'}
              icon={<Flame className="w-5 h-5 text-rose-500" />}
              color="rose"
            />
            <StatCard
              title="Average Daily"
              value={formatCurrency(dailyAggregates.avgDaily)}
              subtext={`Across recorded days`}
              icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
              color="indigo"
            />
          </div>

          {/* 3. Bar Chart */}
          <GlassCard hoverEffect={false} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Spending Trend
                </h2>
                <p className="text-xs text-slate-400">Daily expenses over the last 7 days</p>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 4. Pie Chart Category Breakdown */}
          {pieData.length > 0 && (
            <GlassCard hoverEffect={false} className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Category Distribution
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Spent']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};

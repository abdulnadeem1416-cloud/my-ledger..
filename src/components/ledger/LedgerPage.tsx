import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit3,
  Receipt,
  CreditCard,
  X,
  Check,
  Utensils,
  Plane,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Stethoscope,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { Transaction } from '../../types';

export const LedgerPage: React.FC = () => {
  const {
    transactions,
    deleteTransaction,
    updateTransaction,
    formatCurrency,
    setActiveModal,
  } = useLedger();

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Modal Editing & Deleting states
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editSuccessMessage, setEditSuccessMessage] = useState(false);

  // Edit Form State
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Food & Dining');
  const [editDescription, setEditDescription] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('UPI / GPay / PhonePe');
  const [editIsNecessary, setEditIsNecessary] = useState(true);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // Icon and badge styling for categories
  const getCategoryDetails = (catName: string) => {
    const norm = catName.toLowerCase();
    if (norm.includes('food')) {
      return { icon: Utensils, label: 'Food & Dining', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    }
    if (norm.includes('travel') || norm.includes('transport')) {
      return { icon: Plane, label: 'Travel & Transport', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' };
    }
    if (norm.includes('shop') || norm.includes('entertainment')) {
      return { icon: ShoppingBag, label: 'Shopping', color: 'text-pink-500 bg-pink-500/10 border-pink-500/30' };
    }
    if (norm.includes('util') || norm.includes('bill')) {
      return { icon: Zap, label: 'Utilities & Bills', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' };
    }
    if (norm.includes('educat') || norm.includes('learn')) {
      return { icon: GraduationCap, label: 'Education & Learning', color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' };
    }
    if (norm.includes('busin') || norm.includes('work')) {
      return { icon: Briefcase, label: 'Business & Work', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (norm.includes('medic') || norm.includes('health')) {
      return { icon: Stethoscope, label: 'Healthcare & Medical', color: 'text-red-500 bg-red-500/10 border-red-500/30' };
    }
    return { icon: MoreHorizontal, label: catName || 'Others', color: 'text-slate-500 bg-slate-500/10 border-slate-500/30' };
  };

  // Pre-filter: Only Expenses from transactions list
  const expenseTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.type === 'expense');
  }, [transactions]);

  // Apply filters and search
  const filteredExpenses = useMemo(() => {
    return expenseTransactions.filter((tx) => {
      // 1. Search Filter
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        tx.description.toLowerCase().includes(search) ||
        tx.category.toLowerCase().includes(search) ||
        (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(search)) ||
        (tx.account && tx.account.toLowerCase().includes(search));

      // 2. Category Filter
      const matchesCategory =
        categoryFilter === 'ALL' ||
        tx.category.toLowerCase().includes(categoryFilter.toLowerCase());

      // 3. Payment Filter
      const matchesPayment =
        paymentFilter === 'ALL' ||
        (tx.paymentMethod && tx.paymentMethod.toLowerCase() === paymentFilter.toLowerCase()) ||
        (tx.account && tx.account.toLowerCase() === paymentFilter.toLowerCase());

      // 4. Date Filter
      let matchesDate = true;
      if (dateFilter !== 'ALL') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateFilter === 'TODAY') {
          matchesDate = tx.date === todayStr;
        } else if (dateFilter === 'THIS_WEEK') {
          const txDate = new Date(tx.date).getTime();
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          matchesDate = txDate >= sevenDaysAgo;
        } else if (dateFilter === 'THIS_MONTH') {
          const currentYearMonth = todayStr.substring(0, 7);
          matchesDate = tx.date.startsWith(currentYearMonth);
        }
      }

      return matchesSearch && matchesCategory && matchesPayment && matchesDate;
    });
  }, [expenseTransactions, searchTerm, categoryFilter, paymentFilter, dateFilter]);

  // Apply Sorting
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = `${a.date} ${a.time || '00:00'}`;
        const timeB = `${b.date} ${b.time || '00:00'}`;
        return timeB.localeCompare(timeA);
      }
      if (sortBy === 'oldest') {
        const timeA = `${a.date} ${a.time || '00:00'}`;
        const timeB = `${b.date} ${b.time || '00:00'}`;
        return timeA.localeCompare(timeB);
      }
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      if (sortBy === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [filteredExpenses, sortBy]);

  // Calculated Stats
  const totalSpentFiltered = useMemo(() => {
    return sortedExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  }, [sortedExpenses]);

  const necessaryCount = useMemo(() => {
    return sortedExpenses.filter((tx) => tx.isNecessary !== false).length;
  }, [sortedExpenses]);

  // Open Edit Modal with prefilled state
  const handleOpenEdit = (tx: Transaction) => {
    setEditingExpense(tx);
    setEditAmount(String(tx.amount));
    setEditCategory(tx.category);
    setEditDescription(tx.description);
    setEditPaymentMethod(tx.paymentMethod || tx.account || 'UPI / GPay / PhonePe');
    setEditIsNecessary(tx.isNecessary !== undefined ? tx.isNecessary : true);
    setEditDate(tx.date || new Date().toISOString().split('T')[0]);
    setEditTime(tx.time || '12:00');
    setEditSuccessMessage(false);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const numAmt = parseFloat(editAmount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    updateTransaction(editingExpense.id, {
      amount: numAmt,
      category: editCategory as any,
      description: editDescription.trim(),
      paymentMethod: editPaymentMethod,
      account: editPaymentMethod,
      isNecessary: editIsNecessary,
      date: editDate,
      time: editTime,
    });

    setEditSuccessMessage(true);
    setTimeout(() => {
      setEditingExpense(null);
      setEditSuccessMessage(false);
    }, 800);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      setDeletingId(null);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'ID,Date,Time,Category,Description,Payment Source,Necessary,Amount (INR)\n';
    const rows = sortedExpenses
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.time || '12:00'}","${t.category}","${t.description}","${
            t.paymentMethod || t.account
          }","${t.isNecessary !== false ? 'Need' : 'Want'}",${t.amount}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_journal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setExportModalOpen(false);
  };

  const hasActiveFilters =
    searchTerm !== '' || categoryFilter !== 'ALL' || paymentFilter !== 'ALL' || dateFilter !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('ALL');
    setPaymentFilter('ALL');
    setDateFilter('ALL');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Overview Bar */}
      <GlassCard hoverEffect={false} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Receipt className="w-5 h-5" />
              </div>
              Expense Journal Ledger
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your complete daily expense journal logged in your private vault.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" /> Export CSV
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModal('new-transaction')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Journal Entry
            </motion.button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Records Displayed
            </span>
            <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {sortedExpenses.length}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Filtered Total
            </span>
            <span className="text-base font-extrabold font-mono text-rose-500">
              {formatCurrency(totalSpentFiltered)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Essential Spending
            </span>
            <span className="text-base font-extrabold font-mono text-emerald-500">
              {necessaryCount} ({sortedExpenses.length > 0 ? Math.round((necessaryCount / sortedExpenses.length) * 100) : 0}%)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Vault Status
            </span>
            <span className="text-xs font-bold text-indigo-500 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
            </span>
          </div>
        </div>

        {/* Filters and Controls Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* 1. Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search journal entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Food">Food & Dining</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel & Transport</option>
              <option value="Utilities">Utilities & Bills</option>
              <option value="Education">Education & Learning</option>
              <option value="Business">Business & Work</option>
              <option value="Medical">Healthcare & Medical</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* 3. Payment Source Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Payment Sources</option>
              <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
              <option value="Cash Journal">Cash Journal</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Other Wallet">Other Wallet</option>
            </select>
          </div>

          {/* 4. Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">Past 7 Days</option>
              <option value="THIS_MONTH">This Month</option>
            </select>
          </div>

          {/* 5. Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500">
              Showing filtered journal entries
            </span>
            <button
              onClick={resetFilters}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        )}
      </GlassCard>

      {/* Main Expenses Table Card */}
      <GlassCard hoverEffect={false} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Payment Source</th>
                <th className="py-3.5 px-4 text-center">Type</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              <AnimatePresence mode="popLayout">
                {sortedExpenses.length === 0 ? (
                  <tr key="empty-state">
                    <td colSpan={8} className="py-16 text-center">
                      {/* Modern Empty State */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner">
                          <Receipt className="w-7 h-7 stroke-[1.75]" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            No Journal Entries Found
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {hasActiveFilters
                              ? 'No entries match your search criteria.'
                              : 'Your expense journal is empty. Add your first expense to begin tracking.'}
                          </p>
                        </div>

                        {hasActiveFilters ? (
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                          >
                            Reset All Filters
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveModal('new-transaction')}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Quick Add Entry
                          </button>
                        )}
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  sortedExpenses.map((tx) => {
                    const catDetails = getCategoryDetails(tx.category);
                    const CatIcon = catDetails.icon;
                    const paymentDisplay = tx.paymentMethod || tx.account || 'Cash Journal';
                    const isNeed = tx.isNecessary !== false;

                    return (
                      <motion.tr
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-indigo-500/5 transition-colors group"
                      >
                        {/* 1. Date */}
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {tx.date}
                        </td>

                        {/* 2. Time */}
                        <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                          {tx.time || '12:00 PM'}
                        </td>

                        {/* 3. Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${catDetails.color}`}>
                              <CatIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {catDetails.label}
                            </span>
                          </div>
                        </td>

                        {/* 4. Description */}
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                          {tx.description}
                        </td>

                        {/* 5. Payment Source */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold flex items-center gap-1.5 w-max">
                            <CreditCard className="w-3 h-3 text-indigo-500" />
                            {paymentDisplay}
                          </span>
                        </td>

                        {/* 6. Necessary */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isNeed
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {isNeed ? (
                              <>
                                <ThumbsUp className="w-3 h-3" /> Need
                              </>
                            ) : (
                              <>
                                <ThumbsDown className="w-3 h-3" /> Want
                              </>
                            )}
                          </span>
                        </td>

                        {/* 7. Amount */}
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          -{formatCurrency(tx.amount)}
                        </td>

                        {/* 8. Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit expense"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingId(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Edit Expense Modal */}
      <AnimatePresence>
        {editingExpense && (
          <Modal
            isOpen={!!editingExpense}
            onClose={() => setEditingExpense(null)}
            title="Edit Journal Expense"
            subtitle={`Modifying transaction entry ID: ${editingExpense.id}`}
            maxWidth="lg"
          >
            {editSuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Journal Entry Updated!
                </h3>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                {/* Amount */}
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Amount (₹) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 font-bold text-base pointer-events-none font-mono">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-base font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travel & Transport">Travel & Transport</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Education & Learning">Education & Learning</option>
                    <option value="Business & Work">Business & Work</option>
                    <option value="Healthcare & Medical">Healthcare & Medical</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Payment Source & Necessary Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Payment Source
                    </label>
                    <select
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
                      <option value="Cash Journal">Cash Journal</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Other Wallet">Other Wallet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Essential Expense?
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => setEditIsNecessary(true)}
                        className={`py-1.5 rounded-lg font-bold text-xs transition-all ${
                          editIsNecessary
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        Need
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditIsNecessary(false)}
                        className={`py-1.5 rounded-lg font-bold text-xs transition-all ${
                          !editIsNecessary
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        Want
                      </button>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingExpense(null)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <Modal
            isOpen={!!deletingId}
            onClose={() => setDeletingId(null)}
            title="Delete Expense Record"
            subtitle="Are you sure you want to remove this entry from your money journal?"
            maxWidth="sm"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>This action is permanent and will update your daily budget stats.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Expense
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Export CSV Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Expense Journal"
        subtitle="Download a clean CSV spreadsheet file of all currently filtered expenses."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Exporting <strong>{sortedExpenses.length} journal entries</strong> (Total:{' '}
            {formatCurrency(totalSpentFiltered)}).
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setExportModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

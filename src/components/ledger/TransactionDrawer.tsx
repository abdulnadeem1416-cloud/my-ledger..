import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../common/Modal';
import { useLedger } from '../../context/LedgerContext';
import {
  Utensils,
  Plane,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Stethoscope,
  MoreHorizontal,
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CategoryType } from '../../types';

export const TransactionDrawer: React.FC = () => {
  const { activeModal, setActiveModal, addTransaction, formatCurrency } = useLedger();

  // Modal open state check
  const isOpen = activeModal === 'new-transaction';

  // Form States
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI / GPay');
  const [isNecessary, setIsNecessary] = useState<boolean>(true);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');

  // UI state for smooth success animation
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Set default date and time whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);

      // Reset success state
      setIsSaved(false);
    }
  }, [isOpen]);

  // Categories list with custom styling & icons
  const categoriesList = [
    { name: 'Food & Dining', icon: Utensils, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { name: 'Shopping', icon: ShoppingBag, color: 'text-pink-500 bg-pink-500/10 border-pink-500/30' },
    { name: 'Travel & Transport', icon: Plane, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
    { name: 'Utilities & Bills', icon: Zap, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' },
    { name: 'Healthcare & Medical', icon: Stethoscope, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
    { name: 'Education & Learning', icon: GraduationCap, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
    { name: 'Business & Work', icon: Briefcase, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
    { name: 'Others', icon: MoreHorizontal, color: 'text-slate-500 bg-slate-500/10 border-slate-500/30' },
  ];

  // Payment methods list for personal finance journal
  const paymentMethodsList = [
    'UPI / GPay / PhonePe',
    'Cash Journal',
    'Debit Card',
    'Credit Card',
    'Net Banking',
    'Other Wallet',
  ];

  const handleClose = () => {
    setIsSaved(false);
    setActiveModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!description.trim()) return;

    // Add transaction to context & localStorage
    addTransaction({
      amount: numAmount,
      category: category as CategoryType,
      description: description.trim(),
      account: paymentMethod,
      paymentMethod,
      isNecessary,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      type: 'expense',
      status: 'completed',
    });

    // Trigger smooth success animation
    setIsSaved(true);

    // Auto close modal after animation
    setTimeout(() => {
      handleClose();
      // Reset form
      setAmount('');
      setDescription('');
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Journal Expense"
      subtitle="Record a new expense in your money journal to track your daily budget."
      maxWidth="lg"
    >
      <AnimatePresence mode="wait">
        {isSaved ? (
          /* Smooth Success Animation State */
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="py-12 flex flex-col items-center justify-center text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1] }}
              transition={{ duration: 0.5, times: [0, 0.7, 1] }}
              className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10"
            >
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Expense Recorded!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Saved to your personal money journal. Dashboard stats updated.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold"
            >
              -{formatCurrency(parseFloat(amount) || 0)} • {category}
            </motion.div>
          </motion.div>
        ) : (
          /* Main Expense Form */
          <motion.form
            key="form-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5 text-xs"
          >
            {/* 1. Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Amount (₹) *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 font-bold text-lg pointer-events-none font-mono">
                  ₹
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xl font-extrabold text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* 2. Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categoriesList.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.name;
                  return (
                    <button
                      type="button"
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${cat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate text-[11px] font-medium">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Description Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Groceries, Coffee, Bus Ticket, Book"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* 4. Payment Method & Necessary Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Payment Source
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {paymentMethodsList.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              {/* Necessary? Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Essential Expense?
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setIsNecessary(true)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isNecessary
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" /> Need
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNecessary(false)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !isNecessary
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" /> Want
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Date & Time Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* 6. Form Action Buttons: Save & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-all"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
              >
                Save Entry
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
};

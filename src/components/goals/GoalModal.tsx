import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useLedger } from '../../context/LedgerContext';
import { Target, CheckCircle2 } from 'lucide-react';

export const GoalModal: React.FC = () => {
  const { activeModal, setActiveModal, addGoal } = useLedger();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Vehicles');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('2027-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [colorGradient, setColorGradient] = useState('from-indigo-500 to-purple-600');
  const [success, setSuccess] = useState(false);

  const gradients = [
    { label: 'Indigo Purple', value: 'from-indigo-500 to-purple-600' },
    { label: 'Emerald Teal', value: 'from-emerald-500 to-teal-600' },
    { label: 'Amber Red', value: 'from-amber-500 to-red-600' },
    { label: 'Rose Pink', value: 'from-rose-500 to-pink-600' },
    { label: 'Blue Cyan', value: 'from-blue-500 to-cyan-600' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    addGoal({
      title,
      category,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || '0'),
      deadline,
      monthlyContribution: parseFloat(monthlyContribution || '0'),
      color: colorGradient,
      iconName: 'Target',
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setActiveModal(null);
      // Reset form
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      setMonthlyContribution('');
    }, 1000);
  };

  return (
    <Modal
      isOpen={activeModal === 'new-goal'}
      onClose={() => setActiveModal(null)}
      title="Create New Savings Goal"
      subtitle="Define your long-term financial milestones and auto-track progress."
      maxWidth="lg"
    >
      {success ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Goal Created!
          </h4>
          <p className="text-xs text-slate-500">
            Your progress tracker is now active on the Goals dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dream House Deposit, New Car, World Tour"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Vehicles">Vehicles</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Travel">Travel</option>
                <option value="Security">Security & Emergency</option>
                <option value="Investments">Investments</option>
                <option value="Tech & Hardware">Tech & Hardware</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Amount ($) *
              </label>
              <input
                type="number"
                required
                placeholder="25000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Saved ($)
              </label>
              <input
                type="number"
                placeholder="5000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Deposit ($)
              </label>
              <input
                type="number"
                placeholder="1000"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Visual Theme Gradient
            </label>
            <div className="flex items-center gap-2">
              {gradients.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setColorGradient(g.value)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                    g.value
                  } transition-transform ${
                    colorGradient === g.value
                      ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={g.label}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              Create Goal
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutDashboard,
  Receipt,
  BarChart3,
  Target,
  Settings,
  Plus,
  EyeOff,
  Eye,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveModal,
    transactions,
    preferences,
    updatePreferences,
    setSelectedTransaction,
    formatCurrency,
  } = useLedger();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const filteredTransactions = query.trim()
    ? transactions.filter(
        (tx) =>
          tx.description.toLowerCase().includes(query.toLowerCase()) ||
          tx.category.toLowerCase().includes(query.toLowerCase()) ||
          tx.account.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleNavigate = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
  };

  const handleAction = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCommandPaletteOpen(false)}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-md"
        />

        {/* Command Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl glass-panel bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800">
            <Search className="w-5 h-5 text-indigo-500 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search transactions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 space-y-4">
            {/* Direct Transaction Search Results */}
            {query.trim() !== '' && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Matching Transactions ({filteredTransactions.length})
                </div>
                {filteredTransactions.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-400">
                    No transactions match &quot;{query}&quot;
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredTransactions.slice(0, 5).map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => {
                          setSelectedTransaction(tx);
                          navigate('/ledger');
                          setCommandPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-500/10 text-left transition-colors text-xs group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Receipt className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {tx.description}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {tx.category} • {tx.date}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            tx.type === 'income'
                              ? 'text-emerald-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : ''}
                          {formatCurrency(tx.amount)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Navigation Pages */}
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Navigation
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNavigate('/')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                    <span>Go to Dashboard</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">⌘1</kbd>
                </button>

                <button
                  onClick={() => handleNavigate('/ledger')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-emerald-500" />
                    <span>Open Full Ledger</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">⌘2</kbd>
                </button>

                <button
                  onClick={() => handleNavigate('/analytics')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    <span>View Analytics & Trends</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">⌘3</kbd>
                </button>

                <button
                  onClick={() => handleNavigate('/goals')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span>Check Savings Goals</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">⌘4</kbd>
                </button>

                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Application Settings</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">⌘5</kbd>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Actions
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleAction(() => setActiveModal('new-transaction'))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4 text-indigo-500" />
                    <span>Add New Transaction</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleAction(() => setActiveModal('new-goal'))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <span>Create New Savings Goal</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() =>
                    handleAction(() =>
                      updatePreferences({
                        hideBalances: !preferences.hideBalances,
                      })
                    )
                  }
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {preferences.hideBalances ? (
                      <Eye className="w-4 h-4 text-amber-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-500" />
                    )}
                    <span>
                      {preferences.hideBalances ? 'Show Balances' : 'Hide Balances'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleAction(() =>
                      updatePreferences({
                        theme: preferences.theme === 'dark' ? 'light' : 'dark',
                      })
                    )
                  }
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {preferences.theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-700" />
                    )}
                    <span>
                      Switch to {preferences.theme === 'dark' ? 'Light' : 'Dark'} Mode
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Tip: Use <kbd className="font-mono font-bold text-slate-600 dark:text-slate-300">⌘K</kbd> anywhere to bring up this bar.
            </span>
            <span className="font-medium text-indigo-500">My Ledger v1.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

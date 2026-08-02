import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { useLedger } from '../../context/LedgerContext';
import { AccentColor, ThemeMode } from '../../types';
import {
  Settings,
  User,
  IndianRupee,
  Palette,
  Eye,
  EyeOff,
  Database,
  Download,
  Upload,
  Sun,
  Moon,
  Bell,
  AlertTriangle,
  FileJson,
  Save,
  CheckCircle2,
  Trash2,
  Sliders,
  CreditCard,
  Shield,
  Lock,
  LogOut,
  KeyRound,
  UserCheck,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    formatCurrency,
    currentLoginId,
    changeLoginId,
    changePassword,
    logout,
    lockApp,
    resetAllDataAndAuth,
  } = useLedger();

  // Profile local form state
  const [userName, setUserName] = useState(preferences.userName || 'Nadeem');
  const [userEmail, setUserEmail] = useState(preferences.userEmail || 'nadeem@myledger.app');

  // Change Login ID states
  const [newLoginIdInput, setNewLoginIdInput] = useState(currentLoginId);
  const [loginIdCurrentPass, setLoginIdCurrentPass] = useState('');
  const [changeIdError, setChangeIdError] = useState<string | null>(null);
  const [changeIdSuccess, setChangeIdSuccess] = useState<string | null>(null);

  // Change Password states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changePassSuccess, setChangePassSuccess] = useState<string | null>(null);

  // Budget states saved directly to localStorage and preferences
  const [dailyBudget, setDailyBudget] = useState<number>(() => {
    if (preferences.dailyBudget !== undefined) return preferences.dailyBudget;
    const saved = localStorage.getItem('myledger_daily_budget');
    return saved ? parseFloat(saved) : 500;
  });

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    if (preferences.monthlyBudget !== undefined) return preferences.monthlyBudget;
    const saved = localStorage.getItem('myledger_monthly_budget');
    return saved ? parseFloat(saved) : 15000;
  });

  // UI Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize local states when preferences or loginId update
  useEffect(() => {
    setUserName(preferences.userName || 'Nadeem');
    setUserEmail(preferences.userEmail || 'nadeem@myledger.app');
    if (currentLoginId) {
      setNewLoginIdInput(currentLoginId);
    }
  }, [preferences.userName, preferences.userEmail, currentLoginId]);

  // Handler for Change Login ID
  const handleChangeLoginIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeIdError(null);
    setChangeIdSuccess(null);

    if (!newLoginIdInput.trim()) {
      setChangeIdError('New Login ID cannot be empty.');
      return;
    }
    if (!loginIdCurrentPass) {
      setChangeIdError('Please enter your current password to authorize this change.');
      return;
    }

    const res = await changeLoginId(newLoginIdInput.trim(), loginIdCurrentPass);
    if (res.success) {
      setChangeIdSuccess('Login ID updated successfully!');
      setLoginIdCurrentPass('');
      showToast('Login ID changed successfully');
    } else {
      setChangeIdError(res.error || 'Failed to change Login ID');
    }
  };

  // Handler for Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError(null);
    setChangePassSuccess(null);

    if (!currentPasswordInput) {
      setChangePassError('Please enter your current password.');
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 4) {
      setChangePassError('New password must be at least 4 characters.');
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      setChangePassError('New passwords do not match. Please re-type.');
      return;
    }

    const res = await changePassword(currentPasswordInput, newPasswordInput);
    if (res.success) {
      setChangePassSuccess('Password updated successfully!');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmNewPasswordInput('');
      showToast('Password changed successfully');
    } else {
      setChangePassError(res.error || 'Failed to change password');
    }
  };

  // Persist Daily and Monthly budget changes to Local Storage & preferences
  const handleSaveBudgets = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('myledger_daily_budget', String(dailyBudget));
    localStorage.setItem('myledger_monthly_budget', String(monthlyBudget));
    updatePreferences({
      dailyBudget,
      monthlyBudget,
    });
    showToast('Budget preferences saved to Local Storage');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({ userName, userEmail });
    showToast('Profile settings saved successfully');
  };

  // Currency list with INR prioritized
  const currencyOptions = [
    { code: 'INR', label: 'INR (₹)', country: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', label: 'USD ($)', country: 'United States Dollar', symbol: '$' },
    { code: 'EUR', label: 'EUR (€)', country: 'Eurozone', symbol: '€' },
    { code: 'GBP', label: 'GBP (£)', country: 'British Pound', symbol: '£' },
    { code: 'JPY', label: 'JPY (¥)', country: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', label: 'CAD (CA$)', country: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', label: 'AUD (A$)', country: 'Australian Dollar', symbol: 'A$' },
  ];

  const accentOptions: { id: AccentColor; label: string; bgClass: string }[] = [
    { id: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-600' },
    { id: 'blue', label: 'Blue', bgClass: 'bg-blue-600' },
    { id: 'purple', label: 'Purple', bgClass: 'bg-purple-600' },
    { id: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-600' },
    { id: 'amber', label: 'Amber', bgClass: 'bg-amber-600' },
    { id: 'rose', label: 'Rose', bgClass: 'bg-rose-600' },
  ];

  // Modals state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearConfirmInput, setClearConfirmInput] = useState('');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedDataPreview, setImportedDataPreview] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. EXPORT JSON HANDLER
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'My Ledger Personal Finance Journal',
      transactions: JSON.parse(localStorage.getItem('myledger_transactions') || '[]'),
      goals: JSON.parse(localStorage.getItem('myledger_goals') || '[]'),
      accounts: JSON.parse(localStorage.getItem('myledger_accounts') || '[]'),
      preferences: {
        ...preferences,
        dailyBudget,
        monthlyBudget,
      },
      dailyBudget,
      monthlyBudget,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `myledger_backup_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);

    showToast('Vault JSON backup file generated and downloaded!');
  };

  // 2. IMPORT JSON HANDLERS
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          alert('Invalid JSON file format.');
          return;
        }
        setImportedDataPreview(parsed);
        setIsImportModalOpen(true);
      } catch (err) {
        alert('Failed to parse JSON file. Please ensure it is a valid My Ledger JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImportJSON = () => {
    if (!importedDataPreview) return;

    try {
      if (importedDataPreview.transactions) {
        localStorage.setItem(
          'myledger_transactions',
          JSON.stringify(importedDataPreview.transactions)
        );
      }
      if (importedDataPreview.goals) {
        localStorage.setItem('myledger_goals', JSON.stringify(importedDataPreview.goals));
      }
      if (importedDataPreview.accounts) {
        localStorage.setItem('myledger_accounts', JSON.stringify(importedDataPreview.accounts));
      }
      if (importedDataPreview.preferences) {
        localStorage.setItem(
          'myledger_preferences',
          JSON.stringify(importedDataPreview.preferences)
        );
      }
      if (importedDataPreview.dailyBudget !== undefined) {
        localStorage.setItem(
          'myledger_daily_budget',
          String(importedDataPreview.dailyBudget)
        );
      }
      if (importedDataPreview.monthlyBudget !== undefined) {
        localStorage.setItem(
          'myledger_monthly_budget',
          String(importedDataPreview.monthlyBudget)
        );
      }

      setIsImportModalOpen(false);
      setImportedDataPreview(null);
      showToast('Vault data imported successfully! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert('An error occurred while restoring data.');
    }
  };

  // 3. CLEAR ALL DATA HANDLERS
  const confirmClearAllData = () => {
    if (clearConfirmInput.trim().toUpperCase() !== 'CLEAR') return;

    resetAllDataAndAuth();
    setIsClearModalOpen(false);
    showToast('All local vault data and credentials cleared.');
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xl border border-slate-700/50 flex items-center gap-3 font-semibold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <GlassCard hoverEffect={false} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Settings className="w-5 h-5" />
            </div>
            Preferences & Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize theme, set daily & monthly spending targets, currency options, and manage backups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" size="md">
            Local Storage Active
          </Badge>
        </div>
      </GlassCard>

      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* 1. SECTION: Theme & Visual Customization */}
      <GlassCard hoverEffect={false} className="space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Visual Appearance & Theme Settings
            </h2>
            <p className="text-[11px] text-slate-500">
              Switch between Dark, Light, or System mode, and pick your primary accent color.
            </p>
          </div>
        </div>

        {/* Theme Selectors */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              {[
                { id: 'dark', label: 'Dark Mode', icon: Moon, color: 'text-purple-400' },
                { id: 'light', label: 'Light Mode', icon: Sun, color: 'text-amber-500' },
                { id: 'system', label: 'System Mode', icon: Sliders, color: 'text-indigo-400' },
              ].map((item) => {
                const IconComp = item.icon;
                const isSelected = preferences.theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updatePreferences({ theme: item.id as ThemeMode })}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComp className={`w-5 h-5 ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Accent Colors */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Accent Color
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {accentOptions.map((acc) => {
                const isSelected = preferences.accentColor === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => updatePreferences({ accentColor: acc.id })}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${acc.bgClass}`} />
                    <span>{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra Preferences Toggles */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Privacy Balance Masking
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mask sensitive monetary values with ••••••
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updatePreferences({ hideBalances: !preferences.hideBalances })
                }
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  preferences.hideBalances
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {preferences.hideBalances ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  System Notifications
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enable alerts when budget limits are reached
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updatePreferences({ notifications: !preferences.notifications })
                }
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  preferences.notifications
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2. SECTION: Currency & Regional Formatting */}
      <GlassCard hoverEffect={false} className="space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Currency & Regional Rules
            </h2>
            <p className="text-[11px] text-slate-500">
              Select your preferred currency symbol and date format.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Base Currency Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Base Currency Symbol
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => {
                updatePreferences({ currency: e.target.value as any });
                showToast(`Currency updated to ${e.target.value}`);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} - {c.country}
                </option>
              ))}
            </select>
          </div>

          {/* Date Format Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => {
                updatePreferences({ dateFormat: e.target.value as any });
                showToast(`Date format updated to ${e.target.value}`);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (Indian / International)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* 3. SECTION: Daily & Monthly Budget Configuration */}
      <GlassCard hoverEffect={false} className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Daily & Monthly Budget Limits
              </h2>
              <p className="text-[11px] text-slate-500">
                Set target spending limits. Saved automatically to Local Storage.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSaveBudgets()}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Budgets
          </button>
        </div>

        <form onSubmit={handleSaveBudgets} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Daily Budget Input */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 dark:text-slate-100">
                Daily Budget Limit
              </label>
              <span className="text-[11px] font-mono font-bold text-amber-500">
                {formatCurrency(dailyBudget)} / day
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
              {[100, 200, 500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDailyBudget(preset)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                    dailyBudget === preset
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Budget Input */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 dark:text-slate-100">
                Monthly Budget Limit
              </label>
              <span className="text-[11px] font-mono font-bold text-indigo-500">
                {formatCurrency(monthlyBudget)} / mo
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="500"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
              {[5000, 10000, 15000, 25000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMonthlyBudget(preset)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                    monthlyBudget === preset
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>
        </form>
      </GlassCard>

      {/* 4. SECTION: Vault Profile Information */}
      <GlassCard hoverEffect={false} className="space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Journal Profile
            </h2>
            <p className="text-[11px] text-slate-500">
              Personalize your display details for journal headers and reports.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Stored Locally)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </form>
      </GlassCard>

      {/* 5. SECTION: Security & Vault Authentication (Login ID, Password, Lock, Logout) */}
      <GlassCard hoverEffect={false} className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Security & Vault Credentials
              </h2>
              <p className="text-[11px] text-slate-500">
                Manage your local login ID, master vault password, lock session, or logout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={lockApp}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-500" /> Lock App
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Change Login ID Form */}
          <form
            onSubmit={handleChangeLoginIdSubmit}
            className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" /> Change Login ID
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Current ID: <strong className="text-indigo-400">{currentLoginId || 'Not set'}</strong>
              </span>
            </div>

            {changeIdError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px]">
                {changeIdError}
              </div>
            )}

            {changeIdSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                {changeIdSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                New Login ID
              </label>
              <input
                type="text"
                required
                value={newLoginIdInput}
                onChange={(e) => setNewLoginIdInput(e.target.value)}
                placeholder="Enter new Login ID"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Confirm Current Password
              </label>
              <input
                type="password"
                required
                value={loginIdCurrentPass}
                onChange={(e) => setLoginIdCurrentPass(e.target.value)}
                placeholder="Enter current password to confirm"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save New Login ID
            </button>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handleChangePasswordSubmit}
            className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-4"
          >
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-500" /> Change Password
            </h3>

            {changePassError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px]">
                {changePassError}
              </div>
            )}

            {changePassSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                {changePassSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Enter new password (min 4 chars)"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPasswordInput}
                onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Update Password
            </button>
          </form>
        </div>
      </GlassCard>

      {/* 6. SECTION: Data Management & Import/Export JSON */}
      <GlassCard hoverEffect={false} className="space-y-5 border-slate-300/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5 border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Data Backup & Import / Export JSON
            </h2>
            <p className="text-[11px] text-slate-500">
              Export your personal finance journal data to JSON or restore from a JSON backup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Export JSON Card */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                <FileJson className="w-4 h-4" />
                <span>Export Journal Data (JSON)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Generates a clean JSON backup containing all your expense entries, savings goals, and budget settings.
              </p>
            </div>

            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" /> Export JSON Backup
            </button>
          </div>

          {/* Import JSON Card */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1">
                <Upload className="w-4 h-4" />
                <span>Import Journal Data (JSON)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Restore your finance journal records from a previously exported `.json` file.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" /> Import JSON File
            </button>
          </div>
        </div>
      </GlassCard>

      {/* 6. SECTION: Danger Zone (Clear All Data) */}
      <GlassCard hoverEffect={false} className="space-y-4 border-rose-500/30 bg-rose-500/5">
        <div className="flex items-center gap-2.5 border-b border-rose-500/20 pb-3">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Danger Zone - Clear All Data
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Permanently clear all expense entries, goals, custom budgets, and preferences from Local Storage.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Clearing all data resets My Ledger to a clean state with ₹0 expenses.
          </p>

          <button
            onClick={() => {
              setClearConfirmInput('');
              setIsClearModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 whitespace-nowrap cursor-pointer transition-all"
          >
            <Trash2 className="w-4 h-4" /> Clear All Data
          </button>
        </div>
      </GlassCard>

      {/* CONFIRMATION DIALOG 1: Import JSON Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Confirm Data Import"
        subtitle="Review records contained in the selected JSON backup."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300">
            <p className="font-bold flex items-center gap-2">
              <FileJson className="w-4 h-4" /> Ready to import backup file
            </p>
            <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-400">
              Importing will replace your current transactions, goals, and budget preferences in Local Storage.
            </p>
          </div>

          {importedDataPreview && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Transactions Count:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {importedDataPreview.transactions?.length || 0} items
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Savings Goals Count:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {importedDataPreview.goals?.length || 0} items
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Currency:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {importedDataPreview.preferences?.currency || 'INR'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Budget:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  ₹{importedDataPreview.dailyBudget || importedDataPreview.preferences?.dailyBudget || 500}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Budget:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  ₹{importedDataPreview.monthlyBudget || importedDataPreview.preferences?.monthlyBudget || 15000}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmImportJSON}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Confirm Import & Restore
            </button>
          </div>
        </div>
      </Modal>

      {/* CONFIRMATION DIALOG 2: Clear All Data Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Wipe Local Storage Data?"
        subtitle="This action cannot be undone."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-1">
            <p className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Warning: Critical Data Reset
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              This will erase all custom transactions, goals, and saved budgets stored in Local Storage.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Type <span className="font-mono text-rose-500">CLEAR</span> to confirm wiping data:
            </label>
            <input
              type="text"
              placeholder="CLEAR"
              value={clearConfirmInput}
              onChange={(e) => setClearConfirmInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsClearModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={clearConfirmInput.trim().toUpperCase() !== 'CLEAR'}
              onClick={confirmClearAllData}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-md shadow-rose-600/20 cursor-pointer transition-all"
            >
              Confirm Clear All Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

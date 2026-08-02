import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';

export const AuthScreen: React.FC = () => {
  const { isSetupComplete, login, setupAuth } = useLedger();

  // Form states
  const [loginIdInput, setLoginIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  // Trigger smooth card shake animation
  const triggerShake = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdInput.trim() || !passwordInput) {
      setErrorMessage('Please fill in both Login ID and Password.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(loginIdInput.trim(), passwordInput);
      if (!success) {
        setErrorMessage('Invalid Login ID or Password.');
        triggerShake();
      }
    } catch {
      setErrorMessage('Invalid Login ID or Password.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle First Time Setup submission
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdInput.trim()) {
      setErrorMessage('Please enter a Login ID.');
      triggerShake();
      return;
    }

    if (!passwordInput || passwordInput.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      triggerShake();
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setErrorMessage('Passwords do not match. Please verify and try again.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      const success = await setupAuth(loginIdInput.trim(), passwordInput);
      if (!success) {
        setErrorMessage('Could not create vault credentials. Please try again.');
        triggerShake();
      }
    } catch {
      setErrorMessage('An error occurred during setup.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Apple-inspired Ambient Glow Background Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={
          shouldShake
            ? { x: [0, -14, 14, -12, 12, -6, 6, 0], opacity: 1, y: 0, scale: 1 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={
          shouldShake
            ? { duration: 0.45, ease: 'easeInOut' }
            : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
        className="w-full max-w-md z-10 p-7 sm:p-9 rounded-3xl bg-slate-900/75 backdrop-blur-2xl border border-slate-700/60 shadow-2xl shadow-slate-950/80 space-y-7 relative"
      >
        {/* Subtle Top Gloss Accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-t-3xl" />

        {/* Brand Header & Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-indigo-400 p-0.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center"
          >
            <div className="w-full h-full rounded-[14px] bg-slate-950/80 backdrop-blur-md flex items-center justify-center text-white">
              <BookOpen className="w-8 h-8 text-indigo-400 stroke-[2.2]" />
            </div>
          </motion.div>

          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
                My Ledger
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono text-[10px] font-bold">
                Vault
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {isSetupComplete
                ? 'Enter your vault credentials to unlock your personal money journal.'
                : 'Create your private credentials for first-time vault setup.'}
            </p>
          </div>
        </div>

        {/* Error Alert Message Box */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Login vs Setup Form */}
        {isSetupComplete ? (
          /* LOGIN FORM (Every subsequent launch) */
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* Login ID Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">Login ID</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter your Login ID"
                  value={loginIdInput}
                  onChange={(e) => setLoginIdInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Login Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Vault...</span>
              ) : (
                <>
                  <span>Unlock Journal Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        ) : (
          /* FIRST TIME SETUP FORM */
          <form onSubmit={handleSetupSubmit} className="space-y-4 text-xs">
            {/* Setup Badge Banner */}
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Welcome! Set up your private offline login credentials once.</span>
            </div>

            {/* Login ID Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">Create Login ID *</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. nadeem or admin"
                  value={loginIdInput}
                  onChange={(e) => setLoginIdInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">Create Password *</label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 4 characters"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">Confirm Password *</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Setup Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>Encrypting Vault...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Credentials & Launch App</span>
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* Security & Offline Indicator */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Offline Vault</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">SHA-256 Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
};

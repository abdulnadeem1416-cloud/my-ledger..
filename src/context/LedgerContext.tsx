import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { INITIAL_ACCOUNTS, INITIAL_BUDGETS, INITIAL_GOALS, INITIAL_TRANSACTIONS } from '../data/mockData';
import { Account, CategoryBudget, SavingsGoal, Transaction, UserPreferences } from '../types';
import { clearStoredAuth, getStoredAuth, hashPassword, saveStoredAuth } from '../utils/auth';

interface LedgerContextType {
  transactions: Transaction[];
  accounts: Account[];
  goals: SavingsGoal[];
  budgets: CategoryBudget[];
  preferences: UserPreferences;
  commandPaletteOpen: boolean;
  activeModal: string | null;
  selectedTransaction: Transaction | null;
  quickSearchQuery: string;

  // Auth State & Actions
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  currentLoginId: string;
  login: (loginId: string, pass: string) => Promise<boolean>;
  setupAuth: (loginId: string, pass: string) => Promise<boolean>;
  changeLoginId: (newLoginId: string, currentPass: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  lockApp: () => void;
  resetAllDataAndAuth: () => void;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updatedFields: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoalAmount: (id: string, newAmount: number) => void;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  setSelectedTransaction: (tx: Transaction | null) => void;
  setQuickSearchQuery: (query: string) => void;
  
  // Helpers
  formatCurrency: (amount: number) => string;
  getNetWorth: () => number;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: 'INR',
  theme: 'dark',
  accentColor: 'indigo',
  userName: 'User',
  userEmail: 'user@myledger.app',
  hideBalances: false,
  dateFormat: 'DD/MM/YYYY',
  notifications: true,
  dailyBudget: 0,
  monthlyBudget: 0,
};

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('myledger_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('myledger_accounts');
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('myledger_goals');
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [budgets] = useState<CategoryBudget[]>(INITIAL_BUDGETS);

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('myledger_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');

  // Authentication States
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(() => {
    const auth = getStoredAuth();
    return auth.isSetup;
  });

  const [currentLoginId, setCurrentLoginId] = useState<string>(() => {
    const auth = getStoredAuth();
    return auth.loginId || '';
  });

  // Requirement: App must always open with Login Screen (isAuthenticated initially false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // AUTH ACTIONS
  const login = useCallback(async (loginId: string, pass: string): Promise<boolean> => {
    const auth = getStoredAuth();
    if (!auth.isSetup || !auth.passwordHash || !auth.loginId) {
      return false;
    }

    const hashedInput = await hashPassword(pass);
    if (
      loginId.trim().toLowerCase() === auth.loginId.toLowerCase() &&
      hashedInput === auth.passwordHash
    ) {
      setIsAuthenticated(true);
      setCurrentLoginId(auth.loginId);
      return true;
    }
    return false;
  }, []);

  const setupAuth = useCallback(async (loginId: string, pass: string): Promise<boolean> => {
    const hashed = await hashPassword(pass);
    const cleanId = loginId.trim();
    saveStoredAuth(cleanId, hashed);

    setIsSetupComplete(true);
    setCurrentLoginId(cleanId);
    setIsAuthenticated(true);

    // Update username preference to match if default
    setPreferences((prev) => ({
      ...prev,
      userName: cleanId,
    }));

    return true;
  }, []);

  const changeLoginId = useCallback(
    async (newLoginId: string, currentPass: string): Promise<{ success: boolean; error?: string }> => {
      const auth = getStoredAuth();
      if (!auth.passwordHash) {
        return { success: false, error: 'Vault credentials not found.' };
      }

      const inputHash = await hashPassword(currentPass);
      if (inputHash !== auth.passwordHash) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      const cleanNewId = newLoginId.trim();
      saveStoredAuth(cleanNewId, auth.passwordHash);
      setCurrentLoginId(cleanNewId);
      setPreferences((prev) => ({ ...prev, userName: cleanNewId }));

      return { success: true };
    },
    []
  );

  const changePassword = useCallback(
    async (currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
      const auth = getStoredAuth();
      if (!auth.passwordHash || !auth.loginId) {
        return { success: false, error: 'Vault credentials not found.' };
      }

      const inputHash = await hashPassword(currentPass);
      if (inputHash !== auth.passwordHash) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      const newHash = await hashPassword(newPass);
      saveStoredAuth(auth.loginId, newHash);

      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const lockApp = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const resetAllDataAndAuth = useCallback(() => {
    localStorage.clear();
    clearStoredAuth();
    setTransactions(INITIAL_TRANSACTIONS);
    setAccounts(INITIAL_ACCOUNTS);
    setGoals(INITIAL_GOALS);
    setPreferences(DEFAULT_PREFERENCES);
    setIsSetupComplete(false);
    setIsAuthenticated(false);
    setCurrentLoginId('');
  }, []);

  // Persist changes
  useEffect(() => {
    localStorage.setItem('myledger_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('myledger_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('myledger_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('myledger_preferences', JSON.stringify(preferences));
    // Apply theme class to root element
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System mode default
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [preferences]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addTransaction = useCallback((newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.name.toLowerCase().includes(newTx.account.toLowerCase())) {
          let delta = 0;
          if (newTx.type === 'income') delta = newTx.amount;
          if (newTx.type === 'expense') delta = -newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );
  }, []);

  const updateTransaction = useCallback((id: string, updatedFields: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedFields } : tx))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const addGoal = useCallback((newGoalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  }, []);

  const updateGoalAmount = useCallback((id: string, newAmount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const isCompleted = newAmount >= g.targetAmount;
          return { ...g, currentAmount: newAmount, isCompleted };
        }
        return g;
      })
    );
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  }, []);

  const formatCurrency = useCallback(
    (amount: number): string => {
      if (preferences.hideBalances) {
        return '••••••';
      }
      const currencySymbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CAD: 'CA$',
        INR: '₹',
        AUD: 'A$',
      };
      const symbol = currencySymbols[preferences.currency] || '$';

      const formattedNum = Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return `${amount < 0 ? '-' : ''}${symbol}${formattedNum}`;
    },
    [preferences.currency, preferences.hideBalances]
  );

  const getNetWorth = useCallback(() => {
    return accounts.reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  const getTotalIncome = useCallback(() => {
    return transactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback(() => {
    return transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const value = useMemo(
    () => ({
      transactions,
      accounts,
      goals,
      budgets,
      preferences,
      commandPaletteOpen,
      activeModal,
      selectedTransaction,
      quickSearchQuery,
      isAuthenticated,
      isSetupComplete,
      currentLoginId,
      login,
      setupAuth,
      changeLoginId,
      changePassword,
      logout,
      lockApp,
      resetAllDataAndAuth,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoalAmount,
      updatePreferences,
      setCommandPaletteOpen,
      setActiveModal,
      setSelectedTransaction,
      setQuickSearchQuery,
      formatCurrency,
      getNetWorth,
      getTotalIncome,
      getTotalExpenses,
    }),
    [
      transactions,
      accounts,
      goals,
      budgets,
      preferences,
      commandPaletteOpen,
      activeModal,
      selectedTransaction,
      quickSearchQuery,
      isAuthenticated,
      isSetupComplete,
      currentLoginId,
      login,
      setupAuth,
      changeLoginId,
      changePassword,
      logout,
      lockApp,
      resetAllDataAndAuth,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoalAmount,
      updatePreferences,
      formatCurrency,
      getNetWorth,
      getTotalIncome,
      getTotalExpenses,
    ]
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};

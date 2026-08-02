import { Account, CategoryBudget, SavingsGoal, Transaction } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    type: 'checking',
    balance: 0,
    accountNumber: '•••• 0001',
    institution: 'Primary Bank',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'acc-2',
    name: 'Savings Account',
    type: 'savings',
    balance: 0,
    accountNumber: '•••• 0002',
    institution: 'Primary Bank',
    color: 'from-emerald-500 to-teal-600',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_GOALS: SavingsGoal[] = [];

export const INITIAL_BUDGETS: CategoryBudget[] = [];

export const MONTHLY_ANALYTICS_DATA: { month: string; income: number; expense: number; savings: number }[] = [];

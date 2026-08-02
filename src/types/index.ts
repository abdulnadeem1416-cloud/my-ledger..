export type TransactionType = 'expense' | 'income' | 'transfer';

export type CategoryType = 
  | 'Housing' 
  | 'Food & Dining' 
  | 'Transportation' 
  | 'Entertainment' 
  | 'Shopping' 
  | 'Utilities' 
  | 'Healthcare' 
  | 'Salary' 
  | 'Investments' 
  | 'Freelance' 
  | 'Savings' 
  | 'Other'
  | 'Food'
  | 'Travel'
  | 'Education'
  | 'Business'
  | 'Medical'
  | 'Others';

export interface ExpenseItem {
  id: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  isNecessary: boolean;
  date: string;
  time: string;
}

export interface Transaction {
  id: string;
  date: string;
  time?: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
  account: string;
  paymentMethod?: string;
  isNecessary?: boolean;
  status: 'completed' | 'pending' | 'recurring';
  merchantLogo?: string;
  notes?: string;
  tags?: string[];
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'crypto';
  balance: number;
  accountNumber: string;
  institution: string;
  color: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
  color: string;
  iconName: string;
  isCompleted?: boolean;
}

export interface CategoryBudget {
  category: CategoryType;
  allocated: number;
  spent: number;
  color: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo';

export interface UserPreferences {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'INR' | 'AUD';
  theme: ThemeMode;
  accentColor: AccentColor;
  userName: string;
  userEmail: string;
  hideBalances: boolean;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  notifications: boolean;
  dailyBudget?: number;
  monthlyBudget?: number;
}

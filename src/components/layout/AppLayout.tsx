import React from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { TransactionDrawer } from '../ledger/TransactionDrawer';
import { GoalModal } from '../goals/GoalModal';
import { DashboardPage } from '../dashboard/DashboardPage';
import { LedgerPage } from '../ledger/LedgerPage';
import { AnalyticsPage } from '../analytics/AnalyticsPage';
import { GoalsPage } from '../goals/GoalsPage';
import { SettingsPage } from '../settings/SettingsPage';
import { AuthScreen } from '../auth/AuthScreen';
import { useLedger } from '../../context/LedgerContext';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useLedger();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/ledger':
        return 'Ledger';
      case '/analytics':
        return 'Analytics';
      case '/goals':
        return 'Goals';
      case '/settings':
        return 'Settings';
      default:
        return 'Vault';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* macOS Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* macOS Top Header Bar */}
        <Header activeTabTitle={getPageTitle(location.pathname)} />

        {/* Page Content View */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals & Command Palette */}
      <CommandPalette />
      <TransactionDrawer />
      <GoalModal />
    </div>
  );
};

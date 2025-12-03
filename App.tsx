
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FinancialYearProvider } from './contexts/FinancialYearContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { NetworkProvider, useNetwork } from './contexts/NetworkContext';
import LoadingOverlay from './components/LoadingOverlay';
import NetworkStatus from './components/NetworkStatus';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { NavItem, UserRole } from './types';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberManagement from './pages/admin/MemberManagement';
import LoansManagement from './pages/admin/LoansManagement';
import SavingsManagement from './pages/admin/SavingsManagement';
import SharesManagement from './pages/admin/SharesManagement';
import AdminSettings from './pages/admin/AdminSettings';

import MemberDashboard from './pages/member/MemberDashboard';
import MySavings from './pages/member/MySavings';
import MyLoans from './pages/member/MyLoans';
import MyShares from './pages/member/MyShares';
import Statement from './pages/member/Statement';
import Settings from './pages/member/Settings';

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin' },
  { label: 'Members', icon: 'group', path: '/admin/members' },
  { label: 'Loans', icon: 'trending_up', path: '/admin/loans' },
  { label: 'Savings', icon: 'savings', path: '/admin/savings' },
  { label: 'Shares', icon: 'pie_chart', path: '/admin/shares', filled: true },
  { label: 'Settings', icon: 'settings', path: '/admin/settings' },
];

const memberNavItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/member' },
  { label: 'My Savings', icon: 'savings', path: '/member/savings' },
  { label: 'My Shares', icon: 'pie_chart', path: '/member/shares', filled: true },
  { label: 'My Loans', icon: 'credit_card', path: '/member/loans' },
  { label: 'Statements', icon: 'receipt_long', path: '/member/statement' },
  { label: 'Settings', icon: 'settings', path: '/member/settings' },
];

const AppContent = () => {
  const { isLoading, loadingMessage } = useLoading();
  const { isOnline, isSlowConnection } = useNetwork();
  const [networkAlertTrigger, setNetworkAlertTrigger] = React.useState(0);

  // Expose function to trigger network alert globally
  React.useEffect(() => {
    (window as any).triggerNetworkAlert = () => {
      setNetworkAlertTrigger(Date.now());
    };
  }, []);

  return (
    <>
      <NetworkStatus
        isOnline={isOnline}
        isSlowConnection={isSlowConnection}
        trigger={networkAlertTrigger}
      />
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route path="/admin" element={<Layout navItems={adminNavItems} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<MemberManagement />} />
            <Route path="loans" element={<LoansManagement />} />
            <Route path="savings" element={<SavingsManagement />} />
            <Route path="shares" element={<SharesManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Member Routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.MEMBER]} />}>
          <Route path="/member" element={<Layout navItems={memberNavItems} />}>
            <Route index element={<MemberDashboard />} />
            <Route path="savings" element={<MySavings />} />
            <Route path="shares" element={<MyShares />} />
            <Route path="loans" element={<MyLoans />} />
            <Route path="statement" element={<Statement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FinancialYearProvider>
          <ToastProvider>
            <LoadingProvider>
              <NetworkProvider>
                <AppContent />
              </NetworkProvider>
            </LoadingProvider>
          </ToastProvider>
        </FinancialYearProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;


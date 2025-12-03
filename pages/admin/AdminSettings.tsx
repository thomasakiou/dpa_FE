

import React from 'react';
import { useFinancialYear } from '../../contexts/FinancialYearContext';

const AdminSettings: React.FC = () => {
  const [resetEmail, setResetEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { currentYear, setCurrentYear } = useFinancialYear();

  const [financialYearForm, setFinancialYearForm] = React.useState({
    startDate: currentYear?.startDate || '',
    endDate: currentYear?.endDate || ''
  });

  React.useEffect(() => {
    if (currentYear) {
      setFinancialYearForm({
        startDate: currentYear.startDate,
        endDate: currentYear.endDate
      });
    }
  }, [currentYear]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      alert('Please enter an email address');
      return;
    }

    if (!confirm(`Are you sure you want to reset the password for ${resetEmail} to the default "12345678"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      // Import adminService dynamically to avoid circular dependencies if any
      const { adminService } = await import('../../services/admin');
      await adminService.resetPassword(resetEmail);
      alert(`Password for ${resetEmail} has been reset successfully to "12345678".\n\nPlease inform the user.`);
      setResetEmail('');
    } catch (err: any) {
      console.error('Error resetting password:', err);
      alert(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (section: string) => {
    alert(`${section} settings saved successfully! (Mock)`);
  };

  const handleUpdateFinancialYear = () => {
    if (!financialYearForm.startDate || !financialYearForm.endDate) {
      alert('Please fill in both start and end dates');
      return;
    }

    const startYear = new Date(financialYearForm.startDate).getFullYear();
    const endYear = new Date(financialYearForm.endDate).getFullYear();

    if (new Date(financialYearForm.endDate) <= new Date(financialYearForm.startDate)) {
      alert('End date must be after start date');
      return;
    }

    const label = startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`;

    setCurrentYear({
      label,
      startDate: financialYearForm.startDate,
      endDate: financialYearForm.endDate
    });

    alert(`Financial year updated to ${label}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Admin Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">Manage core association parameters and member settings.</p>
      </header>

      <div className="space-y-8">
        {/* Association Details */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold px-6 py-5 border-b border-gray-200 dark:border-gray-700">Association Details</h2>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Association Name</label>
              <input type="text" className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10" defaultValue="Dynamic People's Association" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Number</label>
              <input type="text" className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10" defaultValue="DPA-12345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information</label>
              <input type="text" className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10" defaultValue="dynamicpeople2019@gmail.com" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea className="form-textarea w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-24" defaultValue="Minna, Niger State, Nigeria"></textarea>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex justify-end border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => handleSaveSettings('Association')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90">Save Changes</button>
          </div>
        </section>

        {/* Financial Year */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold px-6 py-5 border-b border-gray-200 dark:border-gray-700">Financial Year Configuration</h2>
          <div className="p-6">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-semibold">Current Financial Year:</span> {currentYear?.label || 'Not set'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={financialYearForm.startDate}
                  onChange={(e) => setFinancialYearForm({ ...financialYearForm, startDate: e.target.value })}
                  className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={financialYearForm.endDate}
                  onChange={(e) => setFinancialYearForm({ ...financialYearForm, endDate: e.target.value })}
                  className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex justify-end border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleUpdateFinancialYear} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90">Update Year</button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rules */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold px-6 py-5 border-b border-gray-200 dark:border-gray-700">Member Contribution Rules</h2>
            <div className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Contribution ($)</label>
                <input type="number" className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10" defaultValue="50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Late Payment Penalty (%)</label>
                <input type="number" className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10" defaultValue="5" />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => handleSaveSettings('Rules')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90">Save Rules</button>
            </div>
          </section>

          {/* Interest Rates */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold px-6 py-5 border-b border-gray-200 dark:border-gray-700">Interest Rate Management</h2>
            <div className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Savings Accounts (% p.a.)</label>
                <input type="number" step="0.1" className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10" defaultValue="2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Loans (% p.a.)</label>
                <input type="number" step="0.1" className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10" defaultValue="8.0" />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => handleSaveSettings('Interest Rates')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90">Set Rates</button>
            </div>
          </section>
        </div>

        {/* Member Password Reset */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold px-6 py-5 border-b border-gray-200 dark:border-gray-700">Member Password Reset</h2>
          <form onSubmit={handleResetPassword} className="p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Email Address</label>
            <div className="flex gap-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="form-input flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3"
                placeholder="Enter member's email address"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This will reset the member's password to the default: <span className="font-mono font-bold">12345678</span>
            </p>
          </form>
          <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex justify-end border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;

import React, { useEffect, useState, useMemo } from 'react';
import { financeService } from '../../services/finance';
import { components } from '../../types/schema';
import { parseCurrency, formatCurrency } from '../../utils/currency';
import FinancialYearSelector from '../../components/FinancialYearSelector';
import { useFinancialYear } from '../../contexts/FinancialYearContext';

type SavingsPaymentResponse = components['schemas']['SavingsPaymentResponse'];

const MySavings: React.FC = () => {
  const [savings, setSavings] = useState<SavingsPaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedYear, currentYear } = useFinancialYear();

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const data = await financeService.getSavings();
        setSavings(data);
      } catch (error) {
        console.error('Failed to fetch savings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavings();
  }, []);

  // Filter savings based on selected financial year
  const filteredSavings = useMemo(() => {
    if (selectedYear === 'all') {
      return savings;
    }

    // Parse the selected year (e.g., "2024-2025")
    const [startYear] = selectedYear.split('-').map(Number);
    const fyStartDate = new Date(`${startYear}-11-01`);
    const fyEndDate = new Date(`${startYear + 1}-10-31`);

    return savings.filter(saving => {
      const paymentDate = new Date(saving.payment_date);
      return paymentDate >= fyStartDate && paymentDate <= fyEndDate;
    });
  }, [savings, selectedYear]);

  // Calculate total from filtered savings
  const totalContribution = useMemo(() => {
    return filteredSavings.reduce((acc, curr) => acc + parseCurrency(curr.amount), 0);
  }, [filteredSavings]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-gray-900 dark:text-white text-4xl font-black tracking-tight">My Savings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">View and manage your monthly savings contributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <FinancialYearSelector />
          <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
            Make a Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-base font-medium">Total Contribution</p>
            <p className="text-gray-900 dark:text-white text-4xl font-bold">₦{formatCurrency(totalContribution)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedYear === 'all' ? 'All Years' : `FY ${selectedYear}`}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-gray-900 dark:text-white text-[22px] font-bold">Contribution History</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input className="form-input h-9 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-9 text-sm focus:ring-primary w-40" placeholder="Search..." type="text" />
              </div>
              <button className="flex items-center justify-center rounded-lg h-9 bg-primary text-white px-4 text-sm font-bold gap-2 hover:bg-primary/90">
                <span className="material-symbols-outlined text-base">download</span>
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium uppercase">Month</th>
                  <th className="px-6 py-3 font-medium uppercase">Type</th>
                  <th className="px-6 py-3 font-medium uppercase">Amount</th>
                  <th className="px-6 py-3 font-medium uppercase">Date</th>
                  <th className="px-6 py-3 font-medium uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-900 dark:text-white">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                ) : filteredSavings.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center">No savings records found{selectedYear !== 'all' ? ` for FY ${selectedYear}` : ''}.</td></tr>
                ) : (
                  filteredSavings.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium">{row.payment_month || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{row.type}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">₦{formatCurrency(row.amount)}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{row.payment_date ? new Date(row.payment_date).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{row.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySavings;

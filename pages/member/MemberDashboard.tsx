import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { financeService } from '../../services/finance';
import { components } from '../../types/schema';
import { parseCurrency, formatCurrency } from '../../utils/currency';

type SavingsResponse = components['schemas']['SavingsResponse'];
type LoanResponse = components['schemas']['LoanResponse'];

const COLORS = ['#FF6F00', '#e6e6e6'];

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [sharesTotal, setSharesTotal] = useState(0);
  const [loanBalance, setLoanBalance] = useState(0);
  const [savingsData, setSavingsData] = useState<{ name: string; value: number }[]>([]);
  const [loanProgressData, setLoanProgressData] = useState<{ name: string; value: number }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [savings, shares, loans] = await Promise.all([
          financeService.getSavings(),
          financeService.getShares(),
          financeService.getLoans(),
        ]);

        // Calculate totals
        // Now savings returns SavingsPaymentResponse[] with 'amount' field
        const totalSavings = savings.reduce((acc, curr) => acc + parseCurrency(curr.amount), 0);
        const totalShares = shares.reduce((acc, curr) => acc + parseCurrency(curr.total_value), 0);
        const totalLoanBalance = loans.reduce((acc, curr) => acc + parseCurrency(curr.balance), 0);
        const totalLoanPaid = loans.reduce((acc, curr) => acc + parseCurrency(curr.amount_paid), 0);
        const totalLoanAmount = loans.reduce((acc, curr) => acc + parseCurrency(curr.total_repayable), 0);

        setSavingsTotal(totalSavings);
        setSharesTotal(totalShares);
        setLoanBalance(totalLoanBalance);

        // Prepare chart data
        // Group savings by payment month for the chart
        const savingsByMonth = savings.reduce((acc, curr) => {
          const month = curr.payment_month || 'Unknown';
          acc[month] = (acc[month] || 0) + parseCurrency(curr.amount);
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.keys(savingsByMonth).map(month => ({
          name: month.substring(0, 3),
          value: savingsByMonth[month],
        }));
        setSavingsData(chartData);

        // Loan progress
        const paidPercentage = totalLoanAmount > 0 ? (totalLoanPaid / totalLoanAmount) * 100 : 0;
        setLoanProgressData([
          { name: 'Paid', value: paidPercentage },
          { name: 'Remaining', value: 100 - paidPercentage },
        ]);

        // Recent transactions (mocking for now as there is no unified transaction endpoint)
        // We can combine savings and loans history
        const transactions = [
          ...savings.map(s => ({
            date: new Date(s.created_at).toLocaleDateString(),
            desc: `Savings - ${s.type}`,
            type: 'Deposit',
            amount: `+₦${formatCurrency(s.amount)}`,
            status: s.payment_month || 'Completed',
            amtColor: 'text-green-600',
            badge: 'bg-green-100 text-green-800'
          })),
          ...loans.map(l => ({
            date: new Date(l.created_at).toLocaleDateString(),
            desc: 'Loan Application',
            type: 'Loan',
            amount: `+₦${formatCurrency(l.loan_amount)}`,
            status: l.status,
            amtColor: 'text-blue-600',
            badge: 'bg-blue-100 text-blue-800'
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        setRecentTransactions(transactions);

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name || 'Member'}!</h2>
        <div className="hidden md:flex items-center gap-4">
          <label className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input className="form-input rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 h-10 text-sm focus:ring-primary" placeholder="Search..." type="text" />
          </label>
          <button className="flex items-center justify-center rounded-full h-10 w-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Account Balance', value: `₦${formatCurrency(savingsTotal + sharesTotal)}`, change: '+0% this month', positive: true },
          { label: 'Total Savings', value: `₦${formatCurrency(savingsTotal)}`, change: '+0% this month', positive: true },
          { label: 'Total Shares', value: `₦${formatCurrency(sharesTotal)}`, change: '+0% this month', positive: true },
          { label: 'Loan Balance', value: `₦${formatCurrency(loanBalance)}`, change: 'Active', positive: false },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Savings Growth */}
        <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Savings Growth</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 6 Months</p>
            </div>
            <button className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
              View Report <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsData.length > 0 ? savingsData : [{ name: 'No Data', value: 0 }]}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008060" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#008060" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#008060" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Progress */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Loan Repayment Progress</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Loan Balance: ₦{formatCurrency(loanBalance)}</p>
          </div>
          <div className="flex items-center justify-center h-full min-h-[160px] relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={loanProgressData.length > 0 ? loanProgressData : [{ name: 'No Data', value: 100 }]}
                  innerRadius={60}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {loanProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{loanProgressData.length > 0 ? loanProgressData[0].value.toFixed(0) : 0}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
            </div>
          </div>
          <button className="w-full rounded-lg bg-accent text-white h-10 text-sm font-bold hover:bg-accent/90 transition-colors">
            Make a Payment
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
          <button className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            View All <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Description</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold text-right">Amount</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-900 dark:text-white">
              {recentTransactions.map((t, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{t.date}</td>
                  <td className="px-6 py-4 font-medium">{t.desc}</td>
                  <td className="px-6 py-4">{t.type}</td>
                  <td className={`px-6 py-4 text-right font-medium ${t.amtColor}`}>{t.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${t.badge} dark:bg-opacity-20`}>{t.status}</span>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No recent transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;

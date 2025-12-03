import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { adminService, sharesService, savingsService, loansService } from '../../services/admin';

const COLORS = ['#1152d4', '#10B981', '#F59E0B'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        // Fetch all raw data
        const [users, savings, shares, loans] = await Promise.all([
          adminService.getAllUsers(),
          savingsService.getAllSavings(),
          sharesService.getAllShares(),
          loansService.getAllLoans()
        ]);

        // Calculate stats on frontend
        const totalMembers = users.length;
        const totalSavings = savings.reduce((sum: number, s: any) => sum + parseFloat(s.amount || 0), 0);
        const totalShares = shares.reduce((sum: number, s: any) => sum + parseFloat(s.total_value || 0), 0);
        const totalLoans = loans.reduce((sum: number, l: any) => sum + parseFloat(l.loan_amount || 0), 0);
        const outstanding = totalSavings + totalShares - totalLoans;

        // Calculate monthly savings (group by month)
        const monthlySavingsMap = new Map<string, number>();
        savings.forEach((s: any) => {
          const month = new Date(s.transaction_date).toLocaleDateString('en-US', { month: 'short' });
          monthlySavingsMap.set(month, (monthlySavingsMap.get(month) || 0) + parseFloat(s.amount || 0));
        });
        const monthly_savings = Array.from(monthlySavingsMap.entries()).map(([month, amount]) => ({ month, amount }));

        // Calculate share growth (group by month)
        const shareGrowthMap = new Map<string, number>();
        shares.forEach((s: any) => {
          const month = new Date(s.purchase_date).toLocaleDateString('en-US', { month: 'short' });
          shareGrowthMap.set(month, (shareGrowthMap.get(month) || 0) + parseFloat(s.total_value || 0));
        });
        const share_growth = Array.from(shareGrowthMap.entries()).map(([month, amount]) => ({ month, amount }));

        // Calculate loan distribution by status
        const loanStatusMap = new Map<string, number>();
        loans.forEach((l: any) => {
          const status = l.status || 'pending';
          loanStatusMap.set(status, (loanStatusMap.get(status) || 0) + 1);
        });
        const loan_distribution = Array.from(loanStatusMap.entries()).map(([status, count]) => ({ status, count }));

        setStats({
          total_members: totalMembers,
          total_savings: totalSavings,
          total_shares: totalShares,
          total_loans: totalLoans,
          outstanding_balances: outstanding,
          monthly_savings,
          share_growth,
          loan_distribution,
          pending_requests: [] // You can add logic for pending requests if needed
        });
      } catch (error) {
        console.error('Failed to fetch admin dashboard', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading dashboard</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8">No dashboard data available</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <h2 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">Admin Dashboard</h2>
        <div className="flex gap-3">
          <label className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
            <input className="form-input rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 h-10 text-sm w-64 focus:ring-primary" placeholder="Search..." type="text" />
          </label>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {[
          { label: 'Total Members', value: stats?.total_members.toLocaleString() || '0', sub: '', positive: true },
          { label: 'Total Savings', value: `₦${stats?.total_savings.toLocaleString() || '0'}`, sub: '', positive: true },
          { label: 'Total Shares', value: `₦${stats?.total_shares.toLocaleString() || '0'}`, sub: '', positive: true },
          { label: 'Total Loans', value: `₦${stats?.total_loans.toLocaleString() || '0'}`, sub: '', positive: true },
          {
            label: 'Outstanding',
            value: `₦${((stats?.total_savings || 0) + (stats?.total_shares || 0) - (stats?.total_loans || 0)).toLocaleString()}`,
            sub: '',
            positive: ((stats?.total_savings || 0) + (stats?.total_shares || 0) - (stats?.total_loans || 0)) >= 0
          },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
            <p className="text-gray-900 dark:text-white text-3xl font-bold">{stat.value}</p>
            {stat.sub && <p className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <p className="text-gray-900 dark:text-white text-lg font-bold mb-4">Monthly Savings</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.monthly_savings || []}>
                    <Bar dataKey="amount" fill="#1152d4" radius={[4, 4, 0, 0]} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <p className="text-gray-900 dark:text-white text-lg font-bold mb-4">Share Growth</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.share_growth || []}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1152d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1152d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="amount" stroke="#1152d4" fillOpacity={1} fill="url(#colorValue)" />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Pending Requests</h2>
            <div className="space-y-4">
              {stats?.pending_requests && stats.pending_requests.length > 0 ? (
                stats.pending_requests.map((req, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-4">
                      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url("${req.img || 'https://via.placeholder.com/40'}")` }}></div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{req.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{req.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs font-bold text-white bg-green-600 rounded-full hover:bg-green-700">Approve</button>
                      <button className="px-3 py-1 text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-gray-300">Decline</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No pending requests.</p>
              )}
            </div>
          </div>
        </div>

        {/* Loan Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col">
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-1">Loan Distribution</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{stats?.total_loans.toLocaleString() || '0'} Loans</p>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.loan_distribution || []}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats?.loan_distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">70%</span>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-4">
            {stats?.loan_distribution?.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-gray-600 dark:text-gray-300">{entry.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
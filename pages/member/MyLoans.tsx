import React, { useEffect, useState } from 'react';
import { financeService } from '../../services/finance';
import { components } from '../../types/schema';
import { formatCurrency } from '../../utils/currency';
type LoanResponse = components['schemas']['LoanResponse'];

const MyLoans: React.FC = () => {
   const [loans, setLoans] = useState<LoanResponse[]>([]);
   const [activeLoan, setActiveLoan] = useState<LoanResponse | null>(null);

   useEffect(() => {
      const fetchLoans = async () => {
         try {
            const data = await financeService.getLoans();
            setLoans(data);
            const active = data.find(l => l.status === 'active' || l.status === 'approved') || data[0];
            setActiveLoan(active || null);
         } catch (error) {
            console.error('Failed to fetch loans', error);
         }
      };
      fetchLoans();
   }, []);

   return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
         <div className="flex flex-col gap-2">
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold">My Loans</h1>
            <p className="text-gray-500 dark:text-gray-400">View your active loan details and transaction history.</p>
         </div>

         {/* Active Loan Card */}
         {activeLoan ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
               <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Loan</h2>
                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium gap-2 ${activeLoan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                        <span className={`size-2 rounded-full ${activeLoan.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span> {activeLoan.status}
                     </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                     {[
                        { label: 'Loan Amount', val: `₦${formatCurrency(activeLoan.loan_amount)}` },
                        { label: 'Interest Rate', val: `${activeLoan.interest_rate}%` },
                        { label: 'Duration', val: `${activeLoan.duration_months} Months` },
                        { label: 'Monthly Repayment', val: `₦${formatCurrency(activeLoan.monthly_repayment)}` },
                        { label: 'Remaining Balance', val: `₦${formatCurrency(activeLoan.balance)}` },
                        { label: 'Total Repayable', val: `₦${formatCurrency(activeLoan.total_repayable)}` },
                     ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                           <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                           <p className="text-sm font-medium text-gray-900 dark:text-white">{item.val}</p>
                        </div>
                     ))}
                  </div>

                  <div className="mt-6">
                     <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Loan Paid Off</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                           {((parseFloat(activeLoan.amount_paid) / parseFloat(activeLoan.total_repayable)) * 100).toFixed(0)}%
                        </span>
                     </div>
                     <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(parseFloat(activeLoan.amount_paid) / parseFloat(activeLoan.total_repayable)) * 100}%` }}></div>
                     </div>
                  </div>
               </div>
               <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end rounded-b-xl">
                  <button className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">Make a Payment</button>
               </div>
            </div>
         ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
               <p className="text-gray-500 dark:text-gray-400">No active loans found.</p>
               <button className="mt-4 h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">Apply for a Loan</button>
            </div>
         )}

         {/* History Table */}
         <div>
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Loan History</h2>
               <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="material-symbols-outlined text-base">download</span> Export
               </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left">
                     <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                           <th className="px-6 py-3 font-medium">Date Applied</th>
                           <th className="px-6 py-3 font-medium">Loan ID</th>
                           <th className="px-6 py-3 font-medium">Amount</th>
                           <th className="px-6 py-3 font-medium">Status</th>
                           <th className="px-6 py-3 font-medium text-right">Balance</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-900 dark:text-white">
                        {loans.length === 0 ? (
                           <tr><td colSpan={5} className="px-6 py-4 text-center">No loan history found.</td></tr>
                        ) : (
                           loans.map((row) => (
                              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                 <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(row.application_date).toLocaleDateString()}</td>
                                 <td className="px-6 py-4 text-gray-500 dark:text-gray-400">#{row.id}</td>
                                 <td className="px-6 py-4 font-medium">₦{formatCurrency(row.loan_amount)}</td>
                                 <td className="px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${row.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                       row.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                       }`}>
                                       {row.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">₦{formatCurrency(row.balance)}</td>
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

export default MyLoans;

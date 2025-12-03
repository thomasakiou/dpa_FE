import React, { useEffect, useState } from 'react';
import { financeService } from '../../services/finance';
import { components } from '../../types/schema';
import { formatCurrency } from '../../utils/currency';
type ShareResponse = components['schemas']['ShareResponse'];

const MyShares: React.FC = () => {
   const [shares, setShares] = useState<ShareResponse[]>([]);
   const [totalShares, setTotalShares] = useState(0);
   const [totalValue, setTotalValue] = useState(0);

   useEffect(() => {
      const fetchShares = async () => {
         try {
            const data = await financeService.getShares();
            setShares(data);
            const count = data.reduce((acc, curr) => acc + curr.shares_count, 0);
            const value = data.reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
            setTotalShares(count);
            setTotalValue(value);
         } catch (error) {
            console.error('Failed to fetch shares', error);
         }
      };
      fetchShares();
   }, []);

   return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto flex flex-col gap-8">
         {/* Header */}
         <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
               <span>Home</span> / <span className="text-gray-900 dark:text-white">My Shares</span>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-4">
               <h1 className="text-4xl font-bold text-primary dark:text-white">My Shares</h1>
               <button className="h-12 px-6 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-colors">
                  Buy More Shares
               </button>
            </div>
         </div>

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { label: 'Total Shares Owned', value: totalShares.toLocaleString() },
               { label: 'Total Share Value', value: `₦${formatCurrency(totalValue)}` },
               { label: 'Current Share Price', value: `₦${formatCurrency(1000)}` }, // Hardcoded or fetched if available
            ].map((stat, i) => (
               <div key={i} className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-base font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-4xl font-bold text-primary dark:text-white">{stat.value}</p>
               </div>
            ))}
         </div>

         {/* Table */}
         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 gap-4">
               <h2 className="text-xl font-bold text-primary dark:text-white">Share Payment History</h2>
               <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                  <input className="pl-10 h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm w-full sm:w-64 focus:ring-primary" placeholder="Search transactions..." />
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                     <tr>
                        <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                        <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Transaction Type</th>
                        <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Shares</th>
                        <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Price per Share</th>
                        <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Total Amount</th>
                        <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-900 dark:text-white">
                     {shares.length === 0 ? (
                        <tr><td colSpan={6} className="p-4 text-center">No share transactions found.</td></tr>
                     ) : (
                        shares.map((row) => (
                           <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="p-4">{new Date(row.purchase_date).toLocaleDateString()}</td>
                              <td className="p-4">Purchase</td>
                              <td className="p-4 font-medium text-green-600">+{row.shares_count}</td>
                              <td className="p-4">₦{formatCurrency(row.share_value)}</td>
                              <td className="p-4 font-medium">-₦{formatCurrency(row.total_value)}</td>
                              <td className="p-4">
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Completed
                                 </span>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default MyShares;

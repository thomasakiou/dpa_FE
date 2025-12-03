import React, { useEffect, useState, useMemo } from 'react';
import { financeService } from '../../services/finance';
import { components } from '../../types/schema';
import { formatCurrency, parseCurrency } from '../../utils/currency';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../contexts/AuthContext';
import { useFinancialYear } from '../../contexts/FinancialYearContext';

type SavingsPaymentResponse = components['schemas']['SavingsPaymentResponse'];
type ShareResponse = components['schemas']['ShareResponse'];
type LoanResponse = components['schemas']['LoanResponse'];

interface Transaction {
   date: Date;
   description: string;
   type: 'Savings' | 'Share' | 'Loan';
   amount: number;
   isCredit: boolean; // true for payments/deposits, false for debits/loans taken
   balance?: number; // Running balance
}

const Statement: React.FC = () => {
   const { user } = useAuth();
   const { selectedYear, setSelectedYear, availableYears } = useFinancialYear();
   const [transactions, setTransactions] = useState<Transaction[]>([]);
   const [loading, setLoading] = useState(true);
   const [filterCategory, setFilterCategory] = useState('All Transactions');

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [savings, shares, loans] = await Promise.all([
               financeService.getSavings(),
               financeService.getShares(),
               financeService.getLoans(),
            ]);

            const allTransactions: Transaction[] = [];

            // Process Savings
            savings.forEach(s => {
               allTransactions.push({
                  date: new Date(s.payment_date || s.created_at),
                  description: `Savings Contribution - ${s.payment_month || s.type}`,
                  type: 'Savings',
                  amount: parseCurrency(s.amount),
                  isCredit: true,
               });
            });

            // Process Shares
            shares.forEach(s => {
               allTransactions.push({
                  date: new Date(s.purchase_date || s.created_at),
                  description: `Share Purchase - ${s.shares_count} Units`,
                  type: 'Share',
                  amount: parseCurrency(s.total_value),
                  isCredit: true, // Assuming buying shares is an asset addition (or payment for shares)
               });
            });

            // Process Loans
            loans.forEach(l => {
               // Loan taken (Debit)
               allTransactions.push({
                  date: new Date(l.application_date || l.created_at),
                  description: `Loan Disbursement - #${l.id}`,
                  type: 'Loan',
                  amount: parseCurrency(l.loan_amount),
                  isCredit: false,
               });

               // Loan Repayments (Credit) - Assuming we had a separate endpoint or list for repayments, 
               // but currently we only have aggregate amount_paid in LoanResponse.
               // Ideally, we should fetch loan repayment history. For now, we'll skip individual repayments 
               // if we don't have them, or mock them if needed. 
               // *Self-correction*: The backend doesn't seem to expose a unified "loan repayments" endpoint for members yet,
               // only `getLoans` which has `amount_paid`. We can't easily show individual repayment transactions without that.
               // We will stick to what we have.
            });

            // Sort by date descending
            allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

            setTransactions(allTransactions);
         } catch (error) {
            console.error('Failed to fetch statement data', error);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
         // Category Filter
         let catMatch = false;
         if (filterCategory === 'All Transactions') catMatch = true;
         else if (filterCategory === 'Savings' && t.type === 'Savings') catMatch = true;
         else if (filterCategory === 'Loans' && t.type === 'Loan') catMatch = true;
         else if (filterCategory === 'Shares' && t.type === 'Share') catMatch = true;

         // Financial Year Filter
         let yearMatch = false;
         if (selectedYear === 'all') {
            yearMatch = true;
         } else {
            const [startYearStr] = selectedYear.split('-');
            const startYear = parseInt(startYearStr);
            // Financial Year: Nov 1st of startYear to Oct 31st of startYear + 1
            const fyStart = new Date(startYear, 10, 1); // Month is 0-indexed: 10 = Nov
            const fyEnd = new Date(startYear + 1, 9, 31, 23, 59, 59); // Month is 0-indexed: 9 = Oct

            yearMatch = t.date >= fyStart && t.date <= fyEnd;
         }

         return catMatch && yearMatch;
      });
   }, [transactions, filterCategory, selectedYear]);

   // Calculate totals
   const totalCredit = filteredTransactions.reduce((acc, curr) => curr.isCredit ? acc + curr.amount : acc, 0);
   const totalDebit = filteredTransactions.reduce((acc, curr) => !curr.isCredit ? acc + curr.amount : acc, 0);
   const totalSavings = filteredTransactions.filter(t => t.type === 'Savings').reduce((acc, curr) => acc + curr.amount, 0);

   const generatePDF = () => {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('DPA Financial Portal', 14, 22);
      doc.setFontSize(12);
      doc.text('Statement of Account', 14, 32);

      doc.setFontSize(10);
      doc.text(`Member: ${user?.name || 'N/A'}`, 14, 42);
      doc.text(`Email: ${user?.email || 'N/A'}`, 14, 48);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 54);

      // Table
      const tableColumn = ["Date", "Description", "Type", "Debit", "Credit"];
      const tableRows = filteredTransactions.map(t => [
         t.date.toLocaleDateString(),
         t.description,
         t.type,
         !t.isCredit ? formatCurrency(t.amount) : '',
         t.isCredit ? formatCurrency(t.amount) : '',
      ]);

      autoTable(doc, {
         head: [tableColumn],
         body: tableRows,
         startY: 60,
         theme: 'grid',
         headStyles: { fillColor: [0, 128, 96] }, // Primary color
      });

      // Totals
      const finalY = (doc as any).lastAutoTable.finalY || 60;
      doc.text(`Total Debit: ${formatCurrency(totalDebit)}`, 14, finalY + 10);
      doc.text(`Total Credit: ${formatCurrency(totalCredit)}`, 14, finalY + 16);
      doc.setFontSize(11);
      doc.setTextColor(0, 128, 96); // Green color for emphasis
      doc.text(`Total Savings: ${formatCurrency(totalSavings)}`, 14, finalY + 24);

      doc.save('statement.pdf');
   };

   const handlePrint = () => {
      window.print();
   };



   return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 print:p-0 print:max-w-none">
         <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none">
            <div className="flex flex-wrap items-center justify-between gap-4">
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statement of Account</h1>
               <div className="flex flex-wrap gap-3 print:hidden">
                  <button
                     onClick={generatePDF}
                     className="btn-secondary flex items-center gap-2 px-4 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold text-gray-700 dark:text-gray-200"
                  >
                     <span className="material-symbols-outlined text-lg">picture_as_pdf</span> PDF
                  </button>
                  <button
                     onClick={handlePrint}
                     className="btn-secondary flex items-center gap-2 px-4 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold text-gray-700 dark:text-gray-200"
                  >
                     <span className="material-symbols-outlined text-lg">print</span> Print
                  </button>
               </div>
            </div>
         </div>

         {/* Filters */}
         <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
               <label className="flex flex-col w-full">
                  <span className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-2">Category</span>
                  <select
                     value={filterCategory}
                     onChange={(e) => setFilterCategory(e.target.value)}
                     className="form-select h-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                  >
                     <option>All Transactions</option>
                     <option>Savings</option>
                     <option>Loans</option>
                     <option>Shares</option>
                  </select>
               </label>
               <label className="flex flex-col w-full">
                  <span className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-2">Financial Year</span>
                  <select
                     value={selectedYear}
                     onChange={(e) => setSelectedYear(e.target.value)}
                     className="form-select h-10 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                  >
                     {availableYears.map(year => (
                        <option key={year} value={year}>
                           {year === 'all' ? 'All Years' : `FY ${year}`}
                        </option>
                     ))}
                  </select>
               </label>
            </div>
         </div>

         {/* Table */}
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:shadow-none print:border-gray-200">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                     <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Debit</th>
                        <th className="px-6 py-3 text-right">Credit</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                     {loading ? (
                        <tr><td colSpan={5} className="px-6 py-4 text-center">Loading transactions...</td></tr>
                     ) : filteredTransactions.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-4 text-center">No transactions found for the selected filters.</td></tr>
                     ) : (
                        filteredTransactions.map((row, i) => (
                           <tr key={i} className="bg-white dark:bg-gray-800">
                              <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{row.date.toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-gray-900 dark:text-white">{row.description}</td>
                              <td className="px-6 py-4 text-gray-900 dark:text-white">{row.type}</td>
                              <td className="px-6 py-4 text-right text-red-600 font-mono">
                                 {!row.isCredit ? `-₦${formatCurrency(row.amount)}` : ''}
                              </td>
                              <td className="px-6 py-4 text-right text-green-600 font-mono">
                                 {row.isCredit ? `+₦${formatCurrency(row.amount)}` : ''}
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-900 dark:text-white">
                     <tr>
                        <th colSpan={3} className="px-6 py-3 text-right">Total</th>
                        <td className="px-6 py-3 text-right text-red-600 font-mono">-₦{formatCurrency(totalDebit)}</td>
                        <td className="px-6 py-3 text-right text-green-600 font-mono">+₦{formatCurrency(totalCredit)}</td>
                     </tr>
                  </tfoot>
               </table>
            </div>
         </div>
      </div>
   );
};

export default Statement;

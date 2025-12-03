import React, { useState, useEffect } from 'react';
import AddLoanModal, { LoanFormData } from '../../components/AddLoanModal';
import Pagination from '../../components/Pagination';
import { loansService, adminService } from '../../services/admin';
import { components } from '../../types/schema';

type LoanResponse = components['schemas']['LoanResponse'];
type UserResponse = components['schemas']['UserResponse'];

const LoansManagement: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loans, setLoans] = useState<LoanResponse[]>([]);
    const [members, setMembers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLoans = loans.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(loans.length / itemsPerPage);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [loansData, membersData] = await Promise.all([
                loansService.getAllLoans(),
                adminService.getAllUsers()
            ]);
            setLoans(loansData);
            setMembers(membersData);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLoan = async (loanData: LoanFormData) => {
        try {
            await loansService.applyForLoan(loanData);
            setIsModalOpen(false);
            await fetchData(); // Refresh the list
            alert('Loan created successfully!');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to create loan');
            console.error('Error creating loan:', err);
        }
    };

    const handleCloseLoan = async (loanId: number, memberName: string) => {
        if (!confirm(`Are you sure you want to mark this loan for ${memberName} as paid and close it?`)) return;
        try {
            await adminService.closeLoan(loanId);
            await fetchData();
            alert('Loan marked as paid and closed successfully!');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to close loan');
            console.error('Error closing loan:', err);
        }
    };

    const handleApproveLoan = async (loanId: number, memberName: string) => {
        if (!confirm(`Are you sure you want to approve this loan for ${memberName}?`)) return;
        try {
            await adminService.approveLoan(loanId);
            await fetchData();
            alert('Loan approved successfully!');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to approve loan');
            console.error('Error approving loan:', err);
        }
    };

    const handleDeleteLoan = async (loanId: number, memberName: string) => {
        if (!confirm(`Are you sure you want to DELETE this loan for ${memberName}? This action cannot be undone!`)) return;
        try {
            await adminService.deleteLoan(loanId);
            await fetchData();
            alert('Loan deleted successfully!');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete loan');
            console.error('Error deleting loan:', err);
        }
    };

    const handlePartialPayment = async (loanId: number, memberName: string, currentBalance: string) => {
        const amountStr = prompt(`Enter partial payment amount for ${memberName}\nCurrent Balance: ₦${parseFloat(currentBalance).toLocaleString()}`);
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (amount > parseFloat(currentBalance)) {
            alert('Payment amount cannot exceed the current balance');
            return;
        }

        try {
            await adminService.recordPartialPayment(loanId, amount);
            await fetchData();
            alert(`Partial payment of ₦${amount.toLocaleString()} recorded successfully!`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to record payment';
            if (errorMessage.includes('LoanStatus.APPROVED')) {
                alert('Error: This loan is Approved but not Active. The backend requires the loan to be Active before receiving payments. Please contact the backend team to allow payments for Approved loans or provide an activation endpoint.');
            } else {
                alert(errorMessage);
            }
            console.error('Error recording payment:', err);
        }
    };

    // Calculate stats from actual data
    const stats = {
        pending: loans.filter(l => l.status === 'pending').length,
        totalDisbursed: loans.reduce((sum, l) => sum + parseFloat(l.loan_amount), 0),
        totalInterest: loans.reduce((sum, l) => {
            const principal = parseFloat(l.loan_amount);
            const repayable = parseFloat(l.total_repayable);
            return sum + (repayable - principal);
        }, 0)
    };

    const getMemberName = (userId: number) => {
        const member = members.find(m => m.id === userId);
        return member ? member.full_name : 'Unknown';
    };

    const getMemberId = (userId: number) => {
        const member = members.find(m => m.id === userId);
        return member ? member.member_id : 'N/A';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'pending': return 'yellow';
            case 'approved': return 'blue';
            case 'closed': return 'gray';
            case 'rejected': return 'red';
            default: return 'gray';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {[
                    { label: 'Pending Approvals', value: stats.pending.toString() },
                    { label: 'Total Disbursed', value: `₦${stats.totalDisbursed.toLocaleString()}` },
                    { label: 'Total Interest', value: `₦${stats.totalInterest.toLocaleString()}` },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                        <p className="text-base font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <AddLoanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateLoan}
                members={members}
            />

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Loans</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Create New Loan
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <span className="material-symbols-outlined text-red-500 text-5xl mb-2">error</span>
                            <p className="text-red-500 font-medium">{error}</p>
                            <button
                                onClick={fetchData}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Retry
                            </button>
                        </div>
                    ) : loans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <span className="material-symbols-outlined text-gray-400 text-5xl mb-2">payments</span>
                            <p className="text-gray-500 dark:text-gray-400">No loans found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3">Loan ID</th>
                                    <th className="px-4 py-3">Member ID</th>
                                    <th className="px-4 py-3">Member Name</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Part Payment</th>
                                    <th className="px-4 py-3">Balance</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">App Date</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentLoans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">LN-{loan.id.toString().padStart(5, '0')}</td>
                                        <td className="px-4 py-3">{getMemberId(loan.user_id)}</td>
                                        <td className="px-4 py-3">{getMemberName(loan.user_id)}</td>
                                        <td className="px-4 py-3">₦{parseFloat(loan.loan_amount).toLocaleString()}</td>
                                        <td className="px-4 py-3">₦{parseFloat(loan.amount_paid).toLocaleString()}</td>
                                        <td className="px-4 py-3">₦{parseFloat(loan.balance).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={
                                                loan.status === 'active' ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                    loan.status === 'pending' ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                        loan.status === 'approved' ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                            loan.status === 'closed' ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' :
                                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{formatDate(loan.application_date)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Approve button for pending loans */}
                                                {loan.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleApproveLoan(loan.id, getMemberName(loan.user_id))}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                                        title="Approve Loan"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">check</span>
                                                        Approve
                                                    </button>
                                                )}


                                                {/* Partial Payment button - Show for active/approved/pending loans with balance */}
                                                {(loan.status === 'active' || loan.status === 'approved' || loan.status === 'pending') && (
                                                    <button
                                                        onClick={() => handlePartialPayment(loan.id, getMemberName(loan.user_id), loan.balance)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                                                        title="Record Partial Payment"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">payments</span>
                                                        Partial
                                                    </button>
                                                )}


                                                {/* Mark as Paid button for active/approved loans */}
                                                {(loan.status === 'active' || loan.status === 'approved') && (
                                                    <button
                                                        onClick={() => handleCloseLoan(loan.id, getMemberName(loan.user_id))}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                                        title="Mark as Paid"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        Paid
                                                    </button>
                                                )}

                                                {/* Cleared label for closed loans */}
                                                {loan.status === 'closed' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-lg">
                                                        <span className="material-symbols-outlined text-sm">verified</span>
                                                        Cleared
                                                    </span>
                                                )}

                                                {/* Delete button for all loans */}
                                                <button
                                                    onClick={() => handleDeleteLoan(loan.id, getMemberName(loan.user_id))}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                                    title="Delete Loan"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && !error && loans.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        totalPages={totalPages}
                        isLoading={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default LoansManagement;
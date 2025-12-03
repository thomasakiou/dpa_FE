

import React, { useState, useEffect } from 'react';
import { adminService, savingsService } from '../../services/admin';
import AddSavingsModal from '../../components/AddSavingsModal';
import EditSavingsModal from '../../components/EditSavingsModal';
import FinancialYearSelector from '../../components/FinancialYearSelector';
import Pagination from '../../components/Pagination';
import { useFinancialYear } from '../../contexts/FinancialYearContext';
import { useToast } from '../../contexts/ToastContext';

interface SavingsRecord {
    id: number;
    user_id: number;
    amount: string;
    type: string;
    payment_date: string;
    payment_month?: string;
    description?: string;
    created_at: string;
}

interface User {
    id: number;
    full_name: string;
    email: string;
    member_id: string;
}

const SavingsManagement: React.FC = () => {
    const [savings, setSavings] = useState<SavingsRecord[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedYear, currentYear } = useFinancialYear();
    const toast = useToast();

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSavings, setSelectedSavings] = useState<SavingsRecord | null>(null);

    useEffect(() => {
        fetchData();
    }, [selectedYear]); // Refetch when year changes

    const fetchData = async () => {
        try {
            setLoading(true);
            const [savingsData, membersData] = await Promise.all([
                savingsService.getAllSavings(),
                adminService.getAllUsers()
            ]);
            setSavings(savingsData);
            setMembers(membersData);
            setError(null);
        } catch (err: any) {
            // Check if it's a 404 (endpoint missing)
            if (err.response && err.response.status === 404) {
                console.warn('Backend endpoints missing. Using mock data.');
                // Mock Data Fallback
                setSavings([
                    { id: 1, user_id: 1, amount: '5000.00', type: 'Monthly Savings', payment_date: '2023-10-24T00:00:00', payment_month: 'October', description: 'October Savings', created_at: '2023-10-24T00:00:00' },
                    { id: 2, user_id: 2, amount: '25000.00', type: 'Share Purchase', payment_date: '2023-10-23T00:00:00', payment_month: 'October', description: '5 Shares', created_at: '2023-10-23T00:00:00' },
                    { id: 3, user_id: 1, amount: '10000.00', type: 'Loan Repayment', payment_date: '2023-10-20T00:00:00', payment_month: 'October', description: 'Partial repayment', created_at: '2023-10-20T00:00:00' },
                ]);
                // Try to fetch members again separately if the batch failed, or use mock members
                try {
                    const membersData = await adminService.getAllUsers();
                    setMembers(membersData);
                } catch (e) {
                    setMembers([
                        { id: 1, full_name: 'John Doe', email: 'john@example.com', member_id: 'DPA-001' },
                        { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', member_id: 'DPA-002' }
                    ]);
                }
                setError('Backend endpoints not found. Showing mock data for demonstration.');
            } else {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSavings = async (data: any) => {
        try {
            console.log('Sending savings data:', data);
            await savingsService.createSavings(data);
            await fetchData();
            setIsAddModalOpen(false);
            toast.success('Savings record created successfully!');
        } catch (err: any) {
            console.error('Error creating savings:', err);
            console.error('Error response:', err.response?.data);

            if (err.response && err.response.status === 404) {
                // Mock Create
                const newRecord = {
                    ...data,
                    id: Math.max(...savings.map(s => s.id), 0) + 1,
                    created_at: new Date().toISOString()
                };
                setSavings([newRecord, ...savings]);
                setIsAddModalOpen(false);
                alert('Backend missing. Mock record created successfully!');
            } else if (err.response && err.response.status === 422) {
                // Validation error - show details
                const errorDetail = err.response?.data?.detail || 'Validation failed';
                toast.error(`Validation Error: ${JSON.stringify(errorDetail, null, 2)} `);
            } else {
                toast.error(err.response?.data?.detail || 'Failed to create savings record');
            }
        }
    };

    const handleUpdateSavings = async (id: number, data: any) => {
        try {
            await savingsService.updateSavings(id, data);
            await fetchData();
            setIsEditModalOpen(false);
            await fetchData();
            setIsEditModalOpen(false);
            toast.success('Savings record updated successfully!');
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                // Mock Update
                setSavings(savings.map(s => s.id === id ? { ...s, ...data } : s));
                setIsEditModalOpen(false);
                toast.success('Backend missing. Mock record updated successfully!');
            } else {
                console.error('Error updating savings:', err);
                toast.error(err.response?.data?.detail || 'Failed to update savings record');
            }
        }
    };

    const handleDeleteSavings = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }

        try {
            await savingsService.deleteSavings(id);
            await fetchData();
            await fetchData();
            toast.success('Savings record deleted successfully!');
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                // Mock Delete
                setSavings(savings.filter(s => s.id !== id));
                toast.success('Backend missing. Mock record deleted successfully!');
            } else {
                console.error('Error deleting savings:', err);
                toast.error(err.response?.data?.detail || 'Failed to delete savings record');
            }
        }
    };

    const openEditModal = (record: SavingsRecord) => {
        setSelectedSavings(record);
        setIsEditModalOpen(true);
    };

    const getMemberName = (userId: number) => {
        const member = members.find(m => m.id === userId);
        return member ? member.full_name : 'Unknown Member';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // View mode state
    const [viewMode, setViewMode] = useState<'transactions' | 'members'>('transactions');

    // Filter by financial year first
    const yearFilteredSavings = savings.filter(record => {
        if (selectedYear === 'all') return true;

        // If the selected year matches the current year, use the configured dates
        if (currentYear && selectedYear === currentYear.label) {
            const recordDate = new Date(record.payment_date);
            const startDate = new Date(currentYear.startDate);
            const endDate = new Date(currentYear.endDate);

            // Check if record falls within the financial year date range
            return recordDate >= startDate && recordDate <= endDate;
        }

        // For historical years, calculate the date range based on the pattern
        // Assuming Nov-Oct cycle: "2024-2025" = Nov 1, 2024 to Oct 31, 2025
        const [startYear, endYear] = selectedYear.split('-').map(Number);
        const recordDate = new Date(record.payment_date);

        // Financial year starts November 1st of startYear
        const fyStart = new Date(startYear, 10, 1); // Month 10 = November (0-indexed)
        // Financial year ends October 31st of endYear
        const fyEnd = new Date(endYear, 9, 31, 23, 59, 59); // Month 9 = October

        return recordDate >= fyStart && recordDate <= fyEnd;
    });

    // Then filter by search query
    const filteredSavings = yearFilteredSavings.filter(record => {
        const memberName = getMemberName(record.user_id).toLowerCase();
        const type = (record.type || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return memberName.includes(query) || type.includes(query);
    });

    // Aggregate data for Members View
    const memberAggregates = React.useMemo(() => {
        const aggs: Record<number, {
            user_id: number;
            totalAmount: number;
            transactionCount: number;
            lastPaymentDate: string
        }> = {};

        yearFilteredSavings.forEach(record => {
            if (!aggs[record.user_id]) {
                aggs[record.user_id] = {
                    user_id: record.user_id,
                    totalAmount: 0,
                    transactionCount: 0,
                    lastPaymentDate: record.payment_date
                };
            }

            aggs[record.user_id].totalAmount += parseFloat(record.amount);
            aggs[record.user_id].transactionCount += 1;

            if (new Date(record.payment_date) > new Date(aggs[record.user_id].lastPaymentDate)) {
                aggs[record.user_id].lastPaymentDate = record.payment_date;
            }
        });

        return Object.values(aggs).sort((a, b) => b.totalAmount - a.totalAmount);
    }, [yearFilteredSavings]);

    // Filter aggregated members by search query
    const filteredMemberAggregates = memberAggregates.filter(agg => {
        const memberName = getMemberName(agg.user_id).toLowerCase();
        return memberName.includes(searchQuery.toLowerCase());
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Reset page when filter/view changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedYear, viewMode]);

    // Get current page items based on view mode
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentItems = viewMode === 'transactions'
        ? filteredSavings.slice(indexOfFirstItem, indexOfLastItem)
        : filteredMemberAggregates.slice(indexOfFirstItem, indexOfLastItem);

    const totalItems = viewMode === 'transactions'
        ? filteredSavings.length
        : filteredMemberAggregates.length;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Savings Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all member savings, add new payments, and view records.</p>
                </div>
                <FinancialYearSelector />
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p>{error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Savings ({selectedYear === 'all' ? 'All Time' : selectedYear})</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        ₦{yearFilteredSavings.reduce((sum, record) => sum + parseFloat(record.amount), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {yearFilteredSavings.length}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Savers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {new Set(yearFilteredSavings.map(r => r.user_id)).size}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-2 top-2 text-gray-400">search</span>
                            <input
                                className="pl-9 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-primary h-10 text-gray-900 dark:text-white"
                                placeholder={viewMode === 'transactions' ? "Search by member or type..." : "Search by member..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('transactions')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'transactions'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Transactions
                            </button>
                            <button
                                onClick={() => setViewMode('members')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'members'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Members Summary
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90"
                    >
                        <span className="material-symbols-outlined text-lg">add</span> Add Payment
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {viewMode === 'transactions' ? (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-xs text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Member Name</th>
                                    <th className="px-6 py-3">Payment Date</th>
                                    <th className="px-6 py-3">Payment Month</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No savings records found.
                                        </td>
                                    </tr>
                                ) : (
                                    (currentItems as SavingsRecord[]).map((record) => (
                                        <tr key={record.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white">
                                            <td className="px-6 py-4 font-medium">{getMemberName(record.user_id)}</td>
                                            <td className="px-6 py-4">{formatDate(record.payment_date)}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                                    {record.payment_month || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">
                                                ₦{parseFloat(record.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                    {record.type || 'Monthly Savings'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                {record.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(record)}
                                                    className="p-1 text-gray-500 hover:text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSavings(record.id)}
                                                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-xs text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Member Name</th>
                                    <th className="px-6 py-3">Member ID</th>
                                    <th className="px-6 py-3">Total Savings (FY)</th>
                                    <th className="px-6 py-3">Transactions</th>
                                    <th className="px-6 py-3">Last Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No member records found.
                                        </td>
                                    </tr>
                                ) : (
                                    (currentItems as typeof filteredMemberAggregates).map((agg) => {
                                        const member = members.find(m => m.id === agg.user_id);
                                        return (
                                            <tr key={agg.user_id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white">
                                                <td className="px-6 py-4 font-medium">{member?.full_name || 'Unknown'}</td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{member?.member_id || 'N/A'}</td>
                                                <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                                                    ₦{agg.totalAmount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">{agg.transactionCount}</td>
                                                <td className="px-6 py-4">{formatDate(agg.lastPaymentDate)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && !error && totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        totalPages={totalPages}
                        isLoading={loading}
                    />
                )}
            </div>

            {/* Modals */}
            <AddSavingsModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleCreateSavings}
                members={members}
            />

            <EditSavingsModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateSavings}
                record={selectedSavings}
                members={members}
            />
        </div>
    );
};

export default SavingsManagement;
import React, { useState, useEffect } from 'react';
import { adminService, sharesService } from '../../services/admin';
import AddShareModal, { ShareFormData } from '../../components/AddShareModal';
import EditShareModal from '../../components/EditShareModal';
import Pagination from '../../components/Pagination';
import { useToast } from '../../contexts/ToastContext';

interface ShareRecord {
    id: number;
    user_id: number;
    shares_count: number;
    share_value: string;
    total_value: string;
    purchase_date: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface User {
    id: number;
    full_name: string;
    email: string;
    member_id: string;
}

const SharesManagement: React.FC = () => {
    const [shares, setShares] = useState<ShareRecord[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedShare, setSelectedShare] = useState<ShareRecord | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sharesData, membersData] = await Promise.all([
                sharesService.getAllShares(),
                adminService.getAllUsers()
            ]);
            setShares(sharesData);
            setMembers(membersData);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShare = async (data: ShareFormData) => {
        try {
            // Convert date to ISO datetime format (YYYY-MM-DDTHH:MM:SS)
            const purchaseDateTime = new Date(data.purchase_date + 'T00:00:00').toISOString();

            const payload = {
                user_id: data.user_id,
                shares_count: data.shares_count,
                share_value: parseFloat(data.share_value),
                purchase_date: purchaseDateTime,
                description: data.description || ''
            };

            console.log('Creating share with payload:', payload);
            await sharesService.createShare(payload);
            await fetchData();
            setIsAddModalOpen(false);
            toast.success('Share purchase recorded successfully!');
        } catch (err: any) {
            console.error('Error creating share:', err);
            console.error('Error response:', err.response?.data);

            // Extract error message from various possible formats
            let errorMessage = 'Failed to create share record';
            if (err.response?.data) {
                if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    // Handle validation errors array
                    errorMessage = err.response.data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            }

            toast.error(errorMessage);
        }
    };

    const handleUpdateShare = async (id: number, data: any) => {
        try {
            await sharesService.updateShare(id, data);
            await fetchData();
            setIsEditModalOpen(false);
            toast.success('Share record updated successfully!');
        } catch (err: any) {
            console.error('Error updating share:', err);
            let errorMessage = 'Failed to update share record';
            if (err.response?.data?.detail) {
                errorMessage = typeof err.response.data.detail === 'string'
                    ? err.response.data.detail
                    : JSON.stringify(err.response.data.detail);
            }
            toast.error(errorMessage);
        }
    };

    const handleDeleteShare = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this share record? This action cannot be undone.')) {
            return;
        }

        try {
            await sharesService.deleteShare(id);
            await fetchData();
            toast.success('Share record deleted successfully!');
        } catch (err: any) {
            console.error('Error deleting share:', err);
            let errorMessage = 'Failed to delete share record';
            if (err.response?.data?.detail) {
                errorMessage = typeof err.response.data.detail === 'string'
                    ? err.response.data.detail
                    : JSON.stringify(err.response.data.detail);
            }
            toast.error(errorMessage);
        }
    };

    const openEditModal = (record: ShareRecord) => {
        setSelectedShare(record);
        setIsEditModalOpen(true);
    };

    const getMemberName = (userId: number) => {
        const member = members.find(m => m.id === userId);
        return member ? member.full_name : 'Unknown Member';
    };

    const getMemberId = (userId: number) => {
        const member = members.find(m => m.id === userId);
        return member ? member.member_id : 'N/A';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter by search query
    const filteredShares = shares.filter(record => {
        const memberName = getMemberName(record.user_id).toLowerCase();
        const memberId = getMemberId(record.user_id).toLowerCase();
        const query = searchQuery.toLowerCase();
        return memberName.includes(query) || memberId.includes(query);
    });

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentShares = filteredShares.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredShares.length / itemsPerPage);

    // Calculate stats
    const totalSharesCount = shares.reduce((sum, record) => sum + record.shares_count, 0);
    const totalSharesValue = shares.reduce((sum, record) => sum + parseFloat(record.total_value), 0);
    const activeShareholders = new Set(shares.map(r => r.user_id)).size;

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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shares Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage member share purchases and view records.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p>{error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Shares</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {totalSharesCount.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Share Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        ₦{totalSharesValue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Shareholders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {activeShareholders}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="relative w-full sm:w-64">
                        <span className="material-symbols-outlined absolute left-2 top-2 text-gray-400">search</span>
                        <input
                            className="pl-9 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-primary h-10 text-gray-900 dark:text-white"
                            placeholder="Search by member..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90"
                    >
                        <span className="material-symbols-outlined text-lg">add</span> Add Share Purchase
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {filteredShares.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <span className="material-symbols-outlined text-gray-400 text-5xl mb-2">account_balance</span>
                            <p className="text-gray-500 dark:text-gray-400">No share records found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-xs text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Member Name</th>
                                    <th className="px-6 py-3">Member ID</th>
                                    <th className="px-6 py-3">Shares Count</th>
                                    <th className="px-6 py-3">Share Value</th>
                                    <th className="px-6 py-3">Total Value</th>
                                    <th className="px-6 py-3">Purchase Date</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentShares.map((record) => (
                                    <tr key={record.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white">
                                        <td className="px-6 py-4 font-medium">{getMemberName(record.user_id)}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{getMemberId(record.user_id)}</td>
                                        <td className="px-6 py-4 font-medium">{record.shares_count}</td>
                                        <td className="px-6 py-4">₦{parseFloat(record.share_value).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                                            ₦{parseFloat(record.total_value).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">{formatDate(record.purchase_date)}</td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(record)}
                                                className="p-1 text-gray-500 hover:text-primary transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteShare(record.id)}
                                                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && !error && filteredShares.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        totalPages={totalPages}
                        isLoading={loading}
                    />
                )}
            </div>

            {/* Modals */}
            <AddShareModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleCreateShare}
                members={members}
            />

            <EditShareModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateShare}
                record={selectedShare}
                members={members}
            />
        </div>
    );
};

export default SharesManagement;

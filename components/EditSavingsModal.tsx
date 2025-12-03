import React, { useState, useEffect } from 'react';

interface User {
    id: number;
    full_name: string;
    email: string;
    member_id: string;
}

interface SavingsRecord {
    id: number;
    user_id: number;
    amount: string;
    type: string;
    payment_date: string;
    payment_month?: string;
    description?: string;
}

interface EditSavingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: any) => void;
    record: SavingsRecord | null;
    members: User[];
}

const EditSavingsModal: React.FC<EditSavingsModalProps> = ({ isOpen, onClose, onSubmit, record, members }) => {
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        payment_date: '',
        payment_month: '',
        type: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen && record) {
            setFormData({
                user_id: record.user_id.toString(),
                amount: record.amount,
                payment_date: record.payment_date ? new Date(record.payment_date).toISOString().split('T')[0] : '',
                payment_month: record.payment_month || '',
                type: record.type || 'Monthly Savings',
                description: record.description || ''
            });
        }
    }, [isOpen, record]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (record) {
            onSubmit(record.id, {
                ...formData,
                user_id: parseInt(formData.user_id),
                amount: parseFloat(formData.amount),
                payment_date: formData.payment_date + 'T00:00:00' // Convert to datetime format
            });
        }
    };

    if (!isOpen) return null;

    const selectedMember = members.find(m => m.id === parseInt(formData.user_id));

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Edit Savings Record</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Member Selection (Read Only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Member
                                </label>
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                    {selectedMember ? `${selectedMember.member_id} - ${selectedMember.full_name}` : 'Unknown Member'}
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Amount (₦)
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">₦</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="pl-7 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Payment Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.payment_date}
                                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {/* Payment Month */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Month
                                </label>
                                <select
                                    required
                                    value={formData.payment_month}
                                    onChange={(e) => setFormData({ ...formData, payment_month: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Select Month...</option>
                                    <option value="January">January</option>
                                    <option value="February">February</option>
                                    <option value="March">March</option>
                                    <option value="April">April</option>
                                    <option value="May">May</option>
                                    <option value="June">June</option>
                                    <option value="July">July</option>
                                    <option value="August">August</option>
                                    <option value="September">September</option>
                                    <option value="October">October</option>
                                    <option value="November">November</option>
                                    <option value="December">December</option>
                                </select>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Transaction Type
                                </label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                >
                                    <option value="Monthly Savings">Monthly Savings</option>
                                    <option value="Share Purchase">Share Purchase</option>
                                    <option value="Loan Repayment">Loan Repayment</option>
                                    <option value="Registration Fee">Registration Fee</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm"
                                >
                                    Update Record
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSavingsModal;

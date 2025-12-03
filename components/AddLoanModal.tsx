import React, { useState, useEffect } from 'react';
import { components } from '../types/schema';

type UserResponse = components['schemas']['UserResponse'];

interface AddLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (loanData: LoanFormData) => void;
    members: UserResponse[];
}

export interface LoanFormData {
    user_id: number;
    loan_amount: string;
    interest_rate: string;
    duration_months: number;
}

const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, onSubmit, members }) => {
    const [formData, setFormData] = useState<LoanFormData>({
        user_id: 0,
        loan_amount: '',
        interest_rate: '',
        duration_months: 12,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'user_id' || name === 'duration_months' ? parseInt(value) || 0 : value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            user_id: 0,
            loan_amount: '',
            interest_rate: '',
            duration_months: 12,
        });
    };

    // Calculate monthly payment and total repayable
    const calculateLoanDetails = () => {
        const principal = parseFloat(formData.loan_amount) || 0;
        const rate = parseFloat(formData.interest_rate) || 0;
        const months = formData.duration_months || 1;

        const monthlyRate = rate / 100 / 12;
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalRepayable = monthlyPayment * months;

        return {
            monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
            totalRepayable: isNaN(totalRepayable) ? 0 : totalRepayable,
            totalInterest: totalRepayable - principal,
        };
    };

    const loanDetails = calculateLoanDetails();

    const getSelectedMember = () => {
        return members.find(m => m.id === formData.user_id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-2xl">payments</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Loan</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Process a new loan application</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Member Selection */}
                        <div className="flex flex-col md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Select Member <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="user_id"
                                value={formData.user_id || ''}
                                onChange={handleChange}
                                className="form-select h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                <option value="">-- Select a member --</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.member_id} - {member.full_name}
                                    </option>
                                ))}
                            </select>
                            {getSelectedMember() && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Email: {getSelectedMember()?.email}
                                </p>
                            )}
                        </div>

                        {/* Loan Amount */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Loan Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₦</span>
                                <input
                                    type="number"
                                    name="loan_amount"
                                    value={formData.loan_amount}
                                    onChange={handleChange}
                                    className="form-input h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-8 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full"
                                    placeholder="5000.00"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Interest Rate */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Interest Rate (Annual) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="interest_rate"
                                    value={formData.interest_rate}
                                    onChange={handleChange}
                                    className="form-input h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 pr-8 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full"
                                    placeholder="5.5"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="flex flex-col md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Loan Duration <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="duration_months"
                                value={formData.duration_months}
                                onChange={handleChange}
                                className="form-select h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                <option value={6}>6 months</option>
                                <option value={12}>12 months (1 year)</option>
                                <option value={18}>18 months</option>
                                <option value={24}>24 months (2 years)</option>
                                <option value={36}>36 months (3 years)</option>
                                <option value={48}>48 months (4 years)</option>
                                <option value={60}>60 months (5 years)</option>
                            </select>
                        </div>
                    </div>

                    {/* Loan Summary */}
                    {formData.loan_amount && formData.interest_rate && (
                        <div className="mt-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Loan Summary</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Payment</p>
                                    <p className="text-lg font-bold text-primary">₦{loanDetails.monthlyPayment.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Interest</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">₦{loanDetails.totalInterest.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Repayable</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">₦{loanDetails.totalRepayable.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 sm:flex-none px-6 h-12 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Create Loan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLoanModal;

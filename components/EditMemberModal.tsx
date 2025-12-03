import React, { useState, useEffect } from 'react';
import { components } from '../types/schema';

type UserResponse = components['schemas']['UserResponse'];

interface EditMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userId: number, data: any) => void;
    member: UserResponse | null;
}

export interface EditMemberFormData {
    member_id: string;
    email: string;
    full_name: string;
    phone: string;
    role: 'member' | 'admin';
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({ isOpen, onClose, onSubmit, member }) => {
    const [formData, setFormData] = useState<EditMemberFormData>({
        member_id: '',
        email: '',
        full_name: '',
        phone: '',
        role: 'member',
    });

    useEffect(() => {
        if (member) {
            setFormData({
                member_id: member.member_id,
                email: member.email,
                full_name: member.full_name,
                phone: member.phone || '',
                role: member.role as 'member' | 'admin',
            });
        }
    }, [member]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (member) {
            onSubmit(member.id, formData);
        }
    };

    if (!isOpen || !member) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-2xl">edit</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Member</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Update member details</p>
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
                        {/* Member ID */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Member ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="member_id"
                                value={formData.member_id}
                                onChange={handleChange}
                                className="form-input h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>

                        {/* Full Name */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="form-input h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Role */}
                        <div className="flex flex-col md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-select h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMemberModal;

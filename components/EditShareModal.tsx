import React from 'react';

interface ShareRecord {
    id: number;
    user_id: number;
    shares_count: number;
    share_value: string;
    total_value: string;
    purchase_date: string;
    description?: string;
}

interface EditShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: any) => void;
    record: ShareRecord | null;
    members: Array<{ id: number; full_name: string; member_id: string }>;
}

const EditShareModal: React.FC<EditShareModalProps> = ({ isOpen, onClose, onSubmit, record, members }) => {
    const [formData, setFormData] = React.useState({
        shares_count: 0,
        share_value: '0',
        purchase_date: '',
        description: ''
    });

    React.useEffect(() => {
        if (record) {
            setFormData({
                shares_count: record.shares_count,
                share_value: record.share_value,
                purchase_date: record.purchase_date.split('T')[0],
                description: record.description || ''
            });
        }
    }, [record]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!record) return;

        if (formData.shares_count <= 0) {
            alert('Shares count must be greater than 0');
            return;
        }

        if (parseFloat(formData.share_value) <= 0) {
            alert('Share value must be greater than 0');
            return;
        }

        onSubmit(record.id, formData);
    };

    const totalValue = formData.shares_count * parseFloat(formData.share_value || '0');
    const memberName = members.find(m => m.id === record?.user_id)?.full_name || 'Unknown';

    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Share Record</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Member:</span> {memberName}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Number of Shares *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.shares_count}
                            onChange={(e) => setFormData({ ...formData, shares_count: parseInt(e.target.value) || 0 })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Previous: {record.shares_count} shares
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Share Value (per unit) *
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.share_value}
                            onChange={(e) => setFormData({ ...formData, share_value: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Previous: ₦{parseFloat(record.share_value).toLocaleString()}
                        </p>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <span className="font-semibold">New Total Value:</span> ₦{totalValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Previous: ₦{parseFloat(record.total_value).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Purchase Date *
                        </label>
                        <input
                            type="date"
                            value={formData.purchase_date}
                            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
                            rows={3}
                            placeholder="Add any notes about this purchase..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Update Share
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditShareModal;

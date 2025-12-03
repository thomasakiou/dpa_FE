import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => {
                onClose(toast.id);
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'info';
        }
    };

    const getColors = () => {
        switch (toast.type) {
            case 'success': return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'error': return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            case 'info': return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            default: return 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        }
    };

    return (
        <div className={`flex items-center w-full max-w-sm p-4 mb-4 rounded-lg shadow border ${getColors()} animate-slide-in-right`}>
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
                <span className="material-symbols-outlined">{getIcon()}</span>
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                onClick={() => onClose(toast.id)}
            >
                <span className="sr-only">Close</span>
                <span className="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
    );
};

export default Toast;

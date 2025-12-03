import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = 'Loading...' }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl flex flex-col items-center gap-4 animate-scale-in">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-medium">{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;

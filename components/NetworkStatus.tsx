import React, { useEffect, useState } from 'react';

interface NetworkStatusProps {
    isOnline?: boolean;
    isSlowConnection?: boolean;
    trigger?: number; // Timestamp to trigger showing the alert
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({
    isOnline = true,
    isSlowConnection = false,
    trigger = 0
}) => {
    const [show, setShow] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        // Only show if triggered and there's a network issue
        if (trigger > 0 && (!isOnline || isSlowConnection)) {
            setShow(true);
            setFadeOut(false);

            // Start fade out after 4 seconds
            const fadeTimer = setTimeout(() => {
                setFadeOut(true);
            }, 4000);

            // Hide completely after fade animation (5 seconds total)
            const hideTimer = setTimeout(() => {
                setShow(false);
                setFadeOut(false);
            }, 5000);

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [trigger, isOnline, isSlowConnection]);

    const handleRetry = () => {
        setRetrying(true);
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    if (!show) return null;

    return (
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-1000 ${fadeOut ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'
                }`}
        >
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[320px] max-w-md animate-slide-in-down">
                <div className="flex-shrink-0">
                    {retrying ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-600 border-t-transparent"></div>
                    ) : (
                        <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-2xl">
                            {isOnline ? 'signal_cellular_alt' : 'signal_cellular_connected_no_internet_0_bar'}
                        </span>
                    )}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm">
                        {!isOnline ? 'No Internet Connection' : 'Poor Network Detected'}
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 text-xs mt-1">
                        {retrying ? 'Retrying...' : 'Please check your connection and try again'}
                    </p>
                </div>
                {!retrying && (
                    <button
                        onClick={handleRetry}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
};

export default NetworkStatus;

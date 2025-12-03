import React, { createContext, useContext, useState, useCallback } from 'react';

interface NetworkContextType {
    isOnline: boolean;
    isSlowConnection: boolean;
    showNetworkAlert: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
    isOnline: true,
    isSlowConnection: false,
    showNetworkAlert: () => { }
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSlowConnection, setIsSlowConnection] = useState(false);

    // Check connection speed
    const checkConnectionSpeed = useCallback(() => {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

        if (connection) {
            const slowTypes = ['slow-2g', '2g'];
            const isSlow = slowTypes.includes(connection.effectiveType) || (connection.downlink && connection.downlink < 1);
            setIsSlowConnection(isSlow);
            return isSlow;
        }
        return false;
    }, []);

    // Function to trigger network alert check
    const showNetworkAlert = useCallback(() => {
        checkConnectionSpeed();
    }, [checkConnectionSpeed]);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <NetworkContext.Provider value={{ isOnline, isSlowConnection, showNetworkAlert }}>
            {children}
        </NetworkContext.Provider>
    );
};

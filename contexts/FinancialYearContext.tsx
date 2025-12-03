import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FinancialYear {
    label: string;        // e.g., "2024-2025"
    startDate: string;    // ISO date string
    endDate: string;      // ISO date string
}

interface FinancialYearContextType {
    currentYear: FinancialYear | null;
    selectedYear: string; // "2024-2025" or "all"
    setSelectedYear: (year: string) => void;
    setCurrentYear: (year: FinancialYear) => void;
    availableYears: string[];
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export const FinancialYearProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentYear, setCurrentYear] = useState<FinancialYear | null>(() => {
        // Try to load from localStorage
        const saved = localStorage.getItem('dpa_current_financial_year');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }

        // Calculate current financial year
        // Financial Year runs from November to October
        // If current month is Nov (10) or Dec (11), FY starts in current year
        // If current month is Jan (0) to Oct (9), FY starts in previous year
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        const currentCalendarYear = now.getFullYear();

        let startYear: number;

        if (currentMonth >= 10) { // November or December
            startYear = currentCalendarYear;
        } else { // January to October
            startYear = currentCalendarYear - 1;
        }

        return {
            label: `${startYear}-${startYear + 1}`,
            startDate: `${startYear}-11-01`,
            endDate: `${startYear + 1}-10-31`
        };
    });

    const [selectedYear, setSelectedYearState] = useState<string>(() => {
        return localStorage.getItem('dpa_selected_financial_year') || currentYear?.label || 'all';
    });

    // Generate list of available years - automatically show last 5 financial years
    const availableYears = React.useMemo(() => {
        const years: string[] = ['all'];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentCalendarYear = now.getFullYear();

        // Determine current FY start year
        let currentFYStartYear: number;
        if (currentMonth >= 10) {
            currentFYStartYear = currentCalendarYear;
        } else {
            currentFYStartYear = currentCalendarYear - 1;
        }

        // Generate last 5 financial years (including current year)
        for (let i = 0; i < 5; i++) {
            const year = currentFYStartYear - i;
            years.push(`${year}-${year + 1}`);
        }

        return years;
    }, []);

    const setSelectedYear = (year: string) => {
        setSelectedYearState(year);
        localStorage.setItem('dpa_selected_financial_year', year);
    };

    const updateCurrentYear = (year: FinancialYear) => {
        setCurrentYear(year);
        localStorage.setItem('dpa_current_financial_year', JSON.stringify(year));
    };

    return (
        <FinancialYearContext.Provider
            value={{
                currentYear,
                selectedYear,
                setSelectedYear,
                setCurrentYear: updateCurrentYear,
                availableYears
            }}
        >
            {children}
        </FinancialYearContext.Provider>
    );
};

export const useFinancialYear = () => {
    const context = useContext(FinancialYearContext);
    if (context === undefined) {
        throw new Error('useFinancialYear must be used within a FinancialYearProvider');
    }
    return context;
};

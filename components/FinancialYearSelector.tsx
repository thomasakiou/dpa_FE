import React from 'react';
import { useFinancialYear } from '../contexts/FinancialYearContext';

const FinancialYearSelector: React.FC = () => {
    const { selectedYear, setSelectedYear, availableYears, currentYear } = useFinancialYear();

    return (
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-lg">
                calendar_month
            </span>
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium px-3 py-1.5 focus:ring-primary focus:border-primary"
            >
                {availableYears.map((year) => (
                    <option key={year} value={year}>
                        {year === 'all' ? 'All Years' : `FY ${year}`}
                        {year === currentYear?.label && ' (Current)'}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FinancialYearSelector;

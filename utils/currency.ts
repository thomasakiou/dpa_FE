/**
 * Parses a currency string into a number.
 * Removes non-numeric characters (except dot and minus sign) before parsing.
 * Returns 0 if the string is empty or invalid.
 */
export const parseCurrency = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) {
        return 0;
    }

    if (typeof value === 'number') {
        return value;
    }

    // Remove all characters except digits, dot, and minus sign
    const cleaned = value.replace(/[^0-9.-]+/g, '');

    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats a number or string into a currency string with commas and 2 decimal places.
 * Example: 100000 -> "100,000.00"
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
    const number = parseCurrency(value);
    return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

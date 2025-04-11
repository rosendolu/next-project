import dayjs from 'dayjs';

/**
 * Format a number with thousand separators using native Intl API
 * Example: 1234567.89 -> 1,234,567.89
 * @param num Number or string to format
 * @param decimals Number of decimal places (optional)
 * @returns Formatted string
 */
export function formatNumberWithCommas(num: number | string, decimals?: number): string {
    const value = typeof num === 'string' ? parseFloat(num) : num;

    if (isNaN(value)) {
        return '0';
    }

    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals ?? undefined,
        maximumFractionDigits: decimals ?? undefined,
    });
}

/**
 * Format date to YYYY-MM-DD HH:mm:ss format
 * @param date Date input (Date object, string, or timestamp)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number): string {
    const d = dayjs(date);
    return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : 'Invalid Date';
}

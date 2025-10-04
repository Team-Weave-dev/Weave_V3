/**
 * Common Validation Utility Functions
 *
 * This file provides reusable validation functions for type guards
 * to ensure data integrity and runtime safety.
 */

/**
 * Validate ISO 8601 date string format
 *
 * @param value - Value to validate
 * @returns True if value is a valid ISO 8601 date string
 *
 * @example
 * isValidISODate("2025-01-05T10:30:00.000Z") // true
 * isValidISODate("invalid-date") // false
 */
export function isValidISODate(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  // Try to parse the date
  const date = new Date(value);

  // Check if date is valid and the string matches ISO 8601 format
  return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);
}

/**
 * Validate email address format
 *
 * @param value - Value to validate
 * @returns True if value is a valid email address
 *
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid-email") // false
 */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validate URL format
 *
 * @param value - Value to validate
 * @returns True if value is a valid URL
 *
 * @example
 * isValidURL("https://example.com") // true
 * isValidURL("not-a-url") // false
 */
export function isValidURL(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate string array
 *
 * @param value - Value to validate
 * @returns True if value is an array of strings
 *
 * @example
 * isStringArray(["a", "b", "c"]) // true
 * isStringArray([1, 2, 3]) // false
 * isStringArray(["a", 1, "b"]) // false
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Validate date range (start date must be before or equal to end date)
 *
 * @param start - Start date string
 * @param end - End date string
 * @returns True if start date is before or equal to end date
 *
 * @example
 * isValidDateRange("2025-01-01T00:00:00.000Z", "2025-12-31T23:59:59.999Z") // true
 * isValidDateRange("2025-12-31T23:59:59.999Z", "2025-01-01T00:00:00.000Z") // false
 */
export function isValidDateRange(start: string, end: string): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate;
}

/**
 * Validate number is within range (inclusive)
 *
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 *
 * @example
 * isNumberInRange(50, 0, 100) // true
 * isNumberInRange(150, 0, 100) // false
 * isNumberInRange(-10, 0, 100) // false
 */
export function isNumberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

/**
 * Validate positive number
 *
 * @param value - Number to validate
 * @returns True if value is a positive number (> 0)
 *
 * @example
 * isPositiveNumber(10) // true
 * isPositiveNumber(0) // false
 * isPositiveNumber(-5) // false
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validate non-negative number
 *
 * @param value - Number to validate
 * @returns True if value is a non-negative number (>= 0)
 *
 * @example
 * isNonNegativeNumber(10) // true
 * isNonNegativeNumber(0) // true
 * isNonNegativeNumber(-5) // false
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

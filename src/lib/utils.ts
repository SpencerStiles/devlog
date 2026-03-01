/**
 * Shared utility functions.
 */

/**
 * Formats a date consistently across the app:
 * e.g. "January 15, 2025"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

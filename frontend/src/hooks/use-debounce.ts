'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to debounce a value
 * Delays updating the value until after the specified delay has passed since the last change
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 400ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 400);
 *
 * // Use debouncedSearchTerm for API calls
 * useEffect(() => {
 *   // This will only run 400ms after the user stops typing
 *   fetchResults(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay is up
    // This prevents the debounced value from updating until the user stops typing
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to track if a value is currently being debounced
 * Useful for showing loading states while waiting for debounced value
 *
 * @param originalValue - The original value
 * @param debouncedValue - The debounced value
 * @returns true if the value is currently being debounced
 */
export function useIsDebouncing<T>(originalValue: T, debouncedValue: T): boolean {
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(originalValue !== debouncedValue);
  }, [originalValue, debouncedValue]);

  return isDebouncing;
}
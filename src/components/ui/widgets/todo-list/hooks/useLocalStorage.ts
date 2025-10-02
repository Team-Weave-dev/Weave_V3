import { useState, useEffect, useCallback, useMemo } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Memoize serialize and deserialize functions to prevent useEffect dependency issues
  const serialize = useMemo(
    () => options?.serialize || JSON.stringify,
    [options?.serialize]
  );
  const deserialize = useMemo(
    () => options?.deserialize || JSON.parse,
    [options?.deserialize]
  );

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }
      
      // JSON validity check
      try {
        const parsed = deserialize(item);
        return parsed;
      } catch (parseError) {
        console.error(`Invalid JSON in localStorage for ${key}, clearing and using initial value:`, parseError);
        // Clear invalid data
        window.localStorage.removeItem(key);
        return initialValue;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore));
        }

        return valueToStore;
      });
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, serialize]);

  // Remove from storage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  // Listen for storage changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || !e.newValue) return;
      
      try {
        const parsed = deserialize(e.newValue);
        setStoredValue(parsed);
      } catch (error) {
        console.error(`Error parsing storage change for ${key}:`, error);
        // If parse fails, just ignore the change (don't try to use initialValue here)
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return [storedValue, setValue, removeValue];
}
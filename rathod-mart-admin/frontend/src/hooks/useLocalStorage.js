// ========================================
// USE LOCAL STORAGE - FIXED VERSION
// Better error handling
// ========================================

import { useState, useEffect } from "react";

export const useLocalStorage = (key, initialValue) => {
  // Initialize state with safe localStorage access
  const [storedValue, setStoredValue] = useState(() => {
    // SSR safe check
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      if (!item) {
        return initialValue;
      }

      // Try to parse as JSON
      try {
        return JSON.parse(item);
      } catch (parseError) {
        // If it's a plain string (not JSON), return as-is
        console.warn(
          `localStorage key "${key}" contains non-JSON value, using as string:`,
          item
        );
        return item;
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Save to localStorage whenever value changes
  const setValue = (value) => {
    try {
      // Allow value to be a function (same API as useState)
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  };

  // Remove from localStorage
  const removeValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// Session storage version
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);

      if (!item) {
        return initialValue;
      }

      try {
        return JSON.parse(item);
      } catch (parseError) {
        console.warn(
          `sessionStorage key "${key}" contains non-JSON value:`,
          item
        );
        return item;
      }
    } catch (error) {
      console.error(`Error loading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving sessionStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

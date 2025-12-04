// ========================================
// USE DEBOUNCE HOOK
// Delay updates for search, input fields
// Performance optimization
// ========================================

import { useState, useEffect } from "react";

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage example:
// const [searchTerm, setSearchTerm] = useState('');
// const debouncedSearch = useDebounce(searchTerm, 500);
//
// useEffect(() => {
//   // API call with debouncedSearch
//   fetchResults(debouncedSearch);
// }, [debouncedSearch]);

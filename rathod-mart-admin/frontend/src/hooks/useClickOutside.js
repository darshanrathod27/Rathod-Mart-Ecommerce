// ========================================
// USE CLICK OUTSIDE HOOK
// Detect clicks outside element
// Useful for modals, dropdowns, menus
// ========================================

import { useEffect, useRef } from "react";

export const useClickOutside = (callback) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [callback]);

  return ref;
};

// Usage example:
// const dropdownRef = useClickOutside(() => setIsOpen(false));
// <div ref={dropdownRef}>Dropdown content</div>

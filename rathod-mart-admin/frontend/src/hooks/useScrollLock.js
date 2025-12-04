// ========================================
// USE SCROLL LOCK HOOK
// Lock body scroll when modal is open
// ========================================

import { useEffect } from "react";

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    // Save current scroll position
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Lock scroll
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    // Cleanup - restore scroll
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
};

// Usage example:
// useScrollLock(isModalOpen);

// ========================================
// USE ON SCREEN HOOK
// Detect when element is visible
// Lazy loading, animations
// ========================================

import { useState, useEffect, useRef } from "react";

export const useOnScreen = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

// Usage example:
// const [ref, isVisible] = useOnScreen({ threshold: 0.5 });
// <div ref={ref}>{isVisible && 'Visible!'}</div>

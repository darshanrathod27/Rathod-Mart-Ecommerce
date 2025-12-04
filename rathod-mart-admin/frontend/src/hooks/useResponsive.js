// ========================================
// USE RESPONSIVE HOOK
// Mobile, Tablet, Desktop detection
// Real-time screen size tracking
// ========================================

import { useState, useEffect } from "react";

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  useEffect(() => {
    // Screen size check function
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        // Mobile: < 768px
        isMobile: width < 768,
        // Tablet: 768px - 1024px
        isTablet: width >= 768 && width < 1024,
        // Desktop: >= 1024px
        isDesktop: width >= 1024,
        width,
        height,
      });
    };

    // Initial check
    handleResize();

    // Window resize listener
    window.addEventListener("resize", handleResize);

    // Orientation change listener (mobile)
    window.addEventListener("orientationchange", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return screenSize;
};

// ========================================
// USE MEDIA QUERY HOOK
// Custom breakpoint matching
// ========================================

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window exists (SSR safe)
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listener function
    const listener = () => setMatches(media.matches);

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
};

// ========================================
// PRESET BREAKPOINT HOOKS
// Quick access to common breakpoints
// ========================================

export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsTablet = () =>
  useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
export const useIsLargeDesktop = () => useMediaQuery("(min-width: 1440px)");

// Portrait/Landscape detection
export const useIsPortrait = () => useMediaQuery("(orientation: portrait)");
export const useIsLandscape = () => useMediaQuery("(orientation: landscape)");

// Touch device detection
export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
};

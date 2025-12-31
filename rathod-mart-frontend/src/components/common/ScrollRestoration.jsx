import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();
  const prevPathRef = useRef("");

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const prevPath = prevPathRef.current;

    // Always scroll to top when navigating to a new page
    if (currentPath !== prevPath) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      });
    }

    // Update previous path
    prevPathRef.current = currentPath;
  }, [location.pathname, location.search]);

  return null;
};

export default ScrollRestoration;

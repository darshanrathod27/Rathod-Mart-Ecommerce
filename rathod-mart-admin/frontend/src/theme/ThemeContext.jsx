// ========================================
// THEME CONTEXT - FIXED VERSION
// localStorage error handling added
// ========================================

import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // FIXED: Safe localStorage with proper error handling
  const [theme, setTheme] = useLocalStorage("rathod-mart-theme", "green");

  // Apply theme on mount and change
  useEffect(() => {
    // Validate theme value
    const validThemes = ["light", "dark", "green"];
    const safeTheme = validThemes.includes(theme) ? theme : "green";

    // Apply to body
    document.body.className = `theme-${safeTheme}`;

    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        light: "#FAFAFA",
        dark: "#121212",
        green: "#E8F5E9",
      };
      metaThemeColor.setAttribute("content", colors[safeTheme] || colors.green);
    }
  }, [theme]);

  const toggleTheme = (newTheme) => {
    const validThemes = ["light", "dark", "green"];
    if (validThemes.includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

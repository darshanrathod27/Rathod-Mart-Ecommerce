// ========================================
// THEME CONTEXT - Light/Dark/Green modes
// LocalStorage me save hoga
// ========================================

import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // LocalStorage se theme load - default green
  const [theme, setTheme] = useLocalStorage("rathod-mart-theme", "green");

  // Theme apply karo jab change ho
  useEffect(() => {
    // Body class update
    document.body.className = `theme-${theme}`;

    // Meta theme color (mobile browser bar)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        light: "#FAFAFA",
        dark: "#121212",
        green: "#E8F5E9",
      };
      metaThemeColor.setAttribute("content", colors[theme]);
    }
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
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

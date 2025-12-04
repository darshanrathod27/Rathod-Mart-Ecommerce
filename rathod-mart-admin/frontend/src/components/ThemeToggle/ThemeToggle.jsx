// ========================================
// THEME TOGGLE BUTTON
// Light/Dark/Green switcher
// ========================================

import { motion } from "framer-motion";
import { useTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";
import { FiSun, FiMoon } from "react-icons/fi";
import { GiPlantRoots } from "react-icons/gi";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { isMobile } = useResponsive();

  const themes = [
    {
      name: "light",
      icon: FiSun,
      label: "Light",
      color: "#FDB813",
      bg: "#FFF9E6",
    },
    {
      name: "dark",
      icon: FiMoon,
      label: "Dark",
      color: "#5A67D8",
      bg: "#2D3748",
    },
    {
      name: "green",
      icon: GiPlantRoots,
      label: "Green",
      color: "#4CAF50",
      bg: "#E8F5E9",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: isMobile ? "0.25rem" : "var(--space-sm)",
        background: "var(--bg-secondary)",
        padding: "var(--space-xs)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {themes.map(({ name, icon: Icon, label, color, bg }) => (
        <motion.button
          key={name}
          onClick={() => toggleTheme(name)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: isMobile
              ? "var(--space-xs) var(--space-sm)"
              : "var(--space-sm) var(--space-md)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            background: theme === name ? bg : "transparent",
            color: theme === name ? color : "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            fontSize: isMobile ? "0.8125rem" : "0.9rem",
            fontWeight: theme === name ? 600 : 500,
            transition: "all var(--transition-base)",
            minHeight: "auto",
            boxShadow: theme === name ? "var(--shadow-xs)" : "none",
          }}
          title={label}
        >
          <Icon size={isMobile ? 16 : 18} />
          {!isMobile && <span>{label}</span>}
        </motion.button>
      ))}
    </div>
  );
};

export default ThemeToggle;

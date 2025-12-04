// ========================================
// HEADER COMPONENT
// Top navigation bar
// ========================================

import { useResponsive } from "../../hooks/useResponsive";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { FiBell, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const Header = () => {
  const { isMobile } = useResponsive();

  return (
    <header
      style={{
        height: "var(--header-height)",
        borderBottom: "1px solid var(--border-color)",
        padding: isMobile
          ? "var(--space-sm) var(--space-md)"
          : "var(--space-md) var(--space-lg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-secondary)",
        position: "sticky",
        top: 0,
        zIndex: "var(--z-sticky)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Left - Logo/Title */}
      <div>
        <h1
          style={{
            fontSize: isMobile ? "1.125rem" : "1.5rem",
            fontWeight: 600,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          {isMobile ? "RM Admin" : "Rathod Mart Admin"}
        </h1>
        {!isMobile && (
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              margin: "0.25rem 0 0 0",
            }}
          >
            Premium E-Commerce Platform
          </p>
        )}
      </div>

      {/* Right - Actions */}
      <div
        style={{
          display: "flex",
          gap: isMobile ? "var(--space-sm)" : "var(--space-md)",
          alignItems: "center",
        }}
      >
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications - Desktop only */}
        {!isMobile && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: "relative",
              background: "var(--bg-tertiary)",
              border: "none",
              padding: "var(--space-sm)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "auto",
            }}
            title="Notifications"
          >
            <FiBell size={20} />
            {/* Notification badge */}
            <span
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "8px",
                height: "8px",
                background: "var(--error)",
                borderRadius: "50%",
                border: "2px solid var(--bg-secondary)",
              }}
            />
          </motion.button>
        )}

        {/* User Profile */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            padding: "var(--space-xs) var(--space-sm)",
            background: "var(--bg-tertiary)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: isMobile ? "32px" : "40px",
              height: isMobile ? "32px" : "40px",
              borderRadius: "var(--radius-full)",
              background: "var(--primary-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <FiUser size={isMobile ? 16 : 20} />
          </div>
          {!isMobile && (
            <div>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  margin: 0,
                  color: "var(--text-primary)",
                }}
              >
                Admin
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  margin: 0,
                  color: "var(--text-secondary)",
                }}
              >
                Administrator
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
};

export default Header;

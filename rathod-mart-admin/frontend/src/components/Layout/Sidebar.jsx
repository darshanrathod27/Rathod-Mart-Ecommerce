// ========================================
// SIDEBAR COMPONENT
// Navigation menu with mobile support
// ========================================

import { NavLink } from "react-router-dom";
import { useResponsive } from "../../hooks/useResponsive";
import { useToggle } from "../../hooks/useToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiShoppingBag,
  FiGrid,
  FiTag,
  FiPackage,
  FiPercent,
  FiMenu,
  FiX,
  FiHome,
} from "react-icons/fi";

const Sidebar = () => {
  const { isMobile, isTablet } = useResponsive();
  const [isOpen, toggleSidebar, openSidebar, closeSidebar] = useToggle(
    !isMobile
  );

  const menuItems = [
    { path: "/", icon: FiHome, label: "Dashboard" },
    { path: "/users", icon: FiUsers, label: "Users" },
    { path: "/categories", icon: FiGrid, label: "Categories" },
    { path: "/products", icon: FiShoppingBag, label: "Products" },
    { path: "/size-mapping", icon: FiTag, label: "Size Mapping" },
    { path: "/color-mapping", icon: FiTag, label: "Color Mapping" },
    { path: "/variant-master", icon: FiPackage, label: "Variant Master" },
    { path: "/inventory", icon: FiPackage, label: "Inventory" },
    { path: "/promocodes", icon: FiPercent, label: "Promocodes" },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            bottom: "var(--space-lg)",
            right: "var(--space-lg)",
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-full)",
            background: "var(--primary-green)",
            color: "#fff",
            border: "none",
            boxShadow: "var(--shadow-xl)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: "var(--z-fixed)",
          }}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              zIndex: "var(--z-modal-backdrop)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={isMobile ? { x: "-100%" } : false}
        animate={isMobile ? { x: isOpen ? 0 : "-100%" } : {}}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          width: isMobile
            ? "280px"
            : isTablet
            ? "80px"
            : "var(--sidebar-width-desktop)",
          height: "100vh",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-color)",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "var(--space-lg) 0",
          zIndex: isMobile ? "var(--z-modal)" : "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            padding: "0 var(--space-lg)",
            marginBottom: "var(--space-xl)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "var(--primary-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.25rem",
              flexShrink: 0,
            }}
          >
            RM
          </div>
          {!isTablet && (
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  margin: 0,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                Rathod Mart
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  margin: 0,
                  color: "var(--text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? closeSidebar : undefined}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "var(--space-md)",
                padding: isTablet
                  ? "var(--space-md)"
                  : "var(--space-md) var(--space-lg)",
                margin: "0.25rem 0",
                color: isActive
                  ? "var(--primary-green)"
                  : "var(--text-secondary)",
                background: isActive ? "var(--hover-bg)" : "transparent",
                borderLeft: isActive
                  ? "3px solid var(--primary-green)"
                  : "3px solid transparent",
                textDecoration: "none",
                transition: "all var(--transition-base)",
                justifyContent: isTablet ? "center" : "flex-start",
                fontWeight: isActive ? 600 : 500,
              })}
            >
              <item.icon size={20} />
              {!isTablet && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* System Status - Desktop only */}
        {!isMobile && !isTablet && (
          <div
            style={{
              margin: "0 var(--space-lg)",
              padding: "var(--space-md)",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                margin: "0 0 0.25rem 0",
                fontWeight: 500,
              }}
            >
              System Status
            </p>
            <p
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--primary-green)",
                margin: 0,
              }}
            >
              98.5%
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                margin: "0.25rem 0 0 0",
              }}
            >
              Uptime
            </p>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;

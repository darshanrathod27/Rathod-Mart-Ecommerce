// frontend/src/components/Layout/Layout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, useTheme, useMediaQuery, Toolbar } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";
import MobileHeader from "./MobileHeader";
import ResponsiveSidebar from "./ResponsiveSidebar";

import {
  People,
  Category,
  Inventory,
  AspectRatio,
  Palette,
  ViewInAr,
  Inventory2,
  LocalOffer,
  Dashboard,
} from "@mui/icons-material";

// Page Configuration
const pageConfig = {
  "/": {
    title: "Dashboard",
    subtitle: "Overview of your e-commerce platform",
    icon: Dashboard,
  },
  "/users": {
    title: "Users Management",
    subtitle: "Manage all registered users and their permissions",
    icon: People,
  },
  "/categories": {
    title: "Categories Management",
    subtitle: "Organize your products into logical categories",
    icon: Category,
  },
  "/products": {
    title: "Products Management",
    subtitle: "Manage your core product inventory and details",
    icon: Inventory,
  },
  "/product-size-mapping": {
    title: "Product Size Mapping",
    subtitle: "Define available sizes for each product",
    icon: AspectRatio,
  },
  "/product-color-mapping": {
    title: "Product Color Mapping",
    subtitle: "Define available colors for each product",
    icon: Palette,
  },
  "/variant-master": {
    title: "Variant Master",
    subtitle: "Create specific product variants from sizes and colors",
    icon: ViewInAr,
  },
  "/inventory": {
    title: "Inventory Master",
    subtitle: "Track stock movements and manage inventory levels",
    icon: Inventory2,
  },
  "/promocodes": {
    title: "Promocode Master",
    subtitle: "Create and manage discount codes for customers",
    icon: LocalOffer,
  },
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const location = useLocation();

  const drawerWidth = isMobile ? 0 : isTablet ? 240 : 280;

  // Auto-close mobile sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, mobileSidebarOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const currentPageConfig =
    pageConfig[location.pathname] || pageConfig["/users"];

  // Background pattern component
  const BackgroundPattern = () => (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.04) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(102, 187, 106, 0.04) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(129, 199, 132, 0.04) 0%, transparent 50%),
          linear-gradient(135deg, transparent 0%, rgba(76, 175, 80, 0.02) 50%, transparent 100%)
        `,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {/* ========== DESKTOP/TABLET LAYOUT ========== */}
      {!isMobile ? (
        <>
          <Header
            drawerWidth={drawerWidth}
            handleDrawerToggle={handleDrawerToggle}
            isMobile={false}
            title={currentPageConfig.title}
            subtitle={currentPageConfig.subtitle}
            Icon={currentPageConfig.icon}
          />

          <Sidebar
            drawerWidth={drawerWidth}
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            isMobile={false}
            isTablet={isTablet}
          />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              background: "linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%)",
              minHeight: "100vh",
              position: "relative",
              overflow: "auto",
            }}
          >
            <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                pt: 3,
                pb: 2,
                px: { xs: 2, sm: 3, lg: 4 },
                minHeight: "calc(100vh - 70px)",
              }}
            >
              <BackgroundPattern />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ height: "100%" }}
              >
                <Outlet />
              </motion.div>
            </Box>
          </Box>
        </>
      ) : (
        <>
          {/* ========== MOBILE LAYOUT (FIXED) ========== */}

          {/* Mobile Header - Lower Z-Index */}
          <MobileHeader
            sidebarOpen={mobileSidebarOpen}
            toggleSidebar={toggleMobileSidebar}
          />

          {/* Mobile Sidebar - Higher Z-Index */}
          <ResponsiveSidebar
            open={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />

          {/* Mobile Main Content - SCROLLABLE */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: "100%",
              height: "100vh",
              background: "linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%)",
              position: "relative",
              overflow: "auto", // Enable scroll
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Spacer for Fixed Header */}
            <Box sx={{ height: 64, flexShrink: 0 }} />

            {/* Scrollable Content Area */}
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                flex: 1,
                pt: 2,
                pb: "90px", // Bottom nav spacing
                px: 2,
              }}
            >
              <BackgroundPattern />

              {/* Page Content with Animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </>
      )}
    </Box>
  );
};

export default Layout;

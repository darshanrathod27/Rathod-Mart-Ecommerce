// frontend/src/components/Layout/Layout.jsx

import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";
import {
  People,
  Category,
  Inventory,
  AspectRatio,
  Palette,
  ViewInAr,
  Inventory2,
  LocalOffer,
} from "@mui/icons-material";

const pageConfig = {
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const location = useLocation();

  const drawerWidth = isMobile ? 0 : isTablet ? 240 : 280;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentPageConfig =
    pageConfig[location.pathname] || pageConfig["/users"];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        maxHeight: isMobile ? "100vh" : "none", // ✅ FIX: Limit height on mobile
        overflow: "hidden", // ✅ FIX: Prevent overflow on main container
        bgcolor: "#f5f5f5",
      }}
    >
      {/* Sidebar - Only on Desktop/Tablet */}
      {!isMobile && (
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          maxHeight: isMobile ? "100vh" : "none", // ✅ FIX: Limit height on mobile
          overflow: "auto", // ✅ FIX: Allow scrolling inside content
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f5f5f5",
          position: "relative",
        }}
      >
        {/* Header - Only on Desktop */}
        {!isMobile && (
          <Header
            pageTitle={currentPageConfig.title}
            pageSubtitle={currentPageConfig.subtitle}
            PageIcon={currentPageConfig.icon}
          />
        )}

        {/* Page Content with Animation */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 2.5, md: 3 },
            pb: { xs: 10, md: 3 }, // ✅ FIX: Extra padding bottom on mobile for bottom nav
            overflow: "auto", // ✅ FIX: Allow content scrolling
            maxHeight: isMobile ? "calc(100vh - 56px)" : "none", // ✅ FIX: Account for mobile nav
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%" }}
          >
            <Outlet />
          </motion.div>
        </Box>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </Box>
    </Box>
  );
};

export default Layout;

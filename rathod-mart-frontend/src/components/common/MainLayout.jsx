import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "../cart/CartDrawer";
import WishlistDrawer from "../wishlist/WishlistDrawer";
import ScrollRestoration from "./ScrollRestoration";

/**
 * MainLayout Component
 * Wraps all pages with shared navigation, footer, and drawers
 * Handles responsive layout and proper spacing
 */
const MainLayout = () => {
  const location = useLocation();
  const { pathname } = location;
  const theme = useTheme();

  // 🎯 Responsive Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  // eslint-disable-next-line no-unused-vars
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  // Check if current page is checkout
  const isCheckoutPage = pathname === "/checkout";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden", // Prevent horizontal scroll
        position: "relative",
      }}
    >
      {/* Scroll Restoration */}
      <ScrollRestoration />

      {/* Navbar - Hidden on checkout page */}
      {!isCheckoutPage && <Navbar />}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          // 📱 Proper top margin for fixed navbar
          mt: isCheckoutPage
            ? 0
            : {
                xs: "56px", // Mobile navbar height
                md: "74px", // Desktop navbar height
              },
          // Ensure no horizontal overflow
          maxWidth: "100vw",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* This is where page content renders (Home, ProductDetails, etc.) */}
        <Outlet />
      </Box>

      {/* Footer - Hidden on checkout page */}
      {!isCheckoutPage && <Footer />}

      {/* Cart and Wishlist Drawers - Always mounted but controlled by context */}
      <CartDrawer />
      <WishlistDrawer />
    </Box>
  );
};

export default MainLayout;

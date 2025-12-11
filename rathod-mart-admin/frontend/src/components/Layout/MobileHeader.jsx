// frontend/src/components/Layout/MobileHeader.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Badge,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications,
  Search,
  AccountCircle,
  Settings,
  Logout,
} from "@mui/icons-material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../store/authSlice";
import api from "../../services/api";
import toast from "react-hot-toast";

// Page titles mapping
const pageTitles = {
  "/": "Dashboard",
  "/users": "Users",
  "/categories": "Categories",
  "/products": "Products",
  "/product-size-mapping": "Size Mapping",
  "/product-color-mapping": "Color Mapping",
  "/variant-master": "Variants",
  "/inventory": "Inventory",
  "/promocodes": "Promocodes",
};

const MobileHeader = ({ sidebarOpen, toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { scrollY } = useScroll();

  // Darker green background for better UI match
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(46, 125, 50, 0.95)", "rgba(27, 94, 32, 0.98)"]
  );

  const headerShadow = useTransform(
    scrollY,
    [0, 50],
    ["0 2px 12px rgba(27, 94, 32, 0.3)", "0 4px 24px rgba(27, 94, 32, 0.4)"]
  );

  // Advanced scroll behavior with hide/show logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 20);

      if (currentScrollY < 10) {
        setHeaderVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const currentTitle = pageTitles[location.pathname] || "Admin Panel";

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await api.post("/users/admin-logout");
      dispatch(logoutAction());
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  };

  const handleProfile = () => {
    handleMenuClose();
    toast.success("Profile page coming soon!");
  };

  const handleSettings = () => {
    handleMenuClose();
    toast.success("Settings page coming soon!");
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: headerVisible ? 0 : -100,
        opacity: headerVisible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 30,
        mass: 0.8,
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100, // Lower than sidebar (1300)
      }}
    >
      <motion.div
        style={{
          background: headerBg,
          boxShadow: headerShadow,
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
            backdropFilter: "blur(20px) saturate(180%)",
            borderBottom: isScrolled
              ? "1px solid rgba(129, 199, 132, 0.3)"
              : "1px solid rgba(129, 199, 132, 0.2)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Subtle Pattern Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 15% 50%, rgba(129, 199, 132, 0.1) 0%, transparent 30%),
                radial-gradient(circle at 85% 30%, rgba(165, 214, 167, 0.08) 0%, transparent 30%)
              `,
              pointerEvents: "none",
              opacity: isScrolled ? 0.6 : 1,
              transition: "opacity 0.3s ease",
            }}
          />

          <Toolbar
            sx={{
              minHeight: 64,
              px: 2,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Menu Button */}
            <motion.div whileTap={{ scale: 0.9 }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleSidebar}
                sx={{
                  mr: 2,
                  color: "#FFFFFF",
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.25)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <MenuIcon />
              </IconButton>
            </motion.div>

            {/* Dynamic Page Title */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={{ flexGrow: 1 }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "#FFFFFF",
                  letterSpacing: "0.5px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {currentTitle}
              </Typography>
            </motion.div>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>

              {/* Profile Avatar */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={handleProfileClick}
                  size="medium"
                  sx={{ ml: 0.5, p: 0.5 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      background:
                        "linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%)",
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <AccountCircle fontSize="small" sx={{ color: "#1B5E20" }} />
                  </Avatar>
                </IconButton>
              </motion.div>
            </Box>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                zIndex: 1400, // Above everything
                "& .MuiPaper-root": {
                  borderRadius: 3,
                  minWidth: 180,
                  mt: 1.5,
                  background: "rgba(255, 255, 255, 0.98)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(27, 94, 32, 0.3)",
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                },
              }}
            >
              <MenuItem
                onClick={handleProfile}
                sx={{
                  py: 1.5,
                  "&:hover": {
                    background: "rgba(76, 175, 80, 0.1)",
                  },
                }}
              >
                <AccountCircle sx={{ mr: 1.5, color: "primary.main" }} />
                Profile
              </MenuItem>
              <MenuItem
                onClick={handleSettings}
                sx={{
                  py: 1.5,
                  "&:hover": {
                    background: "rgba(76, 175, 80, 0.1)",
                  },
                }}
              >
                <Settings sx={{ mr: 1.5, color: "primary.main" }} />
                Settings
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  "&:hover": {
                    background: "rgba(244, 67, 54, 0.1)",
                  },
                }}
              >
                <Logout sx={{ mr: 1.5, color: "error.main" }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </motion.div>
    </motion.div>
  );
};

export default MobileHeader;

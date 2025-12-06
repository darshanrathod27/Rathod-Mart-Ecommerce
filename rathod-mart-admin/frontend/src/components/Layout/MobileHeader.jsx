// src/components/Layout/MobileHeader.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Divider,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications,
  Search,
  Close,
  Dashboard,
  People,
  Inventory,
  Category,
  Settings,
  Logout,
  LocalOffer,
  ViewInAr,
  Palette,
  AspectRatio,
  Inventory2,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import api from "../../services/api";
import toast from "react-hot-toast";

// Page Configuration
const pageConfig = {
  "/": { title: "Dashboard", icon: Dashboard },
  "/users": { title: "Users", icon: People },
  "/categories": { title: "Categories", icon: Category },
  "/products": { title: "Products", icon: Inventory },
  "/product-size-mapping": { title: "Size Mapping", icon: AspectRatio },
  "/product-color-mapping": { title: "Color Mapping", icon: Palette },
  "/variant-master": { title: "Variant Master", icon: ViewInAr },
  "/inventory": { title: "Inventory", icon: Inventory2 },
  "/promocodes": { title: "Promocodes", icon: LocalOffer },
};

const MobileHeader = ({
  toggleSidebar,
  onSearchChange,
  searchValue = "",
  showSearch = false,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Current page info
  const currentPath = location.pathname;
  const currentPage = pageConfig[currentPath] || {
    title: "Rathod Mart",
    icon: Dashboard,
  };
  const PageIcon = currentPage.icon;

  // Sync search value
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
    if (searchOpen) {
      setLocalSearch("");
      onSearchChange && onSearchChange("");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange && onSearchChange(value);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await api.post("/users/admin-logout");
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed");
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        width: "100%",
        bgcolor: alpha(theme.palette.primary.main, 0.98),
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${alpha("#fff", 0.2)}`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.primary.dark, 0.2)}`,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: searchOpen ? 112 : 56, sm: 64 },
          transition: "min-height 0.3s ease",
          flexDirection: "column",
          justifyContent: "center",
          py: searchOpen ? 1.5 : 0,
          px: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Top Row */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 56,
          }}
        >
          {/* Left: Menu & Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              flex: 1,
              overflow: "hidden",
            }}
          >
            <IconButton
              onClick={toggleSidebar}
              sx={{
                color: "white",
                bgcolor: alpha("#fff", 0.15),
                "&:hover": { bgcolor: alpha("#fff", 0.25) },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              <MenuIcon />
            </IconButton>

            {!searchOpen && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    overflow: "hidden",
                  }}
                >
                  <PageIcon sx={{ fontSize: 22, color: "white" }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "white",
                      fontSize: { xs: "1.05rem", sm: "1.15rem" },
                      letterSpacing: "0.3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {currentPage.title}
                  </Typography>
                </motion.div>
              </AnimatePresence>
            )}
          </Box>

          {/* Right: Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {showSearch && (
              <IconButton sx={{ color: "white" }} onClick={handleSearchToggle}>
                {searchOpen ? <Close /> : <Search />}
              </IconButton>
            )}

            <IconButton sx={{ color: "white" }}>
              <Badge
                badgeContent={3}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    animation: "pulse 2s infinite",
                  },
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)", opacity: 1 },
                    "50%": { transform: "scale(1.1)", opacity: 0.8 },
                  },
                }}
              >
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 0.5 }}>
              <Avatar
                src={userInfo?.profileImage}
                alt={userInfo?.name}
                sx={{
                  width: 36,
                  height: 36,
                  border: "2px solid white",
                  boxShadow: theme.shadows[2],
                }}
              >
                {userInfo?.name ? userInfo.name[0] : "A"}
              </Avatar>
            </IconButton>
          </Box>
        </Box>

        {/* Search Bar (Expandable) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: "100%", marginTop: "12px" }}
            >
              <TextField
                fullWidth
                autoFocus
                placeholder={`Search ${currentPage.title.toLowerCase()}...`}
                value={localSearch}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "rgba(255, 255, 255, 0.98)",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": {
                      borderColor: alpha("#fff", 0.5),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "white",
                      borderWidth: 2,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: localSearch && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setLocalSearch("");
                          onSearchChange && onSearchChange("");
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Toolbar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {userInfo?.name || "Admin User"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {userInfo?.email || "admin@rathodmart.com"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate("/settings");
          }}
          sx={{ mt: 0.5 }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main", mb: 0.5 }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default MobileHeader;

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Drawer,
  List,
  ListItem,
  Container,
  Avatar,
} from "@mui/material";
import {
  ShoppingCart,
  FavoriteBorder,
  AccountCircle,
  Menu as MenuIcon,
  Store,
  Category,
  TrendingUp,
  FilterList,
  Close,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Settings,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import AdvancedFilterDrawer from "../filter/AdvancedFilterDrawer";
import SearchBar from "./SearchBar";

import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../../store/authSlice";
import api from "../../data/api";
import toast from "react-hot-toast";

const API_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // 🎯 Responsive Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  const { getCartItemsCount, openCart } = useCart();
  const { getWishlistItemsCount, openWishlist } = useWishlist();
  const dispatch = useDispatch();
  const { isAuthenticated, userInfo } = useSelector(
    (state) => state.auth || {}
  );

  const cartItemCount = getCartItemsCount();
  const wishlistItemCount = getWishlistItemsCount();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRange: [0, 100000],
    ratings: [],
    discounts: [],
    inStock: false,
    sortBy: "featured",
  });

  const [navCategories, setNavCategories] = useState([]);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);

  const getAvatarUrl = (relative) => {
    if (!relative) return null;
    return relative.startsWith("http") ? relative : `${API_BASE}${relative}`;
  };

  useEffect(() => {
    if (
      location.pathname === "/category" &&
      location.search.includes("trending=true")
    ) {
      setActiveLink("Trending");
    } else {
      setActiveLink(location.pathname);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScrollEvent = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  // Fetch Categories
  useEffect(() => {
    api
      .fetchCategories({ limit: 50, sortBy: "name", sortOrder: "asc" })
      .then((data) => setNavCategories(data))
      .catch((err) => console.error("Failed to fetch nav categories", err));
  }, []);

  const handleNavClick = (item, e) => {
    if (item.action) item.action(e);
    if (item.name === "Trending") setActiveLink("Trending");
    else if (item.name !== "Categories") setActiveLink(item.name);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
    navigate("/", { state: { filters: newFilters, applyFilters: true } });
  };

  const handleLogout = async () => {
    setUserMenuAnchor(null);
    try {
      await api.post("/users/logout");
      dispatch(logoutAction());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const navigationItems = [
    {
      name: "Home",
      path: "/",
      icon: <HomeIcon />,
      action: () => navigate("/"),
    },
    {
      name: "Categories",
      icon: <Category />,
      action: (e) => setCategoryMenuAnchor(e.currentTarget),
    },
    {
      name: "Trending",
      icon: <TrendingUp />,
      action: () => navigate("/category?trending=true"),
    },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: isScrolled
            ? "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)"
            : "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
          transition: "background 0.4s ease-in-out, box-shadow 0.3s ease",
          boxShadow: isScrolled ? "0px 4px 20px rgba(0, 0, 0, 0.2)" : "none",
          borderBottom: "1px solid",
          borderColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              // 📱 Responsive Height - Mobile par shorter
              minHeight: { xs: "56px", md: "74px" },
              // 📱 Responsive Gap - Mobile par kam gap
              gap: { xs: 1, md: 2 },
              // 📱 Responsive Padding
              px: { xs: 1, md: 2 },
            }}
          >
            {/* 🏪 Logo */}
            <Box
              onClick={() => navigate("/")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, md: 1 },
                cursor: "pointer",
                mr: { xs: 0.5, md: 1 },
              }}
            >
              {/* 📱 Responsive Store Icon */}
              <Store
                sx={{
                  color: "#fff",
                  fontSize: { xs: 24, sm: 28, md: 32 },
                }}
              />
              {/* 📱 Hide text on extra small, show on small+ */}
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  display: { xs: "none", sm: "block" },
                  // 📱 Responsive Font Size
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
                  letterSpacing: "-0.5px",
                }}
              >
                Rathod Mart
              </Typography>
            </Box>

            {/* 🖥️ Desktop Nav Links (Hide on Mobile) */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.name}
                    onClick={(e) => handleNavClick(item, e)}
                    startIcon={item.icon}
                    sx={{
                      color:
                        activeLink === item.name || activeLink === item.path
                          ? "#ffffff"
                          : "rgba(255,255,255,0.85)",
                      fontWeight: 600,
                      px: { md: 1.5, lg: 2 },
                      py: { md: 0.75 },
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "#ffffff",
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
            )}

            {/* Spacer for Desktop */}
            {!isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* 🔍 Search Bar - Fully Responsive */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                // 📱 Responsive Margin - Mobile par kam
                mx: { xs: 1, md: 2 },
                // 📱 Max Width Control
                maxWidth: { xs: "100%", sm: 400, md: 500 },
              }}
            >
              <SearchBar categories={navCategories} />
            </Box>

            {/* Spacer for Desktop */}
            {!isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* 🎯 Right Action Icons - Fully Responsive */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                // 📱 Responsive Gap
                gap: { xs: 0.5, sm: 1, md: 1.5 },
              }}
            >
              {/* 🔧 Filter Button */}
              <Tooltip title="Filters">
                <IconButton
                  onClick={() => setIsFilterOpen(true)}
                  sx={{
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.1)",
                    // 📱 Touch-friendly size (minimum 44x44px)
                    minWidth: { xs: 44, md: 40 },
                    minHeight: { xs: 44, md: 40 },
                    p: { xs: 1, md: 1 },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <FilterList sx={{ fontSize: { xs: 20, md: 24 } }} />
                </IconButton>
              </Tooltip>

              {/* ❤️ Wishlist Icon */}
              <Tooltip title="Wishlist">
                <IconButton
                  onClick={openWishlist}
                  sx={{
                    color: "#fff",
                    // 📱 Responsive Padding
                    p: { xs: 0.75, md: 1 },
                    // 📱 Touch-friendly size
                    minWidth: { xs: 44, md: 40 },
                    minHeight: { xs: 44, md: 40 },
                  }}
                >
                  <Badge
                    badgeContent={wishlistItemCount}
                    color="error"
                    // 📱 Smaller badge on mobile
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: { xs: "0.65rem", md: "0.75rem" },
                        minWidth: { xs: 16, md: 20 },
                        height: { xs: 16, md: 20 },
                      },
                    }}
                  >
                    {/* 📱 Responsive Icon Size */}
                    <FavoriteBorder sx={{ fontSize: { xs: 20, md: 24 } }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* 🛒 Cart Icon */}
              <Tooltip title="Cart">
                <IconButton
                  onClick={openCart}
                  sx={{
                    color: "#fff",
                    // 📱 Responsive Padding
                    p: { xs: 0.75, md: 1 },
                    // 📱 Touch-friendly size
                    minWidth: { xs: 44, md: 40 },
                    minHeight: { xs: 44, md: 40 },
                  }}
                >
                  <Badge
                    badgeContent={cartItemCount}
                    color="warning"
                    // 📱 Smaller badge on mobile
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: { xs: "0.65rem", md: "0.75rem" },
                        minWidth: { xs: 16, md: 20 },
                        height: { xs: 16, md: 20 },
                      },
                    }}
                  >
                    {/* 📱 Responsive Icon Size */}
                    <ShoppingCart sx={{ fontSize: { xs: 20, md: 24 } }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* 👤 Profile Icon */}
              <Tooltip title="Profile">
                <IconButton
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  sx={{
                    color: "#fff",
                    p: { xs: 0.75, md: 1 },
                    // 📱 Touch-friendly size
                    minWidth: { xs: 44, md: 40 },
                    minHeight: { xs: 44, md: 40 },
                  }}
                >
                  {isAuthenticated && userInfo?.profileImage ? (
                    <Avatar
                      src={getAvatarUrl(userInfo.profileImage)}
                      sx={{
                        // 📱 Responsive Avatar Size
                        width: { xs: 28, md: 32 },
                        height: { xs: 28, md: 32 },
                        border: "2px solid #fff",
                      }}
                    />
                  ) : (
                    // 📱 Responsive Icon Size
                    <AccountCircle sx={{ fontSize: { xs: 24, md: 28 } }} />
                  )}
                </IconButton>
              </Tooltip>

              {/* 📱 Mobile Menu Button (Show only on Mobile) */}
              {isMobile && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  sx={{
                    color: "#fff",
                    // 📱 Touch-friendly size
                    minWidth: 44,
                    minHeight: 44,
                    p: 1,
                  }}
                >
                  <MenuIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 📱 Mobile Drawer Menu - Enhanced */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            // 📱 Full width on small mobile, fixed width on larger
            width: { xs: "85%", sm: 320, md: 350 },
            maxWidth: "100%",
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
            background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
            color: "#fff",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Menu
          </Typography>
          <IconButton
            onClick={() => setMobileOpen(false)}
            sx={{
              color: "#fff",
              // 📱 Touch-friendly size
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <Close />
          </IconButton>
        </Box>
        <Divider />

        {/* Navigation Items */}
        <List sx={{ pt: 1 }}>
          {navigationItems.map((item) => (
            <ListItem
              button
              key={item.name}
              onClick={() => {
                item.action();
                setMobileOpen(false);
              }}
              sx={{
                // 📱 Touch-friendly height
                minHeight: 48,
                py: 1.5,
                px: 2,
                "&:hover": {
                  bgcolor: "rgba(46, 125, 50, 0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "primary.main",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  fontWeight: 500,
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mt: 1 }} />

        {/* User Info Section in Mobile Menu */}
        <Box sx={{ p: 2, mt: "auto" }}>
          {isAuthenticated && userInfo && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Avatar
                src={getAvatarUrl(userInfo.profileImage)}
                sx={{ width: 40, height: 40 }}
              />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {userInfo.name || "User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {userInfo.email}
                </Typography>
              </Box>
            </Box>
          )}

          <Button
            fullWidth
            variant={isAuthenticated ? "outlined" : "contained"}
            color="primary"
            onClick={() => {
              if (isAuthenticated) {
                handleLogout();
              } else {
                navigate("/login");
              }
              setMobileOpen(false);
            }}
            sx={{
              // 📱 Touch-friendly height
              py: 1.2,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {isAuthenticated ? "Logout" : "Login"}
          </Button>
        </Box>
      </Drawer>

      {/* 👤 User Menu - Desktop */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 2,
            // 📱 Responsive Width
            minWidth: { xs: 180, sm: 200 },
            boxShadow: theme.shadows[4],
          },
        }}
      >
        {isAuthenticated
          ? [
              <MenuItem
                key="prof"
                onClick={() => {
                  navigate("/profile");
                  setUserMenuAnchor(null);
                }}
                sx={{
                  // 📱 Touch-friendly height
                  minHeight: { xs: 44, md: 40 },
                  py: { xs: 1.2, md: 1 },
                }}
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Profile"
                  primaryTypographyProps={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                />
              </MenuItem>,
              <MenuItem
                key="set"
                onClick={() => {
                  navigate("/profile");
                  setUserMenuAnchor(null);
                }}
                sx={{
                  minHeight: { xs: 44, md: 40 },
                  py: { xs: 1.2, md: 1 },
                }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                />
              </MenuItem>,
              <Divider key="div" />,
              <MenuItem
                key="out"
                onClick={handleLogout}
                sx={{
                  minHeight: { xs: 44, md: 40 },
                  py: { xs: 1.2, md: 1 },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                />
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="in"
                onClick={() => {
                  navigate("/login");
                  setUserMenuAnchor(null);
                }}
                sx={{
                  minHeight: { xs: 44, md: 40 },
                  py: { xs: 1.2, md: 1 },
                }}
              >
                <ListItemText
                  primary="Login"
                  primaryTypographyProps={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                />
              </MenuItem>,
              <MenuItem
                key="up"
                onClick={() => {
                  navigate("/register");
                  setUserMenuAnchor(null);
                }}
                sx={{
                  minHeight: { xs: 44, md: 40 },
                  py: { xs: 1.2, md: 1 },
                }}
              >
                <ListItemText
                  primary="Register"
                  primaryTypographyProps={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                />
              </MenuItem>,
            ]}
      </Menu>

      {/* 📂 Category Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => setCategoryMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 2,
            // 📱 Responsive Width
            minWidth: { xs: 220, sm: 250 },
            maxHeight: { xs: 350, md: 400 },
          },
        }}
      >
        {navCategories.map((cat) => (
          <MenuItem
            key={cat.id}
            onClick={() => {
              navigate(`/category?category=${cat.id}`);
              setCategoryMenuAnchor(null);
            }}
            sx={{
              // 📱 Touch-friendly height
              minHeight: { xs: 44, md: 40 },
              py: { xs: 1.2, md: 1 },
            }}
          >
            <ListItemIcon>
              <Typography sx={{ fontSize: { xs: "1.1rem", md: "1.2rem" } }}>
                {cat.icon}
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary={cat.name}
              primaryTypographyProps={{
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* 🔧 Advanced Filter Drawer */}
      <AdvancedFilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
};

export default Navbar;

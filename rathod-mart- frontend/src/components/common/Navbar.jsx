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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
        // Removed motion.header and variants to fix the Gradient Error
        sx={{
          // We use CSS transition for smooth gradient switch
          background: isScrolled
            ? "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)" // Scrolled (Darker)
            : "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)", // Top (Lighter)
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
            sx={{ minHeight: { xs: "64px", md: "74px" }, gap: 2 }}
          >
            {/* Logo */}
            <Box
              onClick={() => navigate("/")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                mr: 1,
              }}
            >
              <Store sx={{ color: "#fff", fontSize: { xs: 28, md: 32 } }} />
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  display: { xs: "none", sm: "block" },
                  letterSpacing: "-0.5px",
                }}
              >
                Rathod Mart
              </Typography>
            </Box>

            {/* Desktop Nav Links */}
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

            <Box sx={{ flexGrow: 1 }} />

            {/* Search Bar */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                mx: 2,
              }}
            >
              <SearchBar categories={navCategories} />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Right Actions */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, md: 1.5 },
              }}
            >
              <Tooltip title="Filters">
                <IconButton
                  onClick={() => setIsFilterOpen(true)}
                  sx={{
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <FilterList />
                </IconButton>
              </Tooltip>

              <Tooltip title="Wishlist">
                <IconButton onClick={openWishlist} sx={{ color: "#fff" }}>
                  <Badge badgeContent={wishlistItemCount} color="error">
                    <FavoriteBorder />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Cart">
                <IconButton onClick={openCart} sx={{ color: "#fff" }}>
                  <Badge badgeContent={cartItemCount} color="warning">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Profile">
                <IconButton
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  sx={{ color: "#fff" }}
                >
                  {isAuthenticated && userInfo?.profileImage ? (
                    <Avatar
                      src={getAvatarUrl(userInfo.profileImage)}
                      sx={{ width: 32, height: 32, border: "2px solid #fff" }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Tooltip>

              {isMobile && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  sx={{ color: "#fff" }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawers & Menus */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 280 } }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#f5f5f5",
          }}
        >
          <Typography variant="h6" color="primary" fontWeight={700}>
            Menu
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {navigationItems.map((item) => (
            <ListItem
              button
              key={item.name}
              onClick={() => {
                item.action();
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: "primary.main" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
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
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>{" "}
                Profile
              </MenuItem>,
              <MenuItem
                key="set"
                onClick={() => {
                  navigate("/profile");
                  setUserMenuAnchor(null);
                }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>{" "}
                Settings
              </MenuItem>,
              <Divider key="div" />,
              <MenuItem key="out" onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>{" "}
                Logout
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="in"
                onClick={() => {
                  navigate("/login");
                  setUserMenuAnchor(null);
                }}
              >
                Login
              </MenuItem>,
              <MenuItem
                key="up"
                onClick={() => {
                  navigate("/register");
                  setUserMenuAnchor(null);
                }}
              >
                Register
              </MenuItem>,
            ]}
      </Menu>

      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => setCategoryMenuAnchor(null)}
        PaperProps={{
          sx: { mt: 1.5, borderRadius: 2, minWidth: 250, maxHeight: 400 },
        }}
      >
        {navCategories.map((cat) => (
          <MenuItem
            key={cat.id}
            onClick={() => {
              navigate(`/category?category=${cat.id}`);
              setCategoryMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <Typography sx={{ fontSize: "1.2rem" }}>{cat.icon}</Typography>
            </ListItemIcon>
            <ListItemText primary={cat.name} />
          </MenuItem>
        ))}
      </Menu>

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

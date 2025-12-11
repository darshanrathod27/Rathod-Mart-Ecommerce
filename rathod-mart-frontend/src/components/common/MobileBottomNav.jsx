// src/components/common/MobileBottomNav.jsx
// Beautiful bottom navigation for mobile users with smart filter integration

import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Badge,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Fab,
} from "@mui/material";
import {
    Home,
    Store,
    Search,
    ShoppingCart,
    Person,
    FilterList,
    TrendingUp,
    LocalOffer,
    FavoriteBorder,
    Close,
    ChevronRight,
    Favorite,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import AdvancedFilterDrawer from "../filter/AdvancedFilterDrawer";
import api from "../../data/api";

const MobileBottomNav = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const location = useLocation();
    const { getCartItemsCount, openCart } = useCart();
    const { getWishlistItemsCount, openWishlist } = useWishlist();
    const { isAuthenticated } = useSelector((state) => state.auth || {});

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
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
    const [categories, setCategories] = useState([]);

    React.useEffect(() => {
        api.fetchCategories({ limit: 20 })
            .then(data => setCategories(data))
            .catch(() => { });
    }, []);

    const cartCount = getCartItemsCount();
    const wishlistCount = getWishlistItemsCount();

    // Only show on mobile
    if (!isMobile) return null;

    // Check if current page needs filter button
    const isFilterPage = location.pathname === "/products" ||
        location.pathname === "/category" ||
        location.pathname.startsWith("/category");

    const navItems = [
        {
            id: "home",
            label: "Home",
            icon: Home,
            path: "/",
            onClick: () => navigate("/")
        },
        {
            id: "shop",
            label: "Shop",
            icon: Store,
            path: "/products",
            onClick: () => navigate("/products")
        },
        {
            id: "search",
            label: "Search",
            icon: Search,
            onClick: () => setSearchOpen(true),
            isCenter: true
        },
        {
            id: "cart",
            label: "Cart",
            icon: ShoppingCart,
            onClick: () => openCart(),
            badge: cartCount
        },
        {
            id: "profile",
            label: "Account",
            icon: Person,
            path: "/profile",
            onClick: () => isAuthenticated ? navigate("/profile") : navigate("/login")
        },
    ];

    const isActive = (item) => {
        if (!item.path) return false;
        if (item.path === "/") return location.pathname === "/";
        return location.pathname.startsWith(item.path);
    };

    return (
        <>
            {/* Floating Filter Button - Only on filter pages */}
            <AnimatePresence>
                {isFilterPage && (
                    <Fab
                        component={motion.button}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        size="medium"
                        onClick={() => setIsFilterOpen(true)}
                        sx={{
                            position: "fixed",
                            bottom: 100,
                            right: 20,
                            zIndex: 1200,
                            background: "linear-gradient(135deg, #2E7D32 0%, #43A047 100%)",
                            color: "#fff",
                            boxShadow: "0 4px 20px rgba(46, 125, 50, 0.4)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                            },
                        }}
                    >
                        <FilterList />
                    </Fab>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <Paper
                component={motion.div}
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                elevation={0}
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    display: { xs: "flex", md: "none" },
                    justifyContent: "space-around",
                    alignItems: "center",
                    py: 0.5,
                    px: 0.5,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderTop: "1px solid rgba(46, 125, 50, 0.1)",
                    boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.08)",
                    // Safe area for notched phones
                    pb: "max(8px, env(safe-area-inset-bottom))",
                }}
            >
                {navItems.map((item, index) => {
                    const active = isActive(item);
                    const Icon = item.icon;

                    return (
                        <Box
                            key={item.id}
                            component={motion.div}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={item.onClick}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                flex: 1,
                                py: item.isCenter ? 0 : 1,
                                cursor: "pointer",
                                position: "relative",
                            }}
                        >
                            {/* Center elevated button for Search */}
                            {item.isCenter ? (
                                <Box
                                    component={motion.div}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 8px 25px rgba(46, 125, 50, 0.45)",
                                        mt: -4,
                                        border: "5px solid #fff",
                                        position: "relative",
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            inset: -3,
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, rgba(46,125,50,0.3), rgba(67,160,71,0.1))",
                                            zIndex: -1,
                                        },
                                    }}
                                >
                                    <Icon sx={{ color: "#fff", fontSize: 28 }} />
                                </Box>
                            ) : (
                                <>
                                    {/* Active dot indicator */}
                                    <AnimatePresence>
                                        {active && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: 20, opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    height: 3,
                                                    background: "linear-gradient(90deg, #2E7D32, #43A047)",
                                                    borderRadius: 10,
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Badge for cart/wishlist */}
                                    <Badge
                                        badgeContent={item.badge}
                                        color="error"
                                        sx={{
                                            "& .MuiBadge-badge": {
                                                fontSize: "0.65rem",
                                                minWidth: 16,
                                                height: 16,
                                                background: "linear-gradient(135deg, #e53935, #ef5350)",
                                                border: "2px solid #fff",
                                                top: 2,
                                                right: 2,
                                            },
                                        }}
                                    >
                                        <Box
                                            component={motion.div}
                                            animate={active ? { y: [0, -3, 0] } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Icon
                                                sx={{
                                                    fontSize: 24,
                                                    color: active ? "#2E7D32" : "#9e9e9e",
                                                    transition: "all 0.2s ease",
                                                }}
                                            />
                                        </Box>
                                    </Badge>

                                    {/* Label */}
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mt: 0.3,
                                            fontSize: "0.6rem",
                                            fontWeight: active ? 700 : 500,
                                            color: active ? "#2E7D32" : "#757575",
                                            transition: "all 0.2s ease",
                                            letterSpacing: active ? 0.3 : 0,
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    );
                })}
            </Paper>

            {/* Full Screen Search Drawer */}
            <Drawer
                anchor="bottom"
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                PaperProps={{
                    sx: {
                        height: "92vh",
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        overflow: "hidden",
                    },
                }}
            >
                {/* Search Header */}
                <Box
                    sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)",
                    }}
                >
                    <IconButton
                        onClick={() => setSearchOpen(false)}
                        sx={{
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.15)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                        }}
                    >
                        <Close />
                    </IconButton>
                    <Box
                        component={motion.div}
                        initial={{ width: "80%" }}
                        animate={{ width: "100%" }}
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#fff",
                            borderRadius: 50,
                            px: 2.5,
                            py: 1.2,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        }}
                    >
                        <Search sx={{ color: "#2E7D32", mr: 1.5, fontSize: 22 }} />
                        <input
                            type="text"
                            placeholder="Search for products, brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && searchQuery.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    setSearchOpen(false);
                                }
                            }}
                            autoFocus
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                fontSize: "1rem",
                                fontFamily: "inherit",
                                background: "transparent",
                                color: "#333",
                            }}
                        />
                    </Box>
                </Box>

                {/* Quick Actions */}
                <Box sx={{ p: 2.5 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "#2E7D32",
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            fontSize: "0.7rem",
                        }}
                    >
                        Quick Actions
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                        {[
                            { label: "🔥 Trending", path: "/category?trending=true", color: "#fff3e0" },
                            { label: "⭐ Best Offers", path: "/products?isBestOffer=true", color: "#e8f5e9" },
                            { label: "🛍️ All Products", path: "/products", color: "#e3f2fd" },
                            { label: "❤️ Wishlist", action: () => { openWishlist(); setSearchOpen(false); }, color: "#fce4ec" },
                        ].map((item) => (
                            <Box
                                key={item.label}
                                component={motion.div}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    if (item.action) {
                                        item.action();
                                    } else {
                                        navigate(item.path);
                                        setSearchOpen(false);
                                    }
                                }}
                                sx={{
                                    px: 2,
                                    py: 1.2,
                                    bgcolor: item.color,
                                    borderRadius: 25,
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                }}
                            >
                                {item.label}
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Divider sx={{ mx: 2 }} />

                {/* Categories */}
                <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "#2E7D32",
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            fontSize: "0.7rem",
                        }}
                    >
                        Browse Categories
                    </Typography>
                    <List disablePadding sx={{ mt: 1 }}>
                        {categories.slice(0, 10).map((cat, idx) => (
                            <ListItem
                                key={cat.id || idx}
                                component={motion.div}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => {
                                    navigate(`/category?category=${cat.id}`);
                                    setSearchOpen(false);
                                }}
                                sx={{
                                    py: 1.5,
                                    px: 1.5,
                                    cursor: "pointer",
                                    borderRadius: 3,
                                    mb: 0.5,
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        bgcolor: "#f1f8e9",
                                        transform: "translateX(4px)",
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, fontSize: "1.4rem" }}>
                                    {cat.icon || "📦"}
                                </ListItemIcon>
                                <ListItemText
                                    primary={cat.name}
                                    primaryTypographyProps={{ fontWeight: 600, fontSize: "0.95rem" }}
                                />
                                <ChevronRight sx={{ color: "#bdbdbd", fontSize: 20 }} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Filter Drawer */}
            <AdvancedFilterDrawer
                open={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
            />
        </>
    );
};

export default MobileBottomNav;

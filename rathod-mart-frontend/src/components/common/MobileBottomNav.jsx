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
    Close,
    ChevronRight,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useFilter } from "../../context/FilterContext";
import api from "../../data/api";

// API Base URL for images
const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

// Helper to get proper image URL
const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
};

const MobileBottomNav = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const location = useLocation();
    const { getCartItemsCount, openCart } = useCart();
    const { openWishlist } = useWishlist();
    const { isAuthenticated } = useSelector((state) => state.auth || {});

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState({ products: [], categories: [] });
    const [searchLoading, setSearchLoading] = useState(false);
    // Use shared filter context - drawer is rendered by the page component
    const { openFilter } = useFilter();

    const [categories, setCategories] = useState([]);

    React.useEffect(() => {
        api.fetchCategories({ limit: 20 })
            .then(data => setCategories(data))
            .catch(() => { });
    }, []);

    // Fetch search suggestions when query changes
    React.useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchSuggestions({ products: [], categories: [] });
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                // Filter matching categories
                const matchedCats = categories
                    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 3);

                // Fetch matching products from API
                const products = await api.fetchProducts({
                    search: searchQuery,
                    limit: 5,
                });

                setSearchSuggestions({
                    categories: matchedCats,
                    products: products || [],
                });
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, categories]);

    const cartCount = getCartItemsCount();
    // wishlistCount removed - not used in current UI

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
            // Open the mobile search drawer
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
            {/* Floating Filter Button - Only on filter pages, positioned above bottom nav */}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            openFilter();
                        }}
                        sx={{
                            position: "fixed",
                            // Position above bottom nav - accounts for safe area
                            bottom: "max(90px, calc(80px + env(safe-area-inset-bottom)))",
                            left: 16,
                            zIndex: 1200,
                            background: "linear-gradient(135deg, #2E7D32 0%, #43A047 100%)",
                            color: "#fff",
                            boxShadow: "0 4px 20px rgba(46, 125, 50, 0.4)",
                            // Touch-friendly sizing
                            width: 52,
                            height: 52,
                            minWidth: 52,
                            minHeight: 52,
                            WebkitTapHighlightColor: "transparent",
                            "&:hover": {
                                background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                            },
                            "&:active": {
                                transform: "scale(0.95)",
                                boxShadow: "0 2px 10px rgba(46, 125, 50, 0.5)",
                            },
                        }}
                    >
                        <FilterList sx={{ fontSize: 24 }} />
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

            {/* Full Screen Search Drawer - Fixed for All Devices */}
            <Drawer
                anchor="bottom"
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                // Ensure drawer is above navbar
                sx={{
                    zIndex: 1400, // Higher than navbar (typically 1100)
                }}
                PaperProps={{
                    sx: {
                        // Full screen coverage - works on Android and iOS
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: "100%",
                        maxHeight: "100%",
                        width: "100%",
                        // iOS Safari fallback
                        "@supports (-webkit-touch-callout: none)": {
                            height: "-webkit-fill-available",
                        },
                        borderRadius: 0, // Remove border radius for full screen
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
                transitionDuration={250}
            >
                {/* Search Header - Enhanced for all mobile devices */}
                <Box
                    sx={{
                        // Safe area padding for notched phones
                        pt: "max(12px, env(safe-area-inset-top))",
                        px: { xs: 1.5, sm: 2 },
                        pb: { xs: 1.5, sm: 2 },
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, sm: 1.5 },
                        background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)",
                        minHeight: { xs: 70, sm: 80 },
                        flexShrink: 0,
                    }}
                >
                    <IconButton
                        onClick={() => setSearchOpen(false)}
                        sx={{
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.15)",
                            minWidth: { xs: 44, sm: 44 },
                            minHeight: { xs: 44, sm: 44 },
                            WebkitTapHighlightColor: "transparent",
                            "&:active": { bgcolor: "rgba(255,255,255,0.3)" },
                        }}
                    >
                        <Close sx={{ fontSize: { xs: 22, sm: 24 } }} />
                    </IconButton>
                    <Box
                        component={motion.div}
                        initial={{ scale: 0.95, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#fff",
                            borderRadius: 50,
                            px: { xs: 1.5, sm: 2.5 },
                            py: { xs: 0.8, sm: 1.2 },
                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            minHeight: { xs: 46, sm: 48 },
                            // Android fix: prevent clipping
                            minWidth: 0,
                            overflow: "hidden",
                            boxSizing: "border-box",
                        }}
                    >
                        <Search sx={{ color: "#2E7D32", mr: { xs: 0.8, sm: 1.5 }, fontSize: { xs: 18, sm: 22 }, flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search products, brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && searchQuery.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    setSearchOpen(false);
                                    setSearchQuery("");
                                }
                            }}
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                // Font-size >= 16px prevents iOS auto-zoom
                                fontSize: "16px",
                                fontFamily: "inherit",
                                background: "transparent",
                                color: "#333",
                                // Android fix: prevent clipping
                                minWidth: 0,
                                width: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                boxSizing: "border-box",
                                WebkitAppearance: "none",
                                WebkitTapHighlightColor: "transparent",
                            }}
                            enterKeyHint="search"
                        />
                        {searchQuery && (
                            <IconButton
                                onClick={() => setSearchQuery("")}
                                size="small"
                                sx={{
                                    p: 0.5,
                                    color: "#9e9e9e",
                                    minWidth: 32,
                                    minHeight: 32,
                                    flexShrink: 0,
                                    WebkitTapHighlightColor: "transparent",
                                    "&:active": { color: "#666" },
                                }}
                            >
                                <Close sx={{ fontSize: 16 }} />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* Scrollable Content Area - Improved for Android */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        bgcolor: "#fff",
                        // Safe area padding for bottom
                        pb: "max(20px, env(safe-area-inset-bottom))",
                    }}
                >
                    {/* 🔍 Search Suggestions - API-based recommendations */}
                    {searchQuery.length >= 2 && (
                        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                            {searchLoading ? (
                                <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                                    Searching...
                                </Typography>
                            ) : (
                                <>
                                    {/* Category Suggestions */}
                                    {searchSuggestions.categories.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                variant="overline"
                                                sx={{
                                                    color: "#2E7D32",
                                                    fontWeight: 700,
                                                    letterSpacing: 1.5,
                                                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                                    display: "block",
                                                    mb: 1,
                                                }}
                                            >
                                                Categories
                                            </Typography>
                                            {searchSuggestions.categories.map((cat) => (
                                                <Box
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setSearchOpen(false);
                                                        setSearchQuery("");
                                                        setTimeout(() => {
                                                            navigate(`/category?category=${cat.id}`);
                                                            setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 150);
                                                        }, 50);
                                                    }}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        "&:active": { bgcolor: "#e8f5e9" },
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: "1.2rem" }}>{cat.icon || "📦"}</Typography>
                                                    <Typography sx={{ fontWeight: 600 }}>{cat.name}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    {/* Product Suggestions */}
                                    {searchSuggestions.products.length > 0 && (
                                        <Box>
                                            <Typography
                                                variant="overline"
                                                sx={{
                                                    color: "#2E7D32",
                                                    fontWeight: 700,
                                                    letterSpacing: 1.5,
                                                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                                    display: "block",
                                                    mb: 1,
                                                }}
                                            >
                                                Products
                                            </Typography>
                                            {searchSuggestions.products.map((product) => (
                                                <Box
                                                    key={product._id}
                                                    onClick={() => {
                                                        setSearchOpen(false);
                                                        setSearchQuery("");
                                                        setTimeout(() => {
                                                            navigate(`/product/${product._id}`);
                                                            setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 150);
                                                        }, 50);
                                                    }}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1.5,
                                                        "&:active": { bgcolor: "#f5f5f5" },
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={getImageUrl(product.primaryImage || product.image || product.images?.[0])}
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 1,
                                                            objectFit: "cover",
                                                            bgcolor: "#f5f5f5",
                                                        }}
                                                    />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: "0.9rem",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                        <Typography sx={{ color: "#2E7D32", fontWeight: 700, fontSize: "0.85rem" }}>
                                                            ₹{product.basePrice?.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                    <ChevronRight sx={{ color: "#bdbdbd" }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    {/* No results */}
                                    {searchSuggestions.categories.length === 0 && searchSuggestions.products.length === 0 && (
                                        <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                                            No results found for "{searchQuery}"
                                        </Typography>
                                    )}
                                </>
                            )}
                        </Box>
                    )}

                    {/* Quick Actions - Show when not actively searching */}
                    {searchQuery.length < 2 && (
                        <>
                            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: "#2E7D32",
                                        fontWeight: 700,
                                        letterSpacing: 1.5,
                                        fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                        display: "block",
                                        mb: { xs: 1.2, sm: 1.5 },
                                    }}
                                >
                                    Quick Actions
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: { xs: 0.8, sm: 1 },
                                    }}
                                >
                                    {[
                                        { label: "🔥 Trending", path: "/category?trending=true", color: "#fff3e0" },
                                        { label: "⭐ Best Offers", path: "/products?isBestOffer=true", color: "#e8f5e9" },
                                        { label: "🛍️ All Products", path: "/products", color: "#e3f2fd" },
                                        { label: "❤️ Wishlist", action: () => { openWishlist(); setSearchOpen(false); }, color: "#fce4ec" },
                                    ].map((item) => (
                                        <Box
                                            key={item.label}
                                            component={motion.div}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (item.action) {
                                                    item.action();
                                                } else {
                                                    navigate(item.path);
                                                    setSearchOpen(false);
                                                }
                                            }}
                                            sx={{
                                                px: { xs: 1.5, sm: 2 },
                                                py: { xs: 1, sm: 1.2 },
                                                bgcolor: item.color,
                                                borderRadius: 25,
                                                cursor: "pointer",
                                                fontSize: { xs: "0.8rem", sm: "0.85rem" },
                                                fontWeight: 600,
                                                transition: "all 0.15s",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                                minHeight: { xs: 40, sm: 44 },
                                                display: "flex",
                                                alignItems: "center",
                                                "&:active": {
                                                    transform: "scale(0.97)",
                                                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                                },
                                            }}
                                        >
                                            {item.label}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <Divider sx={{ mx: { xs: 1.5, sm: 2 } }} />

                            {/* Categories - Better mobile touch targets */}
                            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: "#2E7D32",
                                        fontWeight: 700,
                                        letterSpacing: 1.5,
                                        fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                        display: "block",
                                        mb: { xs: 1, sm: 1.5 },
                                    }}
                                >
                                    Browse Categories
                                </Typography>
                                <List disablePadding>
                                    {categories.slice(0, 12).map((cat, idx) => (
                                        <ListItem
                                            key={cat.id || idx}
                                            component={motion.div}
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.025 }}
                                            onClick={() => {
                                                setSearchOpen(false);
                                                setTimeout(() => {
                                                    navigate(`/category?category=${cat.id}`);
                                                    setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 150);
                                                }, 50);
                                            }}
                                            sx={{
                                                py: { xs: 1.2, sm: 1.5 },
                                                px: { xs: 1.2, sm: 1.5 },
                                                cursor: "pointer",
                                                borderRadius: { xs: 2, sm: 3 },
                                                mb: { xs: 0.3, sm: 0.5 },
                                                minHeight: { xs: 52, sm: 56 },
                                                transition: "all 0.15s",
                                                "&:active": {
                                                    bgcolor: "#e8f5e9",
                                                    transform: "scale(0.98)",
                                                },
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 }, fontSize: { xs: "1.2rem", sm: "1.4rem" } }}>
                                                {cat.icon || "📦"}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={cat.name}
                                                primaryTypographyProps={{
                                                    fontWeight: 600,
                                                    fontSize: { xs: "0.9rem", sm: "0.95rem" },
                                                    noWrap: true,
                                                }}
                                            />
                                            <ChevronRight sx={{ color: "#bdbdbd", fontSize: { xs: 18, sm: 20 } }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </>
                    )}
                </Box>
            </Drawer>
        </>
    );
};

export default MobileBottomNav;

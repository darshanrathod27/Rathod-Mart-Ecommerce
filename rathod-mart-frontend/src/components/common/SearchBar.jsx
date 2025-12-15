// src/components/common/SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  InputBase,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Drawer,
} from "@mui/material";
import {
  Search,
  TrendingUp,
  Category,
  Store,
  Close,
  NorthWest,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";
import api from "../../data/api";

const API_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

const SearchBar = ({ categories = [] }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // 🎯 Responsive Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  // eslint-disable-next-line no-unused-vars
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600-900px

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // Click outside handler for desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const matchedCats = categories
          .filter((c) =>
            c.name.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 3);

        const products = await api.fetchProducts({
          search: debouncedQuery,
          limit: 5,
        });

        setSuggestions({
          categories: matchedCats,
          products: products || [],
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, categories]);

  // Auto-focus on mobile drawer open
  useEffect(() => {
    if (showMobileSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showMobileSearch]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsFocused(false);
      setShowMobileSearch(false);
    }
  };

  const handleTrendingClick = (tag) => {
    setQuery(tag);
    navigate(`/search?q=${encodeURIComponent(tag)}`);
    setIsFocused(false);
    setShowMobileSearch(false);
  };

  const handleCategoryClick = (catId) => {
    navigate(`/category?category=${catId}`);
    setIsFocused(false);
    setShowMobileSearch(false);
    setQuery("");
  };

  const handleProductClick = (prodId) => {
    navigate(`/product/${prodId}`);
    setIsFocused(false);
    setShowMobileSearch(false);
    setQuery("");
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  const trendingTags = [
    "Smartphones",
    "Running Shoes",
    "Wireless Earbuds",
    "Kurtas",
    "Home Decor",
  ];

  // 📱 Mobile Search Drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Search Icon/Bar Trigger */}
        <Box
          onClick={() => setShowMobileSearch(true)}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 400 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: "2px 15px",
              display: "flex",
              alignItems: "center",
              borderRadius: "50px",
              border: "1px solid rgba(0,0,0,0.1)",
              bgcolor: "rgba(255,255,255,0.9)",
              height: { xs: 42, sm: 46 },
              cursor: "pointer",
              "&:active": {
                bgcolor: "rgba(0,0,0,0.05)",
              },
            }}
          >
            <Search color="action" sx={{ fontSize: { xs: 20, sm: 22 } }} />
            <Typography
              sx={{
                ml: 2,
                flex: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                color: "text.secondary",
              }}
            >
              Search products...
            </Typography>
          </Paper>
        </Box>

        {/* Mobile Full-Screen Search Drawer - Fixed for All Devices */}
        <Drawer
          anchor="top"
          open={showMobileSearch}
          onClose={() => {
            setShowMobileSearch(false);
            setQuery("");
            setSuggestions({ products: [], categories: [] });
          }}
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
              bgcolor: "background.default",
              borderRadius: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          }}
          transitionDuration={250}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Mobile Search Header - Fixed for All Devices */}
            <Box
              sx={{
                // Safe area padding for notched phones
                pt: "max(12px, env(safe-area-inset-top))",
                px: { xs: 1.5, sm: 2 },
                pb: { xs: 1.5, sm: 2 },
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                flexShrink: 0,
                minHeight: { xs: 70, sm: 80 },
              }}
            >
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.8, sm: 1 },
                }}
              >
                <IconButton
                  onClick={() => {
                    setShowMobileSearch(false);
                    setQuery("");
                    setSuggestions({ products: [], categories: [] });
                  }}
                  sx={{
                    p: { xs: 0.8, sm: 1 },
                    minWidth: { xs: 44, sm: 44 },
                    minHeight: { xs: 44, sm: 44 },
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <ArrowBack sx={{ fontSize: { xs: 22, sm: 24 } }} />
                </IconButton>

                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: { xs: "3px 12px", sm: "4px 15px" },
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "50px",
                    border: "2px solid",
                    borderColor: "primary.main",
                    bgcolor: "background.paper",
                    height: { xs: 48, sm: 48 },
                  }}
                >
                  <Search color="primary" sx={{ fontSize: { xs: 20, sm: 22 } }} />
                  <InputBase
                    ref={inputRef}
                    sx={{
                      ml: { xs: 1, sm: 2 },
                      flex: 1,
                      // iOS fix: font-size >= 16px prevents auto-zoom on focus
                      fontSize: "16px",
                      "& input": {
                        WebkitAppearance: "none",
                        WebkitTapHighlightColor: "transparent",
                      },
                      "& input::placeholder": {
                        fontSize: "14px",
                      },
                    }}
                    placeholder="Search for products, brands..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    // Removed autoFocus - doesn't work on iOS without user gesture
                    inputProps={{
                      style: {
                        WebkitAppearance: "none",
                      },
                    }}
                  />
                  {query && (
                    <IconButton
                      onClick={() => {
                        setQuery("");
                        setSuggestions({ products: [], categories: [] });
                      }}
                      size="small"
                      sx={{
                        p: { xs: 0.4, sm: 0.5 },
                        minWidth: 36,
                        minHeight: 36,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Close sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                  )}
                  {loading && <CircularProgress size={isSmallMobile ? 18 : 20} sx={{ ml: 1 }} />}
                </Paper>
              </Box>
            </Box>

            {/* Mobile Search Results - Enhanced */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                bgcolor: "background.default",
                WebkitOverflowScrolling: "touch",
                // Safe area for bottom notch
                pb: "max(16px, env(safe-area-inset-bottom))",
              }}
            >
              {!query && (
                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.8, sm: 1 },
                      fontWeight: 600,
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    }}
                  >
                    <TrendingUp sx={{ fontSize: { xs: 18, sm: 20 } }} color="primary" /> Trending Now
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, sm: 1.5 } }}>
                    {trendingTags.map((tag) => (
                      <Box
                        key={tag}
                        onClick={() => handleTrendingClick(tag)}
                        sx={{
                          px: { xs: 1.8, sm: 2.5 },
                          py: { xs: 0.8, sm: 0.8 },
                          bgcolor: "rgba(46, 125, 50, 0.08)",
                          borderRadius: 50,
                          cursor: "pointer",
                          fontSize: { xs: "0.82rem", sm: "0.9rem" },
                          fontWeight: 500,
                          color: "primary.dark",
                          transition: "all 0.15s",
                          minHeight: { xs: 40, sm: 44 },
                          display: "flex",
                          alignItems: "center",
                          "&:active": {
                            bgcolor: "primary.main",
                            color: "white",
                            transform: "scale(0.96)",
                          },
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {query && (
                <List disablePadding>
                  {/* Categories Section */}
                  {suggestions.categories.length > 0 && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          display: "block",
                          bgcolor: "#f9fafb",
                          fontWeight: 700,
                          color: "text.secondary",
                          letterSpacing: 0.5,
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        }}
                      >
                        CATEGORIES
                      </Typography>
                      {suggestions.categories.map((cat) => (
                        <ListItemButton
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          sx={{
                            px: 2.5,
                            py: 1.5,
                            minHeight: 56,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Category fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={cat.name}
                            primaryTypographyProps={{
                              fontWeight: 500,
                              fontSize: { xs: "0.9rem", sm: "0.95rem" },
                            }}
                            secondary="Browse Category"
                            secondaryTypographyProps={{
                              fontSize: { xs: "0.75rem", sm: "0.8rem" },
                            }}
                          />
                          <NorthWest
                            fontSize="small"
                            color="action"
                            sx={{ transform: "rotate(90deg)", opacity: 0.5 }}
                          />
                        </ListItemButton>
                      ))}
                      <Divider />
                    </>
                  )}

                  {/* Products Section */}
                  {suggestions.products.length > 0 && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          display: "block",
                          bgcolor: "#f9fafb",
                          fontWeight: 700,
                          color: "text.secondary",
                          letterSpacing: 0.5,
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        }}
                      >
                        PRODUCTS
                      </Typography>
                      {suggestions.products.map((prod) => (
                        <ListItemButton
                          key={prod._id}
                          onClick={() => handleProductClick(prod._id)}
                          sx={{
                            px: 2.5,
                            py: 1.2,
                            minHeight: 64,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: { xs: 52, sm: 56 } }}>
                            <Avatar
                              variant="rounded"
                              src={getImageUrl(prod.primaryImage || prod.image)}
                              alt={prod.name}
                              sx={{
                                width: { xs: 38, sm: 40 },
                                height: { xs: 38, sm: 40 },
                                borderRadius: 2,
                                bgcolor: "grey.100",
                              }}
                            >
                              <Store />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                sx={{
                                  maxWidth: { xs: 180, sm: 250 },
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                }}
                              >
                                {prod.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                              >
                                {prod.brand ? `${prod.brand} • ` : ""}
                                {prod.category?.name || "Item"}
                              </Typography>
                            }
                          />
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="primary.main"
                            sx={{
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            }}
                          >
                            ₹
                            {(
                              prod.discountPrice || prod.basePrice
                            ).toLocaleString()}
                          </Typography>
                        </ListItemButton>
                      ))}
                    </>
                  )}

                  {/* No Results */}
                  {!loading &&
                    suggestions.categories.length === 0 &&
                    suggestions.products.length === 0 && (
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                        >
                          No results found for "<strong>{query}</strong>"
                        </Typography>
                      </Box>
                    )}

                  {/* See All Results Button */}
                  {(suggestions.products.length > 0 ||
                    suggestions.categories.length > 0) && (
                      <ListItemButton
                        sx={{
                          justifyContent: "center",
                          bgcolor: "primary.50",
                          py: 1.8,
                          minHeight: 56,
                          "&:active": {
                            bgcolor: "primary.100",
                          },
                        }}
                        onClick={handleSubmit}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="primary.dark"
                          sx={{
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          See all results for "{query}"
                        </Typography>
                      </ListItemButton>
                    )}
                </List>
              )}
            </Box>
          </Box>
        </Drawer>
      </>
    );
  }

  // 🖥️ Desktop Search Bar
  return (
    <Box
      ref={wrapperRef}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: "relative",
        width: { xs: "100%", md: 500 },
        maxWidth: "100%",
        zIndex: 1200,
      }}
    >
      <Paper
        elevation={isFocused ? 4 : 0}
        sx={{
          p: "2px 15px",
          display: "flex",
          alignItems: "center",
          borderRadius: "50px",
          border: `1px solid ${isFocused ? theme.palette.primary.main : "rgba(0,0,0,0.1)"
            }`,
          bgcolor: isFocused ? "background.paper" : "rgba(255,255,255,0.9)",
          transition: "all 0.3s ease",
          height: 48,
        }}
      >
        <Search color={isFocused ? "primary" : "action"} />
        <InputBase
          sx={{ ml: 2, flex: 1, fontSize: "1rem" }}
          placeholder="Search for products, brands and more..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {query && (
          <IconButton onClick={() => setQuery("")} size="small" sx={{ p: 0.5 }}>
            <Close fontSize="small" />
          </IconButton>
        )}
        {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
      </Paper>

      {/* Desktop Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
            }}
          >
            <Paper
              elevation={8}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                maxHeight: "80vh",
                overflowY: "auto",
                bgcolor: "background.paper",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {!query && (
                <Box sx={{ p: 2.5 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontWeight: 600,
                    }}
                  >
                    <TrendingUp fontSize="small" color="primary" /> Trending Now
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {trendingTags.map((tag) => (
                      <Box
                        key={tag}
                        onClick={() => handleTrendingClick(tag)}
                        sx={{
                          px: 2.5,
                          py: 0.8,
                          bgcolor: "rgba(46, 125, 50, 0.08)",
                          borderRadius: 50,
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color: "primary.dark",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {query && (
                <List disablePadding>
                  {suggestions.categories.length > 0 && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          display: "block",
                          bgcolor: "#f9fafb",
                          fontWeight: 700,
                          color: "text.secondary",
                          letterSpacing: 0.5,
                        }}
                      >
                        CATEGORIES
                      </Typography>
                      {suggestions.categories.map((cat) => (
                        <ListItemButton
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          sx={{ px: 2.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Category fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={cat.name}
                            primaryTypographyProps={{ fontWeight: 500 }}
                            secondary="Browse Category"
                          />
                          <NorthWest
                            fontSize="small"
                            color="action"
                            sx={{ transform: "rotate(90deg)", opacity: 0.5 }}
                          />
                        </ListItemButton>
                      ))}
                      <Divider />
                    </>
                  )}

                  {suggestions.products.length > 0 && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          display: "block",
                          bgcolor: "#f9fafb",
                          fontWeight: 700,
                          color: "text.secondary",
                          letterSpacing: 0.5,
                        }}
                      >
                        PRODUCTS
                      </Typography>
                      {suggestions.products.map((prod) => (
                        <ListItemButton
                          key={prod._id}
                          onClick={() => handleProductClick(prod._id)}
                          sx={{ px: 2.5, py: 1 }}
                        >
                          <ListItemIcon sx={{ minWidth: 56 }}>
                            <Avatar
                              variant="rounded"
                              src={getImageUrl(prod.primaryImage || prod.image)}
                              alt={prod.name}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "grey.100",
                              }}
                            >
                              <Store />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                sx={{ maxWidth: 300 }}
                              >
                                {prod.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {prod.brand ? `${prod.brand} • ` : ""}
                                {prod.category?.name || "Item"}
                              </Typography>
                            }
                          />
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="primary.main"
                          >
                            ₹
                            {(
                              prod.discountPrice || prod.basePrice
                            ).toLocaleString()}
                          </Typography>
                        </ListItemButton>
                      ))}
                    </>
                  )}

                  {!loading &&
                    suggestions.categories.length === 0 &&
                    suggestions.products.length === 0 && (
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          No results found for "<strong>{query}</strong>"
                        </Typography>
                      </Box>
                    )}

                  {(suggestions.products.length > 0 ||
                    suggestions.categories.length > 0) && (
                      <ListItemButton
                        sx={{
                          justifyContent: "center",
                          bgcolor: "primary.50",
                          py: 1.5,
                          "&:hover": { bgcolor: "primary.100" },
                        }}
                        onClick={handleSubmit}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="primary.dark"
                        >
                          See all results for "{query}"
                        </Typography>
                      </ListItemButton>
                    )}
                </List>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SearchBar;

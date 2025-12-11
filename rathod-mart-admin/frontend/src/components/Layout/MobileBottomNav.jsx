import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Avatar,
  Typography,
} from "@mui/material";
import {
  People,
  Category,
  Inventory,
  MoreHoriz,
  Close,
  Search,
  Palette,
  Straighten,
  Tune,
  Warehouse,
  LocalOffer,
  TrendingUp,
  Dashboard,
  FilterList,
} from "@mui/icons-material";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { scrollY } = useScroll();

  const backgroundOpacity = useTransform(scrollY, [0, 100], [0.95, 0.98]);

  // Main Navigation Items (Bottom Bar)
  const navigationItems = [
    { label: "Inventory", value: "/inventory", icon: Warehouse },
    { label: "Users", value: "/users", icon: People, badge: 4 },
    { label: "Products", value: "/products", icon: Inventory },
    { label: "More", value: "more", icon: MoreHoriz, isMore: true },
  ];

  // More Menu Items (Organized by Category)
  const moreMenuItems = [
    {
      category: "Product Management",
      items: [
        { label: "Categories", value: "/categories", icon: Category },
        { label: "Products", value: "/products", icon: Inventory },
      ],
    },
    {
      category: "Product Configuration",
      items: [
        { label: "Size Mapping", value: "/size-mapping", icon: Straighten },
        { label: "Color Mapping", value: "/color-mapping", icon: Palette },
        { label: "Variant Master", value: "/variant-master", icon: Tune },
      ],
    },
    {
      category: "Inventory & Promotions",
      items: [
        { label: "Inventory Master", value: "/inventory", icon: Warehouse },
        { label: "Promocodes", value: "/promocodes", icon: LocalOffer },
      ],
    },
  ];

  // Flatten all menu items for search
  const allMenuItems = moreMenuItems.flatMap((group) => group.items);

  // Filter items based on search
  const filteredMenuItems = searchQuery
    ? allMenuItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : null;

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (
        currentScrollY < lastScrollY ||
        currentScrollY + windowHeight >= documentHeight - 50
      ) {
        setIsVisible(true);
      } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const getCurrentValue = () => {
    const currentPath = location.pathname;
    const item = navigationItems.find((item) => item.value === currentPath);
    return item ? currentPath : "/inventory";
  };

  const handleChange = (event, newValue) => {
    if (newValue === "more") {
      setMoreMenuOpen(true);
    } else {
      navigate(newValue);
    }
  };

  const handleMenuItemClick = (value) => {
    navigate(value);
    setMoreMenuOpen(false);
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <>
      {/* Main Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{
          y: isVisible ? 0 : 100,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          },
        }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: { xs: "block", md: "none" },
        }}
      >
        <Paper
          sx={{
            position: "relative",
            borderTop: "1px solid rgba(76, 175, 80, 0.2)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px) saturate(180%)",
            overflow: "hidden",
          }}
          elevation={8}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(180deg, rgba(241, 248, 233, 0.8) 0%, rgba(232, 245, 232, 0.9) 100%)
              `,
              pointerEvents: "none",
            }}
          />

          {/* Floating Particles */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  width: "3px",
                  height: "3px",
                  background: "rgba(76, 175, 80, 0.4)",
                  borderRadius: "50%",
                  left: `${15 + i * 25}%`,
                  top: "20%",
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </Box>

          <BottomNavigation
            value={getCurrentValue()}
            onChange={handleChange}
            showLabels
            sx={{
              background: "transparent",
              position: "relative",
              zIndex: 1,
              "& .MuiBottomNavigationAction-root": {
                color: "text.secondary",
                transition: "all 0.3s ease",
                minWidth: 0,
                padding: "6px 12px",
                "&.Mui-selected": {
                  color: "primary.main",
                  "& .MuiBottomNavigationAction-label": {
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  },
                },
                "&:hover": {
                  color: "primary.light",
                  transform: "translateY(-2px)",
                },
              },
            }}
          >
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = getCurrentValue() === item.value;

              return (
                <BottomNavigationAction
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  icon={
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        rotate: item.isMore ? [0, -10, 10, 0] : 0,
                      }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.1 },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* Active Indicator Background */}
                        {isSelected && !item.isMore && (
                          <motion.div
                            layoutId="activeBackground"
                            style={{
                              position: "absolute",
                              top: -8,
                              left: -8,
                              right: -8,
                              bottom: -8,
                              background: "rgba(76, 175, 80, 0.1)",
                              borderRadius: "50%",
                              border: "2px solid rgba(76, 175, 80, 0.3)",
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          />
                        )}

                        {/* Icon with Badge */}
                        {item.badge ? (
                          <Badge
                            badgeContent={item.badge}
                            color="primary"
                            sx={{
                              "& .MuiBadge-badge": {
                                animation: isSelected
                                  ? "pulse 1.5s infinite"
                                  : "none",
                                "@keyframes pulse": {
                                  "0%": { transform: "scale(1)" },
                                  "50%": { transform: "scale(1.3)" },
                                  "100%": { transform: "scale(1)" },
                                },
                              },
                            }}
                          >
                            <Icon
                              sx={{
                                fontSize: isSelected ? 24 : 22,
                                transition: "all 0.3s ease",
                                filter: isSelected
                                  ? "drop-shadow(0 2px 4px rgba(76, 175, 80, 0.4))"
                                  : "none",
                              }}
                            />
                          </Badge>
                        ) : (
                          <Icon
                            sx={{
                              fontSize: isSelected ? 24 : 22,
                              transition: "all 0.3s ease",
                              filter: isSelected
                                ? "drop-shadow(0 2px 4px rgba(76, 175, 80, 0.4))"
                                : "none",
                            }}
                          />
                        )}

                        {/* More Menu Indicator */}
                        {item.isMore && (
                          <motion.div
                            animate={{
                              rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{
                              position: "absolute",
                              top: -4,
                              right: -4,
                              width: 8,
                              height: 8,
                              background:
                                "linear-gradient(135deg, #4CAF50, #81C784)",
                              borderRadius: "50%",
                              border: "1.5px solid white",
                            }}
                          />
                        )}
                      </Box>
                    </motion.div>
                  }
                  sx={{
                    minWidth: "auto",
                    transition: "all 0.3s ease",
                    "&.Mui-selected": {
                      transform: !item.isMore ? "translateY(-3px)" : "none",
                    },
                  }}
                />
              );
            })}
          </BottomNavigation>

          {/* Bottom Glow Effect */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(76, 175, 80, 0.5) 50%, transparent 100%)",
            }}
          />
        </Paper>
      </motion.div>

      {/* More Menu Drawer */}
      <Drawer
        anchor="bottom"
        open={moreMenuOpen}
        onClose={() => {
          setMoreMenuOpen(false);
          setSearchQuery("");
          setSearchOpen(false);
        }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "85vh",
            background: "linear-gradient(180deg, #F1F8E9 0%, #FFFFFF 100%)",
          },
        }}
      >
        <Box sx={{ width: "100%", position: "relative" }}>
          {/* Header */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(76, 175, 80, 0.1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <TrendingUp />
                  </Avatar>
                </motion.div>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    More Options
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quick access to all features
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={() => setSearchOpen(!searchOpen)}
                  sx={{
                    bgcolor: searchOpen ? "primary.main" : "background.paper",
                    color: searchOpen ? "white" : "primary.main",
                    "&:hover": {
                      bgcolor: searchOpen ? "primary.dark" : "action.hover",
                    },
                  }}
                >
                  <Search fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  sx={{
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Search Bar */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ px: 2, pb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search features..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setSearchQuery("")}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: "background.paper",
                          "&:hover": {
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Menu Content */}
          <Box sx={{ p: 2, pb: 4 }}>
            {/* Search Results */}
            {filteredMenuItems ? (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <FilterList color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Search Results ({filteredMenuItems.length})
                  </Typography>
                </Box>

                {filteredMenuItems.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {filteredMenuItems.map((item, index) => (
                      <motion.div
                        key={item.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ListItem
                          button
                          onClick={() => handleMenuItemClick(item.value)}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor:
                              location.pathname === item.value
                                ? "rgba(76, 175, 80, 0.1)"
                                : "background.paper",
                            border: "1px solid",
                            borderColor:
                              location.pathname === item.value
                                ? "primary.main"
                                : "divider",
                            "&:hover": {
                              bgcolor: "rgba(76, 175, 80, 0.05)",
                              transform: "translateX(8px)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          <ListItemIcon>
                            <item.icon
                              color={
                                location.pathname === item.value
                                  ? "primary"
                                  : "action"
                              }
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontWeight:
                                location.pathname === item.value ? 600 : 400,
                              color:
                                location.pathname === item.value
                                  ? "primary.main"
                                  : "text.primary",
                            }}
                          />
                          {location.pathname === item.value && (
                            <Chip
                              label="Active"
                              size="small"
                              color="primary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </ListItem>
                      </motion.div>
                    ))}
                  </List>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <Search sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2">No results found</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              // Grouped Menu Items
              <>
                {moreMenuItems.map((group, groupIndex) => (
                  <motion.div
                    key={group.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 4,
                            height: 16,
                            bgcolor: "primary.main",
                            borderRadius: 1,
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="primary"
                        >
                          {group.category}
                        </Typography>
                      </Box>

                      <List sx={{ p: 0 }}>
                        {group.items.map((item, index) => (
                          <motion.div
                            key={item.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ListItem
                              button
                              onClick={() => handleMenuItemClick(item.value)}
                              sx={{
                                borderRadius: 2,
                                mb: 1,
                                bgcolor:
                                  location.pathname === item.value
                                    ? "rgba(76, 175, 80, 0.1)"
                                    : "background.paper",
                                border: "1px solid",
                                borderColor:
                                  location.pathname === item.value
                                    ? "primary.main"
                                    : "divider",
                                "&:hover": {
                                  bgcolor: "rgba(76, 175, 80, 0.05)",
                                  transform: "translateX(8px)",
                                  boxShadow:
                                    "0 4px 12px rgba(76, 175, 80, 0.15)",
                                },
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            >
                              <ListItemIcon>
                                <motion.div
                                  animate={{
                                    rotate:
                                      location.pathname === item.value
                                        ? [0, -10, 10, 0]
                                        : 0,
                                  }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <item.icon
                                    color={
                                      location.pathname === item.value
                                        ? "primary"
                                        : "action"
                                    }
                                    sx={{
                                      filter:
                                        location.pathname === item.value
                                          ? "drop-shadow(0 2px 4px rgba(76, 175, 80, 0.4))"
                                          : "none",
                                    }}
                                  />
                                </motion.div>
                              </ListItemIcon>
                              <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                  fontWeight:
                                    location.pathname === item.value
                                      ? 600
                                      : 400,
                                  color:
                                    location.pathname === item.value
                                      ? "primary.main"
                                      : "text.primary",
                                }}
                              />
                              {location.pathname === item.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                  }}
                                >
                                  <Chip
                                    label="Active"
                                    size="small"
                                    color="primary"
                                    sx={{
                                      height: 20,
                                      fontWeight: 600,
                                    }}
                                  />
                                </motion.div>
                              )}
                            </ListItem>
                          </motion.div>
                        ))}
                      </List>
                    </Box>

                    {groupIndex < moreMenuItems.length - 1 && (
                      <Divider sx={{ my: 2 }} />
                    )}
                  </motion.div>
                ))}
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileBottomNav;

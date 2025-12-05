import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Divider,
  Chip,
  LinearProgress,
  Paper,
  Collapse,
  Badge,
} from "@mui/material";
import {
  Dashboard,
  People,
  Category,
  Inventory,
  AspectRatio,
  Palette,
  ViewInAr,
  Inventory2,
  LocalOffer,
  ExpandLess,
  ExpandMore,
  Close,
  TrendingUp,
  ShoppingCart,
  Logout,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const ResponsiveSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    config: true,
    inventory: true,
  });

  // Navigation Structure
  const navigationStructure = [
    {
      section: "main",
      title: "Main Menu",
      items: [
        { label: "Dashboard", path: "/users", icon: Dashboard },
        { label: "Users Management", path: "/users", icon: People, badge: 4 },
        { label: "Categories", path: "/categories", icon: Category },
        { label: "Products", path: "/products", icon: Inventory },
      ],
    },
    {
      section: "config",
      title: "Product Configuration",
      expandable: true,
      items: [
        {
          label: "Size Mapping",
          path: "/product-size-mapping",
          icon: AspectRatio,
        },
        {
          label: "Color Mapping",
          path: "/product-color-mapping",
          icon: Palette,
        },
        { label: "Variant Master", path: "/variant-master", icon: ViewInAr },
      ],
    },
    {
      section: "inventory",
      title: "Stock & Promotions",
      expandable: true,
      items: [
        { label: "Inventory Master", path: "/inventory", icon: Inventory2 },
        { label: "Promocodes", path: "/promocodes", icon: LocalOffer },
      ],
    },
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 300,
          background: "linear-gradient(180deg, #F1F8E9 0%, #FFFFFF 100%)",
          borderRight: "none",
        },
      }}
      sx={{
        display: { xs: "block", md: "none" },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Sidebar Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Pattern */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Close Button */}
            <IconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              <Close />
            </IconButton>

            {/* Profile Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                position: "relative",
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "white",
                    color: "primary.main",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    border: "3px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  RM
                </Avatar>
              </motion.div>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Rathod Darshan
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Premium E-Commerce Platform
                </Typography>
              </Box>
            </Box>

            {/* System Status Card */}
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="caption" fontWeight="bold">
                  System Status
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#4CAF50",
                      }}
                    />
                  </motion.div>
                  <Typography variant="caption" fontWeight="bold">
                    98.5% Uptime
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={98.5}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "white",
                    borderRadius: 3,
                  },
                }}
              />
            </Paper>
          </Box>
        </motion.div>

        {/* Navigation Menu */}
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", p: 2 }}>
          {navigationStructure.map((section, sectionIndex) => (
            <motion.div
              key={section.section}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Box sx={{ mb: 3 }}>
                {/* Section Header */}
                {section.expandable ? (
                  <ListItem
                    button
                    onClick={() => toggleSection(section.section)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: "rgba(76, 175, 80, 0.05)",
                      "&:hover": { bgcolor: "rgba(76, 175, 80, 0.1)" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 20,
                          bgcolor: "primary.main",
                          borderRadius: 1,
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="primary"
                      >
                        {section.title}
                      </Typography>
                    </Box>
                    {expandedSections[section.section] ? (
                      <ExpandLess color="primary" />
                    ) : (
                      <ExpandMore color="primary" />
                    )}
                  </ListItem>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      px: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        bgcolor: "primary.main",
                        borderRadius: 1,
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="primary"
                    >
                      {section.title}
                    </Typography>
                  </Box>
                )}

                {/* Menu Items */}
                <Collapse
                  in={
                    section.expandable
                      ? expandedSections[section.section]
                      : true
                  }
                  timeout="auto"
                >
                  <List sx={{ p: 0 }}>
                    {section.items.map((item) => {
                      const active = isActive(item.path);
                      const IconComp = item.icon;
                      return (
                        <motion.div
                          key={item.path}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ListItem
                            button
                            onClick={() => handleNavigation(item.path)}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              position: "relative",
                              bgcolor: active
                                ? "rgba(76, 175, 80, 0.15)"
                                : "transparent",
                              border: "1px solid",
                              borderColor: active
                                ? "primary.main"
                                : "transparent",
                              "&:hover": {
                                bgcolor: active
                                  ? "rgba(76, 175, 80, 0.2)"
                                  : "rgba(76, 175, 80, 0.08)",
                                borderColor: "primary.light",
                                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
                              },
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            {/* Active Indicator */}
                            {active && (
                              <motion.div
                                layoutId="activeIndicator"
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  width: 4,
                                  height: "70%",
                                  background:
                                    "linear-gradient(180deg, #4CAF50, #66BB6A)",
                                  borderRadius: "0 4px 4px 0",
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                }}
                              />
                            )}

                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <motion.div
                                animate={{
                                  rotate: active ? [0, -10, 10, 0] : 0,
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                {item.badge ? (
                                  <Badge
                                    badgeContent={item.badge}
                                    color="primary"
                                    sx={{
                                      "& .MuiBadge-badge": {
                                        animation: active
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
                                    <IconComp
                                      sx={{
                                        color: active
                                          ? "primary.main"
                                          : "action.active",
                                        fontSize: 24,
                                        filter: active
                                          ? "drop-shadow(0 2px 4px rgba(76, 175, 80, 0.4))"
                                          : "none",
                                      }}
                                    />
                                  </Badge>
                                ) : (
                                  <IconComp
                                    sx={{
                                      color: active
                                        ? "primary.main"
                                        : "action.active",
                                      fontSize: 24,
                                      filter: active
                                        ? "drop-shadow(0 2px 4px rgba(76, 175, 80, 0.4))"
                                        : "none",
                                    }}
                                  />
                                )}
                              </motion.div>
                            </ListItemIcon>

                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontWeight: active ? 600 : 500,
                                color: active ? "primary.main" : "text.primary",
                                fontSize: "0.9rem",
                              }}
                            />

                            {active && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                <Chip
                                  label="Active"
                                  size="small"
                                  color="primary"
                                  sx={{
                                    height: 22,
                                    fontWeight: 600,
                                    fontSize: "0.7rem",
                                  }}
                                />
                              </motion.div>
                            )}
                          </ListItem>
                        </motion.div>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>

              {sectionIndex < navigationStructure.length - 1 && (
                <Divider
                  sx={{ my: 2, borderColor: "rgba(76, 175, 80, 0.1)" }}
                />
              )}
            </motion.div>
          ))}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "rgba(76, 175, 80, 0.1)",
            bgcolor: "rgba(76, 175, 80, 0.03)",
          }}
        >
          {/* Quick Stats */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              mb: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "rgba(76, 175, 80, 0.1)",
                borderRadius: 2,
              }}
            >
              <TrendingUp color="primary" sx={{ fontSize: 20, mb: 0.5 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                125
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Orders
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "rgba(76, 175, 80, 0.1)",
                borderRadius: 2,
              }}
            >
              <ShoppingCart color="primary" sx={{ fontSize: 20, mb: 0.5 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                45
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Products
              </Typography>
            </Paper>
          </Box>

          {/* Logout Button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <ListItem
              button
              onClick={() => {
                // Add logout logic
                onClose();
              }}
              sx={{
                borderRadius: 2,
                bgcolor: "rgba(244, 67, 54, 0.1)",
                border: "1px solid rgba(244, 67, 54, 0.3)",
                "&:hover": {
                  bgcolor: "rgba(244, 67, 54, 0.2)",
                  boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Logout sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "error.main",
                }}
              />
            </ListItem>
          </motion.div>

          {/* Copyright */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 2,
            }}
          >
            © 2025 Rathod Mart
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ResponsiveSidebar;

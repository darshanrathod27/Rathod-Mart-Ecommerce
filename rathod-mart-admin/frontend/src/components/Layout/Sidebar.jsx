// frontend/src/components/Layout/Sidebar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  People,
  Category,
  Inventory,
  Palette,
  AspectRatio,
  ViewInAr,
  Inventory2,
  AdminPanelSettings,
  TrendingUp,
  LocalOffer,
} from "@mui/icons-material";

const menuItems = [
  { text: "Users", icon: People, path: "/users" },
  { text: "Categories", icon: Category, path: "/categories" },
  { text: "Products", icon: Inventory, path: "/products" },
  { text: "Size Mapping", icon: AspectRatio, path: "/product-size-mapping" },
  { text: "Color Mapping", icon: Palette, path: "/product-color-mapping" },
  { text: "Variant Master", icon: ViewInAr, path: "/variant-master" },
  {
    text: "Inventory Master",
    icon: Inventory2,
    path: "/inventory",
  },
  {
    text: "Promocodes",
    icon: LocalOffer,
    path: "/promocodes",
  },
];

const Sidebar = ({
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
  isMobile,
  // isTablet removed - not used
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)",
      }}
    >
      {/* Enhanced Header */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating Elements */}
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            component={motion.div}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            sx={{
              position: "absolute",
              width: 60 + i * 20,
              height: 60 + i * 20,
              borderRadius: "50%",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              top: `${20 + i * 15}%`,
              right: `${-10 + i * 10}%`,
            }}
          />
        ))}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "white",
              color: "primary.main",
              fontWeight: 700,
              fontSize: "1.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            RM
          </Avatar>
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Rathod Mart
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                display: "block",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Premium E-Commerce Platform
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<AdminPanelSettings sx={{ fontSize: 16 }} />}
          label="Admin Panel"
          size="small"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.25)",
            color: "white",
            fontWeight: 600,
            border: "1px solid rgba(255, 255, 255, 0.3)",
            "& .MuiChip-icon": { color: "white" },
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.3)",
            },
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, overflowY: "auto" }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <ListItem
              key={item.path}
              disablePadding
              sx={{ mb: 0.5, px: 1 }}
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&.Mui-selected": {
                    background:
                      "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
                    color: "primary.main",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      background:
                        "linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%)",
                      borderRadius: "0 2px 2px 0",
                    },
                  },
                  "&:hover": {
                    background: "rgba(76, 175, 80, 0.08)",
                    transform: "translateX(6px)",
                    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.15)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.95rem",
                  }}
                />
                {/* Active Indicator */}
                {isActive && (
                  <Box
                    component={motion.div}
                    layoutId="activeIndicator"
                    sx={{
                      position: "absolute",
                      right: 8,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      boxShadow: "0 0 8px rgba(76, 175, 80, 0.6)",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Quick Actions */}
      <Box
        sx={{
          p: 1.5,
          mx: 2,
          my: 1,
          borderRadius: 2,
          bgcolor: "rgba(76, 175, 80, 0.05)",
        }}
      >
        <Typography 
          variant="caption" 
          fontWeight={600} 
          color="text.secondary"
          sx={{ display: "block", mb: 1, px: 0.5 }}
        >
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={1}>
          {/* Add Stock */}
          <Box
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation("/inventory")}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              p: 1,
              borderRadius: 1.5,
              bgcolor: "rgba(76, 175, 80, 0.1)",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "rgba(76, 175, 80, 0.2)",
              },
            }}
          >
            <Inventory2 sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="caption" fontWeight={600} color="primary.main" sx={{ fontSize: "0.65rem" }}>
              Add Stock
            </Typography>
          </Box>

          {/* Add Product */}
          <Box
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation("/products")}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              p: 1,
              borderRadius: 1.5,
              bgcolor: "rgba(33, 150, 243, 0.1)",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "rgba(33, 150, 243, 0.2)",
              },
            }}
          >
            <Inventory sx={{ color: "#2196F3", fontSize: 20 }} />
            <Typography variant="caption" fontWeight={600} sx={{ color: "#2196F3", fontSize: "0.65rem" }}>
              Products
            </Typography>
          </Box>

          {/* Promocodes */}
          <Box
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation("/promocodes")}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              p: 1,
              borderRadius: 1.5,
              bgcolor: "rgba(156, 39, 176, 0.1)",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "rgba(156, 39, 176, 0.2)",
              },
            }}
          >
            <LocalOffer sx={{ color: "#9C27B0", fontSize: 20 }} />
            <Typography variant="caption" fontWeight={600} sx={{ color: "#9C27B0", fontSize: "0.65rem" }}>
              Promos
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Enhanced Footer */}
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          background: "rgba(76, 175, 80, 0.02)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <TrendingUp sx={{ fontSize: 14, color: "primary.main" }} />© 2025
          Rathod Mart
        </Typography>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          border: "none",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.06)",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;


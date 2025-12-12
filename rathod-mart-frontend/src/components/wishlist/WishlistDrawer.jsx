import React, { useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Close,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Delete,
  ArrowForward,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const WishlistDrawer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Cart context for adding items to cart
  const { closeCart, addToCart, openCart } = useCart();

  const {
    isWishlistOpen,
    closeWishlist,
    wishlistItems,
    removeFromWishlist,
    getWishlistItemsCount,
  } = useWishlist();

  // Close cart when wishlist opens
  useEffect(() => {
    if (isWishlistOpen) {
      closeCart();
    }
  }, [isWishlistOpen, closeCart]);

  const totalCount = getWishlistItemsCount();

  // Add item from wishlist to cart
  const handleAddToCart = async (item) => {
    try {
      // Create product object for addToCart
      const product = {
        id: item.id,
        _id: item.id,
        name: item.name,
        image: item.image,
        images: [{ url: item.image, isPrimary: true }],
        basePrice: item.originalPrice || item.price,
        discountPrice: item.price,
        stock: 99, // Assume in stock
        totalStock: 99,
      };

      await addToCart(product, null, 1);

      // Remove from wishlist after adding to cart
      removeFromWishlist(item.id);

      toast.success("Moved to Cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isWishlistOpen}
      onClose={closeWishlist}
      sx={{
        zIndex: 1400,
      }}
      PaperProps={{
        sx: {
          width: { xs: "80%", sm: 400, md: 440 },
          maxWidth: 480,
          background: "linear-gradient(180deg, #F1F8E9 0%, #FFFFFF 100%)",
          borderLeft: "none",
          // Full height covering everything
          height: "100vh",
          top: 0,
          // Curved corners on LEFT side
          borderTopLeftRadius: { xs: 20, md: 32 },
          borderBottomLeftRadius: { xs: 20, md: 32 },
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header with GREEN gradient (same as cart) */}
        <Box
          sx={{
            p: 2.5,
            background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            borderTopLeftRadius: { xs: 20, md: 32 },
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

          {/* Close Button - Top Right Corner */}
          <IconButton
            onClick={closeWishlist}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              width: 36,
              height: 36,
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Logo and Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              position: "relative",
            }}
          >
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: "white",
                color: "primary.main",
                fontWeight: "bold",
                border: "3px solid rgba(255,255,255,0.3)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <Favorite sx={{ fontSize: 26 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                My Wishlist
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {totalCount} {totalCount === 1 ? "item" : "items"} saved
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Wishlist Items List */}
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", p: 2 }}>
          {wishlistItems.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
              }}
            >
              <FavoriteBorder
                sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Your wishlist is empty
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Save items you love
              </Typography>
              <Button
                variant="contained"
                onClick={closeWishlist}
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: 50,
                  px: 3,
                  py: 1,
                  background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                  fontWeight: 700,
                }}
              >
                Explore Products
              </Button>
            </Box>
          ) : (
            <AnimatePresence>
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 1.5,
                      p: 2,
                      borderRadius: 3,
                      border: "1px solid #e8f5e9",
                      background: "#fff",
                      transition: "all 0.3s",
                      "&:hover": {
                        boxShadow: "0 4px 16px rgba(46,125,50,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Avatar
                        src={item.image}
                        variant="rounded"
                        sx={{
                          width: 64,
                          height: 64,
                          border: "2px solid #E8F5E9",
                          borderRadius: 2,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          noWrap
                          sx={{ fontSize: "0.9rem", mb: 0.5 }}
                        >
                          {item.name}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Typography
                            fontWeight={700}
                            color="primary"
                            sx={{ fontSize: "1rem" }}
                          >
                            ₹{(item.price || 0).toLocaleString()}
                          </Typography>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <Typography
                              variant="caption"
                              sx={{
                                textDecoration: "line-through",
                                color: "text.disabled",
                              }}
                            >
                              ₹{item.originalPrice.toLocaleString()}
                            </Typography>
                          )}
                        </Box>

                        {/* Action Buttons */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
                            onClick={() => handleAddToCart(item)}
                            sx={{
                              flex: 1,
                              py: 0.75,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              background:
                                "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                              textTransform: "none",
                              borderRadius: 2,
                            }}
                          >
                            Add to Cart
                          </Button>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeFromWishlist(item.id)}
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: "rgba(244,67,54,0.1)",
                            }}
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </Box>

        {/* Footer Section */}
        <Box
          sx={{
            p: 2.5,
            borderTop: "1px solid",
            borderColor: "rgba(76, 175, 80, 0.15)",
            bgcolor: "#fff",
            borderBottomLeftRadius: { xs: 20, md: 32 },
          }}
        >
          {wishlistItems.length > 0 && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                closeWishlist();
                navigate("/products");
              }}
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                borderColor: "#4CAF50",
                color: "#2E7D32",
                borderWidth: 2,
                "&:hover": {
                  borderColor: "#2E7D32",
                  bgcolor: "rgba(76,175,80,0.05)",
                  borderWidth: 2,
                },
              }}
            >
              Continue Shopping
            </Button>
          )}

          {/* Copyright */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 2 }}
          >
            © 2025 Rathod Mart
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default WishlistDrawer;

import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Paper,
  Chip,
  TextField,
  Divider,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  ArrowForward,
  LocalOffer,
  ContentCopy,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useSelector } from "react-redux";
import api from "../../data/api";
import toast from "react-hot-toast";

const CartDrawer = () => {
  const navigate = useNavigate();
  const { closeWishlist } = useWishlist();

  // Check if user is logged in
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemsCount,
    appliedPromo,
    applyPromocode,
    removePromocode,
  } = useCart();

  // Close wishlist when cart opens
  useEffect(() => {
    if (isCartOpen) {
      closeWishlist();
    }
  }, [isCartOpen, closeWishlist]);

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  // Fetch available coupons when drawer opens - ONLY for logged in users
  useEffect(() => {
    if (isCartOpen && cartItems.length > 0 && isAuthenticated) {
      setCouponsLoading(true);
      api
        .fetchAvailableCoupons()
        .then((data) => setCoupons(data || []))
        .catch(() => setCoupons([]))
        .finally(() => setCouponsLoading(false));
    }
  }, [isCartOpen, cartItems.length, isAuthenticated]);

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  const handleApplyPromo = async (codeToApply) => {
    const code = codeToApply || promoInput;
    if (!code) return;

    setPromoLoading(true);
    try {
      await applyPromocode(code);
      setPromoInput("");
    } catch (err) {
      // Handled in context
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
    setPromoInput(code);
  };

  const { subtotal, total, discountAmount } = getCartTotal();
  const totalCount = getCartItemsCount();

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={closeCart}
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
        {/* Header with GREEN gradient */}
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
            onClick={closeCart}
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
              <ShoppingCartOutlined sx={{ fontSize: 26 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Shopping Cart
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Cart Items List */}
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", p: 2 }}>
          {cartItems.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
              }}
            >
              <ShoppingCartOutlined
                sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Your cart is empty
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Add items to get started
              </Typography>
              <Button
                variant="contained"
                onClick={closeCart}
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: 50,
                  px: 3,
                  py: 1,
                  background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                  fontWeight: 700,
                }}
              >
                Start Shopping
              </Button>
            </Box>
          ) : (
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.cartId}
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
                        <Typography
                          fontWeight={700}
                          color="primary"
                          sx={{ fontSize: "1rem" }}
                        >
                          ₹{item.price.toLocaleString()}
                        </Typography>

                        {/* Quantity Controls */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mt: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              bgcolor: "#f5f5f5",
                              borderRadius: 5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateQuantity(item.cartId, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              sx={{ width: 32, height: 32 }}
                            >
                              <Remove sx={{ fontSize: 18 }} />
                            </IconButton>
                            <Typography
                              sx={{
                                px: 1.5,
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                minWidth: 28,
                                textAlign: "center",
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateQuantity(item.cartId, item.quantity + 1)
                              }
                              sx={{ width: 32, height: 32 }}
                            >
                              <Add sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeFromCart(item.cartId)}
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

        {/* Footer Section with Promocodes */}
        {cartItems.length > 0 && (
          <Box
            sx={{
              p: 2.5,
              borderTop: "1px solid",
              borderColor: "rgba(76, 175, 80, 0.15)",
              bgcolor: "#fff",
              borderBottomLeftRadius: { xs: 20, md: 32 },
            }}
          >
            {/* Available Coupons Section */}
            {!appliedPromo && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Available Coupons:
                </Typography>
                {couponsLoading ? (
                  <Skeleton height={32} />
                ) : coupons.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                    {coupons.slice(0, 3).map((coupon) => (
                      <Chip
                        key={coupon.code}
                        label={coupon.code}
                        size="small"
                        icon={<LocalOffer sx={{ fontSize: 14 }} />}
                        deleteIcon={<ContentCopy sx={{ fontSize: 14 }} />}
                        onDelete={() => handleCopyCode(coupon.code)}
                        onClick={() => handleApplyPromo(coupon.code)}
                        sx={{
                          cursor: "pointer",
                          bgcolor: "rgba(76,175,80,0.1)",
                          "&:hover": { bgcolor: "rgba(76,175,80,0.2)" },
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    No coupons available
                  </Typography>
                )}
              </Box>
            )}

            {/* Promocode Input */}
            {!appliedPromo && (
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Enter Promocode"
                  fullWidth
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 44,
                      fontSize: "0.9rem",
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleApplyPromo()}
                  disabled={promoLoading || !promoInput}
                  sx={{
                    background: "#2E7D32",
                    minWidth: 85,
                    height: 44,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  {promoLoading ? <CircularProgress size={20} color="inherit" /> : "Apply"}
                </Button>
              </Box>
            )}

            {appliedPromo && (
              <Chip
                icon={<LocalOffer sx={{ fontSize: 16 }} />}
                label={`Code: ${appliedPromo.code} (-${appliedPromo.discount}%)`}
                onDelete={removePromocode}
                color="success"
                sx={{ mb: 2, width: "100%", justifyContent: "space-between", height: 40 }}
              />
            )}

            {/* Price Summary */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                ₹{subtotal.toFixed(2)}
              </Typography>
            </Box>

            {discountAmount > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                  color: "success.main",
                }}
              >
                <Typography variant="body2">Discount</Typography>
                <Typography variant="body2" fontWeight={600}>
                  - ₹{discountAmount.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2.5 }}>
              <Typography variant="h6" fontWeight={800}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary">
                ₹{total.toFixed(2)}
              </Typography>
            </Box>

            {/* Checkout Button */}
            <Button
              fullWidth
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={handleCheckout}
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                boxShadow: "0 4px 16px rgba(46, 125, 50, 0.3)",
              }}
            >
              Proceed to Checkout
            </Button>

            {/* Copyright */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 2 }}
            >
              © 2025 Rathod Mart
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;

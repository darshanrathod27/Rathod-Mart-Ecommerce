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
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  ArrowForward,
  LocalOffer,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import api from "../../data/api";

const CartDrawer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { closeWishlist } = useWishlist(); // Close wishlist when cart opens

  // 🎯 Responsive Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  // eslint-disable-next-line no-unused-vars
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600-900px

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

  // Fetch available coupons when drawer opens
  useEffect(() => {
    if (isCartOpen && cartItems.length > 0) {
      setCouponsLoading(true);
      api
        .fetchAvailableCoupons()
        .then((data) => setCoupons(data))
        .catch(() => setCoupons([]))
        .finally(() => setCouponsLoading(false));
    }
  }, [isCartOpen, cartItems.length]);

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

  const { subtotal, total, discountAmount } = getCartTotal();
  const totalCount = getCartItemsCount();

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={closeCart}
      sx={{
        zIndex: 1400, // Above header (default AppBar is 1100)
      }}
      PaperProps={{
        sx: {
          // 📱 Responsive Width
          width: {
            xs: "100%", // Full width on mobile
            sm: "85%", // 85% on small tablets
            md: 440, // Fixed 440px on desktop
          },
          maxWidth: { xs: "100%", md: 500 },
          // 📱 Border radius only on desktop
          borderTopLeftRadius: { xs: 0, md: 32 },
          borderBottomLeftRadius: { xs: 0, md: 32 },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
          color: "#fff",
          // 📱 Responsive Padding
          p: { xs: 2, sm: 2.5, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          // 📱 Add safe area for notch on mobile
          pt: { xs: "calc(env(safe-area-inset-top) + 16px)", md: 3 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ShoppingCartOutlined
            sx={{
              // 📱 Responsive Icon Size
              fontSize: { xs: 22, md: 24 },
            }}
          />
          <Box>
            <Typography
              variant="h6"
              fontWeight="800"
              sx={{
                // 📱 Responsive Font Size
                fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.25rem" },
              }}
            >
              Shopping Cart
            </Typography>
            <Typography
              variant="caption"
              sx={{
                // 📱 Responsive Font Size
                fontSize: { xs: "0.7rem", md: "0.75rem" },
              }}
            >
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={closeCart}
          sx={{
            color: "#fff",
            // 📱 Touch-friendly size
            width: { xs: 44, md: 40 },
            height: { xs: 44, md: 40 },
          }}
        >
          <Close sx={{ fontSize: { xs: 22, md: 24 } }} />
        </IconButton>
      </Box>

      {/* Cart Items List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          // 📱 Responsive Padding
          p: { xs: 1.5, sm: 2 },
          // 📱 Better scrolling on iOS
          WebkitOverflowScrolling: "touch",
          // Hide scrollbar
          "&::-webkit-scrollbar": {
            width: { xs: 0, md: "8px" },
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        {cartItems.length === 0 ? (
          // Empty Cart State
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              // 📱 Responsive Top Margin
              mt: { xs: 8, md: 10 },
              px: 2,
            }}
          >
            <ShoppingCartOutlined
              sx={{
                // 📱 Responsive Icon Size
                fontSize: { xs: 50, md: 60 },
                color: "text.disabled",
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                // 📱 Responsive Font Size
                fontSize: { xs: "1rem", md: "1.25rem" },
                textAlign: "center",
              }}
            >
              Your cart is empty
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                mb: 3,
                textAlign: "center",
                fontSize: { xs: "0.85rem", md: "0.9rem" },
              }}
            >
              Add items to get started
            </Typography>
            <Button
              variant="contained"
              onClick={closeCart}
              sx={{
                // 📱 Touch-friendly size
                minHeight: { xs: 48, md: 44 },
                px: { xs: 3, md: 4 },
                fontSize: { xs: "0.9rem", md: "1rem" },
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                borderRadius: "50px",
                fontWeight: 600,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                },
              }}
            >
              Start Shopping
            </Button>
          </Box>
        ) : (
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.cartId}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    // 📱 Responsive Margin & Padding
                    mb: { xs: 1.5, md: 2 },
                    p: { xs: 1.5, md: 2 },
                    border: "1px solid #eee",
                    borderRadius: { xs: 2, md: 2 },
                    transition: "all 0.2s ease",
                    "&:active": {
                      bgcolor: "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", gap: { xs: 1.5, md: 2 } }}>
                    {/* Product Image */}
                    <Avatar
                      src={item.image}
                      variant="rounded"
                      sx={{
                        // 📱 Responsive Avatar Size
                        width: { xs: 70, sm: 75, md: 80 },
                        height: { xs: 70, sm: 75, md: 80 },
                        borderRadius: 2,
                      }}
                    />

                    {/* Product Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="700"
                        noWrap
                        sx={{
                          // 📱 Responsive Font Size
                          fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                          mb: 0.5,
                        }}
                      >
                        {item.name}
                      </Typography>

                      {/* Variant Info */}
                      {item.selectedVariant && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            // 📱 Responsive Font Size
                            fontSize: { xs: "0.7rem", md: "0.75rem" },
                            mb: 1,
                          }}
                        >
                          {item.selectedVariant.size || ""}
                          {item.selectedVariant.size &&
                            item.selectedVariant.color
                            ? " / "
                            : ""}
                          {item.selectedVariant.color || ""}
                        </Typography>
                      )}

                      {/* Price and Controls */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          // 📱 Stack on very small screens if needed
                          flexWrap: { xs: "wrap", sm: "nowrap" },
                          gap: { xs: 1, md: 1.5 },
                          mt: 1,
                        }}
                      >
                        <Typography
                          fontWeight="700"
                          color="primary"
                          sx={{
                            // 📱 Responsive Font Size
                            fontSize: { xs: "0.95rem", md: "1rem" },
                          }}
                        >
                          ₹{item.price.toLocaleString()}
                        </Typography>

                        {/* Quantity Controls */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#f5f5f5",
                            borderRadius: 5,
                            // 📱 Touch-friendly size
                            minHeight: { xs: 36, md: 32 },
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            sx={{
                              // 📱 Touch-friendly size
                              width: { xs: 36, md: 32 },
                              height: { xs: 36, md: 32 },
                            }}
                          >
                            <Remove sx={{ fontSize: { xs: 18, md: 20 } }} />
                          </IconButton>
                          <Typography
                            sx={{
                              px: { xs: 1.5, md: 1 },
                              fontWeight: 600,
                              fontSize: { xs: "0.9rem", md: "1rem" },
                              minWidth: { xs: 32, md: 28 },
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
                            sx={{
                              // 📱 Touch-friendly size
                              width: { xs: 36, md: 32 },
                              height: { xs: 36, md: 32 },
                            }}
                          >
                            <Add sx={{ fontSize: { xs: 18, md: 20 } }} />
                          </IconButton>
                        </Box>

                        {/* Delete Button */}
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeFromCart(item.cartId)}
                          sx={{
                            // 📱 Touch-friendly size
                            width: { xs: 36, md: 32 },
                            height: { xs: 36, md: 32 },
                          }}
                        >
                          <Delete sx={{ fontSize: { xs: 18, md: 20 } }} />
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

      {/* Footer Section with Promocodes and Checkout */}
      {cartItems.length > 0 && (
        <Box
          sx={{
            boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
            // 📱 Add safe area for home indicator on iOS
            pb: { xs: "calc(env(safe-area-inset-bottom) + 8px)", md: 0 },
          }}
        >
          {/* Promocode Recommendations */}
          {!appliedPromo && (
            <Box
              sx={{
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1 },
                bgcolor: "#f9f9f9",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: "text.secondary",
                  display: "block",
                  // 📱 Responsive Font Size
                  fontSize: { xs: "0.7rem", md: "0.75rem" },
                }}
              >
                Available Coupons:
              </Typography>

              {couponsLoading ? (
                <Box sx={{ display: "flex", gap: 1, pb: 1 }}>
                  {[1, 2].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      width={120}
                      height={28}
                      sx={{ borderRadius: "14px" }}
                    />
                  ))}
                </Box>
              ) : coupons.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    overflowX: "auto",
                    pb: 1,
                    // Hide scrollbar
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                    scrollbarWidth: "none",
                  }}
                >
                  {coupons.map((c) => (
                    <Chip
                      key={c.code}
                      label={`${c.code} (${c.discountType === "Percentage"
                          ? c.discountValue + "%"
                          : "₹" + c.discountValue
                        } OFF)`}
                      onClick={() => handleApplyPromo(c.code)}
                      clickable
                      color="primary"
                      variant="outlined"
                      size="small"
                      icon={
                        <LocalOffer sx={{ fontSize: { xs: 14, md: 16 } }} />
                      }
                      sx={{
                        // 📱 Touch-friendly size
                        minHeight: { xs: 32, md: 28 },
                        fontSize: { xs: "0.75rem", md: "0.8rem" },
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        "&:active": {
                          transform: "scale(0.95)",
                        },
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
                >
                  No coupons available
                </Typography>
              )}
            </Box>
          )}

          {/* Checkout Footer */}
          <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            {/* Promocode Input */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 2,
                // 📱 Stack on very small screens
                flexDirection: { xs: appliedPromo ? "row" : "row" },
              }}
            >
              {appliedPromo ? (
                <Chip
                  icon={<LocalOffer sx={{ fontSize: { xs: 16, md: 18 } }} />}
                  label={`Code: ${appliedPromo.code}`}
                  onDelete={removePromocode}
                  color="success"
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    // 📱 Touch-friendly height
                    minHeight: { xs: 44, md: 40 },
                    fontSize: { xs: "0.85rem", md: "0.9rem" },
                    fontWeight: 600,
                  }}
                />
              ) : (
                <>
                  <TextField
                    size="small"
                    placeholder="Enter Promocode"
                    fullWidth
                    value={promoInput}
                    onChange={(e) =>
                      setPromoInput(e.target.value.toUpperCase())
                    }
                    sx={{
                      "& .MuiInputBase-root": {
                        // 📱 Touch-friendly height
                        minHeight: { xs: 44, md: 40 },
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleApplyPromo()}
                    disabled={promoLoading || !promoInput}
                    sx={{
                      background: "#2E7D32",
                      // 📱 Touch-friendly size
                      minWidth: { xs: 80, md: 90 },
                      minHeight: { xs: 44, md: 40 },
                      fontSize: { xs: "0.85rem", md: "0.9rem" },
                      fontWeight: 600,
                      "&:hover": {
                        background: "#1B5E20",
                      },
                    }}
                  >
                    {promoLoading ? "..." : "Apply"}
                  </Button>
                </>
              )}
            </Box>

            {/* Price Breakdown */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                Subtotal
              </Typography>
              <Typography
                fontWeight="600"
                sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
              >
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
                <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                  Discount
                </Typography>
                <Typography
                  fontWeight="600"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  - ₹{discountAmount.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: { xs: 1.5, md: 1 } }} />

            {/* Total */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: { xs: 2, md: 2 },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="800"
                sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
              >
                Total
              </Typography>
              <Typography
                variant="h6"
                fontWeight="800"
                color="primary"
                sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
              >
                ₹{total.toFixed(2)}
              </Typography>
            </Box>

            {/* Checkout Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              endIcon={<ArrowForward sx={{ fontSize: { xs: 18, md: 20 } }} />}
              onClick={handleCheckout}
              sx={{
                borderRadius: 50,
                // 📱 Touch-friendly height
                py: { xs: 1.6, md: 1.5 },
                minHeight: { xs: 52, md: 48 },
                // 📱 Responsive Font Size
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 700,
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                  boxShadow: "0 6px 20px rgba(46, 125, 50, 0.4)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;

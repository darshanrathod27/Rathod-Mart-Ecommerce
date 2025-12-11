// frontend/src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  TextField,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { MyLocation, ArrowBack } from "@mui/icons-material";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../data/api";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🎯 Responsive Breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  const { cartItems, getCartTotal, clearCart } = useCart();
  const { userInfo } = useSelector((state) => state.auth);
  const { total, subtotal, discountAmount } = getCartTotal();

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [saveAddress, setSaveAddress] = useState(false);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  useEffect(() => {
    if (userInfo?.address) {
      setAddress({
        street: userInfo.address.street || "",
        city: userInfo.address.city || "",
        state: userInfo.address.state || "",
        zip: userInfo.address.postalCode || "",
        country: userInfo.address.country || "India",
      });
    }
  }, [userInfo]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            setAddress((prev) => ({
              ...prev,
              street: `${addr.house_number || ""} ${addr.road || ""} ${addr.suburb || ""
                }`.trim(),
              city: addr.city || addr.town || addr.village || "",
              state: addr.state || "",
              zip: addr.postcode || "",
              country: addr.country || "India",
            }));
            toast.success("Address detected successfully!");
          } else {
            toast.error("Could not find address details.");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.error("Failed to fetch address location.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to retrieve your location.");
        setLocating(false);
      }
    );
  };

  // Razorpay Payment Handler
  const handleRazorpayPayment = async (orderId, orderTotal) => {
    try {
      setPaymentLoading(true);

      // 1. Create Razorpay Order
      const { data: paymentOrder } = await api.post("/payments/create-order", {
        amount: orderTotal,
        orderId: orderId,
      });

      // 2. Configure Razorpay Options
      const options = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Rathod Mart",
        description: "Order Payment",
        order_id: paymentOrder.orderId,
        handler: async (response) => {
          try {
            // 3. Verify Payment
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            });

            toast.success("Payment successful! Order placed.");
            clearCart();
            navigate("/");
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          contact: userInfo?.phone || "",
        },
        theme: {
          color: "#2E7D32",
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast.error("Payment cancelled");
          },
        },
      };

      // 4. Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!address.street || !address.city || !address.zip || !address.state) {
      toast.error("Please fill in all address fields.");
      return;
    }

    setLoading(true);
    try {
      // 1. Update Profile Address if selected
      if (saveAddress) {
        const fd = new FormData();
        fd.append("address[street]", address.street);
        fd.append("address[city]", address.city);
        fd.append("address[state]", address.state);
        fd.append("address[postalCode]", address.zip);
        fd.append("address[country]", address.country);

        try {
          const userRes = await api.put("/users/profile", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          dispatch(setCredentials(userRes.data));
        } catch (updateErr) {
          console.warn("Failed to save address to profile:", updateErr);
        }
      }

      // 2. Construct Order Data
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.quantity,
          variant: item.selectedVariant ? item.selectedVariant.id : null,
        })),
        shippingAddress: {
          address: address.street,
          city: address.city,
          postalCode: address.zip,
          country: address.country,
          state: address.state,
        },
        paymentMethod: paymentMethod,
        itemsPrice: subtotal,
        discountPrice: discountAmount,
        totalPrice: total,
      };

      // 3. Call Backend API to create order
      const res = await api.post("/orders", orderData);

      if (res.status === 201 || res.data) {
        const createdOrder = res.data;

        // 4. Handle payment based on method
        if (paymentMethod === "online") {
          // Initiate Razorpay payment
          setLoading(false);
          await handleRazorpayPayment(createdOrder._id, total);
        } else {
          // COD - Order complete
          toast.success("Order placed successfully!");
          clearCart();
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        // 📱 Responsive Padding
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
        minHeight: "80vh",
      }}
    >
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{
          mb: { xs: 2, md: 2 },
          color: "text.secondary",
          // 📱 Touch-friendly size
          minHeight: { xs: 44, md: 36 },
          fontSize: { xs: "0.9rem", md: "1rem" },
        }}
      >
        Back
      </Button>

      {/* Page Title */}
      <Typography
        variant="h4"
        fontWeight="800"
        sx={{
          mb: { xs: 3, md: 4 },
          color: "#2E7D32",
          // 📱 Responsive Font Size
          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
        }}
      >
        Checkout
      </Typography>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* 📝 Left Column - Address & Payment */}
        <Grid item xs={12} md={7}>
          {/* Shipping Address Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              mb: { xs: 2, md: 3 },
              border: "1px solid #e0e0e0",
              borderRadius: { xs: 2, md: 3 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                // 📱 Stack on small mobile
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                mb: { xs: 2, md: 3 },
                gap: { xs: 2, sm: 0 },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="700"
                sx={{
                  // 📱 Responsive Font Size
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                Shipping Address
              </Typography>
              <Button
                variant="outlined"
                startIcon={
                  locating ? <CircularProgress size={20} /> : <MyLocation />
                }
                onClick={handleLocateMe}
                disabled={locating || loading}
                // 📱 Responsive Button Size
                size={isSmallMobile ? "small" : "medium"}
                fullWidth={isSmallMobile}
                sx={{
                  borderRadius: 20,
                  // 📱 Touch-friendly height
                  minHeight: { xs: 44, md: 36 },
                  fontSize: { xs: "0.85rem", md: "0.95rem" },
                }}
              >
                {locating ? "Locating..." : "Locate Me"}
              </Button>
            </Box>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12}>
                <TextField
                  label="Street Address"
                  name="street"
                  fullWidth
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                  disabled={loading}
                  multiline
                  // 📱 Less rows on mobile
                  rows={isSmallMobile ? 1 : 2}
                  // 📱 Responsive Size
                  size={isSmallMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  name="city"
                  fullWidth
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                  disabled={loading}
                  size={isSmallMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pincode"
                  name="zip"
                  fullWidth
                  value={address.zip}
                  onChange={handleAddressChange}
                  required
                  disabled={loading}
                  size={isSmallMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="State"
                  name="state"
                  fullWidth
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                  disabled={loading}
                  size={isSmallMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  name="country"
                  fullWidth
                  value={address.country}
                  disabled
                  size={isSmallMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      color="primary"
                      // 📱 Responsive Checkbox Size
                      sx={{
                        "& .MuiSvgIcon-root": {
                          fontSize: { xs: 20, md: 24 },
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                      Save address to profile
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Payment Method Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              border: "1px solid #e0e0e0",
              borderRadius: { xs: 2, md: 3 },
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{
                mb: { xs: 1.5, md: 2 },
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              Payment Method
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="cod"
                control={
                  <Radio
                    color="primary"
                    sx={{
                      "& .MuiSvgIcon-root": {
                        fontSize: { xs: 20, md: 24 },
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography
                      fontWeight="600"
                      sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}
                    >
                      Cash on Delivery (COD)
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.85rem" } }}
                    >
                      Pay when order arrives
                    </Typography>
                  </Box>
                }
                sx={{
                  mb: { xs: 1.5, md: 2 },
                  // 📱 Touch-friendly height
                  "& .MuiFormControlLabel-root": {
                    minHeight: 44,
                  },
                }}
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                value="online"
                control={
                  <Radio
                    color="primary"
                    sx={{
                      "& .MuiSvgIcon-root": {
                        fontSize: { xs: 20, md: 24 },
                      },
                    }}
                  />
                }
                disabled={loading || paymentLoading}
                label={
                  <Box>
                    <Typography
                      fontWeight="600"
                      sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}
                    >
                      Online Payment (Razorpay)
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.85rem" } }}
                    >
                      Pay with UPI, Card, Net Banking
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* 📊 Right Column - Order Summary */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: "#fafafa",
              borderRadius: { xs: 2, md: 3 },
              // 📱 Sticky only on desktop
              position: { xs: "relative", md: "sticky" },
              top: { md: 100 },
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{
                mb: { xs: 2, md: 3 },
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              Order Summary
            </Typography>

            {/* Cart Items List */}
            <Stack spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
              {cartItems.map((item) => (
                <Box
                  key={item.cartId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: { xs: 1, md: 2 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 1, md: 2 },
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {/* Product Image */}
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        // 📱 Responsive Image Size
                        width: { xs: 40, sm: 50 },
                        height: { xs: 40, sm: 50 },
                        borderRadius: { xs: 1, md: 2 },
                        objectFit: "cover",
                        border: "1px solid #eee",
                        flexShrink: 0,
                      }}
                    />
                    {/* Product Info */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        noWrap
                        sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", md: "0.8rem" },
                          display: "block",
                        }}
                      >
                        Qty: {item.quantity}
                        {item.selectedVariant && (
                          <>
                            {" "}
                            • {item.selectedVariant.size || ""}{" "}
                            {item.selectedVariant.color || ""}
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Price */}
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    sx={{
                      fontSize: { xs: "0.85rem", md: "0.95rem" },
                      flexShrink: 0,
                    }}
                  >
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Price Breakdown */}
            <Stack spacing={{ xs: 1, md: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  Subtotal
                </Typography>
                <Typography
                  fontWeight="600"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  ₹{subtotal.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  Discount
                </Typography>
                <Typography
                  fontWeight="600"
                  color="success.main"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  - ₹{discountAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  Shipping
                </Typography>
                <Typography
                  fontWeight="600"
                  color="success.main"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  Free
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: { xs: 2, md: 3 },
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

            {/* Place Order Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handlePlaceOrder}
              disabled={loading}
              sx={{
                borderRadius: 50,
                // 📱 Responsive Padding
                py: { xs: 1.3, md: 1.5 },
                // 📱 Responsive Font Size
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: "700",
                // 📱 Touch-friendly minimum height
                minHeight: { xs: 48, md: 44 },
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                boxShadow: "0 8px 20px rgba(46,125,50,0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;

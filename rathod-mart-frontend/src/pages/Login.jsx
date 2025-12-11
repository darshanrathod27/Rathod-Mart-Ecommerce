import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  Stack,
  CircularProgress,
  Collapse,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailRounded,
  LockRounded,
  Google,
  Login as LoginIcon,
  ArrowForward,
  Store,
  ShoppingBag,
  LocalShipping,
  Verified,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Local imports
import api from "../data/api";
import { setCredentials } from "../store/authSlice";

// --- VALIDATION SCHEMA ---
const schema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// --- Floating Particle Component ---
const FloatingParticle = ({ delay, duration, size, left, top }) => (
  <Box
    component={motion.div}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    sx={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg, rgba(46, 125, 50, 0.3), rgba(0, 191, 165, 0.2))",
      left: left,
      top: top,
      filter: "blur(1px)",
      pointerEvents: "none",
    }}
  />
);

// --- Feature Item Component ---
const FeatureItem = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: delay, duration: 0.5 }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Icon sx={{ color: "white", fontSize: 24 }} />
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.4 }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  </motion.div>
);

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [typedText, setTypedText] = useState("");
  const fullText = "Welcome Back!";

  // Typing animation effect
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setAuthError("");
    try {
      const res = await api.post("/users/login", data);
      dispatch(setCredentials(res.data));
      toast.success(`Welcome back, ${res.data.name}!`, {
        icon: "👋",
        style: {
          borderRadius: "10px",
          background: "#2E7D32",
          color: "#fff",
        },
      });
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      const msg =
        err.response?.data?.message ||
        "Invalid credentials. Please check and try again.";
      setAuthError(msg);
      toast.error(msg);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    window.location.href = `${apiBaseUrl}/api/users/google`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 50%, #c8e6c9 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating Particles Background */}
      {!isSmallMobile && (
        <>
          <FloatingParticle delay={0} duration={8} size={60} left="10%" top="20%" />
          <FloatingParticle delay={1} duration={10} size={40} left="80%" top="15%" />
          <FloatingParticle delay={2} duration={12} size={80} left="70%" top="70%" />
          <FloatingParticle delay={0.5} duration={9} size={50} left="20%" top="80%" />
          <FloatingParticle delay={1.5} duration={11} size={30} left="90%" top="50%" />
        </>
      )}

      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 },
          position: "relative",
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: isMobile ? "100%" : "1000px" }}
        >
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              overflow: "hidden",
              borderRadius: { xs: 4, sm: 5, md: 6 },
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              boxShadow: "0 25px 80px rgba(46, 125, 50, 0.15), 0 10px 30px rgba(0, 0, 0, 0.08)",
              minHeight: { xs: "auto", md: "600px" },
            }}
          >
            {/* Left Side - Form */}
            <Box
              sx={{
                flex: { xs: 1, md: 0.5 },
                p: { xs: 3, sm: 4, md: 5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Brand Logo */}
                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: { xs: 2, md: 3 },
                    }}
                  >
                    <Avatar
                      sx={{
                        background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                        width: { xs: 40, md: 48 },
                        height: { xs: 40, md: 48 },
                        boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                      }}
                    >
                      <Store sx={{ fontSize: { xs: 20, md: 24 } }} />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: { xs: "1.2rem", md: "1.4rem" },
                      }}
                    >
                      Rathod Mart
                    </Typography>
                  </Box>
                </motion.div>

                {/* Welcome Text with Typing Effect */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        color: "#1a1a1a",
                        mb: 1,
                        fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                        minHeight: { xs: "2.5rem", md: "3rem" },
                      }}
                    >
                      {typedText}
                      <Box
                        component={motion.span}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        sx={{ color: "#2E7D32" }}
                      >
                        |
                      </Box>
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                    >
                      Sign in to continue shopping
                    </Typography>
                  </Box>
                </motion.div>

                {/* Error Alert */}
                <AnimatePresence>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert
                        severity="error"
                        onClose={() => setAuthError("")}
                        sx={{
                          mb: 2,
                          borderRadius: 3,
                          boxShadow: "0 4px 12px rgba(211, 47, 47, 0.1)",
                        }}
                      >
                        {authError}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={{ xs: 2, md: 2.5 }}>
                    {/* Email Field */}
                    <motion.div variants={itemVariants}>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Email Address"
                            fullWidth
                            placeholder="john@example.com"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailRounded
                                    sx={{
                                      color: errors.email ? "error.main" : "#2E7D32",
                                      opacity: 0.8,
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                backgroundColor: "#fafafa",
                                transition: "all 0.3s ease",
                                "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                                "&:hover fieldset": { borderColor: "#2E7D32" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#2E7D32",
                                  borderWidth: 2,
                                },
                                "&.Mui-focused": {
                                  backgroundColor: "#fff",
                                  boxShadow: "0 4px 20px rgba(46, 125, 50, 0.1)",
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </motion.div>

                    {/* Password Field */}
                    <motion.div variants={itemVariants}>
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <Box>
                            <TextField
                              {...field}
                              label="Password"
                              type={showPassword ? "text" : "password"}
                              fullWidth
                              placeholder="••••••••"
                              error={!!errors.password}
                              helperText={errors.password?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockRounded
                                      sx={{
                                        color: errors.password ? "error.main" : "#2E7D32",
                                        opacity: 0.8,
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => setShowPassword(!showPassword)}
                                      edge="end"
                                      size="small"
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 3,
                                  backgroundColor: "#fafafa",
                                  transition: "all 0.3s ease",
                                  "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                                  "&:hover fieldset": { borderColor: "#2E7D32" },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#2E7D32",
                                    borderWidth: 2,
                                  },
                                  "&.Mui-focused": {
                                    backgroundColor: "#fff",
                                    boxShadow: "0 4px 20px rgba(46, 125, 50, 0.1)",
                                  },
                                },
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 1,
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    defaultChecked
                                    size="small"
                                    sx={{
                                      color: "#2E7D32",
                                      "&.Mui-checked": { color: "#2E7D32" },
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                                    Remember me
                                  </Typography>
                                }
                              />
                              <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#2E7D32",
                                    fontWeight: 700,
                                    fontSize: { xs: "0.75rem", md: "0.8rem" },
                                    "&:hover": { textDecoration: "underline" },
                                  }}
                                >
                                  Forgot Password?
                                </Typography>
                              </Link>
                            </Box>
                          </Box>
                        )}
                      />
                    </motion.div>

                    {/* Login Button */}
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting}
                        endIcon={!isSubmitting && <ArrowForward />}
                        startIcon={!isSubmitting && <LoginIcon />}
                        sx={{
                          py: { xs: 1.5, md: 1.8 },
                          borderRadius: 50,
                          fontSize: { xs: "0.9rem", md: "1rem" },
                          fontWeight: 800,
                          letterSpacing: "0.5px",
                          textTransform: "none",
                          background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #00BFA5 100%)",
                          backgroundSize: "200% 200%",
                          animation: "gradientShift 3s ease infinite",
                          boxShadow: "0 10px 30px rgba(46, 125, 50, 0.3)",
                          "@keyframes gradientShift": {
                            "0%": { backgroundPosition: "0% 50%" },
                            "50%": { backgroundPosition: "100% 50%" },
                            "100%": { backgroundPosition: "0% 50%" },
                          },
                          "&:hover": {
                            boxShadow: "0 15px 40px rgba(46, 125, 50, 0.4)",
                          },
                          "&.Mui-disabled": {
                            background: "#e0e0e0",
                          },
                        }}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={26} color="inherit" />
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </motion.div>
                  </Stack>
                </form>

                {/* Social Login Divider */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ my: { xs: 2, md: 3 }, display: "flex", alignItems: "center" }}>
                    <Divider sx={{ flex: 1, borderColor: "rgba(0,0,0,0.08)" }} />
                    <Typography
                      variant="caption"
                      sx={{
                        px: 2,
                        color: "text.secondary",
                        fontWeight: 600,
                        fontSize: { xs: "0.7rem", md: "0.75rem" },
                      }}
                    >
                      OR CONTINUE WITH
                    </Typography>
                    <Divider sx={{ flex: 1, borderColor: "rgba(0,0,0,0.08)" }} />
                  </Box>
                </motion.div>

                {/* Google Button */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Google />}
                    onClick={handleGoogleLogin}
                    sx={{
                      py: { xs: 1.2, md: 1.5 },
                      borderRadius: 3,
                      borderColor: "#e0e0e0",
                      color: "text.primary",
                      fontWeight: 600,
                      textTransform: "none",
                      backgroundColor: "#fff",
                      fontSize: { xs: "0.85rem", md: "0.95rem" },
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#2E7D32",
                        backgroundColor: "rgba(46, 125, 50, 0.04)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                      },
                    }}
                  >
                    Continue with Google
                  </Button>
                </motion.div>

                {/* Register Link */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ mt: { xs: 2, md: 3 }, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.85rem", md: "0.9rem" } }}>
                      New to Rathod Mart?{" "}
                      <Link to="/register" style={{ textDecoration: "none" }}>
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 800,
                            color: "#2E7D32",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          Create Account
                        </Typography>
                      </Link>
                    </Typography>
                  </Box>
                </motion.div>
              </motion.div>
            </Box>

            {/* Right Side - Illustration (Desktop Only) */}
            {!isMobile && (
              <Box
                sx={{
                  flex: 0.5,
                  position: "relative",
                  background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #4CAF50 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  p: 5,
                  overflow: "hidden",
                }}
              >
                {/* Decorative Elements */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "-20%",
                    right: "-15%",
                    width: "350px",
                    height: "350px",
                    border: "2px solid rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "-15%",
                    left: "-10%",
                    width: "280px",
                    height: "280px",
                    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />

                {/* Content */}
                <Box sx={{ position: "relative", zIndex: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        color: "white",
                        fontWeight: 900,
                        mb: 2,
                        fontSize: { md: "1.8rem", lg: "2.2rem" },
                      }}
                    >
                      Fresh Groceries,
                      <br />
                      Delivered Fast!
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        mb: 5,
                        lineHeight: 1.6,
                        maxWidth: "90%",
                      }}
                    >
                      Shop from thousands of products and get them delivered to your doorstep.
                    </Typography>
                  </motion.div>

                  {/* Feature List */}
                  <FeatureItem
                    icon={ShoppingBag}
                    title="Wide Selection"
                    description="Over 10,000+ products to choose from"
                    delay={0.5}
                  />
                  <FeatureItem
                    icon={LocalShipping}
                    title="Fast Delivery"
                    description="Same day delivery available"
                    delay={0.7}
                  />
                  <FeatureItem
                    icon={Verified}
                    title="Quality Assured"
                    description="100% genuine products guaranteed"
                    delay={0.9}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;

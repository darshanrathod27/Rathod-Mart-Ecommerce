import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
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
  Alert,
  Stack,
  CircularProgress,
  LinearProgress,
  Grid,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailRounded,
  LockRounded,
  PersonRounded,
  AppRegistration,
  CheckCircle,
  Cancel,
  Store,
  Google,
  ArrowForward,
  Celebration,
  Security,
  Support,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Local imports
import api from "../data/api";
import { setCredentials } from "../store/authSlice";

// --- VALIDATION SCHEMA ---
const registerSchema = yup.object({
  name: yup
    .string()
    .required("Full Name is required")
    .min(3, "Name must be at least 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .matches(/[a-z]/, "Must contain a lowercase letter")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[@$!%*?&]/, "Must contain a special char (@$!%*?&)"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  terms: yup
    .boolean()
    .oneOf([true], "You must accept the Terms and Privacy Policy"),
});

// --- Floating Particle Component ---
const FloatingParticle = ({ delay, duration, size, left, top }) => (
  <Box
    component={motion.div}
    animate={{
      y: [0, -25, 0],
      x: [0, 12, 0],
      opacity: [0.3, 0.5, 0.3],
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
      background: "linear-gradient(135deg, rgba(46, 125, 50, 0.25), rgba(0, 191, 165, 0.15))",
      left: left,
      top: top,
      filter: "blur(1px)",
      pointerEvents: "none",
    }}
  />
);

// --- Password Strength Meter ---
const PasswordStrengthBar = ({ password }) => {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }
    if (password.length > 7) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  const getColor = () => {
    const colors = ["#e0e0e0", "#f44336", "#ff9800", "#2196f3", "#4caf50"];
    return colors[strength];
  };

  const getLabel = () => {
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    return labels[strength];
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color="text.secondary">
          Password Strength
        </Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ color: getColor() }}>
          {getLabel()}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={(strength / 4) * 100}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: "#f0f0f0",
          "& .MuiLinearProgress-bar": {
            bgcolor: getColor(),
            borderRadius: 3,
            transition: "all 0.4s ease",
          },
        }}
      />
    </Box>
  );
};

// --- Requirement Check Item ---
const RequirementItem = ({ met, text }) => (
  <Stack direction="row" alignItems="center" gap={0.5}>
    {met ? (
      <CheckCircle sx={{ fontSize: 14, color: "success.main" }} />
    ) : (
      <Cancel sx={{ fontSize: 14, color: "text.disabled" }} />
    )}
    <Typography
      variant="caption"
      color={met ? "text.primary" : "text.disabled"}
      sx={{ fontSize: "0.75rem" }}
    >
      {text}
    </Typography>
  </Stack>
);

// --- Feature Item ---
const FeatureItem = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: delay, duration: 0.5 }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2.5 }}>
      <Box
        sx={{
          p: 1.2,
          borderRadius: 2,
          background: "rgba(255, 255, 255, 0.15)",
        }}
      >
        <Icon sx={{ color: "white", fontSize: 22 }} />
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 700, mb: 0.3 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          {description}
        </Typography>
      </Box>
    </Box>
  </motion.div>
);

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    setAuthError("");
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      const res = await api.post("/users/register", payload);
      dispatch(setCredentials(res.data));
      toast.success(`Welcome to the family, ${res.data.name}!`, {
        icon: "🎉",
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#2E7D32",
          color: "#fff",
        },
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration failed. Try again.";
      setAuthError(msg);
      toast.error(msg);
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to backend Google OAuth endpoint (same flow for login/signup)
    const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    window.location.href = `${apiBaseUrl}/api/users/google`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      backgroundColor: "#fafafa",
      transition: "all 0.3s ease",
      "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
      "&:hover fieldset": { borderColor: "#2E7D32" },
      "&.Mui-focused fieldset": { borderColor: "#2E7D32", borderWidth: 2 },
      "&.Mui-focused": {
        backgroundColor: "#fff",
        boxShadow: "0 4px 20px rgba(46, 125, 50, 0.1)",
      },
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
      {/* Floating Particles */}
      {!isSmallMobile && (
        <>
          <FloatingParticle delay={0} duration={9} size={50} left="5%" top="15%" />
          <FloatingParticle delay={1.5} duration={11} size={35} left="85%" top="25%" />
          <FloatingParticle delay={0.5} duration={10} size={65} left="75%" top="75%" />
          <FloatingParticle delay={2} duration={8} size={45} left="15%" top="85%" />
        </>
      )}

      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 2, sm: 3 },
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
              boxShadow: "0 25px 80px rgba(46, 125, 50, 0.15)",
              minHeight: { xs: "auto", md: "650px" },
            }}
          >
            {/* Left Side - Illustration (Desktop Only) */}
            {!isMobile && (
              <Box
                sx={{
                  flex: 0.45,
                  position: "relative",
                  background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  p: 4,
                  overflow: "hidden",
                }}
              >
                {/* Decorative Elements */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "-15%",
                    left: "-10%",
                    width: "300px",
                    height: "300px",
                    border: "2px solid rgba(255,255,255,0.08)",
                    borderRadius: "50%",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "-10%",
                    right: "-5%",
                    width: "250px",
                    height: "250px",
                    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />

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
                        mb: 1.5,
                        fontSize: { md: "1.7rem", lg: "2rem" },
                      }}
                    >
                      Join Our
                      <br />
                      Community!
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        mb: 4,
                        lineHeight: 1.6,
                      }}
                    >
                      Create an account and enjoy exclusive benefits.
                    </Typography>
                  </motion.div>

                  <FeatureItem
                    icon={Celebration}
                    title="Exclusive Deals"
                    description="Members-only discounts & offers"
                    delay={0.5}
                  />
                  <FeatureItem
                    icon={Security}
                    title="Secure Shopping"
                    description="Your data is always protected"
                    delay={0.7}
                  />
                  <FeatureItem
                    icon={Support}
                    title="24/7 Support"
                    description="We're here to help anytime"
                    delay={0.9}
                  />
                </Box>
              </Box>
            )}

            {/* Right Side - Form */}
            <Box
              sx={{
                flex: { xs: 1, md: 0.55 },
                p: { xs: 3, sm: 4, md: 4 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                overflowY: "auto",
              }}
            >
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Brand Logo */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Avatar
                      sx={{
                        background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                        width: { xs: 36, md: 42 },
                        height: { xs: 36, md: 42 },
                        boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                      }}
                    >
                      <Store sx={{ fontSize: { xs: 18, md: 22 } }} />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: { xs: "1.1rem", md: "1.25rem" },
                      }}
                    >
                      Rathod Mart
                    </Typography>
                  </Box>
                </motion.div>

                {/* Header */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 900,
                        color: "#1a1a1a",
                        mb: 0.5,
                        fontSize: { xs: "1.5rem", sm: "1.6rem", md: "1.75rem" },
                      }}
                    >
                      Create Account
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontSize: { xs: "0.85rem", md: "0.9rem" } }}
                    >
                      Start your shopping journey today
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
                        sx={{ mb: 2, borderRadius: 2 }}
                        onClose={() => setAuthError("")}
                      >
                        {authError}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={2}>
                    {/* Full Name */}
                    <motion.div variants={itemVariants}>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Full Name"
                            fullWidth
                            size={isSmallMobile ? "small" : "medium"}
                            placeholder="John Doe"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonRounded sx={{ color: errors.name ? "error.main" : "#2E7D32", opacity: 0.8 }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={inputStyles}
                          />
                        )}
                      />
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants}>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Email Address"
                            fullWidth
                            size={isSmallMobile ? "small" : "medium"}
                            placeholder="john@example.com"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailRounded sx={{ color: errors.email ? "error.main" : "#2E7D32", opacity: 0.8 }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={inputStyles}
                          />
                        )}
                      />
                    </motion.div>

                    {/* Password */}
                    <motion.div variants={itemVariants}>
                      <Box>
                        <Controller
                          name="password"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Password"
                              type={showPassword ? "text" : "password"}
                              fullWidth
                              size={isSmallMobile ? "small" : "medium"}
                              error={!!errors.password}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockRounded sx={{ color: errors.password ? "error.main" : "#2E7D32", opacity: 0.8 }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={inputStyles}
                            />
                          )}
                        />

                        {/* Password Feedback */}
                        <AnimatePresence>
                          {passwordValue && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Box
                                sx={{
                                  mt: 1.5,
                                  p: 1.5,
                                  bgcolor: "rgba(46, 125, 50, 0.04)",
                                  borderRadius: 2,
                                }}
                              >
                                <PasswordStrengthBar password={passwordValue} />
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                  <Grid item xs={6}>
                                    <RequirementItem met={passwordValue?.length >= 8} text="8+ Characters" />
                                    <RequirementItem met={/[A-Z]/.test(passwordValue)} text="Uppercase" />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <RequirementItem met={/[0-9]/.test(passwordValue)} text="Number" />
                                    <RequirementItem met={/[@$!%*?&]/.test(passwordValue)} text="Special Char" />
                                  </Grid>
                                </Grid>
                              </Box>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Box>
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div variants={itemVariants}>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            fullWidth
                            size={isSmallMobile ? "small" : "medium"}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockRounded sx={{ color: errors.confirmPassword ? "error.main" : "#2E7D32", opacity: 0.8 }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={inputStyles}
                          />
                        )}
                      />
                    </motion.div>

                    {/* Terms */}
                    <motion.div variants={itemVariants}>
                      <Box>
                        <FormControlLabel
                          control={
                            <Controller
                              name="terms"
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  {...field}
                                  checked={field.value}
                                  size="small"
                                  sx={{ color: "#2E7D32", "&.Mui-checked": { color: "#2E7D32" } }}
                                />
                              )}
                            />
                          }
                          label={
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", md: "0.85rem" }, lineHeight: 1.4 }}>
                              I agree to the{" "}
                              <span style={{ fontWeight: 700, color: "#2E7D32", cursor: "pointer" }}>Terms</span> and{" "}
                              <span style={{ fontWeight: 700, color: "#2E7D32", cursor: "pointer" }}>Privacy Policy</span>
                            </Typography>
                          }
                          sx={{ alignItems: "flex-start", ml: 0 }}
                        />
                        {errors.terms && (
                          <Typography variant="caption" color="error" sx={{ ml: 4, display: "block" }}>
                            {errors.terms.message}
                          </Typography>
                        )}
                      </Box>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting}
                        startIcon={!isSubmitting && <AppRegistration />}
                        endIcon={!isSubmitting && <ArrowForward />}
                        sx={{
                          py: { xs: 1.3, md: 1.6 },
                          borderRadius: 50,
                          fontSize: { xs: "0.85rem", md: "0.95rem" },
                          fontWeight: 700,
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
                          "&:hover": { boxShadow: "0 15px 40px rgba(46, 125, 50, 0.4)" },
                        }}
                      >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
                      </Button>
                    </motion.div>
                  </Stack>
                </form>

                {/* Google Signup */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ my: 2, display: "flex", alignItems: "center" }}>
                    <Divider sx={{ flex: 1, borderColor: "rgba(0,0,0,0.08)" }} />
                    <Typography variant="caption" sx={{ px: 2, color: "text.secondary", fontWeight: 600, fontSize: "0.7rem" }}>
                      OR
                    </Typography>
                    <Divider sx={{ flex: 1, borderColor: "rgba(0,0,0,0.08)" }} />
                  </Box>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Google />}
                    onClick={handleGoogleSignup}
                    sx={{
                      py: { xs: 1.1, md: 1.3 },
                      borderRadius: 3,
                      borderColor: "#e0e0e0",
                      color: "text.primary",
                      fontWeight: 600,
                      textTransform: "none",
                      backgroundColor: "#fff",
                      fontSize: { xs: "0.8rem", md: "0.9rem" },
                      "&:hover": {
                        borderColor: "#2E7D32",
                        backgroundColor: "rgba(46, 125, 50, 0.04)",
                      },
                    }}
                  >
                    Sign up with Google
                  </Button>
                </motion.div>

                {/* Login Link */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", md: "0.85rem" } }}>
                      Already have an account?{" "}
                      <Link to="/login" style={{ textDecoration: "none" }}>
                        <Typography
                          component="span"
                          sx={{ fontWeight: 800, color: "#2E7D32", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        >
                          Sign In
                        </Typography>
                      </Link>
                    </Typography>
                  </Box>
                </motion.div>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;

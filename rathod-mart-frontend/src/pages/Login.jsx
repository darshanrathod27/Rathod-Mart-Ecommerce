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
  Divider,
  Alert,
  Stack,
  CircularProgress,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Google,
  ShoppingBag,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Particles */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100, -20],
              x: [-20, 20, -20],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: 20 + i * 10,
              height: 20 + i * 10,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Brand Logo */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <ShoppingBag
                    sx={{ fontSize: 40, color: "primary.main", mr: 1 }}
                  />
                  <Typography
                    variant="h4"
                    component="h1"
                    color="primary"
                    fontWeight="bold"
                  >
                    Rathod Mart
                  </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  Welcome Back
                </Typography>
              </Box>

              {/* Error Alert */}
              {authError && (
                <Alert
                  severity="error"
                  onClose={() => setAuthError("")}
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  {authError}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2.5}>
                  {/* Email Field */}
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  {/* Password Field */}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  {/* Forgot Password Link */}
                  <Box sx={{ textAlign: "right", mt: 1 }}>
                    <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#2E7D32",
                          fontWeight: 600,
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Forgot Password?
                      </Typography>
                    </Link>
                  </Box>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      background: isSubmitting
                        ? "linear-gradient(135deg, #81C784 0%, #A5D6A7 100%)"
                        : "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
                      boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)",
                        boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                      },
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={26} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Stack>
              </form>

              {/* Divider */}
              <Box sx={{ my: 3, display: "flex", alignItems: "center" }}>
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant="body2"
                  sx={{ px: 2, color: "text.secondary", fontWeight: 500 }}
                >
                  OR
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {/* Google Button */}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Google />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1.3,
                  borderRadius: 2,
                  borderColor: "#e0e0e0",
                  color: "text.primary",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  backgroundColor: "#fff",
                  "&:hover": {
                    borderColor: "#2E7D32",
                    backgroundColor: "rgba(46, 125, 50, 0.04)",
                  },
                }}
              >
                Continue with Google
              </Button>

              {/* Register Link */}
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  New to Rathod Mart?{" "}
                  <Link to="/register" style={{ textDecoration: "none" }}>
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 700,
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
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;

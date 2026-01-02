// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  ShoppingBag,
  Google,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/authSlice";
import api from "../services/api";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // If user is already logged in, redirect them away from login page
  const { isAuthenticated } = useSelector((state) => state.auth);
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call the updated admin login endpoint
      const res = await api.post("/users/admin-login", {
        email: formData.email,
        password: formData.password,
      });

      // Dispatch user info to Redux
      dispatch(setCredentials(res.data));

      toast.success(`Welcome back, ${res.data.name}!`);

      // Navigate to where they wanted to go, or home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Admin Google OAuth endpoint
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || "http://localhost:5000";
    window.location.href = `${apiBaseUrl}/api/users/admin-google`;
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
            <CardContent sx={{ p: 4 }}>
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
                  Admin & Staff Login
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />

                {/* Forgot Password Link */}
                <Box sx={{ textAlign: "right", mb: 2 }}>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: "#2E7D32",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1.5,
                    fontSize: "1.1rem",
                    background: loading
                      ? "linear-gradient(135deg, #81C784 0%, #A5D6A7 100%)"
                      : "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)",
                    },
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>

                {/* Divider */}
                <Box sx={{ my: 2, display: "flex", alignItems: "center" }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{ px: 2, color: "text.secondary", fontWeight: 500 }}
                  >
                    OR
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                {/* Google Login Button */}
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

                <Box sx={{ textAlign: "center", mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      style={{
                        color: "#2E7D32",
                        fontWeight: "bold",
                        textDecoration: "none",
                      }}
                    >
                      Create Account
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;

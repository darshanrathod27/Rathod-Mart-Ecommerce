// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Email,
  ShoppingBag,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import api from "../data/api";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      await api.post("/users/forgot-password", { email });
      setSuccess(true);
      toast.success("Password reset link sent!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset email. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
                  Reset Your Password
                </Typography>
              </Box>

              {success ? (
                // Success State
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CheckCircle
                    sx={{ fontSize: 80, color: "success.main", mb: 2 }}
                  />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Check Your Email
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    We've sent a password reset link to{" "}
                    <strong>{email}</strong>. The link will expire in 10 minutes.
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Don't see the email? Check your spam folder.
                  </Typography>
                  <Link
                    to="/login"
                    style={{
                      color: "#2E7D32",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    ← Back to Login
                  </Link>
                </Box>
              ) : (
                // Form State
                <>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, textAlign: "center" }}
                  >
                    Enter your email address and we'll send you a link to
                    reset your password.
                  </Typography>

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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 3 }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: "none",
                        background: loading
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
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <Box sx={{ textAlign: "center", mt: 3 }}>
                      <Link
                        to="/login"
                        style={{
                          color: "#2E7D32",
                          fontWeight: "bold",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <ArrowBack sx={{ fontSize: 18 }} />
                        Back to Login
                      </Link>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ForgotPassword;

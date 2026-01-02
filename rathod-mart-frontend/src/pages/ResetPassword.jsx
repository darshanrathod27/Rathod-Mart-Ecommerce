// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  LinearProgress,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Visibility,
  VisibilityOff,
  Lock,
  ShoppingBag,
  CheckCircle,
  Cancel,
  Error as ErrorIcon,
} from "@mui/icons-material";
import api from "../data/api";
import toast from "react-hot-toast";

// Password Strength Component
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
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color="text.secondary">
          Password Strength
        </Typography>
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{ color: getColor() }}
        >
          {getLabel()}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={(strength / 4) * 100}
        sx={{
          height: 5,
          borderRadius: 3,
          bgcolor: "#f0f0f0",
          "& .MuiLinearProgress-bar": {
            bgcolor: getColor(),
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
};

// Requirement Check Item
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

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await api.post(`/users/reset-password/${token}`, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setSuccess(true);
      toast.success("Password reset successful!", {
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#2E7D32",
          color: "#fff",
        },
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Password reset failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)",
        }}
      >
        <Card sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
          <ErrorIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Invalid Reset Link
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            This password reset link is invalid or has expired.
          </Typography>
          <Link
            to="/forgot-password"
            style={{ color: "#2E7D32", fontWeight: "bold" }}
          >
            Request a new link
          </Link>
        </Card>
      </Box>
    );
  }

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
      {/* Animated Background */}
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
                  Create New Password
                </Typography>
              </Box>

              {success ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CheckCircle
                    sx={{ fontSize: 80, color: "success.main", mb: 2 }}
                  />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Password Reset Successful!
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Your password has been updated. Redirecting to login...
                  </Typography>
                </Box>
              ) : (
                <>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        autoComplete="new-password"
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
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Password Strength Feedback */}
                      {formData.password && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: "rgba(46, 125, 50, 0.04)",
                            borderRadius: 2,
                          }}
                        >
                          <PasswordStrengthBar password={formData.password} />
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Box>
                              <RequirementItem
                                met={formData.password?.length >= 8}
                                text="8+ chars"
                              />
                              <RequirementItem
                                met={/[A-Z]/.test(formData.password)}
                                text="Uppercase"
                              />
                            </Box>
                            <Box>
                              <RequirementItem
                                met={/[0-9]/.test(formData.password)}
                                text="Number"
                              />
                              <RequirementItem
                                met={/[@$!%*?&]/.test(formData.password)}
                                text="Special"
                              />
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Box>

                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
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
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
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
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>

                    <Box sx={{ textAlign: "center", mt: 3 }}>
                      <Link
                        to="/login"
                        style={{
                          color: "#2E7D32",
                          fontWeight: "bold",
                          textDecoration: "none",
                        }}
                      >
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

export default ResetPassword;

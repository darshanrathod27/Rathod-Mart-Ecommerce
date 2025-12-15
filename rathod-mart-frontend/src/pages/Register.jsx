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
  Container,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  Google,
  ShoppingBag,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
    <Box sx={{ mt: 1 }}>
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

// --- Requirement Check Item ---
const RequirementItem = ({ met, text }) => (
  <Stack direction="row" alignItems="center" gap={0.5}>
    {met ? (
      <CheckCircle sx={{ fontSize: 12, color: "success.main" }} />
    ) : (
      <Cancel sx={{ fontSize: 12, color: "text.disabled" }} />
    )}
    <Typography
      variant="caption"
      color={met ? "text.primary" : "text.disabled"}
      sx={{ fontSize: "0.7rem" }}
    >
      {text}
    </Typography>
  </Stack>
);

const Register = () => {
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
              <Box sx={{ textAlign: "center", mb: 3 }}>
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
                  Create Account
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
                <Stack spacing={2}>
                  {/* Full Name */}
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Full Name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
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

                  {/* Email */}
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
                              <Email color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  {/* Password */}
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
                          error={!!errors.password}
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

                    {/* Password Feedback */}
                    {passwordValue && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          bgcolor: "rgba(46, 125, 50, 0.04)",
                          borderRadius: 2,
                        }}
                      >
                        <PasswordStrengthBar password={passwordValue} />
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                          <Box>
                            <RequirementItem met={passwordValue?.length >= 8} text="8+ chars" />
                            <RequirementItem met={/[A-Z]/.test(passwordValue)} text="Uppercase" />
                          </Box>
                          <Box>
                            <RequirementItem met={/[0-9]/.test(passwordValue)} text="Number" />
                            <RequirementItem met={/[@$!%*?&]/.test(passwordValue)} text="Special" />
                          </Box>
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  {/* Confirm Password */}
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        fullWidth
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  {/* Terms */}
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
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                          I agree to the{" "}
                          <span style={{ fontWeight: 700, color: "#2E7D32" }}>Terms</span> and{" "}
                          <span style={{ fontWeight: 700, color: "#2E7D32" }}>Privacy Policy</span>
                        </Typography>
                      }
                    />
                    {errors.terms && (
                      <Typography variant="caption" color="error" sx={{ ml: 4, display: "block" }}>
                        {errors.terms.message}
                      </Typography>
                    )}
                  </Box>

                  {/* Submit Button */}
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
                      "Create Account"
                    )}
                  </Button>
                </Stack>
              </form>

              {/* Divider */}
              <Box sx={{ my: 2.5, display: "flex", alignItems: "center" }}>
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
                onClick={handleGoogleSignup}
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
                Sign up with Google
              </Button>

              {/* Login Link */}
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 700,
                        color: "#2E7D32",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Sign In
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

export default Register;

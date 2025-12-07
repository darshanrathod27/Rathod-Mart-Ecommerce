import React, { useState } from "react";
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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailRounded,
  LockRounded,
  Google,
  Login as LoginIcon,
  ArrowForward,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Local imports
import api from "../data/api";
import { setCredentials } from "../store/authSlice";
import AuthLayout from "../components/common/AuthLayout";

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

// --- ANIMATION CONFIG ---
const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Login = () => {
  // --- STATE & HOOKS ---
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

  // --- HANDLERS ---
  const onSubmit = async (data) => {
    setAuthError("");
    try {
      const res = await api.post("/users/login", data);
      dispatch(setCredentials(res.data));
      toast.success(`Welcome back, ${res.data.name}!`, {
        icon: "👋",
        style: {
          borderRadius: "10px",
          background: "#333",
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
    toast("Google Login coming soon!", { icon: "🚀" });
  };

  return (
    // Pass a specific illustration for Login
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to your account."
      welcomeImage="https://cdni.iconscout.com/illustration/premium/thumb/login-page-4468581-3783954.png"
    >
      <motion.div variants={formVariants} initial="hidden" animate="visible">
        {/* Error Alert */}
        <Box sx={{ mb: 2 }}>
          <Collapse in={!!authError}>
            <Alert
              severity="error"
              onClose={() => setAuthError("")}
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.1)",
              }}
            >
              {authError}
            </Alert>
          </Collapse>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
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
                              color: errors.email
                                ? "error.main"
                                : "primary.main",
                              opacity: 0.8,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        backgroundColor: "#f9f9f9",
                        "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                        "&:hover fieldset": { borderColor: "primary.main" },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          borderWidth: 2,
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
                                color: errors.password
                                  ? "error.main"
                                  : "primary.main",
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          backgroundColor: "#f9f9f9",
                          "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                          "&:hover fieldset": { borderColor: "primary.main" },
                          "&.Mui-focused fieldset": {
                            borderColor: "primary.main",
                            borderWidth: 2,
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
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            defaultChecked
                            sx={{
                              color: "#2E7D32",
                              "&.Mui-checked": { color: "#2E7D32" },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            Remember me
                          </Typography>
                        }
                      />
                      <Link
                        to="/forgot-password"
                        style={{ textDecoration: "none" }}
                      >
                        <Typography
                          variant="caption"
                          color="primary.main"
                          fontWeight="700"
                          sx={{ "&:hover": { textDecoration: "underline" } }}
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
                  py: 1.8,
                  borderRadius: 50,
                  fontSize: "1rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                  boxShadow: "0 10px 20px rgba(46, 125, 50, 0.2)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                    boxShadow: "0 15px 30px rgba(46, 125, 50, 0.3)",
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

        {/* Social Login Section */}
        <motion.div variants={itemVariants}>
          <Box sx={{ my: 3, display: "flex", alignItems: "center" }}>
            <Divider sx={{ flex: 1, borderColor: "rgba(0,0,0,0.1)" }} />
            <Typography
              variant="caption"
              sx={{ px: 2, color: "text.secondary", fontWeight: 600 }}
            >
              OR LOGIN WITH
            </Typography>
            <Divider sx={{ flex: 1, borderColor: "rgba(0,0,0,0.1)" }} />
          </Box>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            sx={{
              py: 1.5,
              borderRadius: 3,
              borderColor: "#e0e0e0",
              color: "text.primary",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#fff",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#2E7D32",
                backgroundColor: "rgba(46, 125, 50, 0.04)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Google
          </Button>
        </motion.div>

        {/* Register Footer */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              New to Rathod Mart?{" "}
              <Link to="/register" style={{ textDecoration: "none" }}>
                <Typography
                  component="span"
                  fontWeight="800"
                  color="primary.main"
                  sx={{
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
    </AuthLayout>
  );
};

export default Login;

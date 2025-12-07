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
  Collapse,
  LinearProgress,
  Grid, // ✅ Grid is now imported correctly
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
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Local imports
import api from "../data/api";
import { setCredentials } from "../store/authSlice";
import AuthLayout from "../components/common/AuthLayout";

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

// --- HELPER COMPONENTS ---

// Password Strength Meter
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
    switch (strength) {
      case 0:
        return "#e0e0e0";
      case 1:
        return "#f44336"; // Weak
      case 2:
        return "#ff9800"; // Fair
      case 3:
        return "#2196f3"; // Good
      case 4:
        return "#4caf50"; // Strong
      default:
        return "#e0e0e0";
    }
  };

  const getLabel = () => {
    switch (strength) {
      case 0:
        return "";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  return (
    <Box sx={{ mt: 1, mb: 0.5 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color="text.secondary">
          Strength
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
          height: 4,
          borderRadius: 2,
          bgcolor: "#f0f0f0",
          "& .MuiLinearProgress-bar": {
            bgcolor: getColor(),
            borderRadius: 2,
            transition: "all 0.4s ease",
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
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Registration failed. Try again.";
      setAuthError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      title="Join Us!"
      subtitle="Create an account to start shopping."
      welcomeImage="https://cdni.iconscout.com/illustration/premium/thumb/sign-up-4468580-3783953.png"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <Collapse in={!!authError}>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setAuthError("")}
          >
            {authError}
          </Alert>
        </Collapse>

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
                  placeholder="e.g. John Doe"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRounded
                          sx={{
                            color: errors.name ? "error.main" : "primary.main",
                            opacity: 0.8,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "#f9f9f9",
                    },
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
                  placeholder="name@example.com"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRounded
                          sx={{
                            color: errors.email ? "error.main" : "primary.main",
                            opacity: 0.8,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "#f9f9f9",
                    },
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
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "#f9f9f9",
                      },
                    }}
                  />
                )}
              />

              {/* Live Password Feedback */}
              <Collapse in={!!passwordValue}>
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    bgcolor: "rgba(46, 125, 50, 0.04)",
                    borderRadius: 2,
                  }}
                >
                  <PasswordStrengthBar password={passwordValue} />
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <RequirementItem
                        met={passwordValue?.length >= 8}
                        text="8+ Characters"
                      />
                      <RequirementItem
                        met={/[A-Z]/.test(passwordValue)}
                        text="Uppercase"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <RequirementItem
                        met={/[0-9]/.test(passwordValue)}
                        text="Number"
                      />
                      <RequirementItem
                        met={/[@$!%*?&]/.test(passwordValue)}
                        text="Special Char"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
              {errors.password && !passwordValue && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 2, mt: 0.5 }}
                >
                  {errors.password.message}
                </Typography>
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
                        <LockRounded
                          sx={{
                            color: errors.confirmPassword
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "#f9f9f9",
                    },
                  }}
                />
              )}
            />

            {/* Terms & Conditions */}
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
                        sx={{
                          color: "#2E7D32",
                          "&.Mui-checked": { color: "#2E7D32" },
                        }}
                      />
                    )}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.3, fontSize: "0.85rem" }}
                  >
                    I agree to the{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#2E7D32",
                        cursor: "pointer",
                      }}
                    >
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#2E7D32",
                        cursor: "pointer",
                      }}
                    >
                      Privacy Policy
                    </span>
                    .
                  </Typography>
                }
                sx={{ alignItems: "flex-start", ml: 0 }}
              />
              {errors.terms && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 4, display: "block" }}
                >
                  {errors.terms.message}
                </Typography>
              )}
            </Box>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                startIcon={!isSubmitting && <AppRegistration />}
                sx={{
                  py: 1.8,
                  borderRadius: 50,
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                  boxShadow: "0 10px 20px rgba(46, 125, 50, 0.2)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                    boxShadow: "0 15px 30px rgba(46, 125, 50, 0.3)",
                  },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={26} color="inherit" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>
          </Stack>
        </form>

        {/* Login Link */}
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Typography
                component="span"
                fontWeight="800"
                color="primary.main"
                sx={{
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Sign In
              </Typography>
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </AuthLayout>
  );
};

export default Register;

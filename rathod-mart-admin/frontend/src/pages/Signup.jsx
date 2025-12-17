// frontend/src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import {
    Visibility,
    VisibilityOff,
    Person,
    Lock,
    Email,
    ShoppingBag,
    Badge,
    Google,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/authSlice";
import api from "../services/api";
import toast from "react-hot-toast";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "staff",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // If user is already logged in, redirect them away from signup page
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

        // Validation
        if (!formData.name.trim()) {
            setError("Name is required");
            setLoading(false);
            return;
        }

        if (!formData.email.trim()) {
            setError("Email is required");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // Call the admin registration endpoint
            const res = await api.post("/users/admin-register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            // Dispatch user info to Redux
            dispatch(setCredentials(res.data));

            toast.success(`Welcome, ${res.data.name}! Account created successfully.`);

            // Navigate to dashboard
            navigate("/", { replace: true });
        } catch (err) {
            const msg =
                err.response?.data?.message || err.message || "Registration failed.";
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
                                    Create Admin Account
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
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    autoComplete="name"
                                    autoFocus
                                    value={formData.name}
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
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 2 }}
                                />

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel id="role-label">Role</InputLabel>
                                    <Select
                                        labelId="role-label"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        label="Role"
                                        onChange={handleChange}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Badge color="primary" />
                                            </InputAdornment>
                                        }
                                    >
                                        <MenuItem value="staff">Staff</MenuItem>
                                        <MenuItem value="manager">Manager</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
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
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
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
                                                    aria-label="toggle confirm password visibility"
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
                                    {loading ? "Creating Account..." : "Create Account"}
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
                                        Already have an account?{" "}
                                        <Link
                                            to="/login"
                                            style={{
                                                color: "#2E7D32",
                                                fontWeight: "bold",
                                                textDecoration: "none",
                                            }}
                                        >
                                            Sign In
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

export default Signup;

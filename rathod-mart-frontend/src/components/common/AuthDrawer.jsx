// src/components/common/AuthDrawer.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Close,
  Login,
  AppRegistration,
  ShoppingCart,
  Favorite,
  Google,
  LockOutlined,
} from "@mui/icons-material";
import { closeLoginDrawer } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AuthDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoginDrawerOpen } = useSelector((state) => state.auth);

  const handleClose = () => {
    dispatch(closeLoginDrawer());
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  const handleGoogleLogin = () => {
    handleClose();
    const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    window.location.href = `${apiBaseUrl}/api/users/google`;
  };

  return (
    <AnimatePresence>
      {isLoginDrawerOpen && (
        <Dialog
          open={isLoginDrawerOpen}
          onClose={handleClose}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            component: motion.div,
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 20 },
            transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          {/* Header with gradient background */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #00BFA5 100%)",
              p: 3,
              pb: 4,
              position: "relative",
              textAlign: "center",
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "white",
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              }}
            >
              <Close />
            </IconButton>

            {/* Lock icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  bgcolor: "rgba(255,255,255,0.2)",
                  margin: "0 auto",
                  mb: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <LockOutlined sx={{ fontSize: 35, color: "white" }} />
              </Avatar>
            </motion.div>

            <Typography
              variant="h5"
              sx={{ color: "white", fontWeight: 800, mb: 1 }}
            >
              Login Required
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.9)", maxWidth: "80%", margin: "0 auto" }}
            >
              Please sign in to continue
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {/* Features list */}
            <Box sx={{ mb: 3 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <ShoppingCart sx={{ color: "#2E7D32", fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Add items to your cart
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Favorite sx={{ color: "#e91e63", fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Save products to wishlist
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Action buttons */}
            <Stack spacing={2}>
              {/* Login button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Login />}
                  onClick={() => handleNavigate("/login")}
                  sx={{
                    borderRadius: 50,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                    boxShadow: "0 8px 20px rgba(46, 125, 50, 0.3)",
                    "&:hover": {
                      boxShadow: "0 12px 30px rgba(46, 125, 50, 0.4)",
                    },
                  }}
                >
                  Sign In
                </Button>
              </motion.div>

              {/* Divider */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  OR
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {/* Google button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Google />}
                  onClick={handleGoogleLogin}
                  sx={{
                    borderRadius: 50,
                    py: 1.3,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: "#ddd",
                    color: "text.primary",
                    "&:hover": {
                      borderColor: "#2E7D32",
                      bgcolor: "rgba(46, 125, 50, 0.04)",
                    },
                  }}
                >
                  Continue with Google
                </Button>
              </motion.div>

              {/* Register button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="text"
                  size="large"
                  fullWidth
                  startIcon={<AppRegistration />}
                  onClick={() => handleNavigate("/register")}
                  sx={{
                    borderRadius: 50,
                    py: 1.3,
                    fontWeight: 600,
                    textTransform: "none",
                    color: "#2E7D32",
                  }}
                >
                  Create New Account
                </Button>
              </motion.div>
            </Stack>
          </Box>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default AuthDrawer;

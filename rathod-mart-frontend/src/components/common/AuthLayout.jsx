import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import { Store } from "@mui/icons-material";

// --- Background Components ---
const FloatingCircle = ({ size, top, left, right, bottom, color, delay }) => (
  <Box
    component={motion.div}
    animate={{
      y: [0, -40, 0],
      x: [0, 20, 0],
      scale: [1, 1.1, 1],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 15 + delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    sx={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      filter: "blur(50px)",
      top,
      left,
      right,
      bottom,
      zIndex: 0,
      opacity: 0.6,
    }}
  />
);

const AuthLayout = ({ children, title, subtitle, welcomeImage }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Modern Gradient Background
        background: "linear-gradient(135deg, #f0f4f0 0%, #e8f5e9 100%)",
        position: "relative",
        overflow: "hidden",
        py: 4,
      }}
    >
      {/* --- Animated Background Elements --- */}
      <FloatingCircle
        size={isMobile ? "200px" : "400px"}
        top="-10%"
        left="-10%"
        color="rgba(46, 125, 50, 0.2)"
        delay={0}
      />
      <FloatingCircle
        size={isMobile ? "250px" : "500px"}
        bottom="-10%"
        right="-5%"
        color="rgba(0, 191, 165, 0.15)"
        delay={2}
      />

      {/* --- Main Card Container --- */}
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Paper
            elevation={24}
            sx={{
              display: "flex",
              overflow: "hidden",
              borderRadius: "32px", // Extremely rounded, modern corners
              background: "rgba(255, 255, 255, 0.85)", // Glass effect base
              backdropFilter: "blur(20px) saturate(180%)", // The "Glassmorphism" blur
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 20px 80px rgba(0, 50, 20, 0.15)", // Soft green-tinted shadow
              minHeight: "600px",
            }}
          >
            {/* --- Left Side: Content Form --- */}
            <Box
              sx={{
                flex: { xs: 1, md: 0.55 }, // Takes full width on mobile, 55% on desktop
                p: { xs: 3, sm: 6 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Brand Logo */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 40,
                    height: 40,
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                  }}
                >
                  <Store fontSize="small" />
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight="800"
                  sx={{
                    background: "linear-gradient(45deg, #2E7D32, #00BFA5)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Rathod Mart
                </Typography>
              </Box>

              <Box sx={{ mt: 3, mb: 4 }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography
                    variant="h4"
                    fontWeight="900"
                    color="#1a1a1a"
                    sx={{ mb: 1 }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {subtitle}
                  </Typography>
                </motion.div>
              </Box>

              {/* Form Content Injected Here */}
              {children}
            </Box>

            {/* --- Right Side: Visual (Desktop Only) --- */}
            {!isMobile && (
              <Box
                sx={{
                  flex: 0.45,
                  position: "relative",
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  p: 4,
                }}
              >
                {/* Decorative Circles Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "-20%",
                    right: "-20%",
                    width: "400px",
                    height: "400px",
                    border: "2px solid rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "-10%",
                    left: "-10%",
                    width: "300px",
                    height: "300px",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />

                <Box
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <motion.img
                    src={
                      welcomeImage ||
                      "https://ouch-cdn2.icons8.com/N8J9qXqq8J9qXqq8J9qXqq8J9qXqq8J9qXqq8.png"
                    } // Placeholder illustration
                    alt="Shopping"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "350px",
                      marginBottom: "20px",
                      dropShadow: "0 20px 40px rgba(0,0,0,0.3)",
                    }}
                  />
                  <Typography variant="h5" fontWeight="700" sx={{ mb: 1 }}>
                    Fresh Groceries
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Delivered to your doorstep within minutes.
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AuthLayout;

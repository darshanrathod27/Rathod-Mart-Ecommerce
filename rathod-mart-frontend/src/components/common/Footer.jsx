import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  Stack,
  Fab,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Instagram,
  Twitter,
  YouTube,
  LinkedIn,
  Email,
  Phone,
  Store,
  ArrowUpward,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();

  // 🎯 Responsive Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  // eslint-disable-next-line no-unused-vars
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600-900px

  const [showScroll, setShowScroll] = useState(false);

  // Check scroll position for "Back to Top" button
  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const socialIcons = [
    { icon: <Instagram />, color: "#E4405F", name: "Instagram" },
    { icon: <Twitter />, color: "#1DA1F2", name: "Twitter" },
    { icon: <YouTube />, color: "#FF0000", name: "YouTube" },
    { icon: <LinkedIn />, color: "#0077B5", name: "LinkedIn" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.4 : 0.6,
        staggerChildren: isMobile ? 0.05 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isMobile ? 10 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: isMobile ? 0.3 : 0.4 },
    },
  };

  return (
    <Box
      sx={{
        // 📱 Responsive Top Margin
        mt: { xs: 4, sm: 5, md: 6 },
        position: "relative",
      }}
    >
      {/* Main Footer */}
      <Box
        component="footer"
        sx={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(0, 191, 165, 0.1) 0%, #1B5E20 40%)",
          color: "rgba(255, 255, 255, 0.8)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Background Pattern - Hide on small mobile */}
        {!isSmallMobile && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.03,
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(255, 255, 255, 0.05) 35px,
                rgba(255, 255, 255, 0.05) 70px
              )`,
              pointerEvents: "none",
            }}
          />
        )}

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            // 📱 Responsive Padding
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Box
              sx={{
                // 📱 Responsive Vertical Padding
                py: { xs: 3, sm: 4, md: 5 },
              }}
            >
              <Grid
                container
                spacing={{ xs: 3, sm: 3.5, md: 4 }}
                alignItems={{ xs: "center", md: "center" }}
              >
                {/* Brand Section */}
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Stack
                      spacing={{ xs: 1.5, md: 2 }}
                      alignItems={{ xs: "center", md: "flex-start" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 0.75, md: 1 },
                        }}
                      >
                        <Store
                          sx={{
                            color: "#00BFA5",
                            // 📱 Responsive Icon Size
                            fontSize: { xs: 28, sm: 30, md: 32 },
                          }}
                        />
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: "white",
                            // 📱 Responsive Font Size
                            fontSize: {
                              xs: "1.3rem",
                              sm: "1.5rem",
                              md: "1.8rem",
                            },
                            letterSpacing: "-0.5px",
                          }}
                        >
                          Rathod Mart
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          // 📱 Responsive Font Size
                          fontSize: { xs: "0.9rem", md: "1rem" },
                          fontWeight: 500,
                          textAlign: { xs: "center", md: "left" },
                        }}
                      >
                        Premium shopping experience
                      </Typography>
                    </Stack>
                  </motion.div>
                </Grid>

                {/* Contact Info */}
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Stack spacing={{ xs: 1.2, md: 1.5 }} alignItems="center">
                      {/* Email */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 1, md: 1.5 },
                          // 📱 Touch-friendly on mobile
                          minHeight: { xs: 44, md: "auto" },
                        }}
                      >
                        <Email
                          sx={{
                            color: "#00BFA5",
                            // 📱 Responsive Icon Size
                            fontSize: { xs: 16, md: 18 },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            // 📱 Responsive Font Size
                            fontSize: { xs: "0.85rem", md: "0.9rem" },
                            wordBreak: "break-word",
                          }}
                        >
                          info@rathodmart.com
                        </Typography>
                      </Box>

                      {/* Phone */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 1, md: 1.5 },
                          // 📱 Touch-friendly on mobile
                          minHeight: { xs: 44, md: "auto" },
                        }}
                      >
                        <Phone
                          sx={{
                            color: "#00BFA5",
                            // 📱 Responsive Icon Size
                            fontSize: { xs: 16, md: 18 },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            // 📱 Responsive Font Size
                            fontSize: { xs: "0.85rem", md: "0.9rem" },
                          }}
                        >
                          +91 12345 67890
                        </Typography>
                      </Box>
                    </Stack>
                  </motion.div>
                </Grid>

                {/* Social Media */}
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Box
                      sx={{
                        textAlign: { xs: "center", md: "right" },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: { xs: 1.5, md: 2 },
                          color: "white",
                          // 📱 Responsive Font Size
                          fontSize: { xs: "1rem", md: "1.1rem" },
                        }}
                      >
                        Follow Us
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: { xs: "center", md: "flex-end" },
                          gap: { xs: 1, md: 1 },
                          flexWrap: "wrap",
                        }}
                      >
                        {socialIcons.map((social, index) => (
                          <motion.div
                            key={index}
                            whileHover={
                              !isMobile
                                ? {
                                    scale: 1.15,
                                    rotate: 15,
                                  }
                                : { scale: 1.05 }
                            }
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                          >
                            <IconButton
                              sx={{
                                // 📱 Responsive Icon Button Size
                                width: { xs: 44, sm: 42, md: 40 },
                                height: { xs: 44, sm: 42, md: 40 },
                                background: "rgba(255, 255, 255, 0.1)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                color: social.color,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  background: "rgba(255, 255, 255, 0.2)",
                                  boxShadow: `0 4px 15px ${social.color}40`,
                                },
                                // 📱 Responsive Icon Size
                                "& svg": {
                                  fontSize: { xs: 20, md: 22 },
                                },
                              }}
                              aria-label={social.name}
                            >
                              {social.icon}
                            </IconButton>
                          </motion.div>
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>

              {/* Divider - Optional, looks better on mobile */}
              {isMobile && (
                <Divider
                  sx={{
                    my: 3,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                />
              )}

              {/* Copyright */}
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Box
                  sx={{
                    // 📱 Responsive Top Margin and Padding
                    mt: { xs: 2, md: 4 },
                    pt: { xs: 2, md: 3 },
                    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      // 📱 Responsive Font Size
                      fontSize: { xs: "0.8rem", sm: "0.85rem" },
                      lineHeight: 1.5,
                    }}
                  >
                    © 2025 Rathod Mart. All rights reserved.
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Back to Top Floating Button */}
      <AnimatePresence>
        {showScroll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Fab
              onClick={scrollToTop}
              sx={{
                position: "fixed",
                // 📱 Responsive Bottom Position
                bottom: { xs: 20, sm: 25, md: 30 },
                // 📱 Responsive Right Position
                right: { xs: 20, sm: 25, md: 30 },
                // 📱 Responsive Size
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 },
                background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                color: "white",
                zIndex: 1000,
                boxShadow: "0 4px 20px rgba(46, 125, 50, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #388E3C 0%, #00796B 100%)",
                  transform: "scale(1.1)",
                  boxShadow: "0 6px 25px rgba(46, 125, 50, 0.5)",
                },
                transition: "all 0.3s ease-in-out",
                // 📱 Touch-friendly
                "&:active": {
                  transform: "scale(0.95)",
                },
                // 📱 Responsive Icon Size
                "& svg": {
                  fontSize: { xs: 20, md: 24 },
                },
              }}
              aria-label="scroll back to top"
            >
              <ArrowUpward />
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Footer;

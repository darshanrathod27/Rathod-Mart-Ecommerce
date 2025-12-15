// src/components/home/OfferGridCard.jsx - PERFECT MOBILE RESPONSIVE
import React from "react";
import {
  Card,
  Typography,
  Grid,
  Box,
  Link as MuiLink,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Savings, Loyalty } from "@mui/icons-material";

const OfferGridCard = ({
  title,
  products,
  linkText,
  linkTo,
  isSignIn,
  isAuthenticated,
  userInfo,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // 🎯 Responsive Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  // ========================================
  // SIGN IN / WELCOME CARD (Authenticated User)
  // ========================================
  if (isSignIn) {
    if (isAuthenticated) {
      return (
        <motion.div
          whileHover={!isMobile ? { y: -5 } : {}}
          whileTap={{ scale: 0.98 }}
          style={{ height: "100%" }}
        >
          <Card
            sx={{
              p: { xs: 2, sm: 2.5, md: 2.5 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              background: "linear-gradient(145deg, #e8f5e9, #c8e6c9)",
              borderRadius: { xs: 2, md: 2.5 },
              boxShadow: { xs: 1, md: 2 },
            }}
          >
            <Avatar
              sx={{
                width: { xs: 48, sm: 52, md: 56 },
                height: { xs: 48, sm: 52, md: 56 },
                bgcolor: "primary.main",
                mb: { xs: 1.5, md: 1.5 },
              }}
            >
              {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
            </Avatar>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              }}
            >
              Welcome, {userInfo?.name || "User"}!
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mb: { xs: 2, md: 2 },
                color: "text.secondary",
                fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.875rem" },
              }}
            >
              Refer a friend & earn ₹100
            </Typography>

            <Button
              variant="contained"
              fullWidth
              startIcon={<Loyalty />}
              sx={{
                background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                borderRadius: { xs: 2, md: 2.5 },
                py: { xs: 1.2, md: 1.5 },
                fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                fontWeight: 600,
                minHeight: { xs: 44, md: 48 }, // Touch-friendly
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                  transform: isMobile ? "none" : "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => navigate("/profile")}
            >
              Refer & Earn
            </Button>
          </Card>
        </motion.div>
      );
    }

    // ========================================
    // SIGN IN CARD (Not Authenticated)
    // ========================================
    return (
      <motion.div
        whileHover={!isMobile ? { y: -5 } : {}}
        whileTap={{ scale: 0.98 }}
        style={{ height: "100%" }}
      >
        <Card
          sx={{
            p: { xs: 2, sm: 2.5, md: 2.5 },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            background: "linear-gradient(145deg, #e8f5e9, #c8e6c9)",
            borderRadius: { xs: 2, md: 2.5 },
            boxShadow: { xs: 1, md: 2 },
          }}
        >
          <Savings
            sx={{
              fontSize: { xs: 36, sm: 38, md: 40 },
              color: "primary.main",
              mb: { xs: 1, md: 1 },
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            Get ₹50 Cashback!
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: { xs: 2, md: 2 },
              color: "text.secondary",
              fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.875rem" },
            }}
          >
            On your first order after login
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
              borderRadius: { xs: 2, md: 2.5 },
              py: { xs: 1.2, md: 1.5 },
              fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
              fontWeight: 600,
              minHeight: { xs: 44, md: 48 }, // Touch-friendly
              "&:hover": {
                background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                transform: isMobile ? "none" : "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/login")}
          >
            Sign in Securely
          </Button>
        </Card>
      </motion.div>
    );
  }

  // ========================================
  // REGULAR OFFER CARD (Products Grid)
  // ========================================
  return (
    <motion.div
      whileHover={!isMobile ? { y: -5 } : {}}
      whileTap={{ scale: 0.98 }}
      style={{ height: "100%" }}
    >
      <Card
        sx={{
          // 📱 MOBILE: Reduced padding for compact look
          p: { xs: 1.5, sm: 2, md: 2.5 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: { xs: 2.5, md: 2.5 },
          boxShadow: { xs: "0 2px 12px rgba(0,0,0,0.08)", md: 2 },
          transition: "all 0.3s ease",
          // 📱 MOBILE: Subtle gradient border effect
          border: { xs: "1px solid rgba(46,125,50,0.1)", md: "none" },
          "&:hover": !isMobile
            ? {
              boxShadow: 4,
              transform: "translateY(-2px)",
            }
            : {},
        }}
      >
        {/* Card Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            // 📱 MOBILE: Smaller title, tighter margin
            mb: { xs: 1, md: 1.5 },
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
            lineHeight: 1.3,
            color: "#1a1a1a",
          }}
        >
          {title}
        </Typography>

        {/* Products Grid - 📱 MOBILE: Better image sizing */}
        <Grid
          container
          spacing={{ xs: 1, sm: 1.5, md: 1.5 }}
          sx={{ flexGrow: 1, mb: { xs: 1, md: 2 } }}
        >
          {products.slice(0, 4).map((product, index) => (
            <Grid item xs={6} key={product ? product.id : index}>
              <RouterLink
                to={product ? `/product/${product.id}` : "#"}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Box
                  sx={{
                    "&:hover": !isMobile ? { opacity: 0.85 } : {},
                    "&:active": { opacity: 0.7, transform: "scale(0.98)" },
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Product Image - 📱 MOBILE: Smaller, compact size */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      // 📱 MOBILE: Smaller aspect ratio for compact cards
                      paddingTop: { xs: "70%", sm: "75%", md: "75%" },
                      borderRadius: { xs: 1.5, md: 1.5 },
                      overflow: "hidden",
                      mb: { xs: 0.25, md: 0.5 },
                      bgcolor: "#f8f8f8",
                      border: "1px solid #eee",
                    }}
                  >
                    <Box
                      component="img"
                      loading="lazy"  // 🚀 Lazy load for better performance
                      src={
                        product
                          ? product.image
                          : "https://via.placeholder.com/150"
                      }
                      alt={product ? product.name : "placeholder"}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: !isMobile ? "scale(1.05)" : "none" },
                      }}
                    />
                  </Box>

                  {/* Product Name - 📱 MOBILE: Smaller, single line */}
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      display: "block",
                      fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.8rem" },
                      fontWeight: 500,
                      color: "#555",
                      lineHeight: 1.3,
                    }}
                  >
                    {product ? product.name : ""}
                  </Typography>
                </Box>
              </RouterLink>
            </Grid>
          ))}
        </Grid>

        {/* See All Link - 📱 MOBILE: Better touch target */}
        <MuiLink
          component={RouterLink}
          to={linkTo || "/products"}
          sx={{
            mt: "auto",
            fontWeight: 600,
            fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
            color: "#2E7D32",
            textDecoration: "none",
            display: "inline-block",
            py: { xs: 0.5, md: 0 },
            transition: "all 0.2s ease",
            "&:hover": {
              textDecoration: "underline",
              color: "#1B5E20",
            },
          }}
        >
          {linkText}
        </MuiLink>
      </Card>
    </motion.div>
  );
};

export default OfferGridCard;

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowForward, ShoppingBag, Star } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const heroSlides = [
  {
    id: 1,
    title: "Mega Electronics Sale",
    subtitle: "Up to 70% Off",
    description:
      "Discover extraordinary deals on laptops, headphones, and smart devices.",
    image:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200",
    buttonText: "Shop Electronics",
    accent: "Deals You Can't Miss",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
  },
  {
    id: 2,
    title: "Fashion Freedom Sale",
    subtitle: "Minimum 50% Off",
    description:
      "Elevate your wardrobe with premium fashion essentials at unbeatable prices.",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
    buttonText: "Explore Fashion",
    accent: "Limited Time Offer",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: 3,
    title: "Home & Kitchen Deals",
    subtitle: "Starting at ₹199",
    description:
      "Upgrade your living space with our curated collection for home and kitchen.",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200",
    buttonText: "Shop Home",
    accent: "New Arrivals",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
];

const HeroBanner = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // 🎯 Responsive Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600-900px

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <Box
      sx={{
        position: "relative",
        // 📱 Responsive Height - Mobile par smaller
        height: {
          xs: "70vh", // Small mobile
          sm: "75vh", // Tablet
          md: "85vh", // Desktop
        },
        // 📱 Minimum height for very small screens
        minHeight: { xs: "500px", md: "600px" },
        overflow: "hidden",
        background: heroSlides[currentSlide].gradient,
        display: "flex",
        alignItems: "center",
        // Mask for smooth transition to content below
        WebkitMaskImage:
          "linear-gradient(to bottom, black 80%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
      }}
    >
      {/* Background Elements */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url(${heroSlides[currentSlide].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // 📱 Slightly more visible on mobile for better context
          opacity: isMobile ? 0.15 : 0.1,
        }}
        key={currentSlide}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: isMobile ? 0.15 : 0.1 }}
        transition={{ duration: 1 }}
      />

      {/* Floating Decorative Elements - Hide on small mobile */}
      {!isSmallMobile && (
        <>
          <motion.div
            animate={floatingAnimation}
            style={{
              position: "absolute",
              top: "10%",
              right: "10%",
              // 📱 Responsive Size
              width: isMobile ? 60 : 100,
              height: isMobile ? 60 : 100,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              backdropFilter: "blur(20px)",
            }}
          />
          <motion.div
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 1 },
            }}
            style={{
              position: "absolute",
              bottom: "20%",
              left: "5%",
              // 📱 Responsive Size
              width: isMobile ? 40 : 60,
              height: isMobile ? 40 : 60,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              backdropFilter: "blur(15px)",
            }}
          />
        </>
      )}

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
          // 📱 Responsive Padding
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                // 📱 Responsive Min Height
                minHeight: { xs: "60vh", md: "70vh" },
                gap: { xs: 3, sm: 4, md: 6 },
                // 📱 Better vertical centering on mobile
                py: { xs: 4, md: 0 },
              }}
            >
              {/* Content Section */}
              <Box
                sx={{
                  flex: 1,
                  color: "white",
                  textAlign: { xs: "center", md: "left" },
                  // 📱 Add max width on mobile for better readability
                  maxWidth: { xs: "100%", md: "none" },
                }}
              >
                {/* Accent Badge */}
                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      display: "inline-block",
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "50px",
                      // 📱 Responsive Padding
                      px: { xs: 2, sm: 2.5, md: 3 },
                      py: { xs: 0.75, md: 1 },
                      mb: { xs: 2, md: 3 },
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        // 📱 Responsive Font Size
                        fontSize: {
                          xs: "0.8rem",
                          sm: "0.85rem",
                          md: "0.95rem",
                        },
                      }}
                    >
                      <Star
                        sx={{ fontSize: { xs: 14, md: 16 }, color: "#FFD700" }}
                      />
                      {heroSlides[currentSlide].accent}
                    </Typography>
                  </Box>
                </motion.div>

                {/* Main Title */}
                <motion.div variants={itemVariants}>
                  <Typography
                    variant={isSmallMobile ? "h4" : isMobile ? "h3" : "h1"}
                    sx={{
                      fontWeight: 900,
                      mb: { xs: 1.5, md: 2 },
                      background: "linear-gradient(45deg, #FFFFFF, #E0E0E0)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1.2,
                      // 📱 Responsive Font Size
                      fontSize: {
                        xs: "1.75rem", // Extra small
                        sm: "2.5rem", // Small
                        md: "3rem", // Medium
                        lg: "3.5rem", // Large
                      },
                    }}
                  >
                    {heroSlides[currentSlide].title}
                  </Typography>
                </motion.div>

                {/* Subtitle */}
                <motion.div variants={itemVariants}>
                  <Typography
                    variant={isSmallMobile ? "h6" : "h4"}
                    sx={{
                      fontWeight: 300,
                      mb: { xs: 2, md: 3 },
                      color: "rgba(255, 255, 255, 0.9)",
                      // 📱 Responsive Font Size
                      fontSize: {
                        xs: "1.1rem",
                        sm: "1.5rem",
                        md: "2rem",
                      },
                    }}
                  >
                    {heroSlides[currentSlide].subtitle}
                  </Typography>
                </motion.div>

                {/* Description */}
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: { xs: 3, md: 4 },
                      color: "rgba(255, 255, 255, 0.8)",
                      maxWidth: { xs: "100%", md: "500px" },
                      // 📱 Responsive Font Size
                      fontSize: { xs: "0.95rem", sm: "1rem", md: "1.2rem" },
                      lineHeight: 1.6,
                      // 📱 Center on mobile, left on desktop
                      mx: { xs: "auto", md: 0 },
                    }}
                  >
                    {heroSlides[currentSlide].description}
                  </Typography>
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: 1.5, sm: 2 },
                      // 📱 Stack on extra small mobile
                      flexDirection: {
                        xs: isSmallMobile ? "column" : "row",
                        md: "row",
                      },
                      flexWrap: "wrap",
                      justifyContent: { xs: "center", md: "flex-start" },
                    }}
                  >
                    <Button
                      variant="contained"
                      // 📱 Responsive Size
                      size={isMobile ? "medium" : "large"}
                      endIcon={
                        <ArrowForward sx={{ fontSize: { xs: 18, md: 20 } }} />
                      }
                      onClick={() => navigate("/products")}
                      // 📱 Full width on extra small mobile
                      fullWidth={isSmallMobile}
                      sx={{
                        background: "linear-gradient(135deg, #2E7D32, #00695C)",
                        borderRadius: "50px",
                        // 📱 Responsive Padding
                        px: { xs: 3, sm: 3.5, md: 4 },
                        py: { xs: 1.5, md: 2 },
                        // 📱 Touch-friendly height
                        minHeight: { xs: 48, md: 44 },
                        // 📱 Responsive Font Size
                        fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: "0 10px 30px rgba(46, 125, 50, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #388E3C, #00796B)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 15px 40px rgba(46, 125, 50, 0.4)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {heroSlides[currentSlide].buttonText}
                    </Button>

                    <Button
                      variant="outlined"
                      // 📱 Responsive Size
                      size={isMobile ? "medium" : "large"}
                      startIcon={
                        <ShoppingBag sx={{ fontSize: { xs: 18, md: 20 } }} />
                      }
                      onClick={() => navigate("/categories")}
                      // 📱 Full width on extra small mobile
                      fullWidth={isSmallMobile}
                      sx={{
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        color: "white",
                        borderRadius: "50px",
                        // 📱 Responsive Padding
                        px: { xs: 3, sm: 3.5, md: 4 },
                        py: { xs: 1.5, md: 2 },
                        // 📱 Touch-friendly height
                        minHeight: { xs: 48, md: 44 },
                        // 📱 Responsive Font Size
                        fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                        fontWeight: 500,
                        textTransform: "none",
                        backdropFilter: "blur(20px)",
                        background: "rgba(255, 255, 255, 0.1)",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          background: "rgba(255, 255, 255, 0.2)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Browse All
                    </Button>
                  </Box>
                </motion.div>
              </Box>

              {/* Visual Section - Hide on Mobile */}
              <Box
                sx={{
                  flex: 1,
                  position: "relative",
                  display: { xs: "none", md: "block" },
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Box
                    sx={{
                      // 📱 Responsive Circle Size
                      width: { md: "350px", lg: "400px" },
                      height: { md: "350px", lg: "400px" },
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(20px)",
                      border: "2px solid rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <ShoppingBag
                      sx={{
                        // 📱 Responsive Icon Size
                        fontSize: { md: 100, lg: 120 },
                        color: "rgba(255, 255, 255, 0.3)",
                      }}
                    />

                    {/* Animated rings */}
                    <Box
                      sx={{
                        position: "absolute",
                        width: "120%",
                        height: "120%",
                        border: "1px dashed rgba(255, 255, 255, 0.2)",
                        borderRadius: "50%",
                        animation: "spin 20s linear infinite",
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Container>

      {/* Slide Indicators */}
      <Box
        sx={{
          position: "absolute",
          // 📱 Responsive Bottom Position
          bottom: { xs: 20, md: 30 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: { xs: 1.5, md: 2 },
          zIndex: 3,
        }}
      >
        {heroSlides.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleSlideChange(index)}
            sx={{
              // 📱 Responsive Indicator Size
              width:
                currentSlide === index
                  ? { xs: 32, md: 40 }
                  : { xs: 10, md: 12 },
              height: { xs: 10, md: 12 },
              borderRadius: "6px",
              background:
                currentSlide === index
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
              // 📱 Touch-friendly on mobile
              minWidth: { xs: 44, md: "auto" },
              minHeight: { xs: 44, md: "auto" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.6)",
              },
              // 📱 Add inner dot for better touch indication on mobile
              "&::after": {
                content: '""',
                display: isMobile && currentSlide === index ? "block" : "none",
                width: { xs: 32, md: 40 },
                height: { xs: 10, md: 12 },
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.9)",
              },
            }}
          />
        ))}
      </Box>

      {/* Add rotation keyframes */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default HeroBanner;

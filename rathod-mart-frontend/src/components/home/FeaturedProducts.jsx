// src/components/home/FeaturedProducts.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion, useInView } from "framer-motion";
import { ArrowForward, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./ProductAnimations.css";
import api from "../../data/api";

// Fisher-Yates shuffle algorithm for truly random selection
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Skeleton component for loading state
const ProductSkeleton = () => (
  <Box sx={{ p: 1 }}>
    <Skeleton
      variant="rounded"
      height={220}
      sx={{
        borderRadius: 3,
        bgcolor: "rgba(46, 125, 50, 0.08)",
      }}
    />
    <Skeleton
      variant="text"
      sx={{ mt: 1.5, fontSize: "1rem", width: "80%" }}
    />
    <Skeleton variant="text" sx={{ fontSize: "0.9rem", width: "50%" }} />
    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
      <Skeleton variant="text" sx={{ fontSize: "1.2rem", width: "40%" }} />
      <Skeleton variant="text" sx={{ fontSize: "0.9rem", width: "25%" }} />
    </Box>
  </Box>
);

const FeaturedProducts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [visibleCount, setVisibleCount] = useState(isMobile ? 8 : 12);

  // Random count between 10-15 for initial display
  const randomProductCount = useMemo(() => {
    return Math.floor(Math.random() * 6) + 10; // 10 to 15
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // Fetch more products than needed for random selection
        const data = await api.fetchProducts({
          featured: "true",
          limit: 50,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        if (mounted) {
          // Shuffle and select random 10-15 products
          const shuffled = shuffleArray(data);
          const selected = shuffled.slice(0, randomProductCount);
          setAllProducts(selected);
        }
      } catch (e) {
        if (mounted) setErr("Failed to load featured products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [randomProductCount]);

  // Products to display based on pagination
  const displayProducts = useMemo(() => {
    return allProducts.slice(0, visibleCount);
  }, [allProducts, visibleCount]);

  const hasMore = visibleCount < allProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, allProducts.length));
  };

  const handleViewAll = () => {
    navigate("/products");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box
      ref={ref}
      component={motion.section}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      className="featured-products-section"
      sx={{ pt: 0, pb: 8, bgcolor: "background.default" }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 1,
              fontFamily: "'Playfair Display', 'Georgia', serif",
              background:
                "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Featured Collection
          </Typography>
          <Typography
            sx={{
              color: "#666",
              fontSize: { xs: "0.95rem", md: "1.15rem" },
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              letterSpacing: "0.5px",
              mb: 2,
            }}
          >
            Discover Our Handpicked Premium Selection
          </Typography>

          {/* Refresh hint */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              color: "#888",
              fontSize: "0.85rem",
            }}
          >
            <Refresh sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: "#888" }}>
              Refresh for new products
            </Typography>
          </Box>
        </Box>

        {/* Loading State with Skeletons */}
        {loading ? (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {Array.from({ length: isSmallMobile ? 4 : isMobile ? 6 : 8 }).map(
              (_, index) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductSkeleton />
                  </motion.div>
                </Grid>
              )
            )}
          </Grid>
        ) : err ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="error">{err}</Typography>
          </Box>
        ) : allProducts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography>No featured products available.</Typography>
          </Box>
        ) : (
          <>
            {/* Product Grid */}
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {displayProducts.map((product, index) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={product.id || product._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 5,
                flexWrap: "wrap",
              }}
            >
              {/* Load More Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.2,
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      borderColor: "#2E7D32",
                      color: "#2E7D32",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#1B5E20",
                        bgcolor: "rgba(46, 125, 50, 0.04)",
                      },
                    }}
                  >
                    Load More
                  </Button>
                </motion.div>
              )}

              {/* View All Products Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={handleViewAll}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.2,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                    boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                    textTransform: "none",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)",
                      boxShadow: "0 6px 20px rgba(46, 125, 50, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  View All Products
                </Button>
              </motion.div>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default FeaturedProducts;


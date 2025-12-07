// src/components/home/DealGrids.jsx - PERFECT MOBILE RESPONSIVE
import React, { useState, useEffect } from "react";
import { Box, Container, Grid, useTheme, useMediaQuery } from "@mui/material";
import OfferGridCard from "./OfferGridCard";
import SponsorBanner from "./SponsorBanner";
import { useSelector } from "react-redux";
import api from "../../data/api";

// Helper function to get N random items from an array
function getRandomItems(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

const DealGrids = () => {
  const theme = useTheme();

  // 🎯 Responsive Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  // Auth state from Redux
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  // State for dynamic deals
  const [dynamicDeals, setDynamicDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicDeals = async () => {
      try {
        setLoading(true);

        // 1. Fetch categories (e.g., top 10 with most products)
        const categories = await api.fetchCategories({
          limit: 10,
          sortBy: "productsCount",
        });

        // 2. Filter categories that have products and pick 2 random ones
        const validCategories = categories.filter((cat) => cat.count > 0);
        const randomCategories = getRandomItems(validCategories, 2);

        // 3. Fetch 4 products for each random category
        const deals = await Promise.all(
          randomCategories.map(async (category) => {
            const products = await api.fetchProducts({
              category: category.id,
              limit: 4,
            });
            return {
              title: `Top Deals in ${category.name}`,
              linkText: "See all deals",
              products: products,
            };
          })
        );

        setDynamicDeals(deals);
      } catch (err) {
        console.error("Failed to fetch dynamic deals", err);
        // Fallback to empty array on error
        setDynamicDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicDeals();
  }, []);

  return (
    <Box
      sx={{
        mt: { xs: -14, sm: -15, md: -16 }, // Negative margin for overlay effect
        mb: { xs: 3, sm: 4, md: 4 },
        position: "relative",
        zIndex: 10,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        }}
      >
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          {/* ========================================
              MAIN DEAL CARDS SECTION (Left Side)
              ======================================== */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {/* Dynamic Deals - Show loading skeleton or actual deals */}
              {loading ? (
                // Loading State - Show 2 placeholder cards
                <>
                  {[1, 2].map((index) => (
                    <Grid item xs={12} sm={6} md={4} key={`loading-${index}`}>
                      <Box
                        sx={{
                          height: { xs: 280, sm: 300, md: 320 },
                          bgcolor: "grey.100",
                          borderRadius: { xs: 2, md: 2.5 },
                          animation: "pulse 1.5s ease-in-out infinite",
                          "@keyframes pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </>
              ) : (
                // Actual Dynamic Deals
                dynamicDeals.map((deal, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`deal-${index}`}>
                    <OfferGridCard
                      title={deal.title}
                      products={deal.products}
                      linkText={deal.linkText}
                    />
                  </Grid>
                ))
              )}

              {/* ========================================
                  SIGN IN / WELCOME CARD
                  ======================================== */}
              <Grid item xs={12} sm={6} md={4}>
                <OfferGridCard
                  isSignIn={true}
                  isAuthenticated={isAuthenticated}
                  userInfo={userInfo}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* ========================================
              SPONSOR BANNER SECTION (Right Side)
              On mobile, this goes below the deal cards
              ======================================== */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              // On mobile (xs), this will stack below
              // On desktop (md+), it stays on the right
              order: { xs: 2, md: 1 },
            }}
          >
            <SponsorBanner />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DealGrids;

// src/components/home/DealGrids.jsx - PERFECT MOBILE RESPONSIVE
import React, { useState, useEffect, useRef } from "react";
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

  // Auth state from Redux
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  // State for dynamic deals
  const [dynamicDeals, setDynamicDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📱 MOBILE: Auto-scroll ref
  const scrollContainerRef = useRef(null);
  const scrollIndexRef = useRef(0);
  const totalCards = dynamicDeals.length + 1; // deals + refer card

  // 📱 MOBILE: Auto-scroll effect (only on mobile)
  useEffect(() => {
    if (!isMobile || loading || totalCards <= 1) return;

    const interval = setInterval(() => {
      scrollIndexRef.current = (scrollIndexRef.current + 1) % totalCards;
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const cardWidth = container.scrollWidth / totalCards;
        container.scrollTo({
          left: scrollIndexRef.current * cardWidth,
          behavior: "smooth"
        });
      }
    }, 3500); // Auto-scroll every 3.5 seconds

    return () => clearInterval(interval);
  }, [isMobile, loading, totalCards]);

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
              MAIN DEAL CARDS SECTION - MOBILE: Horizontal Snap Scroll
              ======================================== */}
          <Grid item xs={12} md={9}>
            {/* 📱 MOBILE: Horizontal scrollable container with snap + auto-scroll */}
            {isMobile ? (
              <Box
                ref={scrollContainerRef}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",  // Snap scroll
                  scrollBehavior: "smooth",       // Smooth for auto-scroll
                  WebkitOverflowScrolling: "touch",
                  pb: 1,
                  mx: -2,  // Negative margin to extend to edges
                  px: 2,   // Padding to balance
                  // Hide scrollbar
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {/* Loading State */}
                {loading ? (
                  <>
                    {[1, 2].map((index) => (
                      <Box
                        key={`loading-${index}`}
                        sx={{
                          flex: "0 0 70%",  // Card width on mobile
                          maxWidth: 260,
                          scrollSnapAlign: "start",
                          height: 220,
                          bgcolor: "grey.100",
                          borderRadius: 2.5,
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    {/* Dynamic Deals */}
                    {dynamicDeals.map((deal, index) => (
                      <Box
                        key={`deal-${index}`}
                        sx={{
                          flex: "0 0 70%",  // 70% of container width
                          maxWidth: 260,
                          scrollSnapAlign: "start",
                        }}
                      >
                        <OfferGridCard
                          title={deal.title}
                          products={deal.products}
                          linkText={deal.linkText}
                        />
                      </Box>
                    ))}
                    {/* Sign In Card */}
                    <Box
                      sx={{
                        flex: "0 0 70%",
                        maxWidth: 260,
                        scrollSnapAlign: "start",
                      }}
                    >
                      <OfferGridCard
                        isSignIn={true}
                        isAuthenticated={isAuthenticated}
                        userInfo={userInfo}
                      />
                    </Box>
                    {/* Spacer for last card visibility */}
                    <Box sx={{ flex: "0 0 16px" }} />
                  </>
                )}
              </Box>
            ) : (
              // Desktop: Normal Grid Layout
              <Grid container spacing={{ sm: 2, md: 2.5 }}>
                {loading ? (
                  <>
                    {[1, 2].map((index) => (
                      <Grid item xs={12} sm={6} md={4} key={`loading-${index}`}>
                        <Box
                          sx={{
                            height: { sm: 300, md: 320 },
                            bgcolor: "grey.100",
                            borderRadius: 2.5,
                            animation: "pulse 1.5s ease-in-out infinite",
                          }}
                        />
                      </Grid>
                    ))}
                  </>
                ) : (
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
                <Grid item xs={12} sm={6} md={4}>
                  <OfferGridCard
                    isSignIn={true}
                    isAuthenticated={isAuthenticated}
                    userInfo={userInfo}
                  />
                </Grid>
              </Grid>
            )}
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
    </Box >
  );
};

export default DealGrids;

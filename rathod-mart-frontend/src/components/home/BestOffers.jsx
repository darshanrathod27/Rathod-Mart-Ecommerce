// src/components/home/BestOffers.jsx
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "./ProductCard";
import "./BestOffers.css";
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

const BestOffers = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const offers = await api.fetchProducts({
          isBestOffer: "true",
          limit: 50, // Fetch more for randomization
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        if (mounted) {
          // Shuffle products for random display on each load
          const shuffled = shuffleArray(offers);
          setProducts(shuffled.slice(0, 24)); // Take 24 random offers
        }
      } catch (err) {
        console.error("BestOffers error:", err);
        if (mounted) setError("Failed to load offers");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  // Duplicate products for seamless infinite scroll when there are few items
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // If less than 8 products, duplicate them for seamless infinite scroll
    if (products.length < 8) {
      // Duplicate until we have at least 16 slides for smooth looping
      const duplicated = [];
      let i = 0;
      while (duplicated.length < 16) {
        duplicated.push({
          ...products[i % products.length],
          _uniqueKey: `${products[i % products.length].id}-${Math.floor(i / products.length)}-${i}`,
        });
        i++;
      }
      return duplicated;
    }

    return products.map((p, idx) => ({
      ...p,
      _uniqueKey: `${p.id}-0-${idx}`,
    }));
  }, [products]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
        duration: 0.5,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8,
      },
    },
  };

  return (
    <Box
      className="best-offers-section"
      ref={ref}
      component={motion.div}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      sx={{ py: 6 }}
    >
      <motion.div variants={headerVariants}>
        <Box className="best-offers-header-wrapper">
          <Box className="best-offers-header">
            <Typography className="header-title">BEST OFFERS</Typography>
            <Typography className="header-subtitle">
              Unbeatable Deals Just For You!
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <Container maxWidth="xl">
        <motion.div variants={containerVariants}>
          <Box className="best-offers-carousel-container">
            {loading ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography>Loading offers...</Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            ) : products.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography>No offers right now. Check back later!</Typography>
              </Box>
            ) : (
              <Swiper
                modules={[Autoplay, Navigation]}
                spaceBetween={20}
                slidesPerView="auto"
                loop={true}
                loopAdditionalSlides={4}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                speed={800}
                navigation={{
                  nextEl: ".swiper-button-next-custom",
                  prevEl: ".swiper-button-prev-custom",
                }}
                grabCursor={true}
                className="best-offers-swiper"
                breakpoints={{
                  320: { slidesPerView: 1.2, spaceBetween: 15 },
                  480: { slidesPerView: 1.5, spaceBetween: 15 },
                  640: { slidesPerView: 2.2, spaceBetween: 18 },
                  768: { slidesPerView: 2.8, spaceBetween: 18 },
                  1024: { slidesPerView: 4, spaceBetween: 20 },
                  1200: { slidesPerView: 5, spaceBetween: 20 },
                  1400: { slidesPerView: 6, spaceBetween: 20 },
                }}
              >
                {displayProducts.map((product) => (
                  <SwiperSlide key={product._uniqueKey} className="best-offer-slide">
                    <motion.div
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.3 },
                      }}
                      className="product-card-wrapper"
                    >
                      <div className="discount-ribbon">
                        <span>
                          {product.discountPercent || 0}
                          <br />% OFF
                        </span>
                      </div>

                      <ProductCard
                        product={product}
                        isOfferCard={true}
                        hideDiscountChip={true}
                        isCompact={true}
                      />
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            <div className="swiper-button-prev-custom">‹</div>
            <div className="swiper-button-next-custom">›</div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default BestOffers;


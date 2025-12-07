// File: rathod-mart/src/components/home/Categories.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../data/api";
import "./Categories.css";

const Categories = () => {
  const scrollerRef = useRef(null);
  const navigate = useNavigate();

  // 🎯 Responsive Breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600-900px

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const x = useMotionValue(0);
  const scale = useTransform(x, [-100, 0, 100], [0.98, 1, 0.98]);

  // Fetch categories from API
  useEffect(() => {
    let mounted = true;
    api
      .fetchCategories({ limit: 20, sortBy: "productsCount" })
      .then((data) => {
        if (mounted) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Failed to fetch categories", err))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const checkScrollButtons = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // 📱 Responsive scroll amount - smaller on mobile
    const scrollAmount =
      direction === "left"
        ? isSmallMobile
          ? -250
          : isMobile
          ? -300
          : -400
        : isSmallMobile
        ? 250
        : isMobile
        ? 300
        : 400;

    const target = scroller.scrollLeft + scrollAmount;

    animate(scroller.scrollLeft, target, {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => {
        scroller.scrollLeft = latest;
        checkScrollButtons();
      },
    });
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    if (!isDragging) {
      navigate(`/category?category=${categoryId}`);
    }
  };

  const handleDragStart = (e) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    setIsDragging(true);
    setDragStart(e.type.includes("mouse") ? e.pageX : e.touches[0].pageX);
    setScrollStart(scroller.scrollLeft);
    scroller.style.cursor = "grabbing";
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    const diff = dragStart - currentX;

    scroller.scrollLeft = scrollStart + diff;
    x.set(-diff);
    checkScrollButtons();
  };

  const handleDragEnd = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.style.cursor = "grab";
    }

    setTimeout(() => {
      setIsDragging(false);
      x.set(0);
    }, 100);
  };

  return (
    <Box className="categories-section" id="categories-section">
      <Container
        maxWidth="xl"
        sx={{
          // 📱 Responsive padding
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Optional: Section Header */}
        <Box
          className="categories-header"
          sx={{
            mb: { xs: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h5"
            className="categories-title"
            sx={{
              fontWeight: 800,
              color: "#2E7D32",
              // 📱 Responsive font size
              fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.75rem" },
            }}
          >
            Shop by Category
          </Typography>

          {/* Desktop Navigation Buttons */}
          {!isMobile && (
            <Box className="scroll-controls" sx={{ display: "flex", gap: 1 }}>
              <IconButton
                className="scroll-button-left"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                sx={{
                  position: "relative !important",
                  transform: "none !important",
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                className="scroll-button-right"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                sx={{
                  position: "relative !important",
                  transform: "none !important",
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Categories Scroller */}
        <Box className="categories-wrapper">
          <Box
            ref={scrollerRef}
            className="category-scroller"
            onScroll={checkScrollButtons}
            sx={{
              // 📱 Hide scrollbar on all devices
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <Box
              className="category-scroller__inner"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              sx={{
                // 📱 Responsive gap
                gap: { xs: "12px", sm: "14px", md: "18px" },
                padding: { xs: "6px 0", md: "8px 0" },
              }}
            >
              {/* Loading Skeletons */}
              {loading && (
                <>
                  {[...Array(6)].map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      sx={{
                        width: { xs: 140, sm: 150, md: 170 },
                        minWidth: { xs: 140, sm: 150, md: 170 },
                        height: { xs: 85, sm: 90, md: 100 },
                        borderRadius: "14px",
                      }}
                    />
                  ))}
                </>
              )}

              {/* Category Cards */}
              {!loading &&
                categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    whileHover={{
                      scale: isMobile ? 1.02 : 1.03,
                      y: isMobile ? -2 : -4,
                      transition: {
                        duration: 0.3,
                        ease: [0.34, 1.56, 0.64, 1],
                      },
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.15 },
                    }}
                    style={{ scale }}
                  >
                    <Box
                      className="category-card"
                      onClick={() =>
                        handleCategoryClick(category.id, category.name)
                      }
                      sx={{
                        "--category-color": category.color,
                        "--category-color-light": `${category.color}10`,
                        "--category-color-border": `${category.color}40`,
                        // 📱 Responsive card size
                        width: {
                          xs: "140px !important",
                          sm: "150px !important",
                          md: "170px !important",
                        },
                        minWidth: {
                          xs: "140px !important",
                          sm: "150px !important",
                          md: "170px !important",
                        },
                        height: {
                          xs: "85px !important",
                          sm: "90px !important",
                          md: "100px !important",
                        },
                        padding: {
                          xs: "10px !important",
                          sm: "12px !important",
                          md: "14px !important",
                        },
                        gap: {
                          xs: "10px !important",
                          sm: "12px !important",
                          md: "14px !important",
                        },
                      }}
                    >
                      {/* Glow and Shine effects */}
                      <Box className="category-glow" />
                      <Box className="category-shine" />

                      {/* Icon */}
                      <motion.div
                        className="category-icon-wrapper"
                        whileHover={
                          !isMobile
                            ? {
                                rotate: [0, -10, 10, -10, 0],
                                transition: {
                                  duration: 0.5,
                                  ease: "easeInOut",
                                },
                              }
                            : {}
                        }
                      >
                        <Typography
                          className="category-icon"
                          sx={{
                            // 📱 Responsive icon size
                            fontSize: {
                              xs: "1.8rem !important",
                              sm: "2rem !important",
                              md: "2.5rem !important",
                            },
                          }}
                        >
                          {category.icon}
                        </Typography>
                      </motion.div>

                      {/* Text Content */}
                      <Box className="category-text">
                        <Typography
                          className="category-name"
                          sx={{
                            // 📱 Responsive font size
                            fontSize: {
                              xs: "0.8rem !important",
                              sm: "0.85rem !important",
                              md: "0.9rem !important",
                            },
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Typography
                          className="category-count"
                          sx={{
                            // 📱 Responsive font size
                            fontSize: {
                              xs: "0.68rem !important",
                              sm: "0.72rem !important",
                              md: "0.75rem !important",
                            },
                          }}
                        >
                          {category.count} Products
                        </Typography>
                      </Box>

                      {/* Particle effects - Hide on mobile for performance */}
                      {!isSmallMobile && (
                        <Box className="category-particles">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="particle"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                y: [0, -40],
                                x: [0, (Math.random() - 0.5) * 30],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.25,
                                ease: "easeOut",
                              }}
                              style={{
                                left: `${15 + i * 12}%`,
                                bottom: "10px",
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </motion.div>
                ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Categories;

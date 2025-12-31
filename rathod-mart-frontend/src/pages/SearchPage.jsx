// src/pages/SearchPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Home, NavigateNext, Search } from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/home/ProductCard";
import api from "../data/api";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("relevance");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 🔝 Scroll to top when page loads or query changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [query]);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchResults = async () => {
      try {
        // Pass advanced search query
        const data = await api.fetchProducts({
          search: query,
          limit: 50,
          sortBy: sortBy === "price_low" ? "basePrice" : "createdAt",
          sortOrder: sortBy === "price_low" ? "asc" : "desc",
        });
        setProducts(data || []);
        setErr(null);
      } catch (error) {
        console.error("Search error:", error);
        setErr("Something went wrong while searching.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, sortBy]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        // Responsive top padding for different screen sizes
        pt: { xs: 9, sm: 10, md: 14 },
        // Account for mobile bottom nav
        pb: { xs: 12, sm: 10, md: 8 },
        // Safe area for notched phones
        paddingBottom: { xs: "max(96px, calc(96px + env(safe-area-inset-bottom)))", md: 8 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        {/* Breadcrumbs - Responsive */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" sx={{ fontSize: { xs: 14, sm: 16 } }} />}
          sx={{
            mb: { xs: 2, sm: 3 },
            "& .MuiBreadcrumbs-li": {
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            },
          }}
        >
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/")}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            <Home sx={{ mr: 0.5, fontSize: { xs: 16, sm: 18 } }} /> Home
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            Search Results
          </Typography>
        </Breadcrumbs>

        {/* Header & Sort - Mobile Optimized */}
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            mb: { xs: 2, sm: 3, md: 4 },
            borderRadius: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                color="primary.dark"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                  lineHeight: 1.2,
                }}
              >
                {loading ? "Searching..." : `Results for "${query}"`}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                {products.length} items found matching your criteria
              </Typography>
            </Box>

            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 180, md: 200 },
                mt: { xs: 0.5, sm: 0 },
              }}
            >
              <InputLabel sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  minHeight: { xs: 44, sm: 40 },
                  "& .MuiSelect-select": {
                    py: { xs: 1.2, sm: 1 },
                  },
                }}
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="newest">Newest Arrivals</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {err && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}
          >
            {err}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 6, sm: 8, md: 10 } }}>
            <CircularProgress size={isSmallMobile ? 48 : 60} />
          </Box>
        ) : (
          <>
            {products.length === 0 ? (
              <Box sx={{ textAlign: "center", py: { xs: 6, sm: 8, md: 10 } }}>
                <Search sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: "text.disabled", mb: 2 }} />
                <Typography
                  variant="h5"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
                >
                  No matches found
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                >
                  Try checking your spelling or using more general terms.
                </Typography>
                <Button
                  onClick={() => navigate("/")}
                  variant="outlined"
                  sx={{
                    mt: 2,
                    minHeight: { xs: 44, sm: 40 },
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    px: { xs: 3, sm: 4 },
                  }}
                >
                  Go Back Home
                </Button>
              </Box>
            ) : (
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                {products.map((product, index) => (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={3}
                    key={product._id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default SearchPage;

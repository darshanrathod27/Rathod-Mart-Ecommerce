// src/pages/ProductDetail.jsx - MOBILE RESPONSIVE VERSION
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Rating,
  Chip,
  Divider,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Modal,
  Backdrop,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AddShoppingCart,
  FavoriteBorder,
  Favorite,
  Share,
  LocalShipping,
  Verified,
  Home,
  NavigateNext,
  Close,
  ShoppingBag,
  Star,
  ArrowBackIosNew,
  ArrowForwardIos,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";
import ProductCard from "../components/home/ProductCard";
import api from "../data/api";
import "./ProductDetail.css";

const PriceBlock = ({
  basePrice,
  discountPrice,
  discountPercent,
  currentPrice,
}) => {
  const priceToShow =
    typeof currentPrice !== "undefined" && currentPrice !== null
      ? currentPrice
      : discountPrice ?? basePrice;
  const hasDiscount =
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < basePrice;
  return (
    <Box className="price-section">
      <Typography className="current-price">
        ₹{priceToShow?.toLocaleString() || 0}
      </Typography>
      {hasDiscount && (
        <>
          <Typography className="original-price">
            ₹{basePrice?.toLocaleString() || 0}
          </Typography>
          <Chip
            label={`${discountPercent || 0}% OFF`}
            className="discount-chip"
          />
        </>
      )}
    </Box>
  );
};

const ZOOM_SCALE = 2.8;
const ZOOM_SIZE = 600;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { addToCart } = useCart();
  const { toggleWishlist, isItemInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentStock, setCurrentStock] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [lensLeftPx, setLensLeftPx] = useState(0);
  const [lensTopPx, setLensTopPx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomImgStyle, setZoomImgStyle] = useState(null);

  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch product data
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await api.fetchProductById(id);
        if (!mounted) return;
        setProduct(data);
        setCurrentImages(
          data.generalImages && data.generalImages.length > 0
            ? data.generalImages
            : (data.imagesUrls || [data.image]).filter(Boolean)
        );
        setCurrentStock(data.totalStock ?? data.stock ?? 0);
        setCurrentPrice(data.price ?? data.basePrice ?? null);

        try {
          const invVariants = await api.fetchProductVariants(id);
          let merged = [];
          if (Array.isArray(data.variants) && data.variants.length > 0) {
            merged = data.variants.map((v) => {
              const found = invVariants.find(
                (iv) => String(iv.id) === String(v.id)
              );
              return {
                ...v,
                stock: found?.stock ?? v.stock ?? 0,
                price: v.price ?? found?.price ?? null,
              };
            });
          } else {
            merged = (invVariants || []).map((v) => ({
              id: v.id,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              color: v.color,
              size: v.size,
              images: v.images || [],
            }));
          }
          setVariants(merged);
          if (merged.length > 0) {
            const def = merged.find((v) => v.stock > 0) || merged[0];
            handleVariantChange(def, data);
          }
        } catch (err) {
          console.warn("Variant fetch failed:", err);
        }

        const catId = data?.category?._id || data?.category || null;
        if (catId) {
          try {
            const rel = await api.fetchProducts({ category: catId, limit: 12 });
            setRelated(rel.filter((p) => p.id !== data.id).slice(0, 4));
          } catch (err) {
            console.warn("Related fetch failed:", err);
          }
        }
      } catch (err) {
        setErr("Product not found");
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      setReviewsLoading(true);
      try {
        const reviewData = await api.fetchReviewsForProduct(id, { limit: 10 });
        if (mounted) setReviews(reviewData.data || []);
      } catch (err) {
        console.warn("Could not load reviews", err);
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(currentImages) && currentImages.length)
      return currentImages.filter(Boolean);
    if (Array.isArray(product.images))
      return product.images
        .map((i) => i.fullUrl || i.url || product.image)
        .filter(Boolean);
    return product.image ? [product.image] : [];
  }, [product, currentImages]);

  const isFavorite = product
    ? isItemInWishlist(product.id || product._id)
    : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant || null);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedVariant || null);
    navigate("/checkout");
  };

  const handleFavoriteToggle = () => {
    toggleWishlist(product);
    toast.success(isFavorite ? "Removed from wishlist" : "Added to wishlist!", {
      icon: isFavorite ? "💔" : "❤️",
    });
  };

  const handleVariantChange = (variant, prod = product) => {
    if (!variant) {
      setSelectedVariant(null);
      setCurrentStock(prod?.stock ?? 0);
      setCurrentImages(
        prod?.generalImages?.length
          ? prod.generalImages
          : (prod?.imagesUrls || [prod?.image]).filter(Boolean)
      );
      setCurrentPrice(prod?.price ?? null);
      return;
    }
    setSelectedVariant(variant);
    setCurrentStock(variant.stock ?? prod?.stock ?? 0);
    setCurrentPrice(variant.price ?? prod?.price ?? null);
    if (Array.isArray(variant.images) && variant.images.length > 0)
      setCurrentImages(variant.images);
    else setCurrentImages(prod?.generalImages || [prod?.image]);
    setSelectedImage(0);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isMobile) return; // Disable zoom on mobile

      const imgEl = imgRef.current;
      const containerEl = containerRef.current;
      if (!imgEl || !containerEl) return;

      const imgRect = imgEl.getBoundingClientRect();
      const nx = (e.clientX - imgRect.left) / imgRect.width;
      const ny = (e.clientY - imgRect.top) / imgRect.height;
      const cx = Math.max(0, Math.min(1, nx));
      const cy = Math.max(0, Math.min(1, ny));

      const containerRect = containerEl.getBoundingClientRect();
      const pxInContainerX = e.clientX - containerRect.left;
      const pxInContainerY = e.clientY - containerRect.top;
      setLensLeftPx(Math.round(pxInContainerX));
      setLensTopPx(Math.round(pxInContainerY));

      const natW = imgEl.naturalWidth || imgRect.width;
      const natH = imgEl.naturalHeight || imgRect.height;
      const pxImage = cx * natW;
      const pyImage = cy * natH;
      const imgWzoom = Math.round(natW * ZOOM_SCALE);
      const imgHzoom = Math.round(natH * ZOOM_SCALE);
      const offsetX = Math.round(pxImage * ZOOM_SCALE - ZOOM_SIZE / 2);
      const offsetY = Math.round(pyImage * ZOOM_SCALE - ZOOM_SIZE / 2);
      const maxOffsetX = Math.max(0, imgWzoom - ZOOM_SIZE);
      const maxOffsetY = Math.max(0, imgHzoom - ZOOM_SIZE);
      const clampedX = Math.max(0, Math.min(maxOffsetX, offsetX));
      const clampedY = Math.max(0, Math.min(maxOffsetY, offsetY));

      setZoomImgStyle({
        width: `${imgWzoom}px`,
        height: `${imgHzoom}px`,
        left: `${-clampedX}px`,
        top: `${-clampedY}px`,
      });
    },
    [isMobile]
  );

  const handleMouseEnter = () => {
    if (!isMobile) setIsHovering(true);
  };

  const handleMouseLeave = () => setIsHovering(false);

  const handleSubmitRating = async () => {
    if (userRating === 0) return toast.error("Please select a rating!");
    setSubmitLoading(true);
    try {
      const reviewData = {
        rating: userRating,
        comment: ratingComment,
        userName: "Guest",
      };
      await api.submitReview(product.id, reviewData);
      toast.success("Review submitted! Waiting for approval.");
      setUserRating(0);
      setRatingComment("");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to submit review."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const openZoomModalAt = (index) => {
    setModalIndex(index);
    setZoomModalOpen(true);
  };

  const closeZoomModal = () => setZoomModalOpen(false);
  const nextModalImage = () =>
    setModalIndex((i) => (i + 1) % Math.max(1, gallery.length));
  const prevModalImage = () =>
    setModalIndex((i) => (i - 1 + gallery.length) % gallery.length);

  if (loading)
    return (
      <Container sx={{ py: 10 }}>
        <Typography>Loading product…</Typography>
      </Container>
    );
  if (err || !product)
    return (
      <Container sx={{ py: 10 }}>
        <Typography color="error">{err}</Typography>
      </Container>
    );

  const currentImage = gallery[selectedImage];

  return (
    <Box className="product-detail-page">
      <Container maxWidth="xl">
        {/* Breadcrumbs - Hide on small mobile */}
        {!isSmallMobile && (
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            className="breadcrumbs"
            sx={{ mb: 2, fontSize: { xs: "0.75rem", sm: "0.95rem" } }}
          >
            <Link component="button" onClick={() => navigate("/")}>
              <Home sx={{ mr: 0.5, fontSize: { xs: "1rem", sm: "1.2rem" } }} />
              {!isSmallMobile && "Home"}
            </Link>
            {product.category?.name && !isSmallMobile && (
              <Link
                component="button"
                onClick={() =>
                  navigate(
                    `/products?category=${product.category._id || product.category
                    }`
                  )
                }
              >
                {product.category.name}
              </Link>
            )}
            <Typography className="breadcrumb-active" noWrap>
              {isSmallMobile ? product.name.slice(0, 20) + "..." : product.name}
            </Typography>
          </Breadcrumbs>
        )}

        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="product-main-section"
          sx={{ borderRadius: { xs: 2, md: 3 } }}
        >
          <Grid container>
            {/* Image Gallery - Full width on mobile */}
            <Grid item xs={12} md={6}>
              <Box className="product-gallery" sx={{ p: { xs: 1.5, md: 2 } }}>
                {product.badge && (
                  <Chip
                    label={product.badge}
                    className="product-badge"
                    size={isSmallMobile ? "small" : "medium"}
                  />
                )}

                <Box
                  ref={containerRef}
                  className="main-image-container"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => openZoomModalAt(selectedImage)}
                  sx={{
                    height: { xs: 300, sm: 400, md: 500 },
                    cursor: isMobile ? "pointer" : "crosshair",
                  }}
                >
                  {currentImage ? (
                    <img
                      ref={imgRef}
                      src={currentImage}
                      alt={product.name}
                      className="main-product-image"
                      draggable={false}
                    />
                  ) : (
                    <Typography>No Image</Typography>
                  )}

                  {/* Lens - Only on desktop */}
                  {!isMobile && isHovering && (
                    <div
                      className="zoom-lens"
                      style={{
                        left: `${lensLeftPx}px`,
                        top: `${lensTopPx}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
                </Box>

                {/* Side zoom - Desktop only */}
                {!isMobile && isHovering && currentImage && zoomImgStyle && (
                  <Box className="side-zoom-display">
                    <div
                      style={{
                        position: "relative",
                        width: `${ZOOM_SIZE}px`,
                        height: `${ZOOM_SIZE}px`,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={currentImage}
                        alt="zoom"
                        style={{
                          position: "absolute",
                          ...zoomImgStyle,
                          imageRendering: "-webkit-optimize-contrast",
                          willChange: "left, top",
                        }}
                        draggable={false}
                      />
                    </div>
                  </Box>
                )}

                {/* Thumbnails - Horizontal scroll on mobile */}
                <Box
                  className="thumbnail-gallery"
                  sx={{
                    gap: { xs: "6px", md: "10px" },
                    py: { xs: "6px", md: "10px" },
                  }}
                >
                  {gallery.map((img, i) => (
                    <Box
                      key={i}
                      className={`thumbnail ${selectedImage === i ? "active" : ""
                        }`}
                      onClick={() => setSelectedImage(i)}
                      tabIndex={0}
                      sx={{
                        width: { xs: 60, sm: 70, md: 80 },
                        height: { xs: 60, sm: 70, md: 80 },
                      }}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Product Info - Full width on mobile, stacked below image */}
            <Grid item xs={12} md={6}>
              <Box className="product-info" sx={{ p: { xs: 2, md: 2 } }}>
                {product.brand && (
                  <Typography
                    className="product-brand"
                    sx={{ fontSize: { xs: "0.8rem", md: "0.95rem" } }}
                  >
                    {product.brand}
                  </Typography>
                )}

                <Typography
                  variant="h4"
                  className="product-title"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
                    mb: { xs: 1, md: 1 },
                  }}
                >
                  {product.name}
                </Typography>

                {/* Rating Section - Wrap on mobile */}
                <Box
                  className="rating-section"
                  sx={{
                    flexWrap: "wrap",
                    gap: { xs: "0.5rem", md: "1rem" },
                    mb: { xs: 1.5, md: 1.5 },
                  }}
                >
                  <Rating
                    value={product.rating || 0}
                    precision={0.5}
                    readOnly
                    size={isSmallMobile ? "small" : "medium"}
                  />
                  <Typography
                    className="rating-text"
                    sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                  >
                    {(product.rating || 0).toFixed(1)} ({product.reviews || 0}{" "}
                    reviews)
                  </Typography>
                  <Chip
                    label={
                      currentStock > 0
                        ? `In Stock (${currentStock})`
                        : "Out of Stock"
                    }
                    icon={<Verified />}
                    className={`stock-chip ${currentStock > 0 ? "in-stock" : "out-of-stock"
                      }`}
                    size={isSmallMobile ? "small" : "medium"}
                  />
                </Box>

                <PriceBlock
                  basePrice={product.basePrice}
                  discountPrice={product.discountPrice}
                  discountPercent={product.discountPercent}
                  currentPrice={currentPrice}
                />

                {product.shortDescription && (
                  <Typography
                    className="product-description"
                    sx={{
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      lineHeight: { xs: 1.5, md: 1.7 },
                    }}
                  >
                    {product.shortDescription}
                  </Typography>
                )}

                <Divider sx={{ my: { xs: 2, md: 3 } }} />

                {/* Variants - Stack on mobile */}
                {variants.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                    >
                      Choose variant
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {variants.map((v) => (
                        <Button
                          key={v.id}
                          size="small"
                          variant={
                            selectedVariant?.id === v.id
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => handleVariantChange(v)}
                          disabled={Number(v.stock ?? 0) <= 0}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            minWidth: { xs: 90, md: 110 },
                            fontSize: { xs: "0.75rem", md: "0.875rem" },
                            py: { xs: 0.5, md: 0.75 },
                          }}
                        >
                          {v.color?.name || ""}{" "}
                          {v.size?.name ? ` / ${v.size.name}` : ""}{" "}
                          {Number(v.stock ?? 0) <= 0 ? " — Out" : ""}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Action Buttons - Stack on mobile */}
                <Box
                  className="action-buttons"
                  sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, md: 1 },
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0}
                    className="add-to-cart-btn"
                    fullWidth={isMobile}
                    sx={{
                      py: { xs: 1.2, md: 1 },
                      fontSize: { xs: "0.95rem", md: "1.1rem" },
                      background: "#2e7d32 !important",
                      backgroundColor: "#2e7d32 !important",
                      color: "#fff !important",
                      "&:hover:not(:disabled)": {
                        background: "#1b5e20 !important",
                        backgroundColor: "#1b5e20 !important",
                      },
                    }}
                  >
                    Add to Cart
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingBag />}
                    onClick={handleBuyNow}
                    disabled={currentStock <= 0}
                    className="buy-now-btn"
                    fullWidth={isMobile}
                    sx={{
                      py: { xs: 1.2, md: 1 },
                      fontSize: { xs: "0.95rem", md: "1.1rem" },
                      background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%) !important",
                      backgroundColor: "#ff9800 !important",
                      color: "#fff !important",
                      boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3) !important",
                      "&:hover:not(:disabled)": {
                        background: "linear-gradient(135deg, #f57c00 0%, #e65100 100%) !important",
                        backgroundColor: "#f57c00 !important",
                        boxShadow: "0 6px 20px rgba(255, 152, 0, 0.4) !important",
                      },
                    }}
                  >
                    Buy Now
                  </Button>

                  {/* Icons row on mobile */}
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                  >
                    <IconButton
                      onClick={handleFavoriteToggle}
                      className="wishlist-icon-btn"
                      sx={{
                        border: "2px solid",
                        borderColor: isFavorite ? "#E91E63" : "#e0e0e0",
                      }}
                    >
                      {isFavorite ? (
                        <Favorite sx={{ color: "#E91E63" }} />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                    <IconButton
                      className="share-icon-btn"
                      sx={{ border: "2px solid #e0e0e0" }}
                    >
                      <Share />
                    </IconButton>
                  </Box>
                </Box>

                {/* Delivery Info */}
                <Paper
                  className="delivery-info"
                  sx={{
                    p: { xs: 1, md: 1 },
                    gap: { xs: 0.75, md: 1 },
                  }}
                >
                  <LocalShipping
                    className="delivery-icon"
                    sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
                  />
                  <Box>
                    <Typography
                      className="delivery-title"
                      sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                    >
                      Free Delivery
                    </Typography>
                    <Typography
                      className="delivery-text"
                      sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                    >
                      Delivered in 2–3 business days
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Description Section */}
        {product.description && (
          <Paper
            className="product-description-section"
            sx={{
              p: { xs: 2, md: 4 },
              mt: { xs: 2, md: 4 },
              borderRadius: { xs: 2, md: 3 },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              Product Details
            </Typography>
            {/* Render HTML description properly */}
            <Box
              sx={{
                color: "text.secondary",
                lineHeight: 1.8,
                fontSize: { xs: "0.9rem", md: "1rem" },
                "& h3": {
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  fontWeight: 700,
                  color: "text.primary",
                  mt: 2,
                  mb: 1,
                },
                "& h4": {
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontWeight: 600,
                  color: "text.primary",
                  mt: 2,
                  mb: 1,
                },
                "& ul": {
                  pl: 2,
                  mb: 1.5,
                },
                "& li": {
                  mb: 0.5,
                },
                "& p": {
                  mb: 1,
                },
                "& strong": {
                  fontWeight: 600,
                  color: "text.primary",
                },
              }}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </Paper>
        )}

        {/* Reviews Section */}
        <Paper
          className="user-rating-section"
          sx={{
            p: { xs: 2, md: 4 },
            mt: { xs: 2, md: 4 },
            borderRadius: { xs: 2, md: 3 },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            Ratings & Reviews
          </Typography>

          {/* Leave Review */}
          <Box mb={4}>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontWeight: 600,
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Leave a review
            </Typography>
            <Rating
              value={userRating}
              precision={0.5}
              onChange={(e, val) => setUserRating(val)}
              size={isSmallMobile ? "medium" : "large"}
              icon={<Star fontSize="inherit" />}
              disabled={submitLoading}
            />
            <TextField
              fullWidth
              placeholder="Write a short review..."
              multiline
              rows={isSmallMobile ? 2 : 3}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              sx={{ mt: 2 }}
              disabled={submitLoading}
            />
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleSubmitRating}
              disabled={submitLoading}
              size={isSmallMobile ? "medium" : "large"}
              fullWidth={isSmallMobile}
            >
              {submitLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: "1.1rem", md: "1.25rem" },
            }}
          >
            Customer Reviews ({product.reviews || 0})
          </Typography>

          {reviewsLoading ? (
            <Typography>Loading reviews...</Typography>
          ) : reviews.length === 0 ? (
            <Alert severity="info">
              Be the first one to review this product!
            </Alert>
          ) : (
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {reviews.map((review, index) => (
                <React.Fragment key={review._id || index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{ px: { xs: 0, md: 2 } }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: { xs: 32, md: 40 },
                          height: { xs: 32, md: 40 },
                        }}
                      >
                        {review.userName ? review.userName[0] : "G"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "0.9rem", md: "1rem" },
                            }}
                          >
                            {review.userName}
                          </Typography>
                          <Rating
                            value={review.rating}
                            readOnly
                            size={isSmallMobile ? "small" : "small"}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            sx={{
                              display: "block",
                              mt: 1,
                              fontSize: { xs: "0.85rem", md: "0.875rem" },
                            }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {review.comment}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                              display: "block",
                              fontSize: { xs: "0.7rem", md: "0.75rem" },
                            }}
                          >
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : ""}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < reviews.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Related Products */}
        {related.length > 0 && (
          <Box
            className="related-products-section"
            sx={{ mt: { xs: 2, md: 4 } }}
          >
            <Typography
              variant="h5"
              className="related-title"
              sx={{
                mb: { xs: 2, md: 3 },
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              Related Products
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {related.map((p) => (
                <Grid item xs={6} sm={6} md={3} key={p.id || p._id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Zoom Modal */}
        <Modal
          open={zoomModalOpen}
          onClose={closeZoomModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 400 }}
        >
          <Box
            className="zoom-modal"
            role="dialog"
            aria-modal="true"
            sx={{
              width: { xs: "95vw", md: "auto" },
              maxWidth: { xs: "95vw", md: "95vw" },
            }}
          >
            <IconButton
              className="zoom-modal-close"
              onClick={closeZoomModal}
              sx={{
                width: { xs: 36, md: 44 },
                height: { xs: 36, md: 44 },
              }}
            >
              <Close />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {!isSmallMobile && (
                <IconButton
                  onClick={prevModalImage}
                  sx={{
                    position: "absolute",
                    left: { xs: 2, md: 8 },
                    zIndex: 20,
                    bgcolor: "rgba(255,255,255,0.85)",
                    width: { xs: 36, md: 44 },
                    height: { xs: 36, md: 44 },
                  }}
                >
                  <ArrowBackIosNew fontSize="small" />
                </IconButton>
              )}

              <img
                src={gallery[modalIndex]}
                alt={`Zoom ${modalIndex + 1}`}
                className="zoom-modal-image"
                draggable={false}
                style={{
                  maxWidth: isSmallMobile ? "90vw" : "1200px",
                  maxHeight: isSmallMobile ? "60vh" : "78vh",
                }}
              />

              {!isSmallMobile && (
                <IconButton
                  onClick={nextModalImage}
                  sx={{
                    position: "absolute",
                    right: { xs: 2, md: 8 },
                    zIndex: 20,
                    bgcolor: "rgba(255,255,255,0.85)",
                    width: { xs: 36, md: 44 },
                    height: { xs: 36, md: 44 },
                  }}
                >
                  <ArrowForwardIos fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Thumbnails in modal */}
            <Box
              className="zoom-modal-thumbnails"
              sx={{
                mt: 1,
                gap: { xs: "8px", md: "12px" },
                maxWidth: { xs: "90vw", md: "none" },
                overflowX: "auto",
              }}
            >
              {gallery.map((img, i) => (
                <Box
                  key={i}
                  className={`modal-thumbnail ${i === modalIndex ? "active" : ""
                    }`}
                  onClick={() => setModalIndex(i)}
                  tabIndex={0}
                  sx={{
                    width: { xs: 60, md: 80 },
                    height: { xs: 60, md: 80 },
                  }}
                >
                  <img src={img} alt={`Thumb ${i + 1}`} />
                </Box>
              ))}
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default ProductDetail;

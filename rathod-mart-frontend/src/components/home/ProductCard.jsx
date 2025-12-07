// src/components/home/ProductCard.jsx - MOBILE OPTIMIZED
import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Rating,
} from "@mui/material";
import { AddShoppingCart, FavoriteBorder, Favorite } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useResponsive } from "../../hooks/useResponsive";
import "./BestOffers.css";

const ProductCard = ({
  product,
  isOfferCard = false,
  hideDiscountChip = false,
  isCompact = false,
}) => {
  const navigate = useNavigate();
  const { isMobile, isSmallMobile } = useResponsive();
  const { addToCart } = useCart();
  const { toggleWishlist, isItemInWishlist } = useWishlist();

  const pid = product?.id || product?._id;
  const stockCount =
    product?.stock !== undefined ? product.stock : product?.Stock || 0;
  const isOutOfStock = stockCount < 1;
  const isFavorite = isItemInWishlist(pid);

  const handleCardClick = () => {
    if (pid) {
      navigate(`/product/${pid}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      whileHover={!isMobile ? { y: -8, scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={handleCardClick}
      style={{ cursor: "pointer", height: "100%" }}
    >
      <Card
        className={isCompact ? "compact-product-card" : "product-card"}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 2, md: isCompact ? "18px" : "16px" },
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          border: "2px solid rgba(0, 0, 0, 0.04)",
          // 📱 Remove hover effects on mobile for better performance
          "&:hover": !isMobile
            ? {
                transform: "translateY(-8px)",
                boxShadow: "0 16px 40px rgba(46, 125, 50, 0.15)",
              }
            : {},
        }}
      >
        {/* Badge */}
        {product?.badge && !hideDiscountChip && !isCompact && !isOutOfStock && (
          <Chip
            label={product.badge}
            size={isSmallMobile ? "small" : "medium"}
            className="product-badge"
            sx={{
              position: "absolute",
              top: { xs: 8, md: 12 },
              left: { xs: 8, md: 12 },
              zIndex: 3,
              fontSize: { xs: "0.7rem", md: "0.75rem" },
            }}
          />
        )}

        {/* Product Image */}
        <Box
          className="product-image-container"
          sx={{
            position: "relative",
            overflow: "hidden",
            height: { xs: 180, sm: 200, md: 220 },
          }}
        >
          <CardMedia
            component="img"
            image={product?.image || product?.images?.[0]?.url}
            alt={product?.name}
            className="product-image"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: isOutOfStock ? "blur(4px) grayscale(40%)" : "none",
              transition: "filter 0.3s ease",
            }}
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 4,
              }}
            >
              <Chip
                label="Out of Stock"
                sx={{
                  bgcolor: "#d32f2f",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: { xs: "0.75rem", md: "0.85rem" },
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              />
            </Box>
          )}
        </Box>

        {/* Product Content */}
        <CardContent
          className="product-content"
          sx={{
            p: { xs: 1.5, md: 2 },
            "&:last-child": { pb: { xs: 1.5, md: 2 } },
          }}
        >
          <Typography
            variant="body1"
            className="product-name"
            noWrap
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {product?.name}
          </Typography>

          {/* Rating */}
          <Box
            className="product-rating-box"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
          >
            <Rating
              value={product?.rating || 0}
              precision={0.5}
              size={isSmallMobile ? "small" : "medium"}
              readOnly
              className="product-rating"
              sx={{
                color: "#ffa726",
                fontSize: { xs: "1rem", md: "1.25rem" },
                "& .MuiRating-iconEmpty": {
                  color: "#e0e0e0",
                },
              }}
            />
            <Typography
              variant="caption"
              className="product-reviews"
              sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
            >
              ({product?.reviews ?? 0})
            </Typography>
          </Box>

          {/* Price */}
          <Box
            className="product-price-box"
            sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
          >
            <Typography
              variant="h6"
              className="product-price"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" } }}
            >
              ₹{product?.price}
            </Typography>
            {product?.originalPrice && (
              <Typography
                variant="body2"
                className="product-original-price"
                sx={{ fontSize: { xs: "0.8rem", md: "0.85rem" } }}
              >
                ₹{product.originalPrice}
              </Typography>
            )}
          </Box>
        </CardContent>

        {/* Action Buttons */}
        <Box
          className="product-actions"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: { xs: "0 12px 12px", md: "0 14px 12px" },
            gap: 1,
          }}
        >
          {/* Wishlist Button - Touch Friendly */}
          <IconButton
            onClick={handleFavoriteToggle}
            className="wishlist-btn"
            sx={{
              color: isFavorite ? "#e91e63" : "rgba(0, 0, 0, 0.54)",
              // 📱 TOUCH FRIENDLY SIZE
              width: { xs: 44, md: 40 },
              height: { xs: 44, md: 40 },
              borderRadius: "50%",
              border: "2px solid",
              borderColor: isFavorite ? "#e91e63" : "#e0e0e0",
              bgcolor: isFavorite ? "#fce4ec" : "#fff",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: isMobile ? "none" : "scale(1.15)",
                borderColor: "#e91e63",
                bgcolor: "#fce4ec",
              },
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>

          {/* Cart Button - Touch Friendly */}
          <IconButton
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="cart-btn"
            sx={{
              // 📱 TOUCH FRIENDLY SIZE
              width: { xs: 44, md: 40 },
              height: { xs: 44, md: 40 },
              borderRadius: "50%",
              background: isOutOfStock
                ? "#e0e0e0"
                : "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
              color: isOutOfStock ? "#9e9e9e" : "white",
              border: isOutOfStock ? "2px solid #bdbdbd" : "2px solid #2e7d32",
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                background: isOutOfStock
                  ? "#e0e0e0"
                  : "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
                transform: isOutOfStock || isMobile ? "none" : "scale(1.15)",
                boxShadow: isOutOfStock
                  ? "none"
                  : "0 6px 20px rgba(46, 125, 50, 0.4)",
              },
            }}
          >
            <AddShoppingCart sx={{ fontSize: { xs: 18, md: 20 } }} />
          </IconButton>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ProductCard;

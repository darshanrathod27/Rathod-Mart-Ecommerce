// src/components/home/ProductCard.jsx
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
import "./BestOffers.css";

const ProductCard = ({
  product,
  isOfferCard = false,
  hideDiscountChip = false,
  isCompact = false,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isItemInWishlist } = useWishlist();

  const pid = product?.id || product?._id;
  // Check for stock (handle both lowercase and uppercase case from backend)
  const stockCount =
    product?.stock !== undefined ? product.stock : product?.Stock || 0;
  const isOutOfStock = stockCount < 1;

  // derive favorite status on each render
  const isFavorite = isItemInWishlist(pid);

  const handleCardClick = () => {
    if (pid) {
      navigate(`/product/${pid}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return; // Prevent adding if out of stock
    addToCart(product);
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
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
          borderRadius: isCompact ? "18px" : "16px",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          border: "2px solid rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Badge - Hide if Out of Stock to show OOS badge instead, or show both */}
        {product?.badge && !hideDiscountChip && !isCompact && !isOutOfStock && (
          <Chip
            label={product.badge}
            size="small"
            className="product-badge"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 3,
            }}
          />
        )}

        {/* Product Image Container */}
        <Box
          className="product-image-container"
          sx={{ position: "relative", overflow: "hidden" }}
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
              // Blur effect if out of stock
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
                bgcolor: "rgba(0, 0, 0, 0.4)", // Dark overlay
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
                  fontSize: "0.85rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              />
            </Box>
          )}
        </Box>

        {/* Product Content */}
        <CardContent className="product-content">
          <Typography variant="body1" className="product-name" noWrap>
            {product?.name}
          </Typography>

          {/* Rating */}
          <Box className="product-rating-box">
            <Rating
              value={product?.rating || 0}
              precision={0.5}
              size="small"
              readOnly
              className="product-rating"
              sx={{
                color: "#ffa726",
                "& .MuiRating-iconEmpty": {
                  color: "#e0e0e0",
                },
              }}
            />
            <Typography variant="caption" className="product-reviews">
              ({product?.reviews ?? 0})
            </Typography>
          </Box>

          {/* Price */}
          <Box className="product-price-box">
            <Typography variant="h6" className="product-price">
              ₹{product?.price}
            </Typography>
            {product?.originalPrice && (
              <Typography variant="body2" className="product-original-price">
                ₹{product.originalPrice}
              </Typography>
            )}
          </Box>
        </CardContent>

        {/* Action Buttons */}
        <Box className="product-actions">
          <IconButton
            onClick={handleFavoriteToggle}
            className="wishlist-btn"
            sx={{
              color: isFavorite ? "#e91e63" : "rgba(0, 0, 0, 0.54)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid",
              borderColor: isFavorite ? "#e91e63" : "#e0e0e0",
              bgcolor: isFavorite ? "#fce4ec" : "#fff",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.15)",
                borderColor: "#e91e63",
                bgcolor: "#fce4ec",
              },
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>

          <IconButton
            onClick={handleAddToCart}
            disabled={isOutOfStock} // Disable click
            className="cart-btn"
            sx={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              // Grey out if Out of Stock, otherwise Green Gradient
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
                transform: isOutOfStock ? "none" : "scale(1.15)",
                boxShadow: isOutOfStock
                  ? "none"
                  : "0 6px 20px rgba(46, 125, 50, 0.4)",
              },
            }}
          >
            <AddShoppingCart />
          </IconButton>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ProductCard;

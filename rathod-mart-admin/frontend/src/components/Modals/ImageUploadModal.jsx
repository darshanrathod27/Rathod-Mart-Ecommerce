// ========================================
// IMAGE UPLOAD MODAL - Fully Responsive
// Features: Upload, Crop, Delete, Set Primary
// Mobile optimized with same functionality
// ========================================

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  FiUploadCloud,
  FiX,
  FiTrash2,
  FiStar,
  FiEdit2,
  FiCheck,
} from "react-icons/fi";
import { productService } from "../../services/productService";
import { inventoryService } from "../../services/inventoryService";
import toast from "react-hot-toast";
import { useResponsive } from "../../hooks/useResponsive";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ========================================
// HELPER: Create Cropped Image
// ========================================
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
};

// ========================================
// CROP DIALOG COMPONENT
// ========================================
const CropDialog = ({ open, src, onCancel, onApply }) => {
  const { isMobile } = useResponsive();
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);

  const onLoad = useCallback((img) => {
    imgRef.current = img;
    const aspect = 1;
    const width = img.width > img.height ? (img.height / img.width) * 100 : 100;
    const height =
      img.height > img.width ? (img.width / img.height) * 100 : 100;
    const x = (100 - width) / 2;
    const y = (100 - height) / 2;

    setCrop({
      unit: "%",
      width: Math.min(width, height) * 0.8,
      height: Math.min(width, height) * 0.8,
      x: x + width * 0.1,
      y: y + height * 0.1,
      aspect,
    });
  }, []);

  const handleApply = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error("Please select a crop area");
      return;
    }

    try {
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      const pixelCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const blob = await getCroppedImg(imgRef.current.src, pixelCrop);
      onApply(blob);
    } catch (error) {
      console.error("Crop error:", error);
      toast.error("Failed to crop image");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: "var(--z-modal-backdrop)",
            padding: isMobile ? 0 : "var(--space-lg)",
            overflowY: "auto",
          }}
        >
          <motion.div
            initial={{
              y: isMobile ? "100%" : 0,
              scale: isMobile ? 1 : 0.9,
              opacity: 0,
            }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{
              y: isMobile ? "100%" : 0,
              scale: isMobile ? 1 : 0.9,
              opacity: 0,
            }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-secondary)",
              borderRadius: isMobile
                ? "var(--radius-xl) var(--radius-xl) 0 0"
                : "var(--radius-xl)",
              boxShadow: "var(--shadow-xl)",
              maxWidth: isMobile ? "100%" : "800px",
              width: "100%",
              maxHeight: isMobile ? "90vh" : "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: isMobile ? "1.125rem" : "1.25rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Crop Image
              </h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCancel}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "var(--space-sm)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                  borderRadius: "var(--radius-sm)",
                  minHeight: "auto",
                }}
              >
                <FiX size={22} />
              </motion.button>
            </div>

            {/* Crop Area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "var(--bg-tertiary)",
              }}
            >
              {src && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                >
                  <img
                    ref={imgRef}
                    src={src}
                    onLoad={(e) => onLoad(e.currentTarget)}
                    style={{
                      maxWidth: "100%",
                      maxHeight: isMobile ? "50vh" : "60vh",
                      display: "block",
                    }}
                    alt="Crop"
                  />
                </ReactCrop>
              )}
            </div>

            {/* Footer Actions */}
            <div
              style={{
                padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                gap: "var(--space-md)",
                flexDirection: isMobile ? "column-reverse" : "row",
                justifyContent: "flex-end",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className={isMobile ? "btn-mobile-full" : ""}
                style={{
                  padding: "0.875rem 1.5rem",
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "1rem",
                  transition: "all var(--transition-base)",
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                disabled={!completedCrop}
                className={isMobile ? "btn-mobile-full" : ""}
                style={{
                  padding: "0.875rem 1.5rem",
                  background: completedCrop
                    ? "var(--primary-green)"
                    : "var(--bg-tertiary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: completedCrop ? "pointer" : "not-allowed",
                  fontWeight: 500,
                  fontSize: "1rem",
                  opacity: completedCrop ? 1 : 0.5,
                  transition: "all var(--transition-base)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <FiCheck size={18} />
                Apply & Upload
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ========================================
// MAIN IMAGE UPLOAD MODAL
// ========================================
export default function ImageUploadModal({
  open,
  onClose,
  product,
  onUploadSuccess,
}) {
  const { isMobile } = useResponsive();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pendingSrc, setPendingSrc] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const [reCrop, setReCrop] = useState(null);

  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState("");

  // Fetch images
  const fetchImages = useCallback(async () => {
    if (!product?._id) return;
    setLoading(true);
    try {
      const imgs = await productService.getProductImages(product._id);
      setImages(imgs || []);

      // Fetch variants
      try {
        const vRes = await inventoryService.getProductVariants(product._id);
        setVariants(vRes.data || vRes || []);
      } catch (ve) {
        setVariants([]);
      }
    } catch (e) {
      console.error("Fetch images error:", e);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [product]);

  useEffect(() => {
    if (open) fetchImages();
  }, [open, fetchImages]);

  // Handle file input
  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    const src = URL.createObjectURL(file);
    setPendingSrc(src);
    setShowCrop(true);
    e.target.value = "";
  };

  // Upload new cropped image
  const applyNewCropAndUpload = async (blob) => {
    setShowCrop(false);
    setUploading(true);
    try {
      const file = new File(
        [blob],
        pendingFile?.name || `img-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );
      const fd = new FormData();
      fd.append("images", file);
      if (selectedVariant) fd.append("variantId", selectedVariant);

      await productService.uploadMultipleProductImages(product._id, fd);
      toast.success("Image uploaded successfully");
      setPendingSrc(null);
      setPendingFile(null);
      await fetchImages();
      onUploadSuccess?.();
    } catch (e) {
      console.error("Upload error:", e);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const handleDelete = async (img) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      const filename = img.filename || img._id;
      await productService.deleteProductImage(product._id, filename);
      toast.success("Image deleted");
      await fetchImages();
      onUploadSuccess?.();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  // Set primary image
  const handleSetPrimary = async (img) => {
    try {
      const filename = img.filename || img._id;
      await productService.setPrimaryImage(product._id, filename);
      toast.success("Primary image updated");
      await fetchImages();
      onUploadSuccess?.();
    } catch (err) {
      console.error("Set primary error:", err);
      toast.error("Update failed");
    }
  };

  // Re-crop existing image
  const openReCrop = (img) => {
    const src =
      img.fullUrl ||
      img.fullImageUrl ||
      `${API_BASE_URL}${img.url || img.imageUrl}`;
    setReCrop({ img, src });
  };

  const applyReCrop = async (blob) => {
    setReCrop(null);
    setUploading(true);
    try {
      const file = new File([blob], `recrop-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const fd = new FormData();
      fd.append("images", file);
      if (selectedVariant) fd.append("variantId", selectedVariant);

      await productService.uploadMultipleProductImages(product._id, fd);

      try {
        await productService.deleteProductImage(
          product._id,
          reCrop.img.filename || reCrop.img._id
        );
      } catch {}

      toast.success("Image updated");
      await fetchImages();
      onUploadSuccess?.();
    } catch (e) {
      console.error("Re-crop error:", e);
      toast.error("Update failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: isMobile ? "flex-end" : "center",
              justifyContent: "center",
              zIndex: "var(--z-modal-backdrop)",
              padding: isMobile ? 0 : "var(--space-lg)",
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={{
                y: isMobile ? "100%" : 0,
                scale: isMobile ? 1 : 0.9,
                opacity: 0,
              }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{
                y: isMobile ? "100%" : 0,
                scale: isMobile ? 1 : 0.9,
                opacity: 0,
              }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-secondary)",
                borderRadius: isMobile
                  ? "var(--radius-xl) var(--radius-xl) 0 0"
                  : "var(--radius-xl)",
                boxShadow: "var(--shadow-xl)",
                maxWidth: isMobile ? "100%" : "900px",
                width: "100%",
                maxHeight: isMobile ? "90vh" : "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "var(--space-md)",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: isMobile ? "1.125rem" : "1.25rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Product Images
                  </h3>
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {product?.name}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-sm)",
                    alignItems: "center",
                  }}
                >
                  <label htmlFor="prod-img-input">
                    <input
                      id="prod-img-input"
                      type="file"
                      accept="image/*"
                      onChange={onInputChange}
                      style={{ display: "none" }}
                    />
                    <motion.button
                      component="span"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        document.getElementById("prod-img-input").click()
                      }
                      style={{
                        padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.25rem",
                        background: "var(--primary-green)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: isMobile ? "0.875rem" : "0.9375rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-sm)",
                        minHeight: "auto",
                      }}
                    >
                      <FiUploadCloud size={18} />
                      {!isMobile && "Upload"}
                    </motion.button>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: "var(--space-sm)",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      display: "flex",
                      borderRadius: "var(--radius-sm)",
                      minHeight: "auto",
                    }}
                  >
                    <FiX size={22} />
                  </motion.button>
                </div>
              </div>

              {/* Progress Bar */}
              {(uploading || loading) && (
                <div
                  style={{
                    height: "3px",
                    background: "var(--bg-tertiary)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{ x: ["0%", "100%"] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      height: "100%",
                      width: "50%",
                      background: "var(--primary-green)",
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
                }}
              >
                {/* Variant Selector */}
                {variants && variants.length > 0 && (
                  <div style={{ marginBottom: "var(--space-lg)" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "var(--space-sm)",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Select Variant (Optional)
                    </label>
                    <select
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.875rem 1rem",
                        fontSize: isMobile ? "16px" : "1rem",
                        border: "1.5px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="">General Images (No Variant)</option>
                      {variants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.color?.colorName ? `${v.color.colorName} ` : ""}
                          {v.size?.sizeName ? ` / ${v.size.sizeName}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Empty State */}
                {images.length === 0 && !loading ? (
                  <div
                    style={{
                      padding: "var(--space-3xl)",
                      border: "2px dashed var(--border-color)",
                      borderRadius: "var(--radius-lg)",
                      textAlign: "center",
                      background: "var(--bg-tertiary)",
                    }}
                  >
                    <FiUploadCloud
                      size={isMobile ? 48 : 64}
                      style={{
                        color: "var(--text-tertiary)",
                        marginBottom: "var(--space-md)",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        marginBottom: "var(--space-xs)",
                      }}
                    >
                      No images yet
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        margin: 0,
                      }}
                    >
                      Click "Upload" to add images
                    </p>
                  </div>
                ) : (
                  /* Image Grid */
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "repeat(2, 1fr)"
                        : "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: isMobile ? "var(--space-sm)" : "var(--space-md)",
                    }}
                  >
                    <AnimatePresence>
                      {images.map((img, idx) => {
                        const imgSrc =
                          img.fullUrl ||
                          img.fullImageUrl ||
                          `${API_BASE_URL}${img.url || img.imageUrl}`;
                        return (
                          <motion.div
                            key={img.filename || img._id || idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card"
                            style={{
                              padding: 0,
                              overflow: "hidden",
                              border: img.isPrimary
                                ? "2px solid var(--primary-green)"
                                : "1px solid var(--border-color)",
                              position: "relative",
                            }}
                          >
                            {/* Primary Badge */}
                            {img.isPrimary && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "var(--space-sm)",
                                  left: "var(--space-sm)",
                                  background: "var(--primary-green)",
                                  color: "#fff",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "var(--radius-xs)",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  zIndex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <FiStar size={12} />
                                Primary
                              </div>
                            )}

                            {/* Image */}
                            <div
                              style={{
                                width: "100%",
                                aspectRatio: "1",
                                overflow: "hidden",
                                background: "var(--bg-tertiary)",
                              }}
                            >
                              <img
                                src={imgSrc}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>

                            {/* Actions */}
                            <div
                              style={{
                                padding: "var(--space-sm)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "var(--bg-secondary)",
                                borderTop: "1px solid var(--border-color)",
                              }}
                            >
                              <div style={{ display: "flex", gap: "0.25rem" }}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleSetPrimary(img)}
                                  disabled={img.isPrimary}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "var(--space-xs)",
                                    cursor: img.isPrimary
                                      ? "not-allowed"
                                      : "pointer",
                                    color: img.isPrimary
                                      ? "var(--primary-green)"
                                      : "var(--text-secondary)",
                                    display: "flex",
                                    borderRadius: "var(--radius-xs)",
                                    minHeight: "auto",
                                    opacity: img.isPrimary ? 0.5 : 1,
                                  }}
                                  title="Set as primary"
                                >
                                  <FiStar
                                    size={16}
                                    fill={
                                      img.isPrimary ? "currentColor" : "none"
                                    }
                                  />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openReCrop(img)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "var(--space-xs)",
                                    cursor: "pointer",
                                    color: "var(--text-secondary)",
                                    display: "flex",
                                    borderRadius: "var(--radius-xs)",
                                    minHeight: "auto",
                                  }}
                                  title="Re-crop"
                                >
                                  <FiEdit2 size={16} />
                                </motion.button>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(img)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  padding: "var(--space-xs)",
                                  cursor: "pointer",
                                  color: "var(--error)",
                                  display: "flex",
                                  borderRadius: "var(--radius-xs)",
                                  minHeight: "auto",
                                }}
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
                  borderTop: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={isMobile ? "btn-mobile-full" : ""}
                  style={{
                    padding: "0.875rem 1.5rem",
                    background: "var(--primary-green)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "1rem",
                  }}
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop Modals */}
      {showCrop && pendingSrc && (
        <CropDialog
          open={showCrop}
          src={pendingSrc}
          onCancel={() => {
            setShowCrop(false);
            setPendingSrc(null);
            setPendingFile(null);
          }}
          onApply={applyNewCropAndUpload}
        />
      )}

      {reCrop && (
        <CropDialog
          open={Boolean(reCrop)}
          src={reCrop.src}
          onCancel={() => setReCrop(null)}
          onApply={applyReCrop}
        />
      )}
    </>
  );
}

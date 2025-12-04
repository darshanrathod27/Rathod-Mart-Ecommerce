import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Star,
  StarBorder,
  Close,
  Image as ImageIcon,
  CheckCircle,
  Edit,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { productService } from "../../services/productService";
import { inventoryService } from "../../services/inventoryService";
import { uploadToCloudinary } from "../../utils/uploadCloudinary";

// Helper for canvas cropping
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
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
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95)
  );
};

// Crop Dialog Component
const CropDialog = ({ open, src, onCancel, onApply }) => {
  const [crop, setCrop] = useState({ unit: "%", width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const handleApply = async () => {
    if (!completedCrop || !imgRef.current) return;
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
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>Crop Image</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop"
              style={{ maxWidth: "100%", maxHeight: "60vh" }}
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply & Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function ImageUploadModal({
  open,
  onClose,
  product,
  onUploadSuccess,
}) {
  const theme = useTheme();
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Crop state
  const [showCrop, setShowCrop] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [pendingFile, setPendingFile] = useState(null); // File waiting to be cropped

  // Re-crop state
  const [reCrop, setReCrop] = useState(null); // Object { img, src }

  // --- 1. Fetch Data on Load ---
  const fetchData = useCallback(async () => {
    if (!product?._id) return;
    setLoading(true);
    try {
      const [imgs, vRes] = await Promise.all([
        productService.getProductImages(product._id),
        inventoryService.getProductVariants(product._id),
      ]);
      setImages(imgs || []);
      setVariants(Array.isArray(vRes) ? vRes : vRes?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [product]);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  // --- 2. Handle File Selection (Trigger Crop) ---
  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles?.length) return;
    // For simplicity, handle one file crop at a time.
    // You can enhance this to loop through files if needed.
    const file = acceptedFiles[0];
    setPendingFile(file);
    setCropSrc(URL.createObjectURL(file));
    setShowCrop(true);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false, // Changed to false to simplify crop flow (one by one)
    noClick: true,
    noKeyboard: true,
  });

  // --- 3. Apply New Image Crop & Upload ---
  const applyNewCropAndUpload = async (blob) => {
    setShowCrop(false);
    setUploading(true);
    const toastId = toast.loading("Uploading...");

    try {
      const file = new File([blob], pendingFile?.name || "image.jpg", {
        type: "image/jpeg",
      });

      // 1. Upload to Cloudinary
      const uploaded = await uploadToCloudinary(file);

      // 2. Prepare new image object
      const newImage = {
        url: uploaded.url,
        filename: uploaded.publicId,
        alt: product?.name || "Product Image",
        isPrimary: images.length === 0,
        variant: selectedVariant || null,
      };

      // 3. Send to backend (append to existing)
      const allImages = [...images, newImage];

      // We need to send minimal data for existing images to avoid re-processing issues if backend logic is complex,
      // but typically sending the full updated array is standard for 'updateProduct'.
      // Ensure backend updateProduct handles the "images" array replacement correctly.
      await productService.updateProduct(product._id, {
        images: allImages,
      });

      toast.success("Image uploaded!", { id: toastId });
      setPendingSrc(null);
      setPendingFile(null);
      await fetchData();
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // --- 4. Re-Crop Existing Image ---
  const openReCrop = (img) => {
    // Use fullUrl or url
    const src = img.fullUrl || img.url || img.imageUrl;
    if (!src) return toast.error("Cannot load image for editing");
    setReCrop({ img, src });
  };

  const applyReCrop = async (blob) => {
    const oldImg = reCrop.img;
    setReCrop(null);
    setUploading(true);
    const toastId = toast.loading("Updating image...");

    try {
      const file = new File([blob], "recrop.jpg", { type: "image/jpeg" });

      // 1. Upload new version
      const uploaded = await uploadToCloudinary(file);

      // 2. Construct new image object
      const newImageObj = {
        ...oldImg,
        url: uploaded.url,
        filename: uploaded.publicId,
        // Preserve other fields
      };

      // 3. Replace in array
      const updatedImages = images.map((img) =>
        img.filename === oldImg.filename || img._id === oldImg._id
          ? newImageObj
          : img
      );

      // 4. Update product (and explicitly delete old image from Cloudinary via backend)
      await productService.updateProduct(product._id, {
        images: updatedImages,
        deleteFilenames: [oldImg.filename], // Delete old ID
      });

      toast.success("Image updated!", { id: toastId });
      await fetchData();
      if (onUploadSuccess) onUploadSuccess();
    } catch (e) {
      console.error(e);
      toast.error("Update failed", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // --- 5. Other Actions ---
  const handleDelete = async (img) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      const idToDelete = img.filename || img._id;
      await productService.deleteProductImage(product._id, idToDelete);
      toast.success("Image deleted");
      fetchData();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleSetPrimary = async (img) => {
    if (img.isPrimary) return;
    try {
      const idToUpdate = img.filename || img._id;
      await productService.setPrimaryImage(product._id, idToUpdate);
      toast.success("Primary image updated");
      fetchData();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ImageIcon />
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                Manage Images
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {product?.name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "#FAFAFA", minHeight: 400 }}>
          {/* Variant Selector */}
          {variants.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fff",
                borderRadius: 2,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="variant-select-label">
                  Upload for Specific Variant (Optional)
                </InputLabel>
                <Select
                  labelId="variant-select-label"
                  value={selectedVariant}
                  label="Upload for Specific Variant (Optional)"
                  onChange={(e) => setSelectedVariant(e.target.value)}
                >
                  <MenuItem value="">
                    <em>General (All Variants)</em>
                  </MenuItem>
                  {variants.map((v) => (
                    <MenuItem key={v._id} value={v._id}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`${v.size?.sizeName || "Size"} • ${
                            v.color?.colorName || "Color"
                          }`}
                          size="small"
                          sx={{
                            bgcolor: v.color?.value,
                            color:
                              v.color?.value === "#FFFFFF" ? "#000" : "#fff",
                            border: "1px solid #eee",
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          SKU: {v.sku || "N/A"}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}

          {/* Dropzone Area */}
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "#4CAF50",
              borderRadius: 3,
              bgcolor: isDragActive ? "rgba(76, 175, 80, 0.1)" : "#F1F8E9",
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(76, 175, 80, 0.08)",
                borderColor: "primary.dark",
                transform: "translateY(-2px)",
              },
              mb: 4,
            }}
            onClick={openFileDialog}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h6" color="primary.dark" fontWeight={600}>
              {isDragActive ? "Drop file now" : "Click or Drag Image Here"}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Supports: JPG, PNG, WEBP (Max 5MB)
            </Typography>
            {selectedVariant && (
              <Chip
                label="Uploading to Variant"
                size="small"
                color="primary"
                sx={{ mt: 1.5 }}
              />
            )}
          </Box>

          {/* Loading Bar */}
          {(uploading || loading) && (
            <Box sx={{ width: "100%", mb: 3 }}>
              <LinearProgress
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#E8F5E9",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "primary.main",
                  },
                }}
              />
              <Typography
                variant="caption"
                align="center"
                display="block"
                sx={{ mt: 0.5, color: "primary.main", fontWeight: 600 }}
              >
                {uploading ? "Uploading to Cloud..." : "Loading Gallery..."}
              </Typography>
            </Box>
          )}

          {/* Image Grid */}
          {images.length === 0 && !loading ? (
            <Box textAlign="center" py={4} color="text.disabled">
              <Typography>No images found for this product.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {images.map((img, index) => (
                <Grid item xs={6} sm={4} md={3} key={img._id || index}>
                  <Card
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      border: img.isPrimary
                        ? "2px solid #2E7D32"
                        : "1px solid #eee",
                      boxShadow: img.isPrimary
                        ? "0 4px 12px rgba(46, 125, 50, 0.2)"
                        : "none",
                      transition: "all 0.2s",
                      "&:hover": { boxShadow: 3 },
                    }}
                  >
                    {/* Badges */}
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}
                    >
                      {img.isPrimary && (
                        <Chip
                          label="Primary"
                          size="small"
                          color="primary"
                          icon={
                            <CheckCircle sx={{ "&&": { color: "#fff" } }} />
                          }
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {img.variant && (
                        <Chip
                          label="Variant"
                          size="small"
                          sx={{
                            height: 20,
                            bgcolor: "secondary.main",
                            color: "#fff",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Stack>

                    <CardMedia
                      component="img"
                      height="140"
                      image={img.url || img.fullUrl}
                      alt="Product"
                      sx={{
                        objectFit: "contain",
                        bgcolor: "#fff",
                        p: 1,
                      }}
                    />

                    <CardActions
                      sx={{
                        justifyContent: "space-between",
                        bgcolor: "#FAFAFA",
                        borderTop: "1px solid #f0f0f0",
                        p: 0.5,
                      }}
                    >
                      <Tooltip
                        title={
                          img.isPrimary ? "Already Primary" : "Set as Primary"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleSetPrimary(img)}
                            disabled={img.isPrimary}
                            color={img.isPrimary ? "primary" : "default"}
                          >
                            {img.isPrimary ? <Star /> : <StarBorder />}
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit/Crop">
                          <IconButton
                            size="small"
                            onClick={() => openReCrop(img)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Image">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(img)}
                            sx={{
                              color: "error.main",
                              "&:hover": { bgcolor: "rgba(211, 47, 47, 0.04)" },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>

        <DialogActions
          sx={{ p: 2, bgcolor: "#fff", borderTop: "1px solid #eee" }}
        >
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 50,
              px: 4,
              background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crop dialog for new uploads */}
      {showCrop && cropSrc && (
        <CropDialog
          open={showCrop}
          src={cropSrc}
          onCancel={() => {
            setShowCrop(false);
            setCropSrc(null);
            setPendingFile(null);
          }}
          onApply={applyNewCropAndUpload}
        />
      )}

      {/* Crop dialog for recropping */}
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

// src/components/Forms/ProductForm.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  Fragment,
} from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Chip,
  Stack,
  Typography,
  FormControlLabel,
  Switch,
  InputAdornment,
  Divider,
  IconButton,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Paper,
  Card,
  CardMedia,
  CardActions,
  Tooltip,
  Autocomplete,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions as MuiDialogActions,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDropzone } from "react-dropzone";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { inventoryService } from "../../services/inventoryService";
import { uploadToCloudinary } from "../../utils/uploadCloudinary"; // Helper import
import toast from "react-hot-toast";
import {
  StyledFormDialog,
  formHeaderStyles,
  fieldContainerStyles,
  textFieldStyles,
  formActionsStyles,
  cancelButtonStyles,
  submitButtonStyles,
  sectionHeaderStyles,
} from "../../theme/FormStyles";

/* --------------- validation schema --------------- */
const schema = yup.object({
  name: yup.string().trim().required("Product name is required"),
  description: yup.string().trim().required("Description is required"),
  category: yup.string().required("Category is required"),
  basePrice: yup
    .number()
    .typeError("Base price must be a number")
    .min(0, "Price must be >= 0")
    .required("Base price is required"),
  discountPercentage: yup
    .number()
    .typeError("Must be a number")
    .min(0, ">= 0")
    .max(100, "<= 100")
    .nullable()
    .transform((v) => (v === "" ? null : v)),
});

/* ----------------- Helper: crop image (canvas -> blob) ----------------- */
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

export default function ProductForm({
  initialData = null,
  onSubmit,
  onCancel,
  categories = [],
  submitting = false,
  open = true,
  onClose,
  embedded = false,
}) {
  const isEdit = Boolean(initialData && initialData._id);
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      shortDescription: initialData?.shortDescription || "",
      category:
        (initialData?.category &&
          (initialData.category._id || initialData.category)) ||
        "",
      brand: initialData?.brand || "",
      basePrice: initialData?.basePrice ?? 0,
      discountPercentage:
        initialData &&
        initialData.basePrice &&
        initialData.discountPrice != null
          ? Math.round(
              ((initialData.basePrice - initialData.discountPrice) /
                initialData.basePrice) *
                100
            )
          : "",
      discountPrice: initialData?.discountPrice ?? initialData?.basePrice ?? 0,
      status: initialData?.status || "draft",
      featured: initialData?.featured || false,
      trending: initialData?.trending || false,
      isBestOffer: initialData?.isBestOffer || false,
      tags: initialData?.tags || [],
      features: initialData?.features || [],
    },
  });

  // Images state management
  const [images, setImages] = useState(() =>
    (initialData?.images || []).map((img) => ({
      ...img,
      id: img._id || img.filename || `${Date.now()}-${Math.random()}`,
      previewUrl: img.fullUrl || img.fullImageUrl || img.url || img.imageUrl,
      filename: img.filename,
    }))
  );

  const [deleteFilenames, setDeleteFilenames] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const tags = watch("tags") || [];
  const features = watch("features") || [];
  const basePrice = watch("basePrice");
  const discountPerc = watch("discountPercentage");

  /* recalculated discountPrice when basePrice or discountPercentage changes */
  useEffect(() => {
    const b = parseFloat(basePrice);
    const p = parseFloat(discountPerc);
    if (!isNaN(b) && typeof p === "number" && !isNaN(p)) {
      const disc = b - (b * (p || 0)) / 100;
      setValue(
        "discountPrice",
        Number.isFinite(disc) ? Number(disc.toFixed(2)) : b
      );
    } else {
      setValue("discountPrice", isNaN(+b) ? 0 : Number((+b).toFixed(2)));
    }
  }, [basePrice, discountPerc, setValue]);

  // Reset form and fetch variants on open/change
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        shortDescription: initialData?.shortDescription || "",
        category:
          (initialData?.category &&
            (initialData.category._id || initialData.category)) ||
          "",
        brand: initialData?.brand || "",
        basePrice: initialData?.basePrice ?? 0,
        discountPercentage:
          initialData &&
          initialData.basePrice &&
          initialData.discountPrice != null
            ? Math.round(
                ((initialData.basePrice - initialData.discountPrice) /
                  initialData.basePrice) *
                  100
              )
            : "",
        discountPrice:
          initialData?.discountPrice ?? initialData?.basePrice ?? 0,
        status: initialData?.status || "draft",
        featured: initialData?.featured || false,
        trending: initialData?.trending || false,
        isBestOffer: initialData?.isBestOffer || false,
        tags: initialData?.tags || [],
        features: initialData?.features || [],
      });
      setImages(
        (initialData?.images || []).map((img) => ({
          ...img,
          id: img._id || img.filename || `${Date.now()}-${Math.random()}`,
          previewUrl:
            img.fullUrl || img.fullImageUrl || img.url || img.imageUrl,
          filename: img.filename,
        }))
      );
      setDeleteFilenames([]);

      const fetchVariants = async () => {
        try {
          const vRes = await inventoryService.getProductVariants(
            initialData._id
          );
          setVariants(vRes.data || vRes || []);
        } catch (e) {
          console.error("Failed to fetch variants for form", e);
          setVariants([]);
        }
      };
      if (isEdit) {
        fetchVariants();
      }
    }
  }, [initialData, reset, isEdit]);

  // ---------------- Crop states and queue ----------------
  const [showCrop, setShowCrop] = useState(false);
  const [cropSrc, setCropSrc] = useState(null); // current image URL for cropping
  const [pendingFile, setPendingFile] = useState(null); // current File object to crop
  const [crop, setCrop] = useState({ unit: "%", width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  // queue for multiple dropped files
  const [cropQueue, setCropQueue] = useState([]); // array of File objects

  // Dropzone for adding images (now supports queueing & cropping)
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      // Add accepted files to queue (we will process sequentially)
      setCropQueue((prev) => [...prev, ...acceptedFiles]);
    },
    [setCropQueue]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  // When queue changes and nothing currently open, start cropping the first item
  useEffect(() => {
    if (!showCrop && cropQueue.length > 0) {
      const next = cropQueue[0];
      setPendingFile(next);
      setCropSrc(URL.createObjectURL(next));
      setShowCrop(true);
      // set default crop
      setCrop({ unit: "%", width: 80, aspect: 1 });
      // don't remove from queue yet; removal happens after apply/cancel
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropQueue, showCrop]);

  const processNextInQueue = () => {
    setCropQueue((prev) => prev.slice(1));
  };

  // Apply crop (create file from blob and push to images)
  const handleCropApply = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error("Please complete crop selection");
      return;
    }
    try {
      // Calculate pixelCrop taking into account displayed vs natural size
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const pixelCrop = {
        x: Math.round(completedCrop.x * scaleX),
        y: Math.round(completedCrop.y * scaleY),
        width: Math.round(completedCrop.width * scaleX),
        height: Math.round(completedCrop.height * scaleY),
      };

      const blob = await getCroppedImg(imgRef.current.src, pixelCrop);
      const fileName = pendingFile
        ? pendingFile.name
        : `cropped-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      const newImg = {
        id: `${file.name}-${Date.now()}`,
        _localFile: file,
        previewUrl: URL.createObjectURL(file),
        alt: file.name,
        isPrimary: images.length === 0,
        filename: null,
      };

      setImages((prev) => [...prev, newImg]);

      // cleanup and move to next queued file
      try {
        URL.revokeObjectURL(cropSrc);
      } catch (e) {}
      setShowCrop(false);
      setPendingFile(null);
      setCropSrc(null);
      setCompletedCrop(null);
      processNextInQueue();
    } catch (e) {
      console.error("Crop failed", e);
      toast.error("Crop failed");
      // still proceed to next
      setShowCrop(false);
      setPendingFile(null);
      setCropSrc(null);
      setCompletedCrop(null);
      processNextInQueue();
    }
  };

  const handleCropCancel = () => {
    // user cancelled cropping this image — skip it
    try {
      URL.revokeObjectURL(cropSrc);
    } catch (e) {}
    setShowCrop(false);
    setPendingFile(null);
    setCropSrc(null);
    setCompletedCrop(null);
    processNextInQueue();
  };

  // Handle removing image (mark for deletion if it exists on server)
  const handleRemoveImage = (id) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove && imageToRemove.filename && !imageToRemove._localFile) {
      // If it has a filename and no local file, it's on Cloudinary. Mark for delete.
      setDeleteFilenames((prev) => [...prev, imageToRemove.filename]);
    }
    setImages((prevImages) => prevImages.filter((img) => img.id !== id));
  };

  const addTag = (value) => {
    const v = (value || "").trim();
    if (!v) return;
    if (!tags.includes(v))
      setValue("tags", [...tags, v], { shouldValidate: true });
    setTagInput("");
  };
  const removeTag = (index) => {
    const arr = [...tags];
    arr.splice(index, 1);
    setValue("tags", arr, { shouldValidate: true });
  };
  const addFeature = (value) => {
    const v = (value || "").trim();
    if (!v) return;
    if (!features.includes(v))
      setValue("features", [...features, v], { shouldValidate: true });
    setFeatureInput("");
  };
  const removeFeature = (index) => {
    const arr = [...features];
    arr.splice(index, 1);
    setValue("features", arr, { shouldValidate: true });
  };

  const onKeyDown = (e) => {
    const tag = e.target?.tagName?.toLowerCase();
    if (e.key === "Enter" && tag !== "textarea") e.preventDefault();
  };

  // --- SUBMIT HANDLER (Unsigned Upload) ---
  const submit = async (vals) => {
    setIsUploading(true);
    try {
      const finalImages = [];

      // 1. Upload new local files to Cloudinary
      for (const img of images) {
        if (img._localFile) {
          // Upload to Cloudinary directly
          const uploaded = await uploadToCloudinary(img._localFile);
          finalImages.push({
            url: uploaded.url,
            filename: uploaded.publicId, // Important for delete later
            alt: img.alt || vals.name,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder || 0,
            variant: selectedVariant || null,
          });
        } else {
          // Existing image, keep as is
          finalImages.push({
            url: img.previewUrl,
            filename: img.filename,
            alt: img.alt,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
            variant: img.variant || null,
          });
        }
      }

      // 2. Prepare Payload (JSON Object)
      const payload = {
        ...vals,
        images: finalImages, // Send array of objects
        deleteFilenames: deleteFilenames, // Send IDs to delete from Cloudinary backend
        tags: vals.tags,
        features: vals.features,
        variantId: selectedVariant || null,
        featured: Boolean(vals.featured),
        trending: Boolean(vals.trending),
        isBestOffer: Boolean(vals.isBestOffer),
      };

      if (isEdit) payload._id = initialData._id;

      // 3. Send JSON to Backend (onSubmit expects object, backend controller updated to handle JSON)
      await onSubmit(payload, { isEdit, id: initialData?._id });
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Failed to save product. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  const formInner = (
    <Box sx={{ p: 3 }}>
      <Box
        component="form"
        onSubmit={handleSubmit(submit)}
        onKeyDown={onKeyDown}
      >
        <Box sx={{ ...fieldContainerStyles, mb: 2 }}>
          <Typography sx={sectionHeaderStyles}>
            <InfoOutlinedIcon sx={{ fontSize: 20 }} />
            Basic Information
          </Typography>

          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Product Name"
                  fullWidth
                  required
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={textFieldStyles}
                />
              )}
            />

            <Controller
              name="category"
              control={control}
              render={({ field: { onChange, value, ref, onBlur } }) => {
                const selectedCategory =
                  categories.find((c) => (c._id || c.id) === value) || null;

                return (
                  <Autocomplete
                    options={categories}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedCategory}
                    onChange={(_, newValue) => {
                      onChange(newValue ? newValue._id || newValue.id : "");
                    }}
                    onBlur={onBlur}
                    isOptionEqualToValue={(option, val) =>
                      (option._id || option.id) === (val._id || val.id)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        required
                        fullWidth
                        size="small"
                        inputRef={ref}
                        error={!!errors.category}
                        helperText={errors.category?.message}
                        sx={textFieldStyles}
                      />
                    )}
                  />
                );
              }}
            />

            <Controller
              name="brand"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Brand"
                  fullWidth
                  size="small"
                  sx={textFieldStyles}
                />
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="basePrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Base Price"
                    type="number"
                    fullWidth
                    required
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                    error={!!errors.basePrice}
                    helperText={errors.basePrice?.message}
                    sx={textFieldStyles}
                  />
                )}
              />

              <Controller
                name="discountPercentage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Discount %"
                    type="number"
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    error={!!errors.discountPercentage}
                    helperText={errors.discountPercentage?.message}
                    sx={textFieldStyles}
                  />
                )}
              />

              <Controller
                name="discountPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Final Price"
                    type="number"
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                      readOnly: true,
                    }}
                    sx={textFieldStyles}
                  />
                )}
              />
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#E8F5E9" }} />

        <Box sx={{ ...fieldContainerStyles, mb: 2 }}>
          <Typography sx={sectionHeaderStyles}>
            <ImageOutlinedIcon sx={{ fontSize: 20 }} />
            Product Images & Preview
          </Typography>

          {isEdit && variants && variants.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }} size="small">
              <InputLabel>Assign new images to (Optional)</InputLabel>
              <Select
                value={selectedVariant}
                label="Assign new images to (Optional)"
                onChange={(e) => setSelectedVariant(e.target.value)}
                sx={textFieldStyles}
              >
                <MenuItem value="">
                  <em>General Images (No Variant)</em>
                </MenuItem>
                {variants.map((v) => (
                  <MenuItem key={v._id} value={v._id}>
                    {v.color?.colorName ? `${v.color.colorName} ` : ""}
                    {v.size?.sizeName ? ` / ${v.size.sizeName}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Paper
            {...getRootProps()}
            onClick={(e) => {
              // let dropzone handle click
            }}
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "#66BB6A",
              borderRadius: 2,
              backgroundColor: isDragActive ? "#E8F5E9" : "#F1F8F1",
              p: 2,
              minHeight: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography variant="h6" color="primary">
                Drop files here...
              </Typography>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 40, color: "#66BB6A" }} />
                <Typography color="textSecondary" sx={{ mt: 1 }}>
                  Drag & drop images here, or click to browse
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  (You can add multiple images — each will open for crop)
                </Typography>
                <Button
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                  sx={{ mt: 1 }}
                >
                  Browse files
                </Button>
              </>
            )}
          </Paper>

          {images.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {images.map((img) => (
                  <Grid item xs={6} sm={4} md={3} key={img.id}>
                    <Card sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={img.previewUrl}
                        alt={img.alt || "preview"}
                        sx={{ objectFit: "cover" }}
                      />
                      <CardActions
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          p: 0.5,
                        }}
                      >
                        <Tooltip title="Remove Image">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage(img.id)}
                            sx={{
                              bgcolor: "rgba(255, 0, 0, 0.6)",
                              color: "white",
                              "&:hover": { bgcolor: "rgba(255, 0, 0, 0.9)" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2, borderColor: "#E8F5E9" }} />

        <Box sx={{ ...fieldContainerStyles }}>
          <Typography sx={sectionHeaderStyles}>
            <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
            Specifications & Details
          </Typography>

          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="shortDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Short Description"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Brief product description"
                  sx={textFieldStyles}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Description"
                  fullWidth
                  required
                  size="small"
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  placeholder="Detailed product description"
                  sx={textFieldStyles}
                />
              )}
            />

            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 600, color: "#2E7D32" }}
              >
                Tags
              </Typography>
              {tags.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                  {tags.map((t, idx) => (
                    <Chip
                      key={t + idx}
                      label={t}
                      size="small"
                      onDelete={() => removeTag(idx)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              )}
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Add tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  fullWidth
                  sx={textFieldStyles}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => addTag(tagInput)}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 600, color: "#2E7D32" }}
              >
                Features
              </Typography>
              {features.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                  {features.map((f, idx) => (
                    <Chip
                      key={f + idx}
                      label={f}
                      size="small"
                      onDelete={() => removeFeature(idx)}
                      color="primary"
                      variant="outlined"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              )}
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Add feature and press Enter"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature(featureInput);
                    }
                  }}
                  fullWidth
                  sx={textFieldStyles}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => addFeature(featureInput)}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  fullWidth
                  size="small"
                  sx={textFieldStyles}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              )}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch {...field} checked={!!field.value} size="small" />
                    }
                    label="Featured"
                  />
                )}
              />
              <Controller
                name="trending"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch {...field} checked={!!field.value} size="small" />
                    }
                    label="Trending"
                  />
                )}
              />
              <Controller
                name="isBestOffer"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch {...field} checked={!!field.value} size="small" />
                    }
                    label="Best Offer"
                  />
                )}
              />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const actions = (
    <DialogActions sx={formActionsStyles}>
      <Button
        onClick={onClose || onCancel}
        variant="outlined"
        startIcon={<CloseIcon />}
        sx={cancelButtonStyles}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit(submit)}
        variant="contained"
        startIcon={<SaveIcon />}
        sx={submitButtonStyles}
        disabled={submitting || isUploading}
      >
        {isUploading
          ? "Uploading..."
          : submitting
          ? isEdit
            ? "Updating..."
            : "Saving..."
          : isEdit
          ? "Update Product"
          : "Create Product"}
      </Button>
    </DialogActions>
  );

  // Crop dialog UI
  const CropDialog = (
    <Dialog open={showCrop} maxWidth="sm" fullWidth onClose={handleCropCancel}>
      <DialogTitle>
        Crop Image
        <IconButton
          aria-label="close"
          onClick={handleCropCancel}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {cropSrc ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 2,
              }}
            >
              <ReactCrop
                src={cropSrc}
                crop={crop}
                onImageLoaded={(img) => {
                  imgRef.current = img;
                }}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                keepSelection
              />
            </Box>

            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              Tip: drag handles to adjust crop. Aspect is set to 1:1 by default.
            </Typography>
          </Box>
        ) : (
          <Typography>Loading image...</Typography>
        )}
      </DialogContent>
      <MuiDialogActions>
        <Button onClick={handleCropCancel}>Skip</Button>
        <Button variant="contained" onClick={handleCropApply}>
          Apply Crop
        </Button>
      </MuiDialogActions>
    </Dialog>
  );

  if (embedded) {
    return (
      <Fragment>
        {formInner}
        {actions}
        {CropDialog}
      </Fragment>
    );
  }

  return (
    <StyledFormDialog
      open={open}
      onClose={onClose || onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#fff",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 12px 48px rgba(76, 175, 80, 0.25)",
        },
      }}
      BackdropProps={{ sx: { backgroundColor: "rgba(0,0,0,0.55)" } }}
    >
      <Box sx={{ ...formHeaderStyles }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%", px: 3, py: 1.25 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Inventory2Icon sx={{ fontSize: 24, color: "#fff" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "20px", color: "#fff" }}
            >
              {isEdit ? "Edit Product" : "Add New Product"}
            </Typography>
          </Stack>
          <IconButton onClick={onClose || onCancel} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ p: 0, bgcolor: "#fff" }}>{formInner}</Box>
      {actions}
      {CropDialog}
    </StyledFormDialog>
  );
}

ProductForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  categories: PropTypes.array,
  submitting: PropTypes.bool,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  embedded: PropTypes.bool,
};

ProductForm.defaultProps = {
  initialData: null,
  onCancel: () => {},
  categories: [],
  submitting: false,
  open: true,
  onClose: undefined,
  embedded: false,
};

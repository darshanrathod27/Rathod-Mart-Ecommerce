// src/components/Forms/UserForm.jsx
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  FormHelperText,
  Dialog,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/CloseOutlined";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HomeIcon from "@mui/icons-material/Home";

// Validation Imports
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDropzone } from "react-dropzone";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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
import { createUser, updateUser } from "../../services/userService";
import { uploadToCloudinary } from "../../utils/uploadCloudinary"; // Helper import
import toast from "react-hot-toast";

// --- Validation Schema ---
const schema = yup.object({
  name: yup.string().trim().required("Full Name is required"),
  username: yup.string().trim().optional(),
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
  phone: yup.string().trim().optional(),
  birthday: yup.string().nullable(),
  role: yup.string().required("Role is required"),
  status: yup.string().required("Status is required"),
  password: yup
    .string()
    .transform((x) => (x === "" ? undefined : x))
    .min(6, "Password must be at least 6 characters")
    .when("$isEdit", (isEdit, schema) => {
      return isEdit
        ? schema.optional()
        : schema.required("Password is required");
    }),
  address: yup.object({
    street: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    postalCode: yup.string().optional(),
    country: yup.string().optional(),
  }),
});

// Helper for cropping
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

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  });
};

export default function UserForm({
  open = true,
  initialData,
  onClose,
  onSaved,
  embedded = false,
}) {
  const isEdit = Boolean(initialData && initialData._id);
  const [isUploading, setIsUploading] = useState(false);

  // Format date
  const formatDateForInput = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit },
    defaultValues: {
      name: initialData?.name || "",
      username: initialData?.username || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      birthday: formatDateForInput(initialData?.birthday),
      role: initialData?.role || "customer",
      status: initialData?.status || "active",
      password: "",
      address: {
        street: initialData?.address?.street || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
        postalCode: initialData?.address?.postalCode || "",
        country: initialData?.address?.country || "India",
      },
    },
  });

  const [preview, setPreview] = useState(initialData?.profileImage || null);
  const [fileBlob, setFileBlob] = useState(null); // File to be uploaded

  // Crop State
  const [showCrop, setShowCrop] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);

  // Reset form
  useEffect(() => {
    reset({
      name: initialData?.name || "",
      username: initialData?.username || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      birthday: formatDateForInput(initialData?.birthday),
      role: initialData?.role || "customer",
      status: initialData?.status || "active",
      password: "",
      address: {
        street: initialData?.address?.street || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
        postalCode: initialData?.address?.postalCode || "",
        country: initialData?.address?.country || "India",
      },
    });
    setPreview(initialData?.profileImage || null);
    setFileBlob(null);
  }, [initialData, reset]);

  // Image Drop
  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles?.[0]) return;
    const f = acceptedFiles[0];
    setCropSrc(URL.createObjectURL(f));
    setShowCrop(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const removeImage = () => {
    setPreview(null);
    setFileBlob(null);
  };

  // Handle Crop Apply
  const handleCropApply = async () => {
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
      // Create a new File from blob
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });

      setFileBlob(file);
      setPreview(URL.createObjectURL(file));
      setShowCrop(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  // Submit Handler
  const internalSubmit = async (values) => {
    setIsUploading(true);
    try {
      let imageUrl = initialData?.profileImage || "";

      // 1. Upload to Cloudinary if new file exists
      if (fileBlob) {
        const uploaded = await uploadToCloudinary(fileBlob);
        imageUrl = uploaded.url; // Unsigned upload
      }

      // 2. Prepare Payload (JSON)
      const payload = {
        ...values,
        profileImage: imageUrl,
      };

      // 3. Send to Backend
      if (isEdit) {
        await updateUser(initialData._id, payload);
        toast.success("User updated successfully");
      } else {
        await createUser(payload);
        toast.success("User created successfully");
      }
      onSaved?.();
    } catch (e) {
      toast.error(e.message || "Operation failed");
    } finally {
      setIsUploading(false);
    }
  };

  const inner = (
    <Box sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(internalSubmit)} noValidate>
        {/* --- Profile Picture Section --- */}
        <Box sx={{ ...fieldContainerStyles, mb: "24px" }}>
          <Typography sx={sectionHeaderStyles}>
            <CameraAltIcon sx={{ fontSize: 20 }} />
            Profile Picture
          </Typography>
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed #66BB6A",
              borderRadius: 2,
              backgroundColor: "#F1F8F1",
              p: 2,
              minHeight: "120px !important",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            {preview ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  src={preview}
                  variant="rounded"
                  sx={{
                    width: 96,
                    height: 96,
                    border: "4px solid #4CAF50",
                    boxShadow: "0 8px 24px rgba(76, 175, 80, 0.20)",
                  }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CameraAltIcon />}
                    sx={{ ...cancelButtonStyles, px: 2 }}
                  >
                    Change Photo
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    sx={{ px: 2, fontWeight: 600, textTransform: "none" }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 34, color: "#ffffff" }} />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#2E7D32", fontSize: 15 }}
                >
                  {isDragActive ? "Drop image here" : "Upload Profile Picture"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#66BB6A", textAlign: "center", fontSize: 12.5 }}
                >
                  Drag & drop an image here
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Form Fields... (same as before) */}
        <Typography sx={sectionHeaderStyles}>
          <PersonIcon sx={{ fontSize: 20 }} />
          Personal Details
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Birthday"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.birthday}
                  helperText={errors.birthday?.message}
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography sx={sectionHeaderStyles}>
          <HomeIcon sx={{ fontSize: 20 }} />
          Address
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Controller
              name="address.street"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Street Address"
                  fullWidth
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="address.city"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="City"
                  fullWidth
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="address.state"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="State"
                  fullWidth
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="address.postalCode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Postal Code"
                  fullWidth
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="address.country"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Country"
                  fullWidth
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography sx={sectionHeaderStyles}>Access & Security</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={textFieldStyles} error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Role">
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="customer">Customer</MenuItem>
                  </Select>
                )}
              />
              {errors.role && (
                <FormHelperText>{errors.role.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={textFieldStyles} error={!!errors.status}>
              <InputLabel>Status</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                )}
              />
              {errors.status && (
                <FormHelperText>{errors.status.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type="password"
                  placeholder={
                    isEdit ? "Leave blank to keep current" : "Enter password"
                  }
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={textFieldStyles}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  const actions = (
    <DialogActions sx={formActionsStyles}>
      <Button
        onClick={onClose}
        variant="outlined"
        startIcon={<CancelIcon />}
        sx={cancelButtonStyles}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit(internalSubmit)}
        variant="contained"
        startIcon={<SaveIcon />}
        sx={submitButtonStyles}
        disabled={isSubmitting || isUploading}
      >
        {isUploading
          ? "Uploading..."
          : isSubmitting
          ? "Saving..."
          : isEdit
          ? "Update"
          : "Create"}
      </Button>
    </DialogActions>
  );

  if (embedded) {
    return (
      <>
        {inner}
        {actions}
      </>
    );
  }

  return (
    <>
      <StyledFormDialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: "0 12px 48px rgba(76, 175, 80, 0.25)",
          },
        }}
        BackdropProps={{ sx: { backgroundColor: "rgba(0,0,0,0.55)" } }}
      >
        <DialogTitle
          sx={{
            ...formHeaderStyles,
            color: "#ffffff",
            position: "relative",
            zIndex: 1,
            m: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PersonIcon sx={{ fontSize: 28, color: "#fff" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "20px", color: "#fff" }}
            >
              {isEdit ? "Edit User" : "Add New User"}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#ffffff",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: "#fff" }}>{inner}</DialogContent>
        {actions}
      </StyledFormDialog>

      {/* Crop Dialog */}
      <Dialog
        open={showCrop}
        onClose={() => setShowCrop(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crop Profile Image</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            {cropSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={cropSrc}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const aspect = 1;
                    const width =
                      img.width > img.height
                        ? (img.height / img.width) * 100
                        : 100;
                    const height =
                      img.height > img.width
                        ? (img.width / img.height) * 100
                        : 100;
                    setCrop({
                      unit: "%",
                      width: Math.min(width, height) * 0.8,
                      height: Math.min(width, height) * 0.8,
                      x: (100 - width) / 2,
                      y: (100 - height) / 2,
                      aspect,
                    });
                  }}
                  alt="Crop"
                  style={{ maxWidth: "100%", maxHeight: "60vh" }}
                />
              </ReactCrop>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowCrop(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCropApply}
            variant="contained"
            disabled={!completedCrop}
          >
            Apply Crop
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

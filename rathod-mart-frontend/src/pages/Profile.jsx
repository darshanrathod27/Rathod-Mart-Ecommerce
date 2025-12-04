import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Stack,
} from "@mui/material";
import {
  CameraAlt,
  Save,
  Person,
  Home,
  Lock,
  DeleteOutline,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import api from "../data/api";
import { setCredentials } from "../store/authSlice";
import { uploadToCloudinary } from "../utils/uploadCloudinary"; // ✅ New Import

const API_BASE =
  (process.env.REACT_APP_API_URL && String(process.env.REACT_APP_API_URL)) ||
  "http://localhost:5000";

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // ✅ Upload state

  const formatDateForInput = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      birthday: "",
      password: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
      },
    },
  });

  const [preview, setPreview] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);

  const getAvatarUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  useEffect(() => {
    if (userInfo) {
      reset({
        name: userInfo.name || "",
        username: userInfo.username || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        birthday: formatDateForInput(userInfo.birthday),
        password: "",
        address: {
          street: userInfo.address?.street || "",
          city: userInfo.address?.city || "",
          state: userInfo.address?.state || "",
          postalCode: userInfo.address?.postalCode || "",
          country: userInfo.address?.country || "India",
        },
      });
      setPreview(getAvatarUrl(userInfo.profileImage));
    }
  }, [userInfo, reset]);

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles?.[0]) return;
    const f = acceptedFiles[0];
    setPreview(URL.createObjectURL(f));
    setFileBlob(f);
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

  // ✅ UPDATED SUBMIT HANDLER
  const onSubmit = async (values) => {
    setLoading(true);

    try {
      let imageUrl = userInfo.profileImage; // Default to existing

      // 1. Upload new image to Cloudinary (if selected)
      if (fileBlob) {
        setUploading(true);
        const uploadRes = await uploadToCloudinary(fileBlob);
        imageUrl = uploadRes.url;
        setUploading(false);
      } else if (preview === null) {
        // User removed the image
        imageUrl = "";
      }

      // 2. Prepare Payload (JSON now, NOT FormData)
      const payload = {
        name: values.name,
        username: values.username,
        phone: values.phone,
        birthday: values.birthday,
        profileImage: imageUrl, // Send URL string
        address: {
          street: values.address.street,
          city: values.address.city,
          state: values.address.state,
          postalCode: values.address.postalCode,
          country: values.address.country,
        },
      };

      if (values.password) {
        payload.password = values.password;
      }

      // 3. Send JSON to Backend
      // Note: api.put automatically handles JSON content-type
      const res = await api.put("/users/profile", payload);

      dispatch(setCredentials(res.data));
      toast.success("Profile updated successfully!");
      setFileBlob(null); // Reset file
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "primary.dark",
            }}
          >
            <Person sx={{ fontSize: "2.5rem" }} /> My Profile
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Image Upload Section */}
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
            >
              Profile Picture
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
                transition: "all 0.3s ease",
                bgcolor: "background.default",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <input {...getInputProps()} />
              <Avatar
                src={preview}
                sx={{ width: 100, height: 100, bgcolor: "primary.light" }}
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {isDragActive
                    ? "Drop image here..."
                    : "Change Profile Picture"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag & drop or click to browse (Max 5MB)
                </Typography>
                {preview && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutline />}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove Image
                  </Button>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Personal Details */}
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
            >
              Personal Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  {...register("username")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  {...register("email")}
                  fullWidth
                  disabled
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Phone" {...register("phone")} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Birthday"
                  type="date"
                  {...register("birthday")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Address */}
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
            >
              <Home sx={{ mb: -0.5, mr: 0.5 }} /> Shipping Address
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Street Address"
                  {...register("address.street")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  {...register("address.city")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="State"
                  {...register("address.state")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Postal Code"
                  {...register("address.postalCode")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Country"
                  {...register("address.country")}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Security */}
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
            >
              <Lock sx={{ mb: -0.5, mr: 0.5 }} /> Security
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="New Password (optional)"
                  type="password"
                  {...register("password")}
                  helperText="Leave blank to keep current password"
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Actions */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Save />}
                disabled={loading || uploading}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {uploading
                  ? "Uploading Image..."
                  : loading
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </Grid>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Profile;

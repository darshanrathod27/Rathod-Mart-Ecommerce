// frontend/src/pages/Products.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem as MItem,
  Typography,
  Tooltip,
  Stack,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useMediaQuery,
  useTheme,
  Paper,
  Divider,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Rating } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Visibility,
  Delete,
  Image as ImageIcon,
  Inventory,
  Clear,
  Warning,
  FilterList,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ProductForm from "../components/Forms/ProductForm";
import FormModal from "../components/Modals/FormModal";
import ProductViewModal from "../components/Modals/ProductViewModal";
import ImageUploadModal from "../components/Modals/ImageUploadModal";
import VariantStockModal from "../components/Modals/VariantStockModal";
import MobileSearchBar from "../components/Common/MobileSearchBar";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { useDebounce } from "../hooks/useDebounce";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// --- Delete Confirmation Component ---
const DeleteConfirmDialog = ({ open, onClose, onConfirm, itemName }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 3,
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(20px)",
      },
    }}
  >
    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Warning color="error" />
      Confirm Deletion
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete product <strong>{itemName}</strong>?
        This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} variant="outlined" color="inherit">
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" color="error">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

// --- Mobile Product Card Component ---
const MobileProductCard = ({
  product,
  onView,
  onEdit,
  onDelete,
  onImages,
  onStock,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const images = product.images || [];
  const primary = images.find((i) => i.isPrimary) || images[0];
  const src = primary ? primary.fullImageUrl : null;
  const categoryLabel =
    product.category?.name || product.category || "Uncategorized";

  const statusColors = {
    active: "success",
    draft: "warning",
    inactive: "default",
    archived: "error",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(76, 175, 80, 0.1)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(76, 175, 80, 0.15)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Header Row */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            {/* Product Image */}
            <Avatar
              src={src}
              variant="rounded"
              sx={{
                width: 80,
                height: 80,
                border: "2px solid rgba(76, 175, 80, 0.2)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <ImageIcon />
            </Avatar>

            {/* Product Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#2E7D32",
                    fontSize: "1rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  sx={{
                    ml: 1,
                    background: "rgba(76, 175, 80, 0.08)",
                    "&:hover": { background: "rgba(76, 175, 80, 0.15)" },
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                {categoryLabel}
              </Typography>

              {product.brand && (
                <Chip
                  label={product.brand}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    background: "rgba(76, 175, 80, 0.1)",
                    color: "#2E7D32",
                  }}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Details Grid */}
          <Grid container spacing={1.5}>
            {/* Price */}
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Price
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#2E7D32" }}
              >
                ₹{(product.basePrice || 0).toLocaleString("en-IN")}
              </Typography>
            </Grid>

            {/* Stock */}
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Stock
              </Typography>
              <Chip
                label={product.stock || 0}
                size="small"
                color={
                  product.stock > 10
                    ? "success"
                    : product.stock > 0
                      ? "warning"
                      : "error"
                }
                onClick={() => onStock(product)}
                sx={{
                  cursor: "pointer",
                  fontWeight: 600,
                  height: 22,
                  fontSize: "0.75rem",
                }}
              />
            </Grid>

            {/* Rating */}
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Rating
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating
                  value={product.rating || 0}
                  readOnly
                  size="small"
                  precision={0.5}
                  sx={{ fontSize: "0.9rem" }}
                />
                <Typography variant="caption" color="text.secondary">
                  ({product.numReviews || 0})
                </Typography>
              </Box>
            </Grid>

            {/* Status */}
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box>
                <Chip
                  label={product.status || "draft"}
                  size="small"
                  color={statusColors[product.status] || "default"}
                  sx={{
                    height: 22,
                    fontSize: "0.75rem",
                    textTransform: "capitalize",
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Description */}
          {product.shortDescription && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {product.shortDescription}
            </Typography>
          )}

          {/* Created Date */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Created:{" "}
            {product.createdAt
              ? new Date(product.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : "-"}
          </Typography>
        </CardContent>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              minWidth: 160,
            },
          }}
        >
          <MItem
            onClick={() => {
              setMenuAnchor(null);
              onView(product);
            }}
          >
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            View
          </MItem>
          <MItem
            onClick={() => {
              setMenuAnchor(null);
              onEdit(product);
            }}
          >
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MItem>
          <MItem
            onClick={() => {
              setMenuAnchor(null);
              onImages(product);
            }}
          >
            <ImageIcon fontSize="small" sx={{ mr: 1 }} />
            Images
          </MItem>
          <MItem
            onClick={() => {
              setMenuAnchor(null);
              onStock(product);
            }}
          >
            <Inventory fontSize="small" sx={{ mr: 1 }} />
            Stock
          </MItem>
          <Divider />
          <MItem
            onClick={() => {
              setMenuAnchor(null);
              onDelete(product);
            }}
            sx={{ color: "error.main" }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MItem>
        </Menu>
      </Card>
    </motion.div>
  );
};

// --- Main Component ---
export default function Products() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // --- State Management ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  // Pagination & Sorting
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState([
    { field: "createdAt", sort: "desc" },
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [openForm, setOpenForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [imageModalProduct, setImageModalProduct] = useState(null);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Desktop Menu
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);


  // --- Helpers ---
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.fullImageUrl) return img.fullImageUrl;
    if (img.fullUrl) return img.fullUrl;
    if (img.url)
      return img.url.startsWith("http") ? img.url : `${API_BASE_URL}${img.url}`;
    return null;
  };

  // --- Data Fetching ---
  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await categoryService.getCategories({ limit: 1000 });
        const list = Array.isArray(res?.data) ? res.data : res || [];
        setCategories(list);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCats();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: debouncedSearch,
        category: filterCategory ? filterCategory._id || filterCategory.id : "",
        status: filterStatus,
        sortBy: sortModel[0]?.field || "createdAt",
        sortOrder: sortModel[0]?.sort || "desc",
      };

      const resp = await productService.getProducts(params);
      if (resp.success) {
        const rows = resp.data || [];
        const mapped = rows.map((r) => {
          const images = (r.images || []).map((img) => ({
            ...img,
            fullImageUrl: getImageUrl(img),
          }));
          return {
            ...r,
            images,
            totalStock: r.stock ?? r.totalStock ?? 0,
            stock: r.stock ?? r.totalStock ?? 0,
          };
        });
        setProducts(mapped);
        setTotalRows(resp.pagination?.total || 0);
      }
    } catch (e) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [
    paginationModel,
    debouncedSearch,
    filterCategory,
    filterStatus,
    sortModel,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Handlers ---
  const openMenu = (event, row) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuRow(row);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const handleCreateOrUpdate = async (formData, { isEdit, id }) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await productService.updateProduct(id, formData);
        toast.success("Product updated");
      } else {
        await productService.createProduct(formData);
        toast.success("Product created");
        if (paginationModel.page !== 0)
          setPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
      setOpenForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (row) => {
    setProductToDelete(row);
    setDeleteDialogOpen(true);
    closeMenu();
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await productService.deleteProduct(productToDelete._id);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleOpenEdit = async (row) => {
    closeMenu();
    try {
      const resp = await productService.getProduct(row._id);
      setEditProduct(resp.data);
      setOpenForm(true);
    } catch (err) {
      toast.error("Failed to load product");
    }
  };

  const handleView = async (row) => {
    closeMenu();
    try {
      const resp = await productService.getProduct(row._id);
      const p = resp.data;
      p.images = (p.images || []).map((img) => ({
        ...img,
        fullImageUrl: getImageUrl(img),
      }));
      setViewProduct(p);
    } catch (err) {
      toast.error("Failed to load product");
    }
  };

  // --- DataGrid Columns (Desktop Only) ---
  const columns = [
    {
      field: "images",
      headerName: "Image",
      width: 70,
      sortable: false,
      renderCell: (params) => {
        const images = params.value || [];
        const primary = images.find((i) => i.isPrimary) || images[0];
        const src = primary ? primary.fullImageUrl : null;
        return (
          <Avatar
            src={src}
            variant="rounded"
            sx={{ width: 50, height: 50, border: "2px solid #E0E0E0" }}
          >
            <ImageIcon />
          </Avatar>
        );
      },
    },
    {
      field: "name",
      headerName: "Product",
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => {
        const categoryLabel =
          params.row.category?.name || params.row.category || "Uncategorized";
        return (
          <Box sx={{ py: 1, overflow: "hidden" }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {params.value}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {categoryLabel}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "brand",
      headerName: "Brand",
      width: 120,
      renderCell: (p) => (
        <Typography variant="body2">{p.value || "-"}</Typography>
      ),
    },
    {
      field: "shortDescription",
      headerName: "Description",
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} arrow>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value || "—"}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "basePrice",
      headerName: "Price",
      width: 100,
      renderCell: (p) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          ₹{(p.value || 0).toLocaleString("en-IN")}
        </Typography>
      ),
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Rating
            value={params.value || 0}
            readOnly
            size="small"
            precision={0.5}
          />
          <Typography variant="caption" color="text.secondary">
            ({params.row.numReviews || 0})
          </Typography>
        </Box>
      ),
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 90,
      renderCell: (p) => (
        <Chip
          label={p.value || 0}
          size="small"
          color={p.value > 10 ? "success" : p.value > 0 ? "warning" : "error"}
          onClick={(e) => {
            e.stopPropagation();
            setVariantProduct(p.row);
            setOpenVariantModal(true);
          }}
          sx={{ cursor: "pointer", fontWeight: 600, height: 24 }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (p) => {
        const colorMap = {
          active: "success",
          draft: "warning",
          inactive: "default",
          archived: "error",
        };
        return (
          <Chip
            label={p.value || "draft"}
            size="small"
            color={colorMap[p.value] || "default"}
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.createdAt
            ? new Date(params.row.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            })
            : "-"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={(e) => openMenu(e, params.row)} size="small">
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  // --- Render ---
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* --- Mobile Search Bar --- */}
      {isMobile ? (
        <MobileSearchBar
          searchValue={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          statusValue={filterStatus}
          onStatusChange={(e) => setFilterStatus(e.target.value)}
          onAddClick={() => {
            setEditProduct(null);
            setOpenForm(true);
          }}
          addButtonText="Add Product"
          searchPlaceholder="Search products..."
          showRole={false}
          statusOptions={[
            { value: "active", label: "Active" },
            { value: "draft", label: "Draft" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      ) : (
        /* --- Desktop Header --- */
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Search */}
              <TextField
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm("")}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: 240 }}
                size="small"
              />

              {/* Category Filter */}
              <Autocomplete
                size="small"
                sx={{ minWidth: 220 }}
                options={categories}
                getOptionLabel={(option) => option.name || ""}
                value={filterCategory}
                onChange={(event, newValue) => setFilterCategory(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Category"
                    placeholder="Select category"
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
              />

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              {/* Add Button */}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditProduct(null);
                  setOpenForm(true);
                }}
                sx={{ whiteSpace: "nowrap", height: 40 }}
              >
                Add Product
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* --- Data Display --- */}
      <Box sx={{ mt: isMobile ? 0 : 0 }}>
        {/* Desktop Table */}
        {!isMobile ? (
          <Card sx={{ borderRadius: 3 }}>
            <Box sx={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={products}
                columns={columns}
                getRowId={(r) => r._id}
                rowCount={totalRows}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 20, 50, 100]}
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                loading={loading}
                disableRowSelectionOnClick
                rowHeight={70}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "rgba(76, 175, 80, 0.05)",
                  },
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              />
            </Box>
          </Card>
        ) : (
          /* Mobile Card View */
          <Box>
            {loading ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", py: 4 }}
              >
                <CircularProgress />
              </Box>
            ) : products.length === 0 ? (
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  background: "rgba(76, 175, 80, 0.05)",
                  borderRadius: 3,
                }}
              >
                <Typography color="text.secondary">
                  No products found
                </Typography>
              </Paper>
            ) : (
              <>
                <AnimatePresence>
                  {products.map((product) => (
                    <MobileProductCard
                      key={product._id}
                      product={product}
                      onView={handleView}
                      onEdit={handleOpenEdit}
                      onDelete={confirmDelete}
                      onImages={(p) => {
                        setImageModalProduct(p);
                        setOpenImageModal(true);
                      }}
                      onStock={(p) => {
                        setVariantProduct(p);
                        setOpenVariantModal(true);
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Mobile Pagination */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Showing {products.length} of {totalRows}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={paginationModel.page === 0}
                      onClick={() =>
                        setPaginationModel((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        (paginationModel.page + 1) *
                        paginationModel.pageSize >=
                        totalRows
                      }
                      onClick={() =>
                        setPaginationModel((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                    >
                      Next
                    </Button>
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* --- Desktop Action Menu --- */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <MItem onClick={() => handleView(menuRow)}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View
        </MItem>
        <MItem onClick={() => handleOpenEdit(menuRow)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MItem>
        <MItem
          onClick={() => {
            setImageModalProduct(menuRow);
            setOpenImageModal(true);
            closeMenu();
          }}
        >
          <ImageIcon fontSize="small" sx={{ mr: 1 }} />
          Images
        </MItem>
        <MItem
          onClick={() => {
            setVariantProduct(menuRow);
            setOpenVariantModal(true);
            closeMenu();
          }}
        >
          <Inventory fontSize="small" sx={{ mr: 1 }} />
          Stock
        </MItem>
        <Divider />
        <MItem
          onClick={() => confirmDelete(menuRow)}
          sx={{ color: "error.main" }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MItem>
      </Menu>

      {/* --- Modals --- */}
      <FormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editProduct ? "Edit Product" : "Add New Product"}
        maxWidth="lg"
      >
        <ProductForm
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setOpenForm(false)}
          categories={categories}
          submitting={submitting}
          embedded={true}
          initialData={editProduct}
        />
      </FormModal>

      {viewProduct && (
        <ProductViewModal
          open={Boolean(viewProduct)}
          onClose={() => setViewProduct(null)}
          product={viewProduct}
        />
      )}

      {
        openImageModal && (
          <ImageUploadModal
            open={openImageModal}
            onClose={() => setOpenImageModal(false)}
            product={imageModalProduct}
            onUploadSuccess={fetchProducts}
          />
        )
      }

      {
        variantProduct && (
          <VariantStockModal
            open={openVariantModal}
            onClose={() => setOpenVariantModal(false)}
            product={variantProduct}
            onSaved={fetchProducts}
          />
        )
      }

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={productToDelete?.name}
      />
    </Box>
  );
}

// frontend/src/pages/InventoryMaster.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Chip,
  Stack,
  Divider,
  Autocomplete,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
  Avatar,
  Collapse,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search,
  Add,
  Remove,
  TrendingUp,
  TrendingDown,
  Inventory2,
  Clear,
  History,
  FilterList,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import FormModal from "../components/Modals/FormModal";
import InventoryForm from "../components/Forms/InventoryForm";
import toast from "react-hot-toast";
import { useDebounce } from "../hooks/useDebounce";
import { productService } from "../services/productService";
import { inventoryService } from "../services/inventoryService";

// Helper for date formatting
const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// Helper for mobile date
const fmtMobileDate = (d) => {
  if (!d) return "—";
  try {
    const date = new Date(d);
    return {
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { date: "—", time: "—" };
  }
};

// --- Mobile Variant Card Component ---
const MobileVariantCard = ({ variant, onAddStock, onReduceStock }) => {
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
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  mb: 0.5,
                }}
              >
                SKU: {variant.sku || "—"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={variant.size?.sizeName || "—"}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.75rem",
                    background: "rgba(76, 175, 80, 0.1)",
                    color: "#2E7D32",
                  }}
                />
                <Stack direction="row" alignItems="center" gap={0.5}>
                  {variant.color?.value && (
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: variant.color.value,
                        border: "1px solid #ddd",
                      }}
                    />
                  )}
                  <Chip
                    label={variant.color?.colorName || "—"}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.75rem",
                      background: "rgba(33, 150, 243, 0.1)",
                      color: "#1976D2",
                    }}
                  />
                </Stack>
              </Box>
            </Box>

            {/* Stock Badge */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                Stock
              </Typography>
              <Chip
                label={variant.currentStock || 0}
                color={
                  variant.currentStock > 10
                    ? "success"
                    : variant.currentStock > 0
                    ? "warning"
                    : "error"
                }
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  height: 32,
                  minWidth: 60,
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => onAddStock(variant)}
              sx={{
                flex: 1,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Add Stock
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Remove />}
              onClick={() => onReduceStock(variant)}
              sx={{
                flex: 1,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Reduce
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- Mobile Ledger Card Component ---
const MobileLedgerCard = ({ ledger }) => {
  const { date, time } = fmtMobileDate(ledger.createdAt);
  const prodName = ledger.product?.name || "Unknown Product";
  const variantStr = ledger.variant
    ? `${ledger.variant.size?.sizeName || ""} • ${
        ledger.variant.color?.colorName || ""
      }`
    : "Base Product";

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
          border:
            ledger.type === "IN"
              ? "1px solid rgba(76, 175, 80, 0.3)"
              : "1px solid rgba(244, 67, 54, 0.3)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Header Row */}
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
          >
            <Box>
              <Chip
                label={ledger.type}
                size="small"
                color={ledger.type === "IN" ? "success" : "error"}
                icon={ledger.type === "IN" ? <TrendingUp /> : <TrendingDown />}
                sx={{
                  borderRadius: 1,
                  fontWeight: 600,
                  minWidth: 70,
                }}
              />
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {date}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", fontSize: "0.7rem" }}
              >
                {time}
              </Typography>
            </Box>
          </Box>

          {/* Product Info */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            {prodName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1.5 }}
          >
            {variantStr}
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          {/* Stats Grid */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                Quantity
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                color={ledger.type === "IN" ? "success.main" : "error.main"}
              >
                {ledger.type === "IN" ? "+" : "-"}
                {ledger.quantity}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                Balance
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {ledger.balanceStock}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                Status
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary">
                Updated
              </Typography>
            </Grid>
          </Grid>

          {/* Remarks */}
          {ledger.remarks && (
            <Box
              sx={{
                mt: 1.5,
                p: 1,
                bgcolor: "rgba(0, 0, 0, 0.02)",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                <strong>Remarks:</strong> {ledger.remarks}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- Main Component ---
const InventoryMaster = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // --- State ---
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [showFilters, setShowFilters] = useState(false);

  // Data
  const [variants, setVariants] = useState([]);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [ledgerCount, setLedgerCount] = useState(0);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Summary
  const [summary, setSummary] = useState({
    totalPurchase: 0,
    totalSale: 0,
    currentStock: 0,
  });

  // Pagination
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Modal State
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formInitialData, setFormInitialData] = useState(null);

  // Mobile Sections
  const [expandSummary, setExpandSummary] = useState(true);
  const [expandVariants, setExpandVariants] = useState(true);

  // --- 1. Load Products ---
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getProducts({
          limit: 1000,
          status: "active",
        });
        const list = Array.isArray(res?.data) ? res.data : res || [];
        setProducts(list);
      } catch (e) {
        console.error("Product load error", e);
      }
    };
    loadProducts();
  }, []);

  // --- 2. Fetch Product Details ---
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!selectedProduct) {
        setVariants([]);
        setSummary({ totalPurchase: 0, totalSale: 0, currentStock: 0 });
        return;
      }

      setLoadingVariants(true);
      try {
        const [summaryRes, variantsRes] = await Promise.all([
          inventoryService.getStockSummary(selectedProduct._id),
          inventoryService.getProductVariants(selectedProduct._id),
        ]);

        setSummary({
          totalPurchase: summaryRes?.totalPurchase || 0,
          totalSale: summaryRes?.totalSale || 0,
          currentStock: summaryRes?.currentStock || 0,
        });
        setVariants(Array.isArray(variantsRes) ? variantsRes : []);
      } catch (e) {
        console.error("Details fetch error", e);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchProductDetails();
  }, [selectedProduct]);

  // --- 3. Fetch Ledger ---
  const fetchLedger = useCallback(async () => {
    setLoadingLedger(true);
    try {
      const res = await inventoryService.getInventoryLedger({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        product: selectedProduct?._id,
        search: debouncedSearch,
      });

      const rows = res?.ledgers || res?.data?.ledgers || [];
      const total = res?.pagination?.total || res?.data?.pagination?.total || 0;

      setLedgerRows(Array.isArray(rows) ? rows : []);
      setLedgerCount(total);
    } catch (e) {
      console.error("Ledger fetch error", e);
    } finally {
      setLoadingLedger(false);
    }
  }, [paginationModel, selectedProduct, debouncedSearch]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // --- Handlers ---
  const handleOpenForm = (mode, product = null, variant = null) => {
    setFormMode(mode);
    setFormInitialData({
      product: product || selectedProduct,
      variant: variant,
    });
    setOpenForm(true);
  };

  const handleSuccess = () => {
    setOpenForm(false);
    toast.success(
      formMode === "add"
        ? "Stock Added Successfully"
        : "Stock Reduced Successfully"
    );
    fetchLedger();
    if (selectedProduct) {
      inventoryService
        .getProductVariants(selectedProduct._id)
        .then((res) => setVariants(res || []));
      inventoryService
        .getStockSummary(selectedProduct._id)
        .then((res) => setSummary(res || {}));
    }
  };

  // --- Desktop Columns ---
  const variantColumns = useMemo(
    () => [
      {
        field: "sku",
        headerName: "SKU",
        width: 150,
        renderCell: (p) => (
          <Typography variant="body2" fontFamily="monospace">
            {p.value || "—"}
          </Typography>
        ),
      },
      {
        field: "size",
        headerName: "Size",
        width: 120,
        renderCell: (p) => p.row.size?.sizeName || "—",
      },
      {
        field: "color",
        headerName: "Color",
        width: 120,
        renderCell: (p) => (
          <Stack direction="row" alignItems="center" gap={1}>
            {p.row.color?.value && (
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: p.row.color.value,
                  border: "1px solid #ddd",
                }}
              />
            )}
            {p.row.color?.colorName || "—"}
          </Stack>
        ),
      },
      {
        field: "currentStock",
        headerName: "Current Stock",
        width: 140,
        renderCell: (p) => (
          <Chip
            label={p.value || 0}
            color={p.value > 10 ? "success" : p.value > 0 ? "warning" : "error"}
            size="small"
            sx={{ fontWeight: 700, minWidth: 60 }}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Quick Actions",
        width: 180,
        sortable: false,
        renderCell: (p) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Add Stock">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleOpenForm("add", selectedProduct, p.row)}
                sx={{
                  bgcolor: "primary.50",
                  "&:hover": { bgcolor: "primary.100" },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reduce Stock">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenForm("reduce", selectedProduct, p.row)}
                sx={{
                  bgcolor: "error.50",
                  "&:hover": { bgcolor: "error.100" },
                }}
              >
                <Remove fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [selectedProduct]
  );

  const ledgerColumns = [
    {
      field: "createdAt",
      headerName: "Date & Time",
      width: 160,
      renderCell: (p) => (
        <Stack>
          <Typography variant="caption" fontWeight={600} color="text.primary">
            {fmtDate(p.value).split(",")[0]}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {fmtDate(p.value).split(",")[1]}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      width: 100,
      renderCell: (p) => (
        <Chip
          label={p.value}
          size="small"
          color={p.value === "IN" ? "success" : "error"}
          icon={p.value === "IN" ? <TrendingUp /> : <TrendingDown />}
          sx={{ borderRadius: 1, fontWeight: 600, minWidth: 70 }}
        />
      ),
    },
    {
      field: "product",
      headerName: "Product Details",
      flex: 1,
      minWidth: 250,
      renderCell: (p) => {
        const prodName = p.row.product?.name || "Unknown Product";
        const variantStr = p.row.variant
          ? `${p.row.variant.size?.sizeName || ""} • ${
              p.row.variant.color?.colorName || ""
            }`
          : "Base Product";
        return (
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {prodName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {variantStr}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "quantity",
      headerName: "Qty",
      width: 90,
      renderCell: (p) => (
        <Typography
          variant="body2"
          fontWeight={700}
          color={p.row.type === "IN" ? "success.main" : "error.main"}
        >
          {p.row.type === "IN" ? "+" : "-"}
          {p.value}
        </Typography>
      ),
    },
    {
      field: "balanceStock",
      headerName: "Balance",
      width: 100,
      renderCell: (p) => (
        <Typography variant="body2" color="text.secondary">
          {p.value}
        </Typography>
      ),
    },
    {
      field: "remarks",
      headerName: "Remarks",
      flex: 1,
      minWidth: 200,
      renderCell: (p) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {p.value || "-"}
        </Typography>
      ),
    },
  ];

  // --- Render ---
  return (
    <Box sx={{ p: { xs: 0, sm: 2 } }}>
      {/* --- DESKTOP VIEW --- */}
      {!isMobile ? (
        <>
          {/* Header Controls */}
          <Card sx={{ mb: 3, overflow: "visible" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Autocomplete
                  size="small"
                  sx={{ minWidth: 280, flex: { xs: 1, md: 0 } }}
                  options={products}
                  getOptionLabel={(option) => option.name || ""}
                  value={selectedProduct}
                  onChange={(event, newValue) => setSelectedProduct(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Product to Manage Stock"
                      placeholder="Search product..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Inventory2 color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                />

                <TextField
                  placeholder="Search ledger history..."
                  size="small"
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
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1, minWidth: 200 }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => handleOpenForm("add")}
                  sx={{ whiteSpace: "nowrap", height: 40 }}
                >
                  Add Stock
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Remove />}
                  onClick={() => handleOpenForm("reduce")}
                  sx={{ whiteSpace: "nowrap", height: 40 }}
                >
                  Reduce Stock
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Product Summary & Variants */}
          {selectedProduct && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#e8f5e9",
                      border: "1px solid #c8e6c9",
                    }}
                  >
                    <Typography variant="subtitle2" color="success.dark">
                      Total Stock In
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="success.main"
                    >
                      +{summary.totalPurchase}
                    </Typography>
                  </Paper>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#ffebee",
                      border: "1px solid #ffcdd2",
                    }}
                  >
                    <Typography variant="subtitle2" color="error.dark">
                      Total Stock Out
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="error.main"
                    >
                      -{summary.totalSale}
                    </Typography>
                  </Paper>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#e3f2fd",
                      border: "1px solid #bbdefb",
                    }}
                  >
                    <Typography variant="subtitle2" color="primary.dark">
                      Current Available
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {summary.currentStock}
                    </Typography>
                  </Paper>
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card sx={{ height: "100%" }}>
                  <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
                    <Typography variant="h6" fontWeight={600}>
                      Variants & Stock Levels
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click <Add fontSize="inherit" /> or{" "}
                      <Remove fontSize="inherit" /> to adjust stock instantly.
                    </Typography>
                  </Box>
                  <DataGrid
                    rows={variants}
                    columns={variantColumns}
                    getRowId={(row) => row._id}
                    loading={loadingVariants}
                    hideFooter
                    autoHeight
                    disableRowSelectionOnClick
                    sx={{ border: "none" }}
                  />
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Ledger Table */}
          <Card>
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <History color="action" />
              <Typography variant="h6" fontWeight={600}>
                Inventory History
              </Typography>
            </Box>
            <DataGrid
              rows={ledgerRows}
              columns={ledgerColumns}
              getRowId={(row) => row._id}
              loading={loadingLedger}
              rowCount={ledgerCount}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 50]}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": { bgcolor: "#fafafa" },
              }}
            />
          </Card>
        </>
      ) : (
        /* --- MOBILE VIEW --- */
        <>
          {/* Mobile Header Controls */}
          <Card
            sx={{
              mb: 2,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={2}>
                {/* Search */}
                <TextField
                  placeholder="Search ledger..."
                  size="small"
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
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Product Filter */}
                <Autocomplete
                  size="small"
                  options={products}
                  getOptionLabel={(option) => option.name || ""}
                  value={selectedProduct}
                  onChange={(event, newValue) => setSelectedProduct(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Product"
                      placeholder="Choose product..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Inventory2 color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                />

                {/* Action Buttons */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenForm("add")}
                    fullWidth
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Add Stock
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Remove />}
                    onClick={() => handleOpenForm("reduce")}
                    fullWidth
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Reduce
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Mobile Product Summary */}
          {selectedProduct && (
            <Card
              sx={{
                mb: 2,
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setExpandSummary(!expandSummary)}
              >
                <Typography variant="h6" fontWeight={600}>
                  Stock Summary
                </Typography>
                <IconButton size="small">
                  {expandSummary ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <Collapse in={expandSummary}>
                <CardContent sx={{ pt: 0 }}>
                  <Stack spacing={1.5}>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: "#e8f5e9",
                        border: "1px solid #c8e6c9",
                        borderRadius: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="caption" color="success.dark">
                            Total Stock In
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="success.main"
                          >
                            +{summary.totalPurchase}
                          </Typography>
                        </Box>
                        <TrendingUp
                          sx={{
                            fontSize: 40,
                            color: "success.main",
                            opacity: 0.3,
                          }}
                        />
                      </Stack>
                    </Paper>

                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: "#ffebee",
                        border: "1px solid #ffcdd2",
                        borderRadius: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="caption" color="error.dark">
                            Total Stock Out
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="error.main"
                          >
                            -{summary.totalSale}
                          </Typography>
                        </Box>
                        <TrendingDown
                          sx={{
                            fontSize: 40,
                            color: "error.main",
                            opacity: 0.3,
                          }}
                        />
                      </Stack>
                    </Paper>

                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: "#e3f2fd",
                        border: "1px solid #bbdefb",
                        borderRadius: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="caption" color="primary.dark">
                            Current Available
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="primary.main"
                          >
                            {summary.currentStock}
                          </Typography>
                        </Box>
                        <Inventory2
                          sx={{
                            fontSize: 40,
                            color: "primary.main",
                            opacity: 0.3,
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Stack>
                </CardContent>
              </Collapse>
            </Card>
          )}

          {/* Mobile Variants Section */}
          {selectedProduct && variants.length > 0 && (
            <Card
              sx={{
                mb: 2,
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setExpandVariants(!expandVariants)}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Product Variants
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {variants.length} variant{variants.length !== 1 ? "s" : ""}{" "}
                    available
                  </Typography>
                </Box>
                <IconButton size="small">
                  {expandVariants ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <Collapse in={expandVariants}>
                <CardContent sx={{ pt: 0 }}>
                  {loadingVariants ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 3 }}
                    >
                      <CircularProgress size={30} />
                    </Box>
                  ) : (
                    <AnimatePresence>
                      {variants.map((variant) => (
                        <MobileVariantCard
                          key={variant._id}
                          variant={variant}
                          onAddStock={(v) =>
                            handleOpenForm("add", selectedProduct, v)
                          }
                          onReduceStock={(v) =>
                            handleOpenForm("reduce", selectedProduct, v)
                          }
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </CardContent>
              </Collapse>
            </Card>
          )}

          {/* Mobile Ledger History */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <History color="action" />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Inventory History
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ledgerCount} total entries
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <CardContent sx={{ p: 2 }}>
              {loadingLedger ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : ledgerRows.length === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    background: "rgba(76, 175, 80, 0.05)",
                    borderRadius: 3,
                  }}
                >
                  <History
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                  />
                  <Typography color="text.secondary">
                    No inventory history found
                  </Typography>
                </Paper>
              ) : (
                <>
                  <AnimatePresence>
                    {ledgerRows.map((ledger) => (
                      <MobileLedgerCard key={ledger._id} ledger={ledger} />
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
                      Page {paginationModel.page + 1} of{" "}
                      {Math.ceil(ledgerCount / paginationModel.pageSize)}
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
                          ledgerCount
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
            </CardContent>
          </Card>
        </>
      )}

      {/* --- Modal Form --- */}
      <FormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={formMode === "add" ? "Add New Stock" : "Reduce Stock"}
        maxWidth="sm"
      >
        <InventoryForm
          mode={formMode}
          initialData={formInitialData}
          onClose={() => setOpenForm(false)}
          onSuccess={handleSuccess}
        />
      </FormModal>
    </Box>
  );
};

export default InventoryMaster;

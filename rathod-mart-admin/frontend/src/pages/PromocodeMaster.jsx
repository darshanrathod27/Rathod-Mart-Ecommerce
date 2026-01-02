// frontend/src/pages/PromocodeMaster.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
// DataGrid removed - using DynamicResponsiveTable instead
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  LocalOffer,
  Lock,
  SupportAgent,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import FormModal from "../components/Modals/FormModal";
import PromocodeForm from "../components/Forms/PromocodeForm";
import DynamicResponsiveTable from "../components/Shared/DynamicResponsiveTable";
import MobileSearchBar from "../components/Common/MobileSearchBar";
import toast from "react-hot-toast";
import { useDebounce } from "../hooks/useDebounce";
import { promocodeService } from "../services/promocodeService";

// --- Access Denied Component ---
const AccessDenied = ({ userRole, pageName = "Promocodes" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  return (
    <Box
      sx={{
        minHeight: { xs: "70vh", sm: "60vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 480 }}
      >
        <Paper
          elevation={isMobile ? 0 : 2}
          sx={{
            textAlign: "center",
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: { xs: 3, sm: 4 },
            bgcolor: "background.paper",
            border: isMobile ? `1px solid ${theme.palette.divider}` : "none",
          }}
        >
          <Box
            sx={{
              width: { xs: 60, sm: 80 },
              height: { xs: 60, sm: 80 },
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: { xs: 2, sm: 3 },
              boxShadow: "0 4px 20px rgba(255, 152, 0, 0.3)",
            }}
          >
            <Lock sx={{ fontSize: { xs: 28, sm: 40 }, color: "#fff" }} />
          </Box>
          
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight={700} 
            gutterBottom
            sx={{ color: "text.primary" }}
          >
            Access Restricted
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              mb: { xs: 2, sm: 3 }, 
              lineHeight: 1.7,
              px: { xs: 0, sm: 2 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            You don't have permission to manage {pageName}. 
            This section is only available to <strong>Administrators</strong> and <strong>Managers</strong>.
          </Typography>
          
          <Alert
            severity="info"
            icon={<SupportAgent sx={{ fontSize: { xs: 20, sm: 24 } }} />}
            sx={{ 
              textAlign: "left", 
              borderRadius: 2, 
              mb: 2,
              "& .MuiAlert-message": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
          >
            Need access? Contact your administrator to upgrade your permissions.
          </Alert>
          
          <Chip
            label={`Your Role: ${userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || "Unknown"}`}
            color="primary"
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ mt: 1, fontWeight: 600 }}
          />
        </Paper>
      </motion.div>
    </Box>
  );
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

const fmtCurrency = (n) => (n ? `₹${Number(n).toLocaleString("en-IN")}` : "—");
const fmtPercentage = (n) => (n ? `${n}%` : "—");

const PromocodeMaster = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get current user's role from Redux
  const { userInfo } = useSelector((state) => state.auth);
  const userRole = userInfo?.role;
  
  // Check if user has permission to view this page
  const hasAccess = ["admin", "manager"].includes(userRole);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessError, setAccessError] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    // Don't fetch if no access
    if (!hasAccess) {
      setAccessError(true);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const res = await promocodeService.getPromocodes({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: debouncedSearch,
        status: filterStatus,
      });
      setRows(Array.isArray(res?.data) ? res.data : []);
      setRowCount(res?.pagination?.total || 0);
      setAccessError(false);
    } catch (err) {
      // Check if it's an authorization error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAccessError(true);
      } else {
        setError(err.message || "Failed to load data. Please try again.");
        toast.error(err.message || "Failed to fetch promocodes");
      }
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, filterStatus, hasAccess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Show access denied if user doesn't have permission
  if (!hasAccess || accessError) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default }}>
        <AccessDenied userRole={userRole} pageName="Promocodes" />
      </Box>
    );
  }

  const handleAdd = () => {
    setEditItem(null);
    setOpenModal(true);
  };
  const handleEdit = (row) => {
    setEditItem(row);
    setOpenModal(true);
    handleMenuClose();
  };
  const handleMenuClick = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };
  const handleFilter = () => {
    setPaginationModel((p) => ({ ...p, page: 0 }));
    fetchData();
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await promocodeService.updatePromocode(editItem._id, formData);
        toast.success("Promocode updated");
      } else {
        await promocodeService.createPromocode(formData);
        toast.success("Promocode created");
      }
      setOpenModal(false);
      setEditItem(null);
      fetchData();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Operation failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this promocode?"))
      return;
    try {
      await promocodeService.deletePromocode(id);
      toast.success("Promocode deleted");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    }
    handleMenuClose();
  };

  const columns = [
    {
      field: "code",
      headerName: "Code",
      width: 160,
      renderCell: (p) => (
        <Chip
          icon={<LocalOffer />}
          label={p.value}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, fontFamily: "monospace" }}
        />
      ),
    },
    {
      field: "discountType",
      headerName: "Discount",
      width: 150,
      renderCell: (p) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {p.row.discountType === "Percentage"
              ? fmtPercentage(p.row.discountValue)
              : fmtCurrency(p.row.discountValue)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {p.row.discountType}
          </Typography>
        </Box>
      ),
    },
    {
      field: "minPurchase",
      headerName: "Min Purchase",
      width: 130,
      renderCell: (p) => fmtCurrency(p.value),
    },
    {
      field: "maxDiscount",
      headerName: "Max Discount",
      width: 130,
      renderCell: (p) => fmtCurrency(p.value),
    },
    {
      // FIX: Changed field to 'useCount' to match backend model
      field: "useCount",
      headerName: "Uses (Used/Max)",
      width: 140,
      renderCell: (p) => (
        <Typography variant="body2">
          {p.value || 0}
          {p.row.maxUses ? ` / ${p.row.maxUses}` : ""}
        </Typography>
      ),
    },
    {
      field: "expiresAt",
      headerName: "Expires",
      width: 140,
      renderCell: (p) => fmtDate(p.value),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (p) => (
        <Chip
          label={p.value}
          color={p.value === "Active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (p) => (
        <IconButton onClick={(e) => handleMenuClick(e, p.row)} size="small">
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* --- Mobile Search Bar --- */}
      {isMobile ? (
        <MobileSearchBar
          searchValue={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          statusValue={filterStatus}
          onStatusChange={(e) => setFilterStatus(e.target.value)}
          onAddClick={handleAdd}
          addButtonText="Add Promocode"
          searchPlaceholder="Search by code..."
          showRole={false}
          statusOptions={[
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
        />
      ) : (
        /* --- Desktop Header --- */
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                placeholder="Search by code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: 250 }}
                size="small"
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={handleFilter}
              >
                Filter
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
                Add Promocode
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* --- Responsive Data Table --- */}
      <DynamicResponsiveTable
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        onEdit={handleEdit}
        onDelete={(row) => handleDelete(row?._id)}
        titleField="code"
        subtitleField="discountType"
        statusField="status"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedRow)}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDelete(selectedRow?._id)}
          sx={{ color: "error.main" }}
        >
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {openModal && (
        <FormModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditItem(null);
          }}
          title={editItem ? "Edit Promocode" : "Add New Promocode"}
          maxWidth="md"
        >
          <PromocodeForm
            initialData={editItem}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setOpenModal(false);
              setEditItem(null);
            }}
            submitting={submitting}
          />
        </FormModal>
      )}
    </Box>
  );
};

export default PromocodeMaster;

// frontend/src/pages/Categories.jsx
import React, { useState, useEffect, useCallback } from "react";
import { categoryService } from "../services/categoryService";
import MobileSearchBar from "../components/Common/MobileSearchBar";
import DynamicResponsiveTable from "../components/Shared/DynamicResponsiveTable";
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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Clear,
  Warning,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import FormModal from "../components/Modals/FormModal";
import CategoryForm from "../components/Forms/CategoryForm";
import toast from "react-hot-toast";
import { useDebounce } from "../hooks/useDebounce";

const DeleteConfirmDialog = ({ open, onClose, onConfirm, itemName }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
      },
    }}
  >
    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Warning color="error" /> Confirm Deletion
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete category <strong>{itemName}</strong>?
        This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ p: 2, gap: 1 }}>
      <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" color="error" sx={{ borderRadius: 2 }}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const Categories = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Table Data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);

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
  const [filterStatus, setFilterStatus] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // UI State
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: debouncedSearch,
        status: filterStatus,
        sortBy: sortModel[0]?.field || "createdAt",
        sortOrder: sortModel[0]?.sort || "desc",
      };
      const res = await categoryService.getCategories(params);
      setRows(Array.isArray(res?.data) ? res.data : []);
      setRowCount(res?.pagination?.total || 0);
    } catch (e) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, filterStatus, sortModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
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

  const confirmDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await categoryService.deleteCategory(itemToDelete._id);
      toast.success("Category deleted successfully");
      fetchData();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editItem) {
        await categoryService.updateCategory(editItem._id, formData);
        toast.success("Category updated");
      } else {
        await categoryService.createCategory(formData);
        toast.success("Category created");
      }
      setOpenModal(false);
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Operation failed");
    }
  };

  // Column definitions (used by both desktop DataGrid and mobile cards)
  const columns = [
    {
      field: "icon",
      headerName: "Icon",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          sx={{
            bgcolor: params.row.color || "#4CAF50",
            width: 36,
            height: 36,
            fontSize: "1.1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {params.row.icon || "✨"}
        </Avatar>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (p) => (
        <Typography variant="body2" fontWeight={600}>
          {p.value}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 250,
      renderCell: (p) => (
        <Typography variant="caption" color="text.secondary" noWrap>
          {p.value || "—"}
        </Typography>
      ),
    },
    {
      field: "productsCount",
      headerName: "Products",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (p) => (
        <Chip
          label={p.value || 0}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderColor: "primary.light",
            color: "primary.main",
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (p) => (
        <Chip
          label={p.value}
          color={
            String(p.value).toLowerCase() === "active" ? "success" : "default"
          }
          size="small"
          sx={{
            textTransform: "capitalize",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
      renderCell: (p) => (
        <Typography variant="caption">
          {p.value
            ? new Date(p.value).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
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
        <IconButton
          onClick={(e) => handleMenuClick(e, params.row)}
          size="small"
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ p: { xs: 0, md: 3 } }}>
        {/* Mobile Search Bar */}
        {isMobile && (
          <MobileSearchBar
            searchValue={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            roleValue={""}
            onRoleChange={() => { }}
            statusValue={filterStatus}
            onStatusChange={(e) => setFilterStatus(e.target.value)}
            onAddClick={handleAdd}
            addButtonText="Add"
            searchPlaceholder="Search categories..."
            rolePlaceholder="Category"
            statusPlaceholder="Status"
            showRole={false}
            statusOptions={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        )}

        {/* Desktop Search/Filter Bar */}
        {!isMobile && (
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
                  placeholder="Search categories..."
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
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                {/* Add Button */}
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAdd}
                  sx={{ whiteSpace: "nowrap", height: 40 }}
                >
                  Add Category
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Responsive Table - Shows tiles on mobile, DataGrid on desktop */}
        <DynamicResponsiveTable
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          onEdit={handleEdit}
          onDelete={confirmDelete}
          // Mobile card configuration
          imageField="icon"
          titleField="name"
          subtitleField="description"
          statusField="status"
          searchTerm={debouncedSearch}
          showToolbar={false}
        />

        {/* Action Menu (Desktop) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            },
          }}
        >
          <MenuItem onClick={() => handleEdit(selectedRow)}>
            <Edit sx={{ mr: 1, fontSize: 20, color: "primary.main" }} /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => confirmDelete(selectedRow)}
            sx={{ color: "error.main" }}
          >
            <Delete sx={{ mr: 1, fontSize: 20 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Form Modal */}
        <FormModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={editItem ? "Edit Category" : "Add New Category"}
        >
          <CategoryForm
            initialData={editItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenModal(false)}
          />
        </FormModal>

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          itemName={itemToDelete?.name}
        />
      </Box>
    </motion.div>
  );
};

export default Categories;

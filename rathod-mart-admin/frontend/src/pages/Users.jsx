// src/pages/Users.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getUsers, deleteUser } from "../services/userService";
import UserForm from "../components/Forms/UserForm.jsx";
import UserViewModal from "../components/Modals/UserViewModal.jsx";
import DynamicResponsiveTable from "../components/Shared/DynamicResponsiveTable.jsx";
import MobileSearchBar from "../components/Common/MobileSearchBar.jsx"; // ✅ Import MobileSearchBar

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
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
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import {
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Clear,
  Warning,
  PersonAdd,
} from "@mui/icons-material";

import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useDebounce } from "../hooks/useDebounce";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// --- Delete Confirmation Dialog ---
const DeleteConfirmDialog = ({ open, onClose, onConfirm, itemName }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 3,
        minWidth: { xs: "90%", sm: 400 },
      },
    }}
  >
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        pb: 1,
      }}
    >
      <Warning color="error" />
      <Typography variant="h6" fontWeight={700}>
        Confirm Deletion
      </Typography>
    </DialogTitle>
    <Divider />
    <DialogContent sx={{ pt: 2 }}>
      <DialogContentText>
        Are you sure you want to delete user <strong>{itemName}</strong>? This
        action cannot be undone and will permanently remove all associated data.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ p: 2, gap: 1 }}>
      <Button
        onClick={onClose}
        variant="outlined"
        color="inherit"
        sx={{ borderRadius: 2 }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        sx={{ borderRadius: 2 }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const Users = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState([
    { field: "createdAt", sort: "desc" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [openForm, setOpenForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const getAvatarUrl = (relative) => {
    if (!relative) return null;
    return relative.startsWith("http")
      ? relative
      : `${API_BASE_URL}${relative}`;
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: debouncedSearch,
        role: filterRole,
        status: filterStatus,
        sortBy: sortModel[0]?.field || "createdAt",
        sortOrder: sortModel[0]?.sort || "desc",
      };

      const res = await getUsers(params);
      const list = (res?.data || []).map((u) => ({
        ...u,
        _avatarUrl: getAvatarUrl(u.profileImage),
      }));

      setUsers(list);
      setRowCount(res?.pagination?.total || 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch, filterRole, filterStatus, sortModel]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = () => {
    setEditUser(null);
    setOpenForm(true);
  };

  const handleMenuClick = (e, user) => {
    setAnchorEl(e.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete._id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleView = (user) => {
    setViewUser(user);
    handleMenuClose();
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpenForm(true);
    handleMenuClose();
  };

  const handleRefresh = () => {
    fetchUsers();
    toast.success("Data refreshed");
  };

  // Columns for DataGrid + mobile cards
  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row._avatarUrl}
          alt={params.row.name}
          sx={{ width: 36, height: 36 }}
        >
          {!params.row._avatarUrl ? params.row.name?.charAt(0) : null}
        </Avatar>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      renderCell: (p) => (
        <Typography variant="body2" fontWeight={600}>
          {p.value}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      renderCell: (p) => (
        <Typography variant="body2" color="text.secondary">
          {p.value}
        </Typography>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 130,
      renderCell: (p) => (
        <Typography variant="body2">{p.value || "—"}</Typography>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (p) => (
        <Chip
          label={p.value}
          color={p.value === "admin" ? "primary" : "default"}
          size="small"
          sx={{ textTransform: "capitalize", fontWeight: 600 }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (p) => {
        const colorMap = {
          active: "success",
          inactive: "warning",
          blocked: "error",
        };
        return (
          <Chip
            label={p.value}
            color={colorMap[p.value?.toLowerCase()] || "default"}
            size="small"
            sx={{ textTransform: "capitalize", fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {params.row.createdAt
            ? new Date(params.row.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            })
            : "—"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuClick(e, params.row)}
          size="small"
          sx={{
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* ✅ FIX: Removed manual <MobileHeader /> here.
        It is already in Layout.jsx. This prevents the "Green Screen" overlay.
      */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box
          className="mobile-content-wrapper"
          sx={{
            maxWidth: "1600px",
            mx: "auto",
            p: { xs: 2, sm: 3 },
          }}
        >
          {/* Mobile Search Bar (Only for mobile) */}
          {isMobile ? (
            <MobileSearchBar
              searchValue={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              roleValue={filterRole}
              onRoleChange={(e) => setFilterRole(e.target.value)}
              statusValue={filterStatus}
              onStatusChange={(e) => setFilterStatus(e.target.value)}
              onAddClick={handleAdd}
              addButtonText="Add User"
              searchPlaceholder="Search users..."
              roleOptions={[
                { value: "admin", label: "Admin" },
                { value: "manager", label: "Manager" },
                { value: "staff", label: "Staff" },
                { value: "customer", label: "Customer" },
              ]}
              statusOptions={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "blocked", label: "Blocked" },
              ]}
            />
          ) : (
            /* Desktop Header/Filters */
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
                    placeholder="Search users..."
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

                  {/* Role Filter */}
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      label="Role"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="customer">Customer</MenuItem>
                    </Select>
                  </FormControl>

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
                      <MenuItem value="blocked">Blocked</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Add Button */}
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={handleAdd}
                    sx={{ whiteSpace: "nowrap", height: 40 }}
                  >
                    Add User
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Responsive Table */}
          <DynamicResponsiveTable
            rows={users}
            columns={columns}
            loading={loading}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            onEdit={handleEdit}
            onDelete={confirmDelete}
            onView={handleView}
            imageField="_avatarUrl"
            titleField="name"
            subtitleField="email"
            statusField="status"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 180,
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <MenuItem onClick={() => handleView(selectedUser)}>
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleEdit(selectedUser)}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit User</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => confirmDelete(selectedUser)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete User</ListItemText>
            </MenuItem>
          </Menu>

          {/* Modals */}
          {openForm && (
            <UserForm
              open={openForm}
              onClose={() => setOpenForm(false)}
              initialData={editUser}
              onSaved={() => {
                setOpenForm(false);
                fetchUsers();
              }}
            />
          )}

          <UserViewModal
            open={Boolean(viewUser)}
            onClose={() => setViewUser(null)}
            user={viewUser}
            onEdit={(user) => {
              setViewUser(null);
              handleEdit(user);
            }}
          />

          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            itemName={userToDelete?.name}
          />
        </Box>
      </motion.div>
    </Box>
  );
};

export default Users;

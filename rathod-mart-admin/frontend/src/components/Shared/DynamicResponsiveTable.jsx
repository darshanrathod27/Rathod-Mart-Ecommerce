// src/components/Shared/DynamicResponsiveTable.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Divider,
  Button,
  Collapse,
  LinearProgress,
  Fade,
  Paper,
  Tooltip,
  Zoom,
  Skeleton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  Pagination,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Search,
  FilterList,
  Edit,
  Delete,
  ExpandMore,
  ExpandLess,
  MoreVert,
  Visibility,
  Close,
  Clear,
  CheckCircle,
  Error,
  Warning,
  Info,
  ArrowUpward,
  ArrowDownward,
  SwapVert,
  Refresh,
  FileDownload,
  Print,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get status color based on status value
 */
const getStatusColor = (status) => {
  const statusLower = String(status).toLowerCase();

  const statusMap = {
    active: { bg: "#e8f5e9", color: "#2e7d32", icon: CheckCircle },
    published: { bg: "#e8f5e9", color: "#2e7d32", icon: CheckCircle },
    approved: { bg: "#e8f5e9", color: "#2e7d32", icon: CheckCircle },

    inactive: { bg: "#fff3e0", color: "#e65100", icon: Warning },
    pending: { bg: "#fff3e0", color: "#e65100", icon: Warning },
    draft: { bg: "#fff3e0", color: "#e65100", icon: Warning },

    blocked: { bg: "#ffebee", color: "#c62828", icon: Error },
    rejected: { bg: "#ffebee", color: "#c62828", icon: Error },
    archived: { bg: "#ffebee", color: "#c62828", icon: Error },

    default: { bg: "#f5f5f5", color: "#616161", icon: Info },
  };

  for (const [key, value] of Object.entries(statusMap)) {
    if (statusLower === key) return value;
  }

  return statusMap.default;
};

/**
 * Format date for display
 */
const formatDate = (date, format = "short") => {
  if (!date) return "—";

  const d = new Date(date);

  if (format === "short") {
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  }

  if (format === "long") {
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("en-IN");
};

/**
 * Truncate text with ellipsis
 */
const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// ==================== MOBILE CARD COMPONENT ====================

/**
 * Mobile Card Row Component
 * Displays data in card format for mobile devices
 */
const MobileCardRow = ({
  row,
  columns,
  onEdit,
  onDelete,
  onView,
  imageField,
  titleField,
  subtitleField,
  statusField,
  index,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Extract field values
  const imgValue = imageField ? row[imageField] : null;
  const titleValue = titleField ? row[titleField] : "Item";
  const subtitleValue = subtitleField
    ? row[subtitleField]
    : `#${row._id?.substring(row._id.length - 6)}`;
  const statusValue = statusField ? row[statusField] : null;

  // Filter columns to display (exclude ID, image, actions, etc.)
  const dataColumns = columns.filter(
    (col) =>
      col.field !== "id" &&
      col.field !== "_id" &&
      col.field !== imageField &&
      col.field !== titleField &&
      col.field !== "actions" &&
      col.field !== "avatar" &&
      col.field !== "icon" &&
      col.field !== "image" &&
      col.field !== statusField
  );

  // Split columns into primary (always visible) and secondary (in collapse)
  const primaryData = dataColumns.slice(0, 3);
  const secondaryData = dataColumns.slice(3);

  const statusColors = statusValue ? getStatusColor(statusValue) : null;
  const StatusIcon = statusColors?.icon || Info;

  // Handle action menu
  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAction = (action) => {
    handleMenuClose();
    action(row);
  };

  // Render cell value
  const renderCellValue = (col) => {
    const value = row[col.field];

    if (col.renderCell) {
      const rendered = col.renderCell({ row, value });
      return typeof rendered === "object" ? rendered : String(rendered);
    }

    return value || "—";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      layout
    >
      <Card
        elevation={0}
        sx={{
          mb: 1.5,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          background: "white",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.light,
          },
          "&:active": { transform: "scale(0.98)" },
        }}
      >
        {/* Card Header */}
        <CardHeader
          avatar={
            <Avatar
              src={imgValue}
              alt={titleValue}
              variant="rounded"
              sx={{
                width: 48,
                height: 48,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              {!imgValue && titleValue?.charAt(0).toUpperCase()}
            </Avatar>
          }
          action={
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          }
          title={
            <Typography
              variant="subtitle1"
              fontWeight={700}
              noWrap
              sx={{
                maxWidth: 200,
                fontSize: "0.95rem",
                color: theme.palette.text.primary,
              }}
            >
              {titleValue}
            </Typography>
          }
          subheader={
            <Stack direction="row" alignItems="center" gap={0.8} mt={0.3}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {truncateText(subtitleValue, 25)}
              </Typography>
              {statusValue && statusColors && (
                <Chip
                  icon={<StatusIcon sx={{ fontSize: 14 }} />}
                  label={statusValue}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "capitalize",
                    bgcolor: statusColors.bg,
                    color: statusColors.color,
                    "& .MuiChip-label": { px: 0.8 },
                    "& .MuiChip-icon": {
                      color: statusColors.color,
                      marginLeft: "4px",
                    },
                  }}
                />
              )}
            </Stack>
          }
          sx={{ pb: 1, px: 2, pt: 1.5 }}
        />

        <Divider sx={{ opacity: 0.6 }} />

        {/* Primary Data */}
        <CardContent sx={{ pt: 1.5, pb: 1, px: 2 }}>
          <Stack spacing={1}>
            {primaryData.map((col) => (
              <Box
                key={col.field}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem", minWidth: "35%", fontWeight: 500 }}
                >
                  {col.headerName}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    textAlign: "right",
                    maxWidth: "60%",
                    fontSize: "0.8rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  {renderCellValue(col)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>

        {/* Expandable Section */}
        {secondaryData.length > 0 && (
          <>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Divider sx={{ opacity: 0.6 }} />
              <CardContent
                sx={{
                  pt: 1.5,
                  pb: 2,
                  px: 2,
                  bgcolor: alpha(theme.palette.grey[100], 0.5),
                }}
              >
                <Stack spacing={1}>
                  {secondaryData.map((col) => (
                    <Box
                      key={col.field}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.8rem", fontWeight: 500 }}
                      >
                        {col.headerName}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {renderCellValue(col)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Action Buttons */}
                <Stack
                  direction="row"
                  spacing={1}
                  mt={2}
                  justifyContent="flex-end"
                >
                  {onView && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => onView(row)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1.5,
                        px: 2,
                      }}
                    >
                      View
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => onEdit(row)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1.5,
                        px: 2,
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => onDelete(row)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1.5,
                        px: 2,
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Collapse>

            {/* Expand/Collapse Button */}
            <CardActions
              sx={{
                justifyContent: "center",
                p: 0.5,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={
                  expanded ? (
                    <ExpandLess sx={{ fontSize: 20 }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 20 }} />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              >
                {expanded ? "Show Less" : `Show More (${secondaryData.length})`}
              </Button>
            </CardActions>
          </>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 0.5,
            borderRadius: 2,
            minWidth: 160,
          },
        }}
      >
        {onView && (
          <MenuItem onClick={() => handleAction(onView)}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => handleAction(onEdit)}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {onDelete && (
          <>
            <Divider />
            <MenuItem
              onClick={() => handleAction(onDelete)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </motion.div>
  );
};

// ==================== MOBILE PAGINATION ====================

/**
 * Mobile Pagination Component
 */
const MobilePagination = ({
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}) => {
  const theme = useTheme();
  const totalPages = Math.ceil(totalRows / pageSize);
  const startRow = page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, totalRows);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "white",
      }}
    >
      {/* Info Row */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Showing {startRow}-{endRow} of {totalRows}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(e.target.value)}
            sx={{
              fontSize: "0.75rem",
              "& .MuiSelect-select": { py: 0.5 },
            }}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size} sx={{ fontSize: "0.75rem" }}>
                {size} / page
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Pagination */}
      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={(e, value) => onPageChange(value - 1)}
        color="primary"
        size="small"
        siblingCount={0}
        boundaryCount={1}
        sx={{
          "& .MuiPagination-ul": {
            justifyContent: "center",
          },
        }}
      />
    </Paper>
  );
};

// ==================== LOADING SKELETON ====================

/**
 * Loading Skeleton for Mobile Cards
 */
const MobileCardSkeleton = ({ count = 5 }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <Card
          key={index}
          elevation={0}
          sx={{
            mb: 1.5,
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <CardHeader
            avatar={<Skeleton variant="rounded" width={48} height={48} />}
            action={<Skeleton variant="circular" width={24} height={24} />}
            title={<Skeleton variant="text" width="60%" />}
            subheader={<Skeleton variant="text" width="40%" />}
          />
          <Divider />
          <CardContent>
            <Stack spacing={1}>
              {[1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="30%" />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

// ==================== EMPTY STATE ====================

/**
 * Empty State Component
 */
const EmptyState = ({ searchTerm, onClearSearch }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        textAlign: "center",
        py: 8,
        px: 3,
        borderRadius: 3,
        border: `2px dashed ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.grey[100], 0.3),
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Search
          sx={{
            fontSize: 64,
            color: theme.palette.grey[400],
            mb: 2,
          }}
        />
        <Typography
          variant="h6"
          color="text.primary"
          gutterBottom
          fontWeight={700}
        >
          No Results Found
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {searchTerm
            ? `No results match "${searchTerm}"`
            : "No data available to display"}
        </Typography>
        {searchTerm && onClearSearch && (
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={onClearSearch}
            sx={{ borderRadius: 2 }}
          >
            Clear Search
          </Button>
        )}
      </motion.div>
    </Paper>
  );
};

// ==================== MAIN COMPONENT ====================

/**
 * Dynamic Responsive Table Component
 *
 * Features:
 * - Desktop: DataGrid with full features
 * - Mobile: Card-based responsive layout
 * - Server-side pagination & sorting
 * - Search, filters, and actions
 * - Smooth animations
 * - Loading states
 * - Empty states
 */
const DynamicResponsiveTable = ({
  // Data props
  rows = [],
  columns = [],
  loading = false,
  rowCount = 0,

  // Pagination props
  paginationModel = { page: 0, pageSize: 10 },
  onPaginationModelChange,
  pageSizeOptions = [10, 25, 50, 100],

  // Sorting props
  sortModel = [],
  onSortModelChange,

  // Action handlers
  onEdit,
  onDelete,
  onView,

  // Mobile card configuration
  imageField = "image",
  titleField = "name",
  subtitleField = "email",
  statusField = "status",

  // Search configuration
  searchTerm = "",
  onSearchChange,

  // Additional props
  emptyMessage = "No data available",
  showToolbar = true,
  density = "standard",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Local state for mobile search if not controlled
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Handle search change
  const handleSearchChange = (value) => {
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Handle page change for mobile
  const handleMobilePageChange = (newPage) => {
    if (onPaginationModelChange) {
      onPaginationModelChange({
        ...paginationModel,
        page: newPage,
      });
    }
  };

  // Handle page size change for mobile
  const handleMobilePageSizeChange = (newPageSize) => {
    if (onPaginationModelChange) {
      onPaginationModelChange({
        page: 0,
        pageSize: newPageSize,
      });
    }
  };

  // Clear search
  const handleClearSearch = () => {
    handleSearchChange("");
  };

  // ========== DESKTOP VIEW ==========
  if (!isMobile) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r._id || r.id}
          loading={loading}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          pageSizeOptions={pageSizeOptions}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          slots={showToolbar ? { toolbar: GridToolbar } : {}}
          disableRowSelectionOnClick
          autoHeight
          density={density}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              color: theme.palette.text.primary,
              fontWeight: 700,
              fontSize: "0.875rem",
              borderBottom: `2px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              fontSize: "0.875rem",
            },
            "& .MuiDataGrid-row": {
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `2px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.grey[100], 0.5),
            },
          }}
        />
      </Card>
    );
  }

  // ========== MOBILE VIEW ==========
  return (
    <Box sx={{ pb: 2 }}>
      {/* Loading State */}
      {loading && <MobileCardSkeleton count={paginationModel.pageSize} />}

      {/* Data Cards */}
      {!loading && (
        <AnimatePresence mode="wait">
          {rows.length > 0 ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {rows.map((row, index) => (
                <MobileCardRow
                  key={row._id || row.id}
                  row={row}
                  columns={columns}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  imageField={imageField}
                  titleField={titleField}
                  subtitleField={subtitleField}
                  statusField={statusField}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                searchTerm={localSearch}
                onClearSearch={handleClearSearch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Pagination */}
      {!loading && rows.length > 0 && (
        <MobilePagination
          page={paginationModel.page}
          pageSize={paginationModel.pageSize}
          totalRows={rowCount}
          onPageChange={handleMobilePageChange}
          onPageSizeChange={handleMobilePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </Box>
  );
};

export default DynamicResponsiveTable;

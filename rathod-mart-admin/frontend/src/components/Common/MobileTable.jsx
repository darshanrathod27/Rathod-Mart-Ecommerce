import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Paper,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

const MobileTable = ({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onRowClick,
  showAvatar = true,
}) => {
  const getColumnValue = (row, column) => {
    if (typeof column.render === "function") {
      return column.render(row);
    }
    return row[column.field] || "-";
  };

  const renderCellContent = (row, column) => {
    const value = getColumnValue(row, column);

    // Avatar Column
    if (column.field === "avatar" || column.field === "image") {
      return (
        <Avatar
          src={value}
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.main",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {row.name?.[0] || "?"}
        </Avatar>
      );
    }

    // Status/Role Chip
    if (column.field === "status" || column.field === "role") {
      const isActive = value === "active" || value === "Active";
      const isInactive = value === "inactive" || value === "Inactive";

      return (
        <Chip
          label={value}
          size="small"
          sx={{
            height: 22,
            fontSize: "0.7rem",
            fontWeight: 600,
            bgcolor: isActive
              ? "rgba(76, 175, 80, 0.1)"
              : isInactive
              ? "rgba(244, 67, 54, 0.1)"
              : "rgba(0, 0, 0, 0.08)",
            color: isActive
              ? "#4CAF50"
              : isInactive
              ? "#F44336"
              : "text.primary",
            border: isActive
              ? "1px solid rgba(76, 175, 80, 0.3)"
              : isInactive
              ? "1px solid rgba(244, 67, 54, 0.3)"
              : "1px solid rgba(0, 0, 0, 0.12)",
          }}
        />
      );
    }

    // Actions Column
    if (column.field === "actions") {
      return (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          {onEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              sx={{
                bgcolor: "rgba(76, 175, 80, 0.1)",
                p: 0.5,
                "&:hover": { bgcolor: "rgba(76, 175, 80, 0.2)" },
              }}
            >
              <Edit sx={{ fontSize: 16, color: "#4CAF50" }} />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
              sx={{
                bgcolor: "rgba(244, 67, 54, 0.1)",
                p: 0.5,
                "&:hover": { bgcolor: "rgba(244, 67, 54, 0.2)" },
              }}
            >
              <Delete sx={{ fontSize: 16, color: "#F44336" }} />
            </IconButton>
          )}
        </Box>
      );
    }

    // Regular Text
    return (
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.8rem",
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 150,
        }}
      >
        {value}
      </Typography>
    );
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: "0 2px 8px rgba(76, 175, 80, 0.1)",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Table
        size="small"
        sx={{
          minWidth: 500,
          "& .MuiTableCell-root": {
            padding: "8px 6px",
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
            }}
          >
            {columns.map((column) => (
              <TableCell
                key={column.field}
                sx={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.5px",
                  borderBottom: "2px solid rgba(255, 255, 255, 0.3)",
                  position: "sticky",
                  top: 0,
                  bgcolor: "#4CAF50",
                  zIndex: 100,
                  ...(column.field === "actions" && { textAlign: "right" }),
                  ...(column.width && { width: column.width }),
                }}
              >
                {column.label || column.field}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <motion.tr
                key={row.id || index}
                component={TableRow}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onRowClick && onRowClick(row)}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  "&:hover": {
                    bgcolor: "rgba(76, 175, 80, 0.04)",
                  },
                  "&:nth-of-type(odd)": {
                    bgcolor: "rgba(76, 175, 80, 0.02)",
                  },
                  borderBottom: "1px solid rgba(76, 175, 80, 0.1)",
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    sx={{
                      fontSize: "0.8rem",
                      color: "text.primary",
                      ...(column.field === "actions" && { textAlign: "right" }),
                    }}
                  >
                    {renderCellContent(row, column)}
                  </TableCell>
                ))}
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "text.secondary",
                  fontSize: "0.9rem",
                }}
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MobileTable;

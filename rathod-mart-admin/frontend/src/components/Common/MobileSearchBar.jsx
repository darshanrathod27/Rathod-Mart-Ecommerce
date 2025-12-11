// src/components/Common/MobileSearchBar.jsx
import React from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
} from "@mui/material";
import { Search, Add } from "@mui/icons-material";
import { motion } from "framer-motion";

const MobileSearchBar = ({
  searchValue = "",
  onSearchChange,
  roleValue = "",
  onRoleChange,
  statusValue = "",
  onStatusChange,
  onAddClick,
  addButtonText = "Add User",
  showRole = true,
  showStatus = true,
  rolePlaceholder = "Role",
  statusPlaceholder = "Status",
  searchPlaceholder = "Search...",
  roleOptions = [],
  statusOptions = [],
}) => {
  return (
    <Box
      sx={{
        bgcolor: "white",
        p: 1.5,
        mb: 1.5,
        borderRadius: 1,
        boxShadow: "0 2px 8px rgba(76, 175, 80, 0.1)",
        position: "sticky", // ✅ FIX: Make it sticky on scroll
        top: 0,
        zIndex: 10, // ✅ FIX: Ensure it stays on top
      }}
    >
      {/* Search TextField */}
      <TextField
        fullWidth
        size="small"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "rgba(0,0,0,0.4)", fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": {
            bgcolor: "rgba(76, 175, 80, 0.04)",
            fontSize: "0.9rem",
            "& fieldset": { borderColor: "rgba(76, 175, 80, 0.2)" },
            "&:hover fieldset": { borderColor: "rgba(76, 175, 80, 0.4)" },
            "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
          },
        }}
      />

      {/* Filters and Add Button */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            showRole && showStatus
              ? "1fr 1fr auto"
              : showRole || showStatus
                ? "1fr auto"
                : "auto",
          gap: 1,
          alignItems: "stretch",
        }}
      >
        {/* Role Select - ✅ FIXED: Removed Fragments */}
        {showRole && (
          <FormControl size="small" fullWidth>
            <Select
              value={roleValue}
              onChange={onRoleChange}
              displayEmpty
              sx={{
                bgcolor: "rgba(76, 175, 80, 0.04)",
                fontSize: "0.85rem",
                height: 40,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(76, 175, 80, 0.2)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4CAF50",
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
                {rolePlaceholder}
              </MenuItem>
              {roleOptions.length > 0
                ? roleOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{ fontSize: "0.85rem" }}
                  >
                    {option.label}
                  </MenuItem>
                ))
                : [
                  <MenuItem
                    key="admin"
                    value="admin"
                    sx={{ fontSize: "0.85rem" }}
                  >
                    Admin
                  </MenuItem>,
                  <MenuItem
                    key="manager"
                    value="manager"
                    sx={{ fontSize: "0.85rem" }}
                  >
                    Manager
                  </MenuItem>,
                  <MenuItem
                    key="customer"
                    value="customer"
                    sx={{ fontSize: "0.85rem" }}
                  >
                    Customer
                  </MenuItem>,
                ]}
            </Select>
          </FormControl>
        )}

        {/* Status Select - ✅ FIXED: Removed Fragments */}
        {showStatus && (
          <FormControl size="small" fullWidth>
            <Select
              value={statusValue}
              onChange={onStatusChange}
              displayEmpty
              sx={{
                bgcolor: "rgba(76, 175, 80, 0.04)",
                fontSize: "0.85rem",
                height: 40,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(76, 175, 80, 0.2)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4CAF50",
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
                {statusPlaceholder}
              </MenuItem>
              {statusOptions.length > 0
                ? statusOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{ fontSize: "0.85rem" }}
                  >
                    {option.label}
                  </MenuItem>
                ))
                : [
                  <MenuItem
                    key="active"
                    value="active"
                    sx={{ fontSize: "0.85rem" }}
                  >
                    Active
                  </MenuItem>,
                  <MenuItem
                    key="inactive"
                    value="inactive"
                    sx={{ fontSize: "0.85rem" }}
                  >
                    Inactive
                  </MenuItem>,
                ]}
            </Select>
          </FormControl>
        )}

        {/* Add Button with Animation */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onAddClick}
            startIcon={<Add />}
            sx={{
              height: 40,
              px: 2,
              minWidth: 110,
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
              background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #45a049 0%, #5cb860 100%)",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
              },
            }}
          >
            {addButtonText}
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
};

export default MobileSearchBar;

// rathod-mart-admin/frontend/src/theme/theme.js
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#66BB6A" : "#2E7D32", // Lighter green for dark mode
        light: "#81C784",
        dark: "#1B5E20",
        contrastText: "#ffffff",
      },
      secondary: {
        main: mode === "dark" ? "#81C784" : "#66BB6A",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#F1F8E9",
        paper: mode === "dark" ? "#1E1E1E" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#E8F5E9" : "#1B5E20",
        secondary: mode === "dark" ? "#A5D6A7" : "#2E7D32",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 24px",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: "none", // Fix for dark mode elevation
          },
        },
      },
      // Fix DataGrid on Mobile
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: mode === "dark" ? "1px solid #333" : "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor:
                mode === "dark" ? "#2c2c2c" : "rgba(76, 175, 80, 0.05)",
            },
          },
        },
      },
    },
    shape: { borderRadius: 12 },
  });

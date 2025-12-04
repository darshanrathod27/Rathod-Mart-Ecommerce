// rathod-mart-admin/frontend/src/App.jsx
import React, { lazy, Suspense, useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { getTheme } from "./theme/theme"; // Import the function
import { useSelector } from "react-redux";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";

// ... (Keep your lazy imports here) ...
const Users = lazy(() => import("./pages/Users"));
const Categories = lazy(() => import("./pages/Categories"));
const Products = lazy(() => import("./pages/Products"));
const ProductSizeMapping = lazy(() => import("./pages/ProductSizeMapping"));
const ProductColorMapping = lazy(() => import("./pages/ProductColorMapping"));
const VariantMaster = lazy(() => import("./pages/VariantMaster"));
const InventoryMaster = lazy(() => import("./pages/InventoryMaster"));
const PromocodeMaster = lazy(() => import("./pages/PromocodeMaster"));

// Protected Route (Keep as is)
function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useSelector((state) => state.auth);
  const location = useLocation();
  if (status === "loading" || status === "idle")
    return <div>Loading Authentication...</div>;
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Create a Context for Color Mode
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

function App() {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Toaster position="top-right" />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/users" replace />} />
                <Route path="users" element={<Users />} />
                <Route path="categories" element={<Categories />} />
                <Route path="products" element={<Products />} />
                <Route
                  path="product-size-mapping"
                  element={<ProductSizeMapping />}
                />
                <Route
                  path="product-color-mapping"
                  element={<ProductColorMapping />}
                />
                <Route path="variant-master" element={<VariantMaster />} />
                <Route path="inventory" element={<InventoryMaster />} />
                <Route path="promocodes" element={<PromocodeMaster />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

// ========================================
// RATHOD MART ADMIN - MAIN APP
// Responsive layout with authentication
// Material-UI removed, pure CSS implementation
// ========================================

import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useResponsive } from "./hooks/useResponsive";
import { motion } from "framer-motion";

// Layout Components
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";

// Pages - Lazy Loaded
const Login = lazy(() => import("./pages/Login"));
const Users = lazy(() => import("./pages/Users"));
const Categories = lazy(() => import("./pages/Categories"));
const Products = lazy(() => import("./pages/Products"));
const ProductSizeMapping = lazy(() => import("./pages/ProductSizeMapping"));
const ProductColorMapping = lazy(() => import("./pages/ProductColorMapping"));
const VariantMaster = lazy(() => import("./pages/VariantMaster"));
const InventoryMaster = lazy(() => import("./pages/InventoryMaster"));
const PromocodeMaster = lazy(() => import("./pages/PromocodeMaster"));

// ========================================
// LOADING COMPONENT
// Shown during lazy loading
// ========================================
const LoadingSpinner = () => {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      {/* Animated Logo */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity },
        }}
        style={{
          width: isMobile ? "64px" : "80px",
          height: isMobile ? "64px" : "80px",
          borderRadius: "var(--radius-lg)",
          background: "var(--primary-green)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: isMobile ? "1.5rem" : "2rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        RM
      </motion.div>

      {/* Loading Text */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: isMobile ? "1rem" : "1.125rem",
            fontWeight: 500,
            color: "var(--text-primary)",
            margin: "0 0 0.5rem 0",
          }}
        >
          Loading...
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          Please wait
        </p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: isMobile ? "200px" : "300px",
          height: "4px",
          background: "var(--bg-tertiary)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ x: ["0%", "100%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            height: "100%",
            width: "50%",
            background: "var(--primary-green)",
            borderRadius: "var(--radius-full)",
          }}
        />
      </div>
    </div>
  );
};

// ========================================
// AUTH LOADING COMPONENT
// Shown while checking authentication
// ========================================
const AuthLoading = () => {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        flexDirection: "column",
        gap: "var(--space-md)",
        padding: "var(--space-lg)",
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: isMobile ? "48px" : "56px",
          height: isMobile ? "48px" : "56px",
          border: "4px solid var(--border-color)",
          borderTopColor: "var(--primary-green)",
          borderRadius: "50%",
        }}
      />
      <p
        style={{
          fontSize: isMobile ? "0.9375rem" : "1rem",
          color: "var(--text-secondary)",
          margin: 0,
          textAlign: "center",
        }}
      >
        Checking Authentication...
      </p>
    </div>
  );
};

// ========================================
// PROTECTED ROUTE COMPONENT
// Redirects to login if not authenticated
// ========================================
function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loading while checking auth status
  if (status === "loading" || status === "idle") {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// ========================================
// LAYOUT WRAPPER
// Contains Header + Sidebar + Content
// ========================================
function LayoutWrapper({ children }) {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      {/* Sidebar - Responsive */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // Prevents flex overflow
        }}
      >
        {/* Header - Sticky */}
        <Header />

        {/* Page Content - Scrollable */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
            background: "var(--bg-primary)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* Page Animation Wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// ========================================
// MAIN APP COMPONENT
// ========================================
function App() {
  const { isMobile } = useResponsive();

  // Set initial theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("rathod-mart-theme") || "green";
    document.body.className = `theme-${savedTheme}`;
  }, []);

  return (
    <>
      {/* Toast Notifications */}
      <Toaster
        position={isMobile ? "bottom-center" : "top-right"}
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: "var(--space-md)",
            fontSize: isMobile ? "0.875rem" : "0.9375rem",
            maxWidth: isMobile ? "90vw" : "400px",
          },
          success: {
            iconTheme: {
              primary: "var(--success)",
              secondary: "#fff",
            },
            style: {
              border: "1px solid var(--success)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--error)",
              secondary: "#fff",
            },
            style: {
              border: "1px solid var(--error)",
            },
          },
          loading: {
            iconTheme: {
              primary: "var(--primary-green)",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Routes with Lazy Loading */}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/login" element={<Login />} />

          {/* ===== PROTECTED ADMIN ROUTES ===== */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Routes>
                    {/* Default redirect to Users */}
                    <Route index element={<Navigate to="/users" replace />} />

                    {/* Admin Pages */}
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
                  </Routes>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />

          {/* ===== CATCH ALL - REDIRECT ===== */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

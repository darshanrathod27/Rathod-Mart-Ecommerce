// ========================================
// BUTTON COMPONENT - Consistent styling
// Multiple variants and sizes
// ========================================

import { motion } from "framer-motion";
import { useResponsive } from "../../hooks/useResponsive";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const { isMobile } = useResponsive();

  const variants = {
    primary: {
      background: "var(--primary-green)",
      color: "#fff",
      border: "none",
    },
    outline: {
      background: "transparent",
      color: "var(--primary-green)",
      border: "1.5px solid var(--primary-green)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-primary)",
      border: "none",
    },
    danger: {
      background: "var(--error)",
      color: "#fff",
      border: "none",
    },
    success: {
      background: "var(--success)",
      color: "#fff",
      border: "none",
    },
  };

  const sizes = {
    sm: {
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      minHeight: "36px",
    },
    md: {
      padding: isMobile ? "1rem 1.25rem" : "0.875rem 1.5rem",
      fontSize: isMobile ? "0.9375rem" : "1rem",
      minHeight: isMobile ? "48px" : "44px",
    },
    lg: {
      padding: "1rem 2rem",
      fontSize: "1.125rem",
      minHeight: "52px",
    },
  };

  const buttonStyle = {
    ...variants[variant],
    ...sizes[size],
    width: fullWidth ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-sm)",
    fontWeight: 500,
    borderRadius: "var(--radius-sm)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "all var(--transition-base)",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };

  return (
    <motion.button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={className}
      style={buttonStyle}
      whileHover={
        disabled || loading
          ? {}
          : {
              scale: 1.02,
              boxShadow: "var(--shadow-md)",
            }
      }
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "18px",
            height: "18px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
          }}
        />
      )}

      {!loading && icon && iconPosition === "left" && icon}
      {!loading && children}
      {!loading && icon && iconPosition === "right" && icon}
    </motion.button>
  );
};

export default Button;

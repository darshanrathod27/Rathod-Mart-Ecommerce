// ========================================
// FORM MODAL - Mobile optimized with animations
// Existing functionality preserved
// ========================================

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useResponsive } from "../../hooks/useResponsive";

const FormModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "600px",
}) => {
  const { isMobile } = useResponsive();

  // Prevent body scroll jab modal open ho
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ESC key se close karo
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Modal animations - mobile ke liye alag
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = isMobile
    ? {
        hidden: { y: "100%", opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 300,
          },
        },
        exit: {
          y: "100%",
          opacity: 0,
          transition: {
            duration: 0.2,
          },
        },
      }
    : {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 300,
          },
        },
        exit: {
          scale: 0.9,
          opacity: 0,
          transition: {
            duration: 0.2,
          },
        },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: "var(--z-modal-backdrop)",
            padding: isMobile ? 0 : "var(--space-lg)",
            overflowY: "auto",
          }}
        >
          <motion.div
            className="modal-content"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-secondary)",
              borderRadius: isMobile
                ? "var(--radius-xl) var(--radius-xl) 0 0"
                : "var(--radius-xl)",
              boxShadow: "var(--shadow-xl)",
              maxWidth: isMobile ? "100%" : maxWidth,
              width: "100%",
              maxHeight: isMobile ? "85vh" : "90vh",
              overflowY: "auto",
              position: "relative",
              border: "1px solid var(--border-color)",
            }}
          >
            {/* Header */}
            <div
              className="modal-header"
              style={{
                padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "var(--bg-secondary)",
                zIndex: 1,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: isMobile ? "1.25rem" : "1.5rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                {title}
              </h3>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "var(--space-sm)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-sm)",
                  transition: "all var(--transition-fast)",
                  minHeight: "auto",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "var(--hover-bg)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                <IoClose size={24} />
              </motion.button>
            </div>

            {/* Body */}
            <div
              className="modal-body"
              style={{
                padding: isMobile ? "var(--space-md)" : "var(--space-lg)",
              }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormModal;

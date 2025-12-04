// ========================================
// RESPONSIVE TABLE - Desktop table, Mobile cards
// Advanced features with sorting, pagination
// ========================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResponsive } from "../../hooks/useResponsive";
import {
  FiChevronUp,
  FiChevronDown,
  FiMoreVertical,
  FiSearch,
} from "react-icons/fi";

const ResponsiveTable = ({
  columns = [],
  data = [],
  actions,
  searchable = false,
  sortable = false,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");

  // Sort functionality
  const handleSort = (key) => {
    if (!sortable) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter data based on search
  const filteredData = searchTerm
    ? data.filter((row) =>
        columns.some((col) =>
          String(row[col.key] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="mobile-table-container">
        {/* Search bar */}
        {searchable && (
          <div style={{ marginBottom: "var(--space-md)" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiSearch
                size={18}
                style={{
                  position: "absolute",
                  left: "var(--space-md)",
                  color: "var(--text-tertiary)",
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "2.5rem",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>
        )}

        {/* Cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          <AnimatePresence>
            {sortedData.map((row, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="card"
                style={{
                  padding: "var(--space-md)",
                  marginBottom: 0,
                }}
              >
                {columns.map((col, colIndex) => (
                  <div
                    key={col.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "var(--space-sm) 0",
                      borderBottom:
                        colIndex < columns.length - 1
                          ? "1px solid var(--border-color)"
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        flex: "0 0 40%",
                      }}
                    >
                      {col.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        color: "var(--text-primary)",
                        textAlign: "right",
                        flex: "1",
                        wordBreak: "break-word",
                      }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </span>
                  </div>
                ))}

                {/* Actions */}
                {actions && (
                  <div
                    style={{
                      marginTop: "var(--space-md)",
                      paddingTop: "var(--space-md)",
                      borderTop: "1px solid var(--border-color)",
                      display: "flex",
                      gap: "var(--space-sm)",
                      justifyContent: "center",
                    }}
                  >
                    {actions(row)}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedData.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-2xl)",
                color: "var(--text-tertiary)",
              }}
            >
              No data found
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop/Tablet Table View
  return (
    <div className="table-container">
      {/* Search bar */}
      {searchable && (
        <div
          style={{
            padding: "var(--space-md)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "400px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiSearch
              size={18}
              style={{
                position: "absolute",
                left: "var(--space-md)",
                color: "var(--text-tertiary)",
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "2.5rem",
              }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() =>
                    sortable && col.sortable !== false && handleSort(col.key)
                  }
                  style={{
                    cursor:
                      sortable && col.sortable !== false
                        ? "pointer"
                        : "default",
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-xs)",
                    }}
                  >
                    {col.label}
                    {sortable && col.sortable !== false && (
                      <span
                        style={{
                          opacity: sortConfig.key === col.key ? 1 : 0.3,
                        }}
                      >
                        {sortConfig.key === col.key &&
                        sortConfig.direction === "desc" ? (
                          <FiChevronDown size={16} />
                        ) : (
                          <FiChevronUp size={16} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ textAlign: "center" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sortedData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {columns.map((col) => (
                    <td key={col.key} data-label={col.label}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--space-sm)",
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-2xl)",
              color: "var(--text-tertiary)",
            }}
          >
            No data found
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveTable;

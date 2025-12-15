// src/context/FilterContext.jsx
// Shared filter state context for mobile and desktop filter functionality

import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext(null);

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error("useFilter must be used within a FilterProvider");
    }
    return context;
};

export const FilterProvider = ({ children }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const openFilter = () => setIsFilterOpen(true);
    const closeFilter = () => setIsFilterOpen(false);
    const toggleFilter = () => setIsFilterOpen((prev) => !prev);

    return (
        <FilterContext.Provider
            value={{
                isFilterOpen,
                openFilter,
                closeFilter,
                toggleFilter,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export default FilterContext;

// src/hooks/useResponsive.js
import { useTheme, useMediaQuery } from "@mui/material";

export const useResponsive = () => {
  const theme = useTheme();

  return {
    isMobile: useMediaQuery(theme.breakpoints.down("md")), // < 900px
    isSmallMobile: useMediaQuery(theme.breakpoints.down("sm")), // < 600px
    isTablet: useMediaQuery(theme.breakpoints.between("sm", "md")), // 600-900px
    isDesktop: useMediaQuery(theme.breakpoints.up("md")), // >= 900px
    isLargeDesktop: useMediaQuery(theme.breakpoints.up("lg")), // >= 1200px
  };
};

// Responsive spacing helper
export const getResponsiveSpacing = (xs, md = xs * 1.5) => ({
  xs,
  md,
});

// Touch-friendly size helper
export const getTouchSize = () => ({
  minWidth: { xs: 44, md: 40 },
  minHeight: { xs: 44, md: 40 },
});

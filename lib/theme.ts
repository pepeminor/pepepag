"use client";

import { createTheme } from "@mui/material/styles";

const sharedTypography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const sharedShape = {
  borderRadius: 12,
};

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#8B5CF6" },
    secondary: { main: "#F0B90B" },
    background: {
      default: "#0B0E11",
      paper: "#1E2329",
    },
    text: {
      primary: "#EAECEF",
      secondary: "#848E9C",
    },
    divider: "#2B3139",
    success: { main: "#0ECB81" },
    error: { main: "#F6465D" },
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#7C3AED" },
    secondary: { main: "#F0B90B" },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E2329",
      secondary: "#707A8A",
    },
    divider: "#E6E8EA",
    success: { main: "#0ECB81" },
    error: { main: "#F6465D" },
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
  },
});

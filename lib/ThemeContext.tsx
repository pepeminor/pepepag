"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { darkTheme, lightTheme } from "./theme";

type ThemeMode = "dark" | "light";

const ThemeContext = createContext<{
  mode: ThemeMode;
  toggleTheme: () => void;
}>({
  mode: "dark",
  toggleTheme: () => {},
});

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

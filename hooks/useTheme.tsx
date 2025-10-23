"use client";

import { createContext, useContext, ReactNode } from "react";

type Theme = "light";

interface ThemeContextType {
  theme: Theme;
  actualTheme: "light";
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  themeColors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeColors = {
    primary: "#5a67d8",
    secondary: "#6b46c1",
    background: "#ffffff",
    surface: "#f8f9fa",
    text: "#212529",
    textSecondary: "#6c757d",
    border: "#dee2e6",
    shadow: "rgba(0,0,0,0.08)",
    success: "#38a169",
    warning: "#d69e2e",
    error: "#e53e3e",
    info: "#3182ce",
  };

  const setTheme = () => {
    // No-op function since theme is always light
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: "light",
        actualTheme: "light",
        setTheme,
        isDark: false,
        themeColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

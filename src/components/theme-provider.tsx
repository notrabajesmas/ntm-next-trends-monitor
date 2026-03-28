"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Funciones para localStorage con SSR
const getLocalStorageTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem("ntm_theme") as Theme) || "dark";
};

const setLocalStorageTheme = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("ntm_theme", theme);
  }
};

// Hook para usar con SSR
function useThemeStorage() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('storage', onChange);
      return () => window.removeEventListener('storage', onChange);
    },
    getLocalStorageTheme,
    () => 'dark' as Theme
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const savedTheme = useThemeStorage();
  const [theme, setThemeState] = useState<Theme>(savedTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    setLocalStorageTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

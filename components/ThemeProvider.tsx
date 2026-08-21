"use client";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  baseTheme: string;
  setBaseTheme: (base: string) => void;
  mode: "dark" | "light";
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [baseTheme, setBaseThemeState] = useState(() => {
    if (typeof window === "undefined") return "void";
    return localStorage.getItem("astro-theme") || "void";
  });

  const [mode, setModeState] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("astro-mode") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    // Apply clean attributes so your CSS matches [data-theme="void"] and [data-mode="dark"]
    document.documentElement.setAttribute("data-theme", baseTheme);
    document.documentElement.setAttribute("data-mode", mode);
    document.documentElement.classList.toggle("dark", mode === "dark");

    localStorage.setItem("astro-theme", baseTheme);
    localStorage.setItem("astro-mode", mode);
  }, [baseTheme, mode]);

  const setBaseTheme = (newBase: string) => {
    setBaseThemeState(newBase);
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ baseTheme, setBaseTheme, mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
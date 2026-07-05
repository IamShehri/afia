import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  COLOR_THEME_STORAGE_KEY,
  type ColorTheme,
} from "@/lib/color-themes";

export type ColorMode = "light" | "dark";

interface ThemeContextType {
  /** Light / dark appearance */
  colorMode: ColorMode;
  /** Classic vs coral palette */
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  toggleColorMode?: () => void;
  switchable: boolean;
  /** @deprecated Use colorMode — kept for existing callers */
  theme: ColorMode;
  /** @deprecated Use toggleColorMode */
  toggleTheme?: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_MODE_KEY = "theme";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ColorMode;
  defaultColorTheme?: ColorTheme;
  switchable?: boolean;
}

function readStoredColorMode(defaultTheme: ColorMode): ColorMode {
  const stored = localStorage.getItem(COLOR_MODE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return defaultTheme;
}

function readStoredColorTheme(defaultColorTheme: ColorTheme): ColorTheme {
  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  if (stored === "classic" || stored === "coral") return stored;
  return defaultColorTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  defaultColorTheme = "classic",
  switchable = false,
}: ThemeProviderProps) {
  const [colorMode, setColorMode] = useState<ColorMode>(() =>
    switchable ? readStoredColorMode(defaultTheme) : defaultTheme,
  );
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() =>
    switchable
      ? readStoredColorTheme(defaultColorTheme)
      : defaultColorTheme,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", colorTheme);

    if (colorMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem(COLOR_MODE_KEY, colorMode);
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
    }
  }, [colorMode, colorTheme, switchable]);

  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
  }, []);

  const toggleTheme = switchable ? toggleColorMode : undefined;

  return (
    <ThemeContext.Provider
      value={{
        colorMode,
        colorTheme,
        setColorTheme,
        toggleColorMode: switchable ? toggleColorMode : undefined,
        switchable,
        theme: colorMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

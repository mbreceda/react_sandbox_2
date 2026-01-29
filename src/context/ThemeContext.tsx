import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type ThemeType = "sketchbook" | "blue-festive" | "red-crimson";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("sketchbook");

  useEffect(() => {
    localStorage.setItem("photobooth-theme", "sketchbook");
    document.documentElement.setAttribute("data-theme", "sketchbook");
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) =>
      prev === "blue-festive" ? "red-crimson" : "blue-festive",
    );
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
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

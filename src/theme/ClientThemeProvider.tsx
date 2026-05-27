import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ClientTheme = "day" | "night";

interface ClientThemeContextValue {
  theme: ClientTheme;
  setTheme: (theme: ClientTheme) => void;
  toggleTheme: () => void;
  isNight: boolean;
}

const ClientThemeContext = createContext<ClientThemeContextValue | null>(null);
const themeStorageKey = "needo.client.theme";

function getInitialClientTheme(): ClientTheme {
  if (typeof window === "undefined") {
    return "night";
  }

  const stored = window.localStorage.getItem(themeStorageKey);

  return stored === "day" || stored === "night" ? stored : "night";
}

export function ClientThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ClientTheme>(getInitialClientTheme);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const value = useMemo<ClientThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme() {
        setTheme((current) => (current === "night" ? "day" : "night"));
      },
      isNight: theme === "night"
    }),
    [theme]
  );

  return <ClientThemeContext.Provider value={value}>{children}</ClientThemeContext.Provider>;
}

export function useClientTheme() {
  const context = useContext(ClientThemeContext);

  if (!context) {
    throw new Error("useClientTheme must be used within ClientThemeProvider");
  }

  return context;
}

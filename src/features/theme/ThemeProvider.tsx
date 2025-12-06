import type { ReactNode } from "react";
import { useEffect } from "react";
import { useThemeStore } from "./store/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useThemeStore();
  useEffect(() => setTheme(theme), [theme, setTheme]);
  return <>{children}</>;
}

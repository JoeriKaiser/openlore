import { type ReactNode, useEffect } from "react";
import { useThemeStore } from "@/features/theme/store/theme";

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const { theme, setTheme } = useThemeStore();

	useEffect(() => {
		// Initialize theme on mount
		setTheme(theme);
	}, [theme, setTheme]);

	return <>{children}</>;
}

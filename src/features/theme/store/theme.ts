import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

type State = {
	theme: Theme;
	resolvedTheme: "light" | "dark";
};

type Actions = {
	setTheme: (theme: Theme) => void;
};

const getSystemTheme = (): "light" | "dark" => {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
};

const applyTheme = (theme: "light" | "dark") => {
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(theme);
};

export const useThemeStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			theme: "system",
			resolvedTheme: getSystemTheme(),
			setTheme: (theme: Theme) => {
				const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
				applyTheme(resolvedTheme);
				set({ theme, resolvedTheme });
			},
		}),
		{
			name: "openlore-theme",
			onRehydrateStorage: () => (state) => {
				// Apply theme on hydration
				if (state) {
					const resolvedTheme =
						state.theme === "system" ? getSystemTheme() : state.theme;
					applyTheme(resolvedTheme);
					state.resolvedTheme = resolvedTheme;
				}
			},
		},
	),
);

// Listen for system theme changes
if (typeof window !== "undefined") {
	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	mediaQuery.addEventListener("change", (e) => {
		const { theme, setTheme } = useThemeStore.getState();
		if (theme === "system") {
			const systemTheme = e.matches ? "dark" : "light";
			applyTheme(systemTheme);
			useThemeStore.setState({ resolvedTheme: systemTheme });
		}
	});
}

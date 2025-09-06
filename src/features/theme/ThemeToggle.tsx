import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/features/theme/store/theme";

export function ThemeToggle() {
	const { theme, setTheme } = useThemeStore();

	const toggleTheme = () => {
		switch (theme) {
			case "light":
				setTheme("dark");
				break;
			case "dark":
				setTheme("system");
				break;
			case "system":
				setTheme("light");
				break;
		}
	};

	const getIcon = () => {
		switch (theme) {
			case "light":
				return <Sun className="h-4 w-4" />;
			case "dark":
				return <Moon className="h-4 w-4" />;
			case "system":
				return <Monitor className="h-4 w-4" />;
		}
	};

	const getLabel = () => {
		switch (theme) {
			case "light":
				return "Light";
			case "dark":
				return "Dark";
			case "system":
				return "System";
		}
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={toggleTheme}
			className="justify-start gap-2"
			title={`Current theme: ${getLabel()}. Click to cycle through themes.`}
		>
			{getIcon()}
			<span className="hidden sm:inline">{getLabel()}</span>
		</Button>
	);
}

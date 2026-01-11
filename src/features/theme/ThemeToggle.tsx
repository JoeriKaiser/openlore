import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "./store/theme";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const toggle = () =>
    setTheme(
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light",
    );

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="justify-start gap-2"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

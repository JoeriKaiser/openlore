import { Toaster as SonnerToaster } from "sonner";
import { useThemeStore } from "@/features/theme/store/theme";

export function Toaster() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);

  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "bg-background border-border",
          title: "text-foreground",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

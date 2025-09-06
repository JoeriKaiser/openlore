import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { AppRouter } from "@/lib/router";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<AppRouter />
		</ThemeProvider>
	</StrictMode>,
);

import type { ReactNode } from "react";
import {
	BrowserRouter,
	Navigate,
	Outlet,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { LoginPage } from "@/features/auth/pages/Login";
import { RegisterPage } from "@/features/auth/pages/Register";
import { useAuthStore } from "@/features/auth/store/auth";
import { CharacterCreatePage } from "@/features/characters/pages/CharacterCreate";
import { CharacterEditPage } from "@/features/characters/pages/CharacterEdit";
import { CharacterListPage } from "@/features/characters/pages/CharacterList";
import { CharacterViewPage } from "@/features/characters/pages/CharacterView";
import { LoreCreatePage } from "@/features/lore/pages/LoreCreate";
import { LoreEditPage } from "@/features/lore/pages/LoreEdit";
import { LoreListPage } from "@/features/lore/pages/LoreList";
import { LoreViewPage } from "@/features/lore/pages/LoreView";

function Protected({ children }: { children: ReactNode }) {
	const user = useAuthStore((s) => s.user);
	const loc = useLocation();
	if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
	return <>{children}</>;
}

function Dashboard() {
	return (
		<div className="space-y-2 p-4">
			<h1 className="text-xl font-semibold">Dashboard</h1>
			<p className="text-sm text-muted-foreground">
				Welcome to OpenLore. Start by creating a character or adding lore.
			</p>
		</div>
	);
}

function ChatPage() {
	return (
		<div className="p-4">
			<h1 className="text-xl font-semibold">Chat (MVP stub)</h1>
			<p className="text-sm text-muted-foreground">
				Hook up your LLM provider later. This page will render a chat UI and
				integrate your RAG pipeline.
			</p>
		</div>
	);
}

export function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				<Route
					path="/app"
					element={
						<Protected>
							<AppShell />
						</Protected>
					}
				>
					<Route index element={<Dashboard />} />
					<Route path="chat" element={<ChatPage />} />

					<Route path="lore" element={<LoreListPage />} />
					<Route path="lore/new" element={<LoreCreatePage />} />
					<Route path="lore/:id" element={<LoreViewPage />} />
					<Route path="lore/:id/edit" element={<LoreEditPage />} />

					<Route path="characters" element={<CharacterListPage />} />
					<Route path="characters/new" element={<CharacterCreatePage />} />
					<Route path="characters/:id" element={<CharacterViewPage />} />
					<Route path="characters/:id/edit" element={<CharacterEditPage />} />
				</Route>

				<Route path="*" element={<Navigate to="/app" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

import type { ReactNode } from "react";
import { useEffect } from "react";
import {
	BrowserRouter,
	Navigate,
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

function AuthInitializer({ children }: { children: ReactNode }) {
	const { checkAuth, isInitialized } = useAuthStore();

	useEffect(() => {
		// Check authentication status on app startup
		if (!isInitialized) {
			checkAuth();
		}
	}, [checkAuth, isInitialized]);

	return <>{children}</>;
}

function LoadingSpinner() {
	return (
		<div className="flex min-h-dvh items-center justify-center">
			<div className="flex items-center gap-2">
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		</div>
	);
}

function Protected({ children }: { children: ReactNode }) {
	const { token, isLoading, isInitialized } = useAuthStore();
	const location = useLocation();

	console.log("token", token);
	console.log("isLoading", isLoading);
	console.log("isInitialized", isInitialized);

	// Show loading state while checking auth or during initialization
	if (!isInitialized || isLoading) {
		return <LoadingSpinner />;
	}

	// Redirect to login if not authenticated
	if (!token) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
	const { token, isLoading, isInitialized } = useAuthStore();

	// Show loading state while checking auth
	if (!isInitialized || isLoading) {
		return <LoadingSpinner />;
	}

	// Redirect to app if already authenticated
	if (token) {
		return <Navigate to="/app" replace />;
	}

	return <>{children}</>;
}

function Dashboard() {
	const user = useAuthStore((s) => s.user);

	return (
		<div className="space-y-2 p-4">
			<h1 className="text-xl font-semibold">Welcome back, {user?.name}!</h1>
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
			<AuthInitializer>
				<Routes>
					{/* Public routes - redirect to /app if authenticated */}
					<Route
						path="/login"
						element={
							<PublicOnly>
								<LoginPage />
							</PublicOnly>
						}
					/>
					<Route
						path="/register"
						element={
							<PublicOnly>
								<RegisterPage />
							</PublicOnly>
						}
					/>

					{/* Protected routes - require authentication */}
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

					{/* Redirect root to /app */}
					<Route path="/" element={<Navigate to="/app" replace />} />
					<Route path="*" element={<Navigate to="/app" replace />} />
				</Routes>
			</AuthInitializer>
		</BrowserRouter>
	);
}

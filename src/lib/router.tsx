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
import { useAuthStore } from "@/features/auth/store";
import { CharacterCreatePage } from "@/features/characters/pages/CharacterCreate";
import { CharacterEditPage } from "@/features/characters/pages/CharacterEdit";
import { CharacterListPage } from "@/features/characters/pages/CharacterList";
import { CharacterViewPage } from "@/features/characters/pages/CharacterView";
import { LoreCreatePage } from "@/features/lore/pages/LoreCreate";
import { LoreEditPage } from "@/features/lore/pages/LoreEdit";
import { LoreListPage } from "@/features/lore/pages/LoreList";
import { LoreViewPage } from "@/features/lore/pages/LoreView";
import { ChatPage } from "@/features/writing/pages/ChatPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";

function AuthInit({ children }: { children: ReactNode }) {
  const { checkAuth, isInitialized } = useAuthStore();
  useEffect(() => {
    if (!isInitialized) checkAuth();
  }, [checkAuth, isInitialized]);
  return <>{children}</>;
}

function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function Protected({ children }: { children: ReactNode }) {
  const { user, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();
  if (!isInitialized || isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, isLoading, isInitialized } = useAuthStore();
  if (!isInitialized || isLoading) return <Loading />;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-2">Welcome to F-Lore</h1>
      <p className="text-muted-foreground">
        Start by creating a character or adding lore.
      </p>
    </div>
  );
}

const isRegistrationEnabled =
  import.meta.env.VITE_REGISTRATION_ENABLED === "true";
export { isRegistrationEnabled };

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthInit>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          {isRegistrationEnabled && (
            <Route
              path="/register"
              element={
                <PublicOnly>
                  <RegisterPage />
                </PublicOnly>
              }
            />
          )}
          <Route
            path="/app"
            element={
              <Protected>
                <AppShell />
              </Protected>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="write" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
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
      </AuthInit>
    </BrowserRouter>
  );
}

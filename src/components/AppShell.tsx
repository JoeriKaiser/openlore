import { Book, Bot, Home, LogOut, UsersRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

const nav = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/lore", label: "Lore", icon: Book },
  { to: "/app/characters", label: "Characters", icon: UsersRound },
  { to: "/app/chat", label: "Chat", icon: Bot },
];

export function AppShell() {
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] md:grid-rows-1 md:grid-cols-[220px_1fr]">
      <aside className="hidden border-r md:block">
        <div className="sticky top-0 flex h-dvh flex-col p-4">
          <div className="mb-6 text-lg font-semibold">OpenLore</div>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((n) => {
              const Icon = n.icon;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/app"}
                  className={({ isActive }) =>
                    ["flex items-center gap-3 rounded-md px-3 py-2 text-sm", isActive ? "bg-secondary/60 font-medium" : "hover:bg-secondary/40"].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{n.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-4 grid gap-2">
            <div className="text-xs text-muted-foreground">
              {user?.name && (
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                </div>
              )}
            </div>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} disabled={isLoading} className="justify-start gap-2">
              <LogOut className="h-4 w-4" />
              {isLoading ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
        <div className="font-semibold">OpenLore</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" variant="outline" onClick={handleLogout} disabled={isLoading} className="gap-2">
            <LogOut className="h-4 w-4" />
            {isLoading ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </header>

      <main className="min-w-0">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-10 grid grid-cols-4 border-t bg-background md:hidden">
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/app"}
              className={({ isActive }) => ["flex flex-col items-center gap-1 p-2 text-xs", isActive ? "text-primary" : "text-muted-foreground"].join(" ")}
            >
              <Icon className="h-5 w-5" />
              {n.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

import { Book, Bot, Home, LogOut, Settings, UsersRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

const navigation = [
	{ to: "/app", label: "Dashboard", icon: Home },
	{ to: "/app/lore", label: "Lore", icon: Book },
	{ to: "/app/characters", label: "Characters", icon: UsersRound },
	{ to: "/app/chat", label: "Chat", icon: Bot },
	{ to: "/app/settings", label: "Settings", icon: Settings },
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
		<div className="flex min-h-screen bg-background">
			<aside className="hidden w-64 border-r bg-card lg:block">
				<div className="flex h-full flex-col">
					<div className="flex h-16 items-center border-b px-6">
						<div className="text-lg font-semibold">OpenLore</div>
					</div>
					<nav className="flex-1 space-y-1 p-4">
						{navigation.map((item) => {
							const Icon = item.icon;
							return (
								<NavLink
									key={item.to}
									to={item.to}
									end={item.to === "/app"}
									className={({ isActive }) =>
										`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
											isActive
												? "bg-primary text-primary-foreground"
												: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
										}`
									}
								>
									<Icon className="h-4 w-4" />
									<span>{item.label}</span>
								</NavLink>
							);
						})}
					</nav>
					<div className="border-t p-4">
						<div className="mb-4 space-y-1">
							{user?.name && (
								<div className="text-xs">
									<div className="font-medium truncate">{user.name}</div>
									<div className="text-muted-foreground truncate">
										{user.email}
									</div>
								</div>
							)}
						</div>
						<div className="space-y-2">
							<ThemeToggle />
							<Button
								variant="outline"
								onClick={handleLogout}
								disabled={isLoading}
								className="w-full justify-start gap-2"
							>
								<LogOut className="h-4 w-4" />
								{isLoading ? "Signing out..." : "Sign out"}
							</Button>
						</div>
					</div>
				</div>
			</aside>
			<header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
				<div className="font-semibold">OpenLore</div>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<Button
						size="sm"
						variant="outline"
						onClick={handleLogout}
						disabled={isLoading}
					>
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</header>
			<main className="flex-1 lg:ml-0">
				<div className="min-h-screen p-4 md:p-6 lg:p-8">
					<Outlet />
				</div>
			</main>
			<nav className="fixed bottom-0 z-40 grid w-full grid-cols-5 border-t bg-background lg:hidden">
				{navigation.map((item) => {
					const Icon = item.icon;
					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.to === "/app"}
							className={({ isActive }) =>
								`flex flex-col items-center gap-1 p-3 text-xs transition-colors ${
									isActive
										? "text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`
							}
						>
							<Icon className="h-5 w-5" />
							{item.label}
						</NavLink>
					);
				})}
			</nav>
		</div>
	);
}

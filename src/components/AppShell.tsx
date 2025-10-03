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
			{/* Mobile Header - visible by default, hidden on large screens */}
			<header className="fixed top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background px-4 lg:hidden">
				<div className="text-base font-semibold">OpenLore</div>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<Button
						size="sm"
						variant="outline"
						onClick={handleLogout}
						disabled={isLoading}
						className="h-9 w-9 p-0"
					>
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</header>

			{/* Desktop Sidebar - hidden by default, visible on large screens */}
			<aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
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
					{user?.name && (
						<div className="mb-4 space-y-1 text-xs">
							<div className="truncate font-medium">{user.name}</div>
							<div className="truncate text-muted-foreground">{user.email}</div>
						</div>
					)}
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
			</aside>

			{/* Main Content - mobile-first spacing */}
			<main className="w-full pb-16 pt-14 lg:flex-1 lg:pb-0 lg:pt-0">
				<div className="min-h-screen p-4 md:p-6 lg:p-8">
					<Outlet />
				</div>
			</main>

			{/* Mobile Bottom Navigation - visible by default, hidden on large screens */}
			<nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t bg-background lg:hidden">
				{navigation.map((item) => {
					const Icon = item.icon;
					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.to === "/app"}
							className={({ isActive }) =>
								`flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
									isActive
										? "text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`
							}
						>
							<Icon className="h-5 w-5" />
							<span className="text-[10px]">{item.label}</span>
						</NavLink>
					);
				})}
			</nav>
		</div>
	);
}

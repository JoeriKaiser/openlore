import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "../store/auth";

const schema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login, isLoading, error, clearError } = useAuthStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: FormValues) => {
		try {
			clearError();
			await login(values);

			// Get the intended destination or default to /app
			const from = (location.state as any)?.from?.pathname || "/app";
			navigate(from, { replace: true });
		} catch (e: any) {
			// Handle specific login errors
			const errorMessage = e.message || "Login failed";

			if (
				errorMessage.toLowerCase().includes("email") ||
				errorMessage.toLowerCase().includes("not found")
			) {
				setError("email", { message: "No account found with this email" });
			} else if (
				errorMessage.toLowerCase().includes("password") ||
				errorMessage.toLowerCase().includes("invalid")
			) {
				setError("password", { message: "Incorrect password" });
			}
			// If it's a generic error, it will be shown in the error state from the store
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-sm">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Welcome back</CardTitle>
						<p className="text-sm text-muted-foreground">
							Sign in to your OpenLore account
						</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="Enter your email"
									{...register("email")}
									disabled={isLoading}
									aria-invalid={!!errors.email}
								/>
								{errors.email && (
									<p className="text-sm text-destructive">
										{errors.email.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									{...register("password")}
									disabled={isLoading}
									aria-invalid={!!errors.password}
								/>
								{errors.password && (
									<p className="text-sm text-destructive">
										{errors.password.message}
									</p>
								)}
							</div>

							{error && (
								<div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
									<p className="text-sm text-destructive">{error}</p>
								</div>
							)}

							<Button disabled={isLoading} className="w-full">
								{isLoading ? "Signing in..." : "Sign in"}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-muted-foreground">
								Don't have an account?{" "}
								<Link
									to="/register"
									className="font-medium text-primary underline-offset-4 hover:underline"
								>
									Create one
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

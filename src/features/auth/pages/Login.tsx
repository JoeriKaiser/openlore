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
	email: z.string().email(),
	password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
	const navigate = useNavigate();
	const loc = useLocation();
	const login = useAuthStore((s) => s.login);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({ resolver: zodResolver(schema) });

	const onSubmit = async (v: FormValues) => {
		try {
			await login(v);
			const to = (loc.state as any)?.from?.pathname || "/app";
			navigate(to, { replace: true });
		} catch (e: any) {
			alert(e.message || "Login failed");
		}
	};

	return (
		<div className="mx-auto max-w-sm p-4">
			<Card>
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
						<div>
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" {...register("email")} />
							{errors.email && (
								<p className="text-xs text-red-600">{errors.email.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" {...register("password")} />
							{errors.password && (
								<p className="text-xs text-red-600">
									{errors.password.message}
								</p>
							)}
						</div>
						<Button disabled={isSubmitting} className="w-full">
							{isSubmitting ? "Signing in..." : "Sign in"}
						</Button>
					</form>
					<p className="mt-3 text-center text-sm text-muted-foreground">
						No account?{" "}
						<Link className="text-primary underline" to="/register">
							Register
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

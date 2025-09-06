import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "../store/auth";

const schema = z.object({
	email: z.string().email(),
	username: z.string().min(2).max(24),
	password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
	const navigate = useNavigate();
	const registerUser = useAuthStore((s) => s.register);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({ resolver: zodResolver(schema) });

	const onSubmit = async (v: FormValues) => {
		try {
			await registerUser(v);
			navigate("/app", { replace: true });
		} catch (e: any) {
			alert(e.message || "Registration failed");
		}
	};

	return (
		<div className="mx-auto max-w-sm p-4">
			<Card>
				<CardHeader>
					<CardTitle>Create account</CardTitle>
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
							<Label htmlFor="username">Username</Label>
							<Input id="username" {...register("username")} />
							{errors.username && (
								<p className="text-xs text-red-600">
									{errors.username.message}
								</p>
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
							{isSubmitting ? "Creating..." : "Create account"}
						</Button>
					</form>
					<p className="mt-3 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link className="text-primary underline" to="/login">
							Sign in
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

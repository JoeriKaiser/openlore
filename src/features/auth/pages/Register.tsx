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
	email: z.string().email("Please enter a valid email address"),
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be less than 50 characters"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
	const navigate = useNavigate();
	const {
		register: registerUser,
		isLoading,
		error,
		clearError,
	} = useAuthStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { email: "", name: "", password: "" },
	});

	const onSubmit = async (values: FormValues) => {
		try {
			clearError();
			await registerUser({
				email: values.email,
				name: values.name,
				password: values.password,
			});
			navigate("/app", { replace: true });
		} catch (e: any) {
			if (e.message?.includes("email")) {
				setError("email", { message: "This email is already registered" });
			} else {
				alert(e.message || "Registration failed");
			}
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
							<Input
								id="email"
								type="email"
								{...register("email")}
								disabled={isLoading}
							/>
							{errors.email && (
								<p className="text-xs text-red-600">{errors.email.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="name">Name</Label>
							<Input id="name" {...register("name")} disabled={isLoading} />
							{errors.name && (
								<p className="text-xs text-red-600">{errors.name.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								{...register("password")}
								disabled={isLoading}
							/>
							{errors.password && (
								<p className="text-xs text-red-600">
									{errors.password.message}
								</p>
							)}
						</div>
						{error && (
							<div className="rounded-md bg-red-50 p-3">
								<p className="text-xs text-red-600">{error}</p>
							</div>
						)}
						<Button disabled={isLoading} className="w-full">
							{isLoading ? "Creating account..." : "Create account"}
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

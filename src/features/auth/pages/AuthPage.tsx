import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useForm, FormProvider, type SubmitHandler, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthStore } from "../store";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "../schemas";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signIn, isLoading, clearError } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const handleLogin: SubmitHandler<LoginFormData> = async (data) => {
    clearError();
    try {
      await signIn(data.email, data.password);
      toast.success("Signed in successfully!");
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/app";
      navigate(from, { replace: true });
    } catch (error) {
      toast.error((error as Error)?.message || "Sign in failed");
    }
  };

  const handleRegister: SubmitHandler<RegisterFormData> = async (data) => {
    clearError();
    try {
      await signUp(data.email, data.password, data.name || "Anonymous");
      toast.success("Account created successfully!");
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/app";
      navigate(from, { replace: true });
    } catch (error) {
      toast.error((error as Error)?.message || "Registration failed");
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
    if (isSignUp) {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isSignUp
              ? "Sign up to start building your lore"
              : "Sign in to continue to OpenLore"}
          </p>
        </CardHeader>
        <CardContent>
          {isSignUp ? (
            <FormProvider {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="space-y-4"
              >
                <AuthFormField
                  form={registerForm}
                  name="name"
                  label="Name (optional)"
                  placeholder="Your name"
                  type="text"
                />
                <AuthFormField
                  form={registerForm}
                  name="email"
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                />
                <AuthFormField
                  form={registerForm}
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Please wait..." : "Create Account"}
                </Button>
              </form>
            </FormProvider>
          ) : (
            <FormProvider {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <AuthFormField
                  form={loginForm}
                  name="email"
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                />
                <AuthFormField
                  form={loginForm}
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Please wait..." : "Sign In"}
                </Button>
              </form>
            </FormProvider>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {isSignUp ? "Already have an account?" : "New to OpenLore?"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={toggleMode}
            disabled={isLoading}
          >
            {isSignUp ? "Sign In Instead" : "Create Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface AuthFormFieldProps<T extends Record<string, unknown>> {
  form: ReturnType<typeof useForm<T>>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
}

function AuthFormField<T extends Record<string, unknown>>({
  form,
  name,
  label,
  placeholder,
  type = "text",
}: AuthFormFieldProps<T>) {
  const { formState } = form;
  const fieldState = formState.errors[name];

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      {type === "password" ? (
        <PasswordInput
          placeholder={placeholder}
          disabled={formState.isSubmitting}
          error={!!fieldState}
          {...form.register(name)}
        />
      ) : (
        <Input
          type={type}
          placeholder={placeholder}
          disabled={formState.isSubmitting}
          error={!!fieldState}
          {...form.register(name)}
        />
      )}
      <FormMessage />
    </FormItem>
  );
}

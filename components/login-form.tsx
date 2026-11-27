"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FieldError, FormError } from "@/components/form-errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const errorId = "login-error";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const router = useRouter();

  const handleLogin = async (values: LoginFormValues) => {
    const supabase = createClient();
    setServerError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      setServerError(
        error instanceof Error ? error.message : "An error occurred",
      );
      setFocus("email");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            Login
          </h1>
          <CardDescription>
            Enter your email to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(handleLogin)}
            noValidate
            aria-busy={isSubmitting || undefined}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="m@example.com"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={
                    errors.email ? "email-error" : serverError ? errorId : undefined
                  }
                  {...register("email")}
                />
                <FieldError id="email-error" message={errors.email?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={
                    errors.password
                      ? "password-error"
                      : serverError
                        ? errorId
                        : undefined
                  }
                  {...register("password")}
                />
                <FieldError
                  id="password-error"
                  message={errors.password?.message}
                />
              </div>
              <FormError id={errorId} message={serverError} />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in…" : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
            <div className="mt-2 text-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { RetailerAuthShell } from "@/components/retailer/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { FormCheckbox } from "@/components/ui/form-checkbox";
import { retailerLoginSchema, type LoginValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export default function RetailerLoginPage() {
  return (
    <Suspense fallback={null}>
      <RetailerLoginForm />
    </Suspense>
  );
}

function RetailerLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginRetailer = useAuthStore((s) => s.loginRetailer);
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(retailerLoginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      await loginRetailer(values.email, values.password);
      toast({ title: "Welcome back", description: "Signed in to the Retailer Portal.", variant: "success" });
      router.push(searchParams.get("from") || "/retailer/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("password", { message: "Incorrect email or password" });
      } else {
        toast({ title: "Couldn't sign in — try again", variant: "error" });
      }
    }
  };

  return (
    <RetailerAuthShell
      headline={
        <>
          Manage your store. <span className="text-gold-400">Grow your business.</span> Reach millions of saree
          lovers.
        </>
      }
      pitch="Connect directly with authentic weavers, digitize your inventory, process wholesale orders, and scale your brand nationwide through India's premier Ilkal textile network."
      showStats={false}
    >
      <div className="flex flex-col gap-8 rounded-lg bg-white p-10 shadow-card lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-4xl text-primary-600">Welcome Back</h2>
          <p className="text-[15px] text-ink-700">Sign in to manage your inventory, check payouts, and fulfill orders.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <Label htmlFor="email" required>
              Registered Email or Mobile
            </Label>
            <Input id="email" placeholder="e.g. seller@kaushaya.com" icon={<Mail className="size-[18px]" />} error={errors.email?.message} {...register("email")} />
          </div>
          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock className="size-[18px]" />}
              trailing={
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              }
              error={errors.password?.message}
              {...register("password")}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-ink-900">
              <FormCheckbox control={control} name="remember" /> Remember me
            </label>
            <Link href="/retailer/forgot-password" className="text-[13px] font-semibold text-primary-600">
              Forgot Password?
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full">
              {isSubmitting ? "Signing in…" : "Sign In to Portal"}
            </Button>
            {/* Google sign-in is disabled until a real OAuth app is wired up
                on the backend — this button had no handler and silently did
                nothing. */}
          </div>
        </form>

        <p className="text-sm text-ink-700">
          New to Kaushaya?{" "}
          <Link href="/retailer/register" className="font-semibold text-primary-600">
            Create Retailer Account →
          </Link>
        </p>
      </div>
    </RetailerAuthShell>
  );
}

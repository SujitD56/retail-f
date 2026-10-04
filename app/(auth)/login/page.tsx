"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { AuthSplitCard } from "@/components/customer/auth-split-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { FormCheckbox } from "@/components/ui/form-checkbox";
import { GoogleGlyph } from "@/components/ui/social-glyphs";
import { Phone } from "lucide-react";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginCustomer = useAuthStore((s) => s.loginCustomer);
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      await loginCustomer(values.email, values.password);
      // Merge whatever was in the guest cart/wishlist into the account.
      await Promise.all([useCartStore.getState().syncToServer(), useWishlistStore.getState().syncToServer()]);
      toast({ title: "Welcome back", description: "You're signed in to Ilkal Threads.", variant: "success" });
      router.push("/account");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("password", { message: "Incorrect email or password" });
      } else {
        toast({ title: "Couldn't sign in — try again", variant: "error" });
      }
    }
  };

  return (
    <AuthSplitCard
      imageSrc="/images/shared/auth-side-banner.png"
      eyebrow="Preserving Heritage"
      heading="Woven with pride, worn with elegance"
      description="Support verified weaver cooperatives from the historic town of Ilkal, Karnataka."
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[32px] text-primary-600">Welcome Back</h1>
        <p className="text-sm text-ink-700">Sign in to your Ilkal Threads account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register("email")} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[13px] font-semibold text-gold-400">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            trailing={showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {...register("password")}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <FormCheckbox control={control} name="remember" />
            Remember me
          </label>
          <Link href="#" className="text-sm font-medium text-primary-600">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in…" : "Sign In"}
        </Button>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-cream-300" />
          <span className="text-xs uppercase text-ink-500">or continue with</span>
          <span className="h-px flex-1 bg-cream-300" />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1">
            <GoogleGlyph className="size-4" /> Google
          </Button>
          <Button type="button" variant="secondary" className="flex-1">
            <Phone className="size-4" /> Phone OTP
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-ink-700">
        New to Ilkal Threads?{" "}
        <Link href="/signup" className="font-semibold text-primary-600">
          Create an account
        </Link>
      </p>
    </AuthSplitCard>
  );
}



"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Lock, User } from "lucide-react";
import { AdminSecureShell, SecurityNotice } from "@/components/admin/secure-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { FormCheckbox } from "@/components/ui/form-checkbox";
import { adminLoginSchema } from "@/lib/validations/auth";
import type { LoginValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { ADMIN_MFA_TOKEN_KEY } from "@/lib/admin-mfa-session";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginAdmin = useAuthStore((s) => s.loginAdmin);
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(adminLoginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      const result = await loginAdmin(values.email, values.password);
      if (result.mfaRequired && result.mfaToken) {
        sessionStorage.setItem(ADMIN_MFA_TOKEN_KEY, result.mfaToken);
        router.push("/admin/mfa");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("password", { message: "Incorrect email or password" });
      } else {
        toast({ title: "Couldn't sign in — try again", variant: "error" });
      }
    }
  };

  return (
    <AdminSecureShell badge="Secure Admin Portal">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-white">Administrator Sign In</h1>
        <p className="mt-1.5 text-sm text-secure-500">Sign in with verified hardware-bound credentials</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="adminEmail" required className="text-white">
            Administrator Username / Email
          </Label>
          <Input
            id="adminEmail"
            icon={<User className="size-4" />}
            className="border-secure-700 bg-secure-800 text-white placeholder:text-secure-500"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
        <div>
          <Label htmlFor="adminPassword" required className="text-white">
            Security Password
          </Label>
          <Input
            id="adminPassword"
            type={showPassword ? "text" : "password"}
            icon={<Lock className="size-4" />}
            trailing={
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            className="border-secure-700 bg-secure-800 text-white placeholder:text-secure-500"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-secure-500">
            <FormCheckbox control={control} name="remember" /> Remember this workstation
          </label>
          <Link href="#" className="font-medium text-secure-accent">
            IT Help Desk
          </Link>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 h-12 w-full">
          {isSubmitting ? "Authenticating…" : "Authenticate & Proceed"}
        </Button>
      </form>

      <SecurityNotice text="Authorized personnel only. All access, events, and active sessions are monitored and logged." />

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-secure-500">
        <CheckCircle2 className="size-3.5" /> Real credential + TOTP MFA check against the Kaushaya API.
      </p>
    </AdminSecureShell>
  );
}

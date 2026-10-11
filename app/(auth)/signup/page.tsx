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
import { signupSchema, type SignupValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABEL = ["Very weak", "Weak", "Fair", "Good", "Strong"];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema), defaultValues: { agreeToTerms: false } });

  const strength = passwordStrength(password);

  const onSubmit = async (values: SignupValues) => {
    try {
      await signup(values.fullName, values.email, values.password, values.phone);
      await Promise.all([useCartStore.getState().syncToServer(), useWishlistStore.getState().syncToServer()]);
      toast({ title: "Account created", description: `Welcome to Kaushaya, ${values.fullName.split(" ")[0]}!`, variant: "success" });
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        if (err.message.includes("phone")) setError("phone", { message: err.message });
        else setError("email", { message: err.message });
      } else {
        toast({ title: "Couldn't create your account — try again", variant: "error" });
      }
    }
  };

  return (
    <AuthSplitCard
      imageSrc="/images/shared/signup-side-banner.png"
      eyebrow="Empowering Artisans"
      heading="A thread that binds us to our roots"
      description="By bypassing middlemen, we ensure that local weaver households earn stable livelihood wages."
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[32px] text-primary-600">Join Kaushaya</h1>
        <p className="text-[13px] text-ink-700">Discover authentic Ilkal sarees from trusted retailers</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <Label htmlFor="fullName" className="text-xs">
            Full Name
          </Label>
          <Input id="fullName" placeholder="Priya Sharma" error={errors.fullName?.message} {...register("fullName")} />
        </div>
        <div>
          <Label htmlFor="email" className="text-xs">
            Email Address
          </Label>
          <Input id="email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register("email")} />
        </div>
        <div>
          <Label htmlFor="phone" className="text-xs">
            Phone Number
          </Label>
          <Input id="phone" type="tel" placeholder="+91 98765 43210" error={errors.phone?.message} {...register("phone")} />
        </div>
        <div>
          <Label htmlFor="password" className="text-xs">
            Password
          </Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            error={errors.password?.message}
            trailing={
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register("password", { onChange: (e) => setPassword(e.target.value) })}
          />
          {password && (
            <div className="flex items-center gap-1 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={cn("h-1 w-[50px] rounded-full", i < strength ? "bg-[#1e5c49]" : "bg-cream-300")}
                />
              ))}
              <span className="pl-1 text-[11px] font-medium text-[#1e5c49]">{STRENGTH_LABEL[strength]}</span>
            </div>
          )}
        </div>

        <div>
          <Input id="confirmPassword" type="password" placeholder="Confirm password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        </div>

        <label className="flex items-start gap-2 text-xs text-ink-700">
          <FormCheckbox control={control} name="agreeToTerms" className="mt-0.5" />
          <span>
            I agree to the <span className="text-primary-600 underline">Terms of Service</span> and{" "}
            <span className="text-primary-600 underline">Privacy Policy</span>
          </span>
        </label>
        {errors.agreeToTerms && <p className="text-xs text-danger-500">{errors.agreeToTerms.message}</p>}

        <Button type="submit" disabled={isSubmitting} className="mt-1 h-11 w-full">
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>

        {/* Google sign-up and Phone OTP are disabled until a real OAuth app
            and SMS provider are wired up on the backend — these buttons had
            no handler at all and silently did nothing. */}
      </form>

      <div className="flex flex-col items-center gap-2 text-[13px]">
        <p className="text-ink-700">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary-600">
            Sign In
          </Link>
        </p>
        <Link href="/retailer/register" className="font-semibold text-gold-400">
          Are you a retailer? Join as a Retailer →
        </Link>
      </div>
    </AuthSplitCard>
  );
}

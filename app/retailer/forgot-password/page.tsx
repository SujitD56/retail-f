"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { RetailerAuthShell } from "@/components/retailer/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function RetailerForgotPasswordPage() {
  const [stage, setStage] = useState<"request" | "otp">("request");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  return (
    <RetailerAuthShell tagBadge="RECOVER ACCESS" headline={<>Reset Your Password. <span className="text-gold-400">Secure &amp; seamless</span> access to your business.</>} pitch="Join the trusted marketplace. Our transparent billing cycle ensures your payments are deposited securely into your verified account without delay." showStats={false}>
      <div className="flex flex-col gap-6 rounded-lg bg-white p-10 shadow-card lg:bg-transparent lg:p-0 lg:shadow-none">
        <div>
          <h1 className="font-display text-4xl text-primary-600">Reset Your Password</h1>
          <p className="mt-2 text-sm text-ink-700">
            Enter your registered email or mobile number below. We will send you an OTP to verify your identity.
          </p>
        </div>

        {stage === "request" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!contact) return;
              setStage("otp");
              toast({ title: "OTP sent", description: `Check ${contact} for your verification code.` });
            }}
            className="flex flex-col gap-5"
          >
            <div>
              <Label htmlFor="contact" required>
                Registered Email or Mobile
              </Label>
              <Input id="contact" icon={<Mail className="size-[18px]" />} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="seller@kaushaya.com" />
            </div>
            <Button type="submit" size="lg" className="h-11 w-full">
              Send OTP
            </Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast({ title: "Identity verified", description: "You can now set a new password.", variant: "success" });
              router.push("/retailer/login");
            }}
            className="flex flex-col gap-6"
          >
            <div>
              <Label>Enter 6-Digit OTP</Label>
              <div className="flex gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const next = [...otp];
                      next[i] = val;
                      setOtp(next);
                      if (val && i < 5) otpRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                    className="h-14 w-14 rounded-md border border-cream-300 bg-cream-100 text-center font-display text-2xl text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-1.5 text-ink-700">
                <span className="size-2 rounded-full bg-success-500" /> OTP sent to {contact || "your contact"}
              </span>
              <button type="button" className="font-semibold text-primary-600">
                Resend OTP
              </button>
            </div>
            <Button type="submit" size="lg" className="h-12 w-full" disabled={otp.some((d) => !d)}>
              Verify OTP →
            </Button>
            <Link href="/retailer/login" className="text-center text-sm font-semibold text-primary-600">
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </RetailerAuthShell>
  );
}

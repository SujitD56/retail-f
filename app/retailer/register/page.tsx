"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
import { RetailerAuthShell } from "@/components/retailer/auth-shell";
import { FileUploadBox } from "@/components/retailer/file-upload-box";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FormCheckbox } from "@/components/ui/form-checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  regStep1Schema, type RegStep1Values,
  regStep2Schema, type RegStep2Values,
  regStep3Schema, type RegStep3Values,
  regStep5Schema, type RegStep5Values,
} from "@/lib/validations/retailer-registration";
import { useAuthStore } from "@/lib/store/auth";
import { useToast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api/client";

const STEP_META = [
  { label: "Personal Information", title: "Create Your Retailer Account", description: "Start your business journey with us. Enter your primary contact details." },
  { label: "Store Information", title: "Set Up Your Digital Storefront", description: "This information will be displayed to your wholesale buyers and customers on the portal." },
  { label: "Business Details", title: "Verify Your Business Entity", description: "Enter government-registered parameters to secure wholesale verification status." },
  { label: "Verification Documents", title: "Document Upload", description: "Provide government-certified proofs to complete authentication and start listing items." },
  { label: "Bank & Payout Details", title: "Bank & Payout Details", description: "Specify the bank account where you wish to receive wholesale payouts." },
];

const CATEGORIES = ["Traditional Ilkal", "Contemporary Ilkal", "Wedding Saree", "Festive Saree", "Cotton Ilkal", "Silk Cotton"];
const STATES = ["Karnataka", "Maharashtra", "Tamil Nadu", "Telangana", "Andhra Pradesh"];
const REG_TYPES = ["Sole Proprietorship", "Partnership Firm", "Private Limited Company", "LLP", "Weaver Cooperative Society"];
const YEARS_OPTIONS = ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
const REVENUE_OPTIONS = ["Under ₹1 Lakh", "₹1-5 Lakhs", "₹5-15 Lakhs", "₹15-50 Lakhs", "₹50 Lakhs+"];
const PAYOUT_CYCLES = ["Weekly (Every Wednesday)", "Bi-weekly", "Monthly"];

export default function RetailerRegisterPage() {
  const [step, setStep] = useState(1);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const step1 = useForm<RegStep1Values>({ resolver: zodResolver(regStep1Schema), defaultValues: { agreeToTerms: false } });
  const step2 = useForm<RegStep2Values>({ resolver: zodResolver(regStep2Schema) });
  const step3 = useForm<RegStep3Values>({ resolver: zodResolver(regStep3Schema) });
  const step5 = useForm<RegStep5Values>({ resolver: zodResolver(regStep5Schema), defaultValues: { accountType: "savings" } });

  const meta = STEP_META[step - 1]!;
  const progress = (step / 5) * 100;

  const continueFromStep1 = async (values: RegStep1Values) => {
    setCheckingEmail(true);
    try {
      const [{ available: emailAvailable }, { available: phoneAvailable }] = await Promise.all([
        api.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(values.email)}`),
        api.get<{ available: boolean }>(`/auth/check-phone?phone=${encodeURIComponent(values.mobile)}`),
      ]);
      let blocked = false;
      if (!emailAvailable) {
        step1.setError("email", { message: "An account with this email already exists" });
        blocked = true;
      }
      if (!phoneAvailable) {
        step1.setError("mobile", { message: "An account with this phone number already exists" });
        blocked = true;
      }
      if (!blocked) setStep(2);
    } catch {
      // Availability check failed (e.g. transient network hiccup) — don't
      // block registration over it; the final submit still catches a real
      // duplicate email/phone via the same CONFLICT check the backend always runs.
      setStep(2);
    } finally {
      setCheckingEmail(false);
    }
  };

  const submitRegistration = async (values5: RegStep5Values) => {
    setSubmitting(true);
    try {
      const v1 = step1.getValues();
      const v2 = step2.getValues();
      const v3 = step3.getValues();
      await api.post("/retailers/register", {
        fullName: v1.fullName,
        email: v1.email,
        mobile: v1.mobile,
        password: v1.password,
        storeName: v2.storeName,
        storeDescription: v2.storeDescription,
        primaryCategory: v2.primaryCategory,
        city: v2.city,
        state: v2.state,
        pincode: v2.pincode,
        registrationType: v3.registrationType,
        gstin: v3.gstin || undefined,
        gstExempt: v3.gstExempt,
        pan: v3.pan,
        registeredAddress: v3.registeredAddress,
        yearsInBusiness: v3.yearsInBusiness,
        monthlyRevenue: v3.monthlyRevenue,
        documentUrls,
        accountHolderName: values5.accountHolderName,
        bankName: values5.bankName,
        accountNumber: values5.accountNumber,
        ifsc: values5.ifsc,
        accountType: values5.accountType,
        upi: values5.upi || undefined,
        payoutCycle: values5.payoutCycle,
      });
      await useAuthStore.getState().fetchMe();
      router.push("/retailer/register/submitted");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({ title: "An account with this email already exists", variant: "error" });
        setStep(1);
      } else {
        toast({ title: "Couldn't submit your application — please review your details and try again", variant: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RetailerAuthShell tagBadge={step === 5 ? "STEP 5 OF 5" : "B2B SELLER NETWORK"} headline={step === 5 ? <>Bank &amp; Payout Details. <span className="text-gold-400">Secure &amp; seamless payments</span> directly to your business.</> : <>Manage your store. <span className="text-gold-400">Grow your business.</span> Reach millions of saree lovers.</>} pitch={step === 5 ? "Join the trusted marketplace. Our transparent billing cycle ensures your payments are deposited securely into your verified account without delay." : "Connect directly with authentic weavers, digitize your inventory, process wholesale orders, and scale your brand nationwide through India's premier Ilkal textile network."} showStats={false}>
      <div className="flex flex-col gap-6 rounded-lg bg-white p-10 shadow-card lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[13px] text-ink-700">
            <span>Step {step} of 5</span>
            <span className="font-semibold text-primary-600">{meta.label}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-300">
            <div className="h-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl text-primary-600">{meta.title}</h1>
          <p className="mt-1.5 text-sm text-ink-700">{meta.description}</p>
        </div>

        {step === 1 && (
          <form onSubmit={step1.handleSubmit(continueFromStep1)} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="fullName" required>Full Name</Label>
              <Input id="fullName" icon={<User className="size-[18px]" />} error={step1.formState.errors.fullName?.message} {...step1.register("fullName")} />
            </div>
            <div>
              <Label htmlFor="regEmail" required>Primary Email Address</Label>
              <Input id="regEmail" icon={<Mail className="size-[18px]" />} error={step1.formState.errors.email?.message} {...step1.register("email")} />
            </div>
            <div>
              <Label htmlFor="mobile" required>Mobile Number</Label>
              <Input id="mobile" placeholder="98765 43210" error={step1.formState.errors.mobile?.message} {...step1.register("mobile")} />
            </div>
            <div>
              <Label htmlFor="regPassword" required>Choose Password</Label>
              <Input id="regPassword" type="password" icon={<Lock className="size-[18px]" />} error={step1.formState.errors.password?.message} {...step1.register("password")} />
            </div>
            <div>
              <Label htmlFor="regConfirmPassword" required>Confirm Password</Label>
              <Input id="regConfirmPassword" type="password" icon={<Lock className="size-[18px]" />} error={step1.formState.errors.confirmPassword?.message} {...step1.register("confirmPassword")} />
            </div>
            <label className="flex items-start gap-2.5 text-sm text-ink-700">
              <FormCheckbox control={step1.control} name="agreeToTerms" className="mt-0.5" />
              I agree to the Terms of Service and Seller Agreement of Kaushaya Portal.
            </label>
            {step1.formState.errors.agreeToTerms && <p className="text-xs text-danger-500">{step1.formState.errors.agreeToTerms.message}</p>}
            <Button type="submit" size="lg" disabled={checkingEmail} className="h-12 w-full">{checkingEmail ? "Checking…" : "Continue →"}</Button>
            <p className="text-center text-sm text-ink-700">
              Already have an account? <Link href="/retailer/login" className="font-semibold text-primary-600">Sign In</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={step2.handleSubmit(() => setStep(3))} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="storeName" required>Store / Business Name</Label>
              <Input id="storeName" error={step2.formState.errors.storeName?.message} {...step2.register("storeName")} />
            </div>
            <div>
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea id="storeDescription" placeholder="Tell wholesale buyers about your heritage, design specialization, and history with Ilkal handloom sarees..." error={step2.formState.errors.storeDescription?.message} {...step2.register("storeDescription")} />
            </div>
            <div>
              <Label required>Primary Saree Category</Label>
              <Select onValueChange={(v) => step2.setValue("primaryCategory", v)}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              {step2.formState.errors.primaryCategory && <p className="mt-1.5 text-xs text-danger-500">{step2.formState.errors.primaryCategory.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city" required>City</Label>
                <Input id="city" error={step2.formState.errors.city?.message} {...step2.register("city")} />
              </div>
              <div>
                <Label required>State</Label>
                <Select onValueChange={(v) => step2.setValue("state", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pincode" required>Pincode</Label>
                <Input id="pincode" error={step2.formState.errors.pincode?.message} {...step2.register("pincode")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FileUploadBox label="Upload Logo" hint="JPEG, PNG (Max 2MB)" purpose="RETAILER_LOGO" />
              <FileUploadBox label="Upload Banner" hint="JPEG, PNG (Max 5MB)" purpose="RETAILER_COVER" />
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="secondary" size="lg" className="h-12 flex-1" onClick={() => setStep(1)}>← Back</Button>
              <Button type="submit" size="lg" className="h-12 flex-1">Continue →</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={step3.handleSubmit(() => setStep(4))} className="flex flex-col gap-5">
            <div>
              <Label required>Business Registration Type</Label>
              <Select onValueChange={(v) => step3.setValue("registrationType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{REG_TYPES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gstin">GSTIN (Goods and Services Tax Number)</Label>
              <Input id="gstin" {...step3.register("gstin")} />
              <label className="mt-2 flex items-center gap-2 text-[13px] text-ink-700">
                <FormCheckbox control={step3.control} name="gstExempt" /> I don&apos;t have a GST registration / Exempt category
              </label>
            </div>
            <div>
              <Label htmlFor="pan" required>Business PAN (Permanent Account Number)</Label>
              <Input id="pan" error={step3.formState.errors.pan?.message} {...step3.register("pan")} />
            </div>
            <div>
              <Label htmlFor="registeredAddress" required>Registered Business Address</Label>
              <Input id="registeredAddress" error={step3.formState.errors.registeredAddress?.message} {...step3.register("registeredAddress")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Years in Textile Business</Label>
                <Select onValueChange={(v) => step3.setValue("yearsInBusiness", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{YEARS_OPTIONS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label required>Approx. Monthly Revenue</Label>
                <Select onValueChange={(v) => step3.setValue("monthlyRevenue", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{REVENUE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="secondary" size="lg" className="h-12 flex-1" onClick={() => setStep(2)}>← Back</Button>
              <Button type="submit" size="lg" className="h-12 flex-1">Continue →</Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(5);
            }}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <FileUploadBox
                label="Drag & drop Business PAN"
                hint="Image, Max 4MB"
                purpose="RETAILER_DOCUMENT"
                onUploaded={(files) => setDocumentUrls((prev) => [...prev, ...files.map((f) => f.url)])}
              />
              <FileUploadBox
                label="Drag & drop Aadhaar copy"
                hint="Image, Max 4MB"
                purpose="RETAILER_DOCUMENT"
                onUploaded={(files) => setDocumentUrls((prev) => [...prev, ...files.map((f) => f.url)])}
              />
            </div>
            <FileUploadBox
              label="Upload Shop Act, Udyam, or Partnership Deed"
              hint="Accepted formats: JPEG (Max 10MB) — Optional"
              purpose="RETAILER_DOCUMENT"
              onUploaded={(files) => setDocumentUrls((prev) => [...prev, ...files.map((f) => f.url)])}
            />
            <FileUploadBox
              label="Drop high-resolution weave pattern close-ups"
              hint="Product Sample Photos (3-5 required)"
              purpose="RETAILER_DOCUMENT"
              multiple
              onUploaded={(files) => setDocumentUrls((prev) => [...prev, ...files.map((f) => f.url)])}
            />
            <div className="flex items-start gap-2 rounded-md bg-cream-100 p-4 text-xs text-ink-700">
              <Lock className="mt-0.5 size-4 shrink-0 text-primary-600" />
              All document files are stored with end-to-end industry-grade encryption and will solely be evaluated for merchant onboarding approval.
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="secondary" size="lg" className="h-12 flex-1" onClick={() => setStep(3)}>← Back</Button>
              <Button type="submit" size="lg" className="h-12 flex-1">Continue →</Button>
            </div>
          </form>
        )}

        {step === 5 && (
          <form onSubmit={step5.handleSubmit(submitRegistration)} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="accountHolderName" required>Bank Account Holder Name</Label>
              <Input id="accountHolderName" error={step5.formState.errors.accountHolderName?.message} {...step5.register("accountHolderName")} />
            </div>
            <div>
              <Label htmlFor="bankName" required>Bank Name</Label>
              <Input id="bankName" error={step5.formState.errors.bankName?.message} {...step5.register("bankName")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountNumber" required>Account Number</Label>
                <Input id="accountNumber" error={step5.formState.errors.accountNumber?.message} {...step5.register("accountNumber")} />
              </div>
              <div>
                <Label htmlFor="confirmAccountNumber" required>Confirm Account Number</Label>
                <Input id="confirmAccountNumber" error={step5.formState.errors.confirmAccountNumber?.message} {...step5.register("confirmAccountNumber")} />
              </div>
            </div>
            <div>
              <Label htmlFor="ifsc" required>IFSC Code</Label>
              <Input id="ifsc" error={step5.formState.errors.ifsc?.message} {...step5.register("ifsc")} />
            </div>
            <div>
              <Label>Account Type</Label>
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm text-ink-900">
                  <input type="radio" value="savings" className="size-4 accent-primary-600" {...step5.register("accountType")} /> Savings Account
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-900">
                  <input type="radio" value="current" className="size-4 accent-primary-600" {...step5.register("accountType")} /> Current Account
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="upi">UPI ID (Optional)</Label>
              <Input id="upi" {...step5.register("upi")} />
            </div>
            <div>
              <Label>Payout Cycle Preference</Label>
              <Select defaultValue={PAYOUT_CYCLES[0]} onValueChange={(v) => step5.setValue("payoutCycle", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYOUT_CYCLES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-cream-100 p-4 text-xs text-ink-700">
              <Lock className="size-4 shrink-0 text-primary-600" /> Your banking details are encrypted and secure. We use PCI-compliant servers.
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="secondary" size="lg" className="h-12 flex-[140]" onClick={() => setStep(4)}>← Back</Button>
              <Button type="submit" size="lg" disabled={submitting} className="h-12 flex-[436]">
                {submitting ? "Submitting…" : "Submit Registration →"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </RetailerAuthShell>
  );
}

import { z } from "zod";

export const regStep1Schema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().min(1, "Required").email("Enter a valid email"),
    mobile: z.string().refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")), "Enter a valid 10-digit mobile number"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
    agreeToTerms: z.boolean().refine((v) => v, "You must accept the Seller Agreement"),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
export type RegStep1Values = z.infer<typeof regStep1Schema>;

export const regStep2Schema = z.object({
  storeName: z.string().min(2, "Enter your store name"),
  storeDescription: z.string().min(10, "Tell buyers a little more about your store"),
  primaryCategory: z.string().min(1, "Select a category"),
  city: z.string().min(2, "Required"),
  state: z.string().min(1, "Select a state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});
export type RegStep2Values = z.infer<typeof regStep2Schema>;

export const regStep3Schema = z.object({
  registrationType: z.string().min(1, "Select a registration type"),
  gstin: z.string().optional(),
  gstExempt: z.boolean().optional(),
  pan: z.string().min(10, "Enter a valid PAN"),
  registeredAddress: z.string().min(5, "Enter the registered business address"),
  yearsInBusiness: z.string().min(1, "Select an option"),
  monthlyRevenue: z.string().min(1, "Select an option"),
});
export type RegStep3Values = z.infer<typeof regStep3Schema>;

export const regStep5Schema = z
  .object({
    accountHolderName: z.string().min(2, "Required"),
    bankName: z.string().min(2, "Required"),
    accountNumber: z.string().min(6, "Enter a valid account number"),
    confirmAccountNumber: z.string().min(1, "Required"),
    ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, "Enter a valid IFSC code"),
    accountType: z.enum(["savings", "current"]),
    upi: z.string().optional(),
    payoutCycle: z.string().min(1, "Select a payout cycle"),
  })
  .refine((d) => d.accountNumber === d.confirmAccountNumber, { message: "Account numbers do not match", path: ["confirmAccountNumber"] });
export type RegStep5Values = z.infer<typeof regStep5Schema>;

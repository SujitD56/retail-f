import { z } from "zod";

// Indian mobile number: 10 digits starting 6-9, with an optional +91/91/0
// prefix — spaces/dashes anywhere (as in the "+91 98765 43210" placeholder)
// are stripped before matching, not just right after the prefix.
const phoneSchema = z
  .string()
  .refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")), "Enter a valid 10-digit mobile number")
  .optional()
  .or(z.literal(""));

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: phoneSchema,
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    agreeToTerms: z.boolean().refine((v) => v === true, "You must agree to the Terms & Conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupValues = z.infer<typeof signupSchema>;

export const retailerLoginSchema = loginSchema;

export const adminLoginSchema = z.object({
  email: z.string().min(1, "Required").email("Enter a valid administrator email"),
  password: z.string().min(1, "Required"),
  remember: z.boolean().optional(),
});

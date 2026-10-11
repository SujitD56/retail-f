import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Enter the recipient's full name"),
  line1: z.string().min(4, "Enter a street address"),
  city: z.string().min(2, "Enter a city"),
  state: z.string().min(2, "Enter a state"),
  postalCode: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code")
    .refine((v) => !/^(\d)\1{5}$/.test(v), "Enter a valid 6-digit PIN code"),
  // Indian mobile number: 10 digits starting 6-9, with an optional +91/91/0
  // prefix — spaces/dashes anywhere are stripped before matching.
  phone: z.string().refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")), "Enter a valid 10-digit mobile number"),
});
export type AddressValues = z.infer<typeof addressSchema>;

export const deliverySchema = z.object({
  method: z.enum(["standard", "express"]),
});
export type DeliveryValues = z.infer<typeof deliverySchema>;

export const paymentSchema = z
  .object({
    method: z.enum(["upi", "card", "netbanking"]),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
    cardName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method !== "card") return;
    if (!data.cardNumber || data.cardNumber.replace(/\s/g, "").length < 12) {
      ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Enter a valid card number" });
    }
    if (!data.cardExpiry || !/^\d{2}\/\d{2}$/.test(data.cardExpiry)) {
      ctx.addIssue({ code: "custom", path: ["cardExpiry"], message: "MM/YY" });
    }
    if (!data.cardCvv || data.cardCvv.length < 3) {
      ctx.addIssue({ code: "custom", path: ["cardCvv"], message: "Invalid CVV" });
    }
    if (!data.cardName) {
      ctx.addIssue({ code: "custom", path: ["cardName"], message: "Enter the name on the card" });
    }
  });
export type PaymentValues = z.infer<typeof paymentSchema>;

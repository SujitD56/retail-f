"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";
import { useToast } from "@/components/ui/toast";
import type { User } from "@/types";

const phoneSchema = z
  .string()
  .refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")), "Enter a valid 10-digit mobile number")
  .optional()
  .or(z.literal(""));

const editProfileSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: phoneSchema,
});
type EditProfileValues = z.infer<typeof editProfileSchema>;

export function EditProfileDialog({ open, onOpenChange, user }: { open: boolean; onOpenChange: (open: boolean) => void; user: User }) {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileValues>({ resolver: zodResolver(editProfileSchema), values: { fullName: user.name, phone: user.phone ?? "" } });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              await updateProfile(values.fullName, values.phone);
              toast({ title: "Profile updated", variant: "success" });
              onOpenChange(false);
            } catch {
              toast({ title: "Couldn't update your profile — try again", variant: "error" });
            }
          })}
          className="flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="editFullName" required>Full Name</Label>
            <Input id="editFullName" error={errors.fullName?.message} {...register("fullName")} />
          </div>
          <div>
            <Label htmlFor="editPhone">Phone</Label>
            <Input id="editPhone" placeholder="+91 98765 43210" error={errors.phone?.message} {...register("phone")} />
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 w-fit">
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

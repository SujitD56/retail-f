"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { addressSchema, type AddressValues } from "@/lib/validations/checkout";

export function AddressFormDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (address: AddressValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressValues>({ resolver: zodResolver(addressSchema) });

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
          <DialogTitle>Add Address</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            onSave(values);
            reset();
            onOpenChange(false);
          })}
          className="flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="addr-fullName" required>Full Name</Label>
            <Input id="addr-fullName" placeholder="Priya Sharma" error={errors.fullName?.message} {...register("fullName")} />
          </div>
          <div>
            <Label htmlFor="addr-line1" required>Address</Label>
            <Textarea id="addr-line1" placeholder="42 MG Road" error={errors.line1?.message} {...register("line1")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="addr-city" required>City</Label>
              <Input id="addr-city" placeholder="Bangalore" error={errors.city?.message} {...register("city")} />
            </div>
            <div>
              <Label htmlFor="addr-state" required>State</Label>
              <Input id="addr-state" placeholder="Karnataka" error={errors.state?.message} {...register("state")} />
            </div>
            <div>
              <Label htmlFor="addr-postalCode" required>PIN Code</Label>
              <Input id="addr-postalCode" placeholder="560001" error={errors.postalCode?.message} {...register("postalCode")} />
            </div>
            <div>
              <Label htmlFor="addr-phone" required>Phone</Label>
              <Input id="addr-phone" placeholder="+91 98765 43210" error={errors.phone?.message} {...register("phone")} />
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-2 w-fit">
            Save Address
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

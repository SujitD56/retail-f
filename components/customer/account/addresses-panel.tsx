"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useAddressesStore } from "@/lib/store/addresses";
import { Button } from "@/components/ui/button";
import { AccountPlaceholderPanel } from "@/components/customer/account/placeholder-panel";
import { AddressFormDialog } from "@/components/customer/account/address-form-dialog";

export function AddressesPanel() {
  const addresses = useAddressesStore((s) => s.addresses);
  const addAddress = useAddressesStore((s) => s.add);
  const removeAddress = useAddressesStore((s) => s.remove);
  const setDefaultAddress = useAddressesStore((s) => s.setDefault);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (addresses.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <AccountPlaceholderPanel icon={MapPin} title="No saved addresses" description="Addresses you use at checkout will be saved here for faster future orders." />
        <Button onClick={() => setDialogOpen(true)} className="mx-auto w-fit">
          <Plus className="size-4" /> Add Address
        </Button>
        <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={addAddress} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary-600">Saved Addresses</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Add Address
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="flex flex-col gap-2 rounded-lg border border-cream-300 bg-white p-5">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink-900">{a.fullName}</p>
              {a.isDefault && (
                <span className="rounded-pill bg-primary-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Default</span>
              )}
            </div>
            <p className="text-sm text-ink-700">{a.line1}</p>
            <p className="text-sm text-ink-700">
              {a.city}, {a.state} {a.postalCode}
            </p>
            <p className="text-sm text-ink-700">{a.phone}</p>
            <div className="mt-2 flex items-center gap-4">
              {!a.isDefault && (
                <button type="button" onClick={() => setDefaultAddress(a.id)} className="text-sm font-medium text-primary-600">
                  Make Default
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAddress(a.id)}
                className="flex w-fit items-center gap-1.5 text-sm font-medium text-danger-500"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={addAddress} />
    </div>
  );
}

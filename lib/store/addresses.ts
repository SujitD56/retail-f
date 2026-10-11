"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "@/types";

export interface SavedAddress extends Address {
  id: string;
  isDefault: boolean;
}

interface AddressesState {
  addresses: SavedAddress[];
  /** Adds a new saved address, or silently skips if an identical one already exists (e.g. re-saving the same order address). The first address saved becomes the default automatically. */
  add: (address: Address) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
}

function isSameAddress(a: Address, b: Address) {
  return a.fullName === b.fullName && a.line1 === b.line1 && a.city === b.city && a.state === b.state && a.postalCode === b.postalCode && a.phone === b.phone;
}

export const useAddressesStore = create<AddressesState>()(
  persist(
    (set, get) => ({
      addresses: [],

      add: (address) => {
        if (get().addresses.some((a) => isSameAddress(a, address))) return;
        const isDefault = get().addresses.length === 0;
        set((state) => ({ addresses: [...state.addresses, { ...address, id: crypto.randomUUID(), isDefault }] }));
      },

      remove: (id) => set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) })),

      setDefault: (id) =>
        set((state) => ({ addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })) })),
    }),
    { name: "ilkal-addresses" },
  ),
);

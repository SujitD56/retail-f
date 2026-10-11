"use client";

import { useState } from "react";
import Link from "next/link";
import type { User } from "@/types";
import type { Order } from "@/types";
import { StatusPill } from "@/components/ui/status-pill";
import { EditProfileDialog } from "@/components/customer/account/edit-profile-dialog";
import { formatDate, formatINR } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfilePanel({
  user,
  ordersCount,
  wishlistCount,
  savedRetailersCount,
  recentOrders,
}: {
  user: User;
  ordersCount: number;
  wishlistCount: number;
  savedRetailersCount: number;
  recentOrders: Order[];
}) {
  const firstName = user.name.split(" ")[0];
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl text-primary-600">Hello, {firstName}</h1>
        <p className="mt-1 text-base text-ink-700">Manage your profile, view order history, and track weaver collections.</p>
      </div>

      <div className="flex items-center gap-6 rounded-lg border border-cream-300 bg-white p-8">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary-50 font-display text-3xl text-primary-600">
          {initials(user.name)}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl text-ink-900">{user.name}</p>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-sm border border-cream-300 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-cream-100"
            >
              Edit Profile
            </button>
          </div>
          <div className="flex gap-10">
            <div>
              <p className="text-xs text-ink-500">Email</p>
              <p className="text-sm text-ink-900">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Phone</p>
              <p className="text-sm text-ink-900">{user.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Member Since</p>
              <p className="text-sm text-ink-900">{formatDate(user.memberSince)}</p>
            </div>
          </div>
        </div>
      </div>
      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} user={user} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="Orders Placed" value={ordersCount} note={recentOrders[0] ? `Last ordered ${formatDate(recentOrders[0].placedAt)}` : "No orders yet"} />
        <StatCard label="Wishlist Items" value={wishlistCount} note="Saved for later" />
        <StatCard label="Saved Retailers" value={savedRetailersCount} note="Verified Karnataka weavers" />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl text-ink-900">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="rounded-lg border border-cream-300 bg-white p-8 text-center text-sm text-ink-700">No orders placed yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-cream-300 bg-white">
            {recentOrders.map((order, i) => (
              <div key={order.id} className={`flex items-center justify-between p-5 ${i > 0 ? "border-t border-cream-300" : ""}`}>
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-ink-900">#{order.id}</span>
                    <span className="text-ink-400">•</span>
                    <span className="text-ink-500">{formatDate(order.placedAt)}</span>
                    <StatusPill status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-700">{order.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-semibold text-ink-900">{formatINR(order.total)}</span>
                  <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-primary-600">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-lg border border-cream-300 bg-white p-6">
      <p className="text-sm text-ink-700">{label}</p>
      <p className="mt-2 font-display text-4xl text-primary-600">{value}</p>
      <p className="mt-3 text-xs text-ink-500">{note}</p>
    </div>
  );
}

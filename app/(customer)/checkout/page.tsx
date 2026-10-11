"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useBuyNowStore } from "@/lib/store/buy-now";
import { useOrdersStore } from "@/lib/store/orders";
import { useAddressesStore } from "@/lib/store/addresses";
import { useAuthStore } from "@/lib/store/auth";
import { getProductsByIds } from "@/lib/data/products-client";
import { payForOrder } from "@/lib/payments/razorpay";
import { api } from "@/lib/api/client";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState, EmptyStatePresets } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { addressSchema, type AddressValues } from "@/lib/validations/checkout";
import { useMounted } from "@/lib/hooks/use-mounted";
import { formatINR, cn } from "@/lib/utils";
import type { Product, Retailer } from "@/types";

const STEPS = ["Address", "Delivery", "Payment", "Review"];
const SHIPPING_PER_RETAILER = 150;
const TAX_RATE = 0.18;
const emptyAddress: AddressValues = { fullName: "", line1: "", city: "", state: "", postalCode: "", phone: "" };

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 px-5 py-16 sm:px-10 lg:px-20">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {
  const mounted = useMounted();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<AddressValues | null>(null);
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"upi" | "card" | "netbanking">("upi");
  const [placing, setPlacing] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<AddressValues | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const cartItems = useCartStore((s) => s.items);
  const buyNowItem = useBuyNowStore((s) => s.item);
  const clearBuyNow = useBuyNowStore((s) => s.clear);
  const placeOrder = useOrdersStore((s) => s.placeOrder);
  const savedAddresses = useAddressesStore((s) => s.addresses);
  const saveAddress = useAddressesStore((s) => s.add);
  const user = useAuthStore((s) => s.user);

  // Buy Now checks out only the single product selected on the PDP,
  // bypassing whatever else is already sitting in the cart. Short of that,
  // `items=` (set by the cart page's per-item checkboxes) narrows checkout
  // to just the cart items the customer actually selected.
  const isBuyNow = searchParams.get("buyNow") === "1" && Boolean(buyNowItem);
  const selectedIds = searchParams.get("items")?.split(",").filter(Boolean);
  const items = useMemo(
    () => (isBuyNow && buyNowItem ? [buyNowItem] : selectedIds ? cartItems.filter((i) => selectedIds.includes(i.productId)) : cartItems),
    [isBuyNow, buyNowItem, cartItems, selectedIds],
  );

  const [products, setProducts] = useState<Product[] | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      const productList = await getProductsByIds(items.map((i) => i.productId));
      if (cancelled) return;
      setProducts(productList);
      const { items: retailerList } = await api.get<{ items: Retailer[] }>("/retailers");
      if (!cancelled) setRetailers(retailerList);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, items.map((i) => i.productId).join(",")]);

  const resolvedItems = useMemo(
    () =>
      (products ?? [])
        .map((product) => ({ item: items.find((i) => i.productId === product.id)!, product }))
        .filter((x) => Boolean(x.item)),
    [items, products],
  );

  const retailerCount = new Set(resolvedItems.map((e) => e.product.retailerId)).size;
  const subtotal = resolvedItems.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
  const shipping = retailerCount * SHIPPING_PER_RETAILER + (delivery === "express" ? 250 : 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressValues>({ resolver: zodResolver(addressSchema), defaultValues: address ?? undefined });

  if (!mounted || products === null) {
    return (
      <div className="flex flex-col gap-6 px-5 py-16 sm:px-10 lg:px-20">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (resolvedItems.length === 0 && !placing) {
    return (
      <div className="flex flex-col gap-8 px-5 py-16 sm:px-10 lg:px-20">
        <h1 className="font-display text-4xl text-primary-600">Checkout</h1>
        <EmptyState {...EmptyStatePresets.cartEmpty} className="mx-auto max-w-md" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-8 px-5 py-16 sm:px-10 lg:px-20">
        <h1 className="font-display text-4xl text-primary-600">Checkout</h1>
        <EmptyState
          icon={Lock}
          title="Sign in to check out"
          description="Create an account or sign in so we can save your order and keep you updated on delivery."
          actionLabel="Sign In"
          actionHref="/login"
          className="mx-auto max-w-md"
        />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address) return;
    setPlacing(true);
    try {
      const { order, payment: paymentSession } = await placeOrder({
        items: resolvedItems.map(({ item, product }) => ({ productId: product.id, quantity: item.quantity })),
        shippingAddress: address,
        deliveryMethod: delivery,
        paymentMethod: payment,
      });
      // Cart items are left alone here on purpose — whether the payment
      // that follows succeeds or fails, the customer's cart stays exactly
      // as it was. Buy Now is a separate, single-item staging area (not
      // "the cart"), so it still clears once the order's placed.
      if (isBuyNow) {
        clearBuyNow();
      }
      saveAddress(address);

      if (paymentSession) {
        const paid = await payForOrder({
          orderNumber: order.id,
          session: paymentSession,
          name: "Kaushaya",
          description: `Order ${order.id}`,
          prefill: { name: address.fullName, email: user.email, contact: address.phone },
        });
        if (!paid) {
          toast({
            title: "Payment not completed",
            description: "Your order is saved — you can finish paying from the order page.",
            variant: "error",
          });
        }
      }

      router.push(`/orders/${order.id}`);
    } catch {
      toast({ title: "Couldn't place your order — please try again", variant: "error" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 px-5 py-10 sm:px-10 lg:flex-row lg:px-20">
      <div className="flex flex-1 flex-col gap-8">
        <Stepper steps={STEPS} current={step} />

        {step === 1 && (
          <div className="flex flex-col gap-4 rounded-lg border border-cream-300 bg-white p-8">
            <h2 className="font-display text-2xl text-primary-600">Shipping Address</h2>

            {savedAddresses.length > 0 && !useNewAddress && (
              <div className="flex flex-col gap-3">
                {savedAddresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setAddress(a);
                      setStep(2);
                    }}
                    className={cn(
                      "flex flex-col gap-1 rounded-md border p-4 text-left",
                      a.isDefault ? "border-primary-600 bg-primary-50" : "border-cream-300",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-900">{a.fullName}</p>
                      {a.isDefault && (
                        <span className="rounded-pill bg-primary-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-ink-700">
                      {a.line1}, {a.city}, {a.state} {a.postalCode}
                    </p>
                    <p className="text-sm text-ink-700">{a.phone}</p>
                  </button>
                ))}
                <button type="button" onClick={() => setUseNewAddress(true)} className="w-fit text-sm font-semibold text-primary-600">
                  + Use a new address
                </button>
              </div>
            )}

            {(savedAddresses.length === 0 || useNewAddress) && (
              <form
                onSubmit={handleSubmit((values) => {
                  if (!billingSameAsShipping) {
                    const parsed = addressSchema.safeParse(billingAddress);
                    if (!parsed.success) {
                      toast({ title: "Fill in a complete billing address", variant: "error" });
                      return;
                    }
                  }
                  setAddress(values);
                  setStep(2);
                })}
                className="flex flex-col gap-4"
              >
                {savedAddresses.length > 0 && (
                  <button type="button" onClick={() => setUseNewAddress(false)} className="w-fit text-sm font-semibold text-primary-600">
                    ← Use a saved address
                  </button>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="fullName" required>Full Name</Label>
                    <Input id="fullName" placeholder="Priya Sharma" error={errors.fullName?.message} {...register("fullName")} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="line1" required>Address</Label>
                    <Textarea id="line1" placeholder="42 MG Road" error={errors.line1?.message} {...register("line1")} />
                  </div>
                  <div>
                    <Label htmlFor="city" required>City</Label>
                    <Input id="city" placeholder="Bangalore" error={errors.city?.message} {...register("city")} />
                  </div>
                  <div>
                    <Label htmlFor="state" required>State</Label>
                    <Input id="state" placeholder="Karnataka" error={errors.state?.message} {...register("state")} />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" required>PIN Code</Label>
                    <Input id="postalCode" placeholder="560001" error={errors.postalCode?.message} {...register("postalCode")} />
                  </div>
                  <div>
                    <Label htmlFor="phone" required>Phone</Label>
                    <Input id="phone" placeholder="+91 98765 43210" error={errors.phone?.message} {...register("phone")} />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                    className="size-4 accent-primary-600"
                  />
                  Billing address is same as shipping address
                </label>
                {!billingSameAsShipping && (
                  <div className="flex flex-col gap-4 rounded-md border border-cream-300 p-5">
                    <h3 className="text-sm font-semibold text-ink-900">Billing Address</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="billFullName" required>Full Name</Label>
                        <Input
                          id="billFullName"
                          placeholder="Priya Sharma"
                          value={billingAddress?.fullName ?? ""}
                          onChange={(e) => setBillingAddress({ ...(billingAddress ?? emptyAddress), fullName: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="billLine1" required>Address</Label>
                        <Textarea
                          id="billLine1"
                          placeholder="42 MG Road"
                          value={billingAddress?.line1 ?? ""}
                          onChange={(e) => setBillingAddress({ ...(billingAddress ?? emptyAddress), line1: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="billCity" required>City</Label>
                        <Input
                          id="billCity"
                          placeholder="Bangalore"
                          value={billingAddress?.city ?? ""}
                          onChange={(e) => setBillingAddress({ ...(billingAddress ?? emptyAddress), city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="billState" required>State</Label>
                        <Input
                          id="billState"
                          placeholder="Karnataka"
                          value={billingAddress?.state ?? ""}
                          onChange={(e) => setBillingAddress({ ...(billingAddress ?? emptyAddress), state: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="billPostalCode" required>PIN Code</Label>
                        <Input
                          id="billPostalCode"
                          placeholder="560001"
                          value={billingAddress?.postalCode ?? ""}
                          onChange={(e) => setBillingAddress({ ...(billingAddress ?? emptyAddress), postalCode: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="billPhone" required>Phone</Label>
                        <Input
                          id="billPhone"
                          placeholder="+91 98765 43210"
                          value={billingAddress?.phone ?? ""}
                          onChange={(e) => setBillingAddress({ ...(billingAddress ?? emptyAddress), phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" size="lg" className="mt-2 w-fit">
                  Continue to Delivery
                </Button>
              </form>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 rounded-lg border border-cream-300 bg-white p-8">
            <h2 className="font-display text-2xl text-primary-600">Delivery Method</h2>
            <div className="flex flex-col gap-3">
              <DeliveryOption
                active={delivery === "standard"}
                onClick={() => setDelivery("standard")}
                title="Standard Handloom Delivery (5-7 days)"
                description="Guaranteed safe transit"
                price="Included"
              />
              <DeliveryOption
                active={delivery === "express"}
                onClick={() => setDelivery("express")}
                title="Express Delivery (2-3 days)"
                description="Priority handling and insured transit"
                price="+ ₹250"
              />
            </div>
            <div className="mt-2 flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Continue to Payment</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 rounded-lg border border-cream-300 bg-white p-8">
            <div>
              <p className="text-xs font-semibold uppercase text-gold-400">Step 3 of 4</p>
              <h2 className="font-display text-2xl text-primary-600">Select Payment Method</h2>
            </div>
            <div className="flex flex-wrap gap-6">
              {(["upi", "card", "netbanking"] as const).map((method) => {
                const disabled = method !== "upi";
                return (
                  <label key={method} className={cn("flex items-center gap-2.5", disabled && "cursor-not-allowed opacity-40")}>
                    <input
                      type="radio"
                      checked={payment === method}
                      disabled={disabled}
                      onChange={() => setPayment(method)}
                      className="size-4 accent-primary-600"
                    />
                    <span className="text-sm text-ink-900">
                      {method === "upi" ? "UPI (GPay, PhonePe)" : method === "card" ? "Credit / Debit Card (coming soon)" : "Net Banking (coming soon)"}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>Continue to Review</Button>
            </div>
          </div>
        )}

        {step === 4 && address && (
          <div className="flex flex-col gap-6 rounded-lg border border-cream-300 bg-white p-8">
            <h2 className="font-display text-2xl text-primary-600">Review Your Order</h2>
            <ReviewRow label="Shipping Address" value={`${address.fullName}, ${address.line1}, ${address.city}, ${address.state} ${address.postalCode}`} onEdit={() => setStep(1)} />
            <ReviewRow label="Delivery Method" value={delivery === "standard" ? "Standard Handloom Delivery (5-7 days)" : "Express Delivery (2-3 days)"} onEdit={() => setStep(2)} />
            <ReviewRow label="Payment Method" value={payment === "upi" ? "UPI" : payment === "card" ? "Credit / Debit Card" : "Net Banking"} onEdit={() => setStep(3)} />
            <Button size="lg" disabled={placing} onClick={handlePlaceOrder} className="mt-2 w-fit uppercase">
              {placing ? "Placing Order…" : `Place Order (${formatINR(total)})`}
            </Button>
          </div>
        )}
      </div>

      <aside className="flex w-full flex-col gap-4 rounded-xl border border-cream-300 bg-white p-8 lg:w-[400px] lg:shrink-0">
        <h2 className="font-display text-2xl text-primary-600">Your Order</h2>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink-900">Items to Dispatch</p>
          {resolvedItems.map(({ item, product }) => (
            <div key={product.id} className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-sm">
                <Image src={product.images[0]!.url} alt="" fill sizes="40px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink-900">{product.name}</p>
                <p className="text-xs text-ink-500">
                  Qty: {item.quantity} | {retailers.find((r) => r.id === product.retailerId)?.name}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="h-px w-full bg-cream-300" />
        <div className="flex flex-col gap-3 text-sm">
          <Row label="Subtotal" value={formatINR(subtotal)} />
          <Row label="Shipping" value={formatINR(shipping)} />
          <Row label="Tax (GST 18%)" value={formatINR(tax)} />
          <div className="h-px w-full bg-cream-300" />
          <div className="flex items-center justify-between font-bold">
            <span className="text-ink-900">Total Paid</span>
            <span className="text-xl text-primary-600">{formatINR(total)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-ink-700">
          <Lock className="size-3.5" /> 100% Encrypted Safe Checkout
        </div>
      </aside>
    </div>
  );
}

function DeliveryOption({
  active,
  onClick,
  title,
  description,
  price,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-md border p-4 text-left",
        active ? "border-primary-600 bg-primary-50" : "border-cream-300 bg-white",
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("flex size-4 items-center justify-center rounded-full border-2", active ? "border-primary-600" : "border-cream-300")}>
          {active && <span className="size-2 rounded-full bg-primary-600" />}
        </span>
        <div>
          <p className="text-sm font-medium text-ink-900">{title}</p>
          <p className="text-xs text-ink-500">{description}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-primary-600">{price}</span>
    </button>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-cream-300 pb-4 last:border-0">
      <div>
        <p className="text-xs font-semibold uppercase text-ink-500">{label}</p>
        <p className="mt-1 text-sm text-ink-900">{value}</p>
      </div>
      <button type="button" onClick={onEdit} className="text-sm font-semibold text-primary-600">
        Change
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-700">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}

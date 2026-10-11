// Domain types for Kaushaya. Shaped the way a real API would return
// data, so `lib/data/*` mock repositories can be swapped for real fetch
// calls later without touching any component.

export type WeaveType = "Cotton Ilkal" | "Silk Cotton" | "Traditional Ilkal" | "Contemporary Ilkal" | "Wedding Saree" | "Festive Saree";

export interface Retailer {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  coverUrl: string;
  location: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
  memberSince: string; // ISO date
  bio: string;
  specialties: WeaveType[];
  status: "approved" | "pending" | "rejected" | "suspended";
  totalSales?: number;
  // Optional richer profile content — populated for retailers with
  // hand-authored copy from the source design; others fall back to
  // sensible generated defaults in the retailer-profile page.
  heroImageUrl?: string;
  storyImageUrl?: string;
  foundedYear?: number;
  storyTitle?: string;
  storyParagraphs?: string[];
  ordersFulfilled?: number;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  retailerId: string;
  weaveType: WeaveType;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  color: string;
  borderType: string;
  material: string;
  lengthWidth: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  description: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  verified: boolean;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string;
  description: string;
  coverUrl: string;
  heroImageUrl?: string;
  productIds: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Address {
  fullName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export type OrderStatus = "processing" | "shipped" | "in transit" | "delivered" | "cancelled";

export interface OrderTrackingStep {
  status: OrderStatus | "placed";
  label: string;
  timestamp: string;
  complete: boolean;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  placedAt: string;
  estimatedDelivery: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  tracking: OrderTrackingStep[];
}

/** What the API hands back alongside an order whenever there's still money to collect online — null for COD, and null again once paid. Everything here is safe to send to the browser (keyId is the public half of the Razorpay credential pair). */
export interface PaymentSession {
  provider: "razorpay";
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export type UserRole = "customer" | "retailer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  memberSince: string; // ISO date
}

// ---------- Events / gamified leaderboard module ----------

export interface EventEntry {
  id: string;
  eventId: string;
  retailerId: string;
  productId: string;
  title: string;
  imageUrl: string;
  votes: number;
  rank?: number;
  submittedAt: string;
}

export interface MarketplaceEvent {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  bannerUrl: string;
  status: "live" | "upcoming" | "ended";
  startsAt: string;
  endsAt: string;
  participatingRetailers: number;
  totalEntries: number;
  prizePool: string;
  description: string;
}

// ---------- Admin / Retailer dashboard aggregates ----------

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalRetailers: number;
  totalProducts: number;
  revenueTrend: { label: string; value: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
}

export interface RetailerStats {
  retailerId: string;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  revenueTrend: { label: string; value: number }[];
  topProducts: { productId: string; unitsSold: number }[];
}

import { apiGet, apiGetOrNull } from "@/lib/api/server";
import type { Product } from "@/types";

// Real API-backed repository — same exported signatures/shapes the mock
// version had (see git history), so no importer had to change. Bodies now
// call the Kaushaya API (see server/) instead of reading local arrays.

export async function getProducts(filters?: { weaveType?: string; retailerId?: string; tag?: string }) {
  const params = new URLSearchParams();
  if (filters?.weaveType) params.set("weaveType", filters.weaveType);
  if (filters?.retailerId) params.set("retailerId", filters.retailerId);
  if (filters?.tag) params.set("tag", filters.tag);
  // The PLP/search pages paginate client-side over the full filtered set —
  // pageSize is generous enough to cover the whole catalog in one call.
  params.set("pageSize", "100");
  const { items } = await apiGet<{ items: Product[] }>(`/products?${params.toString()}`);
  return items;
}

export async function getProductBySlug(slug: string) {
  const data = await apiGetOrNull<{ product: Product }>(`/products/slug/${encodeURIComponent(slug)}`);
  return data?.product ?? null;
}

export async function getProductById(id: string) {
  const data = await apiGetOrNull<{ product: Product }>(`/products/${encodeURIComponent(id)}`);
  return data?.product ?? null;
}

export async function getTrendingProducts(limit = 4) {
  const { items } = await apiGet<{ items: Product[] }>(`/products/trending?limit=${limit}`);
  return items;
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const { items } = await apiGet<{ items: Product[] }>(`/products/${encodeURIComponent(productId)}/related?limit=${limit}`);
  return items;
}

// Client Components needing a productIds -> Product[] bulk lookup (cart,
// wishlist, checkout) can't import this file — it pulls in `server-only`
// via lib/api/server. Use `getProductsByIds` from
// `@/lib/data/products-client` instead.

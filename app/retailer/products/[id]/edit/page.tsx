"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PackageX } from "lucide-react";
import { RetailerShell } from "@/components/retailer/shell";
import { ProductForm, PRODUCT_COLLECTIONS, type ProductFormValues } from "@/components/retailer/product-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api/client";

interface RetailerProductDetail {
  id: string;
  name: string;
  description: string;
  weaveType: string;
  collectionLabel?: string;
  tags: string[];
  color: string;
  borderType: string;
  material: string;
  lengthWidth: string;
  price: number;
  compareAtPrice?: number;
  stockCount: number;
  images: { url: string; alt: string }[];
  status: "DRAFT" | "ACTIVE" | "UNDER_REVIEW" | "ARCHIVED";
}

function toFormValues(product: RetailerProductDetail): Partial<ProductFormValues> {
  return {
    title: product.name,
    description: product.description,
    category: product.weaveType,
    collection: product.collectionLabel ?? PRODUCT_COLLECTIONS[0],
    tags: product.tags.join(", "),
    material: product.material,
    lengthWidth: product.lengthWidth,
    borderType: product.borderType,
    color: product.color,
    images: product.images.map((img) => ({ url: img.url, name: img.alt })),
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? 0,
    stockQty: product.stockCount,
    // The form's toggle is a plain live/not-live switch, same as when
    // creating — ARCHIVED/UNDER_REVIEW both start it "off", so saving
    // without flipping it back on lands the product in DRAFT rather than
    // wherever it was. Moving a listing out of moderation/archival some
    // other way isn't this form's job.
    live: product.status === "ACTIVE",
  };
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<RetailerProductDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ product: RetailerProductDetail }>(`/products/mine/${id}`)
      .then(({ product }) => {
        if (!cancelled) setProduct(product);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else toast({ title: "Couldn't load this product — try again", variant: "error" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (values: ProductFormValues, asDraft: boolean) => {
    await api.patch(`/products/mine/${id}`, {
      name: values.title,
      description: values.description,
      weaveType: values.category,
      collectionLabel: values.collection,
      tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
      color: values.color || "As pictured",
      borderType: values.borderType || "Classic",
      material: values.material || "Handloom blend",
      lengthWidth: values.lengthWidth || "5.5 Meters Saree + 0.8 Meters Blouse Piece",
      price: values.price,
      compareAtPrice: values.compareAtPrice || undefined,
      stockCount: values.stockQty,
      images: values.images.map((f) => ({ url: f.url, alt: values.title })),
      status: asDraft || !values.live ? "DRAFT" : "ACTIVE",
    });
    toast({
      title: "Product updated",
      description: asDraft ? "Saved as draft." : "Your changes are now live.",
      variant: "success",
    });
    router.push("/retailer/products");
  };

  if (loading) {
    return (
      <RetailerShell title="Edit Product" subtitle="Loading your product details…">
        <Skeleton className="h-96 w-full" />
      </RetailerShell>
    );
  }

  if (notFound || !product) {
    return (
      <RetailerShell title="Edit Product" subtitle="">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          description="This listing doesn't exist, or isn't yours to edit."
          actionLabel="Back to Products"
          actionHref="/retailer/products"
          className="mx-auto max-w-md"
        />
      </RetailerShell>
    );
  }

  return (
    <RetailerShell title="Edit Product" subtitle={`Updating "${product.name}".`}>
      <ProductForm initial={toFormValues(product)} submitLabel="Save Changes" submittingLabel="Saving…" onSubmit={handleSubmit} />
    </RetailerShell>
  );
}

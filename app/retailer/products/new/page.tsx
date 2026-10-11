"use client";

import { useRouter } from "next/navigation";
import { RetailerShell } from "@/components/retailer/shell";
import { ProductForm, type ProductFormValues } from "@/components/retailer/product-form";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (values: ProductFormValues, asDraft: boolean) => {
    await api.post("/products/mine", {
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
      title: asDraft ? "Saved as draft" : "Product published",
      description: asDraft ? "You can continue editing later." : "Now live on the Kaushaya marketplace.",
      variant: "success",
    });
    router.push("/retailer/products");
  };

  return (
    <RetailerShell title="Add New Product" subtitle="Introduce a new handcrafted masterwork to the Kaushaya marketplace.">
      <ProductForm submitLabel="Publish Live" submittingLabel="Publishing…" onSubmit={handleSubmit} />
    </RetailerShell>
  );
}

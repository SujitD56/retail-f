"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { FileUploadBox, type UploadedFile } from "@/components/retailer/file-upload-box";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const TABS = ["Basic Info", "Images", "Specifications", "Pricing"] as const;
const CATEGORIES = ["Traditional Ilkal", "Contemporary Ilkal", "Wedding Saree", "Festive Saree", "Cotton Ilkal", "Silk Cotton"];
const COLLECTIONS = ["Handpicked Ilkal", "Festive Edit", "Heritage Collection", "Contemporary Ilkal"];

// Maps a backend validation field name to the tab that field lives on, so a
// failed submit can jump straight to the first tab with an error.
const TAB_FOR_FIELD: Record<string, (typeof TABS)[number]> = {
  name: "Basic Info",
  description: "Basic Info",
  weaveType: "Basic Info",
  collectionLabel: "Basic Info",
  color: "Specifications",
  borderType: "Specifications",
  material: "Specifications",
  lengthWidth: "Specifications",
  price: "Pricing",
  compareAtPrice: "Pricing",
  stockCount: "Pricing",
  images: "Images",
};

export interface ProductFormValues {
  title: string;
  description: string;
  category: string;
  collection: string;
  tags: string;
  material: string;
  lengthWidth: string;
  borderType: string;
  color: string;
  images: UploadedFile[];
  price: number;
  compareAtPrice: number;
  stockQty: number;
  live: boolean;
}

const BLANK_VALUES: ProductFormValues = {
  title: "",
  description: "",
  category: CATEGORIES[0]!,
  collection: COLLECTIONS[0]!,
  tags: "",
  material: "",
  lengthWidth: "",
  borderType: "",
  color: "",
  images: [],
  price: 0,
  compareAtPrice: 0,
  stockQty: 0,
  live: true,
};

/**
 * Shared by the "Add Product" and "Edit Product" pages — the only real
 * difference between the two is what the form starts pre-filled with and
 * what happens on submit, both of which the caller owns. This component
 * just collects the fields and hands them back.
 */
export function ProductForm({
  initial,
  submitLabel,
  submittingLabel,
  onSubmit,
}: {
  /** Starting values — omit any field to fall back to a blank default. Only read on mount (this isn't a controlled/reactive prop). */
  initial?: Partial<ProductFormValues>;
  submitLabel: string;
  submittingLabel: string;
  /** Called with the collected form values on "Save Draft"/publish. Let it throw to show the generic failure toast — handle success (toast + navigation) yourself, since that differs between create and edit. */
  onSubmit: (values: ProductFormValues, asDraft: boolean) => Promise<void>;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Basic Info");
  const { toast } = useToast();

  const [title, setTitle] = useState(initial?.title ?? BLANK_VALUES.title);
  const [description, setDescription] = useState(initial?.description ?? BLANK_VALUES.description);
  const [category, setCategory] = useState(initial?.category ?? BLANK_VALUES.category);
  const [collection, setCollection] = useState(initial?.collection ?? BLANK_VALUES.collection);
  const [tags, setTags] = useState(initial?.tags ?? BLANK_VALUES.tags);
  const [material, setMaterial] = useState(initial?.material ?? BLANK_VALUES.material);
  const [lengthWidth, setLengthWidth] = useState(initial?.lengthWidth ?? BLANK_VALUES.lengthWidth);
  const [borderType, setBorderType] = useState(initial?.borderType ?? BLANK_VALUES.borderType);
  const [color, setColor] = useState(initial?.color ?? BLANK_VALUES.color);
  const [images, setImages] = useState<UploadedFile[]>(initial?.images ?? BLANK_VALUES.images);
  const [price, setPrice] = useState(initial?.price ?? BLANK_VALUES.price);
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice ?? BLANK_VALUES.compareAtPrice);
  const [stockQty, setStockQty] = useState(initial?.stockQty ?? BLANK_VALUES.stockQty);
  const [live, setLive] = useState(initial?.live ?? BLANK_VALUES.live);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const publish = async (asDraft: boolean) => {
    if (images.length === 0) {
      toast({ title: "Add at least one product photo", variant: "error" });
      setTab("Images");
      return;
    }
    setSubmitting(true);
    setFieldErrors({});
    try {
      await onSubmit(
        { title, description, category, collection, tags, material, lengthWidth, borderType, color, images, price, compareAtPrice, stockQty, live },
        asDraft,
      );
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR") {
        const errors = (err.details as { fieldErrors?: Record<string, string[]> } | undefined)?.fieldErrors ?? {};
        setFieldErrors(errors);
        const firstField = Object.keys(errors)[0];
        if (firstField && TAB_FOR_FIELD[firstField]) setTab(TAB_FOR_FIELD[firstField]);
        toast({ title: "Please fix the highlighted fields", variant: "error" });
      } else {
        toast({ title: "Couldn't save this product — try again", variant: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end gap-3">
        <Button variant="secondary" disabled={submitting} onClick={() => publish(true)} className="uppercase">
          Save Draft
        </Button>
        <Button disabled={submitting} onClick={() => publish(false)} className="uppercase">
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>

      <div className="mb-8 flex gap-8 border-b border-cream-300">
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold",
              tab === t ? "border-primary-600 text-primary-600" : "border-transparent text-ink-500",
            )}
          >
            <span className={cn("flex size-6 items-center justify-center rounded-full text-xs", tab === t ? "bg-primary-600 text-white" : "bg-cream-200 text-ink-700")}>
              {i + 1}
            </span>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {tab === "Basic Info" && (
            <div className="rounded-lg border border-cream-300 bg-white p-6">
              <p className="font-display text-xl text-ink-900">Basic Details</p>
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <Label htmlFor="productTitle" required>Product Title</Label>
                  <Input id="productTitle" value={title} onChange={(e) => setTitle(e.target.value)} error={fieldErrors.name?.[0]} />
                </div>
                <div>
                  <Label htmlFor="productDescription" required>Description</Label>
                  <Textarea id="productDescription" className="min-h-[140px]" value={description} onChange={(e) => setDescription(e.target.value)} error={fieldErrors.description?.[0]} />
                </div>
              </div>

              <p className="mt-8 font-display text-xl text-ink-900">Category &amp; Weaving Specs</p>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>Saree Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Collection Target</Label>
                  <Select value={collection} onValueChange={setCollection}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COLLECTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="tags">Artisan Tags (Comma separated)</Label>
                  <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tab === "Images" && (
            <div className="rounded-lg border border-cream-300 bg-white p-6">
              <p className="font-display text-xl text-ink-900">Product Images</p>
              <p className="mt-1 text-sm text-ink-700">Upload a hero shot plus 3-4 detail angles. First image becomes the primary listing photo.</p>
              <div className="mt-5">
                <FileUploadBox
                  label="Upload product photos"
                  hint="JPEG/PNG — first image is the primary listing photo"
                  purpose="PRODUCT_IMAGE"
                  multiple
                  initialFiles={initial?.images}
                  onUploaded={setImages}
                />
              </div>
            </div>
          )}

          {tab === "Specifications" && (
            <div className="rounded-lg border border-cream-300 bg-white p-6">
              <p className="font-display text-xl text-ink-900">Weave Specifications</p>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input id="material" placeholder="Fine cotton body, Pure Mulberry Silk pallu" value={material} onChange={(e) => setMaterial(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lengthWidth">Length &amp; Width</Label>
                  <Input id="lengthWidth" placeholder="5.5 Meters Saree + 0.8 Meters Blouse Piece" value={lengthWidth} onChange={(e) => setLengthWidth(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="borderType">Border Type</Label>
                  <Input id="borderType" placeholder="Chikki Paras (Golden zari motifs)" value={borderType} onChange={(e) => setBorderType(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" placeholder="Heirloom Crimson Body & Dark Indigo Weft blend" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tab === "Pricing" && (
            <div className="rounded-lg border border-cream-300 bg-white p-6">
              <p className="font-display text-xl text-ink-900">Pricing &amp; Inventory</p>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <Label htmlFor="sellingPrice" required>Selling Price (₹)</Label>
                  <Input id="sellingPrice" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} error={fieldErrors.price?.[0]} />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice">Compare-at Price (₹)</Label>
                  <Input id="compareAtPrice" type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="stockQty" required>Stock Quantity</Label>
                  <Input id="stockQty" type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <p className="font-display text-lg text-ink-900">Publishing Settings</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-ink-900">Live Product Status</span>
              <Switch checked={live} onCheckedChange={() => setLive((v) => !v)} label="Live product status" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              Enabling live status publishes this handloom piece to the global Ilkal marketplace immediately.
            </p>
          </div>

          <div className="rounded-lg border border-cream-300 bg-white p-6">
            <p className="font-display text-lg text-ink-900">SEO / Search Preview</p>
            <div className="mt-4 rounded-md border border-cream-300 bg-cream-100 p-4">
              <p className="truncate text-sm font-medium text-info-500">{title || "Product title"}</p>
              <p className="mt-1 truncate text-xs text-success-500">kaushaya.com/product/{title.toLowerCase().replace(/\s+/g, "-")}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-700 line-clamp-2">
                Buy authentic {title} — 100% verified pure handloom products…
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-success-500/30 bg-success-50 p-4 text-xs text-success-500">
            <Check className="mt-0.5 size-4 shrink-0" />
            {images.length > 0 ? `${images.length} image(s) uploaded to S3.` : "Upload at least one image before publishing."}
          </div>
        </div>
      </div>
    </>
  );
}

export { CATEGORIES as PRODUCT_CATEGORIES, COLLECTIONS as PRODUCT_COLLECTIONS };

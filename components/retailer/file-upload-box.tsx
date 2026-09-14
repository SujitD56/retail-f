"use client";

import { useRef, useState } from "react";
import { CloudUpload, FileCheck, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client";

export type UploadPurpose =
  | "PRODUCT_IMAGE"
  | "RETAILER_LOGO"
  | "RETAILER_COVER"
  | "RETAILER_DOCUMENT"
  | "EVENT_BANNER"
  | "EVENT_ENTRY"
  | "AVATAR";

export interface UploadedFile {
  url: string;
  name: string;
}

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

/**
 * Real S3 upload: asks the API for a presigned PUT URL (`POST
 * /uploads/presign`), PUTs the file bytes straight to S3 from the browser,
 * then reports the resulting public URL back via `onUploaded` — the API
 * server never sees the file body.
 */
export function FileUploadBox({
  label,
  hint,
  purpose,
  multiple = false,
  initialFiles,
  onUploaded,
  className,
}: {
  label: string;
  hint: string;
  purpose: UploadPurpose;
  multiple?: boolean;
  /** Pre-seeds the "already uploaded" list — e.g. a product's existing images when editing. Only read on first mount; changing it later has no effect (matches how every other form field here takes its initial value). */
  initialFiles?: UploadedFile[];
  onUploaded?: (files: UploadedFile[]) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles ?? []);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    const selected = Array.from(fileList ?? []);
    if (selected.length === 0) return;

    setStatus("uploading");
    setErrorMessage(null);
    try {
      const uploaded = await Promise.all(
        selected.map(async (file) => {
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const contentType = CONTENT_TYPE_BY_EXT[ext] ?? file.type ?? "image/jpeg";

          const { uploadUrl, publicUrl } = await api.post<{ uploadUrl: string; publicUrl: string; key: string }>(
            "/uploads/presign",
            { purpose, contentType },
          );

          const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
          if (!putRes.ok) throw new Error("Upload to S3 failed");

          return { url: publicUrl, name: file.name };
        }),
      );

      const next = multiple ? [...files, ...uploaded] : uploaded;
      setFiles(next);
      setStatus("idle");
      onUploaded?.(next);
    } catch {
      setStatus("error");
      setErrorMessage("Upload failed — check your connection and try again.");
    }
  };

  const removeFile = (url: string) => {
    const next = files.filter((f) => f.url !== url);
    setFiles(next);
    onUploaded?.(next);
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className={cn(
          "flex w-full flex-col items-center gap-3 rounded-md border-2 border-dashed border-cream-300 bg-cream-100 px-4 py-6 text-center hover:border-primary-600/40",
          status === "error" && "border-danger-500/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {status === "uploading" ? (
          <Loader2 className="size-6 animate-spin text-primary-600" />
        ) : files.length > 0 ? (
          <FileCheck className="size-6 text-success-500" />
        ) : (
          <CloudUpload className="size-6 text-ink-500" />
        )}
        <div>
          <p className="text-sm font-medium text-ink-900">
            {status === "uploading" ? "Uploading…" : files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} uploaded` : label}
          </p>
          <p className="mt-0.5 text-xs text-ink-500">{errorMessage ?? hint}</p>
        </div>
      </button>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((f) => (
            <li key={f.url} className="flex items-center justify-between rounded-sm bg-cream-100 px-3 py-1.5 text-xs text-ink-700">
              <span className="truncate">{f.name}</span>
              <button type="button" onClick={() => removeFile(f.url)} aria-label="Remove file">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

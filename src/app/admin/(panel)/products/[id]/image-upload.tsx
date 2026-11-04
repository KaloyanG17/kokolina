"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { Notice } from "@/components/admin/ui";
import { uploadProductImages } from "../../../actions";

const MAX_EDGE = 1600;

/**
 * Shrinks a photo in the browser to WebP at most 1600px on the long edge.
 * Keeps transparency, so cut-outs still hang cleanly, and keeps uploads well
 * under the hosting request limit (about 4.5 MB on Vercel).
 */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  if (!blob) throw new Error("convert");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

export function ImageUpload({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preparing, setPreparing] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [state, action, uploading] = useActionState(async (prev: Parameters<typeof uploadProductImages>[0], data: FormData) => {
    const result = await uploadProductImages(prev, data);
    if (result.ok) formRef.current?.reset();
    return result;
  }, {});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    setPrepError(null);
    setPreparing(true);
    try {
      form.delete("files");
      for (const file of files) {
        try {
          form.append("files", await shrink(file));
        } catch {
          throw new Error(`${file.name} could not be read in this browser. Export it as JPEG or PNG and try again.`);
        }
      }
    } catch (err) {
      setPrepError(err instanceof Error ? err.message : "The photos could not be prepared.");
      setPreparing(false);
      return;
    }
    setPreparing(false);
    startTransition(() => action(form));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3 rounded-sm border border-dashed border-line p-4">
      <input type="hidden" name="product_id" value={productId} />
      <label htmlFor="files" className="title-4">
        Add photos
      </label>
      <input
        id="files"
        name="files"
        type="file"
        accept="image/*"
        multiple
        aria-describedby="files-hint"
        className="body-6 file:mr-3 file:rounded-sm file:border-0 file:bg-ink-deep file:px-3 file:py-2 file:text-cotton"
      />
      <div id="files-hint" className="caption-5 flex flex-col gap-1 text-muted">
        <p>
          The first photo hangs on the hook in the shop, in place of the drawing. For the cleanest look use a cut-out
          with a transparent background (PNG or WebP). On iPhone, touch and hold the garment in Photos and choose Copy or
          Share; on Android, use Copy cutout. Photos shot on plain white also work.
        </p>
        <p>Any size: photos are resized before upload.</p>
      </div>
      <input
        name="alt"
        placeholder="Describe the photos for screen readers (optional)"
        className="body-6 rounded-sm border border-line bg-surface px-3 py-2"
      />
      {prepError && <Notice tone="error">{prepError}</Notice>}
      {state.errors?.files && <Notice tone="error">{state.errors.files}</Notice>}
      {state.message && state.ok && <Notice tone="ok">{state.message}</Notice>}
      <button type="submit" disabled={preparing || uploading} aria-busy={preparing || uploading} className="btn-primary self-start">
        {preparing ? "Preparing photos" : uploading ? "Uploading" : "Upload"}
      </button>
    </form>
  );
}

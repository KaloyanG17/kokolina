"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Notice } from "@/components/admin/ui";
import { uploadProductImages } from "../../../actions";
import type { WorkerMessage } from "./background-worker";

const MAX_EDGE = 1600;
/** Space left round a cut-out after trimming, as a share of its longest side. */
const TRIM_PAD = 0.02;

/** Decodes a photo and scales it to at most 1600px on the long edge. */
async function decode(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Crops a cut-out to the garment so it hangs straight from the hook instead
 * of floating in empty space. Photos without transparency are left as they are.
 */
function trim(img: ImageData): ImageData {
  const { width, height, data } = img;
  let top = height, left = width, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 24) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return img;
  const pad = Math.round(Math.max(right - left, bottom - top) * TRIM_PAD);
  left = Math.max(0, left - pad);
  top = Math.max(0, top - pad);
  right = Math.min(width - 1, right + pad);
  bottom = Math.min(height - 1, bottom + pad);
  if (left === 0 && top === 0 && right === width - 1 && bottom === height - 1) return img;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.putImageData(img, 0, 0);
  return ctx.getImageData(left, top, right - left + 1, bottom - top + 1);
}

async function toWebp(img: ImageData, name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext("2d")!.putImageData(img, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
  if (!blob) throw new Error("convert");
  return new File([blob], `${name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

export function ImageUpload({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [state, action, uploading] = useActionState(async (prev: Parameters<typeof uploadProductImages>[0], data: FormData) => {
    const result = await uploadProductImages(prev, data);
    if (result.ok) formRef.current?.reset();
    return result;
  }, {});

  useEffect(() => () => workerRef.current?.terminate(), []);

  /** Sends one photo to the background remover and waits for the cut-out. */
  function removeBackground(img: ImageData, label: string) {
    workerRef.current ??= new Worker(new URL("./background-worker.ts", import.meta.url), { type: "module" });
    const worker = workerRef.current;
    const id = Math.random();
    return new Promise<ImageData>((resolve, reject) => {
      const onMessage = (e: MessageEvent<WorkerMessage>) => {
        const msg = e.data;
        if (msg.type === "progress") {
          setStatus(`Downloading the background remover (first time only) ${Math.round((msg.loaded / msg.total) * 100)}%`);
          return;
        }
        if (msg.id !== id) return;
        worker.removeEventListener("message", onMessage);
        if (msg.type === "error") reject(new Error(msg.message));
        else resolve(new ImageData(new Uint8ClampedArray(msg.pixels), msg.width, msg.height));
      };
      worker.addEventListener("message", onMessage);
      setStatus(`Removing the background from ${label}`);
      const pixels = new Uint8ClampedArray(img.data);
      worker.postMessage({ id, width: img.width, height: img.height, pixels }, [pixels.buffer]);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    const cutOut = form.get("remove_background") === "on";
    setPrepError(null);
    try {
      form.delete("files");
      for (const file of files) {
        setStatus(`Preparing ${file.name}`);
        let img: ImageData;
        try {
          img = await decode(file);
        } catch {
          throw new Error(`${file.name} could not be read in this browser. Export it as JPEG or PNG and try again.`);
        }
        if (cutOut) {
          try {
            img = await removeBackground(img, file.name);
          } catch {
            throw new Error(
              `The background of ${file.name} could not be removed in this browser. Try Chrome or Edge, or untick Remove background.`,
            );
          }
        }
        form.append("files", await toWebp(trim(img), file.name));
      }
    } catch (err) {
      setPrepError(err instanceof Error ? err.message : "The photos could not be prepared.");
      setStatus(null);
      return;
    }
    setStatus(null);
    startTransition(() => action(form));
  }

  const busy = status !== null || uploading;

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
      <label className="body-5 flex cursor-pointer items-start gap-2">
        <input type="checkbox" name="remove_background" defaultChecked className="mt-1 size-4 accent-[var(--color-ink)]" />
        <span>
          Remove background
          <span className="caption-5 block text-muted">
            Cuts the garment out and trims it so it hangs on the hook. Untick for detail shots you want to keep whole.
          </span>
        </span>
      </label>
      <p id="files-hint" className="caption-5 text-muted">
        Any photo works: the background is removed in your browser and the photo is resized before upload. The first
        background removal downloads the cut-out model once (about 115 MB), which takes a minute; after that it is quick.
      </p>
      <input
        name="alt"
        placeholder="Describe the photos for screen readers (optional)"
        className="body-6 rounded-sm border border-line bg-surface px-3 py-2"
      />
      {status && (
        <p role="status" className="caption-1 text-ink">
          {status}…
        </p>
      )}
      {prepError && <Notice tone="error">{prepError}</Notice>}
      {state.errors?.files && <Notice tone="error">{state.errors.files}</Notice>}
      {state.message && state.ok && <Notice tone="ok">{state.message}</Notice>}
      <button type="submit" disabled={busy} aria-busy={busy} className="btn-primary self-start">
        {status ? "Preparing photos" : uploading ? "Uploading" : "Upload"}
      </button>
    </form>
  );
}

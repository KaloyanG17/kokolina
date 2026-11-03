"use client";

import { useActionState, useRef } from "react";
import { Notice, SubmitButton } from "@/components/admin/ui";
import { uploadProductImages } from "../../../actions";

export function ImageUpload({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(async (prev: Parameters<typeof uploadProductImages>[0], data: FormData) => {
    const result = await uploadProductImages(prev, data);
    if (result.ok) formRef.current?.reset();
    return result;
  }, {});

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3 rounded-sm border border-dashed border-line p-4">
      <input type="hidden" name="product_id" value={productId} />
      <label htmlFor="files" className="title-4">
        Add photos
      </label>
      <input
        id="files"
        name="files"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        aria-describedby="files-hint"
        className="body-6 file:mr-3 file:rounded-sm file:border-0 file:bg-ink-deep file:px-3 file:py-2 file:text-cotton"
      />
      <p id="files-hint" className="caption-5 text-muted">
        JPEG, PNG, WebP or AVIF, up to 8 MB each. Portrait 3:4 looks best.
      </p>
      <input
        name="alt"
        placeholder="Describe the photos for screen readers (optional)"
        className="body-6 rounded-sm border border-line bg-surface px-3 py-2"
      />
      {state.errors?.files && <Notice tone="error">{state.errors.files}</Notice>}
      {state.message && state.ok && <Notice tone="ok">{state.message}</Notice>}
      <SubmitButton pendingLabel="Uploading" className="btn-primary self-start">
        Upload
      </SubmitButton>
    </form>
  );
}

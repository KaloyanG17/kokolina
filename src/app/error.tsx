"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { ErrorLabel } from "@/components/error-label";
import { useT } from "@/i18n/client";

/** Any page that throws: reported to Sentry, shown as the torn label with a retry. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { errorPage: copy } = useT();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorLabel code="500" eyebrow={copy.eyebrow} title={copy.title} text={copy.text}>
      <button type="button" onClick={reset} className="btn-primary">
        {copy.retry}
      </button>
      <Link href="/shop" className="btn-secondary">
        {copy.home}
      </Link>
    </ErrorLabel>
  );
}

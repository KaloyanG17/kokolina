"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/** Last resort when the root layout itself fails. Reports to Sentry and offers a reload. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f3efe6", color: "#141b2e", margin: 0 }}>
        <main style={{ maxWidth: 560, margin: "20vh auto", padding: 24 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>&quot;Kokolina&quot;</p>
          <h1 style={{ fontSize: 36, lineHeight: "40px", fontWeight: 600, margin: "12px 0" }}>A seam came loose</h1>
          <p style={{ fontSize: 16, lineHeight: "24px" }}>
            The page failed to load. The error has been reported. Try again, or come back in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, padding: "8px 16px", background: "#141414", color: "#f3efe6", border: 0, borderRadius: 4, fontSize: 16, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

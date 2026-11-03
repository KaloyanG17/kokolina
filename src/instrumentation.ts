import * as Sentry from "@sentry/nextjs";

/** Server and edge error tracking. Does nothing until SENTRY_DSN is set. */
export async function register() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const options = {
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,
  };

  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(options);
  }
}

// Reports errors thrown in server components, route handlers and server actions
export const onRequestError = Sentry.captureRequestError;

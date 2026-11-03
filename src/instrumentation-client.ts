import * as Sentry from "@sentry/nextjs";

/*
 * Runs in the browser before the app becomes interactive.
 * Sentry only starts when its public DSN is set.
 */

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// PostHog loads from the consent banner, only after a visitor accepts.

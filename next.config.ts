import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_INGEST_HOST ?? "https://eu.i.posthog.com";
const posthogAssets = posthogHost.replace("://eu.i.", "://eu-assets.i.").replace("://us.i.", "://us-assets.i.");

const nextConfig: NextConfig = {
  images: {
    // Product and site photos uploaded through the admin live in Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    // Admin photo uploads go through server actions
    serverActions: { bodySizeLimit: "10mb" },
  },
  // PostHog through our own domain so ad blockers do not drop analytics
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${posthogAssets}/static/:path*` },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Source maps upload only when an auth token is present (set it in Vercel)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Send browser errors through our domain so ad blockers do not drop them
  tunnelRoute: "/monitoring",
});

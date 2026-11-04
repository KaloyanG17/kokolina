/**
 * Which services are configured. Every integration checks here first and
 * degrades quietly (sample catalogue, disabled checkout, no tracking) until
 * its keys are present. See .env.example and SETUP.md.
 */
/**
 * Public address used in emails and Stripe redirects. An explicit
 * NEXT_PUBLIC_SITE_URL wins; otherwise Vercel's system variables give the
 * production domain or this branch's preview address.
 */
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : (process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL);
  return vercelHost ? `https://${vercelHost}` : "http://localhost:3000";
}

export const env = {
  siteUrl: resolveSiteUrl(),

  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim(),

  stripeSecretKey: (process.env.STRIPE_SECRET_KEY ?? "").trim(),
  stripeWebhookSecret: (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim(),

  resendApiKey: (process.env.RESEND_API_KEY ?? "").trim(),
  emailFrom: process.env.EMAIL_FROM ?? "",
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL ?? "",
};

export const has = {
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  supabaseAdmin: Boolean(env.supabaseUrl && env.supabaseServiceKey),
  stripe: Boolean(env.stripeSecretKey),
  resend: Boolean(env.resendApiKey && env.emailFrom),
};

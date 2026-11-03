/**
 * Which services are configured. Every integration checks here first and
 * degrades quietly (sample catalogue, disabled checkout, no tracking) until
 * its keys are present. See .env.example and SETUP.md.
 */
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",

  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL ?? "",
};

export const has = {
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  supabaseAdmin: Boolean(env.supabaseUrl && env.supabaseServiceKey),
  stripe: Boolean(env.stripeSecretKey),
  resend: Boolean(env.resendApiKey && env.emailFrom),
};

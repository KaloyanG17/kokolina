# Kokolina: connecting the services

The shop runs without any keys: it shows the 12 sample products from
`src/data/products.ts`, checkout stays disabled and nothing is tracked.
Each service switches on as soon as its keys are present.

Put keys in `.env.local` (copy `.env.example`) for local development, and in
**Vercel > kokolina > Settings > Environment Variables** for the live site.
Redeploy after changing variables in Vercel.

## 1. Supabase (database, admin login, photo storage)

1. Create a project at supabase.com. Pick an EU region.
2. **SQL Editor**: paste and run `supabase/migrations/0001_init.sql`, then
   `supabase/seed.sql` (12 test products, picture slots, 2 test subscribers).
3. **Authentication > Users > Add user**: create your admin login with email
   and password. Turn off public sign ups under Authentication > Sign In / Providers.
4. **SQL Editor**: allow that email into the admin:
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
5. **Project settings > API**: copy the URL, the anon key and the service
   role key into `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   and `SUPABASE_SERVICE_ROLE_KEY`.
6. Sign in at `/admin/login`.

Security: every table has row level security. The public can only read
published products and pictures. Writes from the admin are checked against
`public.admins` inside the database, not just in the app.

## 2. Resend (welcome emails, order emails, newsletter)

1. Add and verify your sending domain in Resend (DNS records).
2. Create an API key: `RESEND_API_KEY`.
3. Set `EMAIL_FROM`, for example `Kokolina <hello@yourdomain.com>`.
4. Optional: `ADMIN_NOTIFY_EMAIL` gets an alert for every order.

Newsletters are written and sent from **/admin/newsletter**. Send a test to
yourself first. Each email carries a one click unsubscribe link.

## 3. Stripe (checkout, test mode first)

1. In the Stripe dashboard, stay in **Test mode** and copy the secret key
   (`sk_test_...`) into `STRIPE_SECRET_KEY`.
2. Webhook for local development, with the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Put the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
3. Webhook for the live site: **Developers > Webhooks > Add endpoint**
   `https://kokolina.vercel.app/api/stripe/webhook`, event
   `checkout.session.completed`. Put its signing secret in Vercel.
4. Pay with card `4242 4242 4242 4242`, any future date, any CVC.
   The order appears in **/admin/orders**, stock goes down and the
   confirmation email is sent.

Prices are always read from Supabase on the server, never from the browser.
Shipping countries are listed in `src/lib/stripe.ts`. Shipping rates, tax and
going live (`sk_live_...`) are the next steps once test orders look right.

## 4. Sentry (errors)

1. Create a Next.js project in Sentry and copy the DSN into both
   `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`.
2. Optional, for readable stack traces: `SENTRY_ORG`, `SENTRY_PROJECT` and an
   auth token `SENTRY_AUTH_TOKEN` (set these in Vercel only).

Browser errors are sent through `/monitoring` so ad blockers do not drop them.

## 5. PostHog (analytics and session replay)

1. Create a project (EU cloud recommended) and copy the project API key into
   `NEXT_PUBLIC_POSTHOG_KEY`.
2. In PostHog, **Settings > Session replay**: turn recording on.

Nothing is captured until a visitor accepts the consent banner. Replays mask
every form field. Events go through `/ingest` on your own domain.

## Checklist before taking real money

- [ ] Real products, photos and prices in the admin; test products deleted or unpublished
- [ ] Legal text for `/privacy` and `/terms`
- [ ] Shipping rates and tax decided and configured in Stripe
- [ ] Live Stripe keys and a live webhook endpoint
- [ ] A test order end to end on the live site

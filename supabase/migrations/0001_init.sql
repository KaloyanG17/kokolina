-- Kokolina: catalogue, media, newsletter and orders.
-- Run in the Supabase SQL editor (or `supabase db push`), then run seed.sql.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admins: emails allowed into /admin. Add yours after creating your auth user:
--   insert into public.admins (email) values ('you@example.com');
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  lot text not null,
  name text not null,
  category text not null check (category in ('Jeans','Jackets','Shirts','Dresses','Skirts','Overalls','Sweats')),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'eur',
  colour text not null default '',
  fabric text not null default '',
  description text not null default '',
  fit text not null default '',
  care text not null default '',
  sizes text[] not null default '{}',
  art text not null default 'jeans' check (art in ('jeans','trucker','chore','western','dress','skirt','overalls','sweat')),
  wash text not null default 'rinse' check (wash in ('raw','rinse','light','ecru')),
  stock integer not null default 0 check (stock >= 0),
  is_new boolean not null default false,
  sold_out boolean not null default false,
  published boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null,
  alt text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images(product_id, sort);

-- Named pictures used around the site (hero, campaign, about...)
create table if not exists public.site_images (
  key text primary key,
  label text not null,
  path text,
  alt text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Newsletter
-- ---------------------------------------------------------------------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed')),
  unsubscribe_token uuid not null default gen_random_uuid(),
  source text not null default 'footer',
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  recipient_count integer not null default 0,
  sent_by text,
  sent_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders (written by the Stripe webhook with the service role)
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  stripe_payment_intent text,
  email text,
  name text,
  status text not null default 'paid' check (status in ('paid','fulfilled','refunded','cancelled')),
  amount_total_cents integer not null default 0,
  currency text not null default 'eur',
  items jsonb not null default '[]',
  shipping jsonb,
  created_at timestamptz not null default now()
);

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists site_images_touch on public.site_images;
create trigger site_images_touch before update on public.site_images
  for each row execute function public.touch_updated_at();

-- Stock goes down when an order is recorded; sold_out follows automatically
create or replace function public.decrement_stock(p_slug text, p_qty integer)
returns void language sql security definer set search_path = public as $$
  update public.products
     set stock = greatest(stock - p_qty, 0),
         sold_out = (greatest(stock - p_qty, 0) = 0)
   where slug = p_slug;
$$;
revoke all on function public.decrement_stock(text, integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.site_images enable row level security;
alter table public.subscribers enable row level security;
alter table public.newsletters enable row level security;
alter table public.orders enable row level security;

-- Public storefront reads
drop policy if exists "public reads published products" on public.products;
create policy "public reads published products" on public.products
  for select using (published or public.is_admin());

drop policy if exists "public reads product images" on public.product_images;
create policy "public reads product images" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.published or public.is_admin()))
  );

drop policy if exists "public reads site images" on public.site_images;
create policy "public reads site images" on public.site_images for select using (true);

-- Admin writes
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage product images" on public.product_images;
create policy "admins manage product images" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage site images" on public.site_images;
create policy "admins manage site images" on public.site_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read subscribers" on public.subscribers;
create policy "admins read subscribers" on public.subscribers
  for select using (public.is_admin());

drop policy if exists "admins manage subscribers" on public.subscribers;
create policy "admins manage subscribers" on public.subscribers
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read newsletters" on public.newsletters;
create policy "admins read newsletters" on public.newsletters
  for select using (public.is_admin());

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders
  for select using (public.is_admin());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins" on public.admins
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: one public bucket for product and site pictures
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists "public reads media" on storage.objects;
create policy "public reads media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins update media" on storage.objects;
create policy "admins update media" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

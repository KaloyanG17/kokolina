-- Stock per size, refunds, dispatch tracking and the hemming measurement.
-- Run in the Supabase SQL editor. Safe to run more than once.

-- ---------------------------------------------------------------------------
-- Stock per size: {"30": 2, "32": 0, ...}. Empty means the product still uses
-- the single stock number. When it is filled, stock is kept as the sum.
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists size_stock jsonb not null default '{}'::jsonb;

create or replace function public.sync_size_stock()
returns trigger language plpgsql as $$
begin
  if new.size_stock is not null and new.size_stock <> '{}'::jsonb then
    select coalesce(sum(greatest(value::int, 0)), 0)::int into new.stock
      from jsonb_each_text(new.size_stock);
  end if;
  return new;
end $$;

drop trigger if exists products_size_stock on public.products;
create trigger products_size_stock before insert or update on public.products
  for each row execute function public.sync_size_stock();

-- Lowers stock for one size (or the product total when it has no per size stock)
drop function if exists public.decrement_stock(text, integer);
create or replace function public.decrement_stock(p_slug text, p_qty integer, p_size text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.products
     set size_stock = case
           when p_size is not null and size_stock ? p_size
             then jsonb_set(size_stock, array[p_size], to_jsonb(greatest((size_stock ->> p_size)::int - p_qty, 0)))
           else size_stock end,
         stock = greatest(stock - p_qty, 0)
   where slug = p_slug;
  -- The trigger recalculates stock from the sizes; sold out follows the result
  update public.products set sold_out = true where slug = p_slug and stock = 0;
end $$;
revoke all on function public.decrement_stock(text, integer, text) from public, anon, authenticated;

-- Puts stock back after a full refund. Clears sold out only if stock had run out.
create or replace function public.restore_stock(p_slug text, p_qty integer, p_size text default null)
returns void language plpgsql security definer set search_path = public as $$
declare was_empty boolean;
begin
  select stock = 0 into was_empty from public.products where slug = p_slug;
  update public.products
     set size_stock = case
           when p_size is not null and size_stock ? p_size
             then jsonb_set(size_stock, array[p_size], to_jsonb((size_stock ->> p_size)::int + p_qty))
           else size_stock end,
         stock = stock + p_qty
   where slug = p_slug;
  if was_empty then
    update public.products set sold_out = false where slug = p_slug;
  end if;
end $$;
revoke all on function public.restore_stock(text, integer, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Orders: language for follow up emails, hemming, refunds and tracking
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists lang text not null default 'bg',
  add column if not exists inseam_cm integer,
  add column if not exists refunded_cents integer not null default 0,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists shipped_at timestamptz;

create index if not exists orders_payment_intent_idx on public.orders(stripe_payment_intent);

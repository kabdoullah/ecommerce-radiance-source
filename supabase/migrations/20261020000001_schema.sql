-- Source d'Éclat — schéma initial
-- Montants en FCFA stockés en entiers (pas de sous-unité, aucun flottant).

create extension if not exists citext with schema extensions;

-- ---------------------------------------------------------------------------
-- Utilitaires
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Administrateurs
-- Une ligne dans admin_profiles = droits administrateur. Aucune politique
-- d'écriture n'est accordée aux rôles API : seul le SQL (éditeur SQL du
-- tableau de bord) peut ajouter un administrateur. Voir docs/ADMIN.md.
-- ---------------------------------------------------------------------------

create table public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles where id = (select auth.uid())
  );
$$;

-- anon en a besoin car les politiques publiques l'évaluent (renvoie false sans session).
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug extensions.citext not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 500),
  image_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug extensions.citext not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 5000),
  price integer not null check (price between 0 and 10000000),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  -- restrict : une catégorie ne peut pas être supprimée tant qu'elle contient des produits
  category_id uuid references public.categories (id) on delete restrict,
  is_active boolean not null default false,
  is_featured boolean not null default false,
  -- null = stock non suivi (toujours disponible), 0 = rupture
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_active_featured_idx on public.products (is_active, is_featured);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null default '' check (char_length(alt_text) <= 200),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, sort_order);

-- ---------------------------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------------------------

create type public.order_status as enum (
  'pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled'
);

create type public.payment_status as enum ('unpaid', 'paid');

create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (customer_phone ~ '^\+?[0-9]{8,15}$'),
  delivery_address text check (char_length(delivery_address) <= 300),
  customer_note text check (char_length(customer_note) <= 500),
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  paid_at timestamptz,
  subtotal bigint not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total bigint not null,
  admin_note text check (char_length(admin_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total = subtotal + delivery_fee),
  check ((payment_status = 'paid') = (paid_at is not null))
);

create index orders_status_idx on public.orders (status);
create index orders_created_idx on public.orders (created_at desc);
create index orders_phone_created_idx on public.orders (customer_phone, created_at desc);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Les lignes conservent nom et prix au moment de l'achat : l'historique reste
-- exact même si le produit est modifié ou supprimé ensuite.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total bigint not null,
  check (line_total = unit_price::bigint * quantity)
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- Avis clients (modérés avant publication)
-- ---------------------------------------------------------------------------

create type public.review_status as enum ('pending', 'approved', 'hidden');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 5 and 1000),
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index reviews_product_status_idx on public.reviews (product_id, status);
create index reviews_status_created_idx on public.reviews (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Paramètres de la boutique (ligne unique)
-- ---------------------------------------------------------------------------

create table public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'Source d''Éclat' check (char_length(store_name) between 1 and 80),
  tagline text not null default '' check (char_length(tagline) <= 160),
  logo_path text,
  whatsapp_number text check (whatsapp_number ~ '^[0-9]{8,15}$'),
  contact_phone text check (char_length(contact_phone) <= 30),
  contact_email text check (char_length(contact_email) <= 120),
  address text check (char_length(address) <= 300),
  opening_hours text check (char_length(opening_hours) <= 200),
  delivery_info text check (char_length(delivery_info) <= 1000),
  delivery_fee integer check (delivery_fee is null or delivery_fee between 0 and 1000000),
  order_message_intro text not null default 'Bonjour, je souhaite confirmer ma commande :'
    check (char_length(order_message_intro) <= 300),
  instagram_url text check (char_length(instagram_url) <= 200),
  facebook_url text check (char_length(facebook_url) <= 200),
  tiktok_url text check (char_length(tiktok_url) <= 200),
  hero_title text not null default '' check (char_length(hero_title) <= 120),
  hero_subtitle text not null default '' check (char_length(hero_subtitle) <= 300),
  hero_image_path text,
  about_title text not null default '' check (char_length(about_title) <= 120),
  about_text text not null default '' check (char_length(about_text) <= 2000),
  about_image_path text,
  footer_text text not null default '' check (char_length(footer_text) <= 300),
  updated_at timestamptz not null default now()
);

create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

insert into public.store_settings (id) values (true);

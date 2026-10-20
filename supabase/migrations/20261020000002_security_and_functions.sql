-- Source d'Éclat — RLS, fonctions métier et stockage

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.store_settings enable row level security;

-- admin_profiles : lecture de son propre profil uniquement, aucune écriture via l'API.
create policy "admin_profiles: read own" on public.admin_profiles
  for select to authenticated using (id = (select auth.uid()));

-- categories
create policy "categories: public read active" on public.categories
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "categories: admin insert" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "categories: admin update" on public.categories
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories: admin delete" on public.categories
  for delete to authenticated using ((select public.is_admin()));

-- products
create policy "products: public read active" on public.products
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "products: admin insert" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "products: admin update" on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products: admin delete" on public.products
  for delete to authenticated using ((select public.is_admin()));

-- product_images
create policy "product_images: public read of active products" on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active)
    or (select public.is_admin())
  );
create policy "product_images: admin insert" on public.product_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "product_images: admin update" on public.product_images
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "product_images: admin delete" on public.product_images
  for delete to authenticated using ((select public.is_admin()));

-- orders / order_items : aucune lecture publique. La création passe par create_order().
-- Pas de politique delete : l'historique des commandes est conservé.
create policy "orders: admin read" on public.orders
  for select to authenticated using ((select public.is_admin()));
create policy "orders: admin update" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "order_items: admin read" on public.order_items
  for select to authenticated using ((select public.is_admin()));

-- reviews : seuls les avis approuvés sont publics. La création passe par submit_review().
create policy "reviews: public read approved" on public.reviews
  for select to anon, authenticated using (status = 'approved' or (select public.is_admin()));
create policy "reviews: admin update" on public.reviews
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "reviews: admin delete" on public.reviews
  for delete to authenticated using ((select public.is_admin()));

-- store_settings : informations publiques de la boutique, modifiables par l'admin.
create policy "store_settings: public read" on public.store_settings
  for select to anon, authenticated using (true);
create policy "store_settings: admin update" on public.store_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on sequence public.order_number_seq from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Statut des commandes : transitions contrôlées par la base
--   pending → confirmed → preparing → shipping → completed (étapes sautables)
--   toute commande non terminée peut être annulée ; completed/cancelled sont finaux.
-- Garder en phase avec src/features/orders/status.ts
-- ---------------------------------------------------------------------------

create or replace function public.order_status_rank(s public.order_status)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case s
    when 'pending' then 1
    when 'confirmed' then 2
    when 'preparing' then 3
    when 'shipping' then 4
    when 'completed' then 5
    when 'cancelled' then 6
  end;
$$;

create or replace function public.guard_order_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Les montants ne sont écrits qu'une fois, par create_order() dans sa transaction.
  if (new.subtotal <> old.subtotal
      or new.delivery_fee <> old.delivery_fee
      or new.total <> old.total)
     and coalesce(current_setting('app.order_init', true), '') <> old.id::text then
    raise exception 'order_amounts_locked' using errcode = 'P0001';
  end if;

  if new.order_number <> old.order_number or new.created_at <> old.created_at then
    raise exception 'order_amounts_locked' using errcode = 'P0001';
  end if;

  if new.status <> old.status then
    if old.status in ('completed', 'cancelled') then
      raise exception 'invalid_status_transition' using errcode = 'P0001';
    end if;
    if new.status <> 'cancelled'
       and public.order_status_rank(new.status) <= public.order_status_rank(old.status) then
      raise exception 'invalid_status_transition' using errcode = 'P0001';
    end if;

    -- Annulation : le stock réservé à la commande est restitué.
    if new.status = 'cancelled' then
      update public.products p
         set stock_quantity = p.stock_quantity + oi.quantity
        from public.order_items oi
       where oi.order_id = new.id
         and oi.product_id = p.id
         and p.stock_quantity is not null;
    end if;
  end if;

  return new;
end;
$$;

create trigger orders_guard_update before update on public.orders
  for each row execute function public.guard_order_update();

-- ---------------------------------------------------------------------------
-- Création de commande (appelée par le serveur Next.js avec la clé publique)
-- Les prix, la disponibilité et les totaux sont relus et calculés ici :
-- aucun montant envoyé par le navigateur n'est utilisé. Tout est atomique :
-- en cas d'erreur, rien n'est enregistré.
-- ---------------------------------------------------------------------------

create or replace function public.create_order(
  p_customer_name text,
  p_customer_phone text,
  p_delivery_address text,
  p_customer_note text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_line record;
  v_order_id uuid;
  v_order_number text;
  v_subtotal bigint := 0;
  v_delivery_fee integer;
  v_items jsonb := '[]'::jsonb;
  v_created_at timestamptz;
begin
  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 30 then
    raise exception 'invalid_items' using errcode = 'P0001';
  end if;

  -- Limitation simple des abus : 3 commandes / 10 min par numéro, 30 / min au total.
  if (select count(*) from public.orders
       where customer_phone = p_customer_phone
         and created_at > now() - interval '10 minutes') >= 3
     or (select count(*) from public.orders
       where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  select coalesce(s.delivery_fee, 0) into v_delivery_fee
    from public.store_settings s where s.id;

  insert into public.orders (
    order_number, customer_name, customer_phone, delivery_address, customer_note,
    subtotal, delivery_fee, total
  ) values (
    'SE-' || to_char(now() at time zone 'UTC', 'YYMMDD') || '-'
      || lpad(nextval('public.order_number_seq')::text, 4, '0'),
    btrim(p_customer_name), p_customer_phone,
    nullif(btrim(coalesce(p_delivery_address, '')), ''),
    nullif(btrim(coalesce(p_customer_note, '')), ''),
    0, 0, 0
  )
  returning id, order_number, created_at into v_order_id, v_order_number, v_created_at;

  -- Les doublons éventuels sont fusionnés ; les produits sont verrouillés
  -- pour que deux commandes simultanées ne vendent pas le même stock.
  drop table if exists pg_temp.requested;
  create temporary table requested on commit drop as
    select (e ->> 'product_id')::uuid as product_id, sum((e ->> 'quantity')::integer) as quantity
      from jsonb_array_elements(p_items) e
     group by 1;

  if exists (select 1 from requested r
              where r.quantity is null or r.quantity < 1 or r.quantity > 99) then
    raise exception 'invalid_items' using errcode = 'P0001';
  end if;

  if exists (select 1 from requested r
              where not exists (select 1 from public.products p where p.id = r.product_id)) then
    raise exception 'product_unavailable' using errcode = 'P0001';
  end if;

  for v_line in
    select r.product_id, r.quantity, p.name, p.price, p.stock_quantity, p.is_active
      from requested r
      join public.products p on p.id = r.product_id
     order by r.product_id
       for update of p
  loop
    if not v_line.is_active then
      raise exception 'product_unavailable' using errcode = 'P0001', detail = v_line.name;
    end if;
    if v_line.stock_quantity is not null and v_line.stock_quantity < v_line.quantity then
      raise exception 'insufficient_stock'
        using errcode = 'P0001', detail = v_line.name, hint = v_line.stock_quantity::text;
    end if;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (v_order_id, v_line.product_id, v_line.name, v_line.price, v_line.quantity,
            v_line.price::bigint * v_line.quantity);

    if v_line.stock_quantity is not null then
      update public.products set stock_quantity = stock_quantity - v_line.quantity
       where id = v_line.product_id;
    end if;

    v_subtotal := v_subtotal + v_line.price::bigint * v_line.quantity;
    v_items := v_items || jsonb_build_object(
      'product_name', v_line.name,
      'unit_price', v_line.price,
      'quantity', v_line.quantity,
      'line_total', v_line.price::bigint * v_line.quantity
    );
  end loop;

  perform set_config('app.order_init', v_order_id::text, true);
  update public.orders
     set subtotal = v_subtotal, delivery_fee = v_delivery_fee, total = v_subtotal + v_delivery_fee
   where id = v_order_id;
  perform set_config('app.order_init', '', true);

  return jsonb_build_object(
    'order_number', v_order_number,
    'created_at', v_created_at,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_subtotal + v_delivery_fee,
    'items', v_items
  );
end;
$$;

revoke execute on function public.create_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Dépôt d'un avis (toujours en attente de modération)
-- ---------------------------------------------------------------------------

create or replace function public.submit_review(
  p_product_id uuid,
  p_author_name text,
  p_rating integer,
  p_comment text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.products where id = p_product_id and is_active) then
    raise exception 'product_unavailable' using errcode = 'P0001';
  end if;

  if (select count(*) from public.reviews where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.reviews (product_id, author_name, rating, comment)
  values (p_product_id, btrim(p_author_name), p_rating, btrim(p_comment));
end;
$$;

revoke execute on function public.submit_review(uuid, text, integer, text) from public;
grant execute on function public.submit_review(uuid, text, integer, text) to anon, authenticated;

revoke execute on function public.order_status_rank(public.order_status) from public, anon;
revoke execute on function public.guard_order_update() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Stockage des images (bucket public en lecture, écriture admin uniquement)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-media', 'store-media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "store-media: admin read" on storage.objects
  for select to authenticated using (bucket_id = 'store-media' and (select public.is_admin()));
create policy "store-media: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'store-media' and (select public.is_admin()));
create policy "store-media: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'store-media' and (select public.is_admin()));
create policy "store-media: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'store-media' and (select public.is_admin()));

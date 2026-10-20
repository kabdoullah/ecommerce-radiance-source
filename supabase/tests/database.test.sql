-- Tests de sécurité et de logique métier de la base (pgTAP).
-- Lancement : npx supabase test db   (stack locale démarrée avec le seed, voir README)
begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

-- Données de test -----------------------------------------------------------
update public.store_settings set delivery_fee = 1500, store_name = 'Source d''Éclat';
insert into auth.users (id, email, aud, role, instance_id)
values ('22222222-2222-2222-2222-222222222222', 'client@example.com', 'authenticated',
        'authenticated', '00000000-0000-0000-0000-000000000000');

insert into public.products (id, name, slug, price, is_active, stock_quantity) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Test stock', 'test-stock', 1000, true, 3),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Test illimité', 'test-illimite', 2500, true, null),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Test masqué', 'test-masque', 500, false, null);

-- Visiteur anonyme ----------------------------------------------------------
set local role anon;

select is((select count(*)::int from public.products where slug like 'test-%'), 2,
  'anon: only active products are visible');
select throws_ok($$ select count(*) from public.orders $$, '42501', null,
  'anon: cannot read orders');
select throws_ok($$ select count(*) from public.admin_profiles $$, '42501', null,
  'anon: cannot read admin profiles');
select is((select count(*)::int from public.reviews where status <> 'approved'), 0,
  'anon: cannot read unmoderated reviews');

select throws_ok(
  $$ insert into public.orders (order_number, customer_name, customer_phone, subtotal, total)
     values ('X', 'Hack', '0700000000', 0, 0) $$,
  '42501', null, 'anon: cannot insert orders directly');
select throws_ok(
  $$ insert into public.products (name, slug, price) values ('Hack', 'hack', 1) $$,
  '42501', null, 'anon: cannot create products');

select throws_ok($$ update public.store_settings set store_name = 'Piratée' $$, '42501', null,
  'anon: cannot change store settings');
select throws_ok($$ update public.products set price = 1 where slug = 'test-stock' $$, '42501', null,
  'anon: cannot change prices');

select lives_ok(
  $$ select public.create_order('Awa Test', '+2250700000099', 'Cocody', '',
       '[{"product_id":"bbbbbbbb-0000-0000-0000-000000000001","quantity":2},
         {"product_id":"bbbbbbbb-0000-0000-0000-000000000002","quantity":1},
         {"product_id":"bbbbbbbb-0000-0000-0000-000000000001","quantity":1}]'::jsonb) $$,
  'anon: can place an order through create_order()');

select throws_ok(
  $$ select public.create_order('Awa Test', '+2250700000098', '', '',
       '[{"product_id":"bbbbbbbb-0000-0000-0000-000000000001","quantity":1}]'::jsonb) $$,
  'P0001', 'insufficient_stock', 'orders cannot exceed the remaining stock');
select throws_ok(
  $$ select public.create_order('Awa Test', '+2250700000098', '', '',
       '[{"product_id":"bbbbbbbb-0000-0000-0000-000000000003","quantity":1}]'::jsonb) $$,
  'P0001', 'product_unavailable', 'unpublished products cannot be ordered');
select throws_ok(
  $$ select public.create_order('Awa Test', '+2250700000098', '', '', '[]'::jsonb) $$,
  'P0001', 'invalid_items', 'empty orders are rejected');
select throws_ok(
  $$ select public.create_order('Awa Test', '+2250700000098', '', '',
       '[{"product_id":"bbbbbbbb-0000-0000-0000-000000000002","quantity":500}]'::jsonb) $$,
  'P0001', 'invalid_items', 'quantities above 99 are rejected');

reset role;

select is((select store_name from public.store_settings), 'Source d''Éclat',
  'store settings are unchanged');
select is((select price from public.products where slug = 'test-stock'), 1000,
  'prices are unchanged');
select is(
  (select array[subtotal, delivery_fee, total] from public.orders
    where customer_phone = '+2250700000099'),
  array[5500, 1500, 7000]::bigint[],
  'totals come from database prices (duplicate lines merged, delivery fee added)');
select is(
  (select oi.unit_price from public.order_items oi join public.orders o on o.id = oi.order_id
    where o.customer_phone = '+2250700000099' and oi.product_name = 'Test stock'),
  1000, 'order lines keep the unit price at purchase time');
select is((select stock_quantity from public.products where slug = 'test-stock'), 0,
  'tracked stock is decremented');

-- Client connecté sans droits admin ----------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is(public.is_admin(), false, 'a signed-in customer is not an admin');
select is((select count(*)::int from public.orders), 0, 'non-admin users cannot read orders');
select throws_ok(
  $$ insert into public.admin_profiles (id, display_name)
     values ('22222222-2222-2222-2222-222222222222', 'Moi') $$,
  '42501', null, 'users cannot grant themselves admin rights');

-- Administrateur (créé par seed.sql) ---------------------------------------
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(public.is_admin(), true, 'the seeded admin is recognized');
select ok((select count(*) from public.orders) >= 1, 'admins can read orders');
select throws_ok(
  $$ update public.orders set total = 1 where customer_phone = '+2250700000099' $$,
  'P0001', 'order_amounts_locked', 'order amounts cannot be changed after creation');
select throws_ok(
  $$ update public.orders set status = 'pending' where customer_phone = '+2250700000099'
       and status = 'pending';
     update public.orders set status = 'confirmed' where customer_phone = '+2250700000099';
     update public.orders set status = 'pending' where customer_phone = '+2250700000099' $$,
  'P0001', 'invalid_status_transition', 'statuses cannot move backwards');
select lives_ok(
  $$ update public.orders set status = 'cancelled' where customer_phone = '+2250700000099' $$,
  'admins can cancel an order');
select is((select stock_quantity from public.products where slug = 'test-stock'), 3,
  'cancelling restores the reserved stock');

select * from finish();
rollback;

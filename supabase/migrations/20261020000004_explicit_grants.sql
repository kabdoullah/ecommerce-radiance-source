-- Droits explicites des rôles de l'API (moindre privilège).
-- Le projet fonctionne ainsi que l'option Supabase « Automatically expose new tables »
-- soit activée ou non. Les politiques RLS restent la barrière principale ligne par ligne.

revoke all on all tables in schema public from anon, authenticated;

-- Visiteurs : lecture du catalogue publié, des avis approuvés et des paramètres (filtrée par RLS).
grant select on public.categories, public.products, public.product_images,
  public.reviews, public.store_settings to anon;

-- Utilisateurs connectés : droits effectifs uniquement pour les administrateurs (RLS + is_admin()).
grant select on public.categories, public.products, public.product_images,
  public.reviews, public.store_settings, public.admin_profiles,
  public.orders, public.order_items to authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images
  to authenticated;
grant update, delete on public.reviews to authenticated;
grant update on public.orders, public.store_settings to authenticated;

-- Les commandes et les avis publics passent uniquement par les fonctions déjà accordées :
-- create_order() et submit_review(). is_admin() est utilisée par les politiques.
grant usage on schema public to anon, authenticated;

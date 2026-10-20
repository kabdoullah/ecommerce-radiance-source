-- ============================================================================
-- DONNÉES DE DÉMONSTRATION — DÉVELOPPEMENT LOCAL UNIQUEMENT
-- Exécuté par `supabase db reset` en local, JAMAIS par `supabase db push`.
-- Contenus repris de la maquette ; numéros et adresses fictifs.
-- ============================================================================

-- Administrateur local : admin@example.com / admin-local-2026
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'admin@example.com',
  extensions.crypt('admin-local-2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
values (
  gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@example.com"}', 'email', now(), now(), now()
);

insert into public.admin_profiles (id, display_name)
values ('11111111-1111-1111-1111-111111111111', 'Admin local');

update public.store_settings set
  tagline = 'Beauté • Soin • Éclat',
  whatsapp_number = '2250712345678',
  contact_phone = '+225 07 12 34 56 78',
  contact_email = 'contact@example.com',
  address = 'Abidjan, Côte d''Ivoire',
  opening_hours = 'Lun – Sam, 9h – 19h',
  delivery_summary = 'Livraison partout en Côte d''Ivoire',
  delivery_info = 'Livraison partout en Côte d''Ivoire sous 24h à 72h.',
  payment_summary = 'Paiement à la livraison ou mobile money',
  payment_info = 'À la livraison ou via Mobile Money (MTN, Orange).',
  delivery_fee = null,
  hero_title = '',
  hero_script = 'Votre beauté, notre passion.',
  hero_subtitle = 'Découvrez notre sélection de produits de beauté et de soins pour révéler votre éclat naturel.',
  hero_side_quote = 'Une peau saine, une beauté naturelle, une confiance renouvelée.',
  about_title = '',
  about_text = 'Chez Source d''Éclat, nous croyons que chaque personne mérite de prendre soin de sa peau et de révéler sa beauté naturelle.

Notre objectif est de vous accompagner dans votre routine beauté en vous proposant une sélection de produits adaptés à vos besoins.',
  about_highlights = 'Qualité assurée
Produits sélectionnés
Votre satisfaction, notre priorité',
  footer_text = 'Votre beauté, votre éclat, votre confiance.';

insert into public.categories (id, name, slug, icon, sort_order) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Gels douche & soins corps', 'gels-douche-soins-corps', 'bottle', 1),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Savons naturels', 'savons-naturels', 'soap', 2),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Soins du visage & peau', 'soins-visage-peau', 'face', 3),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Soins capillaires & cheveux', 'soins-capillaires', 'hair', 4),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Offres en lot & promos', 'offres-lots-promos', 'gift', 5);

insert into public.products
  (name, slug, subtitle, description, highlights, usage_tips, precautions, skin_type, volume,
   price, compare_at_price, category_id, is_active, is_featured, stock_quantity) values
  ('Kiara-Clear', 'kiara-clear', 'Gel douche exfoliant',
   'Le gel douche Kiara-Clear nettoie en profondeur, exfolie en douceur et laisse votre peau propre, douce et éclatante. Enrichi en agents exfoliants naturels, il aide à éliminer les impuretés et les cellules mortes.',
   'Nettoie en profondeur
Exfolie en douceur
Laisse la peau douce et éclatante',
   'Appliquez sur peau humide, massez délicatement puis rincez.',
   'Usage externe uniquement. Éviter le contact avec les yeux.',
   'Convient à tous types de peau', '1 L',
   5000, null, 'aaaaaaaa-0000-0000-0000-000000000001', true, true, 20),
  ('Ly-Soai-Coco', 'ly-soai-coco', 'Gel douche hydratant', 'Gel douche hydratant à la noix de coco.',
   '', '', '', '', '', 5000, null, 'aaaaaaaa-0000-0000-0000-000000000001', true, true, null),
  ('Ly-Soaï', 'ly-soai', 'Gel douche vanille & miel', 'Gel douche gourmand vanille et miel.',
   '', '', '', '', '', 5000, null, 'aaaaaaaa-0000-0000-0000-000000000001', true, true, null),
  ('Savon noir', 'savon-noir', 'Anti imperfections', 'Savon noir traditionnel pour une peau nette.',
   '', '', '', '', '', 2000, null, 'aaaaaaaa-0000-0000-0000-000000000002', true, true, 3),
  ('Savon éclaircissant', 'savon-eclaircissant', 'Teint lumineux', 'Savon pour un teint unifié et lumineux.',
   '', '', '', '', '', 2500, 3000, 'aaaaaaaa-0000-0000-0000-000000000002', true, true, null),
  ('Coffret découverte', 'coffret-decouverte', 'Offre en lot', 'Exemple de produit épuisé.',
   '', '', '', '', '', 11000, null, 'aaaaaaaa-0000-0000-0000-000000000005', true, false, 0),
  ('Brouillon non publié', 'brouillon-non-publie', '', 'Produit non publié : il n''apparaît pas sur la boutique.',
   '', '', '', '', '', 5000, null, 'aaaaaaaa-0000-0000-0000-000000000003', false, false, null);

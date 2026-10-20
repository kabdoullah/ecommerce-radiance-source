-- ============================================================================
-- CONTENU INITIAL DE LA BOUTIQUE — PRODUCTION
-- À exécuter dans l'éditeur SQL du tableau de bord Supabase, après
-- `supabase db push`. N'est lancé ni par `db push` ni par `db reset`.
--
-- Contenus repris de la maquette et de `seed.sql` (à ajuster avant mise en ligne :
-- réseaux sociaux, avis, produits d'exemple). Volontairement absents :
--   - administrateur (à créer à la main, voir README section 6) ;
--   - images (à ajouter ensuite depuis l'administration).
--
-- Ré-exécutable : les textes de la boutique, les catégories et les produits
-- (même slug) sont réécrits avec les valeurs ci-dessous ; un avis déjà présent
-- (même produit, auteur et commentaire) n'est pas dupliqué.
-- ============================================================================

begin;

update public.store_settings set
  tagline = 'Beauté • Soin • Éclat',
  whatsapp_number = '2250596069291',
  contact_phone = '+225 05 96 06 92 91',
  contact_email = 'kofficolombe222@gmail.com',
  address = 'Abidjan, Côte d''Ivoire',
  opening_hours = 'Lun – Sam, 9h – 19h',
  delivery_summary = 'Livraison partout en Côte d''Ivoire',
  delivery_info = 'Livraison partout en Côte d''Ivoire sous 24h à 72h.',
  payment_summary = 'Paiement à la livraison ou mobile money',
  payment_info = 'À la livraison ou via Mobile Money (MTN, Orange).',
  delivery_fee = null,
  facebook_url = 'https://www.facebook.com/',
  instagram_url = 'https://www.instagram.com/',
  tiktok_url = 'https://www.tiktok.com/',
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

insert into public.categories (name, slug, icon, sort_order) values
  ('Gels douche & soins corps', 'gels-douche-soins-corps', 'bottle', 1),
  ('Savons naturels', 'savons-naturels', 'soap', 2),
  ('Soins du visage & peau', 'soins-visage-peau', 'face', 3),
  ('Soins capillaires & cheveux', 'soins-capillaires', 'hair', 4),
  ('Offres en lot & promos', 'offres-lots-promos', 'gift', 5)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- Stock null = non suivi (toujours disponible), 0 = épuisé.
insert into public.products
  (name, slug, subtitle, description, highlights, usage_tips, precautions, skin_type, volume,
   price, compare_at_price, category_id, is_active, is_featured, stock_quantity)
select p.name, p.slug, p.subtitle, p.description, p.highlights, p.usage_tips, p.precautions,
  p.skin_type, p.volume, p.price, p.compare_at_price, c.id, p.is_active, p.is_featured,
  p.stock_quantity
from (values
  ('Kiara-Clear', 'kiara-clear', 'Gel douche exfoliant',
   'Le gel douche Kiara-Clear nettoie en profondeur, exfolie en douceur et laisse votre peau propre, douce et éclatante. Enrichi en agents exfoliants naturels, il aide à éliminer les impuretés et les cellules mortes.',
   'Nettoie en profondeur
Exfolie en douceur
Laisse la peau douce et éclatante',
   'Appliquez sur peau humide, massez délicatement puis rincez.',
   'Usage externe uniquement. Éviter le contact avec les yeux.',
   'Convient à tous types de peau', '1 L',
   5000, null::integer, 'gels-douche-soins-corps', true, true, 20),
  ('Ly-Soai-Coco', 'ly-soai-coco', 'Gel douche hydratant', 'Gel douche hydratant à la noix de coco.',
   '', '', '', '', '', 5000, null, 'gels-douche-soins-corps', true, true, null::integer),
  ('Ly-Soaï', 'ly-soai', 'Gel douche vanille & miel', 'Gel douche gourmand vanille et miel.',
   '', '', '', '', '', 5000, null, 'gels-douche-soins-corps', true, true, null),
  ('Savon noir', 'savon-noir', 'Anti imperfections', 'Savon noir traditionnel pour une peau nette.',
   '', '', '', '', '', 2000, null, 'savons-naturels', true, true, 3),
  ('Savon éclaircissant', 'savon-eclaircissant', 'Teint lumineux', 'Savon pour un teint unifié et lumineux.',
   '', '', '', '', '', 2500, 3000, 'savons-naturels', true, true, null),
  ('Coffret découverte', 'coffret-decouverte', 'Offre en lot', 'Exemple de produit épuisé.',
   '', '', '', '', '', 11000, null, 'offres-lots-promos', true, false, 0),
  ('Brouillon non publié', 'brouillon-non-publie', '', 'Produit non publié : il n''apparaît pas sur la boutique.',
   '', '', '', '', '', 5000, null, 'soins-visage-peau', false, false, null)
) as p (name, slug, subtitle, description, highlights, usage_tips, precautions, skin_type, volume,
        price, compare_at_price, category_slug, is_active, is_featured, stock_quantity)
join public.categories c on c.slug = p.category_slug
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  description = excluded.description,
  highlights = excluded.highlights,
  usage_tips = excluded.usage_tips,
  precautions = excluded.precautions,
  skin_type = excluded.skin_type,
  volume = excluded.volume,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  category_id = excluded.category_id,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  stock_quantity = excluded.stock_quantity;

-- Avis (bloc « Elles nous font confiance » et note de la fiche produit).
-- Le premier avis de la liste est le plus récent : c'est lui que le carrousel affiche d'abord.
insert into public.reviews (product_id, author_name, rating, comment, status, created_at)
select p.id, r.author_name, r.rating, r.comment, r.status::public.review_status,
  now() - (r.ord * interval '1 day')
from (values
  ('kiara-clear', 'Aminata K.', 5, 'J''ai testé le gel douche Kiara-Clear et ma peau est vraiment plus douce et lumineuse. Je suis très satisfaite ! Merci Source d''Éclat !', 'approved', 1),
  ('kiara-clear', 'Fatou D.', 5, 'Il sent bon et l''exfoliation reste douce, même sur peau sensible.', 'approved', 2),
  ('kiara-clear', 'Mariam T.', 4, 'Très bon gel douche, livré en 48h à Yopougon.', 'approved', 3),
  ('savon-noir', 'Awa B.', 5, 'Mes petits boutons ont nettement diminué en deux semaines.', 'approved', 4),
  ('ly-soai', 'Christelle N.', 5, 'L''odeur vanille et miel est un vrai plaisir le matin.', 'approved', 5),
  ('ly-soai-coco', 'Kadi S.', 4, 'Peau hydratée toute la journée, je recommande.', 'pending', 6)
) as r (slug, author_name, rating, comment, status, ord)
join public.products p on p.slug = r.slug
where not exists (
  select 1 from public.reviews existing
  where existing.product_id = p.id
    and existing.author_name = r.author_name
    and existing.comment = r.comment
);

commit;

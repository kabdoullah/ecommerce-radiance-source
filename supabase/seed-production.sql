-- ============================================================================
-- CONTENU INITIAL DE LA BOUTIQUE — PRODUCTION
-- À exécuter UNE fois dans l'éditeur SQL du tableau de bord Supabase, après
-- `supabase db push`. N'est lancé ni par `db push` ni par `db reset`.
--
-- Contenus repris de la maquette. Volontairement absents :
--   - réseaux sociaux (à saisir dans Admin → Paramètres) ;
--   - avis clients (seuls de vrais avis doivent être publiés) ;
--   - images (à ajouter ensuite depuis l'administration).
--
-- Ré-exécutable : catégories et produits déjà présents (même slug) ne sont
-- pas modifiés. Les textes de la boutique, eux, sont réécrits.
-- ============================================================================

begin;

update public.store_settings set
  tagline = 'Beauté • Soin • Éclat',
  whatsapp_number = '2250596069291',
  contact_phone = '+225 05 96 06 92 91',
  contact_email = 'kofficolombe222@gmail.com',
  address = 'Abidjan, Côte d''Ivoire',
  delivery_summary = 'Livraison partout en Côte d''Ivoire',
  delivery_info = 'Livraison partout en Côte d''Ivoire sous 24h à 72h.',
  payment_summary = 'Paiement à la livraison ou mobile money',
  payment_info = 'À la livraison ou via Mobile Money (MTN, Orange).',
  hero_script = 'Votre beauté, notre passion.',
  hero_subtitle = 'Découvrez notre sélection de produits de beauté et de soins pour révéler votre éclat naturel.',
  hero_side_quote = 'Une peau saine, une beauté naturelle, une confiance renouvelée.',
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
on conflict (slug) do nothing;

-- Stock non suivi (null) : à renseigner depuis l'administration si besoin.
insert into public.products
  (name, slug, subtitle, description, price, category_id, is_active, is_featured)
select p.name, p.slug, p.subtitle, p.description, p.price, c.id, true, true
from (values
  ('Kiara-Clear', 'kiara-clear', 'Gel douche exfoliant',
   'Gel douche exfoliant qui nettoie en profondeur et laisse la peau douce et éclatante.',
   5000, 'gels-douche-soins-corps'),
  ('Ly-Soai-Coco', 'ly-soai-coco', 'Gel douche hydratant',
   'Gel douche hydratant à la noix de coco.',
   5000, 'gels-douche-soins-corps'),
  ('Ly-Soaï', 'ly-soai', 'Gel douche vanille & miel',
   'Gel douche gourmand à la vanille et au miel.',
   5000, 'gels-douche-soins-corps'),
  ('Savon noir', 'savon-noir', 'Anti imperfections',
   'Savon noir traditionnel pour une peau nette.',
   2000, 'savons-naturels'),
  ('Savon éclaircissant', 'savon-eclaircissant', 'Teint lumineux',
   'Savon pour un teint unifié et lumineux.',
   2500, 'savons-naturels')
) as p (name, slug, subtitle, description, price, category_slug)
join public.categories c on c.slug = p.category_slug
on conflict (slug) do nothing;

commit;

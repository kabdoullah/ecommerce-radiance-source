-- Contenus éditables nécessaires à la maquette de la boutique.

-- Icône affichée dans la pastille de la catégorie (liste fermée, voir src/features/categories/icons.tsx).
alter table public.categories
  add column icon text not null default 'leaf'
    check (icon in ('bottle', 'soap', 'face', 'hair', 'gift', 'leaf', 'droplet', 'flower', 'sparkles'));

alter table public.products
  add column subtitle text not null default '' check (char_length(subtitle) <= 80),
  -- Un point fort par ligne (3 maximum affichés).
  add column highlights text not null default '' check (char_length(highlights) <= 300),
  add column usage_tips text not null default '' check (char_length(usage_tips) <= 1000),
  add column precautions text not null default '' check (char_length(precautions) <= 1000),
  add column skin_type text not null default '' check (char_length(skin_type) <= 80),
  add column volume text not null default '' check (char_length(volume) <= 40);

alter table public.store_settings
  add column hero_script text not null default '' check (char_length(hero_script) <= 120),
  add column hero_side_quote text not null default '' check (char_length(hero_side_quote) <= 200),
  add column delivery_summary text not null default '' check (char_length(delivery_summary) <= 80),
  add column payment_summary text not null default '' check (char_length(payment_summary) <= 80),
  add column payment_info text not null default '' check (char_length(payment_info) <= 300),
  -- Un engagement par ligne (3 maximum), affichés dans « À propos ».
  add column about_highlights text not null default '' check (char_length(about_highlights) <= 300);

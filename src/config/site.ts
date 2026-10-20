/**
 * URL publique du site (balises canoniques, sitemap, Open Graph).
 * Sur Netlify, `URL` est fournie automatiquement ; NEXT_PUBLIC_SITE_URL permet de la forcer
 * (domaine personnalisé).
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Code ISO 4217 du franc CFA utilisé dans les données structurées (Google).
 * XOF = Afrique de l'Ouest (UEMOA), XAF = Afrique centrale (CEMAC).
 */
export const CURRENCY_CODE = "XOF";

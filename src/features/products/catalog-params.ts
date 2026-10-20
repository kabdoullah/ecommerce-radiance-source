export const CATALOG_PAGE_SIZE = 12;

export const CATALOG_SORTS = {
  recent: "Nouveautés",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  name: "Nom (A → Z)",
} as const;

export type CatalogSort = keyof typeof CATALOG_SORTS;

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/** Normalise les paramètres d'URL du catalogue (valeurs inconnues ignorées). */
export function parseCatalogParams(raw: RawParams) {
  const sort = first(raw.tri);
  const page = Number.parseInt(first(raw.page), 10);
  const category = first(raw.categorie);

  return {
    query: first(raw.q).slice(0, 80),
    category: /^[a-z0-9-]{1,80}$/.test(category) ? category : null,
    sort: (sort in CATALOG_SORTS ? sort : "recent") as CatalogSort,
    page: Number.isFinite(page) && page > 0 && page <= 500 ? page : 1,
  };
}

export type CatalogParams = ReturnType<typeof parseCatalogParams>;

export function catalogHref(params: Partial<CatalogParams>): string {
  const search = new URLSearchParams();
  if (params.query) search.set("q", params.query);
  if (params.category) search.set("categorie", params.category);
  if (params.sort && params.sort !== "recent") search.set("tri", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/boutique?${query}` : "/boutique";
}

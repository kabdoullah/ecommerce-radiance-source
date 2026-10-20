import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import { splitLines } from "@/lib/utils/text";
import { CATALOG_PAGE_SIZE, type CatalogSort } from "./catalog-params";

export type ProductImage = { path: string; alt: string };

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number | null;
  category: { name: string; slug: string } | null;
  image: ProductImage | null;
};

export type ProductDetail = ProductCardData & {
  description: string;
  highlights: string[];
  usageTips: string;
  precautions: string;
  skinType: string;
  volume: string;
  categoryId: string | null;
  images: ProductImage[];
};

const CARD_COLUMNS =
  "id, name, slug, subtitle, price, compare_at_price, stock_quantity, category:categories(name, slug), product_images(storage_path, alt_text, sort_order)";

type CardRow = {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number | null;
  category: { name: string; slug: string } | null;
  product_images: { storage_path: string; alt_text: string; sort_order: number }[];
};

function toImages(rows: CardRow["product_images"], fallbackAlt: string): ProductImage[] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({ path: image.storage_path, alt: image.alt_text || fallbackAlt }));
}

function toCard(row: CardRow): ProductCardData {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    subtitle: row.subtitle,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    stockQuantity: row.stock_quantity,
    category: row.category,
    image: toImages(row.product_images, row.name)[0] ?? null,
  };
}

type DetailColumns = {
  description: string;
  category_id: string | null;
  highlights: string;
  usage_tips: string;
  precautions: string;
  skin_type: string;
  volume: string;
};

function fail(context: string, message: string): never {
  throw new Error(`${context} : ${message}`);
}

export function isInStock(product: Pick<ProductCardData, "stockQuantity">): boolean {
  return product.stockQuantity === null || product.stockQuantity > 0;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);

  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("updated_at", { ascending: false })
    .limit(limit)
    .overrideTypes<CardRow[], { merge: false }>();
  if (error) fail("Lecture des produits mis en avant impossible", error.message);
  return data.map(toCard);
}

/** Échappe les jokers de LIKE saisis par le visiteur. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function getCatalog(params: {
  query: string;
  category: string | null;
  sort: CatalogSort;
  page: number;
}): Promise<{ products: ProductCardData[]; total: number }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);

  const supabase = createPublicClient();
  let request = supabase
    .from("products")
    .select(
      params.category
        ? CARD_COLUMNS.replace("category:categories(", "category:categories!inner(")
        : CARD_COLUMNS,
      { count: "exact" },
    )
    .eq("is_active", true);

  if (params.query) request = request.ilike("name", `%${escapeLike(params.query)}%`);
  if (params.category) request = request.eq("category.slug", params.category);

  switch (params.sort) {
    case "price-asc":
      request = request.order("price", { ascending: true });
      break;
    case "price-desc":
      request = request.order("price", { ascending: false });
      break;
    case "name":
      request = request.order("name", { ascending: true });
      break;
    default:
      request = request.order("created_at", { ascending: false });
  }

  const from = (params.page - 1) * CATALOG_PAGE_SIZE;
  const { data, error, count } = await request
    .order("id")
    .range(from, from + CATALOG_PAGE_SIZE - 1)
    .overrideTypes<CardRow[], { merge: false }>();

  // PostgREST répond PGRST103 quand la page demandée dépasse le nombre de résultats.
  if (error?.code === "PGRST103") return { products: [], total: count ?? 0 };
  if (error) fail("Lecture du catalogue impossible", error.message);
  return { products: data.map(toCard), total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);

  const { data, error } = await createPublicClient()
    .from("products")
    .select(`${CARD_COLUMNS}, description, category_id, highlights, usage_tips, precautions, skin_type, volume`)
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle()
    .overrideTypes<
      (CardRow & DetailColumns) | null,
      { merge: false }
    >();
  if (error) fail("Lecture du produit impossible", error.message);
  if (!data) return null;

  return {
    ...toCard(data),
    description: data.description,
    highlights: splitLines(data.highlights, 3),
    usageTips: data.usage_tips,
    precautions: data.precautions,
    skinType: data.skin_type,
    volume: data.volume,
    categoryId: data.category_id,
    images: toImages(data.product_images, data.name),
  };
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);

  if (!categoryId) return [];
  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("is_featured", { ascending: false })
    .limit(limit)
    .overrideTypes<CardRow[], { merge: false }>();
  if (error) fail("Lecture des produits associés impossible", error.message);
  return data.map(toCard);
}

/** Slugs publiés, pour le sitemap et le pré-rendu des fiches produits. */
export async function getPublishedProductSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);

  const { data, error } = await createPublicClient()
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1000);
  if (error) fail("Lecture des produits impossible", error.message);
  return data.map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
}

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";

export type PublicReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  product: { name: string; slug: string } | null;
};

type ReviewRow = {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
  product: { name: string; slug: string; is_active: boolean } | null;
};

function toReview(row: ReviewRow): PublicReview {
  return {
    id: row.id,
    authorName: row.author_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    product: row.product ? { name: row.product.name, slug: row.product.slug } : null,
  };
}

const COLUMNS =
  "id, author_name, rating, comment, created_at, product:products!inner(name, slug, is_active)";

export async function getProductReviews(productId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.reviews);

  const { data, error } = await createPublicClient()
    .from("reviews")
    .select(COLUMNS)
    .eq("status", "approved")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50)
    .overrideTypes<ReviewRow[], { merge: false }>();
  if (error) throw new Error(`Lecture des avis impossible : ${error.message}`);

  const reviews = data.map(toReview);
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;
  return { reviews, average };
}

/** Avis approuvés les plus récents, pour la page d'accueil (section masquée s'il n'y en a pas). */
export async function getRecentReviews(limit = 3): Promise<PublicReview[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.reviews);

  const { data, error } = await createPublicClient()
    .from("reviews")
    .select(COLUMNS)
    .eq("status", "approved")
    .eq("product.is_active", true)
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<ReviewRow[], { merge: false }>();
  if (error) throw new Error(`Lecture des avis impossible : ${error.message}`);
  return data.map(toReview);
}

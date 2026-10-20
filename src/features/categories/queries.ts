import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import { toCategoryIcon, type CategoryIcon } from "./icons";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
  icon: CategoryIcon;
};

export async function getActiveCategories(): Promise<PublicCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);

  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id, name, slug, description, image_path, icon")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`Lecture des catégories impossible : ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imagePath: row.image_path,
    icon: toCategoryIcon(row.icon),
  }));
}

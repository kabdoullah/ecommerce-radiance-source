import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database";

export type StoreSettings = Tables<"store_settings">;

export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.settings);

  const { data, error } = await createPublicClient()
    .from("store_settings")
    .select("*")
    .single();
  if (error) throw new Error(`Lecture des paramètres impossible : ${error.message}`);
  return data;
}

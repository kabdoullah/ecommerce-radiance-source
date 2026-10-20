import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Client navigateur de l'espace admin : sert uniquement à envoyer les images
 * directement vers Supabase Storage (les politiques exigent un administrateur).
 */
export function createBrowserSupabase() {
  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}

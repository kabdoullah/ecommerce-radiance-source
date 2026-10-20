import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Client anonyme sans cookies, pour les lectures publiques mises en cache
 * (catalogue, paramètres) et les fonctions publiques (create_order, submit_review).
 * Les droits sont limités par les politiques RLS du rôle `anon`.
 */
export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

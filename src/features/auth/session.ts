import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Couche d'accès admin : un utilisateur connecté n'est administrateur que s'il
 * possède une ligne dans admin_profiles (table non modifiable via l'API).
 * Mémorisé pour la durée d'une requête.
 */
export const getAdmin = cache(async () => {
  // La session dépend de la requête (cookies, expiration) : jamais pré-rendue.
  await connection();
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  return {
    supabase,
    user: { id: user.id, email: user.email ?? "", displayName: profile.display_name },
  };
});

/** À appeler en tête de chaque page et action d'administration. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/connexion");
  return admin;
}

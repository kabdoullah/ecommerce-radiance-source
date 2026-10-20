import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { MEDIA_BUCKET } from "./media";

/**
 * Supprime les fichiers d'un dossier qui ne sont plus référencés (envois
 * abandonnés, images remplacées). Échec silencieux : le nettoyage ne doit
 * jamais bloquer l'enregistrement qui l'a déclenché.
 */
export async function removeUnreferencedFiles(
  supabase: SupabaseClient<Database>,
  folder: string,
  keep: (string | null)[],
) {
  const { data: files, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(folder, { limit: 200 });
  if (error || !files) return;

  const kept = new Set(keep.filter(Boolean));
  const orphans = files
    .filter((file) => file.id !== null)
    .map((file) => `${folder}/${file.name}`)
    .filter((path) => !kept.has(path));
  if (orphans.length > 0) await supabase.storage.from(MEDIA_BUCKET).remove(orphans);
}

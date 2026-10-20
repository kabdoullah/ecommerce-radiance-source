"use server";

import { refresh, updateTag } from "next/cache";
import { requireAdmin } from "@/features/auth/session";
import { validationError, type ActionResult } from "@/lib/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { removeUnreferencedFiles } from "@/lib/storage-cleanup";
import { readSettingsForm } from "./settings-schema";

export async function saveSettings(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = readSettingsForm(formData);
  if (!parsed.success) return validationError(parsed.error);

  const { error } = await supabase.from("store_settings").update(parsed.data).eq("id", true);
  if (error) {
    return { status: "error", message: "Les paramètres n'ont pas pu être enregistrés. Réessayez." };
  }

  // Images remplacées ou envois abandonnés : on ne garde que les fichiers utilisés.
  await removeUnreferencedFiles(supabase, "settings", [
    parsed.data.logo_path,
    parsed.data.hero_image_path,
    parsed.data.about_image_path,
  ]);

  updateTag(CACHE_TAGS.settings);
  refresh();
  return { status: "success", message: "Paramètres enregistrés. La boutique est à jour." };
}

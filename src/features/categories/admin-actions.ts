"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/session";
import { dbErrorMessage, validationError, type ActionResult } from "@/lib/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { SLUG_PATTERN, slugify } from "@/lib/utils/slug";
import { CATEGORY_ICONS, type CategoryIcon } from "./icons";

const categorySchema = z
  .object({
    id: z.union([z.literal("").transform(() => null), z.uuid()]),
    name: z.string().trim().min(1, "Indiquez un nom.").max(80, "80 caractères maximum."),
    slug: z.string().trim().toLowerCase().max(80, "80 caractères maximum."),
    description: z.string().trim().max(500, "500 caractères maximum."),
    icon: z.enum(Object.keys(CATEGORY_ICONS) as [CategoryIcon, ...CategoryIcon[]]),
    sortOrder: z.coerce.number().int("Nombre entier attendu.").min(0).max(9999),
    isActive: z.union([z.literal("on"), z.null()]).transform((value) => value === "on"),
  })
  .transform((data, ctx) => {
    const slug = data.slug || slugify(data.name);
    if (!SLUG_PATTERN.test(slug)) {
      ctx.addIssue({
        code: "custom",
        path: ["slug"],
        message: "Lettres minuscules sans accents, chiffres et tirets uniquement.",
      });
    }
    return {
      id: data.id,
      values: {
        name: data.name,
        slug,
        description: data.description || null,
        sort_order: data.sortOrder,
        icon: data.icon,
        is_active: data.isActive,
      },
    };
  });

export async function saveCategory(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = categorySchema.safeParse({
    id: formData.get("id") ?? "",
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    sortOrder: formData.get("sortOrder") || 0,
    icon: formData.get("icon") ?? "leaf",
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const { id, values } = parsed.data;
  const { error } = id
    ? await supabase.from("categories").update(values).eq("id", id)
    : await supabase.from("categories").insert(values);
  if (error) {
    const message = dbErrorMessage(error, "La catégorie n'a pas pu être enregistrée.");
    return {
      status: "error",
      message,
      fieldErrors: error.code === "23505" ? { slug: message } : undefined,
    };
  }

  updateTag(CACHE_TAGS.catalog);
  refresh();
  return {
    status: "success",
    message: id ? "Catégorie enregistrée." : `Catégorie « ${values.name} » créée.`,
  };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(categoryId).success) {
    return { status: "error", message: "Catégorie introuvable." };
  }

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (countError) return { status: "error", message: "Vérification impossible. Réessayez." };
  if (count && count > 0) {
    return {
      status: "error",
      message: `Cette catégorie contient ${count} produit(s). Déplacez-les vers une autre catégorie ou masquez la catégorie.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) {
    return { status: "error", message: dbErrorMessage(error, "Suppression impossible.") };
  }
  updateTag(CACHE_TAGS.catalog);
  refresh();
  return { status: "success", message: "Catégorie supprimée." };
}

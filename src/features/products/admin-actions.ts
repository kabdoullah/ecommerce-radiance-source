"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/session";
import { dbErrorMessage, validationError, type ActionResult } from "@/lib/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { MEDIA_BUCKET } from "@/lib/media";
import { removeUnreferencedFiles } from "@/lib/storage-cleanup";
import { readProductForm } from "./product-schema";

const id = z.uuid();

function saveError(error: { code?: string; message: string }, fallback: string): ActionResult {
  const message = dbErrorMessage(error, fallback);
  return error.code === "23505"
    ? { status: "error", message, fieldErrors: { slug: message } }
    : { status: "error", message };
}

export async function saveProduct(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const productId = formData.get("id");
  const parsed = readProductForm(formData);
  if (!parsed.success) return validationError(parsed.error);

  if (productId) {
    const parsedId = id.safeParse(productId);
    if (!parsedId.success) return { status: "error", message: "Produit introuvable." };
    const { error } = await supabase.from("products").update(parsed.data).eq("id", parsedId.data);
    if (error) return saveError(error, "Le produit n'a pas pu être enregistré.");

    // Envois de photos interrompus : les fichiers non rattachés au produit sont effacés.
    const { data: images } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", parsedId.data);
    if (images) {
      await removeUnreferencedFiles(
        supabase,
        `products/${parsedId.data}`,
        images.map((image) => image.storage_path),
      );
    }
    updateTag(CACHE_TAGS.catalog);
    refresh();
    return { status: "success", message: "Modifications enregistrées." };
  }

  const { data, error } = await supabase.from("products").insert(parsed.data).select("id").single();
  if (error) return saveError(error, "Le produit n'a pas pu être créé.");
  updateTag(CACHE_TAGS.catalog);
  redirect(`/admin/produits/${data.id}?nouveau=1`);
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsedId = id.safeParse(productId);
  if (!parsedId.success) return { status: "error", message: "Produit introuvable." };

  const { count, error: countError } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", parsedId.data);
  if (countError) {
    return { status: "error", message: "Vérification des commandes impossible. Réessayez." };
  }
  if (count && count > 0) {
    return {
      status: "error",
      message: `Ce produit figure dans ${count} ligne(s) de commande. Pour garder l'historique intact, décochez plutôt « Publié sur la boutique ».`,
    };
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", parsedId.data);
  const { error } = await supabase.from("products").delete().eq("id", parsedId.data);
  if (error) {
    return { status: "error", message: dbErrorMessage(error, "Le produit n'a pas pu être supprimé.") };
  }

  if (images?.length) {
    await supabase.storage.from(MEDIA_BUCKET).remove(images.map((image) => image.storage_path));
  }
  updateTag(CACHE_TAGS.catalog);
  redirect("/admin/produits?supprime=1");
}

export async function addProductImage(
  productId: string,
  storagePath: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsedId = id.safeParse(productId);
  if (!parsedId.success) return { status: "error", message: "Produit introuvable." };
  // Le chemin doit avoir été produit par uploadImage() pour ce produit.
  const expected = new RegExp(`^products/${parsedId.data}/[0-9a-f-]{36}\\.(webp|jpg)$`);
  if (!expected.test(storagePath)) return { status: "error", message: "Image invalide." };

  const { data: last } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", parsedId.data)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("product_images").insert({
    product_id: parsedId.data,
    storage_path: storagePath,
    sort_order: (last?.sort_order ?? -1) + 1,
  });
  if (error) {
    // Pas de fichier orphelin : l'image envoyée est retirée si son enregistrement échoue.
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    return { status: "error", message: "L'image n'a pas pu être ajoutée au produit." };
  }
  updateTag(CACHE_TAGS.catalog);
  refresh();
  return { status: "success", message: "Image ajoutée." };
}

export async function deleteProductImage(imageId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsedId = id.safeParse(imageId);
  if (!parsedId.success) return { status: "error", message: "Image introuvable." };

  const { data: image, error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", parsedId.data)
    .select("storage_path")
    .maybeSingle();
  if (error || !image) return { status: "error", message: "L'image n'a pas pu être supprimée." };

  await supabase.storage.from(MEDIA_BUCKET).remove([image.storage_path]);
  updateTag(CACHE_TAGS.catalog);
  refresh();
  return { status: "success", message: "Image supprimée." };
}

export async function moveProductImage(
  imageId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsedId = id.safeParse(imageId);
  if (!parsedId.success) return { status: "error", message: "Image introuvable." };

  const { data: image } = await supabase
    .from("product_images")
    .select("product_id")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (!image) return { status: "error", message: "Image introuvable." };

  const { data: images } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", image.product_id)
    .order("sort_order")
    .order("created_at");
  const ordered = (images ?? []).map((row) => row.id);
  const index = ordered.indexOf(parsedId.data);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ordered.length) return { status: "idle" };

  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  const results = await Promise.all(
    ordered.map((rowId, position) =>
      supabase.from("product_images").update({ sort_order: position }).eq("id", rowId),
    ),
  );
  if (results.some((result) => result.error)) {
    return { status: "error", message: "L'ordre des images n'a pas pu être enregistré." };
  }
  updateTag(CACHE_TAGS.catalog);
  refresh();
  return { status: "success", message: "Ordre des images mis à jour." };
}

const altSchema = z.object({
  id: z.uuid(),
  alt: z.string().trim().max(200, "200 caractères maximum."),
});

export async function updateImageAlt(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = altSchema.safeParse({ id: formData.get("id"), alt: formData.get("alt") ?? "" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("product_images")
    .update({ alt_text: parsed.data.alt })
    .eq("id", parsed.data.id);
  if (error) return { status: "error", message: "La description n'a pas pu être enregistrée." };
  updateTag(CACHE_TAGS.catalog);
  return { status: "success", message: "Description enregistrée." };
}

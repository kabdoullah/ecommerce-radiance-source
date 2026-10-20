"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";

const STATUS_MESSAGES = {
  approved: "Avis publié.",
  hidden: "Avis masqué.",
  pending: "Avis remis en attente.",
} as const;

export async function setReviewStatus(
  reviewId: string,
  status: keyof typeof STATUS_MESSAGES,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(reviewId).success || !(status in STATUS_MESSAGES)) {
    return { status: "error", message: "Avis introuvable." };
  }
  const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);
  if (error) return { status: "error", message: "L'avis n'a pas pu être modifié." };

  updateTag(CACHE_TAGS.reviews);
  refresh();
  return { status: "success", message: STATUS_MESSAGES[status] };
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(reviewId).success) {
    return { status: "error", message: "Avis introuvable." };
  }
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { status: "error", message: "L'avis n'a pas pu être supprimé." };

  updateTag(CACHE_TAGS.reviews);
  refresh();
  return { status: "success", message: "Avis supprimé." };
}

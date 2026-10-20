"use server";

import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

const reviewSchema = z.object({
  productId: z.uuid(),
  authorName: z
    .string()
    .trim()
    .min(2, "Indiquez votre prénom (2 caractères minimum).")
    .max(60, "60 caractères maximum."),
  rating: z.coerce.number().int().min(1, "Choisissez une note.").max(5, "Choisissez une note."),
  comment: z
    .string()
    .trim()
    .min(5, "Votre avis est trop court (5 caractères minimum).")
    .max(1000, "1000 caractères maximum."),
});

export type ReviewFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function submitReview(
  _previous: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  // Champ invisible rempli uniquement par des robots.
  if (formData.get("website")) return { status: "success" };

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    authorName: formData.get("authorName"),
    rating: formData.get("rating") ?? 0,
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Certains champs sont à corriger.", fieldErrors };
  }

  const { error } = await createPublicClient().rpc("submit_review", {
    p_product_id: parsed.data.productId,
    p_author_name: parsed.data.authorName,
    p_rating: parsed.data.rating,
    p_comment: parsed.data.comment,
  });
  if (error) {
    return {
      status: "error",
      message:
        error.message === "rate_limited"
          ? "Beaucoup d'avis viennent d'être envoyés. Réessayez dans quelques minutes."
          : "Votre avis n'a pas pu être envoyé. Réessayez plus tard.",
    };
  }
  return { status: "success" };
}

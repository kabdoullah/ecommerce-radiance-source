import type { z } from "zod";

/** Résultat renvoyé par les actions serveur de l'administration. */
export type ActionResult =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const IDLE: ActionResult = { status: "idle" };

export function validationError(error: z.ZodError): ActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  return { status: "error", message: "Certains champs sont à corriger.", fieldErrors };
}

/** Message lisible pour les erreurs PostgreSQL courantes. */
export function dbErrorMessage(error: { code?: string; message: string }, fallback: string): string {
  if (error.code === "23505") {
    return "Cette adresse (slug) est déjà utilisée. Choisissez-en une autre.";
  }
  if (error.code === "23503") {
    return "Cet élément est encore utilisé ailleurs et ne peut pas être supprimé.";
  }
  if (error.code === "42501") return "Vous n'avez pas les droits pour effectuer cette action.";
  return fallback;
}

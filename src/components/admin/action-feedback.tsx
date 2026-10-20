import { FormMessage } from "@/components/ui/field";
import type { ActionResult } from "@/lib/action-result";

/** Affiche le résultat d'une action serveur, uniquement après sa réponse. */
export function ActionFeedback({ state }: { state: ActionResult }) {
  if (state.status === "idle") return null;
  return (
    <FormMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FormMessage>
  );
}

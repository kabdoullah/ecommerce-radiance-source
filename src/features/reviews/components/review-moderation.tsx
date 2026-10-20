"use client";

import { useState, useTransition } from "react";
import { ActionFeedback } from "@/components/admin/action-feedback";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Button } from "@/components/ui/button";
import { IDLE, type ActionResult } from "@/lib/action-result";
import { deleteReview, setReviewStatus } from "../admin-actions";

export function ReviewModeration({
  reviewId,
  status,
}: {
  reviewId: string;
  status: "pending" | "approved" | "hidden";
}) {
  const [result, setResult] = useState<ActionResult>(IDLE);
  const [pending, startTransition] = useTransition();
  const run = (next: "approved" | "hidden") =>
    startTransition(async () => setResult(await setReviewStatus(reviewId, next)));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status !== "approved" && (
          <Button size="sm" disabled={pending} onClick={() => run("approved")}>
            Publier
          </Button>
        )}
        {status !== "hidden" && (
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => run("hidden")}>
            Masquer
          </Button>
        )}
        <ConfirmAction
          label="Supprimer"
          title="Supprimer cet avis ?"
          description="L'avis sera définitivement effacé. Pour simplement le retirer de la boutique, utilisez « Masquer »."
          confirmLabel="Supprimer l'avis"
          action={() => deleteReview(reviewId)}
        />
      </div>
      <ActionFeedback state={result} />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useActionForm } from "@/lib/use-action-form";
import { ActionFeedback } from "@/components/admin/action-feedback";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Button } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/field";
import { IDLE, type ActionResult } from "@/lib/action-result";
import { saveOrderNote, setOrderPayment, updateOrderStatus } from "../admin-actions";
import {
  ORDER_STATUS_HELP,
  ORDER_STATUS_LABELS,
  allowedNextStatuses,
  type OrderStatus,
  type PaymentStatus,
} from "../status";

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [result, setResult] = useState<ActionResult>(IDLE);
  const [pending, startTransition] = useTransition();
  const allowed = allowedNextStatuses(status);
  const next = allowed.filter((value) => value !== "cancelled");
  const canCancel = allowed.includes("cancelled");

  if (allowed.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        {ORDER_STATUS_HELP[status]} Ce statut est définitif.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">{ORDER_STATUS_HELP[status]}</p>
      {next.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {next.map((value, index) => (
            <Button
              key={value}
              size="sm"
              variant={index === 0 ? "primary" : "secondary"}
              disabled={pending}
              onClick={() =>
                startTransition(async () => setResult(await updateOrderStatus(orderId, value)))
              }
            >
              Passer à « {ORDER_STATUS_LABELS[value]} »
            </Button>
          ))}
        </div>
      )}
      {canCancel && (
        <ConfirmAction
          label="Annuler la commande"
          title="Annuler cette commande ?"
          description="La commande reste dans l'historique avec le statut « Annulée » et le stock réservé est remis en vente. Cette action est définitive."
          confirmLabel="Oui, annuler la commande"
          action={async () => {
            const outcome = await updateOrderStatus(orderId, "cancelled");
            setResult(outcome);
            return outcome;
          }}
        />
      )}
      <ActionFeedback state={result} />
    </div>
  );
}

export function PaymentControl({ orderId, status }: { orderId: string; status: PaymentStatus }) {
  const [result, setResult] = useState<ActionResult>(IDLE);
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">
        {status === "paid"
          ? "Le paiement a été vérifié (reçu sur votre compte ou en espèces)."
          : "Marquez la commande comme payée uniquement après avoir vérifié la réception de l'argent."}
      </p>
      <Button
        size="sm"
        variant={status === "paid" ? "secondary" : "primary"}
        disabled={pending}
        onClick={() =>
          startTransition(async () => setResult(await setOrderPayment(orderId, status !== "paid")))
        }
      >
        {status === "paid" ? "Annuler la vérification du paiement" : "J'ai reçu le paiement"}
      </Button>
      <ActionFeedback state={result} />
    </div>
  );
}

export function OrderNoteForm({ orderId, note }: { orderId: string; note: string | null }) {
  const [state, action, pending] = useActionForm(saveOrderNote, IDLE);
  return (
    <form onSubmit={action} className="space-y-3">
      <input type="hidden" name="id" value={orderId} />
      <label htmlFor="note" className="sr-only">
        Note interne
      </label>
      <textarea
        id="note"
        name="note"
        rows={3}
        maxLength={1000}
        defaultValue={note ?? ""}
        placeholder="Visible uniquement dans l'administration (ex. : livrée le 12/10, payée par mobile money)."
        className={inputStyles}
      />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer la note"}
      </Button>
      <ActionFeedback state={state} />
    </form>
  );
}

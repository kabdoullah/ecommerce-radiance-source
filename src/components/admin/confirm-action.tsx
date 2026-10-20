"use client";

import { useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import type { ActionResult } from "@/lib/action-result";

/**
 * Bouton qui demande une confirmation explicite (boîte de dialogue accessible)
 * avant d'exécuter une action serveur sensible ou irréversible.
 */
export function ConfirmAction({
  label,
  title,
  description,
  confirmLabel,
  action,
  variant = "danger",
  size = "sm",
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  action: () => Promise<ActionResult>;
  variant?: "danger" | "secondary" | "primary";
  size?: "sm" | "md";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => {
          setResult(null);
          dialogRef.current?.showModal();
        }}
      >
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-card bg-surface p-6 text-ink shadow-xl backdrop:bg-ink/40"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{description}</p>
        {result?.status === "error" && (
          <div className="mt-4">
            <FormMessage tone="error">{result.message}</FormMessage>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dialogRef.current?.close()}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const outcome = await action();
                setResult(outcome);
                if (outcome.status !== "error") dialogRef.current?.close();
              })
            }
          >
            {pending ? "Patientez…" : confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}

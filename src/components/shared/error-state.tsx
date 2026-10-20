"use client";

import { Button } from "@/components/ui/button";

/** Message affiché quand la base de données ne répond pas (aucune donnée fictive). */
export function ErrorState({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center" role="alert">
      <h1 className="font-display text-3xl">Service momentanément indisponible</h1>
      <p className="mt-3 text-ink-soft">
        Les informations n&apos;ont pas pu être chargées. Réessayez dans quelques instants ; si le
        problème persiste, contactez-nous sur WhatsApp.
      </p>
      <Button className="mt-8" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}

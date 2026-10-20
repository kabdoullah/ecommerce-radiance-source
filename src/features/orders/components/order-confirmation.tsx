"use client";

import { CircleCheck, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { buttonStyles } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { readLastOrder, saveLastOrder, type LastOrder } from "../last-order";

const noopSubscribe = () => () => {};
let snapshot: LastOrder | null | undefined;
function getSnapshot() {
  if (snapshot === undefined) snapshot = readLastOrder();
  return snapshot;
}

export function OrderConfirmation() {
  const lastOrder = useSyncExternalStore(noopSubscribe, getSnapshot, () => undefined);

  // Ouverture automatique de WhatsApp, une seule fois (pas de boucle au retour arrière).
  useEffect(() => {
    if (!lastOrder?.whatsappUrl || lastOrder.redirected) return;
    const url = lastOrder.whatsappUrl;
    saveLastOrder({ ...lastOrder, redirected: true });
    const timer = window.setTimeout(() => window.location.assign(url), 1200);
    return () => window.clearTimeout(timer);
  }, [lastOrder]);

  if (lastOrder === undefined) {
    return (
      <div className="mt-8 h-64 animate-pulse rounded-card bg-mist" role="status">
        <span className="sr-only">Chargement…</span>
      </div>
    );
  }

  if (lastOrder === null) {
    return (
      <div className="mt-8 rounded-card bg-mist px-6 py-14 text-center">
        <p className="font-display text-2xl">Aucune commande récente sur cet appareil.</p>
        <p className="mt-2 text-ink-soft">
          Pour suivre une commande passée, contactez-nous en indiquant son numéro.
        </p>
        <Link href="/boutique" className={buttonStyles("primary", "md", "mt-6")}>
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const { order, whatsappUrl } = lastOrder;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <p className="flex items-center gap-3 text-lg font-semibold text-success">
          <CircleCheck className="size-6 shrink-0" aria-hidden="true" />
          Commande n° {order.orderNumber} enregistrée
        </p>
        <p className="mt-4 max-w-[60ch] leading-relaxed text-ink-soft">
          {whatsappUrl
            ? "Dernière étape : envoyez-nous le récapitulatif sur WhatsApp pour confirmer la livraison et le mode de paiement. Votre commande n'est pas encore payée."
            : "Nous vous contacterons au numéro indiqué pour confirmer la livraison et le mode de paiement. Votre commande n'est pas encore payée."}
        </p>
        {whatsappUrl && (
          <a href={whatsappUrl} className={buttonStyles("primary", "lg", "mt-8")}>
            <MessageCircle className="size-5" aria-hidden="true" />
            Envoyer sur WhatsApp
          </a>
        )}
        <p className="mt-6">
          <Link href="/boutique" className="text-sm font-semibold text-cocoa hover:underline">
            Retour à la boutique
          </Link>
        </p>
      </div>

      <aside className="h-fit rounded-card bg-surface p-6" aria-labelledby="confirmation-summary">
        <h2 id="confirmation-summary" className="font-display text-2xl">
          Récapitulatif
        </h2>
        <ul className="mt-5 space-y-3 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between gap-4">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span className="shrink-0">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between">
              <dt>Livraison</dt>
              <dd>{formatPrice(order.deliveryFee)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total à régler</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

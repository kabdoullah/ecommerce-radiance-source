"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/shared/product-image";
import { Button, buttonStyles } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import { formatPrice } from "@/lib/utils/format";
import { MAX_QUANTITY, cartSubtotal } from "../cart-math";
import { cartActions } from "../cart-store";
import { lineProblem, useCartDetails } from "../use-cart-details";
import { QuantityInput } from "./quantity-input";

export function CartView({ deliveryFee }: { deliveryFee: number | null }) {
  const { status, lines, retry } = useCartDetails();
  const [confirmClear, setConfirmClear] = useState(false);

  if (status === "loading") {
    return (
      <div className="mt-8 h-48 animate-pulse rounded-card bg-mist" role="status">
        <span className="sr-only">Chargement du panier…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-8 space-y-4">
        <FormMessage tone="error">
          Impossible de vérifier les prix actuels de votre panier. Vérifiez votre connexion.
        </FormMessage>
        <Button variant="secondary" onClick={retry}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-8 rounded-card bg-mist px-6 py-14 text-center">
        <p className="font-display text-2xl">Votre panier est vide.</p>
        <p className="mt-2 text-ink-soft">Parcourez la boutique pour ajouter vos produits.</p>
        <Link href="/boutique" className={buttonStyles("primary", "md", "mt-6")}>
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const valid = lines.filter((line) => line.product && !lineProblem(line));
  const hasProblem = valid.length !== lines.length;
  const subtotal = cartSubtotal(
    valid.map((line) => ({ unitPrice: line.product!.price, quantity: line.quantity })),
  );

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => {
            const product = line.product;
            const problem = lineProblem(line);
            const name = product?.name ?? "Produit retiré de la boutique";
            return (
              <li key={line.productId} className="flex gap-4 py-5">
                <div className="w-20 shrink-0 sm:w-24">
                  <ProductImage image={product?.image ?? null} sizes="96px" />
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="space-y-1">
                    {product ? (
                      <Link
                        href={`/produits/${product.slug}`}
                        className="font-display text-lg hover:underline"
                      >
                        {name}
                      </Link>
                    ) : (
                      <p className="font-display text-lg text-ink-soft">{name}</p>
                    )}
                    {product && (
                      <p className="text-sm text-ink-soft">
                        {formatPrice(product.price)} l&apos;unité
                      </p>
                    )}
                    {problem && <p className="text-sm font-medium text-clay">{problem}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    {product && product.stockQuantity !== 0 && (
                      <QuantityInput
                        value={line.quantity}
                        max={product.stockQuantity ?? MAX_QUANTITY}
                        label={name}
                        onChange={(quantity) => cartActions.setQuantity(line.productId, quantity)}
                      />
                    )}
                    <div className="flex items-center gap-3">
                      {product && !problem && (
                        <span className="font-semibold">
                          {formatPrice(product.price * line.quantity)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => cartActions.remove(line.productId)}
                        className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-mist hover:text-clay"
                        aria-label={`Retirer ${name} du panier`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/boutique" className="text-sm font-semibold text-cocoa hover:underline">
            Continuer mes achats
          </Link>
          {confirmClear ? (
            <span className="flex flex-wrap items-center gap-2 text-sm">
              Vider tout le panier ?
              <Button size="sm" variant="danger" onClick={() => cartActions.clear()}>
                Oui, vider
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                Annuler
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirmClear(true)}>
              Vider le panier
            </Button>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-card bg-surface p-6" aria-labelledby="summary-title">
        <h2 id="summary-title" className="font-display text-2xl">
          Récapitulatif
        </h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd className="font-semibold">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Livraison</dt>
            <dd>{deliveryFee ? formatPrice(deliveryFee) : "Confirmée sur WhatsApp"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-semibold">Total estimé</dt>
            <dd className="font-semibold">{formatPrice(subtotal + (deliveryFee ?? 0))}</dd>
          </div>
        </dl>
        {hasProblem && (
          <p className="mt-4 text-sm text-clay">
            Retirez ou ajustez les articles signalés pour passer commande.
          </p>
        )}
        {hasProblem ? (
          <span
            className={buttonStyles("primary", "lg", "mt-6 w-full opacity-50")}
            aria-disabled="true"
          >
            Passer commande
          </span>
        ) : (
          <Link href="/commande" className={buttonStyles("primary", "lg", "mt-6 w-full")}>
            Passer commande
          </Link>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          Le montant final est recalculé à l&apos;enregistrement de la commande. Aucun paiement en
          ligne.
        </p>
      </aside>
    </div>
  );
}

"use client";

import { Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MAX_QUANTITY, clampQuantity } from "@/features/cart/cart-math";
import { cartActions } from "@/features/cart/cart-store";
import { OrderNowButton } from "./order-now-button";

/** Quantité + « Commander sur WhatsApp » (achat direct) ou ajout au panier. */
export function AddToCart({
  productId,
  stockQuantity,
}: {
  productId: string;
  stockQuantity: number | null;
}) {
  const max = stockQuantity === null ? MAX_QUANTITY : Math.min(MAX_QUANTITY, stockQuantity);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (max < 1) {
    return (
      <p className="rounded-card bg-mist px-4 py-3 text-sm">
        Ce produit est momentanément épuisé. Écrivez-nous sur WhatsApp pour connaître la date de
        retour.
      </p>
    );
  }

  const update = (value: number) => {
    setAdded(false);
    setQuantity(Math.min(max, clampQuantity(value)));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-full border border-line bg-surface has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-cocoa">
          <button
            type="button"
            onClick={() => update(quantity - 1)}
            disabled={quantity <= 1}
            className="flex size-12 items-center justify-center rounded-full disabled:opacity-40"
            aria-label="Diminuer la quantité"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <label htmlFor="quantity" className="sr-only">
            Quantité
          </label>
          <input
            id="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            value={quantity}
            onChange={(event) => update(Number(event.target.value))}
            className="w-10 bg-transparent text-center font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => update(quantity + 1)}
            disabled={quantity >= max}
            className="flex size-12 items-center justify-center rounded-full disabled:opacity-40"
            aria-label="Augmenter la quantité"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
        <OrderNowButton
          productId={productId}
          quantity={quantity}
          size="lg"
          className="min-w-0 flex-1"
        />
      </div>
      <p role="status" className="flex min-h-6 flex-wrap items-center gap-2 text-sm">
        {added ? (
          <span className="inline-flex flex-wrap items-center gap-2 text-success">
            <Check className="size-4" aria-hidden="true" />
            Ajouté au panier.
            <Link href="/panier" className="font-semibold text-cocoa underline underline-offset-2">
              Voir le panier
            </Link>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              cartActions.add(productId, quantity);
              setAdded(true);
            }}
            className="font-semibold text-cocoa underline underline-offset-2 hover:text-cocoa-deep"
          >
            Ajouter au panier et continuer mes achats
          </button>
        )}
      </p>
    </div>
  );
}

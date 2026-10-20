"use client";

import { useEffect, useMemo, useState } from "react";
import { getCartProducts, type CartProduct } from "@/features/orders/actions";
import type { CartLine } from "./cart-math";
import { useCart, useCartReady } from "./cart-store";

export type CartDetailLine = CartLine & { product: CartProduct | null };

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; products: Map<string, CartProduct> };

/** Associe le panier local aux prix et stocks actuels relus côté serveur. */
export function useCartDetails() {
  const lines = useCart();
  const ready = useCartReady();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const idsKey = lines
    .map((line) => line.productId)
    .sort()
    .join(",");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    getCartProducts(idsKey ? idsKey.split(",") : [])
      .then((result) => {
        if (cancelled) return;
        setState(
          result.ok
            ? { status: "ready", products: new Map(result.products.map((p) => [p.id, p])) }
            : { status: "error" },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey, ready, attempt]);

  const details = useMemo<CartDetailLine[]>(() => {
    if (state.status !== "ready") return [];
    return lines.map((line) => ({ ...line, product: state.products.get(line.productId) ?? null }));
  }, [lines, state]);

  return {
    status: !ready ? ("loading" as const) : state.status,
    lines: details,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((value) => value + 1);
    },
  };
}

/** Une ligne est commandable si le produit existe encore et que le stock suffit. */
export function lineProblem(line: CartDetailLine): string | null {
  if (!line.product) return "Ce produit n'est plus disponible.";
  const stock = line.product.stockQuantity;
  if (stock === 0) return "Rupture de stock.";
  if (stock !== null && line.quantity > stock) return `Il n'en reste que ${stock}.`;
  return null;
}

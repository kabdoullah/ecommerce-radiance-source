"use client";

import { useSyncExternalStore } from "react";
import {
  addToCart,
  parseStoredCart,
  removeFromCart,
  setLineQuantity,
  setOrAddLine,
  type CartLine,
} from "./cart-math";

/**
 * Panier anonyme conservé dans le navigateur (identifiants produits et quantités
 * uniquement). Prix et disponibilités sont toujours relus depuis le serveur.
 */
const STORAGE_KEY = "se-cart-v1";
const EMPTY: CartLine[] = [];

let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache === null) {
    try {
      cache = parseStoredCart(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      cache = [];
    }
  }
  return cache;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Navigation privée ou stockage plein : le panier reste valable pour cet onglet.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Vrai une fois le panier du navigateur chargé (évite d'afficher « panier vide » trop tôt). */
export function useCartReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export const cartActions = {
  add(productId: string, quantity: number) {
    write(addToCart(read(), productId, quantity));
  },
  order(productId: string, quantity: number) {
    write(setOrAddLine(read(), productId, quantity));
  },
  setQuantity(productId: string, quantity: number) {
    write(setLineQuantity(read(), productId, quantity));
  },
  remove(productId: string) {
    write(removeFromCart(read(), productId));
  },
  clear() {
    write([]);
  },
};

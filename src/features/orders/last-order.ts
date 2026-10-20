import type { PlaceOrderResult } from "./actions";

/** Récapitulatif de la dernière commande, conservé pour l'onglet courant uniquement. */
export type LastOrder = Extract<PlaceOrderResult, { ok: true }> & { redirected: boolean };

const KEY = "se-last-order";

export function saveLastOrder(value: LastOrder) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Stockage indisponible : la page de confirmation affichera un message générique.
  }
}

export function readLastOrder(): LastOrder | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastOrder) : null;
  } catch {
    return null;
  }
}

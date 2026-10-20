import type { Database } from "@/types/database";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

/** Ordre du parcours normal. Garder en phase avec guard_order_update() (migration SQL). */
export const ORDER_FLOW: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipping",
  "completed",
];

export const ORDER_STATUSES: readonly OrderStatus[] = [...ORDER_FLOW, "cancelled"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipping: "En livraison",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const ORDER_STATUS_HELP: Record<OrderStatus, string> = {
  pending: "Commande reçue, à confirmer avec le client sur WhatsApp.",
  confirmed: "Le client a confirmé la commande et les modalités.",
  preparing: "La commande est en cours de préparation.",
  shipping: "La commande a été remise au livreur ou est en route.",
  completed: "La commande a été livrée ou retirée.",
  cancelled: "Commande annulée. Le stock réservé a été restitué.",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Non payée",
  paid: "Paiement vérifié",
};

export function isFinalStatus(status: OrderStatus): boolean {
  return status === "completed" || status === "cancelled";
}

/** Avance uniquement (étapes sautables) ; annulation possible tant que la commande n'est pas finie. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to || isFinalStatus(from)) return false;
  if (to === "cancelled") return true;
  return ORDER_FLOW.indexOf(to) > ORDER_FLOW.indexOf(from);
}

export function allowedNextStatuses(from: OrderStatus): OrderStatus[] {
  return ORDER_STATUSES.filter((to) => canTransition(from, to));
}

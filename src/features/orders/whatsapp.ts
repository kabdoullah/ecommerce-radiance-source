import { formatPrice } from "@/lib/utils/format";

export type OrderSummary = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  customerNote: string | null;
  items: { productName: string; unitPrice: number; quantity: number; lineTotal: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export function buildOrderMessage(intro: string, order: OrderSummary): string {
  const lines = [
    intro.trim(),
    "",
    `Commande n° ${order.orderNumber}`,
    "",
    ...order.items.map(
      (item) =>
        `• ${item.productName} × ${item.quantity} — ${formatPrice(item.unitPrice)} l'unité = ${formatPrice(item.lineTotal)}`,
    ),
    "",
    `Sous-total : ${formatPrice(order.subtotal)}`,
  ];

  if (order.deliveryFee > 0) lines.push(`Livraison : ${formatPrice(order.deliveryFee)}`);
  lines.push(`Total : ${formatPrice(order.total)}`, "", `Nom : ${order.customerName}`);
  lines.push(`Téléphone : ${order.customerPhone}`);
  if (order.deliveryAddress) lines.push(`Livraison à : ${order.deliveryAddress}`);
  if (order.customerNote) lines.push(`Note : ${order.customerNote}`);

  return lines.join("\n");
}

/** Numéro au format international sans « + » ni espaces, ex. 2250700000000. */
export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Lien wa.me → intent Android. Chrome Android ouvre wa.me dans le navigateur et la page de
 * WhatsApp échoue souvent à lancer l'application ; l'intent la lance directement (WhatsApp
 * ou WhatsApp Business), et revient à wa.me si aucune n'est installée.
 */
export function toAndroidIntentUrl(waMeUrl: string): string {
  const url = new URL(waMeUrl);
  const phone = url.pathname.slice(1);
  const text = url.searchParams.get("text");
  const query = [phone && `phone=${phone}`, text && `text=${encodeURIComponent(text)}`]
    .filter(Boolean)
    .join("&");
  return `intent://send?${query}#Intent;scheme=whatsapp;S.browser_fallback_url=${encodeURIComponent(waMeUrl)};end`;
}

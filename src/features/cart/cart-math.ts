export const MAX_QUANTITY = 99;
export const MAX_CART_LINES = 30;

export type CartLine = {
  productId: string;
  quantity: number;
};

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

export function addToCart(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  const existing = lines.find((line) => line.productId === productId);
  if (existing) {
    return lines.map((line) =>
      line.productId === productId
        ? { ...line, quantity: clampQuantity(line.quantity + quantity) }
        : line,
    );
  }
  if (lines.length >= MAX_CART_LINES) return lines;
  return [...lines, { productId, quantity: clampQuantity(quantity) }];
}

export function setLineQuantity(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  return lines.map((line) =>
    line.productId === productId ? { ...line, quantity: clampQuantity(quantity) } : line,
  );
}

/** « Commander maintenant » : le produit figure dans le panier avec exactement cette quantité. */
export function setOrAddLine(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  return lines.some((line) => line.productId === productId)
    ? setLineQuantity(lines, productId, quantity)
    : addToCart(lines, productId, quantity);
}

export function removeFromCart(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((count, line) => count + line.quantity, 0);
}

/** Total indicatif affiché dans le panier ; le montant définitif est calculé par la base. */
export function cartSubtotal(lines: { unitPrice: number; quantity: number }[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

/** Relit un panier stocké dans le navigateur en ignorant toute donnée invalide. */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const lines: CartLine[] = [];
    for (const item of parsed) {
      if (
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "string" &&
        typeof item.quantity === "number"
      ) {
        if (!lines.some((line) => line.productId === item.productId)) {
          lines.push({ productId: item.productId, quantity: clampQuantity(item.quantity) });
        }
      }
    }
    return lines.slice(0, MAX_CART_LINES);
  } catch {
    return [];
  }
}

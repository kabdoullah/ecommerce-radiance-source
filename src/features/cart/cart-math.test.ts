import { describe, expect, it } from "vitest";
import {
  MAX_CART_LINES,
  MAX_QUANTITY,
  addToCart,
  cartItemCount,
  cartSubtotal,
  clampQuantity,
  parseStoredCart,
  removeFromCart,
  setLineQuantity,
  setOrAddLine,
} from "./cart-math";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

describe("clampQuantity", () => {
  it("keeps quantities between 1 and the maximum", () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-5)).toBe(1);
    expect(clampQuantity(2.9)).toBe(2);
    expect(clampQuantity(500)).toBe(MAX_QUANTITY);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });
});

describe("cart operations", () => {
  it("merges quantities when the same product is added twice", () => {
    const cart = addToCart(addToCart([], A, 2), A, 3);
    expect(cart).toEqual([{ productId: A, quantity: 5 }]);
  });

  it("caps merged quantities", () => {
    expect(addToCart([{ productId: A, quantity: 98 }], A, 5)[0].quantity).toBe(MAX_QUANTITY);
  });

  it("refuses new lines beyond the line limit", () => {
    const full = Array.from({ length: MAX_CART_LINES }, (_, index) => ({
      productId: `p-${index}`,
      quantity: 1,
    }));
    expect(addToCart(full, B, 1)).toHaveLength(MAX_CART_LINES);
  });

  it("sets an exact quantity when ordering now, without doubling an existing line", () => {
    expect(setOrAddLine([{ productId: A, quantity: 4 }], A, 1)).toEqual([{ productId: A, quantity: 1 }]);
    expect(setOrAddLine([], B, 2)).toEqual([{ productId: B, quantity: 2 }]);
  });

  it("updates and removes lines", () => {
    const cart = [
      { productId: A, quantity: 1 },
      { productId: B, quantity: 1 },
    ];
    expect(setLineQuantity(cart, B, 4)).toEqual([
      { productId: A, quantity: 1 },
      { productId: B, quantity: 4 },
    ]);
    expect(removeFromCart(cart, A)).toEqual([{ productId: B, quantity: 1 }]);
    expect(cartItemCount(setLineQuantity(cart, B, 4))).toBe(5);
  });
});

describe("cartSubtotal", () => {
  it("sums unit price × quantity in whole FCFA", () => {
    expect(
      cartSubtotal([
        { unitPrice: 15000, quantity: 2 },
        { unitPrice: 9500, quantity: 1 },
      ]),
    ).toBe(39500);
    expect(cartSubtotal([])).toBe(0);
  });
});

describe("parseStoredCart", () => {
  it("ignores corrupted or tampered storage", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("not json")).toEqual([]);
    expect(parseStoredCart('{"productId":"x"}')).toEqual([]);
    expect(
      parseStoredCart(
        JSON.stringify([
          { productId: A, quantity: 1000, price: 1 },
          { productId: A, quantity: 2 },
          { productId: 42, quantity: 1 },
          { productId: B, quantity: 0 },
        ]),
      ),
    ).toEqual([
      { productId: A, quantity: MAX_QUANTITY },
      { productId: B, quantity: 1 },
    ]);
  });
});

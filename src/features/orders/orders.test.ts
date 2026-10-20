import { describe, expect, it } from "vitest";
import { checkoutSchema, normalizePhone } from "./checkout-schema";
import { describeOrderError } from "./order-errors";
import { ORDER_STATUSES, allowedNextStatuses, canTransition, isFinalStatus } from "./status";
import { buildOrderMessage, buildWhatsAppUrl, type OrderSummary } from "./whatsapp";

const PRODUCT = "11111111-1111-4111-8111-111111111111";

describe("checkout validation", () => {
  const valid = {
    customerName: "  Awa Koné ",
    customerPhone: "+225 07 00-00 00 01",
    deliveryAddress: " ",
    customerNote: "Sonner deux fois",
    items: [{ productId: PRODUCT, quantity: 2 }],
  };

  it("normalizes and accepts a valid order", () => {
    const result = checkoutSchema.parse(valid);
    expect(result.customerName).toBe("Awa Koné");
    expect(result.customerPhone).toBe("+2250700000001");
    expect(result.deliveryAddress).toBeNull();
    expect(result.customerNote).toBe("Sonner deux fois");
  });

  it("never keeps prices sent by the client (unknown keys are dropped)", () => {
    const result = checkoutSchema.parse({
      ...valid,
      items: [{ productId: PRODUCT, quantity: 1, price: 1 }],
      total: 1,
    });
    expect(result.items[0]).toEqual({ productId: PRODUCT, quantity: 1 });
    expect(result).not.toHaveProperty("total");
  });

  it.each([
    ["an empty cart", { items: [] }],
    ["a zero quantity", { items: [{ productId: PRODUCT, quantity: 0 }] }],
    ["too many units", { items: [{ productId: PRODUCT, quantity: 100 }] }],
    ["an invalid product id", { items: [{ productId: "abc", quantity: 1 }] }],
    ["a one-letter name", { customerName: "A" }],
    ["an invalid phone", { customerPhone: "12" }],
  ])("rejects %s", (_label, override) => {
    expect(checkoutSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });

  it("normalizes phone numbers", () => {
    expect(normalizePhone("07 00 00 00 01")).toBe("0700000001");
    expect(normalizePhone(" +33 6 12 34 56 78")).toBe("+33612345678");
  });
});

describe("order status transitions", () => {
  it("only moves forward, skipping steps when needed", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("pending", "completed")).toBe(true);
    expect(canTransition("shipping", "preparing")).toBe(false);
    expect(canTransition("confirmed", "pending")).toBe(false);
  });

  it("allows cancellation until the order is final", () => {
    expect(canTransition("shipping", "cancelled")).toBe(true);
    expect(canTransition("completed", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "pending")).toBe(false);
  });

  it("treats completed and cancelled as final", () => {
    for (const status of ORDER_STATUSES) {
      expect(allowedNextStatuses(status).length === 0).toBe(isFinalStatus(status));
    }
    expect(allowedNextStatuses("preparing")).toEqual(["shipping", "completed", "cancelled"]);
  });
});

describe("WhatsApp message", () => {
  const order: OrderSummary = {
    orderNumber: "SE-261020-0001",
    customerName: "Awa Koné",
    customerPhone: "+2250700000001",
    deliveryAddress: "Cocody",
    customerNote: null,
    items: [
      { productName: "Sérum éclat", unitPrice: 15000, quantity: 2, lineTotal: 30000 },
      { productName: "Crème karité", unitPrice: 9500, quantity: 1, lineTotal: 9500 },
    ],
    subtotal: 39500,
    deliveryFee: 1500,
    total: 41000,
  };

  it("contains the order number, items, quantities, amounts and total", () => {
    const message = buildOrderMessage("Bonjour,", order);
    expect(message).toContain("SE-261020-0001");
    expect(message).toContain("Sérum éclat × 2");
    expect(message).toContain("30 000 FCFA");
    expect(message).toContain("Livraison : 1 500 FCFA");
    expect(message).toContain("Total : 41 000 FCFA");
    expect(message).toContain("Livraison à : Cocody");
    expect(message).not.toContain("Note :");
  });

  it("omits the delivery line when there is no fee", () => {
    const message = buildOrderMessage("Bonjour,", { ...order, deliveryFee: 0, total: 39500 });
    expect(message).not.toContain("Livraison :");
  });

  it("builds an encoded wa.me link", () => {
    const url = buildWhatsAppUrl("2250700000000", "Commande n° 1 & total");
    expect(url).toBe("https://wa.me/2250700000000?text=Commande%20n%C2%B0%201%20%26%20total");
  });
});

describe("order error messages", () => {
  it("explains database refusals without technical jargon", () => {
    expect(
      describeOrderError({ message: "insufficient_stock", details: "Sérum", hint: "2" }),
    ).toContain("il en reste 2");
    expect(
      describeOrderError({ message: "insufficient_stock", details: "Sérum", hint: "0" }),
    ).toContain("rupture");
    expect(describeOrderError({ message: "product_unavailable", details: "Sérum" })).toContain(
      "Sérum",
    );
    expect(describeOrderError({ message: "rate_limited" })).toContain("Patientez");
    expect(describeOrderError({ message: "connection reset" })).toContain(
      "n'a pas pu être enregistrée",
    );
  });
});

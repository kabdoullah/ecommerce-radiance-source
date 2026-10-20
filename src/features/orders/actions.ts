"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ProductCardData } from "@/features/products/queries";
import { getStoreSettings } from "@/features/store-settings/queries";
import { createPublicClient } from "@/lib/supabase/public";
import { checkoutSchema, type CheckoutInput } from "./checkout-schema";
import { describeOrderError } from "./order-errors";
import { buildOrderMessage, buildWhatsAppUrl, type OrderSummary } from "./whatsapp";

export type CartProduct = Omit<ProductCardData, "category">;

/** Prix et disponibilités actuels des produits du panier (jamais ceux du navigateur). */
export async function getCartProducts(
  productIds: string[],
): Promise<{ ok: true; products: CartProduct[] } | { ok: false }> {
  const ids = z.array(z.uuid()).max(30).safeParse(productIds);
  if (!ids.success) return { ok: false };
  if (ids.data.length === 0) return { ok: true, products: [] };

  const { data, error } = await createPublicClient()
    .from("products")
    .select(
      "id, name, slug, subtitle, price, compare_at_price, stock_quantity, product_images(storage_path, alt_text, sort_order)",
    )
    .eq("is_active", true)
    .in("id", ids.data);
  if (error) return { ok: false };

  return {
    ok: true,
    products: data.map((row) => {
      const image = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        subtitle: row.subtitle,
        price: row.price,
        compareAtPrice: row.compare_at_price,
        stockQuantity: row.stock_quantity,
        image: image ? { path: image.storage_path, alt: image.alt_text || row.name } : null,
      };
    }),
  };
}

export type PlaceOrderResult =
  | { ok: true; order: OrderSummary & { createdAt: string }; whatsappUrl: string | null }
  | { ok: false; message: string; fieldErrors?: Partial<Record<keyof CheckoutInput, string>> };

const createOrderResponse = z.object({
  order_number: z.string(),
  created_at: z.string(),
  subtotal: z.number(),
  delivery_fee: z.number(),
  total: z.number(),
  items: z.array(
    z.object({
      product_name: z.string(),
      unit_price: z.number(),
      quantity: z.number(),
      line_total: z.number(),
    }),
  ),
});

export async function placeOrder(input: CheckoutInput, honeypot: string): Promise<PlaceOrderResult> {
  // Champ invisible rempli uniquement par des robots.
  if (honeypot) return { ok: false, message: "Votre commande n'a pas pu être enregistrée." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof CheckoutInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof CheckoutInput;
      fieldErrors[field] ??= issue.message;
    }
    return { ok: false, message: "Certains champs sont à corriger.", fieldErrors };
  }

  const data = parsed.data;
  const { data: result, error } = await createPublicClient().rpc("create_order", {
    p_customer_name: data.customerName,
    p_customer_phone: data.customerPhone,
    p_delivery_address: data.deliveryAddress ?? "",
    p_customer_note: data.customerNote ?? "",
    p_items: data.items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
  });

  if (error) {
    if (error.code !== "P0001") console.error("create_order failed", error.code, error.message);
    return { ok: false, message: describeOrderError(error) };
  }

  // Le stock a pu changer : le catalogue public se met à jour en arrière-plan.
  revalidateTag(CACHE_TAGS.catalog, "max");

  const saved = createOrderResponse.parse(result);
  const order = {
    orderNumber: saved.order_number,
    createdAt: saved.created_at,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryAddress: data.deliveryAddress,
    customerNote: data.customerNote,
    items: saved.items.map((item) => ({
      productName: item.product_name,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      lineTotal: item.line_total,
    })),
    subtotal: saved.subtotal,
    deliveryFee: saved.delivery_fee,
    total: saved.total,
  };

  // La commande est enregistrée : un échec de lecture des paramètres ne doit pas la masquer.
  let whatsappUrl: string | null = null;
  try {
    const settings = await getStoreSettings();
    if (settings.whatsapp_number) {
      whatsappUrl = buildWhatsAppUrl(
        settings.whatsapp_number,
        buildOrderMessage(settings.order_message_intro, order),
      );
    }
  } catch (settingsError) {
    console.error("store settings unavailable after order", settingsError);
  }

  return { ok: true, order, whatsappUrl };
}

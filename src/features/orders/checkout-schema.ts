import { z } from "zod";
import { MAX_CART_LINES, MAX_QUANTITY } from "@/features/cart/cart-math";

/** « +225 07 00-00 00 00 » → « +2250700000000 » */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => (value === "" ? null : value));

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom (2 caractères minimum).")
    .max(100, "Le nom est trop long (100 caractères maximum)."),
  customerPhone: z
    .string()
    .transform(normalizePhone)
    .pipe(
      z
        .string()
        .regex(/^\+?[0-9]{8,15}$/, "Numéro de téléphone invalide. Exemple : +225 07 00 00 00 00."),
    ),
  deliveryAddress: optionalText(300, "L'adresse est trop longue (300 caractères maximum)."),
  customerNote: optionalText(500, "La note est trop longue (500 caractères maximum)."),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().min(1).max(MAX_QUANTITY),
      }),
    )
    .min(1, "Votre panier est vide.")
    .max(MAX_CART_LINES, "Votre panier contient trop d'articles."),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

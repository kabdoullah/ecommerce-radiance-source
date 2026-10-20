import { z } from "zod";
import { splitLines } from "@/lib/utils/text";

const text = (max: number) => z.string().trim().max(max, `${max} caractères maximum.`);

const optionalText = (max: number) => text(max).transform((value) => value || null);

const optionalUrl = z
  .string()
  .trim()
  .max(200, "200 caractères maximum.")
  .refine((value) => value === "" || /^https:\/\/[^\s]+$/.test(value), {
    message: "Collez l'adresse complète, commençant par https://",
  })
  .transform((value) => value || null);

const imagePath = z
  .string()
  .trim()
  .refine((value) => value === "" || /^settings\/[0-9a-f-]{36}\.(webp|jpg)$/.test(value), {
    message: "Image invalide.",
  })
  .transform((value) => value || null);

/** « +225 07 00 00 00 00 » ou « 00225… » → « 2250700000000 » (format wa.me). */
export function normalizeWhatsAppNumber(value: string): string {
  return value.replace(/\D/g, "").replace(/^00/, "");
}

export const settingsSchema = z.object({
  store_name: text(80).min(1, "Indiquez le nom de la boutique."),
  tagline: text(160),
  whatsapp_number: z
    .string()
    .transform(normalizeWhatsAppNumber)
    .refine((value) => value === "" || /^[0-9]{8,15}$/.test(value), {
      message: "Numéro invalide : indiquez l'indicatif du pays, par exemple +225 07 00 00 00 00.",
    })
    .transform((value) => value || null),
  contact_phone: optionalText(30),
  contact_email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Adresse e-mail invalide.",
    })
    .transform((value) => value || null),
  address: optionalText(300),
  opening_hours: optionalText(200),
  delivery_info: optionalText(1000),
  delivery_fee: z
    .string()
    .transform((value) => value.replace(/[\s  ]/g, ""))
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 1_000_000), {
      message: "Montant en FCFA, nombre entier (laissez vide si les frais varient).",
    })
    .transform((value) => (value === "" ? null : Number(value))),
  order_message_intro: text(300).min(1, "Indiquez la phrase d'introduction du message."),
  instagram_url: optionalUrl,
  facebook_url: optionalUrl,
  tiktok_url: optionalUrl,
  delivery_summary: text(80),
  payment_summary: text(80),
  payment_info: text(300),
  hero_script: text(120),
  hero_side_quote: text(200),
  about_highlights: text(300).transform((value) => splitLines(value, 3).join("\n")),
  hero_title: text(120),
  hero_subtitle: text(300),
  about_title: text(120),
  about_text: text(2000),
  footer_text: text(300),
  logo_path: imagePath,
  hero_image_path: imagePath,
  about_image_path: imagePath,
});

export type SettingsValues = z.output<typeof settingsSchema>;

export function readSettingsForm(formData: FormData) {
  const raw = Object.fromEntries(
    Object.keys(settingsSchema.shape).map((key) => [key, String(formData.get(key) ?? "")]),
  );
  return settingsSchema.safeParse(raw);
}

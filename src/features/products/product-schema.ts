import { z } from "zod";
import { SLUG_PATTERN, slugify } from "@/lib/utils/slug";
import { splitLines } from "@/lib/utils/text";

const MAX_PRICE = 10_000_000;

/** Montant saisi en FCFA (« 15 000 » accepté) → entier. */
const amount = (label: string) =>
  z
    .string()
    .transform((value) => value.replace(/[\s  ]/g, ""))
    .pipe(z.string().regex(/^\d+$/, `${label} : saisissez un nombre entier, sans décimales.`))
    .transform(Number)
    .pipe(z.number().int().max(MAX_PRICE, `${label} : 10 000 000 FCFA maximum.`));

const checkbox = z.union([z.literal("on"), z.null()]).transform((value) => value === "on");

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Indiquez le nom du produit.")
      .max(120, "120 caractères maximum."),
    slug: z.string().trim().toLowerCase().max(80, "80 caractères maximum."),
    subtitle: z.string().trim().max(80, "80 caractères maximum."),
    description: z.string().trim().max(5000, "5000 caractères maximum."),
    highlights: z.string().trim().max(300, "300 caractères maximum."),
    usageTips: z.string().trim().max(1000, "1000 caractères maximum."),
    precautions: z.string().trim().max(1000, "1000 caractères maximum."),
    skinType: z.string().trim().max(80, "80 caractères maximum."),
    volume: z.string().trim().max(40, "40 caractères maximum."),
    price: amount("Prix"),
    compareAtPrice: z.union([z.literal("").transform(() => null), amount("Ancien prix")]),
    categoryId: z.union([z.literal("").transform(() => null), z.uuid("Catégorie invalide.")]),
    trackStock: checkbox,
    stockQuantity: z.string(),
    isActive: checkbox,
    isFeatured: checkbox,
  })
  .transform((data, ctx) => {
    const slug = data.slug || slugify(data.name);
    if (!SLUG_PATTERN.test(slug)) {
      ctx.addIssue({
        code: "custom",
        path: ["slug"],
        message:
          "Utilisez uniquement des lettres minuscules sans accents, des chiffres et des tirets.",
      });
    }
    if (data.compareAtPrice !== null && data.compareAtPrice <= data.price) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "L'ancien prix doit être supérieur au prix actuel (ou laissez le champ vide).",
      });
    }
    let stockQuantity: number | null = null;
    if (data.trackStock) {
      const raw = data.stockQuantity.trim();
      stockQuantity = Number(raw);
      if (!/^\d+$/.test(raw) || stockQuantity > 1_000_000) {
        ctx.addIssue({
          code: "custom",
          path: ["stockQuantity"],
          message: "Indiquez la quantité disponible (nombre entier, 0 = épuisé).",
        });
      }
    }
    return {
      name: data.name,
      slug,
      subtitle: data.subtitle,
      description: data.description,
      highlights: splitLines(data.highlights, 3).join("\n"),
      usage_tips: data.usageTips,
      precautions: data.precautions,
      skin_type: data.skinType,
      volume: data.volume,
      price: data.price,
      compare_at_price: data.compareAtPrice,
      category_id: data.categoryId,
      stock_quantity: stockQuantity,
      is_active: data.isActive,
      is_featured: data.isFeatured,
    };
  });

export function readProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    subtitle: formData.get("subtitle") ?? "",
    description: formData.get("description") ?? "",
    highlights: formData.get("highlights") ?? "",
    usageTips: formData.get("usageTips") ?? "",
    precautions: formData.get("precautions") ?? "",
    skinType: formData.get("skinType") ?? "",
    volume: formData.get("volume") ?? "",
    price: formData.get("price") ?? "",
    compareAtPrice: formData.get("compareAtPrice") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    trackStock: formData.get("trackStock"),
    stockQuantity: formData.get("stockQuantity") ?? "",
    isActive: formData.get("isActive"),
    isFeatured: formData.get("isFeatured"),
  });
}

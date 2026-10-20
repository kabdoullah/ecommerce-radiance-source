import { describe, expect, it } from "vitest";
import { catalogHref, parseCatalogParams } from "@/features/products/catalog-params";
import { productSchema } from "@/features/products/product-schema";
import {
  normalizeWhatsAppNumber,
  settingsSchema,
} from "@/features/store-settings/settings-schema";
import { formatPrice } from "@/lib/utils/format";
import { slugify } from "@/lib/utils/slug";

const product = {
  name: "Sérum Éclat — 30 ml",
  slug: "",
  subtitle: "Gel douche exfoliant",
  description: "",
  highlights: "  Nettoie \n\nExfolie\nAdoucit\nQuatrième ignoré",
  usageTips: "",
  precautions: "",
  skinType: "",
  volume: "1 L",
  price: "15 000",
  compareAtPrice: "",
  categoryId: "",
  trackStock: null,
  stockQuantity: "",
  isActive: "on",
  isFeatured: null,
};

describe("product form validation", () => {
  it("parses FCFA amounts and derives the slug from the name", () => {
    expect(productSchema.parse(product)).toMatchObject({
      slug: "serum-eclat-30-ml",
      subtitle: "Gel douche exfoliant",
      highlights: "Nettoie\nExfolie\nAdoucit",
      volume: "1 L",
      price: 15000,
      compare_at_price: null,
      category_id: null,
      stock_quantity: null,
      is_active: true,
      is_featured: false,
    });
  });

  it("rejects decimal prices instead of silently changing them", () => {
    expect(productSchema.safeParse({ ...product, price: "15.5" }).success).toBe(false);
    expect(productSchema.safeParse({ ...product, price: "15,5" }).success).toBe(false);
  });

  it("requires the former price to be higher than the price", () => {
    expect(productSchema.safeParse({ ...product, compareAtPrice: "15000" }).success).toBe(false);
    expect(productSchema.parse({ ...product, compareAtPrice: "18000" }).compare_at_price).toBe(
      18000,
    );
  });

  it("validates stock only when stock tracking is enabled", () => {
    expect(
      productSchema.parse({ ...product, trackStock: "on", stockQuantity: "0" }).stock_quantity,
    ).toBe(0);
    expect(
      productSchema.safeParse({ ...product, trackStock: "on", stockQuantity: "-1" }).success,
    ).toBe(false);
  });

  it("rejects malformed slugs", () => {
    expect(productSchema.safeParse({ ...product, slug: "Mon Produit!" }).success).toBe(false);
  });
});

describe("store settings validation", () => {
  const settings = {
    store_name: "Source d'Éclat",
    tagline: "",
    whatsapp_number: "+225 07 00 00 00 00",
    contact_phone: "",
    contact_email: "",
    address: "",
    opening_hours: "",
    delivery_info: "",
    delivery_fee: "1 500",
    order_message_intro: "Bonjour",
    instagram_url: "",
    facebook_url: "",
    tiktok_url: "",
    delivery_summary: "Livraison partout en Côte d'Ivoire",
    payment_summary: "",
    payment_info: "",
    hero_script: "Votre beauté, notre passion.",
    hero_side_quote: "",
    about_highlights: "Qualité assurée\n\n Produits sélectionnés ",
    hero_title: "",
    hero_subtitle: "",
    about_title: "",
    about_text: "",
    footer_text: "",
    logo_path: "",
    hero_image_path: "",
    about_image_path: "",
  };

  it("normalizes the WhatsApp number to the wa.me format", () => {
    const result = settingsSchema.parse(settings);
    expect(result.whatsapp_number).toBe("2250700000000");
    expect(result.delivery_fee).toBe(1500);
    expect(result.contact_email).toBeNull();
    expect(result.about_highlights).toBe("Qualité assurée\nProduits sélectionnés");
    expect(normalizeWhatsAppNumber("00225 07 00")).toBe("2250700");
  });

  it("rejects unsafe links, foreign storage paths and short numbers", () => {
    expect(
      settingsSchema.safeParse({ ...settings, instagram_url: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(
      settingsSchema.safeParse({ ...settings, logo_path: "../products/x.webp" }).success,
    ).toBe(false);
    expect(settingsSchema.safeParse({ ...settings, whatsapp_number: "123" }).success).toBe(false);
  });
});

describe("catalog parameters", () => {
  it("falls back to safe defaults for unknown values", () => {
    expect(parseCatalogParams({ tri: "hack", page: "-3", categorie: "Bad Slug!" })).toEqual({
      query: "",
      category: null,
      sort: "recent",
      page: 1,
    });
  });

  it("round-trips filters into links", () => {
    const params = parseCatalogParams({
      q: "sérum",
      categorie: "visage",
      tri: "price-asc",
      page: "2",
    });
    expect(catalogHref(params)).toBe(
      "/boutique?q=s%C3%A9rum&categorie=visage&tri=price-asc&page=2",
    );
  });
});

describe("formatting helpers", () => {
  it("formats FCFA amounts", () => {
    expect(formatPrice(1234567)).toBe("1 234 567 FCFA");
  });

  it("slugifies accented names", () => {
    expect(slugify("  Huile  d'Argan — Édition 2026 ")).toBe("huile-d-argan-edition-2026");
  });
});

import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getPublishedProductSlugs } from "@/features/products/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProductSlugs();
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/boutique`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((product) => ({
      url: `${siteUrl}/produits/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

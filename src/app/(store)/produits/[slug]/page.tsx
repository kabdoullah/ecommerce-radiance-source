import { ChevronRight, Droplets, FlaskConical, HandHeart, Sparkles, UserRound, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/brand/social-icons";
import { ProductGrid } from "@/components/shared/product-card";
import { StockLabel } from "@/components/shared/price";
import { Stars } from "@/components/shared/stars";
import { CURRENCY_CODE, siteUrl } from "@/config/site";
import { AddToCart } from "@/features/products/components/add-to-cart";
import { ProductGallery } from "@/features/products/components/product-gallery";
import {
  getProductBySlug,
  getPublishedProductSlugs,
  getRelatedProducts,
  isInStock,
  type ProductDetail,
} from "@/features/products/queries";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { getProductReviews } from "@/features/reviews/queries";
import { getStoreSettings } from "@/features/store-settings/queries";
import { mediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/utils/format";

// Slug factice quand le catalogue est vide : Cache Components exige au moins un paramètre.
const EMPTY_CATALOG_SLUG = "aucun-produit";
const HIGHLIGHT_ICONS = [Sparkles, Droplets, HandHeart];

export async function generateStaticParams() {
  const slugs = await getPublishedProductSlugs();
  return slugs.length > 0
    ? slugs.slice(0, 24).map(({ slug }) => ({ slug }))
    : [{ slug: EMPTY_CATALOG_SLUG }];
}

export async function generateMetadata({
  params,
}: PageProps<"/produits/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable", robots: { index: false } };

  const description =
    [product.subtitle, product.description].filter(Boolean).join(" – ").slice(0, 160) || undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produits/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.images[0] ? [{ url: mediaUrl(product.images[0].path) }] : undefined,
    },
  };
}

export default function ProductPage(props: PageProps<"/produits/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={props.params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/produits/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related, { reviews, average }] = await Promise.all([
    getStoreSettings(),
    getRelatedProducts(product.id, product.categoryId),
    getProductReviews(product.id),
  ]);

  const productUrl = `${siteUrl}/produits/${product.slug}`;
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const sideInfo = [
    { icon: UserRound, text: product.skinType },
    { icon: FlaskConical, text: product.volume ? `Contenance : ${product.volume}` : "" },
  ].filter((item) => item.text);

  return (
    <article className="container-page py-8 sm:py-10">
      <ProductJsonLd product={product} reviewCount={reviews.length} average={average} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_15rem] lg:gap-10">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-ink-soft">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-ink hover:underline">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
              <li>
                <Link href="/boutique" className="hover:text-ink hover:underline">
                  Nos produits
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>

          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{product.name}</h1>
          {product.subtitle && <p className="mt-1 text-ink-soft">{product.subtitle}</p>}

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-3xl font-bold text-bordeaux">
              {onSale && <span className="sr-only">Prix réduit : </span>}
              {formatPrice(product.price)}
            </p>
            {onSale && (
              <p className="text-ink-soft line-through">
                <span className="sr-only">Prix habituel : </span>
                {formatPrice(product.compareAtPrice!)}
              </p>
            )}
            <StockLabel stockQuantity={product.stockQuantity} />
          </div>
          {average !== null && (
            <a href="#avis" className="mt-2 inline-flex items-center gap-2 text-sm text-ink-soft hover:underline">
              <Stars rating={average} />({reviews.length} avis)
            </a>
          )}

          {product.description && (
            <div className="mt-5 space-y-3 text-sm leading-relaxed">
              {product.description.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {product.highlights.length > 0 && (
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {product.highlights.map((highlight, index) => {
                const Icon = HIGHLIGHT_ICONS[index];
                return (
                  <li key={highlight} className="flex items-center gap-2 text-xs leading-snug">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush text-bordeaux">
                      <Icon className="size-4" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    {highlight}
                  </li>
                );
              })}
            </ul>
          )}

          {product.usageTips && (
            <section className="mt-5">
              <h2 className="text-sm font-semibold">Conseils d&apos;utilisation</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{product.usageTips}</p>
            </section>
          )}
          {product.precautions && (
            <section className="mt-4">
              <h2 className="text-sm font-semibold">Précautions</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{product.precautions}</p>
            </section>
          )}

          <div className="mt-6">
            <AddToCart productId={product.id} stockQuantity={product.stockQuantity} />
          </div>
        </div>

        <aside className="space-y-3 text-xs" aria-label="Informations complémentaires">
          {sideInfo.length > 0 && (
            <ul className="space-y-3 rounded-card border border-line bg-surface p-4">
              {sideInfo.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          )}
          {settings.payment_summary && (
            <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush text-bordeaux">
                <Wallet className="size-4" aria-hidden="true" />
              </span>
              {settings.payment_summary}
            </div>
          )}
          {settings.delivery_info && (
            <p className="rounded-card border border-line bg-surface p-4 leading-relaxed">
              <span className="font-semibold">Livraison : </span>
              {settings.delivery_info}
            </p>
          )}
          <div className="flex items-center gap-3 px-1 pt-1">
            <span className="text-ink-soft">Partager :</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${product.name} – ${productUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Partager sur WhatsApp"
              className="text-bordeaux hover:text-bordeaux-deep"
            >
              <WhatsAppIcon className="size-4" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Partager sur Facebook"
              className="text-bordeaux hover:text-bordeaux-deep"
            >
              <FacebookIcon className="size-4" />
            </a>
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Notre Instagram"
                className="text-bordeaux hover:text-bordeaux-deep"
              >
                <InstagramIcon className="size-4" />
              </a>
            )}
          </div>
        </aside>
      </div>

      <section
        id="avis"
        aria-labelledby="reviews-title"
        className="mt-16 grid scroll-mt-24 gap-8 md:grid-cols-2"
      >
        <div>
          <h2 id="reviews-title" className="font-display text-2xl font-bold text-bordeaux">
            Avis clients
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Aucun avis pour le moment. Partagez le vôtre.</p>
          ) : (
            <ul className="mt-5 space-y-5">
              {reviews.map((review) => (
                <li key={review.id} className="border-b border-line pb-5">
                  <Stars rating={review.rating} />
                  <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
                  <p className="mt-2 text-xs font-semibold">{review.authorName}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl bg-mist p-6 sm:p-8">
          <h3 className="font-display text-xl font-bold">Donner votre avis</h3>
          <p className="mb-5 mt-1 text-xs text-ink-soft">Les avis sont publiés après relecture.</p>
          <ReviewForm productId={product.id} />
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-16">
          <h2
            id="related-title"
            className="section-title mb-8 font-display text-2xl font-bold italic text-bordeaux sm:text-3xl"
          >
            Vous aimerez aussi
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </article>
  );
}

function ProductJsonLd({
  product,
  reviewCount,
  average,
}: {
  product: ProductDetail;
  reviewCount: number;
  average: number | null;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.subtitle || undefined,
    image: product.images.map((image) => mediaUrl(image.path)),
    sku: product.slug,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/produits/${product.slug}`,
      priceCurrency: CURRENCY_CODE,
      price: product.price,
      availability: isInStock(product)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      average !== null && reviewCount > 0
        ? { "@type": "AggregateRating", ratingValue: average.toFixed(1), reviewCount }
        : undefined,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

function ProductSkeleton() {
  return (
    <div
      className="container-page py-8 sm:py-10"
      aria-busy="true"
      aria-label="Chargement du produit"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr_15rem]">
        <div className="aspect-[4/5] animate-pulse rounded-card bg-mist" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 rounded bg-mist" />
          <div className="h-8 w-1/3 rounded bg-mist" />
          <div className="h-32 rounded bg-mist" />
        </div>
      </div>
    </div>
  );
}

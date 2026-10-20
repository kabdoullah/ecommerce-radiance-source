import Link from "next/link";
import type { ProductCardData } from "@/features/products/queries";
import { OrderNowButton } from "@/features/products/components/order-now-button";
import { formatPrice } from "@/lib/utils/format";
import { ProductImage } from "./product-image";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const soldOut = product.stockQuantity === 0;
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <article className="group relative flex h-full flex-col rounded-card bg-surface p-2.5 shadow-[0_2px_14px_rgba(122,75,48,0.08)]">
      <div className="relative">
        <ProductImage
          image={product.image}
          priority={priority}
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          aspect="aspect-square"
          className={soldOut ? "opacity-70" : ""}
        />
        {(soldOut || onSale) && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold ${
              soldOut ? "bg-surface text-ink" : "bg-clay text-white"
            }`}
          >
            {soldOut ? "Épuisé" : "Promotion"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center px-1 pb-1 pt-3 text-center">
        <h3 className="text-sm font-semibold leading-snug">
          {/* Le lien couvre toute la carte (::after) ; le bouton Commander passe au-dessus. */}
          <Link
            href={`/produits/${product.slug}`}
            className="after:absolute after:inset-0 after:rounded-card group-hover:text-cocoa group-hover:underline group-hover:underline-offset-4 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-3 focus-visible:after:outline-cocoa"
          >
            {product.name}
          </Link>
        </h3>
        {product.subtitle && <p className="mt-0.5 text-xs text-ink-soft">{product.subtitle}</p>}
        <p className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2">
          <span className="text-base font-bold text-cocoa">
            {onSale && <span className="sr-only">Prix réduit : </span>}
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-xs text-ink-soft line-through">
              <span className="sr-only">Prix habituel : </span>
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </p>
        <div className={`mt-auto w-full pt-3 ${soldOut ? "" : "relative z-10"}`}>
          <OrderNowButton
            productId={product.id}
            disabled={soldOut}
            className="w-full gap-1! whitespace-nowrap px-2! text-[0.6875rem]"
          />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: ProductCardData[];
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

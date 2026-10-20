import { formatPrice } from "@/lib/utils/format";

export function Price({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice: number | null;
  size?: "md" | "lg";
}) {
  const onSale = compareAtPrice !== null && compareAtPrice > price;
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${size === "lg" ? "text-2xl" : "text-base"}`}>
      <span className="font-semibold">
        {onSale && <span className="sr-only">Prix réduit : </span>}
        {formatPrice(price)}
      </span>
      {onSale && (
        <span className={`text-ink-soft line-through ${size === "lg" ? "text-base" : "text-sm"}`}>
          <span className="sr-only">Prix habituel : </span>
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </p>
  );
}

export function StockLabel({ stockQuantity }: { stockQuantity: number | null }) {
  if (stockQuantity === 0) {
    return <span className="text-sm font-medium text-clay">Rupture de stock</span>;
  }
  if (stockQuantity !== null && stockQuantity <= 3) {
    return (
      <span className="text-sm font-medium text-ink-soft">
        Plus que {stockQuantity} en stock
      </span>
    );
  }
  return <span className="text-sm font-medium text-success">Disponible</span>;
}

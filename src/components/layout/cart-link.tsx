"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cartItemCount } from "@/features/cart/cart-math";
import { useCart } from "@/features/cart/cart-store";

export function CartLink() {
  const count = cartItemCount(useCart());
  return (
    <Link
      href="/panier"
      className="relative inline-flex size-11 items-center justify-center rounded-full hover:bg-mist"
      aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier vide"}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-fuchsia px-1 text-[0.6875rem] font-bold leading-5 text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { buttonStyles } from "@/components/ui/button";
import { cartActions } from "@/features/cart/cart-store";

/**
 * « Commander sur WhatsApp » : place le produit dans le panier puis ouvre la commande.
 * WhatsApp ne s'ouvre qu'une fois la commande enregistrée (page /commande).
 */
export function OrderNowButton({
  productId,
  quantity = 1,
  disabled = false,
  size = "sm",
  className = "",
}: {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  size?: "sm" | "lg";
  className?: string;
}) {
  const router = useRouter();

  if (disabled) {
    return (
      <span
        className={buttonStyles("secondary", size, `cursor-not-allowed opacity-60 ${className}`)}
        aria-disabled="true"
      >
        Épuisé
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        cartActions.order(productId, quantity);
        router.push("/commande");
      }}
      className={buttonStyles("primary", size, `whitespace-nowrap ${className}`)}
    >
      <WhatsAppIcon className={size === "lg" ? "size-5" : "size-4"} />
      {size === "sm" ? (
        <>
          {/* Cartes étroites sur mobile : libellé court, icône WhatsApp conservée. */}
          <span className="sm:hidden">Commander</span>
          <span className="hidden sm:inline">Commander sur WhatsApp</span>
        </>
      ) : (
        "Commander sur WhatsApp"
      )}
    </button>
  );
}

import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";
import { getStoreSettings } from "@/features/store-settings/queries";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false },
};

export default async function CartPage() {
  const settings = await getStoreSettings();
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-4xl sm:text-5xl">Votre panier</h1>
      <CartView deliveryFee={settings.delivery_fee} />
    </div>
  );
}

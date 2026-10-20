import type { Metadata } from "next";
import { CheckoutView } from "@/features/orders/components/checkout-view";
import { getStoreSettings } from "@/features/store-settings/queries";

export const metadata: Metadata = {
  title: "Commande",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-4xl sm:text-5xl">Finaliser la commande</h1>
      <CheckoutView deliveryFee={settings.delivery_fee} deliveryInfo={settings.delivery_info} />
    </div>
  );
}

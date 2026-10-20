import type { Metadata } from "next";
import { OrderConfirmation } from "@/features/orders/components/order-confirmation";

export const metadata: Metadata = {
  title: "Commande enregistrée",
  robots: { index: false },
};

export default function ConfirmationPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-4xl sm:text-5xl">Merci pour votre commande</h1>
      <OrderConfirmation />
    </div>
  );
}

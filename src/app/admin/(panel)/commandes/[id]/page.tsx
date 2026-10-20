import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { buttonStyles } from "@/components/ui/button";
import { getOrder } from "@/features/orders/admin-queries";
import {
  OrderNoteForm,
  OrderStatusControl,
  PaymentControl,
} from "@/features/orders/components/order-admin-controls";
import { OrderStatusBadge, PaymentBadge } from "@/features/orders/components/order-status-badge";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Détail de la commande" };

export default async function OrderDetailPage({ params }: PageProps<"/admin/commandes/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const order = await getOrder(id);
  if (!order) notFound();

  const whatsappNumber = order.customer_phone.replace(/\D/g, "");
  const whatsappText = `Bonjour ${order.customer_name}, concernant votre commande ${order.order_number} :`;

  return (
    <>
      <Link href="/admin/commandes" className="text-sm text-bordeaux hover:underline">
        Retour aux commandes
      </Link>
      <div className="mt-4">
        <PageHeader
          title={`Commande ${order.order_number}`}
          description={`Reçue le ${formatDateTime(order.created_at)}`}
          actions={
            <>
              <OrderStatusBadge status={order.status} />
              <PaymentBadge status={order.payment_status} />
            </>
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Panel title="Articles">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] text-left text-sm">
                <thead className="text-ink-soft">
                  <tr>
                    <th scope="col" className="pb-2 font-medium">
                      Produit
                    </th>
                    <th scope="col" className="pb-2 text-right font-medium">
                      Prix unitaire
                    </th>
                    <th scope="col" className="pb-2 text-right font-medium">
                      Quantité
                    </th>
                    <th scope="col" className="pb-2 text-right font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2">
                        {item.product_name}
                        {!item.product_id && (
                          <span className="ml-2 text-xs text-ink-soft">(produit supprimé)</span>
                        )}
                      </td>
                      <td className="py-2 text-right">{formatPrice(item.unit_price)}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right font-semibold">
                        {formatPrice(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-line">
                  <tr>
                    <th scope="row" colSpan={3} className="pt-3 text-right font-normal">
                      Sous-total
                    </th>
                    <td className="pt-3 text-right">{formatPrice(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <th scope="row" colSpan={3} className="pt-1 text-right font-normal">
                      Livraison
                    </th>
                    <td className="pt-1 text-right">{formatPrice(order.delivery_fee)}</td>
                  </tr>
                  <tr>
                    <th scope="row" colSpan={3} className="pt-1 text-right">
                      Total
                    </th>
                    <td className="pt-1 text-right text-base font-semibold">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="mt-4 text-xs text-ink-soft">
              Les prix sont ceux en vigueur au moment de la commande ; ils ne changent pas si le
              produit est modifié ensuite.
            </p>
          </Panel>

          <Panel title="Client">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-soft">Nom</dt>
                <dd className="mt-1 font-medium">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Téléphone</dt>
                <dd className="mt-1 font-medium">
                  <a href={`tel:${order.customer_phone}`} className="hover:underline">
                    {order.customer_phone}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-ink-soft">Adresse ou zone de livraison</dt>
                <dd className="mt-1 whitespace-pre-line">
                  {order.delivery_address ?? "Non renseignée"}
                </dd>
              </div>
              {order.customer_note && (
                <div className="sm:col-span-2">
                  <dt className="text-ink-soft">Message du client</dt>
                  <dd className="mt-1 whitespace-pre-line">{order.customer_note}</dd>
                </div>
              )}
            </dl>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles("secondary", "sm", "mt-5")}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Écrire au client sur WhatsApp
            </a>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Statut de la commande">
            <OrderStatusControl orderId={order.id} status={order.status} />
          </Panel>
          <Panel title="Paiement">
            <PaymentControl orderId={order.id} status={order.payment_status} />
          </Panel>
          <Panel title="Note interne">
            <OrderNoteForm orderId={order.id} note={order.admin_note} />
          </Panel>
        </div>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { AutoSubmitSelect } from "@/components/shared/auto-submit-select";
import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/field";
import { ORDERS_PAGE_SIZE, listOrders } from "@/features/orders/admin-queries";
import { OrderStatusBadge, PaymentBadge } from "@/features/orders/components/order-status-badge";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/features/orders/status";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Commandes" };

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function OrdersPage({ searchParams }: PageProps<"/admin/commandes">) {
  const raw = await searchParams;
  const statusParam = first(raw.statut);
  const status = (ORDER_STATUSES as readonly string[]).includes(statusParam)
    ? (statusParam as OrderStatus)
    : null;
  const query = first(raw.q).slice(0, 60);
  const page = Math.max(1, Number.parseInt(first(raw.page), 10) || 1);

  const { orders, total } = await listOrders({ status, query, page });
  const pageCount = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));
  const hrefFor = (nextPage: number) => {
    const search = new URLSearchParams();
    if (status) search.set("statut", status);
    if (query) search.set("q", query);
    if (nextPage > 1) search.set("page", String(nextPage));
    return `/admin/commandes${search.size ? `?${search}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Commandes"
        description="Toutes les commandes enregistrées sur la boutique, des plus récentes aux plus anciennes."
      />

      <Form action="/admin/commandes" className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="q" className="sr-only">
          Rechercher
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="N° de commande, nom ou téléphone"
          className={`${inputStyles} sm:max-w-xs`}
        />
        <label htmlFor="statut" className="sr-only">
          Statut
        </label>
        <AutoSubmitSelect
          id="statut"
          name="statut"
          defaultValue={status ?? ""}
          className={`${inputStyles} sm:w-52`}
        >
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </AutoSubmitSelect>
        <button type="submit" className={buttonStyles("secondary", "md")}>
          Filtrer
        </button>
      </Form>

      {orders.length === 0 ? (
        <p className="rounded-card bg-surface p-8 text-center text-ink-soft">
          {status || query
            ? "Aucune commande ne correspond à ces critères."
            : "Aucune commande pour le moment."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line text-ink-soft">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Commande
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Client
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Téléphone
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-paper">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/commandes/${order.id}`}
                      className="font-semibold text-bordeaux hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{order.customer_phone}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-1">
                      <OrderStatusBadge status={order.status} />
                      {order.payment_status === "paid" && <PaymentBadge status="paid" />}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className={buttonStyles("secondary", "sm")}>
              Précédentes
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {Math.min(page, pageCount)} sur {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} className={buttonStyles("secondary", "sm")}>
              Suivantes
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

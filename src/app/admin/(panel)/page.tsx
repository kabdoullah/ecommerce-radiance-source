import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { getDashboardStats } from "@/features/orders/admin-queries";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const counters = [
    { label: "Commandes au total", value: stats.totalOrders, href: "/admin/commandes" },
    {
      label: "En attente de confirmation",
      value: stats.byStatus.pending,
      href: "/admin/commandes?statut=pending",
    },
    { label: "Confirmées", value: stats.byStatus.confirmed, href: "/admin/commandes?statut=confirmed" },
    { label: "Terminées", value: stats.byStatus.completed, href: "/admin/commandes?statut=completed" },
    { label: "Produits en ligne", value: stats.activeProducts, href: "/admin/produits" },
    { label: "Avis à relire", value: stats.pendingReviews, href: "/admin/avis" },
  ];

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la boutique, calculée à partir des commandes enregistrées."
      />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {counters.map((counter) => (
          <li key={counter.label}>
            <Link
              href={counter.href}
              className="block rounded-card border border-line bg-surface p-5 hover:border-bordeaux"
            >
              <span className="block text-3xl font-semibold">{counter.value}</span>
              <span className="mt-1 block text-sm text-ink-soft">{counter.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Panel>
          <p className="text-sm text-ink-soft">Paiements vérifiés</p>
          <p className="mt-1 text-2xl font-semibold">{formatPrice(stats.paidAmount)}</p>
          <p className="mt-2 text-xs text-ink-soft">
            Somme des commandes marquées « J&apos;ai reçu le paiement ». C&apos;est le seul montant
            réellement encaissé.
          </p>
        </Panel>
        <Panel>
          <p className="text-sm text-ink-soft">Ventes terminées</p>
          <p className="mt-1 text-2xl font-semibold">{formatPrice(stats.completedAmount)}</p>
          <p className="mt-2 text-xs text-ink-soft">
            Somme des commandes au statut « Terminée » (livrées ou retirées), payées ou non.
          </p>
        </Panel>
      </div>

      <div className="mt-10">
        <Panel title="Commandes récentes">
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Aucune commande pour le moment. Les commandes passées sur la boutique apparaîtront
              ici.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {stats.recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/commandes/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-paper"
                  >
                    <span>
                      <span className="font-semibold">{order.order_number}</span>
                      <span className="ml-2 text-sm text-ink-soft">{order.customer_name}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-ink-soft">{formatDateTime(order.created_at)}</span>
                      <span className="font-semibold">{formatPrice(order.total)}</span>
                      <OrderStatusBadge status={order.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

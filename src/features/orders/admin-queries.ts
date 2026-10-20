import "server-only";
import { requireAdmin } from "@/features/auth/session";
import { ORDER_STATUSES, type OrderStatus } from "./status";

export const ORDERS_PAGE_SIZE = 25;

export async function getDashboardStats() {
  const { supabase } = await requireAdmin();

  // Une boutique de cette taille reste sous quelques milliers de commandes :
  // une seule lecture des colonnes utiles suffit pour tous les indicateurs.
  const [orders, activeProducts, pendingReviews, recent] = await Promise.all([
    supabase.from("orders").select("status, payment_status, total").limit(20000),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  for (const result of [orders, activeProducts, pendingReviews, recent]) {
    if (result.error) {
      throw new Error(`Lecture du tableau de bord impossible : ${result.error.message}`);
    }
  }

  const byStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >;
  let completedAmount = 0;
  let paidAmount = 0;
  for (const order of orders.data ?? []) {
    byStatus[order.status] += 1;
    if (order.status === "completed") completedAmount += order.total;
    if (order.payment_status === "paid") paidAmount += order.total;
  }

  return {
    totalOrders: orders.data?.length ?? 0,
    byStatus,
    completedAmount,
    paidAmount,
    activeProducts: activeProducts.count ?? 0,
    pendingReviews: pendingReviews.count ?? 0,
    recentOrders: recent.data ?? [],
  };
}

export async function listOrders(params: {
  status: OrderStatus | null;
  query: string;
  page: number;
}) {
  const { supabase } = await requireAdmin();
  let request = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, total, status, payment_status, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (params.status) request = request.eq("status", params.status);
  if (params.query) {
    // Caractères réservés de la syntaxe de filtre PostgREST retirés de la recherche.
    const term = params.query.replace(/[%_,.()*\\:"]/g, " ").trim();
    if (term) {
      request = request.or(
        `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`,
      );
    }
  }

  const from = (params.page - 1) * ORDERS_PAGE_SIZE;
  const { data, error, count } = await request.range(from, from + ORDERS_PAGE_SIZE - 1);
  if (error?.code === "PGRST103") return { orders: [], total: count ?? 0 };
  if (error) throw new Error(`Lecture des commandes impossible : ${error.message}`);
  return { orders: data, total: count ?? 0 };
}

export async function getOrder(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(id, product_id, product_name, unit_price, quantity, line_total)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Lecture de la commande impossible : ${error.message}`);
  return data;
}

import "server-only";
import { requireAdmin } from "@/features/auth/session";

export async function listAdminProducts(query: string) {
  const { supabase } = await requireAdmin();
  let request = supabase
    .from("products")
    .select(
      "id, name, slug, price, stock_quantity, is_active, is_featured, updated_at, category:categories(name), product_images(storage_path, sort_order)",
    )
    .order("updated_at", { ascending: false })
    .limit(500);
  if (query) {
    request = request.ilike("name", `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`);
  }

  const { data, error } = await request;
  if (error) throw new Error(`Lecture des produits impossible : ${error.message}`);
  return data.map((product) => ({
    ...product,
    imagePath:
      [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path ??
      null,
  }));
}

export async function getAdminProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, storage_path, alt_text, sort_order)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Lecture du produit impossible : ${error.message}`);
  if (!data) return null;
  return {
    ...data,
    product_images: [...data.product_images].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;

export async function getCategoryOptions() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, is_active")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`Lecture des catégories impossible : ${error.message}`);
  return data;
}

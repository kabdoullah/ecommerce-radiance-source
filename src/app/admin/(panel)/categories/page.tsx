import type { Metadata } from "next";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Badge, PageHeader, Panel } from "@/components/admin/page-header";
import { requireAdmin } from "@/features/auth/session";
import { deleteCategory } from "@/features/categories/admin-actions";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryIconBadge, toCategoryIcon } from "@/features/categories/icons";

export const metadata: Metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order, is_active, icon, products(count)")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`Lecture des catégories impossible : ${error.message}`);

  return (
    <>
      <PageHeader
        title="Catégories"
        description="Les catégories regroupent les produits dans la boutique et servent de filtres."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section aria-label="Catégories existantes" className="space-y-3">
          {categories.length === 0 && (
            <p className="rounded-card bg-surface p-6 text-ink-soft">
              Aucune catégorie. Créez-en une avec le formulaire.
            </p>
          )}
          {categories.map((category) => {
            const productCount = category.products[0]?.count ?? 0;
            return (
              <details
                key={category.id}
                className="group rounded-card border border-line bg-surface"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span>
                    <CategoryIconBadge icon={toCategoryIcon(category.icon)} className="mr-3 inline-flex size-8 align-middle" />
                    <span className="font-semibold">{category.name}</span>
                    <span className="ml-2 text-sm text-ink-soft">
                      {productCount} produit{productCount > 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    {category.is_active ? (
                      <Badge tone="success">Visible</Badge>
                    ) : (
                      <Badge>Masquée</Badge>
                    )}
                    <span className="text-sm font-semibold text-cocoa group-open:hidden">
                      Modifier
                    </span>
                  </span>
                </summary>
                <div className="space-y-5 border-t border-line p-4">
                  <CategoryForm category={category} />
                  <div className="border-t border-line pt-4">
                    <ConfirmAction
                      label="Supprimer la catégorie"
                      title={`Supprimer « ${category.name} » ?`}
                      description={
                        productCount > 0
                          ? `Elle contient ${productCount} produit(s) : déplacez-les d'abord vers une autre catégorie, ou masquez-la simplement.`
                          : "La catégorie sera définitivement supprimée."
                      }
                      confirmLabel="Supprimer"
                      action={deleteCategory.bind(null, category.id)}
                    />
                  </div>
                </div>
              </details>
            );
          })}
        </section>

        <Panel title="Nouvelle catégorie">
          <CategoryForm />
        </Panel>
      </div>
    </>
  );
}

import { Search } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { AutoSubmitSelect } from "@/components/shared/auto-submit-select";
import { ProductGrid } from "@/components/shared/product-card";
import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/field";
import { getActiveCategories } from "@/features/categories/queries";
import {
  CATALOG_PAGE_SIZE,
  CATALOG_SORTS,
  catalogHref,
  parseCatalogParams,
} from "@/features/products/catalog-params";
import { getCatalog } from "@/features/products/queries";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Tous nos produits, leurs prix en FCFA et leur disponibilité.",
  alternates: { canonical: "/boutique" },
};

export default function ShopPage(props: PageProps<"/boutique">) {
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-4xl sm:text-5xl">Boutique</h1>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Catalog({ searchParams }: Pick<PageProps<"/boutique">, "searchParams">) {
  const params = parseCatalogParams(await searchParams);
  const [categories, { products, total }] = await Promise.all([
    getActiveCategories(),
    getCatalog(params),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const activeCategory = categories.find((category) => category.slug === params.category);

  return (
    <>
      <Form action="/boutique" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        {params.category && <input type="hidden" name="categorie" value={params.category} />}
        <div className="flex-1">
          <label htmlFor="q" className="sr-only">
            Rechercher un produit
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={params.query}
              placeholder="Rechercher un produit"
              maxLength={80}
              className={`${inputStyles} pl-9`}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <label htmlFor="tri" className="sr-only">
            Trier par
          </label>
          <AutoSubmitSelect
            id="tri"
            name="tri"
            defaultValue={params.sort}
            className={`${inputStyles} sm:w-48`}
          >
            {Object.entries(CATALOG_SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </AutoSubmitSelect>
          <button type="submit" className={buttonStyles("primary", "md", "shrink-0")}>
            Rechercher
          </button>
        </div>
      </Form>

      {categories.length > 0 && (
        <nav aria-label="Catégories" className="mt-6">
          <ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            <li className="shrink-0">
              <CategoryPill
                href={catalogHref({ ...params, category: null, page: 1 })}
                active={!params.category}
              >
                Tout
              </CategoryPill>
            </li>
            {categories.map((category) => (
              <li key={category.id} className="shrink-0">
                <CategoryPill
                  href={catalogHref({ ...params, category: category.slug, page: 1 })}
                  active={params.category === category.slug}
                >
                  {category.name}
                </CategoryPill>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <p className="mt-6 text-sm text-ink-soft" role="status">
        {total === 0 ? "Aucun produit" : `${total} produit${total > 1 ? "s" : ""}`}
        {activeCategory && ` dans « ${activeCategory.name} »`}
        {params.query && ` pour « ${params.query} »`}
      </p>

      {products.length > 0 ? (
        <div className="mt-6">
          <ProductGrid products={products} priorityCount={4} />
        </div>
      ) : (
        <div className="mt-6 rounded-card bg-mist px-6 py-14 text-center">
          <p className="font-display text-2xl">Aucun produit ne correspond.</p>
          <p className="mt-2 text-ink-soft">Essayez un autre mot-clé ou affichez toute la boutique.</p>
          <Link href="/boutique" className={buttonStyles("secondary", "md", "mt-6")}>
            Voir tous les produits
          </Link>
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-4 text-sm">
          {params.page > 1 ? (
            <Link
              href={catalogHref({ ...params, page: params.page - 1 })}
              className={buttonStyles("secondary", "sm")}
            >
              Page précédente
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {Math.min(params.page, pageCount)} sur {pageCount}
          </span>
          {params.page < pageCount ? (
            <Link
              href={catalogHref({ ...params, page: params.page + 1 })}
              className={buttonStyles("secondary", "sm")}
            >
              Page suivante
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

function CategoryPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`block rounded-full border px-4 py-2 text-sm font-medium ${
        active
          ? "border-cocoa bg-cocoa text-white"
          : "border-line bg-surface hover:border-cocoa"
      }`}
    >
      {children}
    </Link>
  );
}

function CatalogSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement des produits" className="mt-8">
      <div className="h-11 rounded-md bg-mist" />
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index}>
            <div className="aspect-[4/5] animate-pulse rounded-card bg-mist" />
            <div className="mt-3 h-4 w-3/4 rounded bg-mist" />
            <div className="mt-2 h-4 w-1/3 rounded bg-mist" />
          </li>
        ))}
      </ul>
    </div>
  );
}

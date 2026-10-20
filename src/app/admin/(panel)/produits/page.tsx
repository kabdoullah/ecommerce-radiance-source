import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Badge, PageHeader } from "@/components/admin/page-header";
import { buttonStyles } from "@/components/ui/button";
import { FormMessage, inputStyles } from "@/components/ui/field";
import { listAdminProducts } from "@/features/products/admin-queries";
import { mediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Produits" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/produits">) {
  const raw = await searchParams;
  const query = (typeof raw.q === "string" ? raw.q : "").trim().slice(0, 80);
  const products = await listAdminProducts(query);

  return (
    <>
      <PageHeader
        title="Produits"
        description="Créez, modifiez et publiez les produits de la boutique."
        actions={
          <Link href="/admin/produits/nouveau" className={buttonStyles("primary", "md")}>
            Nouveau produit
          </Link>
        }
      />

      {raw.supprime && (
        <div className="mb-6">
          <FormMessage tone="success">Produit supprimé.</FormMessage>
        </div>
      )}

      <Form action="/admin/produits" className="mb-6 flex gap-3">
        <label htmlFor="q" className="sr-only">
          Rechercher un produit
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Rechercher par nom"
          className={`${inputStyles} max-w-xs`}
        />
        <button type="submit" className={buttonStyles("secondary", "md")}>
          Rechercher
        </button>
      </Form>

      {products.length === 0 ? (
        <div className="rounded-card bg-surface p-8 text-center">
          <p className="text-ink-soft">
            {query ? "Aucun produit ne correspond à cette recherche." : "Aucun produit pour le moment."}
          </p>
          {!query && (
            <Link href="/admin/produits/nouveau" className={buttonStyles("primary", "md", "mt-4")}>
              Créer le premier produit
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-card border border-line bg-surface">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/admin/produits/${product.id}`}
                className="flex items-center gap-4 p-3 hover:bg-paper sm:p-4"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded bg-mist">
                  {product.imagePath && (
                    <Image
                      src={mediaUrl(product.imagePath)}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{product.name}</p>
                  <p className="text-sm text-ink-soft">
                    {product.category?.name ?? "Sans catégorie"}, {formatPrice(product.price)}
                    {product.stock_quantity !== null && `, stock : ${product.stock_quantity}`}
                  </p>
                </div>
                <div className="hidden flex-wrap justify-end gap-1 sm:flex">
                  {product.is_active ? <Badge tone="success">Publié</Badge> : <Badge>Masqué</Badge>}
                  {product.is_featured && <Badge tone="warning">En avant</Badge>}
                  {product.stock_quantity === 0 && <Badge tone="danger">Épuisé</Badge>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

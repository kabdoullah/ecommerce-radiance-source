import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { buttonStyles } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import { deleteProduct } from "@/features/products/admin-actions";
import { getAdminProduct, getCategoryOptions } from "@/features/products/admin-queries";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductImagesManager } from "@/features/products/components/product-images-manager";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/produits/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [product, categories, raw] = await Promise.all([
    getAdminProduct(id),
    getCategoryOptions(),
    searchParams,
  ]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/produits" className="text-sm text-cocoa hover:underline">
        Retour aux produits
      </Link>
      <div className="mt-4">
        <PageHeader
          title={product.name}
          actions={
            product.is_active && (
              <Link
                href={`/produits/${product.slug}`}
                target="_blank"
                className={buttonStyles("secondary", "sm")}
              >
                Voir sur la boutique
              </Link>
            )
          }
        />
      </div>

      {raw.nouveau && (
        <div className="mb-6">
          <FormMessage tone="success">
            Produit créé. Ajoutez maintenant ses photos, puis cochez « Publié sur la boutique » pour
            le mettre en ligne.
          </FormMessage>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_26rem]">
        <Panel title="Informations">
          <ProductForm product={product} categories={categories} />
        </Panel>
        <div className="space-y-6">
          <Panel title="Photos">
            <ProductImagesManager productId={product.id} images={product.product_images} />
          </Panel>
          <Panel title="Supprimer le produit">
            <p className="mb-4 text-sm text-ink-soft">
              Un produit déjà commandé ne peut pas être supprimé : masquez-le plutôt pour conserver
              l&apos;historique.
            </p>
            <ConfirmAction
              label="Supprimer ce produit"
              title={`Supprimer « ${product.name} » ?`}
              description="Le produit et ses photos seront définitivement supprimés. Cette action est irréversible."
              confirmLabel="Supprimer définitivement"
              action={deleteProduct.bind(null, product.id)}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}

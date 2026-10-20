import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { getCategoryOptions } from "@/features/products/admin-queries";
import { ProductForm } from "@/features/products/components/product-form";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  const categories = await getCategoryOptions();
  return (
    <>
      <Link href="/admin/produits" className="text-sm text-cocoa hover:underline">
        Retour aux produits
      </Link>
      <div className="mt-4">
        <PageHeader
          title="Nouveau produit"
          description="Renseignez les informations, puis ajoutez les photos à l'étape suivante."
        />
      </div>
      <Panel>
        <ProductForm categories={categories} />
      </Panel>
    </>
  );
}

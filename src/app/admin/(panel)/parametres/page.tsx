import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/features/auth/session";
import { SettingsForm } from "@/features/store-settings/components/settings-form";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  // Lecture directe (non mise en cache) pour toujours modifier la dernière version.
  const { data: settings, error } = await supabase.from("store_settings").select("*").single();
  if (error) throw new Error(`Lecture des paramètres impossible : ${error.message}`);

  return (
    <>
      <PageHeader
        title="Paramètres de la boutique"
        description="Ces informations apparaissent sur la boutique. Les changements sont visibles dès l'enregistrement."
      />
      <SettingsForm settings={settings} />
    </>
  );
}

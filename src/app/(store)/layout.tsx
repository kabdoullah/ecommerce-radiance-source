import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { getStoreSettings } from "@/features/store-settings/queries";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const settings = await getStoreSettings();
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      {settings.whatsapp_number && <WhatsAppFloat number={settings.whatsapp_number} />}
    </>
  );
}

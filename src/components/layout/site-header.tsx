import { Menu, Phone, Search, Truck, Wallet } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { getStoreSettings } from "@/features/store-settings/queries";
import { CartLink } from "./cart-link";
import { STORE_NAV } from "@/config/navigation";
import { MainNav, MainNavLinks } from "./main-nav";

export async function SiteHeader() {
  const settings = await getStoreSettings();
  const announcements = [
    { icon: Truck, text: settings.delivery_summary },
    { icon: Wallet, text: settings.payment_summary },
    {
      icon: Phone,
      text: settings.contact_phone ? `Service client : ${settings.contact_phone}` : "",
    },
  ].filter((item) => item.text);

  return (
    <>
      {announcements.length > 0 && (
        <div className="bg-cocoa text-white">
          <ul className="container-page flex h-9 items-center justify-center gap-10 text-xs md:justify-between">
            {announcements.map(({ icon: Icon, text }, index) => (
              <li
                key={text}
                className={`items-center gap-2 ${index === 0 ? "flex" : "hidden md:flex"}`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          Aller au contenu
        </a>
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 sm:h-20">
          <Link href="/" aria-label={`${settings.store_name}, accueil`}>
            <Logo
              name={settings.store_name}
              tagline={settings.tagline}
              logoPath={settings.logo_path}
            />
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <Suspense fallback={<MainNavLinks pathname={null} />}>
              <MainNav />
            </Suspense>
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/boutique"
              aria-label="Rechercher un produit"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-mist"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>
            <CartLink />
            <details className="relative lg:hidden">
              <summary
                className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-mist [&::-webkit-details-marker]:hidden"
                aria-label="Menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </summary>
              <nav
                aria-label="Navigation mobile"
                className="absolute right-0 top-12 w-60 rounded-card border border-line bg-surface p-2 shadow-lg"
              >
                <ul>
                  {STORE_NAV.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="block rounded px-3 py-3 text-sm hover:bg-mist">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

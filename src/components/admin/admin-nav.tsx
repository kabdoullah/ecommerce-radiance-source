"use client";

import {
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Settings,
  ShoppingBag,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tags },
  { href: "/admin/avis", label: "Avis clients", icon: MessageSquareQuote },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
] as const;

export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}

/** Sans `pathname` (pré-rendu), aucun lien n'est mis en surbrillance. */
export function AdminNavLinks({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) =>
    pathname !== null && (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <nav
      aria-label="Administration"
      className="border-b border-line bg-surface lg:min-h-full lg:border-b-0 lg:border-r"
    >
      <Link
        href="/admin"
        className="hidden items-center gap-2 px-6 py-6 font-display text-xl lg:flex"
      >
        <LogoMark className="size-6 text-cocoa" />
        Administration
      </Link>
      <ul className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:py-0">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                isActive(href) ? "bg-cocoa text-white" : "text-ink hover:bg-mist"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden px-6 py-6 lg:block">
        <Link href="/" target="_blank" className="text-sm text-cocoa hover:underline">
          Voir la boutique
        </Link>
      </div>
    </nav>
  );
}

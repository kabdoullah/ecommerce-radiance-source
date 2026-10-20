"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { STORE_NAV } from "@/config/navigation";

function isActive(pathname: string | null, href: string) {
  if (pathname === null) return false;
  if (href === "/") return pathname === "/";
  if (href === "/boutique") {
    return pathname.startsWith("/boutique") || pathname.startsWith("/produits");
  }
  return false;
}

export function MainNav() {
  return <MainNavLinks pathname={usePathname()} />;
}

/** Sans `pathname` (pré-rendu), aucun lien n'est souligné. */
export function MainNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-5 text-[0.8125rem] font-medium xl:gap-7">
      {STORE_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`border-b-2 py-1.5 hover:text-cocoa ${
                active ? "border-cocoa text-cocoa" : "border-transparent"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

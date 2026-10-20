"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { STORE_NAV } from "@/config/navigation";

/** Ancres de la page d'accueil (« /#univers » → « univers »), dans l'ordre du document. */
const SECTION_IDS = STORE_NAV.flatMap((item) =>
  item.href.startsWith("/#") ? [item.href.slice(2)] : [],
);

function isActive(pathname: string | null, section: string | null, href: string) {
  if (pathname === null) return false;
  if (href.startsWith("/#")) return pathname === "/" && section === href.slice(2);
  if (href === "/") return pathname === "/" && section === null;
  if (href === "/boutique") {
    return pathname.startsWith("/boutique") || pathname.startsWith("/produits");
  }
  return false;
}

/**
 * Section de l'accueil en cours de lecture : la dernière dont le haut a franchi 40 % de l'écran
 * (ou visible en bas de page). La section choisie par un clic reste active tant qu'elle partage
 * sa rangée avec la section calculée (À propos / Avis et Livraison / Contact sont côte à côte).
 */
function useActiveSection(enabled: boolean) {
  const [section, setSection] = useState<string | null>(null);
  const chosen = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    chosen.current = window.location.hash.slice(1) || null;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current: HTMLElement | null = null;
      for (const id of SECTION_IDS) {
        const element = document.getElementById(id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top;
        if (top > line && !(atBottom && top < window.innerHeight)) continue;
        // Sur une même rangée, ou à l'intérieur d'une section, la première reste active.
        const sameRow = current && Math.abs(current.getBoundingClientRect().top - top) < 1;
        if (!sameRow && !current?.contains(element)) current = element;
      }

      const preferred = chosen.current ? document.getElementById(chosen.current) : null;
      if (current && preferred) {
        const box = preferred.getBoundingClientRect();
        const top = current.getBoundingClientRect().top;
        if (top >= box.top - 1 && top < box.bottom) current = preferred;
      }
      setSection(current?.id ?? null);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onHashChange = () => {
      chosen.current = window.location.hash.slice(1) || null;
      schedule();
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [enabled]);

  // Le clic active le lien tout de suite : si la section est déjà à l'écran, rien ne défile.
  const choose = (href: string) => {
    chosen.current = href.startsWith("/#") ? href.slice(2) : null;
    if (chosen.current) setSection(chosen.current);
  };
  return { section, choose };
}

export function MainNav() {
  const pathname = usePathname();
  const { section, choose } = useActiveSection(pathname === "/");
  return <MainNavLinks pathname={pathname} section={section} onNavigate={choose} />;
}

/** Sans `pathname` (pré-rendu), aucun lien n'est souligné. */
export function MainNavLinks({
  pathname,
  section = null,
  onNavigate,
}: {
  pathname: string | null;
  section?: string | null;
  onNavigate?: (href: string) => void;
}) {
  return (
    <ul className="flex items-center gap-5 text-[0.8125rem] font-medium xl:gap-7">
      {STORE_NAV.map((item) => {
        const active = isActive(pathname, section, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => onNavigate?.(item.href)}
              aria-current={active ? (item.href.startsWith("/#") ? "location" : "page") : undefined}
              className={`border-b-2 py-1.5 hover:text-bordeaux ${
                active ? "border-fuchsia text-bordeaux" : "border-transparent"
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

"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { STORE_NAV } from "@/config/navigation";

/**
 * Menu mobile (<details> natif). L'en-tête persiste entre les pages : le menu se referme
 * lui-même au choix d'un lien, à la touche Échap ou à un appui en dehors.
 */
export function MobileMenu() {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => {
      if (ref.current) ref.current.open = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !ref.current?.open) return;
      close();
      ref.current.querySelector("summary")?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={ref} className="relative lg:hidden">
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
              <Link
                href={item.href}
                onClick={() => {
                  if (ref.current) ref.current.open = false;
                }}
                className="block rounded px-3 py-3 text-sm hover:bg-mist"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}

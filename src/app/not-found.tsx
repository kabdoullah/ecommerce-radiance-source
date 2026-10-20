import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto size-12 text-bordeaux" />
        <h1 className="mt-6 font-display text-4xl">Page introuvable</h1>
        <p className="mt-3 text-ink-soft">
          Cette page n&apos;existe pas ou plus. Le produit a peut-être été retiré de la boutique.
        </p>
        <Link href="/boutique" className={buttonStyles("primary", "md", "mt-8")}>
          Voir la boutique
        </Link>
      </div>
    </main>
  );
}

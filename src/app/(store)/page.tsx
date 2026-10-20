import {
  ArrowRight,
  ClipboardList,
  Headset,
  HeartHandshake,
  PackageCheck,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { ProductGrid } from "@/components/shared/product-card";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { buttonStyles } from "@/components/ui/button";
import { CategoryIconBadge } from "@/features/categories/icons";
import { getActiveCategories } from "@/features/categories/queries";
import { getFeaturedProducts } from "@/features/products/queries";
import { ReviewCarousel } from "@/features/reviews/components/review-carousel";
import { getRecentReviews } from "@/features/reviews/queries";
import { getStoreSettings } from "@/features/store-settings/queries";
import { mediaUrl } from "@/lib/media";
import { splitLines } from "@/lib/utils/text";

const HIGHLIGHT_ICONS = [ShieldCheck, PackageCheck, HeartHandshake];

export default async function HomePage() {
  const [settings, featured, categories, reviews] = await Promise.all([
    getStoreSettings(),
    getFeaturedProducts(10),
    getActiveCategories(),
    getRecentReviews(6),
  ]);

  const aboutHighlights = splitLines(settings.about_highlights, 3);
  const whatsappHref = settings.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}` : null;

  return (
    <>
      {/* Héros */}
      <section className="relative overflow-hidden bg-blush">
        {settings.hero_image_path ? (
          <Image
            src={mediaUrl(settings.hero_image_path)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
        ) : (
          <LogoMark className="absolute -right-10 top-1/2 size-[28rem] -translate-y-1/2 text-gold/25" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-mist via-mist/85 to-transparent md:via-mist/60" />
        <div className="container-page relative grid min-h-[26rem] items-center gap-8 py-14 md:min-h-[30rem] md:grid-cols-[1fr_auto]">
          <div className="max-w-xl animate-rise">
            <LogoMark className="mb-3 size-12 text-gold" />
            <h1 className="font-display text-5xl font-bold leading-tight text-bordeaux sm:text-6xl">
              {settings.hero_title || settings.store_name}
            </h1>
            {settings.hero_script && (
              <p className="mt-1 font-script text-4xl text-ink sm:text-5xl">{settings.hero_script}</p>
            )}
            {settings.hero_subtitle && (
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink">{settings.hero_subtitle}</p>
            )}
            <Link href="/boutique" className={buttonStyles("primary", "lg", "mt-8")}>
              Découvrir nos produits
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {settings.hero_side_quote && (
            <p className="hidden max-w-[14rem] text-right font-script text-3xl leading-snug text-fuchsia md:block">
              {settings.hero_side_quote}
            </p>
          )}
        </div>
      </section>

      {/* Univers (catégories) */}
      {categories.length > 0 && (
        <section id="univers" aria-label="Notre univers" className="scroll-mt-24 bg-surface py-8">
          <ul className="container-page grid grid-cols-3 gap-y-6 sm:grid-cols-5">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/boutique?categorie=${category.slug}`}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <CategoryIconBadge
                    icon={category.icon}
                    className="size-16 transition-colors group-hover:bg-bordeaux group-hover:text-white sm:size-[4.5rem]"
                  />
                  <span className="max-w-[9rem] text-xs font-semibold leading-snug sm:text-sm">
                    {category.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Produits phares */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-title" className="container-page py-14">
          <div className="relative mb-8 text-center">
            <h2
              id="featured-title"
              className="section-title font-display text-3xl font-bold italic text-bordeaux sm:text-4xl"
            >
              Nos produits phares
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Des produits soigneusement sélectionnés pour votre bien-être.
            </p>
            <Link
              href="/boutique"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink hover:bg-blush lg:absolute lg:right-0 lg:top-2 lg:mt-0"
            >
              Voir tout le catalogue
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ProductGrid products={featured} priorityCount={2} />
        </section>
      )}

      {/* À propos + avis */}
      <section className="container-page grid gap-6 pb-14 lg:grid-cols-[1.45fr_1fr]">
        <div
          id="a-propos"
          className={`relative grid scroll-mt-24 overflow-hidden rounded-2xl bg-gradient-to-br from-mist to-blush sm:grid-cols-[1.1fr_1fr] ${
            reviews.length === 0 ? "lg:col-span-2" : ""
          }`}
        >
          <div className="relative z-10 p-7 sm:p-9">
            <h2 className="font-display leading-tight">
              {settings.about_title ? (
                <span className="text-2xl font-bold text-bordeaux sm:text-3xl">
                  {settings.about_title}
                </span>
              ) : (
                <>
                  <span className="block text-lg font-semibold">À propos de</span>
                  <span className="block text-2xl font-bold text-bordeaux sm:text-3xl">
                    {settings.store_name}
                  </span>
                </>
              )}
            </h2>
            {settings.about_text && (
              <div className="mt-4 space-y-3 text-sm leading-relaxed">
                {settings.about_text.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
            {aboutHighlights.length > 0 && (
              <ul className="mt-5 grid grid-cols-3 gap-3">
                {aboutHighlights.map((highlight, index) => {
                  const Icon = HIGHLIGHT_ICONS[index];
                  return (
                    <li key={highlight} className="flex items-start gap-2 text-[0.6875rem] leading-snug">
                      <Icon className="size-5 shrink-0 text-bordeaux" strokeWidth={1.5} aria-hidden="true" />
                      {highlight}
                    </li>
                  );
                })}
              </ul>
            )}
            <Link href="/boutique" className={buttonStyles("primary", "sm", "mt-6")}>
              Voir nos produits
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative min-h-56 sm:min-h-0">
            {settings.about_image_path ? (
              <Image
                src={mediaUrl(settings.about_image_path)}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
                className="object-cover sm:rounded-l-[50%_40%]"
              />
            ) : (
              <div className="flex h-full items-center justify-center" aria-hidden="true">
                <LogoMark className="size-40 text-gold/40" />
              </div>
            )}
          </div>
        </div>

        {reviews.length > 0 && (
          <div id="avis" className="flex scroll-mt-24 flex-col rounded-2xl bg-mist p-7 sm:p-9">
            <h2 className="font-display text-2xl font-bold text-bordeaux">Elles nous font confiance</h2>
            <p className="mb-6 mt-1 text-sm text-ink-soft">Découvrez les avis de nos clientes</p>
            <ReviewCarousel reviews={reviews} />
          </div>
        )}
      </section>

      {/* Livraison, paiement, commande, contact */}
      <section id="livraison" aria-label="Livraison et paiement" className="scroll-mt-24 bg-mist py-10">
        {/* Dernière colonne à la largeur du bouton : le numéro de téléphone ne se coupe pas. */}
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          {settings.delivery_info && (
            <InfoItem icon={Truck} title="Livraison">
              {settings.delivery_info}
            </InfoItem>
          )}
          {settings.payment_info && (
            <InfoItem icon={Wallet} title="Paiement">
              {settings.payment_info}
            </InfoItem>
          )}
          <InfoItem icon={ClipboardList} title="Comment commander ?">
            <ol className="list-inside list-decimal space-y-0.5">
              <li>Choisissez vos produits</li>
              <li>Cliquez sur « Commander sur WhatsApp »</li>
              <li>Confirmez votre commande</li>
            </ol>
          </InfoItem>
          <div id="contact" className="scroll-mt-24">
            <InfoItem icon={Headset} title="Une question ?">
              <p>Contactez-nous sur WhatsApp</p>
              {whatsappHref && (
                <WhatsAppLink
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles("primary", "sm", "mt-3 whitespace-nowrap")}
                >
                  <WhatsAppIcon className="size-4" />
                  {settings.contact_phone || "Écrire sur WhatsApp"}
                </WhatsAppLink>
              )}
            </InfoItem>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoItem({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Truck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-surface text-bordeaux"
        aria-hidden="true"
      >
        <Icon className="size-6" strokeWidth={1.5} />
      </span>
      <div className="text-xs leading-relaxed text-ink-soft">
        <h3 className="mb-1 text-sm font-semibold text-ink">{title}</h3>
        {children}
      </div>
    </div>
  );
}

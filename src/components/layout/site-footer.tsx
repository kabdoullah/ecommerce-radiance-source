import { Heart } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/brand/social-icons";
import { getStoreSettings } from "@/features/store-settings/queries";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { STORE_NAV } from "@/config/navigation";

export async function SiteFooter() {
  const settings = await getStoreSettings();
  const socials = [
    { label: "Facebook", href: settings.facebook_url, icon: FacebookIcon },
    { label: "Instagram", href: settings.instagram_url, icon: InstagramIcon },
    { label: "TikTok", href: settings.tiktok_url, icon: TikTokIcon },
    {
      label: "WhatsApp",
      href: settings.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}` : null,
      icon: WhatsAppIcon,
    },
  ].filter((social) => Boolean(social.href));

  return (
    <footer className="bg-bordeaux-deep text-white/85">
      <div className="container-page grid items-center gap-8 py-10 lg:grid-cols-[auto_1fr_auto]">
        <Logo
          name={settings.store_name}
          tagline={settings.tagline}
          logoPath={settings.logo_path}
          tone="light"
        />

        <nav aria-label="Pied de page">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs lg:justify-center">
            {STORE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {socials.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-white">Suivez-nous</p>
            <ul className="flex gap-2">
              {socials.map(({ label, href, icon: Icon }) => {
                const Anchor = label === "WhatsApp" ? WhatsAppLink : "a";
                return (
                  <li key={label}>
                    <Anchor
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex size-9 items-center justify-center rounded-full bg-white text-bordeaux-deep hover:bg-blush"
                    >
                      <Icon className="size-4" />
                    </Anchor>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-white/10">
        <p className="container-page flex items-center justify-center gap-2 py-5 text-center text-xs text-white/75">
          {settings.store_name}
          {settings.footer_text && ` – ${settings.footer_text}`}
          <Heart className="size-3.5 fill-white text-white" aria-hidden="true" />
        </p>
      </div>
    </footer>
  );
}

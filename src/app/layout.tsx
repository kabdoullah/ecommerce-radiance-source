import type { Metadata, Viewport } from "next";
import { Great_Vibes, Montserrat, Playfair_Display } from "next/font/google";
import { siteUrl } from "@/config/site";
import { getStoreSettings } from "@/features/store-settings/queries";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-script-face",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.store_name, template: `%s · ${settings.store_name}` },
    description: settings.hero_subtitle || settings.tagline || undefined,
    openGraph: { siteName: settings.store_name, locale: "fr_FR", type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#720026",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${greatVibes.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

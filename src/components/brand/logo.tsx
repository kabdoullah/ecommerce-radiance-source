import Image from "next/image";
import { mediaUrl } from "@/lib/media";

/** Emblème par défaut (feuille), remplacé par le logo envoyé dans Paramètres. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M24 42c0-12 3-22 14-30" />
      <path d="M38 12c1 9-4 17-14 18 0-9 5-16 14-18Z" fill="currentColor" fillOpacity=".18" />
      <path d="M24 42c0-8-2-15-10-21-1 8 3 14 10 16" fill="currentColor" fillOpacity=".12" />
      <path d="M26 26c3-3 6-6 9-9" />
    </svg>
  );
}

export function Logo({
  name,
  tagline,
  logoPath,
  tone = "dark",
}: {
  name: string;
  tagline?: string | null;
  logoPath: string | null;
  tone?: "dark" | "light";
}) {
  const nameColor = tone === "dark" ? "text-bordeaux" : "text-white";
  return (
    <span className="inline-flex items-center gap-3">
      {logoPath ? (
        <Image
          src={mediaUrl(logoPath)}
          alt=""
          width={56}
          height={56}
          className="size-11 rounded-full object-cover sm:size-14"
          priority
        />
      ) : (
        <LogoMark className="size-10 text-gold sm:size-12" />
      )}
      <span className="flex flex-col">
        <span className={`font-display text-xl font-semibold leading-tight sm:text-2xl ${nameColor}`}>
          {name}
        </span>
        {tagline && (
          <span
            className={`text-[0.6875rem] tracking-wide ${tone === "dark" ? "text-ink-soft" : "text-white/70"}`}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}

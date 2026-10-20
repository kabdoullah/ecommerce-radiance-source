import {
  Droplet,
  Flower2,
  Gift,
  Leaf,
  Milk,
  Smile,
  SoapDispenserDroplet,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/** Icônes proposées pour les catégories. Garder en phase avec la contrainte SQL `categories.icon`. */
export const CATEGORY_ICONS = {
  bottle: { label: "Flacon (gels douche, soins corps)", icon: Milk },
  soap: { label: "Savon", icon: SoapDispenserDroplet },
  face: { label: "Visage", icon: Smile },
  hair: { label: "Cheveux", icon: UserRound },
  gift: { label: "Cadeau (lots, promotions)", icon: Gift },
  leaf: { label: "Feuille (naturel)", icon: Leaf },
  droplet: { label: "Goutte (huiles, sérums)", icon: Droplet },
  flower: { label: "Fleur (parfums)", icon: Flower2 },
  sparkles: { label: "Éclat", icon: Sparkles },
} satisfies Record<string, { label: string; icon: LucideIcon }>;

export type CategoryIcon = keyof typeof CATEGORY_ICONS;

export function toCategoryIcon(value: string | null): CategoryIcon {
  return value && value in CATEGORY_ICONS ? (value as CategoryIcon) : "leaf";
}

export function CategoryIconBadge({
  icon,
  className = "",
}: {
  icon: CategoryIcon;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[icon].icon;
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-blush text-cocoa ${className}`}
      aria-hidden="true"
    >
      <Icon className="size-1/2" strokeWidth={1.4} />
    </span>
  );
}

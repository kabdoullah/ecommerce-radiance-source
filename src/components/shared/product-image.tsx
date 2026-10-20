import Image from "next/image";
import { LogoMark } from "@/components/brand/logo";
import { mediaUrl } from "@/lib/media";

/** Image produit (4:5 ou carrée), sans déformation ; emblème de la marque si aucune photo. */
export function ProductImage({
  image,
  sizes,
  priority = false,
  aspect = "aspect-[4/5]",
  className = "",
}: {
  image: { path: string; alt: string } | null;
  sizes: string;
  priority?: boolean;
  aspect?: "aspect-[4/5]" | "aspect-square";
  className?: string;
}) {
  return (
    <div className={`relative ${aspect} overflow-hidden rounded-card bg-mist ${className}`}>
      {image ? (
        <Image
          src={mediaUrl(image.path)}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center" aria-hidden="true">
          <LogoMark className="size-14 text-bordeaux/25" />
        </div>
      )}
    </div>
  );
}

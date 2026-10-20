"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductImage } from "@/components/shared/product-image";
import { mediaUrl } from "@/lib/media";
import type { ProductImage as ProductImageData } from "../queries";

/** Miniatures en colonne à gauche (ordinateur) ou en ligne sous la photo (mobile). */
export function ProductGallery({ images, name }: { images: ProductImageData[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? null;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-2 sm:w-16 sm:flex-col" aria-label={`Photos de ${name}`}>
          {images.map((image, index) => (
            <li key={image.path} className="w-16 shrink-0">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Afficher la photo ${index + 1}`}
                aria-current={index === activeIndex}
                className={`relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-mist ${
                  index === activeIndex ? "ring-2 ring-cocoa" : "opacity-75 hover:opacity-100"
                }`}
              >
                <Image src={mediaUrl(image.path)} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <ProductImage
        image={active}
        priority
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="flex-1"
      />
    </div>
  );
}

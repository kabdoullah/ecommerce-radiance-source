"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Stars } from "@/components/shared/stars";
import type { PublicReview } from "../queries";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ReviewCarousel({ reviews }: { reviews: PublicReview[] }) {
  const [index, setIndex] = useState(0);
  const review = reviews[index];
  const go = (delta: number) => setIndex((index + delta + reviews.length) % reviews.length);

  return (
    <div className="flex flex-1 flex-col">
      <figure className="flex flex-1 gap-4 rounded-card bg-surface p-5 shadow-sm" aria-live="polite">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blush font-display text-lg text-cocoa"
          aria-hidden="true"
        >
          {initials(review.authorName)}
        </span>
        <div>
          <span className="font-display text-3xl leading-none text-cocoa" aria-hidden="true">
            “
          </span>
          <blockquote className="-mt-2 text-sm leading-relaxed">{review.comment}</blockquote>
          <figcaption className="mt-3 text-sm font-semibold">{review.authorName}</figcaption>
          <Stars rating={review.rating} className="mt-1" />
        </div>
      </figure>
      {reviews.length > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex size-9 items-center justify-center rounded-full text-cocoa hover:bg-blush"
            aria-label="Avis précédent"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="flex">
            {/* Zone cliquable de 24 px autour d'une pastille de 8 px (cible tactile minimale). */}
            {reviews.map((item, dot) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(dot)}
                aria-label={`Afficher l'avis ${dot + 1}`}
                aria-current={dot === index}
                className="flex size-6 items-center justify-center rounded-full"
              >
                <span
                  className={`size-2 rounded-full ${dot === index ? "bg-cocoa" : "bg-line"}`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex size-9 items-center justify-center rounded-full text-cocoa hover:bg-blush"
            aria-label="Avis suivant"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

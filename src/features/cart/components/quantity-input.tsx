"use client";

import { Minus, Plus } from "lucide-react";
import { clampQuantity } from "../cart-math";

export function QuantityInput({
  value,
  max,
  label,
  onChange,
}: {
  value: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
}) {
  const set = (next: number) => onChange(Math.min(Math.max(1, max), clampQuantity(next)));
  return (
    <div className="flex h-10 w-fit items-center rounded-full border border-line bg-surface">
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={value <= 1}
        className="flex size-10 items-center justify-center rounded-full disabled:opacity-40"
        aria-label={`Diminuer la quantité de ${label}`}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">
        <span className="sr-only">Quantité de {label} : </span>
        {value}
      </span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        className="flex size-10 items-center justify-center rounded-full disabled:opacity-40"
        aria-label={`Augmenter la quantité de ${label}`}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

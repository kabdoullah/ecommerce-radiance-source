import type { ReactNode } from "react";

export const inputStyles =
  "block w-full rounded-md border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-ink-soft/70 focus:border-cocoa focus:outline-none focus:ring-2 focus:ring-cocoa/20 aria-[invalid=true]:border-clay sm:text-sm";

export function Field({
  id,
  label,
  hint,
  error,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-soft">(facultatif)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-clay" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Props d'accessibilité à passer au champ associé à <Field>. */
export function fieldA11y(id: string, error?: string, hint?: string) {
  return {
    id,
    name: id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md px-4 py-3 text-sm ${
        tone === "error" ? "bg-clay/10 text-clay" : "bg-success/10 text-success"
      }`}
    >
      {children}
    </p>
  );
}

import type { ReactNode } from "react";

/** Chevron des listes déroulantes : la flèche native ignore la marge intérieure et colle au bord. */
const SELECT_CHEVRON =
  "[select&]:appearance-none [select&]:bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%237a665c%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpath%20d=%27m6%209%206%206%206-6%27/%3E%3C/svg%3E)] [select&]:bg-size-[1rem] [select&]:bg-position-[right_1rem_center] [select&]:bg-no-repeat [select&]:pr-11";

export const inputStyles = `block w-full rounded-card border border-line bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-soft/70 focus:border-bordeaux focus:outline-none focus:ring-2 focus:ring-bordeaux/20 aria-[invalid=true]:border-error sm:text-sm ${SELECT_CHEVRON}`;

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
        <p id={`${id}-error`} className="text-sm text-error" role="alert">
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
      className={`rounded-card px-4 py-3 text-sm ${
        tone === "error" ? "bg-error/10 text-error" : "bg-success/10 text-success"
      }`}
    >
      {children}
    </p>
  );
}

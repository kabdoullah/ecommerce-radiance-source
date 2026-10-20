/** « Un élément par ligne » (saisie admin) → liste nettoyée, limitée à `max` éléments. */
export function splitLines(value: string | null | undefined, max: number): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}

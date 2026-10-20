export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** « Sérum Éclat — 30 ml » → « serum-eclat-30-ml » */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

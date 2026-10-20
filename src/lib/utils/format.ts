const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** 15000 → « 15 000 FCFA » (espaces insécables). */
export function formatPrice(amount: number): string {
  return `${numberFormat.format(amount)} FCFA`;
}

const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Abidjan",
});

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

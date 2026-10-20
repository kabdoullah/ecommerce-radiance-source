type DbError = { message: string; details?: string | null; hint?: string | null };

/** Traduit les erreurs de create_order() en messages compréhensibles par le client. */
export function describeOrderError(error: DbError): string {
  switch (error.message) {
    case "product_unavailable":
      return error.details
        ? `« ${error.details} » n'est plus disponible. Retirez-le de votre panier pour continuer.`
        : "Un article de votre panier n'est plus disponible. Retirez-le pour continuer.";
    case "insufficient_stock": {
      const remaining = Number(error.hint);
      return Number.isFinite(remaining) && remaining > 0
        ? `Stock insuffisant pour « ${error.details} » : il en reste ${remaining}. Ajustez la quantité.`
        : `« ${error.details} » est en rupture de stock. Retirez-le de votre panier pour continuer.`;
    }
    case "rate_limited":
      return "Plusieurs commandes viennent d'être passées avec ce numéro. Patientez quelques minutes ou contactez-nous directement sur WhatsApp.";
    case "invalid_items":
      return "Votre panier contient une quantité invalide. Vérifiez-le puis réessayez.";
    default:
      return "Votre commande n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez.";
  }
}

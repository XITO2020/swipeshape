// Fonctions de formatage pour dates, nombres, etc.

export function formatDate(date: Date): string {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  
  export function formatCurrency(amount: number, currency = "EUR"): string {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency,
    });
  }
  
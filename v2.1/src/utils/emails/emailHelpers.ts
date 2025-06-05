// Fonctions utilitaires pour emails : validation, formatage, etc.

export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
  
  export function formatDownloadLink(link: string): string {
    // Eventuellement ajoute des tracking params, etc.
    return link;
  }
  
// Validation de champs, données utilisateur, etc.

export function isValidPassword(password: string): boolean {
    // Min 8 chars, majuscule, minuscule, chiffre
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  }
  
  export function isNotEmptyString(str: string): boolean {
    return str.trim().length > 0;
  }
  
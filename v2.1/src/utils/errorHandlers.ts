// Gestion centralisée des erreurs

export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
      super(message);
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export function handleError(err: Error) {
    // Logique de log, alertes, etc.
    console.error(err);
    return {
      message: err.message || "Erreur inconnue",
      statusCode: (err as any).statusCode || 500,
    };
  }
  
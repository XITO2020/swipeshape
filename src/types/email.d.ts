// Type declarations for our email system (Nodemailer-based)

// Extend NodeMailer types if needed
declare module 'nodemailer' {
  // Étendre les types existants si nécessaire
}

// Types globaux pour notre système d'email
declare global {
  // Définition d'un destinataire d'email
  interface EmailRecipient {
    email: string;
    name?: string;
  }

  // Options pour l'envoi d'un email via notre service
  interface EmailOptions {
    to: EmailRecipient | EmailRecipient[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    replyTo?: string;
    attachments?: EmailAttachment[];
  }

  // Définition d'une pièce jointe pour un email
  interface EmailAttachment {
    filename?: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }

  // Définition d'un abonné à la newsletter
  interface NewsletterSubscriber {
    id?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

  // Résultat d'envoi d'email
  interface EmailSendResult {
    success: boolean;
    messageId?: string;
    error?: Error;
  }
}

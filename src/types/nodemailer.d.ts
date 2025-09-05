// src/types/nodemailer.d.ts
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

declare module 'nodemailer' {
  /**
   * createTransport est le default export réel
   */
  export default function createTransport(
    options: SMTPTransport.Options
  ): {
    sendMail(mail: SMTPTransport.MailOptions): Promise<{ response: string }>;
  };
}

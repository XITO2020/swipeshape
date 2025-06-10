// Type declarations for Brevo
declare module '@getbrevo/brevo' {
  export class ApiClient {
    static instance: {
      authentications: {
        'api-key': {
          apiKey: string;
        };
      };
    };
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<any>;
  }

  export class ContactsApi {
    createContact(createContact: CreateContact): Promise<any>;
  }

  export class SendSmtpEmail {
    to?: Array<{ email: string; name?: string }>;
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    sender?: { name: string; email: string };
    tags?: string[];
    attachment?: Array<any>;
    replyTo?: { email: string; name?: string };
  }

  export class CreateContact {
    email?: string;
    attributes?: Record<string, any>;
    listIds?: number[];
  }
}

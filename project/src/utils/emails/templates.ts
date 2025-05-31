// Contient les templates HTML/textes email réutilisables

export const welcomeTemplate = (userName: string) => `
  <p>Bonjour ${userName},</p>
  <p>Bienvenue sur Swipeshape !</p>
  <p>Merci de nous avoir rejoints.</p>
  <p>L'équipe Swipeshape</p>
`;

export const resetPasswordTemplate = (resetUrl: string) => `
  <p>Bonjour,</p>
  <p>Pour réinitialiser votre mot de passe, cliquez sur ce lien :</p>
  <p><a href="${resetUrl}">${resetUrl}</a></p>
  <p>Ce lien est valable 1 heure.</p>
`;

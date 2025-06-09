import mailgun from "./mailgun";
export async function subscribeToNewsletter(email: string) {
  // 1. validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email invalide");
  }
  // 2. Appel à Mailgun
  await mailgun.lists(`${process.env.MAILGUN_LIST_ADDRESS}`).members.create({
    address: email,
    subscribed: true,
  });
  // 3. Envoi du mail de bienvenue
  await sendWelcomeEmail(email);
}

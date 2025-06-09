# Swipeshape

**Swipeshape** est un site e-commerce/​blog construit avec **Vite + React + TailwindCSS + Prisma + Stripe + Mailgun**.

## Fonctionnalités principales

1. **Authentification** (inscription, connexion, JWT).  
2. **CRUD Admin** pour gérer :
   - Articles (création, modification, suppression).  
   - Vidéos (upload de liens YouTube/TikTok, suppression).  
   - Utilisateurs (promouvoir en admin, bannir).  
   - Commentaires (modération, approbation/rejet).  
3. **E-commerce Stripe** :
   - Achat de programmes PDF.  
   - Lien de téléchargement sécurisé (token unique, 7 jours, 2 téléchargements max).  
4. **Newsletter automatiques** :
   - Inscription via formulaire (API Mailgun).  
   - Envoi du mail de bienvenue.  
   - Workflow n8n (Cron) pour envoi hebdomadaire (basé sur la liste Mailgun).  
5. **UI & Design** :
   - Composants UI réutilisables (`Button`, `Card`, `Input`, `Toast`, etc.).  
   - Toasts “arrondis” pour retours utilisateurs.  
   - Layout responsif (TailwindCSS).

## Installation locale

1. Cloner le dépôt  
   ```bash
   git clone https://github.com/XITO2020/swipeshape.git
   cd swipeshape

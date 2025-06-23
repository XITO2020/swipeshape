# Guide de déploiement simplifié pour Vercel

Ce guide explique comment déployer facilement l'application SwipeShape sur Vercel sans avoir à se préoccuper des détails techniques.

## 1. Prérequis

- Un compte [Vercel](https://vercel.com) (vous pouvez vous connecter avec GitHub)
- Le projet SwipeShape prêt sur GitHub/GitLab/Bitbucket

## 2. Déploiement en quelques clics

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "Add New..." puis "Project"
3. Sélectionnez le dépôt GitHub/GitLab/Bitbucket contenant votre projet SwipeShape
4. Sur l'écran de configuration :
   - Framework Preset : Next.js
   - Root Directory : laissez vide (c'est le dossier racine)
   - Build Command : laissez la valeur par défaut (`npm run build`)
   - Output Directory : laissez la valeur par défaut (`.next`)

## 3. Variables d'environnement essentielles

Sur le même écran de configuration, cliquez sur "Environment Variables" et ajoutez les variables suivantes :

```
NEXT_PUBLIC_SUPABASE_URL=https://nwqqxrmobxtwzcnaveqi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cXF4cm1vYnh0d3pjbmF2ZXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjcxMjAsImV4cCI6MjA1OTEwMzEyMH0.mfNO5yGhbYrSTR39G8d0EbNDBa_IFaeunzIIPEvgd3w
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cXF4cm1vYnh0d3pjbmF2ZXFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNzEyMCwiZXhwIjoyMDU5MTAzMTIwfQ.bcun_9xNydFliYw4U1ltdsfas4znG0sJwVrRXudNZAs
```

Ajoutez également vos variables d'email :

```
EMAIL_HOST=votre_serveur_smtp
EMAIL_PORT=587
EMAIL_USER=votre_email
EMAIL_PASS=votre_mot_de_passe
EMAIL_FROM=adresse_expediteur
EMAIL_SECURE=true
```

Ajoutez le reste des variables mentionnées dans votre fichier `.env` selon vos besoins.

## 4. Déployer

Cliquez simplement sur "Deploy" et attendez que le déploiement soit terminé.

## 5. Mise à jour du site

Pour mettre à jour votre site après avoir fait des modifications :
1. Faites un commit et un push de vos changements vers votre dépôt Git
2. Vercel détectera automatiquement les changements et redéploiera votre site

## Résolution des problèmes courants

- **Erreur de build** : Vérifiez que toutes les variables d'environnement sont correctement configurées
- **Problèmes de connexion à Supabase** : Assurez-vous que les clés Supabase sont correctes
- **Problèmes d'envoi d'emails** : Vérifiez les paramètres de votre serveur SMTP

## Support

Si vous rencontrez des problèmes, consultez la [documentation Vercel](https://vercel.com/docs) ou contactez votre développeur.

# Script de déploiement pour SwipeShape en production
Write-Host "🚀 Déploiement de SwipeShape en production..." -ForegroundColor Cyan

# 1. S'assurer que tous les processus Node sont arrêtés
Write-Host "🔄 Arrêt des processus Node existants..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Nettoyer le dossier de build
Write-Host "🧹 Nettoyage des builds précédents..." -ForegroundColor Yellow
if (Test-Path -Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

# 3. Vérifier les variables d'environnement essentielles
Write-Host "🔍 Vérification des variables d'environnement..." -ForegroundColor Yellow
$envFile = ".env.production"
if (-not (Test-Path -Path $envFile)) {
    Write-Host "⚠️ Fichier $envFile introuvable!" -ForegroundColor Red
    Write-Host "Création du fichier .env.production avec la configuration nécessaire..." -ForegroundColor Yellow
    @"
# Variables d'environnement pour la production
NODE_ENV=production

# Variable critique qui désactive la vérification des certificats SSL
# Cette solution est nécessaire pour les certificats auto-signés de Supabase
NODE_TLS_REJECT_UNAUTHORIZED=0
"@ | Out-File -FilePath $envFile -Encoding utf8
}

# 4. Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm ci

# 5. Construire l'application
Write-Host "🔨 Construction de l'application..." -ForegroundColor Yellow
npm run build

# 6. Démarrer en mode production
Write-Host "✅ Déploiement terminé. Démarrage du serveur en mode production..." -ForegroundColor Green
npm start

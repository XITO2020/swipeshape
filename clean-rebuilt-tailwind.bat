@echo off
echo.
echo 🚀 Nettoyage du projet et compilation Tailwind en cours...
echo.

REM Étape 1 : Suppression des caches
echo 🧹 Suppression de node_modules, .next et package-lock.json
rmdir /s /q node_modules
rmdir /s /q .next
del /f /q package-lock.json

REM Étape 2 : Réinstallation des dépendances
echo 📦 Réinstallation des packages...
npm install

REM Étape 3 : Compilation TailwindCSS
echo 🎨 Compilation de TailwindCSS (globaux.css → out.css)
call npx.cmd tailwindcss -i ./src/styles/globals.css -o ./out.css

echo.
echo ✅ Terminé ! Vérifie que le fichier out.css a bien été généré.
pause

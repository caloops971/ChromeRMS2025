@echo off
echo 🚀 === DÉPLOIEMENT CHROME RMS EXTENSION ===
echo.

REM Vérifier si Git est installé
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git n'est pas installé ou pas dans le PATH
    echo 📥 Téléchargez Git depuis: https://git-scm.com/download/windows
    echo 🔄 Puis redémarrez et relancez ce script
    pause
    exit /b 1
)

echo ✅ Git détecté

REM Vérifier si on est dans un repository Git
if not exist ".git" (
    echo 📁 Initialisation du repository Git...
    git init
    echo ✅ Repository Git initialisé
) else (
    echo ✅ Repository Git déjà présent
)

REM Ajouter tous les fichiers
echo 📦 Ajout des fichiers...
git add .

REM Créer le commit
echo 📝 Création du commit...
git commit -m "feat: Version fonctionnelle complète avec synchronisation Rate Code/Plan Code - Nouvelles fonctionnalités: synchronisation Rate Code, support AFFA14, gestion DOLLAR/THRIFTY améliorée, interface compacte, gestionnaire de configuration"

echo ✅ Commit créé avec succès
echo.
echo 🌐 === ÉTAPES SUIVANTES POUR GITHUB ===
echo.
echo 1. 🔗 Créez un nouveau repository sur GitHub:
echo    https://github.com/new
echo.
echo 2. 📝 Nom suggéré: ChromeRMS2025
echo    Description: Extension Chrome pour gestion automatique des tarifs RMS
echo.
echo 3. 🚫 NE PAS initialiser avec README, .gitignore ou licence
echo.
echo 4. 📋 Puis copiez ces commandes (remplacez VOTRE_USERNAME):
echo.
echo    git remote add origin https://github.com/VOTRE_USERNAME/ChromeRMS2025.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 🎉 Repository prêt pour GitHub !
echo.
pause

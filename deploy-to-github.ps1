# Script PowerShell pour déployer l'extension Chrome RMS sur GitHub
# Exécuter avec: .\deploy-to-github.ps1

Write-Host "🚀 === DÉPLOIEMENT CHROME RMS EXTENSION ===" -ForegroundColor Green
Write-Host ""

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git détecté: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "📥 Téléchargez Git depuis: https://git-scm.com/download/windows" -ForegroundColor Yellow
    Write-Host "🔄 Puis redémarrez PowerShell et relancez ce script" -ForegroundColor Yellow
    exit 1
}

# Vérifier si on est dans un repository Git
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initialisation du repository Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repository Git initialisé" -ForegroundColor Green
} else {
    Write-Host "✅ Repository Git déjà présent" -ForegroundColor Green
}

# Ajouter tous les fichiers
Write-Host "📦 Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Créer le commit
$commitMessage = "feat: Version fonctionnelle complète avec synchronisation Rate Code/Plan Code

✨ Nouvelles fonctionnalités:
- Synchronisation automatique Rate Code ↔ Plan Code
- Support AFFA14 complet
- Gestion DOLLAR/THRIFTY améliorée
- Car Type Group automatiquement vidé pour DOLLAR/THRIFTY
- Interface compacte avec sections collapsibles
- Gestionnaire de configuration avec grille de tarifs
- Système de coefficients saisonniers
- Persistance des sélections après rechargement

🔧 Corrections:
- Champs Rate Code/Plan Code réagissent au dropdown
- Date inputs avec simulation d'événements
- Remplissage robuste de tous les tarifs
- CSP compliance (pas d'inline handlers)

📊 Configuration:
- 25 véhicules supportés
- 5 saisons configurées
- Coefficients multiplicateurs automatiques
- Suggestions de tarifs contextuelles"

git commit -m "$commitMessage"
Write-Host "✅ Commit créé avec succès" -ForegroundColor Green

# Instructions pour GitHub
Write-Host ""
Write-Host "🌐 === ÉTAPES SUIVANTES POUR GITHUB ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔗 Créez un nouveau repository sur GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Blue
Write-Host ""
Write-Host "2. 📝 Nom suggéré: ChromeRMS2025" -ForegroundColor White
Write-Host "   Description: Extension Chrome pour gestion automatique des tarifs RMS Hertz/Dollar/Thrifty" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚫 NE PAS initialiser avec README, .gitignore ou licence (déjà présents)" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. 📋 Puis copiez-collez ces commandes (remplacez VOTRE_USERNAME):" -ForegroundColor White
Write-Host ""
Write-Host "git remote add origin https://github.com/VOTRE_USERNAME/ChromeRMS2025.git" -ForegroundColor Green
Write-Host "git branch -M main" -ForegroundColor Green  
Write-Host "git push -u origin main" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Alternative avec SSH (si configuré):" -ForegroundColor Gray
Write-Host "git remote add origin git@github.com:VOTRE_USERNAME/ChromeRMS2025.git" -ForegroundColor Gray
Write-Host ""

# Afficher l'état actuel
Write-Host "📊 === ÉTAT ACTUEL ===" -ForegroundColor Cyan
git status --short
Write-Host ""

# Afficher les fichiers principaux
Write-Host "📁 === FICHIERS PRINCIPAUX ===" -ForegroundColor Cyan
Write-Host "✅ manifest.json - Configuration extension" -ForegroundColor Green
Write-Host "✅ content.js - Script principal (2000+ lignes)" -ForegroundColor Green
Write-Host "✅ popup.html/js - Interface popup" -ForegroundColor Green
Write-Host "✅ styles.css - Styles modernes" -ForegroundColor Green
Write-Host "✅ config-manager.html/js - Gestionnaire configuration" -ForegroundColor Green
Write-Host "✅ config/*.json - Données de configuration" -ForegroundColor Green
Write-Host "✅ README.md - Documentation complète" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Repository prêt pour GitHub !" -ForegroundColor Green
Write-Host "🔗 Suivez les étapes ci-dessus pour pousser sur GitHub" -ForegroundColor Yellow

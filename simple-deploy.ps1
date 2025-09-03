Write-Host "Deploiement Chrome RMS Extension" -ForegroundColor Green

# Verifier Git
try {
    git --version | Out-Null
    Write-Host "Git detecte" -ForegroundColor Green
} catch {
    Write-Host "Git non trouve - installez depuis https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Initialiser si necessaire
if (-not (Test-Path ".git")) {
    Write-Host "Initialisation Git..." -ForegroundColor Yellow
    git init
}

# Ajouter fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Creation du commit..." -ForegroundColor Yellow
git commit -m "feat: Version fonctionnelle complete avec synchronisation Rate Code et Plan Code"

Write-Host "Repository pret !" -ForegroundColor Green
Write-Host ""
Write-Host "Etapes suivantes:" -ForegroundColor Cyan
Write-Host "1. Creez repository sur GitHub: https://github.com/new" -ForegroundColor White
Write-Host "2. Nom: ChromeRMS2025" -ForegroundColor White  
Write-Host "3. Puis executez (remplacez USERNAME):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/USERNAME/ChromeRMS2025.git" -ForegroundColor Green
Write-Host "   git branch -M main" -ForegroundColor Green
Write-Host "   git push -u origin main" -ForegroundColor Green

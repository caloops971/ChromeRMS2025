# 🚀 Guide de Déploiement GitHub

## Version Actuelle
**Chrome RMS Helper Enhanced v2.0** - Version fonctionnelle complète

### ✨ Fonctionnalités de cette version
- ✅ **Synchronisation Rate Code/Plan Code** - Les champs se mettent à jour automatiquement
- ✅ **Support AFFA14 complet** - Nouveau Rate Code intégré
- ✅ **DOLLAR/THRIFTY optimisé** - Car Type Group automatiquement vidé
- ✅ **Interface compacte** - Sections collapsibles, scrolling optimisé
- ✅ **Gestionnaire de configuration** - Grille de tarifs, coefficients saisonniers
- ✅ **Persistance des données** - Sélections sauvées après rechargement
- ✅ **Remplissage robuste** - Tous les tarifs se remplissent correctement

---

## 📋 Méthode 1: Script Automatique (Recommandé)

### PowerShell (Windows 10/11)
```powershell
.\deploy-to-github.ps1
```

### Batch (Windows classique)
```batch
deploy-to-github.bat
```

---

## 🔧 Méthode 2: Commandes Manuelles

### 1. Installer Git (si nécessaire)
- **Télécharger:** https://git-scm.com/download/windows
- **Installer** avec les options par défaut
- **Redémarrer** PowerShell/CMD

### 2. Initialiser le repository
```bash
git init
git add .
git commit -m "feat: Version fonctionnelle complète avec synchronisation Rate Code/Plan Code"
```

### 3. Créer le repository GitHub
1. **Aller sur:** https://github.com/new
2. **Nom:** `ChromeRMS2025`
3. **Description:** `Extension Chrome pour gestion automatique des tarifs RMS Hertz/Dollar/Thrifty`
4. **🚫 NE PAS** cocher "Initialize with README" (déjà présent)

### 4. Connecter et pousser
```bash
# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/ChromeRMS2025.git
git branch -M main
git push -u origin main
```

---

## 🔑 Authentification GitHub

### Option A: Token Personnel (Recommandé)
1. **Générer token:** GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Permissions:** `repo` (Full control of private repositories)
3. **Utiliser le token** comme mot de passe lors du push

### Option B: SSH (Avancé)
1. **Générer clé SSH:** `ssh-keygen -t ed25519 -C "votre@email.com"`
2. **Ajouter à GitHub:** Settings → SSH and GPG keys
3. **Utiliser URL SSH:** `git@github.com:USERNAME/ChromeRMS2025.git`

---

## 📊 Contenu du Repository

### 🎯 Fichiers Principaux
- `manifest.json` - Configuration Chrome Extension
- `content.js` - Script principal (2000+ lignes)
- `popup.html/js` - Interface utilisateur
- `styles.css` - Styles modernes responsive
- `config-manager.html/js` - Gestionnaire de configuration

### 📁 Configuration
- `config/vehicles.json` - 25 véhicules supportés
- `config/rate_config.json` - Configuration des Rate Codes
- `config/seasons.json` - 5 saisons avec périodes
- `config/rates.json` - Grille complète des tarifs
- `config/coefficients.json` - Multiplicateurs saisonniers

### 📚 Documentation
- `README.md` - Guide utilisateur complet
- `DEPLOY.md` - Ce guide de déploiement

---

## 🎉 Après le Push

### Vérifications
1. **Repository visible** sur GitHub
2. **Tous les fichiers** présents
3. **README affiché** correctement
4. **Releases** créées si nécessaire

### Prochaines Étapes
1. **Créer une Release** avec tag `v2.0`
2. **Ajouter description** des nouvelles fonctionnalités
3. **Partager le lien** du repository
4. **Documentation** mise à jour

---

## 🆘 Résolution de Problèmes

### Erreur: "Git not found"
- **Installer Git** depuis https://git-scm.com/
- **Redémarrer** PowerShell/CMD
- **Vérifier:** `git --version`

### Erreur: "Authentication failed"
- **Utiliser token** au lieu du mot de passe
- **Vérifier URL** du repository
- **Configurer Git:** 
  ```bash
  git config --global user.name "Votre Nom"
  git config --global user.email "votre@email.com"
  ```

### Erreur: "Repository already exists"
- **Utiliser repository existant**
- **Ou changer le nom** du nouveau repository

---

## 📞 Support
- **Issues GitHub** pour les bugs
- **Wiki** pour la documentation étendue
- **Releases** pour les versions stables

# 📥 Installation Git et Déploiement GitHub

## 🎯 Version Actuelle Prête
**Chrome RMS Helper Enhanced v2.0** - Toutes les fonctionnalités implementées et testées ✅

---

## 📋 Étape 1: Installer Git

### 💻 Téléchargement
1. **Aller sur:** https://git-scm.com/download/windows
2. **Télécharger** Git pour Windows (64-bit)
3. **Exécuter** l'installateur

### ⚙️ Installation (Options Recommandées)
- ✅ **Git Bash Here** (clic droit dans dossiers)
- ✅ **Git GUI Here** 
- ✅ **Add Git to PATH** (important!)
- ✅ **Use Git from Git Bash only** ou **Use Git from command line**
- ✅ **Checkout Windows-style, commit Unix-style** (par défaut)
- ✅ **Use Windows default console window**

### 🔄 Après Installation
1. **Redémarrer** PowerShell/CMD
2. **Tester:** Ouvrir nouveau PowerShell et taper `git --version`
3. **Devrait afficher:** `git version 2.x.x.windows.x`

---

## 📋 Étape 2: Configuration Git

### Dans PowerShell (nouveau terminal):
```powershell
# Configuration utilisateur (remplacez par vos infos)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@exemple.com"

# Vérification
git config --list
```

---

## 📋 Étape 3: Initialiser Repository

### Dans le dossier ChromeRMS2025:
```powershell
# Aller dans le dossier
cd C:\Users\sebas\Documents\ChromeRMS2025

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "feat: Version fonctionnelle complète avec synchronisation Rate Code/Plan Code

✨ Fonctionnalités:
- Synchronisation automatique Rate Code ↔ Plan Code
- Support AFFA14 complet
- Gestion DOLLAR/THRIFTY optimisée
- Interface compacte avec sections collapsibles
- Gestionnaire de configuration avancé
- Persistance des sélections

🔧 Corrections:
- Champs Rate Code/Plan Code réactifs
- Car Type Group vidé pour DOLLAR/THRIFTY
- Remplissage robuste de tous les tarifs
- Date inputs avec simulation d'événements"
```

---

## 📋 Étape 4: Créer Repository GitHub

### 🌐 Sur GitHub:
1. **Aller sur:** https://github.com/new
2. **Repository name:** `ChromeRMS2025`
3. **Description:** `Extension Chrome pour gestion automatique des tarifs RMS Hertz/Dollar/Thrifty`
4. **Public** ✅ (ou Private selon préférence)
5. **🚫 NE PAS cocher:**
   - Add a README file
   - Add .gitignore  
   - Choose a license
6. **Cliquer:** Create repository

---

## 📋 Étape 5: Connecter et Pousser

### Après création du repository GitHub:
```powershell
# Connecter au repository (remplacez VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/ChromeRMS2025.git

# Renommer branche principale
git branch -M main

# Premier push (vous demandera login GitHub)
git push -u origin main
```

### 🔑 Authentification GitHub
- **Username:** Votre nom d'utilisateur GitHub
- **Password:** **PAS votre mot de passe** mais un **Personal Access Token**

### 🎫 Créer Personal Access Token:
1. **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. **Generate new token (classic)**
3. **Note:** "ChromeRMS2025 deployment"
4. **Expiration:** 90 days (ou No expiration)
5. **Scopes:** Cocher `repo` (Full control of private repositories)
6. **Generate token**
7. **COPIER le token** (ne sera plus affiché!)
8. **Utiliser ce token** comme mot de passe lors du push

---

## 📋 Méthode Alternative: GitHub Desktop

### Si vous préférez une interface graphique:

1. **Télécharger:** https://desktop.github.com/
2. **Installer** GitHub Desktop
3. **Se connecter** avec votre compte GitHub
4. **File → Add Local Repository**
5. **Choisir:** `C:\Users\sebas\Documents\ChromeRMS2025`
6. **Publish repository** → GitHub.com
7. **Nom:** ChromeRMS2025
8. **Publier**

---

## ✅ Vérification Finale

### Après push réussi:
1. **Aller sur:** https://github.com/VOTRE_USERNAME/ChromeRMS2025
2. **Vérifier présence de tous les fichiers:**
   - ✅ manifest.json
   - ✅ content.js
   - ✅ popup.html/js
   - ✅ styles.css
   - ✅ config-manager.html/js
   - ✅ config/ (dossier avec JSON)
   - ✅ README.md

### 🎉 Créer une Release:
1. **Releases → Create a new release**
2. **Tag version:** `v2.0`
3. **Release title:** `Chrome RMS Helper Enhanced v2.0`
4. **Description:** Copier les fonctionnalités depuis le commit
5. **Publish release**

---

## 🆘 Résolution Problèmes

### "Git not found"
- **Réinstaller Git** avec option "Add to PATH"
- **Redémarrer** complètement l'ordinateur
- **Ouvrir nouveau PowerShell** et tester `git --version`

### "Authentication failed"
- **Utiliser Personal Access Token** (pas le mot de passe)
- **Vérifier username** GitHub correct
- **Régénérer token** si nécessaire

### "Repository already exists"
- **Utiliser nom différent** pour le repository
- **Ou supprimer** l'ancien repository sur GitHub

---

## 📞 Une fois sur GitHub

### Partage du Code:
- **URL du repository:** https://github.com/VOTRE_USERNAME/ChromeRMS2025
- **Clone pour autres:** `git clone https://github.com/VOTRE_USERNAME/ChromeRMS2025.git`
- **Download ZIP** disponible pour non-développeurs

### Mises à jour futures:
```powershell
git add .
git commit -m "Description des changements"
git push
```

---

## 🎯 Résumé des Commandes

```powershell
# Installation et configuration (une seule fois)
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"

# Dans le dossier du projet
git init
git add .
git commit -m "Premier commit"
git remote add origin https://github.com/USERNAME/ChromeRMS2025.git
git branch -M main
git push -u origin main
```

🎉 **Votre extension sera alors disponible sur GitHub !**

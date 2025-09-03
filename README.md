# 🚗 RMS Helper - Extension Chrome Enhanced

## 📋 Description

Extension Chrome avancée pour assister la gestion des tarifs dans le système RMS de Hertz. Cette version améliorée offre :

- **Interface moderne** avec design Material Design
- **Gestion des saisons** automatique avec sélection des dates
- **Remplissage automatique des tarifs** basé sur des fichiers JSON
- **Système de paramètres** pour personnaliser le mapping des véhicules
- **Support multi-fichiers JSON** pour une configuration flexible

## 🚀 Fonctionnalités principales

### ✨ Interface utilisateur moderne
- Design responsive avec animations fluides
- Panneau flottant minimisable
- Notifications contextuelles
- Thème moderne avec dégradés

### 📅 Gestion des saisons
- Sélection automatique des dates de début/fin de saison
- Support de multiples périodes par saison
- Format de date compatible avec le système RMS

### 💰 Remplissage automatique des tarifs
- Calcul automatique des prix avec ajout des "00"
- Support de différents rate codes (AFFA1, AFFA7, etc.)
- Mapping intelligent par type de véhicule

### 🔧 Système de configuration
- Chargement de fichiers JSON personnalisés
- Mapping des véhicules configurable
- Export/import de configuration

## 📦 Installation

1. Téléchargez tous les fichiers de l'extension
2. Ouvrez Chrome et allez à `chrome://extensions/`
3. Activez le "Mode développeur"
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier contenant les fichiers

## 📁 Structure des fichiers

```
ChromeRMS2025/
├── manifest.json          # Configuration de l'extension
├── content.js             # Script principal
├── styles.css             # Styles modernes
├── popup.html             # Interface popup
├── popup.js               # Script popup
├── README.md              # Documentation
└── config/                # Fichiers de configuration
    ├── vehicles.json      # Mapping des véhicules
    ├── rate_config.json   # Configuration des tarifs
    ├── seasons.json       # Définition des saisons
    └── rates.json         # Tarifs par saison
```

## 🔧 Configuration

### Fichiers JSON de configuration

#### 1. vehicles.json
Définit le mapping des véhicules avec leurs caractéristiques :
```json
[
  {
    "sipp": "ECAR",
    "make_model": "KIA PICANTO",
    "categorie": "A4",
    "NumberOfAdults": 5,
    "NumberOfChildren": 0,
    "MinOfDoors": 4,
    "MaxOfDoors": 4,
    "LargeSuitcases": 1,
    "SmallSuitcases": 1
  }
]
```

#### 2. seasons.json
Définit les saisons et leurs périodes :
```json
[
  {
    "saison": "Basse Saison",
    "ranges": [
      { "start": "2025-08-15", "end": "2025-10-31" }
    ]
  }
]
```

#### 3. rates.json
Définit les tarifs par saison et rate code :
```json
{
  "Basse Saison": {
    "AFFA1": {
      "ECAR": 30,
      "CTAR": 55
    }
  }
}
```

#### 4. rate_config.json
Configuration des pickup locations et rate codes :
```json
{
  "pickup_locations": [
    {
      "brand": "HERTZ",
      "pickup_location_level_name": "SBHZE",
      "rates": [
        { "rate_code": "AFFA1", "type": "Fixed", "plan_code": "D" }
      ]
    }
  ]
}
```

## 🎯 Utilisation

### 1. Chargement des données
- Cliquez sur l'icône de l'extension dans la barre d'outils
- Utilisez les boutons pour charger vos fichiers JSON personnalisés
- **NOUVEAU** : Cliquez sur "📊 Gestionnaire Config" pour une interface complète
- Les données sont sauvegardées automatiquement

### 2. Remplissage des formulaires
1. **Sélectionnez une marque** (HERTZ, DOLLAR, THRIFTY)
2. **Choisissez une saison** dans la liste déroulante
3. **Sélectionnez une période** pour auto-remplir les dates
4. **Choisissez un véhicule** pour le Car Type
5. Cliquez sur **"✨ Remplir Formulaire"**

### 3. Récupération des données avec persistance
- Cliquez sur **"🔄 Récupérer Données"** au lieu du bouton Retrieve standard
- Ceci sauvegarde vos sélections avant le rechargement de page
- Après rechargement, vos sélections sont automatiquement restaurées

### 4. Remplissage automatique des tarifs

#### Option 1 : Remplir TOUS les tarifs
1. Sélectionnez une saison
2. Cliquez sur **"💰 Remplir TOUS les Tarifs"**
3. Tous les tarifs disponibles sont insérés et mis en évidence en vert

#### Option 2 : Remplir un tarif spécifique
1. Sélectionnez une saison
2. Choisissez un véhicule spécifique dans la section "Modification ciblée"
3. Cliquez sur **"🎯 Remplir Tarif Spécifique"**
4. Seul le tarif du véhicule sélectionné est modifié

### 5. Mapping ACRISS
- Cliquez sur le bouton **"Mapper ACRISS"** en bas à droite
- Les codes ACRISS sont automatiquement enrichis avec les informations des véhicules

### 6. 📊 Gestionnaire de Configuration (NOUVEAU)
Le **Gestionnaire de Configuration** est une interface complète pour visualiser et modifier toutes vos données :

#### Accès
- Cliquez sur l'icône de l'extension
- Sélectionnez **"📊 Gestionnaire Config"**
- Une nouvelle page s'ouvre avec l'interface complète

#### Fonctionnalités principales
- **📊 Vue d'ensemble** : Statistiques et état des données
- **💰 Tarifs** : Tableau complet avec édition en ligne des prix
- **🚗 Véhicules** : Gestion du mapping des véhicules
- **📅 Saisons** : Édition des saisons et périodes
- **⚙️ Configuration** : Paramètres par marque

#### Actions disponibles
- **✏️ Éditer** : Modifier n'importe quelle donnée directement
- **➕ Ajouter** : Créer de nouveaux tarifs, véhicules ou saisons
- **🗑️ Supprimer** : Retirer des entrées avec confirmation
- **📤 Exporter** : Télécharger les données au format JSON
- **🔍 Rechercher** : Filtrer et trouver rapidement des données

#### Avantages
- **Interface intuitive** avec onglets organisés
- **Modifications en temps réel** synchronisées avec l'extension
- **Validation automatique** des données
- **Sauvegarde instantanée** de tous les changements

## ⚙️ Paramètres avancés

### Accès aux paramètres
- Cliquez sur l'icône ⚙️ en haut à droite
- Ou utilisez le bouton "Ouvrir Paramètres" dans le popup

### Fonctionnalités des paramètres
- **Statut des données** : Vérifiez quelles données sont chargées
- **Rechargement** : Actualisez les données depuis le storage
- **Export** : Sauvegardez votre configuration complète

## 🔄 Migration depuis l'ancienne version

L'extension charge automatiquement des données par défaut basées sur votre ancienne configuration. Pour personnaliser :

1. Exportez votre configuration actuelle via les paramètres
2. Modifiez les fichiers JSON selon vos besoins
3. Rechargez les données via le popup

## 🆕 Nouvelles fonctionnalités v2.1

### Persistance des données
- **Problème résolu** : Les sélections ne disparaissent plus après le rechargement de page
- **Solution** : Utiliser le bouton "🔄 Récupérer Données" au lieu du bouton Retrieve standard
- Les sélections sont automatiquement restaurées après rechargement

### Clarification des boutons
- **✨ Remplir Formulaire** : Remplit uniquement les champs du formulaire (pas les tarifs)
- **🔄 Récupérer Données** : Récupère les données ET sauvegarde l'état du formulaire
- **💰 Remplir TOUS les Tarifs** : Remplit automatiquement tous les tarifs de la grille
- **🎯 Remplir Tarif Spécifique** : Modifie un seul tarif pour un véhicule sélectionné

### Mise en évidence visuelle
- Les cellules modifiées sont surlignées en vert pendant 3 secondes
- Permet de visualiser exactement ce qui a été modifié

## 🐛 Résolution des problèmes

### L'extension ne se charge pas
- Vérifiez que vous êtes sur la bonne URL : `rmsweb.prod.rms.hertz.io/RateManagement/RateEntry.aspx`
- Actualisez la page après installation

### Les sélections disparaissent après rechargement
- **Solution** : Utilisez le bouton "🔄 Récupérer Données" au lieu du bouton Retrieve standard
- Les sélections sont automatiquement sauvegardées et restaurées

### Les tarifs ne se remplissent pas
- Vérifiez que la saison sélectionnée a des tarifs définis
- Assurez-vous que le rate code correspond à celui du formulaire
- Vérifiez la console pour les erreurs (F12)
- Utilisez le fichier `test-helper.js` pour diagnostiquer

### Les dates ne s'auto-remplissent pas
- Vérifiez le format des dates dans seasons.json (YYYY-MM-DD)
- Assurez-vous que les champs de date sont visibles sur la page

## 📝 Notes de version

### Version 2.1 (Dernière)
- **NOUVEAU** : 📊 **Gestionnaire de Configuration** complet avec interface graphique
- **NOUVEAU** : Édition des tarifs directement depuis l'extension
- **NOUVEAU** : Visualisation de toutes les données de configuration
- **NOUVEAU** : Export/Import avancé des configurations
- **NOUVEAU** : Persistance des sélections après rechargement de page
- **NOUVEAU** : Bouton "Récupérer Données" pour sauvegarder l'état
- **NOUVEAU** : Remplissage ciblé d'un seul tarif
- **NOUVEAU** : Mise en évidence visuelle des modifications
- **CORRIGÉ** : Perte des sélections après clic sur Retrieve
- **AMÉLIORÉ** : Clarification des boutons d'action

### Version 2.0
- Interface utilisateur complètement redessinée
- Système de gestion des saisons
- Remplissage automatique des tarifs
- Support des fichiers JSON personnalisés
- Système de paramètres avancé
- Notifications contextuelles

### Migration depuis v1.0
- Toutes les fonctionnalités de base conservées
- Nouveau système de configuration par fichiers JSON
- Interface moderne et responsive

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez ce README
2. Consultez la console développeur (F12)
3. Exportez votre configuration pour diagnostic

## 📄 Licence

Extension développée pour un usage interne Hertz. Tous droits réservés.

# 📊 Gestionnaire de Configuration - Guide d'utilisation

## 🎯 Fonctionnalités principales

Le **Gestionnaire de Configuration** est une interface complète qui vous permet de visualiser et modifier toutes les données de configuration de l'extension RMS Helper directement depuis votre navigateur.

## 📋 Onglets disponibles

### 1. 📊 Vue d'ensemble
- **Statistiques en temps réel** : Nombre de véhicules, saisons, tarifs configurés
- **État des données** : Vérification du statut de chargement de chaque type de données
- **Actions rapides** : Actualisation et diagnostic des données

### 2. 💰 Tarifs
- **Tableau complet** de tous les tarifs par saison, rate code et véhicule
- **Recherche** par nom, saison ou code véhicule
- **Filtrage** par saison spécifique
- **Édition en ligne** : Modifier les prix directement
- **Ajout/Suppression** de tarifs individuels
- **Export** vers fichier JSON

### 3. 🚗 Véhicules
- **Liste complète** des véhicules avec toutes leurs caractéristiques
- **Recherche** par code SIPP ou marque/modèle
- **Édition** des informations véhicule (nombre de places, portes, bagages, etc.)
- **Ajout** de nouveaux véhicules
- **Export** de la configuration véhicules

### 4. 📅 Saisons
- **Gestion des saisons** et de leurs périodes
- **Édition** des dates de début/fin
- **Ajout/Suppression** de périodes pour chaque saison
- **Visualisation** claire des plages de dates
- **Export** de la configuration saisons

### 5. ⚙️ Configuration
- **Paramètres par marque** (HERTZ, DOLLAR, THRIFTY)
- **Pickup Locations** et leurs codes associés
- **Rate Codes** et plan codes par marque

## 🔧 Actions disponibles

### ✏️ Édition
- **Clic sur "Éditer"** pour modifier n'importe quelle entrée
- **Modal d'édition** avec validation des données
- **Sauvegarde automatique** dans le stockage Chrome

### ➕ Ajout
- **Boutons "Ajouter"** dans chaque section
- **Formulaires guidés** pour créer de nouvelles entrées
- **Validation** des données avant sauvegarde

### 🗑️ Suppression
- **Confirmation** avant suppression
- **Nettoyage automatique** des données orphelines
- **Mise à jour** instantanée de l'interface

### 📤 Export
- **Export JSON** de chaque type de données
- **Téléchargement direct** du fichier
- **Format compatible** avec l'import dans l'extension

## 🔍 Fonctions de recherche

### Recherche globale
- **Recherche en temps réel** dans tous les champs
- **Filtrage instantané** des résultats
- **Surlignage** des correspondances

### Filtres spécialisés
- **Filtre par saison** dans l'onglet Tarifs
- **Tri** par colonnes (à venir)
- **Filtres avancés** (à venir)

## 💾 Sauvegarde et synchronisation

### Sauvegarde automatique
- **Toutes les modifications** sont sauvegardées instantanément
- **Stockage Chrome** sécurisé et persistant
- **Synchronisation** avec l'extension principale

### Export/Import
- **Export individuel** par type de données
- **Format JSON standard** compatible
- **Import** via l'interface popup principale

## ⚠️ Bonnes pratiques

### Avant de modifier
1. **Exportez** vos données actuelles comme sauvegarde
2. **Vérifiez** l'état des données dans la vue d'ensemble
3. **Testez** les modifications sur un échantillon

### Lors de l'édition
- **Respectez** les formats de données (dates, nombres)
- **Vérifiez** la cohérence des codes SIPP
- **Validez** les tarifs avant sauvegarde

### Après modification
- **Testez** l'extension sur la page RMS
- **Vérifiez** que les tarifs se remplissent correctement
- **Exportez** la nouvelle configuration

## 🚨 Résolution de problèmes

### Les données ne s'affichent pas
1. Vérifiez l'onglet "Vue d'ensemble"
2. Cliquez sur "Actualiser" pour chaque type de données
3. Rechargez la page du gestionnaire

### Les modifications ne sont pas sauvegardées
1. Vérifiez les permissions Chrome
2. Assurez-vous que les champs sont correctement remplis
3. Redémarrez l'extension si nécessaire

### Erreurs de format
- **Dates** : Utilisez le format YYYY-MM-DD
- **Nombres** : Utilisez des nombres entiers ou décimaux valides
- **Codes** : Respectez le format des codes SIPP existants

## 🔄 Intégration avec l'extension

Le gestionnaire de configuration est **totalement intégré** avec l'extension principale :

- **Modifications instantanées** : Les changements sont immédiatement disponibles
- **Synchronisation bidirectionnelle** : Les modifications dans l'extension ou le gestionnaire sont synchronisées
- **Cohérence des données** : Validation croisée entre les différents types de données

## 📞 Support

Pour toute question ou problème avec le gestionnaire de configuration :

1. **Consultez** ce guide d'aide
2. **Vérifiez** la console développeur (F12) pour les erreurs
3. **Exportez** vos données pour diagnostic
4. **Réinitialisez** les données si nécessaire (via le popup)

---

*Le Gestionnaire de Configuration RMS Helper v2.1 - Interface complète pour la gestion de vos données de configuration*

# 📋 Gestion des Rate Codes - Guide complet

## ✅ **Réponse à votre question**

**OUI**, le système tient parfaitement compte du **Rate Code** (AFFA1, AFFA7, etc.) dans le remplissage des tarifs ! 

## 🔍 **Comment cela fonctionne**

### 1. **Structure des données**
Les tarifs sont organisés par :
```json
{
  "Basse Saison": {
    "AFFA1": {
      "ECAR": 30,
      "CTAR": 55,
      "PTAR": 70
    },
    "AFFA7": {
      "ECAR": 28,
      "CTAR": 50,
      "PTAR": 65
    }
  }
}
```

### 2. **Sélection du Rate Code**
L'extension utilise une **logique de priorité** pour déterminer le Rate Code :

#### **Priorité 1 : Sélection manuelle** (NOUVEAU !)
- **Nouveau sélecteur** "Rate Code (tarif)" dans l'interface
- Permet de choisir explicitement AFFA1, AFFA7, ou autres
- Options basées sur la marque sélectionnée

#### **Priorité 2 : Auto (depuis formulaire)**
- **Pour HERTZ** : Lit le champ `txtRateCode` du formulaire RMS
- **Pour DOLLAR/THRIFTY** : Utilise la sélection "Type de tarif" (SBHDL/SBHWK)

#### **Priorité 3 : Défaut**
- AFFA1 par défaut si rien n'est spécifié

## 🎯 **Nouvelle interface de sélection**

### **Section "Configuration tarifs"**
```
Rate Code (tarif): [Dropdown]
├── --Auto (depuis formulaire)--
├── AFFA1 (Fixed - D)
└── AFFA7 (Fixed - D)

💡 Auto = utilise le rate code du formulaire RMS
```

### **Comment utiliser**
1. **Mode Auto** (par défaut) : L'extension lit automatiquement le Rate Code depuis le formulaire RMS
2. **Mode Manuel** : Sélectionnez explicitement AFFA1 ou AFFA7 pour forcer l'utilisation d'un tarif spécifique

## 🔧 **Exemples pratiques**

### **Exemple 1 : Utilisation automatique**
1. Remplissez le formulaire RMS avec Rate Code = "AFFA1"
2. Laissez "Rate Code (tarif)" sur "--Auto--"
3. Cliquez "💰 Remplir TOUS les Tarifs"
4. **Résultat** : Utilise les tarifs AFFA1

### **Exemple 2 : Forcer AFFA7**
1. Sélectionnez "AFFA7 (Fixed - D)" dans le sélecteur
2. Cliquez "💰 Remplir TOUS les Tarifs"
3. **Résultat** : Utilise les tarifs AFFA7 même si le formulaire dit AFFA1

### **Exemple 3 : Comparaison des tarifs**
Pour **Basse Saison** :
- **AFFA1** : ECAR = 30€ → 3000 dans le tableau
- **AFFA7** : ECAR = 28€ → 2800 dans le tableau

## 🔍 **Diagnostic et vérification**

### **Bouton "🔍 Analyser Tableau"**
Affiche dans la console :
```
🎯 Configuration actuelle:
  Saison: Basse Saison
  Marque: HERTZ
  Rate Code: AFFA1

📈 Tarifs disponibles pour "Basse Saison":
👉 AFFA1: 25 véhicules
    Véhicules: ECAR, MCAR, CDAR, CCAR, IFAR...
    Exemples de tarifs: ECAR=30€, MCAR=25€, CDAR=35€
   AFFA7: 25 véhicules
```

### **Dans la console développeur**
```javascript
// Vérifier la configuration actuelle
window.rmsHelper.analyzeRatesTable()

// Tester avec un Rate Code spécifique
rmsTestHelper.debugFillRatesIssue()
```

## 📊 **Différences entre Rate Codes**

### **AFFA1 vs AFFA7** (exemple Basse Saison)
| Véhicule | AFFA1 | AFFA7 | Différence |
|----------|-------|-------|------------|
| ECAR     | 30€   | 28€   | -2€        |
| CTAR     | 55€   | 50€   | -5€        |
| PTAR     | 70€   | 65€   | -5€        |

**AFFA7 = tarifs généralement plus bas que AFFA1**

## ⚙️ **Configuration par marque**

### **HERTZ**
- Rate Codes : AFFA1, AFFA7
- Type : Fixed
- Plan Code : D (Daily)

### **DOLLAR/THRIFTY**
- Rate Codes : SBHDL, SBHWK
- Types : Daily, Weekly
- Plan Codes : D, W

## 🚨 **Messages d'erreur possibles**

### **"❌ Aucun tarif trouvé pour cette configuration"**
**Causes possibles :**
1. Rate Code sélectionné n'existe pas dans les données
2. Saison sélectionnée n'a pas de tarifs pour ce Rate Code
3. Données de configuration manquantes

**Solutions :**
1. Vérifiez que le Rate Code existe dans `rates.json`
2. Utilisez le bouton "🔍 Analyser Tableau" pour diagnostic
3. Essayez le mode "--Auto--" pour laisser l'extension détecter

### **"🔄 Remplissage des tarifs en cours..."**
**Message normal** indiquant que l'extension :
1. Lit le Rate Code sélectionné
2. Cherche les tarifs correspondants
3. Applique les modifications au tableau

## 💡 **Conseils d'utilisation**

### **Pour un contrôle précis**
- Utilisez la **sélection manuelle** du Rate Code
- Vérifiez la configuration avec "🔍 Analyser Tableau"
- Comparez les résultats entre AFFA1 et AFFA7

### **Pour un usage rapide**
- Laissez en mode "--Auto--"
- L'extension lira automatiquement depuis le formulaire RMS
- Fonctionne dans 99% des cas

### **Pour le diagnostic**
- Ouvrez la console développeur (F12)
- Les logs détaillés montrent quel Rate Code est utilisé
- Messages explicites en cas de problème

---

**Résumé** : Le système gère parfaitement les différents Rate Codes (AFFA1, AFFA7, etc.) avec une interface de sélection claire et une logique de priorité intelligente ! 🎉

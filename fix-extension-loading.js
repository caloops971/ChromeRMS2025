// Script de diagnostic et correction pour le chargement de l'extension
// À coller dans la console développeur de la page RMS

console.log('🔧 === DIAGNOSTIC CHARGEMENT EXTENSION ===');

// 1. Vérifier la présence de l'extension
function checkExtensionStatus() {
    console.log('🔍 Vérification de l\'état de l\'extension...');
    
    // Vérifier RMSHelper
    const hasRMSHelper = typeof window.rmsHelper !== 'undefined';
    console.log('- window.rmsHelper:', hasRMSHelper ? '✅ Présent' : '❌ Absent');
    
    // Vérifier les éléments DOM de l'extension
    const panel = document.getElementById('rms-helper-panel');
    const mappingBtn = document.getElementById('rms-mapping-btn');
    const settingsBtn = document.getElementById('rms-settings-btn');
    
    console.log('- Panneau principal:', panel ? '✅ Présent' : '❌ Absent');
    console.log('- Bouton mapping:', mappingBtn ? '✅ Présent' : '❌ Absent');
    console.log('- Bouton paramètres:', settingsBtn ? '✅ Présent' : '❌ Absent');
    
    return {
        hasRMSHelper,
        hasPanel: !!panel,
        hasMapping: !!mappingBtn,
        hasSettings: !!settingsBtn
    };
}

// 2. Forcer le rechargement de l'extension
function forceReloadExtension() {
    console.log('🔄 Tentative de rechargement de l\'extension...');
    
    // Supprimer les éléments existants
    const elementsToRemove = [
        'rms-helper-panel',
        'rms-mapping-btn', 
        'rms-settings-btn'
    ];
    
    elementsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
            console.log(`🗑️ ${id} supprimé`);
        }
    });
    
    // Réinitialiser window.rmsHelper
    if (window.rmsHelper) {
        delete window.rmsHelper;
        console.log('🗑️ window.rmsHelper supprimé');
    }
    
    // Forcer la réinitialisation
    setTimeout(() => {
        console.log('🚀 Tentative de réinitialisation...');
        
        // Vérifier si la classe RMSHelper est disponible
        if (typeof RMSHelper !== 'undefined') {
            try {
                window.rmsHelper = new RMSHelper();
                console.log('✅ Extension réinitialisée avec succès');
            } catch (error) {
                console.error('❌ Erreur réinitialisation:', error);
            }
        } else {
            console.log('❌ Classe RMSHelper non disponible');
            console.log('💡 L\'extension doit être rechargée dans chrome://extensions/');
        }
    }, 500);
}

// 3. Vérifier les données Chrome Storage
function checkChromeStorage() {
    console.log('💾 Vérification du Chrome Storage...');
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([
            'rms_vehicles', 
            'rms_seasons', 
            'rms_rates', 
            'rms_rate_config',
            'rms_coefficients'
        ], (result) => {
            console.log('📦 Données en storage:');
            console.log('- Véhicules:', result.rms_vehicles ? result.rms_vehicles.length : 'Aucun');
            console.log('- Saisons:', result.rms_seasons ? result.rms_seasons.length : 'Aucune');
            console.log('- Tarifs:', result.rms_rates ? Object.keys(result.rms_rates).length + ' saisons' : 'Aucun');
            console.log('- Config:', result.rms_rate_config ? 'Présente' : 'Absente');
            console.log('- Coefficients:', result.rms_coefficients ? 'Présents' : 'Absents');
            
            // Vérifier spécifiquement AFFA14
            if (result.rms_rate_config && result.rms_rate_config.pickup_locations) {
                const hertzConfig = result.rms_rate_config.pickup_locations.find(loc => loc.brand === 'HERTZ');
                if (hertzConfig) {
                    const rateCodes = hertzConfig.rates.map(r => r.rate_code);
                    console.log('📋 Rate codes HERTZ en storage:', rateCodes);
                    console.log('- AFFA14 présent:', rateCodes.includes('AFFA14') ? '✅ OUI' : '❌ NON');
                }
            }
        });
    } else {
        console.log('❌ API Chrome Storage non disponible');
    }
}

// 4. Forcer le rechargement des données depuis les fichiers
async function forceLoadFromFiles() {
    console.log('📥 Chargement forcé depuis les fichiers...');
    
    try {
        // Charger rate_config.json directement
        const response = await fetch(chrome.runtime.getURL('config/rate_config.json'));
        if (response.ok) {
            const rateConfig = await response.json();
            console.log('📋 Rate config chargé depuis fichier:');
            
            const hertzConfig = rateConfig.pickup_locations.find(loc => loc.brand === 'HERTZ');
            if (hertzConfig) {
                const rateCodes = hertzConfig.rates.map(r => r.rate_code);
                console.log('- Rate codes HERTZ:', rateCodes);
                console.log('- AFFA14 dans fichier:', rateCodes.includes('AFFA14') ? '✅ OUI' : '❌ NON');
            }
            
            // Sauvegarder dans Chrome Storage
            chrome.storage.local.set({ 'rms_rate_config': rateConfig }, () => {
                console.log('✅ Rate config sauvegardé en storage');
                
                // Recharger l'extension si elle existe
                if (window.rmsHelper && window.rmsHelper.reloadDataFromStorage) {
                    window.rmsHelper.reloadDataFromStorage().then(() => {
                        console.log('🔄 Extension rechargée avec nouvelles données');
                    });
                }
            });
            
        } else {
            console.log('❌ Impossible de charger rate_config.json');
        }
    } catch (error) {
        console.error('❌ Erreur chargement fichier:', error);
    }
}

// 5. Fonction de correction complète
async function fixAFFA14Issue() {
    console.log('🛠️ === CORRECTION COMPLÈTE AFFA14 ===');
    
    // Étape 1: Diagnostic
    const status = checkExtensionStatus();
    
    // Étape 2: Vérifier storage
    checkChromeStorage();
    
    // Étape 3: Charger depuis fichiers
    await forceLoadFromFiles();
    
    // Étape 4: Recharger extension si nécessaire
    if (!status.hasRMSHelper) {
        console.log('🔄 Extension non chargée, tentative de rechargement...');
        forceReloadExtension();
    }
    
    console.log('🛠️ === FIN CORRECTION ===');
    console.log('💡 Si le problème persiste:');
    console.log('   1. Rechargez l\'extension dans chrome://extensions/');
    console.log('   2. Rechargez cette page (F5)');
    console.log('   3. Vérifiez que vous êtes sur la bonne URL RMS');
}

// Exporter les fonctions
window.extensionFix = {
    checkExtensionStatus,
    forceReloadExtension,
    checkChromeStorage,
    forceLoadFromFiles,
    fixAFFA14Issue
};

console.log('🛠️ Fonctions de correction disponibles:');
console.log('- extensionFix.fixAFFA14Issue() : Correction complète');
console.log('- extensionFix.checkExtensionStatus() : Vérifier état');
console.log('- extensionFix.forceLoadFromFiles() : Charger depuis fichiers');

// Lancer le diagnostic automatique
checkExtensionStatus();
checkChromeStorage();

// Popup script pour l'extension RMS Helper

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const loadVehiclesBtn = document.getElementById('loadVehicles');
    const loadSeasonsBtn = document.getElementById('loadSeasons');
    const loadRatesBtn = document.getElementById('loadRates');
    const loadRateConfigBtn = document.getElementById('loadRateConfig');
    const loadCoefficientsBtn = document.getElementById('loadCoefficients');
    const openSettingsBtn = document.getElementById('openSettings');
    const resetDataBtn = document.getElementById('resetData');
    const statusDiv = document.getElementById('status');
    
    const vehiclesFile = document.getElementById('vehiclesFile');
    const seasonsFile = document.getElementById('seasonsFile');
    const ratesFile = document.getElementById('ratesFile');
    const rateConfigFile = document.getElementById('rateConfigFile');
    const coefficientsFile = document.getElementById('coefficientsFile');

    // Fonction pour afficher le statut
    function showStatus(message, type = 'success') {
        statusDiv.textContent = message;
        statusDiv.className = `status status-${type}`;
        statusDiv.style.display = 'block';
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Fonction pour lire un fichier JSON
    function readJsonFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Fichier JSON invalide'));
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    }

    // Gestionnaires d'événements pour les boutons de chargement
    loadVehiclesBtn.addEventListener('click', () => {
        vehiclesFile.click();
    });

    loadSeasonsBtn.addEventListener('click', () => {
        seasonsFile.click();
    });

    loadRatesBtn.addEventListener('click', () => {
        ratesFile.click();
    });

    loadRateConfigBtn.addEventListener('click', () => {
        rateConfigFile.click();
    });

    loadCoefficientsBtn.addEventListener('click', () => {
        coefficientsFile.click();
    });

    // Gestionnaires pour les fichiers
    vehiclesFile.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await readJsonFile(file);
            await chrome.storage.local.set({ 'rms_vehicles': data });
            showStatus('Mapping véhicules chargé avec succès!', 'success');
        } catch (error) {
            showStatus('Erreur: ' + error.message, 'error');
        }
    });

    seasonsFile.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await readJsonFile(file);
            await chrome.storage.local.set({ 'rms_seasons': data });
            showStatus('Configuration saisons chargée avec succès!', 'success');
        } catch (error) {
            showStatus('Erreur: ' + error.message, 'error');
        }
    });

    ratesFile.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await readJsonFile(file);
            await chrome.storage.local.set({ 'rms_rates': data });
            showStatus('Tarifs chargés avec succès!', 'success');
        } catch (error) {
            showStatus('Erreur: ' + error.message, 'error');
        }
    });

    rateConfigFile.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await readJsonFile(file);
            await chrome.storage.local.set({ 'rms_rate_config': data });
            showStatus('Configuration tarifs chargée avec succès!', 'success');
        } catch (error) {
            showStatus('Erreur: ' + error.message, 'error');
        }
    });

    coefficientsFile.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await readJsonFile(file);
            await chrome.storage.local.set({ 'rms_coefficients': data });
            showStatus('Coefficients saisonniers chargés avec succès!', 'success');
        } catch (error) {
            showStatus('Erreur: ' + error.message, 'error');
        }
    });

    // Ouvrir les paramètres
    openSettingsBtn.addEventListener('click', async function() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function() {
                const event = new CustomEvent('openRMSSettings');
                window.dispatchEvent(event);
            }
        });
        
        window.close();
    });

    // Ouvrir le gestionnaire de configuration
    document.getElementById('openConfigManager').addEventListener('click', () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL('config-manager.html')
        });
        window.close();
    });

    // Réinitialiser les données
    resetDataBtn.addEventListener('click', async function() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données?')) {
            await chrome.storage.local.clear();
            showStatus('Données réinitialisées!', 'success');
        }
    });

    // Vérifier les données existantes au chargement
    chrome.storage.local.get(['rms_vehicles', 'rms_seasons', 'rms_rates', 'rms_rate_config', 'rms_coefficients'], function(result) {
        const buttons = [
            { btn: loadVehiclesBtn, key: 'rms_vehicles', label: '✅ Mapping Véhicules' },
            { btn: loadSeasonsBtn, key: 'rms_seasons', label: '✅ Saisons' },
            { btn: loadRatesBtn, key: 'rms_rates', label: '✅ Tarifs' },
            { btn: loadRateConfigBtn, key: 'rms_rate_config', label: '✅ Config Tarifs' },
            { btn: loadCoefficientsBtn, key: 'rms_coefficients', label: '✅ Coefficients' }
        ];

        buttons.forEach(({ btn, key, label }) => {
            if (result[key]) {
                btn.textContent = label;
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                btn.style.color = 'white';
            }
        });
    });
});

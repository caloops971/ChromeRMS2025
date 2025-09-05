// Extension Chrome RMS Helper - Version Améliorée
// Script principal avec fonctionnalités avancées

class RMSHelper {
    constructor() {
        this.data = {
            vehicles: null,
            seasons: null,
            rates: null,
            rateConfig: null
        };
        this.ui = null;
        this.sessionId = Date.now(); // Identifiant unique pour cette session
        this.logBuffer = []; // Buffer pour stocker les logs
        this.isReloading = false;
        
        this.log('🚀 DÉMARRAGE', 'Initialisation de RMSHelper', { sessionId: this.sessionId });
        this.detectExtensionReload();
        this.init();
    }

    async init() {
        await this.loadStoredData();
        this.createUI();
        this.bindEvents();
        this.loadDefaultData();
    }

    // Système de logging complet avec timestamps et session tracking
    log(type, message, data = {}) {
        const timestamp = new Date().toISOString();
        const sessionInfo = `[Session-${this.sessionId}]`;
        const logEntry = {
            timestamp,
            sessionId: this.sessionId,
            type,
            message,
            data,
            url: window.location.href,
            readyState: document.readyState
        };
        
        this.logBuffer.push(logEntry);
        
        // Affichage console avec couleurs
        const colors = {
            '🚀': 'color: #10b981; font-weight: bold',
            '📊': 'color: #3b82f6; font-weight: bold',
            '⚠️': 'color: #f59e0b; font-weight: bold',
            '❌': 'color: #ef4444; font-weight: bold',
            '✅': 'color: #22c55e; font-weight: bold',
            '🔍': 'color: #8b5cf6; font-weight: bold',
            '💾': 'color: #06b6d4; font-weight: bold',
            '🔄': 'color: #f97316; font-weight: bold'
        };
        
        const color = colors[type.charAt(0)] || 'color: #6b7280';
        console.log(`%c${sessionInfo} ${type} ${message}`, color, data);
        
        // Stocker dans localStorage pour persistance
        try {
            const existingLogs = JSON.parse(localStorage.getItem('rms_debug_logs') || '[]');
            existingLogs.push(logEntry);
            // Garder seulement les 1000 derniers logs
            if (existingLogs.length > 1000) {
                existingLogs.splice(0, existingLogs.length - 1000);
            }
            localStorage.setItem('rms_debug_logs', JSON.stringify(existingLogs));
        } catch (e) {
            console.warn('Erreur sauvegarde logs:', e);
        }
    }

    // Fonction pour exporter tous les logs
    exportLogs() {
        const logs = JSON.parse(localStorage.getItem('rms_debug_logs') || '[]');
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rms-debug-logs-${new Date().toISOString().slice(0, 19)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.log('💾 EXPORT', 'Logs exportés', { count: logs.length });
    }

    // Fonction pour forcer manuellement la validation de tous les champs
    async forceManualValidation() {
        this.log('🔄 MANUAL_VALIDATION', 'Début de la validation manuelle forcée', {
            sessionId: this.sessionId
        });

        // Désactiver temporairement le bouton pour éviter les clics multiples
        const button = document.getElementById('force-validation');
        if (button) {
            button.disabled = true;
            button.textContent = '🔄 Validation en cours...';
            button.style.opacity = '0.6';
        }

        try {
            // Chercher toutes les cellules de tarifs dans la grille
            const gridContainer = document.querySelector('#uwgDisplayGrid_main');
            if (!gridContainer) {
                this.showNotification('❌ Grille de tarifs non trouvée', 'error');
                return;
            }

            // Trouver toutes les cellules qui contiennent des tarifs (avec attribut uv)
            const rateCells = gridContainer.querySelectorAll('td[uv]');
            let validatedCount = 0;

            this.log('🔍 CELLS_FOUND', 'Cellules avec tarifs trouvées', {
                count: rateCells.length,
                sessionId: this.sessionId
            });

            // Parcourir chaque cellule et forcer la validation
            for (let i = 0; i < rateCells.length; i++) {
                const cell = rateCells[i];
                const uvValue = cell.getAttribute('uv');
                
                if (uvValue && uvValue !== '0' && uvValue !== '') {
                    try {
                        this.log('🔄 VALIDATING', 'Validation forcée de la cellule', {
                            cellId: cell.id || 'no-id',
                            uvValue: uvValue,
                            index: i + 1,
                            total: rateCells.length,
                            sessionId: this.sessionId
                        });

                        // Méthode 1: Événements Infragistics complets
                        this.triggerInfragisticsValidation(cell, `cell-${i}`);

                        // Méthode 2: Simulation d'interaction utilisateur
                        await this.simulateUserInteraction(cell);

                        // Méthode 3: Forcer un changement temporaire
                        await this.forceTemporaryChange(cell, uvValue);

                        validatedCount++;

                        // Délai entre chaque validation pour éviter les conflits
                        if (i < rateCells.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }

                    } catch (error) {
                        this.log('❌ VALIDATION_ERROR', 'Erreur lors de la validation', {
                            cellId: cell.id || 'no-id',
                            error: error.message,
                            sessionId: this.sessionId
                        });
                    }
                }
            }

            // Validation finale globale
            await this.performFinalValidation();

            this.log('✅ MANUAL_VALIDATION_COMPLETE', 'Validation manuelle terminée', {
                validatedCount,
                totalCells: rateCells.length,
                sessionId: this.sessionId
            });

            this.showNotification(`✅ ${validatedCount} cellules validées manuellement!`, 'success');

        } catch (error) {
            this.log('❌ MANUAL_VALIDATION_ERROR', 'Erreur lors de la validation manuelle', {
                error: error.message,
                sessionId: this.sessionId
            });
            this.showNotification('❌ Erreur lors de la validation manuelle', 'error');
        } finally {
            // Réactiver le bouton
            if (button) {
                button.disabled = false;
                button.textContent = '🔄 Forcer Validation';
                button.style.opacity = '1';
            }
        }
    }

    // Simulation d'interaction utilisateur sur une cellule
    async simulateUserInteraction(cell) {
        // Focus sur la cellule
        cell.focus();
        
        // Simulation de clic
        cell.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));

        // Délai court
        await new Promise(resolve => setTimeout(resolve, 50));

        // Simulation de sortie de focus
        cell.blur();
    }

    // Forcer un changement temporaire pour déclencher la validation
    async forceTemporaryChange(cell, originalValue) {
        try {
            // Sauvegarder les valeurs actuelles
            const textElement = cell.querySelector('nobr') || cell.querySelector('span');
            const originalText = textElement ? textElement.textContent : '';

            // Changement temporaire vers une valeur différente
            const tempValue = originalValue === '0' ? '1' : '0';
            
            // Étape 1: Changement temporaire
            cell.setAttribute('uv', tempValue);
            if (textElement) {
                textElement.textContent = tempValue;
            }
            
            // Déclencher événements pour le changement temporaire
            this.triggerInfragisticsValidation(cell, 'temp');
            
            // Délai court
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Étape 2: Restaurer la vraie valeur
            cell.setAttribute('uv', originalValue);
            if (textElement) {
                textElement.textContent = originalText;
            }
            
            // Déclencher événements pour la vraie valeur
            this.triggerInfragisticsValidation(cell, 'final');
            
        } catch (error) {
            console.warn('Erreur lors du changement temporaire:', error);
        }
    }

    // Validation finale globale de la grille
    async performFinalValidation() {
        try {
            // Clic sur le header pour déclencher la validation globale
            const gridHeader = document.querySelector('#uwgDisplayGrid_hdiv');
            if (gridHeader) {
                gridHeader.click();
            }

            // Événements globaux sur la grille
            const gridMain = document.querySelector('#uwgDisplayGrid_main');
            if (gridMain) {
                gridMain.dispatchEvent(new Event('gridupdate', { bubbles: true }));
                gridMain.dispatchEvent(new Event('datachanged', { bubbles: true }));
            }

            // Événements sur le formulaire parent si il existe
            const form = document.querySelector('form');
            if (form) {
                form.dispatchEvent(new Event('change', { bubbles: true }));
                form.dispatchEvent(new Event('input', { bubbles: true }));
            }

            this.log('🔄 FINAL_VALIDATION', 'Validation finale globale effectuée', {
                sessionId: this.sessionId
            });

        } catch (error) {
            console.warn('Erreur lors de la validation finale:', error);
        }
    }

    // Fonction pour vider tous les logs avec confirmation
    clearAllLogs() {
        try {
            // Compter les logs actuels
            const currentLogs = JSON.parse(localStorage.getItem('rms_debug_logs') || '[]');
            const logCount = currentLogs.length;

            if (logCount === 0) {
                this.showNotification('ℹ️ Aucun log à supprimer', 'info');
                return;
            }

            // Demander confirmation
            const confirmed = confirm(
                `🗑️ Vider tous les logs ?\n\n` +
                `Cette action va supprimer définitivement :\n` +
                `• ${logCount} entrées de logs\n` +
                `• Toutes les données de debugging\n` +
                `• L'historique des sessions\n\n` +
                `Cette action est irréversible.\n\n` +
                `Voulez-vous continuer ?`
            );

            if (!confirmed) {
                this.log('❌ CLEAR_CANCELLED', 'Suppression des logs annulée par l\'utilisateur', {
                    sessionId: this.sessionId,
                    logCount: logCount
                });
                return;
            }

            // Sauvegarder les informations avant suppression
            const beforeClear = {
                sessionId: this.sessionId,
                logCount: logCount,
                timestamp: new Date().toISOString(),
                lastLogTimestamp: currentLogs.length > 0 ? currentLogs[currentLogs.length - 1].timestamp : null
            };

            // Vider les logs du localStorage
            localStorage.removeItem('rms_debug_logs');
            
            // Vider le buffer de logs en mémoire
            this.logBuffer = [];

            // Ajouter un log de confirmation de suppression (nouveau début)
            this.log('🗑️ LOGS_CLEARED', 'Tous les logs ont été supprimés', {
                previousSessionId: beforeClear.sessionId,
                clearedLogCount: beforeClear.logCount,
                clearedAt: beforeClear.timestamp,
                newSessionId: this.sessionId
            });

            // Notification de succès
            this.showNotification(`🗑️ ${logCount} logs supprimés avec succès!`, 'success');

            // Log dans la console pour confirmation
            console.log(`%c🗑️ LOGS VIDÉS`, 'color: #ef4444; font-weight: bold', {
                logsSupprimés: logCount,
                sessionPrécédente: beforeClear.sessionId,
                nouvelleSession: this.sessionId
            });

        } catch (error) {
            this.log('❌ CLEAR_ERROR', 'Erreur lors de la suppression des logs', {
                error: error.message,
                sessionId: this.sessionId
            });
            
            this.showNotification('❌ Erreur lors de la suppression des logs', 'error');
            console.error('Erreur lors du vidage des logs:', error);
        }
    }

    // Détecter les rechargements d'extension
    detectExtensionReload() {
        // Vérifier si c'est un rechargement
        const lastSessionId = sessionStorage.getItem('rms_last_session');
        if (lastSessionId && lastSessionId !== this.sessionId.toString()) {
            this.log('🔄 RELOAD', 'Rechargement d\'extension détecté', { 
                lastSession: lastSessionId, 
                currentSession: this.sessionId 
            });
            this.isReloading = true;
        }
        sessionStorage.setItem('rms_last_session', this.sessionId.toString());
        
        // Écouter les événements de rechargement
        window.addEventListener('beforeunload', () => {
            this.log('🔄 UNLOAD', 'Page en cours de déchargement', { 
                sessionId: this.sessionId,
                timestamp: Date.now()
            });
        });
        
        // Écouter les changements de visibilité
        document.addEventListener('visibilitychange', () => {
            this.log('🔄 VISIBILITY', 'Changement de visibilité', { 
                hidden: document.hidden,
                visibilityState: document.visibilityState
            });
        });
    }

    // Chargement des données depuis le storage
    async loadStoredData() {
        this.log('💾 LOAD', 'Début chargement des données depuis le storage');
        return new Promise((resolve) => {
            chrome.storage.local.get(['rms_vehicles', 'rms_seasons', 'rms_rates', 'rms_rate_config'], (result) => {
                this.data.vehicles = result.rms_vehicles || this.getDefaultVehicles();
                this.data.seasons = result.rms_seasons || this.getDefaultSeasons();
                this.data.rates = result.rms_rates || this.getDefaultRates();
                this.data.rateConfig = result.rms_rate_config || this.getDefaultRateConfig();
                
                this.log('💾 LOAD', 'Données chargées depuis le storage', {
                    vehicles: this.data.vehicles ? Object.keys(this.data.vehicles).length : 0,
                    seasons: this.data.seasons ? Object.keys(this.data.seasons).length : 0,
                    rates: this.data.rates ? Object.keys(this.data.rates).length : 0,
                    rateConfig: this.data.rateConfig ? Object.keys(this.data.rateConfig).length : 0,
                    hasVehicles: !!this.data.vehicles,
                    hasSeasons: !!this.data.seasons,
                    hasRates: !!this.data.rates,
                    hasRateConfig: !!this.data.rateConfig,
                    fromStorage: {
                        vehicles: !!result.rms_vehicles,
                        seasons: !!result.rms_seasons,
                        rates: !!result.rms_rates,
                        rateConfig: !!result.rms_rate_config
                    }
                });
                
                resolve();
            });
        });
    }

    // Données par défaut basées sur votre ancien code
    getDefaultVehicles() {
        return [
            {"sipp":"ECAR","make_model":"KIA PICANTO","categorie":"A4","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":4,"LargeSuitcases":1,"SmallSuitcases":1},
            {"sipp":"MCAR","make_model":"SUZUKI CELERIO","categorie":"A5","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":4,"LargeSuitcases":1,"SmallSuitcases":1},
            {"sipp":"CDAR","make_model":"KIA RIO","categorie":"B4","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":4,"LargeSuitcases":1,"SmallSuitcases":2},
            {"sipp":"CCAR","make_model":"FORD FOCUS","categorie":"B5","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":5,"LargeSuitcases":2,"SmallSuitcases":1},
            {"sipp":"IFAR","make_model":"SUZUKI JIMNY 3P","categorie":"C","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":3,"MaxOfDoors":3,"LargeSuitcases":1,"SmallSuitcases":1},
            {"sipp":"SFAR","make_model":"SUZUKI JIMNY 5P","categorie":"D","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":5,"MaxOfDoors":5,"LargeSuitcases":1,"SmallSuitcases":1},
            {"sipp":"CFAR","make_model":"RENAULT DUSTER","categorie":"D5","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":5,"LargeSuitcases":2,"SmallSuitcases":1},
            {"sipp":"IJAR","make_model":"JEEP WRANGLER 3P","categorie":"E","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":3,"MaxOfDoors":3,"LargeSuitcases":2,"SmallSuitcases":0},
            {"sipp":"CTAR","make_model":"MINI COOPER","categorie":"F","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":3,"MaxOfDoors":3,"LargeSuitcases":1,"SmallSuitcases":1},
            {"sipp":"NTAR","make_model":"MINI COOPER SPORT","categorie":"F5","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":3,"MaxOfDoors":3,"LargeSuitcases":1,"SmallSuitcases":1},
            {"sipp":"FDAR","make_model":"KIA SELTOS","categorie":"H","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":5,"LargeSuitcases":2,"SmallSuitcases":2},
            {"sipp":"FVAR","make_model":"MITSUBISHI PAJERO SPORT","categorie":"I4","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":5,"LargeSuitcases":3,"SmallSuitcases":2},
            {"sipp":"PJAR","make_model":"JEEP WRANGLER 5P","categorie":"J","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":5,"MaxOfDoors":5,"LargeSuitcases":2,"SmallSuitcases":1},
            {"sipp":"ILAR","make_model":"MINI COUNTRYMAN","categorie":"K","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":4,"LargeSuitcases":2,"SmallSuitcases":1},
            {"sipp":"PVAR","make_model":"CHRYSLER PACIFICA","categorie":"M","NumberOfAdults":8,"NumberOfChildren":2,"MinOfDoors":5,"MaxOfDoors":5,"LargeSuitcases":4,"SmallSuitcases":2},
            {"sipp":"ITAR","make_model":"VOLKSWAGEN T-ROC CABRIO","categorie":"N0","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":2,"MaxOfDoors":2,"LargeSuitcases":1,"SmallSuitcases":2},
            {"sipp":"STAR","make_model":"BMW SERIE 2 CABRIO","categorie":"N1","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":2,"MaxOfDoors":2,"LargeSuitcases":1,"SmallSuitcases":2},
            {"sipp":"WFAR","make_model":"JETOUR Traveler","categorie":"O","NumberOfAdults":5,"NumberOfChildren":2,"MinOfDoors":5,"MaxOfDoors":5,"LargeSuitcases":3,"SmallSuitcases":2},
            {"sipp":"FFAR","make_model":"TANK 300","categorie":"O5","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":4,"LargeSuitcases":2,"SmallSuitcases":1},
            {"sipp":"WTAR","make_model":"FORD BRONCO","categorie":"P","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":4,"LargeSuitcases":2,"SmallSuitcases":1},
            {"sipp":"IFAE","make_model":"WULING Yep 3P","categorie":"W","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":3,"MaxOfDoors":3,"LargeSuitcases":1,"SmallSuitcases":1},
            {"sipp":"XXAR","make_model":"TESLA MODEL S","categorie":"W1","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":5,"MaxOfDoors":5,"LargeSuitcases":2,"SmallSuitcases":2},
            {"sipp":"SFAE","make_model":"WULING Yep+ 5P","categorie":"Y","NumberOfAdults":4,"NumberOfChildren":0,"MinOfDoors":5,"MaxOfDoors":5,"LargeSuitcases":2,"SmallSuitcases":1},
            {"sipp":"PFAR","make_model":"AUDI Q3 SPORTBACK","categorie":"Z","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":5,"LargeSuitcases":2,"SmallSuitcases":2},
            {"sipp":"XFAR","make_model":"JEEP COMPASS","categorie":"Z5","NumberOfAdults":5,"NumberOfChildren":0,"MinOfDoors":4,"MaxOfDoors":5,"LargeSuitcases":2,"SmallSuitcases":1}
        ];
    }

    getDefaultSeasons() {
        return [
            {
                "saison": "Basse Saison",
                "ranges": [
                    { "start": "2025-08-15", "end": "2025-10-31" },
                    { "start": "2026-05-01", "end": "2026-07-02" }
                ]
            },
            {
                "saison": "Haute Saison",
                "ranges": [
                    { "start": "2025-11-01", "end": "2025-11-21" },
                    { "start": "2025-11-30", "end": "2025-12-17" },
                    { "start": "2026-01-02", "end": "2026-02-13" },
                    { "start": "2026-02-22", "end": "2026-03-06" },
                    { "start": "2026-03-16", "end": "2026-03-31" }
                ]
            },
            {
                "saison": "Très Haute Saison",
                "ranges": [
                    { "start": "2025-11-22", "end": "2025-11-29" },
                    { "start": "2026-02-14", "end": "2026-02-21" },
                    { "start": "2026-03-07", "end": "2026-03-15" }
                ]
            },
            {
                "saison": "Festive",
                "ranges": [
                    { "start": "2025-12-18", "end": "2026-01-01" }
                ]
            },
            {
                "saison": "Moyenne Saison",
                "ranges": [
                    { "start": "2026-07-15", "end": "2026-08-15" }
                ]
            }
        ];
    }

    getDefaultRates() {
        return {
            "Basse Saison": {
                "AFFA1": {
                    "ECAR": 30, "MCAR": 25, "CDAR": 35, "CCAR": 40, "IFAR": 45, "SFAR": 50, "CFAR": 42, "IJAR": 65, "CTAR": 55, "NTAR": 60, "FDAR": 48, "FVAR": 75, "PJAR": 70, "ILAR": 52, "PVAR": 85, "ITAR": 58, "STAR": 95, "WFAR": 80, "FFAR": 72, "WTAR": 78, "IFAE": 35, "XXAR": 120, "SFAE": 40, "PFAR": 68, "XFAR": 62
                },
                "AFFA7": {
                    "ECAR": 28, "MCAR": 23, "CDAR": 32, "CCAR": 37, "IFAR": 42, "SFAR": 47, "CFAR": 39, "IJAR": 62, "CTAR": 50, "NTAR": 55, "FDAR": 45, "FVAR": 70, "PJAR": 65, "ILAR": 48, "PVAR": 80, "ITAR": 53, "STAR": 88, "WFAR": 75, "FFAR": 67, "WTAR": 73, "IFAE": 32, "XXAR": 110, "SFAE": 37, "PFAR": 63, "XFAR": 57
                },
                "AFFA14": {
                    "ECAR": 25, "MCAR": 22, "CDAR": 30, "CCAR": 35, "IFAR": 40, "SFAR": 45, "CFAR": 37, "IJAR": 60, "CTAR": 48, "NTAR": 53, "FDAR": 43, "FVAR": 68, "PJAR": 63, "ILAR": 46, "PVAR": 78, "ITAR": 51, "STAR": 85, "WFAR": 73, "FFAR": 65, "WTAR": 71, "IFAE": 30, "XXAR": 105, "SFAE": 35, "PFAR": 61, "XFAR": 55
                }
            },
            "Haute Saison": {
                "AFFA1": {
                    "ECAR": 40, "MCAR": 35, "CDAR": 45, "CCAR": 50, "IFAR": 55, "SFAR": 60, "CFAR": 52, "IJAR": 75, "CTAR": 65, "NTAR": 70, "FDAR": 58, "FVAR": 85, "PJAR": 80, "ILAR": 62, "PVAR": 95, "ITAR": 68, "STAR": 105, "WFAR": 90, "FFAR": 82, "WTAR": 88, "IFAE": 45, "XXAR": 130, "SFAE": 50, "PFAR": 78, "XFAR": 72
                },
                "AFFA7": {
                    "ECAR": 38, "MCAR": 33, "CDAR": 42, "CCAR": 47, "IFAR": 52, "SFAR": 57, "CFAR": 49, "IJAR": 72, "CTAR": 60, "NTAR": 65, "FDAR": 55, "FVAR": 80, "PJAR": 75, "ILAR": 58, "PVAR": 90, "ITAR": 63, "STAR": 98, "WFAR": 85, "FFAR": 77, "WTAR": 83, "IFAE": 42, "XXAR": 120, "SFAE": 47, "PFAR": 73, "XFAR": 67
                },
                "AFFA14": {
                    "ECAR": 35, "MCAR": 30, "CDAR": 38, "CCAR": 43, "IFAR": 48, "SFAR": 53, "CFAR": 45, "IJAR": 68, "CTAR": 58, "NTAR": 63, "FDAR": 53, "FVAR": 78, "PJAR": 73, "ILAR": 56, "PVAR": 88, "ITAR": 61, "STAR": 95, "WFAR": 83, "FFAR": 75, "WTAR": 81, "IFAE": 40, "XXAR": 118, "SFAE": 45, "PFAR": 71, "XFAR": 65
                }
            },
            "Très Haute Saison": {
                "AFFA1": {
                    "ECAR": 50, "MCAR": 45, "CDAR": 55, "CCAR": 60, "IFAR": 65, "SFAR": 70, "CFAR": 62, "IJAR": 85, "CTAR": 75, "NTAR": 80, "FDAR": 68, "FVAR": 95, "PJAR": 90, "ILAR": 72, "PVAR": 105, "ITAR": 78, "STAR": 115, "WFAR": 100, "FFAR": 92, "WTAR": 98, "IFAE": 55, "XXAR": 140, "SFAE": 60, "PFAR": 88, "XFAR": 82
                },
                "AFFA14": {
                    "ECAR": 45, "MCAR": 40, "CDAR": 50, "CCAR": 55, "IFAR": 60, "SFAR": 65, "CFAR": 57, "IJAR": 80, "CTAR": 70, "NTAR": 75, "FDAR": 63, "FVAR": 90, "PJAR": 85, "ILAR": 67, "PVAR": 100, "ITAR": 73, "STAR": 110, "WFAR": 95, "FFAR": 87, "WTAR": 93, "IFAE": 50, "XXAR": 135, "SFAE": 55, "PFAR": 83, "XFAR": 77
                }
            },
            "Festive": {
                "AFFA1": {
                    "ECAR": 70, "MCAR": 65, "CDAR": 75, "CCAR": 80, "IFAR": 85, "SFAR": 90, "CFAR": 82, "IJAR": 105, "CTAR": 95, "NTAR": 100, "FDAR": 88, "FVAR": 115, "PJAR": 110, "ILAR": 92, "PVAR": 125, "ITAR": 98, "STAR": 135, "WFAR": 120, "FFAR": 112, "WTAR": 118, "IFAE": 75, "XXAR": 160, "SFAE": 80, "PFAR": 108, "XFAR": 102
                },
                "AFFA14": {
                    "ECAR": 65, "MCAR": 60, "CDAR": 70, "CCAR": 75, "IFAR": 80, "SFAR": 85, "CFAR": 77, "IJAR": 100, "CTAR": 90, "NTAR": 95, "FDAR": 83, "FVAR": 110, "PJAR": 105, "ILAR": 87, "PVAR": 120, "ITAR": 93, "STAR": 130, "WFAR": 115, "FFAR": 107, "WTAR": 113, "IFAE": 70, "XXAR": 155, "SFAE": 75, "PFAR": 103, "XFAR": 97
                }
            },
            "Moyenne Saison": {
                "AFFA1": {
                    "ECAR": 35, "MCAR": 30, "CDAR": 40, "CCAR": 45, "IFAR": 50, "SFAR": 55, "CFAR": 47, "IJAR": 70, "CTAR": 60, "NTAR": 65, "FDAR": 53, "FVAR": 80, "PJAR": 75, "ILAR": 57, "PVAR": 90, "ITAR": 63, "STAR": 100, "WFAR": 85, "FFAR": 77, "WTAR": 83, "IFAE": 40, "XXAR": 125, "SFAE": 45, "PFAR": 73, "XFAR": 67
                },
                "AFFA14": {
                    "ECAR": 32, "MCAR": 27, "CDAR": 37, "CCAR": 42, "IFAR": 47, "SFAR": 52, "CFAR": 44, "IJAR": 67, "CTAR": 57, "NTAR": 62, "FDAR": 50, "FVAR": 77, "PJAR": 72, "ILAR": 54, "PVAR": 87, "ITAR": 60, "STAR": 97, "WFAR": 82, "FFAR": 74, "WTAR": 80, "IFAE": 37, "XXAR": 122, "SFAE": 42, "PFAR": 70, "XFAR": 64
                }
            }
        };
    }

    getDefaultRateConfig() {
        return {
            "calculation_rules": {
                "weekly_equals_sum_of_7_daily": true,
                "notes": "Weekly (W) tariffs are computed as the sum of 7 daily (D) rates."
            },
            "pickup_locations": [
                {
                    "brand": "HERTZ",
                    "pickup_location_level_name": "SBHZE",
                    "car_type_group": "SBHZE",
                    "rates": [
                        { "rate_code": "AFFA1", "type": "Fixed", "plan_code": "D" },
                        { "rate_code": "AFFA7", "type": "Fixed", "plan_code": "D" },
                        { "rate_code": "AFFA14", "type": "Fixed", "plan_code": "D" }
                    ]
                },
                {
                    "brand": "DOLLAR",
                    "pickup_location_level_name": "SBHZR",
                    "rates": [
                        { "rate_code": "SBHDL", "type": "Daily", "plan_code": "D" },
                        { "rate_code": "SBHWK", "type": "Weekly", "plan_code": "W" }
                    ]
                },
                {
                    "brand": "THRIFTY",
                    "pickup_location_level_name": "SBHZT",
                    "rates": [
                        { "rate_code": "SBHDL", "type": "Daily", "plan_code": "D" },
                        { "rate_code": "SBHWK", "type": "Weekly", "plan_code": "W" }
                    ]
                }
            ]
        };
    }

    // Création de l'interface utilisateur moderne
    createUI() {
        // Supprimer l'ancienne interface si elle existe
        const existingPanel = document.getElementById('rms-helper-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Créer le panneau principal
        this.ui = document.createElement('div');
        this.ui.id = 'rms-helper-panel';
        this.ui.className = 'rms-helper-panel';
        this.ui.innerHTML = this.getUIHTML();

        document.body.appendChild(this.ui);

        // Créer le bouton de mapping ACRISS
        this.createMappingButton();
        
        // Créer le bouton des paramètres
        this.createSettingsButton();
    }

    getUIHTML() {
        return `
            <div class="rms-panel-header">
                <h3 class="rms-panel-title">🚗 RMS Helper Enhanced</h3>
                <div class="rms-header-actions">
                    <button class="rms-compact-btn" id="rms-compact" title="Mode compact">⚡</button>
                    <button class="rms-minimize-btn" id="rms-minimize">−</button>
                </div>
            </div>
            <div class="rms-panel-content">
                <!-- Section Configuration de base (toujours visible) -->
                <div class="rms-section rms-section-essential">
                    <div class="rms-section-title">⚡ Configuration rapide</div>
                    <div class="rms-form-row">
                        <div class="rms-form-group rms-form-group-half">
                            <label class="rms-label">Marque:</label>
                            <select id="brand-select" class="rms-select">
                                <option value="">--Marque--</option>
                                <option value="HERTZ">HERTZ</option>
                                <option value="DOLLAR">DOLLAR</option>
                                <option value="THRIFTY">THRIFTY</option>
                            </select>
                        </div>
                        <div class="rms-form-group rms-form-group-half">
                            <label class="rms-label">Saison:</label>
                            <select id="season-select" class="rms-select">
                                <option value="">--Saison--</option>
                            </select>
                        </div>
                    </div>
                    <div class="rms-form-row" id="period-row" style="display: none;">
                        <div class="rms-form-group">
                            <label class="rms-label">📅 Période de la saison:</label>
                            <select id="quick-period-select" class="rms-select">
                                <option value="">--Choisir une période--</option>
                            </select>
                        </div>
                    </div>
                    <div class="rms-form-row">
                        <div class="rms-form-group rms-form-group-half">
                            <label class="rms-label">Rate Code:</label>
                            <select id="rate-code-select" class="rms-select">
                                <option value="">--Auto--</option>
                            </select>
                        </div>
                        <div class="rms-form-group rms-form-group-half">
                            <label class="rms-label">Véhicule:</label>
                            <select id="car-type-select" class="rms-select">
                                <option value="">--Véhicule--</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Actions principales (toujours visibles) -->
                <div class="rms-section rms-section-actions">
                    <div class="rms-actions-grid">
                        <button id="fill-form-btn" class="rms-btn rms-btn-primary rms-btn-compact">
                            ✨ Formulaire
                        </button>
                        <button id="retrieve-data-btn" class="rms-btn rms-btn-secondary rms-btn-compact">
                            🔄 Sauvegarder État
                        </button>
                        <button id="auto-fill-rates-btn" class="rms-btn rms-btn-success rms-btn-compact">
                            💰 Tous Tarifs
                        </button>
                        <button id="analyze-table-btn" class="rms-btn rms-btn-warning rms-btn-compact">
                            🔍 Analyser
                        </button>
                    </div>
                    <div class="rms-actions-grid" style="margin-top: 8px;">
                        <button id="force-fill-rates-btn" class="rms-btn rms-btn-danger rms-btn-compact">
                            🔥 Force Tarifs
                        </button>
                        <button id="quick-config-btn" class="rms-btn rms-btn-info rms-btn-compact">
                            🔄 Sync Données
                        </button>
                    </div>
                </div>

                <!-- Sections avancées (collapsibles) -->
                <div class="rms-advanced-sections" id="rms-advanced-sections">
                    <div class="rms-section">
                        <div class="rms-section-title">📅 Période de saison</div>
                        <div class="rms-form-group">
                            <select id="season-period-select" class="rms-select">
                                <option value="">--Choisir une période--</option>
                            </select>
                        </div>
                    </div>

                    <div id="rate-type-container" class="rms-section rms-hidden">
                        <div class="rms-section-title">📊 Type de tarif (Dollar/Thrifty)</div>
                        <div class="rms-form-group">
                            <select id="rate-type-select" class="rms-select">
                                <option value="">--Choisir le type--</option>
                                <option value="SBHDL">Quotidien (D)</option>
                                <option value="SBHWK">Hebdomadaire (W)</option>
                            </select>
                        </div>
                    </div>

                    <div class="rms-section">
                        <div class="rms-section-title">🎯 Modification ciblée</div>
                        <div class="rms-form-group">
                            <label class="rms-label">Véhicule spécifique:</label>
                            <select id="single-vehicle-select" class="rms-select">
                                <option value="">--Tous les véhicules--</option>
                            </select>
                        </div>
                        <button id="fill-single-rate-btn" class="rms-btn rms-btn-primary">
                            🎯 Remplir Tarif Spécifique
                        </button>
                    </div>
                </div>

                <!-- Bouton pour afficher/masquer les sections avancées -->
                <div class="rms-toggle-section">
                    <button id="toggle-advanced-btn" class="rms-btn rms-btn-secondary rms-btn-toggle">
                        📋 Options avancées ▼
                    </button>
                </div>
            </div>
        `;
    }

    createMappingButton() {
        const existingBtn = document.getElementById('rms-mapping-btn');
        if (existingBtn) existingBtn.remove();

        const mappingBtn = document.createElement('button');
        mappingBtn.id = 'rms-mapping-btn';
        mappingBtn.className = 'rms-mapping-button';
        mappingBtn.innerHTML = '🔗 Mapper ACRISS';
        mappingBtn.addEventListener('click', () => this.updateAcrissInfo());
        document.body.appendChild(mappingBtn);
    }

    createSettingsButton() {
        const existingBtn = document.getElementById('rms-settings-btn');
        if (existingBtn) existingBtn.remove();

        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'rms-settings-btn';
        settingsBtn.className = 'rms-settings-icon';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.addEventListener('click', () => this.openSettings());
        document.body.appendChild(settingsBtn);
    }

    // Liaison des événements
    bindEvents() {
        // Événement personnalisé pour ouvrir les paramètres
        window.addEventListener('openRMSSettings', () => this.openSettings());

        // Minimiser/Maximiser le panneau
        document.addEventListener('click', (e) => {
            if (e.target.id === 'rms-minimize') {
                this.ui.classList.toggle('rms-minimized');
                e.target.textContent = this.ui.classList.contains('rms-minimized') ? '+' : '−';
            }
        });

        // Sélection de marque
        document.addEventListener('change', (e) => {
            if (e.target.id === 'brand-select') {
                this.handleBrandSelection(e.target.value);
            }
            if (e.target.id === 'season-select') {
                this.handleSeasonSelection(e.target.value);
            }
            if (e.target.id === 'season-period-select') {
                this.handleSeasonPeriodSelection(e.target.value);
            }
            if (e.target.id === 'quick-period-select') {
                this.handleQuickPeriodSelection(e.target.value);
            }
            if (e.target.id === 'car-type-select') {
                this.handleCarTypeSelection(e.target.value);
            }
            if (e.target.id === 'rate-type-select') {
                this.handleRateTypeSelection(e.target.value);
            }
            if (e.target.id === 'rate-code-select') {
                this.handleRateCodeSelection(e.target.value);
            }
        });

        // Boutons d'action
        document.addEventListener('click', (e) => {
            if (e.target.id === 'fill-form-btn') {
                this.fillForm();
            }
            if (e.target.id === 'retrieve-data-btn') {
                this.retrieveDataAndSaveState();
            }
            if (e.target.id === 'auto-fill-rates-btn') {
                this.autoFillAllRates();
            }
            if (e.target.id === 'fill-single-rate-btn') {
                this.fillSingleRate();
            }
            if (e.target.id === 'analyze-table-btn') {
                this.analyzeRatesTable();
                this.showNotification('🔍 Analyse du tableau affichée dans la console (F12)', 'info');
            }
            if (e.target.id === 'toggle-advanced-btn') {
                this.toggleAdvancedSections();
            }
            if (e.target.id === 'force-fill-rates-btn') {
                this.forceModifyAllRatesDirectly();
            }
            if (e.target.id === 'quick-config-btn') {
                this.openQuickConfig();
            }
        });
    }

    // Chargement des données par défaut dans l'UI
    loadDefaultData() {
        this.populateSeasonSelect();
        this.populateVehicleSelect();
        this.populateSingleVehicleSelect();
        this.restoreFormState();
        
        // Initialiser avec sections avancées masquées par défaut
        setTimeout(() => {
            this.toggleAdvancedSections(false);
        }, 100);
    }

    populateSeasonSelect() {
        const seasonSelect = document.getElementById('season-select');
        if (!seasonSelect) return;

        seasonSelect.innerHTML = '<option value="">--Choisir une saison--</option>';
        
        if (this.data.seasons) {
            this.data.seasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season.saison;
                option.textContent = season.saison;
                seasonSelect.appendChild(option);
            });
        }
    }

    populateVehicleSelect() {
        const vehicleSelect = document.getElementById('car-type-select');
        if (!vehicleSelect) return;

        vehicleSelect.innerHTML = '<option value="">--Choisir un véhicule--</option>';
        
        if (this.data.vehicles) {
            this.data.vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.sipp;
                option.textContent = `${vehicle.sipp} - ${vehicle.make_model}`;
                vehicleSelect.appendChild(option);
            });
        }
    }

    populateSingleVehicleSelect() {
        const singleVehicleSelect = document.getElementById('single-vehicle-select');
        if (!singleVehicleSelect) return;

        singleVehicleSelect.innerHTML = '<option value="">--Tous les véhicules--</option>';
        
        if (this.data.vehicles) {
            this.data.vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.sipp;
                option.textContent = `${vehicle.sipp} - ${vehicle.make_model}`;
                singleVehicleSelect.appendChild(option);
            });
        }
    }

    populateRateCodeSelect(brand) {
        const rateCodeSelect = document.getElementById('rate-code-select');
        if (!rateCodeSelect) return;

        rateCodeSelect.innerHTML = '<option value="">--Auto (depuis formulaire)--</option>';
        
        if (this.data.rateConfig && this.data.rateConfig.pickup_locations) {
            const brandConfig = this.data.rateConfig.pickup_locations.find(loc => loc.brand === brand);
            if (brandConfig && brandConfig.rates) {
                brandConfig.rates.forEach(rate => {
                    const option = document.createElement('option');
                    option.value = rate.rate_code;
                    option.textContent = `${rate.rate_code} (${rate.type} - ${rate.plan_code})`;
                    rateCodeSelect.appendChild(option);
                });
            }
        }
    }

    // Gestionnaires d'événements
    handleBrandSelection(brand) {
        const rateTypeContainer = document.getElementById('rate-type-container');
        
        if (brand === 'HERTZ') {
            rateTypeContainer.classList.add('rms-hidden');
            this.fillHertzForm();
        } else if (brand === 'DOLLAR' || brand === 'THRIFTY') {
            rateTypeContainer.classList.remove('rms-hidden');
            
            // Remplir automatiquement avec les valeurs par défaut (Daily)
            const rateTypeSelect = document.getElementById('rate-type-select');
            if (rateTypeSelect) {
                rateTypeSelect.value = 'SBHDL'; // Daily par défaut
                // Remplir le formulaire immédiatement
                this.fillDollarThriftyForm(brand);
            }
        } else {
            rateTypeContainer.classList.add('rms-hidden');
        }
        
        // Peupler le sélecteur de Rate Code basé sur la marque
        this.populateRateCodeSelect(brand);
        
        this.saveFormState();
    }

    handleSeasonSelection(seasonName) {
        const periodSelect = document.getElementById('season-period-select');
        const quickPeriodSelect = document.getElementById('quick-period-select');
        const periodRow = document.getElementById('period-row');
        
        // Réinitialiser les sélecteurs
        if (periodSelect) {
            periodSelect.innerHTML = '<option value="">--Choisir une période--</option>';
        }
        if (quickPeriodSelect) {
            quickPeriodSelect.innerHTML = '<option value="">--Choisir une période--</option>';
        }

        const season = this.data.seasons.find(s => s.saison === seasonName);
        
        if (season && season.ranges && season.ranges.length > 0) {
            // Afficher la ligne de période dans la configuration rapide
            if (periodRow) {
                periodRow.style.display = 'flex';
            }
            
            // Peupler les deux sélecteurs (rapide et avancé)
            season.ranges.forEach((range, index) => {
                const optionText = `${this.formatDate(range.start)} → ${this.formatDate(range.end)}`;
                const optionValue = JSON.stringify(range);
                
                // Sélecteur rapide
                if (quickPeriodSelect) {
                    const quickOption = document.createElement('option');
                    quickOption.value = optionValue;
                    quickOption.textContent = optionText;
                    quickPeriodSelect.appendChild(quickOption);
                }
                
                // Sélecteur avancé (pour compatibilité)
                if (periodSelect) {
                    const advancedOption = document.createElement('option');
                    advancedOption.value = optionValue;
                    advancedOption.textContent = optionText;
                    periodSelect.appendChild(advancedOption);
                }
            });
            
            // Si une seule période, la sélectionner automatiquement
            if (season.ranges.length === 1) {
                const periodValue = JSON.stringify(season.ranges[0]);
                if (quickPeriodSelect) {
                    quickPeriodSelect.value = periodValue;
                }
                if (periodSelect) {
                    periodSelect.value = periodValue;
                }
                this.handleSeasonPeriodSelection(periodValue);
            }
        } else {
            // Masquer la ligne de période si pas de périodes
            if (periodRow) {
                periodRow.style.display = 'none';
            }
        }
        
        this.saveFormState();
    }

    handleSeasonPeriodSelection(periodJson) {
        if (!periodJson) return;

        try {
            const period = JSON.parse(periodJson);
            this.setPickupDate(period.start);
            this.setDiscontinueDate(period.end);
            this.saveFormState();
        } catch (error) {
            console.error('Erreur lors du parsing de la période:', error);
        }
    }

    handleQuickPeriodSelection(periodJson) {
        if (!periodJson) return;

        try {
            const period = JSON.parse(periodJson);
            this.setPickupDate(period.start);
            this.setDiscontinueDate(period.end);
            
            // Synchroniser avec le sélecteur avancé
            const advancedPeriodSelect = document.getElementById('season-period-select');
            if (advancedPeriodSelect) {
                advancedPeriodSelect.value = periodJson;
            }
            
            this.saveFormState();
            this.showNotification(`📅 Période appliquée: ${this.formatDate(period.start)} → ${this.formatDate(period.end)}`, 'success');
        } catch (error) {
            console.error('Erreur lors du parsing de la période:', error);
        }
    }

    handleCarTypeSelection(sipp) {
        const carTypeField = document.querySelector('input[name="txtCarType"]');
        if (carTypeField && sipp) {
            carTypeField.value = sipp;
        }
        this.saveFormState();
    }

    handleRateTypeSelection(rateType) {
        const selectedBrand = document.getElementById('brand-select').value;
        
        if ((selectedBrand === 'DOLLAR' || selectedBrand === 'THRIFTY') && rateType) {
            // Remplir automatiquement le formulaire pour DOLLAR/THRIFTY
            this.fillDollarThriftyForm(selectedBrand);
        }
        
        this.saveFormState();
    }

    handleRateCodeSelection(selectedRateCode) {
        const selectedBrand = document.getElementById('brand-select').value;
        
        console.log(`🔧 Rate Code sélectionné: ${selectedRateCode} pour ${selectedBrand}`);
        
        if (!selectedRateCode || selectedRateCode === '') {
            return; // Mode "Auto", ne rien faire
        }
        
        // Mettre à jour les champs Rate Code et Plan Code dans le formulaire RMS
        const rateCodeField = document.querySelector('input[name="txtRateCode"]');
        const planCodeField = document.querySelector('input[name="txtPlanCode"]');
        
        if (rateCodeField) {
            rateCodeField.value = selectedRateCode;
            console.log(`📝 Rate Code mis à jour: ${selectedRateCode}`);
        }
        
        // Déterminer le Plan Code basé sur le Rate Code
        let planCode = 'D'; // Par défaut
        
        if (selectedBrand === 'HERTZ') {
            planCode = 'D'; // HERTZ toujours D
        } else if (selectedBrand === 'DOLLAR' || selectedBrand === 'THRIFTY') {
            planCode = selectedRateCode === 'SBHWK' ? 'W' : 'D';
        }
        
        if (planCodeField) {
            planCodeField.value = planCode;
            console.log(`📝 Plan Code mis à jour: ${planCode}`);
        }
        
        // Pour DOLLAR/THRIFTY, synchroniser aussi le rate-type-select
        if ((selectedBrand === 'DOLLAR' || selectedBrand === 'THRIFTY')) {
            const rateTypeSelect = document.getElementById('rate-type-select');
            if (rateTypeSelect && (selectedRateCode === 'SBHDL' || selectedRateCode === 'SBHWK')) {
                rateTypeSelect.value = selectedRateCode;
                console.log(`🔄 Rate type select synchronisé: ${selectedRateCode}`);
            }
        }
        
        this.saveFormState();
    }

    // Sauvegarde de l'état du formulaire
    saveFormState() {
        const state = {
            brand: document.getElementById('brand-select')?.value || '',
            season: document.getElementById('season-select')?.value || '',
            period: document.getElementById('season-period-select')?.value || '',
            quickPeriod: document.getElementById('quick-period-select')?.value || '',
            carType: document.getElementById('car-type-select')?.value || '',
            rateType: document.getElementById('rate-type-select')?.value || '',
            rateCode: document.getElementById('rate-code-select')?.value || '',
            singleVehicle: document.getElementById('single-vehicle-select')?.value || ''
        };
        
        chrome.storage.local.set({ 'rms_form_state': state });
    }

    // Restauration de l'état du formulaire
    async restoreFormState() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['rms_form_state'], (result) => {
                const state = result.rms_form_state;
                if (!state) {
                    resolve();
                    return;
                }

                // Restaurer les sélections
                setTimeout(() => {
                    const brandSelect = document.getElementById('brand-select');
                    const seasonSelect = document.getElementById('season-select');
                    const periodSelect = document.getElementById('season-period-select');
                    const quickPeriodSelect = document.getElementById('quick-period-select');
                    const carTypeSelect = document.getElementById('car-type-select');
                    const rateTypeSelect = document.getElementById('rate-type-select');
                    const rateCodeSelect = document.getElementById('rate-code-select');
                    const singleVehicleSelect = document.getElementById('single-vehicle-select');

                    if (brandSelect && state.brand) {
                        brandSelect.value = state.brand;
                        this.handleBrandSelection(state.brand);
                        
                        // Restaurer le rate code après avoir peuplé les options
                        setTimeout(() => {
                            if (rateCodeSelect && state.rateCode) {
                                rateCodeSelect.value = state.rateCode;
                            }
                        }, 100);
                    }
                    
                    if (seasonSelect && state.season) {
                        seasonSelect.value = state.season;
                        this.handleSeasonSelection(state.season);
                        
                        setTimeout(() => {
                            if (periodSelect && state.period) {
                                periodSelect.value = state.period;
                                this.handleSeasonPeriodSelection(state.period);
                            }
                            if (quickPeriodSelect && state.quickPeriod) {
                                quickPeriodSelect.value = state.quickPeriod;
                                this.handleQuickPeriodSelection(state.quickPeriod);
                            }
                        }, 100);
                    }
                    
                    if (carTypeSelect && state.carType) {
                        carTypeSelect.value = state.carType;
                    }
                    
                    if (rateTypeSelect && state.rateType) {
                        rateTypeSelect.value = state.rateType;
                    }
                    
                    if (singleVehicleSelect && state.singleVehicle) {
                        singleVehicleSelect.value = state.singleVehicle;
                    }

                    resolve();
                }, 500);
            });
        });
    }

    // Fonctions utilitaires pour les dates
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }

    // Fonction pour basculer les sections avancées
    toggleAdvancedSections(show = null) {
        const advancedSections = document.getElementById('rms-advanced-sections');
        const toggleBtn = document.getElementById('toggle-advanced-btn');
        
        if (!advancedSections || !toggleBtn) return;

        const isCurrentlyVisible = !advancedSections.classList.contains('collapsed');
        const shouldShow = show !== null ? show : !isCurrentlyVisible;

        if (shouldShow) {
            advancedSections.classList.remove('collapsed');
            toggleBtn.innerHTML = '📋 Options avancées ▲';
            toggleBtn.title = 'Masquer les options avancées';
        } else {
            advancedSections.classList.add('collapsed');
            toggleBtn.innerHTML = '📋 Options avancées ▼';
            toggleBtn.title = 'Afficher les options avancées';
        }
    }

    formatDateForInput(dateString) {
        const date = new Date(dateString);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    // Fonction pour basculer les sections avancées
    toggleAdvancedSections(show = null) {
        const advancedSections = document.getElementById('rms-advanced-sections');
        const toggleBtn = document.getElementById('toggle-advanced-btn');
        
        if (!advancedSections || !toggleBtn) return;

        const isCurrentlyVisible = !advancedSections.classList.contains('collapsed');
        const shouldShow = show !== null ? show : !isCurrentlyVisible;

        if (shouldShow) {
            advancedSections.classList.remove('collapsed');
            toggleBtn.innerHTML = '📋 Options avancées ▲';
            toggleBtn.title = 'Masquer les options avancées';
        } else {
            advancedSections.classList.add('collapsed');
            toggleBtn.innerHTML = '📋 Options avancées ▼';
            toggleBtn.title = 'Afficher les options avancées';
        }
    }

    setPickupDate(dateString) {
        const pickupInput = document.getElementById('wdtePickupDate_input');
        if (pickupInput) {
            const formattedDate = this.formatDateForInput(dateString);
            
            // Activer le champ temporairement s'il est désactivé
            const wasDisabled = pickupInput.disabled;
            if (wasDisabled) {
                pickupInput.disabled = false;
            }
            
            // Simuler la saisie utilisateur complète
            this.simulateUserInput(pickupInput, formattedDate);
            
            // Restaurer l'état désactivé si nécessaire
            if (wasDisabled) {
                setTimeout(() => {
                    pickupInput.disabled = true;
                }, 100);
            }
        }
    }

    setDiscontinueDate(dateString) {
        const discontinueInput = document.getElementById('dtDiscontinueDate_ovw_input');
        if (discontinueInput) {
            const formattedDate = this.formatDateForInput(dateString);
            
            // Activer le champ temporairement s'il est désactivé
            const wasDisabled = discontinueInput.disabled;
            if (wasDisabled) {
                discontinueInput.disabled = false;
            }
            
            // Simuler la saisie utilisateur complète
            this.simulateUserInput(discontinueInput, formattedDate);
            
            // Restaurer l'état désactivé si nécessaire
            if (wasDisabled) {
                setTimeout(() => {
                    discontinueInput.disabled = true;
                }, 100);
            }
        }
    }

    // Fonction pour simuler une saisie utilisateur complète
    simulateUserInput(element, value) {
        console.log(`🎯 Simulation saisie pour ${element.id}: "${value}"`);
        
        try {
            // 1. Événements de souris pour "cliquer" dans le champ
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            
            // 2. Focus sur l'élément
            element.focus();
            element.dispatchEvent(new Event('focusin', { bubbles: true }));
            element.dispatchEvent(new Event('focus', { bubbles: true }));
            
            // 3. Sélectionner tout le contenu existant
            element.select();
            element.setSelectionRange(0, element.value.length);
            
            // 4. Simuler suppression du contenu existant
            element.dispatchEvent(new KeyboardEvent('keydown', { 
                key: 'Delete', 
                keyCode: 46, 
                bubbles: true, 
                cancelable: true 
            }));
            
            // 5. Changer la valeur et simuler la saisie
            const oldValue = element.value;
            element.value = value;
            
            // 6. Événements de saisie pour chaque caractère (simulation réaliste)
            element.dispatchEvent(new Event('input', { 
                bubbles: true, 
                cancelable: true,
                inputType: 'insertText',
                data: value
            }));
            
            // 7. Événements de validation
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
            
            // 8. Simuler Tab ou Enter pour valider
            element.dispatchEvent(new KeyboardEvent('keydown', { 
                key: 'Tab', 
                keyCode: 9, 
                bubbles: true, 
                cancelable: true 
            }));
            
            // 9. Perdre le focus pour déclencher la validation finale
            setTimeout(() => {
                element.blur();
                element.dispatchEvent(new Event('blur', { bubbles: true }));
                element.dispatchEvent(new Event('focusout', { bubbles: true }));
                
                // 10. Cliquer ailleurs pour s'assurer que la validation est prise en compte
                const body = document.body;
                body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                
                console.log(`📅 Simulation terminée pour ${element.id}`);
                
                // Vérifier le résultat après un délai
                setTimeout(() => {
                    const finalValue = element.value;
                    const success = finalValue === value;
                    console.log(`🏁 Valeur finale: "${finalValue}"`);
                    console.log(`✅ Validation: ${success ? 'SUCCÈS' : 'ÉCHEC'}`);
                }, 200);
                
            }, 100);
            
        } catch (error) {
            console.error('❌ Erreur lors de la simulation:', error);
        }
    }

    // Fonction pour obtenir Rate Code et Plan Code basés sur la sélection
    getRateCodeAndPlanCode(brand) {
        const selectedRateCode = document.getElementById('rate-code-select')?.value;
        
        if (selectedRateCode && selectedRateCode !== '') {
            // Utiliser le rate code sélectionné dans l'interface
            if (brand === 'HERTZ') {
                return { rateCode: selectedRateCode, planCode: 'D' }; // HERTZ toujours D
            } else {
                // Pour DOLLAR/THRIFTY, déterminer le plan code basé sur le rate code
                const planCode = selectedRateCode === 'SBHWK' ? 'W' : 'D';
                return { rateCode: selectedRateCode, planCode: planCode };
            }
        } else {
            // Valeurs par défaut si rien de sélectionné
            if (brand === 'HERTZ') {
                return { rateCode: 'AFFA1', planCode: 'D' };
            } else {
                const rateTypeSelect = document.getElementById('rate-type-select');
                const rateType = rateTypeSelect?.value || 'SBHDL';
                return { 
                    rateCode: rateType, 
                    planCode: rateType === 'SBHWK' ? 'W' : 'D' 
                };
            }
        }
    }

    // Remplissage automatique des formulaires (basé sur votre ancien code)
    fillHertzForm() {
        // Checkbox Hertz
        const hertzCheckbox = document.querySelector('input[id="cblBrand_0"]');
        if (hertzCheckbox) {
            hertzCheckbox.checked = true;
        }

        // Pickup Location Level Name
        const pickupLocationField = document.querySelector('input[name="txtLocationLevelName"]');
        if (pickupLocationField) {
            pickupLocationField.value = "SBHZE";
        }

        // Dropdown Corporate/Licensee
        const corporateLicenseeDropdown = document.querySelector('select[name="ddlCorporateLicenseeFlag"]');
        if (corporateLicenseeDropdown) {
            corporateLicenseeDropdown.value = "L";
        }

        // Rate Code et Plan Code basés sur la sélection
        const { rateCode, planCode } = this.getRateCodeAndPlanCode('HERTZ');
        
        const rateCodeField = document.querySelector('input[name="txtRateCode"]');
        if (rateCodeField) {
            rateCodeField.value = rateCode;
        }

        const planCodeField = document.querySelector('input[name="txtPlanCode"]');
        if (planCodeField) {
            planCodeField.value = planCode;
        }

        // Car Type Group
        const carTypeGroupField = document.querySelector('input[name="txtCarTypeGroup"]');
        if (carTypeGroupField) {
            carTypeGroupField.value = "SBHZE";
        }
    }

    fillDollarThriftyForm(brand) {
        // Priorité au rate type sélectionné dans l'interface, sinon utiliser rate-type-select
        let rateType = document.getElementById('rate-type-select')?.value;
        
        // Si pas de rate type sélectionné, utiliser SBHDL par défaut
        if (!rateType) {
            rateType = 'SBHDL';
        }
        
        console.log(`🔧 Remplissage ${brand} avec rate type: ${rateType}`);

        const pickupLocation = brand === 'DOLLAR' ? "SBHZR" : "SBHZT";

        // Checkbox correspondant
        const brandCheckbox = document.querySelector(`input[id="cblBrand_${brand === 'DOLLAR' ? '1' : '2'}"]`);
        if (brandCheckbox) {
            brandCheckbox.checked = true;
        }

        // Pickup Location Level Name
        const pickupLocationField = document.querySelector('input[name="txtLocationLevelName"]');
        if (pickupLocationField) {
            pickupLocationField.value = pickupLocation;
        }

        // Corporate/Licensee
        const corporateLicenseeDropdown = document.querySelector('select[name="ddlCorporateLicenseeFlag"]');
        if (corporateLicenseeDropdown) {
            corporateLicenseeDropdown.value = "L";
        }

        // Rate Code et Plan Code basés sur la sélection ou rate type
        const { rateCode, planCode } = this.getRateCodeAndPlanCode(brand);
        
        const rateCodeField = document.querySelector('input[name="txtRateCode"]');
        if (rateCodeField) {
            rateCodeField.value = rateCode;
        }

        const planCodeField = document.querySelector('input[name="txtPlanCode"]');
        if (planCodeField) {
            planCodeField.value = planCode;
        }

        // Car Type Group (vide pour DOLLAR/THRIFTY)
        const carTypeGroupField = document.querySelector('input[name="txtCarTypeGroup"]');
        if (carTypeGroupField) {
            carTypeGroupField.value = ""; // Vider pour DOLLAR/THRIFTY
        }
    }

    fillForm() {
        const selectedBrand = document.getElementById('brand-select').value;
        
        if (selectedBrand === 'HERTZ') {
            this.fillHertzForm();
        } else if (selectedBrand === 'DOLLAR' || selectedBrand === 'THRIFTY') {
            this.fillDollarThriftyForm(selectedBrand);
        }
        
        this.showNotification('Formulaire rempli avec succès!', 'success');
    }

    // Sauvegarder l'état et informer sur le CSP
    retrieveDataAndSaveState() {
        // Sauvegarder l'état du formulaire
        this.saveFormState();
        
        // Informer l'utilisateur de la procédure à suivre
        this.showCSPWorkaroundNotification();
    }

    showCSPWorkaroundNotification() {
        // Créer une notification spéciale pour le CSP
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
            z-index: 20000;
            max-width: 400px;
            text-align: center;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        notification.innerHTML = `
            <h3 style="margin: 0 0 12px 0; font-size: 18px;">🛡️ Sécurité CSP Détectée</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.4;">
                Votre état est <strong>sauvegardé</strong> ✅<br>
                Pour récupérer les données :<br>
                <strong>Cliquez manuellement sur le bouton "Retrieve" de la page</strong>
            </p>
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button id="highlight-retrieve-btn" style="
                    background: white; 
                    color: #d97706; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 6px; 
                    font-weight: 600;
                    cursor: pointer;
                ">📍 Surligner Retrieve</button>
                <button id="close-csp-notification" style="
                    background: rgba(255,255,255,0.2); 
                    color: white; 
                    border: 1px solid rgba(255,255,255,0.3); 
                    padding: 8px 16px; 
                    border-radius: 6px;
                    cursor: pointer;
                ">✅ Compris</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Event listeners pour les boutons
        document.getElementById('highlight-retrieve-btn').addEventListener('click', () => {
            this.highlightRetrieveButton();
            notification.remove();
        });
        
        document.getElementById('close-csp-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Fermer automatiquement après 8 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
    }

    highlightRetrieveButton() {
        const retrieveBtn = document.getElementById('wibSubmit');
        if (retrieveBtn) {
            // Créer un effet de surlignage
            const highlight = document.createElement('div');
            highlight.style.cssText = `
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                border: 3px solid #f59e0b;
                border-radius: 8px;
                pointer-events: none;
                z-index: 15000;
                animation: pulse 1.5s infinite;
                box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
            `;
            
            // Ajouter l'animation CSS si elle n'existe pas
            if (!document.getElementById('pulse-animation')) {
                const style = document.createElement('style');
                style.id = 'pulse-animation';
                style.textContent = `
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.7; transform: scale(1.05); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Positionner le highlight
            const rect = retrieveBtn.getBoundingClientRect();
            highlight.style.position = 'fixed';
            highlight.style.top = rect.top - 5 + 'px';
            highlight.style.left = rect.left - 5 + 'px';
            highlight.style.width = rect.width + 10 + 'px';
            highlight.style.height = rect.height + 10 + 'px';
            
            document.body.appendChild(highlight);
            
            // Supprimer après 5 secondes
            setTimeout(() => {
                if (highlight.parentNode) {
                    highlight.remove();
                }
            }, 5000);
            
            this.showNotification('🎯 Bouton Retrieve surligné ! Cliquez dessus manuellement.', 'info');
        } else {
            this.showNotification('❌ Bouton Retrieve non trouvé sur la page', 'error');
        }
    }

    // Remplissage automatique de TOUS les tarifs
    async autoFillAllRates() {
        const selectedSeason = document.getElementById('season-select').value;
        const selectedBrand = document.getElementById('brand-select').value;
        
        if (!selectedSeason) {
            this.showNotification('Veuillez sélectionner une saison', 'error');
            return;
        }

        // Obtenir le rate code - priorité à la sélection manuelle
        let rateCode = document.getElementById('rate-code-select')?.value;
        
        if (!rateCode) {
            // Si pas de sélection manuelle, utiliser la logique par défaut
            rateCode = 'AFFA1'; // Par défaut
            if (selectedBrand === 'HERTZ') {
                const rateCodeField = document.querySelector('input[name="txtRateCode"]');
                if (rateCodeField && rateCodeField.value) {
                    rateCode = rateCodeField.value;
                }
            } else if (selectedBrand === 'DOLLAR' || selectedBrand === 'THRIFTY') {
                const rateTypeSelect = document.getElementById('rate-type-select');
                if (rateTypeSelect && rateTypeSelect.value) {
                    rateCode = rateTypeSelect.value;
                }
            }
        }
        
        console.log(`📋 Rate Code utilisé: ${rateCode} (marque: ${selectedBrand})`);

        // Afficher notification de début
        this.showNotification('🔄 Remplissage des tarifs en cours...', 'info');

        // Attendre un peu pour s'assurer que le tableau est chargé
        await new Promise(resolve => setTimeout(resolve, 500));

        // Remplir TOUS les tarifs dans le tableau avec vérifications
        const modifiedCount = await this.fillAllRatesInGridRobust(selectedSeason, rateCode);
        
        if (modifiedCount > 0) {
            this.showNotification(`✅ ${modifiedCount} tarifs modifiés pour la saison "${selectedSeason}"!`, 'success');
            
            // Validation finale globale : forcer la sauvegarde de toutes les modifications
            setTimeout(() => {
                try {
                    this.log('🔄 FINAL_VALIDATION', 'Validation finale globale', {
                        modifiedCount,
                        sessionId: this.sessionId
                    });

                    // Déclencher les événements de sauvegarde globaux
                    const grid = document.getElementById('uwgDisplayGrid');
                    if (grid) {
                        grid.dispatchEvent(new CustomEvent('gridupdate', { bubbles: true }));
                        grid.dispatchEvent(new CustomEvent('datachanged', { bubbles: true }));
                    }

                    // Cliquer sur le header pour finaliser
                    const gridHeader = document.querySelector('#uwgDisplayGrid_hdiv');
                    if (gridHeader) {
                        gridHeader.click();
                        this.log('🔄 HEADER_FINAL', 'Clic header final pour sauvegarde', {
                            sessionId: this.sessionId
                        });
                    }

                    // Déclencher un événement de postback si nécessaire
                    setTimeout(() => {
                        try {
                            const form = document.querySelector('form');
                            if (form) {
                                form.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        } catch (e) {
                            this.log('⚠️ FORM_ERROR', 'Erreur événement form', {
                                error: e.message,
                                sessionId: this.sessionId
                            });
                        }
                    }, 100);

                } catch (error) {
                    this.log('❌ FINAL_ERROR', 'Erreur validation finale', {
                        error: error.message,
                        sessionId: this.sessionId
                    });
                }
            }, 300);
            
        } else {
            this.showNotification('❌ Aucun tarif trouvé pour cette configuration', 'error');
        }
    }

    // Remplissage d'un tarif spécifique
    fillSingleRate() {
        const selectedSeason = document.getElementById('season-select').value;
        const selectedBrand = document.getElementById('brand-select').value;
        const selectedVehicle = document.getElementById('single-vehicle-select').value;
        
        if (!selectedSeason) {
            this.showNotification('Veuillez sélectionner une saison', 'error');
            return;
        }

        if (!selectedVehicle) {
            this.showNotification('Veuillez sélectionner un véhicule spécifique', 'error');
            return;
        }

        // Obtenir le rate code - priorité à la sélection manuelle
        let rateCode = document.getElementById('rate-code-select')?.value;
        
        if (!rateCode) {
            // Si pas de sélection manuelle, utiliser la logique par défaut
            rateCode = 'AFFA1';
            if (selectedBrand === 'HERTZ') {
                const rateCodeField = document.querySelector('input[name="txtRateCode"]');
                if (rateCodeField && rateCodeField.value) {
                    rateCode = rateCodeField.value;
                }
            } else if (selectedBrand === 'DOLLAR' || selectedBrand === 'THRIFTY') {
                const rateTypeSelect = document.getElementById('rate-type-select');
                if (rateTypeSelect && rateTypeSelect.value) {
                    rateCode = rateTypeSelect.value;
                }
            }
        }

        // Remplir le tarif spécifique
        const modified = this.fillSpecificRateInGrid(selectedSeason, rateCode, selectedVehicle);
        
        if (modified) {
            this.showNotification(`Tarif modifié pour ${selectedVehicle} en saison "${selectedSeason}"!`, 'success');
        } else {
            this.showNotification('Véhicule non trouvé dans le tableau ou tarif non disponible', 'error');
        }
    }

    // Remplir TOUS les tarifs avec mise en évidence (version robuste)
    async fillAllRatesInGridRobust(seasonName, rateCode) {
        this.log('🔍 INJECTION', 'Début injection des tarifs', {
            seasonName,
            rateCode,
            sessionId: this.sessionId,
            isReloading: this.isReloading,
            dataState: {
                hasRates: !!this.data.rates,
                seasonsAvailable: this.data.rates ? Object.keys(this.data.rates) : []
            }
        });

        const seasonRates = this.data.rates[seasonName];
        if (!seasonRates || !seasonRates[rateCode]) {
            this.log('❌ ERROR', 'Aucun tarif trouvé pour la configuration', {
                seasonName,
                rateCode,
                availableSeasons: this.data.rates ? Object.keys(this.data.rates) : [],
                availableRateCodes: seasonRates ? Object.keys(seasonRates) : []
            });
            return 0;
        }

        const rates = seasonRates[rateCode];
        let modifiedCount = 0;
        let attempts = 0;
        const maxAttempts = 5;

        console.log(`🔍 Recherche des lignes du tableau pour ${seasonName} - ${rateCode}`);
        console.log(`📊 Tarifs disponibles (${Object.keys(rates).length}):`, Object.keys(rates));
        
        // Debug: Afficher les tarifs disponibles avec leurs valeurs
        console.log(`💰 Détail des tarifs:`);
        Object.entries(rates).forEach(([vehicle, price]) => {
            console.log(`  ${vehicle}: ${price}€`);
        });

        while (attempts < maxAttempts) {
            attempts++;
            
            // Attendre entre chaque tentative
            if (attempts > 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Essayer plusieurs sélecteurs pour trouver les lignes
            let gridRows = document.querySelectorAll('[id^="uwgDisplayGrid_r_"]');
            
            // Si pas trouvé, essayer d'autres sélecteurs
            if (gridRows.length === 0) {
                gridRows = document.querySelectorAll('tr[id*="uwgDisplayGrid"]');
            }
            
            if (gridRows.length === 0) {
                gridRows = document.querySelectorAll('#uwgDisplayGrid tr');
            }

            console.log(`🔍 Tentative ${attempts}: ${gridRows.length} lignes trouvées`);

            if (gridRows.length === 0) {
                console.log(`⚠️ Aucune ligne trouvée à la tentative ${attempts}`);
                continue;
            }

            let currentAttemptCount = 0;
            const vehiclesFound = [];
            const vehiclesWithRates = [];
            const vehiclesMatched = [];
            const processedCells = new Set(); // Pour éviter de retraiter les cellules déjà modifiées

            for (let index = 0; index < gridRows.length; index++) {
                const row = gridRows[index];
                try {
                    // Plusieurs stratégies pour trouver la cellule Car Type
                    let carTypeCell = row.querySelector('[id$="_2"]');
                    
                    if (!carTypeCell) {
                        // Essayer par position de colonne
                        const cells = row.querySelectorAll('td');
                        if (cells.length > 2) {
                            carTypeCell = cells[2]; // 3ème colonne (index 2)
                        }
                    }

                    if (!carTypeCell) return;

                    const carType = carTypeCell.textContent.trim();
                    vehiclesFound.push(carType);
                    console.log(`🚗 Ligne ${index}: Véhicule "${carType}"`);

                    // Vérifier si on a un tarif pour ce car type
                    if (rates[carType]) {
                        vehiclesWithRates.push(carType);
                        this.log('✅ MATCH', 'Tarif trouvé pour véhicule', {
                            carType,
                            price: rates[carType],
                            seasonName,
                            rateCode,
                            sessionId: this.sessionId,
                            attemptNumber: attempts
                        });
                        
                        // Plusieurs stratégies pour trouver la cellule Rate
                        let rateCell = row.querySelector('[id$="_5"]');
                        
                        if (!rateCell) {
                            // Essayer par position de colonne
                            const cells = row.querySelectorAll('td');
                            if (cells.length > 5) {
                                rateCell = cells[5]; // 6ème colonne (index 5)
                            }
                        }

                        if (rateCell) {
                            // Vérifier si cette cellule a déjà été traitée avec succès
                            const cellKey = `${rateCell.id || 'no-id'}-${carType}`;
                            if (processedCells.has(cellKey)) {
                                this.log('⏭️ SKIP', 'Cellule déjà traitée avec succès', {
                                    carType,
                                    cellId: rateCell.id || 'no-id',
                                    attempts,
                                    sessionId: this.sessionId
                                });
                                continue;
                            }

                            const price = rates[carType];
                            const priceWithZeros = (price * 100).toString();

                            this.log('💰 PRICE', 'Préparation modification', {
                                carType,
                                price,
                                priceWithZeros,
                                attempts,
                                sessionId: this.sessionId
                            });

                            // Approche hybride : modification directe + validation
                            try {
                                this.log('🎯 DIRECT', 'Modification directe de la cellule', {
                                    carType,
                                    price: rates[carType],
                                    priceWithZeros,
                                    cellId: rateCell.id || 'no-id',
                                    sessionId: this.sessionId
                                });

                                // Étape 1: Forcer un changement pour déclencher la sauvegarde Infragistics
                                let textElement = rateCell.querySelector('nobr');
                                if (!textElement) {
                                    textElement = rateCell.querySelector('span');
                                }
                                if (!textElement) {
                                    // Créer un élément nobr si aucun n'existe
                                    textElement = document.createElement('nobr');
                                    rateCell.innerHTML = '';
                                    rateCell.appendChild(textElement);
                                }
                                
                                const oldValue = textElement.textContent || '';
                                const oldUvValue = rateCell.getAttribute('uv') || '';
                                
                                // Stratégie de changement forcé pour déclencher la sauvegarde
                                if (oldValue === priceWithZeros && oldUvValue === priceWithZeros) {
                                    this.log('🔄 FORCE_CHANGE', 'Forçage changement pour cellule identique', {
                                        carType,
                                        oldValue,
                                        targetValue: priceWithZeros,
                                        sessionId: this.sessionId
                                    });
                                    
                                    // Séquence de changement forcé : 0 → vraie valeur
                                    rateCell.setAttribute('uv', '0');
                                    textElement.textContent = '0';
                                    
                                    // Déclencher événements pour le changement vers 0
                                    rateCell.dispatchEvent(new Event('cellvaluechanged', { bubbles: true }));
                                    
                                    // Attendre 50ms puis mettre la vraie valeur
                                    setTimeout(() => {
                                        rateCell.setAttribute('uv', priceWithZeros);
                                        textElement.textContent = priceWithZeros;
                                        
                                        // Déclencher événements pour la vraie valeur
                                        this.triggerInfragisticsValidation(rateCell, carType);
                                        
                                        this.log('✅ FORCED_CHANGE', 'Changement forcé terminé', {
                                            carType,
                                            finalValue: priceWithZeros,
                                            sessionId: this.sessionId
                                        });
                                    }, 50);
                                } else {
                                    // Changement normal
                                    rateCell.setAttribute('uv', priceWithZeros);
                                    textElement.textContent = priceWithZeros;
                                }
                                
                                this.log('📝 DIRECT_SET', 'Valeur mise à jour directement', {
                                    carType,
                                    oldValue,
                                    newValue: priceWithZeros,
                                    price: rates[carType],
                                    needsForcing: oldValue === priceWithZeros,
                                    sessionId: this.sessionId
                                });

                                // Étape 3: Déclencher validation seulement si pas de changement forcé
                                if (oldValue !== priceWithZeros || oldUvValue !== priceWithZeros) {
                                    this.triggerInfragisticsValidation(rateCell, carType);
                                }

                                // Mise en évidence
                                this.highlightCell(rateCell, 'success');
                                currentAttemptCount++;
                                modifiedCount = Math.max(modifiedCount, currentAttemptCount);
                                vehiclesMatched.push(carType);
                                
                                // Marquer cette cellule comme traitée avec succès
                                const cellKey = `${rateCell.id || 'no-id'}-${carType}`;
                                processedCells.add(cellKey);
                                
                                this.log('✅ SUCCESS', 'Cellule modifiée avec succès', {
                                    carType,
                                    sessionId: this.sessionId,
                                    count: currentAttemptCount,
                                    cellKey: cellKey.substring(0, 30)
                                });
                                
                            } catch (cellError) {
                                this.log('❌ CELL_ERROR', 'Erreur modification cellule', {
                                    carType,
                                    error: cellError.message,
                                    sessionId: this.sessionId
                                });
                            }
                        } else {
                            console.log(`❌ Cellule rate non trouvée pour ${carType}`);
                        }
                    } else {
                        console.log(`⚠️ Aucun tarif configuré pour ${carType}`);
                    }
                } catch (error) {
                    this.log('❌ ROW_ERROR', 'Erreur sur la ligne', {
                        index,
                        error: error.message,
                        sessionId: this.sessionId
                    });
                }
                
                // Délai entre chaque modification pour éviter les conflits
                if (index < gridRows.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            }

            console.log(`✅ Tentative ${attempts}: ${currentAttemptCount} tarifs modifiés`);
            
            // Rapport détaillé de la tentative
            console.log(`📊 Rapport tentative ${attempts}:`);
            console.log(`  - Véhicules trouvés dans tableau: ${vehiclesFound.length}`);
            console.log(`  - Véhicules avec tarifs configurés: ${vehiclesWithRates.length} (${vehiclesWithRates.join(', ')})`);
            console.log(`  - Véhicules modifiés: ${vehiclesMatched.length} (${vehiclesMatched.join(', ')})`);
            
            // Identifier les véhicules non trouvés
            const availableVehicles = Object.keys(rates);
            const notFound = availableVehicles.filter(v => !vehiclesFound.includes(v));
            const notMatched = availableVehicles.filter(v => vehiclesFound.includes(v) && !vehiclesMatched.includes(v));
            
            if (notFound.length > 0) {
                console.log(`❌ Véhicules avec tarifs mais non trouvés dans tableau: ${notFound.join(', ')}`);
            }
            if (notMatched.length > 0) {
                console.log(`⚠️ Véhicules trouvés mais non modifiés: ${notMatched.join(', ')}`);
            }

            // Continuer tant qu'on trouve des correspondances et qu'on n'a pas tout traité
            if (vehiclesMatched.length >= availableVehicles.length) {
                this.log('🎉 COMPLETE', 'Tous les tarifs trouvés', {
                    matched: vehiclesMatched.length,
                    total: availableVehicles.length,
                    sessionId: this.sessionId
                });
                break;
            }
            
            // Si on ne progresse plus après 2 tentatives, arrêter
            if (attempts >= 2 && currentAttemptCount === 0) {
                this.log('🔧 STOP', 'Arrêt - Aucun progrès détecté', {
                    attempts,
                    currentAttemptCount,
                    sessionId: this.sessionId
                });
                break;
            }
            
            // Arrêter après 3 tentatives maximum pour éviter les boucles infinies
            if (attempts >= 3) {
                this.log('🛑 LIMIT', 'Arrêt - Limite de tentatives atteinte', {
                    attempts,
                    vehiclesMatched: vehiclesMatched.length,
                    sessionId: this.sessionId
                });
                break;
            }
        }

        console.log(`📊 Résultat final: ${modifiedCount} tarifs modifiés sur ${Object.keys(rates).length} disponibles`);
        return modifiedCount;
    }

    // Fonction de force pour modifier les tarifs restants
    async forceModifyRemainingRates(seasonName, rateCode, alreadyModified) {
        console.log(`🔧 === MODIFICATION FORCÉE DES TARIFS RESTANTS ===`);
        
        const seasonRates = this.data.rates[seasonName];
        if (!seasonRates || !seasonRates[rateCode]) return 0;

        const rates = seasonRates[rateCode];
        const remainingVehicles = Object.keys(rates).filter(v => !alreadyModified.includes(v));
        
        console.log(`🎯 Véhicules restants à modifier (${remainingVehicles.length}):`, remainingVehicles);
        
        let forcedCount = 0;

        // Utiliser une approche directe par ID de cellule
        remainingVehicles.forEach(vehicle => {
            console.log(`🔧 Modification forcée: ${vehicle}`);
            
            // Chercher dans toutes les lignes
            const allRows = document.querySelectorAll('#G_uwgDisplayGrid tbody tr');
            
            for (const row of allRows) {
                const carTypeCell = row.querySelector('td[uv="' + vehicle + '"]');
                
                if (carTypeCell) {
                    console.log(`✅ Trouvé ${vehicle} dans ligne ${row.id}`);
                    
                    // Trouver la cellule Rate dans la même ligne
                    const rowId = row.id;
                    const rowIndex = rowId.split('_').pop();
                    const rateCellId = `uwgDisplayGrid_rc_${rowIndex}_5`;
                    const rateCell = document.getElementById(rateCellId);
                    
                    if (rateCell) {
                        const price = rates[vehicle];
                        const priceWithZeros = (price * 100).toString();
                        
                        console.log(`💰 Modification directe ${vehicle}: ${price}€ → ${priceWithZeros}`);
                        
                        try {
                            // Modification directe
                            rateCell.setAttribute('uv', priceWithZeros);
                            
                            const nobr = rateCell.querySelector('nobr');
                            if (nobr) {
                                nobr.textContent = priceWithZeros;
                            } else {
                                rateCell.innerHTML = `<nobr>${priceWithZeros}</nobr>`;
                            }
                            
                            // Mise en évidence
                            this.highlightCell(rateCell, 'success');
                            forcedCount++;
                            
                            console.log(`✅ ${vehicle} modifié par force`);
                            
                        } catch (error) {
                            console.error(`❌ Erreur modification forcée ${vehicle}:`, error);
                        }
                    } else {
                        console.log(`❌ Cellule rate non trouvée pour ${vehicle} (ID: ${rateCellId})`);
                    }
                    break;
                }
            }
        });
        
        console.log(`🔧 Modification forcée terminée: ${forcedCount}/${remainingVehicles.length}`);
        return forcedCount;
    }

    // Fonction pour forcer la modification directe de tous les tarifs
    async forceModifyAllRatesDirectly() {
        const selectedSeason = document.getElementById('season-select').value;
        const selectedBrand = document.getElementById('brand-select').value;
        
        if (!selectedSeason) {
            this.showNotification('Veuillez sélectionner une saison', 'error');
            return;
        }

        let rateCode = document.getElementById('rate-code-select')?.value;
        if (!rateCode) {
            rateCode = 'AFFA1';
            if (selectedBrand === 'HERTZ') {
                const rateCodeField = document.querySelector('input[name="txtRateCode"]');
                if (rateCodeField && rateCodeField.value) {
                    rateCode = rateCodeField.value;
                }
            }
        }

        this.showNotification('🔥 Modification forcée en cours...', 'info');

        const seasonRates = this.data.rates[selectedSeason];
        if (!seasonRates || !seasonRates[rateCode]) {
            this.showNotification('❌ Aucun tarif trouvé pour cette configuration', 'error');
            return;
        }

        const rates = seasonRates[rateCode];
        let successCount = 0;

        // Modification directe de tous les véhicules
        Object.entries(rates).forEach(([vehicle, price]) => {
            const carTypeCell = document.querySelector(`td[uv="${vehicle}"]`);
            
            if (carTypeCell) {
                const row = carTypeCell.closest('tr');
                if (row) {
                    const rowId = row.id;
                    const rowIndex = rowId.split('_').pop();
                    let rateCell = document.getElementById(`uwgDisplayGrid_rc_${rowIndex}_5`);
                    
                    if (!rateCell) {
                        const cells = row.querySelectorAll('td');
                        if (cells.length > 5) {
                            rateCell = cells[5];
                        }
                    }
                    
                    if (rateCell) {
                        const priceWithZeros = (price * 100).toString();
                        
                        rateCell.setAttribute('uv', priceWithZeros);
                        let nobr = rateCell.querySelector('nobr');
                        if (!nobr) {
                            nobr = document.createElement('nobr');
                            rateCell.innerHTML = '';
                            rateCell.appendChild(nobr);
                        }
                        nobr.textContent = priceWithZeros;
                        
                        this.highlightCell(rateCell, 'success');
                        successCount++;
                    }
                }
            }
        });

        if (successCount > 0) {
            this.showNotification(`🔥 ${successCount} tarifs modifiés par force!`, 'success');
        } else {
            this.showNotification('❌ Aucun tarif n\'a pu être modifié', 'error');
        }
    }

    // Fonction pour configuration rapide (rechargement des données)
    async openQuickConfig() {
        this.showNotification('🔄 Rechargement des données...', 'info');
        
        try {
            await this.reloadDataFromStorage();
            this.showNotification('✅ Données rechargées depuis le gestionnaire!', 'success');
        } catch (error) {
            console.error('Erreur rechargement données:', error);
            this.showNotification('❌ Erreur lors du rechargement des données', 'error');
        }
    }

    // Fonction pour recharger les données depuis le storage
    async reloadDataFromStorage() {
        console.log('🔄 Rechargement des données depuis Chrome Storage...');
        
        return new Promise((resolve) => {
            chrome.storage.local.get([
                'rms_vehicles', 
                'rms_seasons', 
                'rms_rates', 
                'rms_rate_config',
                'rms_coefficients'
            ], (result) => {
                console.log('📦 Données trouvées dans storage:');
                console.log('- Véhicules:', result.rms_vehicles ? result.rms_vehicles.length : 0);
                console.log('- Saisons:', result.rms_seasons ? result.rms_seasons.length : 0);
                console.log('- Tarifs saisons:', result.rms_rates ? Object.keys(result.rms_rates).length : 0);
                console.log('- Config:', result.rms_rate_config ? 'Présente' : 'Absente');
                console.log('- Coefficients:', result.rms_coefficients ? 'Présents' : 'Absents');
                
                // Mettre à jour les données
                if (result.rms_vehicles) this.data.vehicles = result.rms_vehicles;
                if (result.rms_seasons) this.data.seasons = result.rms_seasons;
                if (result.rms_rates) this.data.rates = result.rms_rates;
                if (result.rms_rate_config) this.data.rateConfig = result.rms_rate_config;
                if (result.rms_coefficients) this.data.coefficients = result.rms_coefficients;
                
                // Analyser les tarifs après rechargement
                if (result.rms_rates) {
                    console.log('📊 Analyse des tarifs rechargés:');
                    Object.entries(result.rms_rates).forEach(([season, rateCodes]) => {
                        console.log(`  ${season}:`);
                        Object.entries(rateCodes).forEach(([rateCode, vehicles]) => {
                            console.log(`    ${rateCode}: ${Object.keys(vehicles).length} véhicules`);
                        });
                    });
                }
                
                // Recharger l'interface
                this.loadDefaultData();
                
                resolve();
            });
        });
    }

    // Ancienne fonction gardée pour compatibilité
    fillAllRatesInGrid(seasonName, rateCode) {
        return this.fillAllRatesInGridRobust(seasonName, rateCode);
    }

    // Fonction de diagnostic pour analyser le tableau
    analyzeRatesTable() {
        console.log('🔍 === ANALYSE DU TABLEAU DE TARIFS ===');
        
        // Vérifier les problèmes CSP
        this.checkCSPIssues();
        
        // Essayer différents sélecteurs
        const selectors = [
            '[id^="uwgDisplayGrid_r_"]',
            'tr[id*="uwgDisplayGrid"]',
            '#uwgDisplayGrid tr',
            'table tr'
        ];
        
        selectors.forEach((selector, index) => {
            const rows = document.querySelectorAll(selector);
            console.log(`Sélecteur ${index + 1} (${selector}): ${rows.length} lignes`);
            
            if (rows.length > 0 && index === 0) {
                console.log('📊 Analyse des premières lignes:');
                rows.forEach((row, rowIndex) => {
                    if (rowIndex < 5) { // Analyser seulement les 5 premières lignes
                        const cells = row.querySelectorAll('td');
                        console.log(`  Ligne ${rowIndex}: ${cells.length} cellules`);
                        
                        if (cells.length > 2) {
                            const carTypeCell = cells[2];
                            const carType = carTypeCell ? carTypeCell.textContent.trim() : 'N/A';
                            console.log(`    - Car Type (col 2): "${carType}"`);
                        }
                        
                        if (cells.length > 5) {
                            const rateCell = cells[5];
                            const currentRate = rateCell ? rateCell.textContent.trim() : 'N/A';
                            console.log(`    - Rate (col 5): "${currentRate}"`);
                        }
                    }
                });
            }
        });
        
        // Analyser les données de tarifs disponibles
        const selectedSeason = document.getElementById('season-select')?.value;
        const selectedBrand = document.getElementById('brand-select')?.value;
        const selectedRateCode = document.getElementById('rate-code-select')?.value;
        
        console.log(`🎯 Configuration actuelle:`);
        console.log(`  Saison: ${selectedSeason || 'Non sélectionnée'}`);
        console.log(`  Marque: ${selectedBrand || 'Non sélectionnée'}`);
        console.log(`  Rate Code: ${selectedRateCode || 'Auto'}`);
        
        if (selectedSeason && this.data.rates && this.data.rates[selectedSeason]) {
            console.log(`📈 Tarifs disponibles pour "${selectedSeason}":`);
            Object.entries(this.data.rates[selectedSeason]).forEach(([rateCode, vehicles]) => {
                const isCurrentRate = rateCode === selectedRateCode || (!selectedRateCode && rateCode === 'AFFA1');
                const marker = isCurrentRate ? '👉' : '  ';
                console.log(`${marker} ${rateCode}: ${Object.keys(vehicles).length} véhicules`);
                if (isCurrentRate) {
                    console.log(`    Véhicules: ${Object.keys(vehicles).join(', ')}`);
                    console.log(`    Exemples de tarifs: ${Object.entries(vehicles).slice(0, 3).map(([v, p]) => `${v}=${p}€`).join(', ')}`);
                }
            });
        }
        
        console.log('🔍 === FIN ANALYSE ===');
    }

    // Fonction de diagnostic CSP
    checkCSPIssues() {
        console.log('🛡️ === DIAGNOSTIC CSP ===');
        
        // Vérifier les meta CSP
        const cspMetas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
        if (cspMetas.length > 0) {
            console.log('🔒 Politiques CSP détectées:');
            cspMetas.forEach((meta, index) => {
                console.log(`  ${index + 1}. ${meta.content}`);
            });
        } else {
            console.log('ℹ️ Aucune meta CSP trouvée dans le HTML');
        }
        
        // Vérifier les en-têtes CSP via les erreurs de console
        console.log('⚠️ Vérifiez la console pour les erreurs CSP comme:');
        console.log('   "Refused to send form data" ou "form-action \'none\'"');
        
        // Tester la soumission de formulaire
        const forms = document.querySelectorAll('form');
        console.log(`📋 ${forms.length} formulaires trouvés sur la page`);
        
        forms.forEach((form, index) => {
            console.log(`  Formulaire ${index + 1}:`);
            console.log(`    - Action: ${form.action || 'Non définie'}`);
            console.log(`    - Méthode: ${form.method || 'GET'}`);
            console.log(`    - ID: ${form.id || 'Non défini'}`);
        });
        
        // Recommandations
        console.log('💡 Recommandations pour éviter les problèmes CSP:');
        console.log('   1. Utilisez le bouton Retrieve original de la page');
        console.log('   2. Évitez les soumissions automatiques de formulaires');
        console.log('   3. Privilégiez la modification des champs sans soumission');
        
        console.log('🛡️ === FIN DIAGNOSTIC CSP ===');
    }

    // Remplir un tarif spécifique
    fillSpecificRateInGrid(seasonName, rateCode, targetVehicle) {
        const seasonRates = this.data.rates[seasonName];
        if (!seasonRates || !seasonRates[rateCode] || !seasonRates[rateCode][targetVehicle]) {
            return false;
        }

        const price = seasonRates[rateCode][targetVehicle];
        const priceWithZeros = (price * 100).toString();
        
        // Trouver la ligne correspondant au véhicule
        const gridRows = document.querySelectorAll('[id^="uwgDisplayGrid_r_"]');
        
        for (const row of gridRows) {
            const carTypeCell = row.querySelector('[id$="_2"]');
            if (!carTypeCell) continue;

            const carType = carTypeCell.textContent.trim();
            
            if (carType === targetVehicle) {
                const rateCell = row.querySelector('[id$="_5"]');
                if (rateCell) {
                    // Mettre à jour la cellule
                    rateCell.setAttribute('uv', priceWithZeros);
                    const nobr = rateCell.querySelector('nobr');
                    if (nobr) {
                        nobr.textContent = priceWithZeros;
                    }
                    
                    // Mise en évidence
                    this.highlightCell(rateCell, 'success');
                    return true;
                }
            }
        }
        
        return false;
    }

    // Fonction pour mettre en évidence les cellules modifiées
    highlightCell(cell, type = 'success') {
        const colors = {
            success: '#d1fae5',
            warning: '#fef3c7',
            info: '#dbeafe'
        };
        
        const originalBackground = cell.style.backgroundColor;
        cell.style.backgroundColor = colors[type] || colors.success;
        cell.style.transition = 'background-color 0.3s ease';
        
        // Retirer la mise en évidence après 3 secondes
        setTimeout(() => {
            cell.style.backgroundColor = originalBackground;
        }, 3000);
    }

    // Mise à jour des informations ACRISS (basé sur votre ancien code)
    updateAcrissInfo() {
        const acrissElements = document.querySelectorAll('td[uv]');
        let updatedCount = 0;

        acrissElements.forEach(element => {
            const acrissCode = element.innerText.trim();
            const vehicle = this.data.vehicles.find(v => v.sipp === acrissCode);
            
            if (vehicle) {
                element.innerHTML = `${acrissCode} - ${vehicle.categorie} (${vehicle.make_model})`;
                updatedCount++;
            }
        });

        // Ajuster la largeur de la colonne Car Type
        const carTypeColumnHeader = document.querySelector('#uwgDisplayGrid_c_0_2');
        if (carTypeColumnHeader) {
            carTypeColumnHeader.style.width = '319px';
            carTypeColumnHeader.style.cursor = 'w-resize';
        }

        this.showNotification(`${updatedCount} codes ACRISS mis à jour!`, 'success');
    }

    // Ouverture des paramètres
    openSettings() {
        // Créer une interface de paramètres
        this.createSettingsModal();
    }

    createSettingsModal() {
        // Supprimer le modal existant s'il y en a un
        const existingModal = document.getElementById('rms-settings-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'rms-settings-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 20000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 24px;
                width: 90%;
                max-width: 600px;
                max-height: 80%;
                overflow-y: auto;
                box-shadow: 0 16px 64px rgba(0, 0, 0, 0.2);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #2d3748;">⚙️ Paramètres RMS Helper</h2>
                    <button id="close-settings" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #4a5568; margin-bottom: 10px;">📋 Données chargées</h3>
                    <div id="data-status" style="font-size: 14px; line-height: 1.6;"></div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #4a5568; margin-bottom: 10px;">🔄 Actions</h3>
                    <button id="reload-data" class="rms-btn rms-btn-primary" style="margin-right: 10px;">
                        Recharger données
                    </button>
                    <button id="export-config" class="rms-btn rms-btn-secondary">
                        Exporter config
                    </button>
                    <button id="export-logs" class="rms-btn rms-btn-info" style="margin-left: 10px;">
                        📊 Export Logs
                    </button>
                    <button id="force-validation" class="rms-btn rms-btn-warning" style="margin-left: 10px;">
                        🔄 Forcer Validation
                    </button>
                    <button id="clear-logs" class="rms-btn" style="margin-left: 10px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white;">
                        🗑️ Vider Logs
                    </button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #4a5568; margin-bottom: 10px;">ℹ️ Informations</h3>
                    <p style="font-size: 14px; color: #666; line-height: 1.6;">
                        Version: 2.0<br>
                        Utilisez l'icône de l'extension pour charger vos fichiers JSON personnalisés.
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Afficher le statut des données
        this.updateDataStatus();

        // Événements
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'close-settings') {
                modal.remove();
            }
            if (e.target.id === 'reload-data') {
                this.loadStoredData().then(() => {
                    this.loadDefaultData();
                    this.updateDataStatus();
                    this.showNotification('Données rechargées!', 'success');
                });
            }
            if (e.target.id === 'export-config') {
                this.exportConfiguration();
            }
            if (e.target.id === 'export-logs') {
                this.exportLogs();
            }
            if (e.target.id === 'force-validation') {
                this.forceManualValidation();
            }
            if (e.target.id === 'clear-logs') {
                this.clearAllLogs();
            }
        });
    }

    updateDataStatus() {
        const statusDiv = document.getElementById('data-status');
        if (!statusDiv) return;

        const status = [
            `🚗 Véhicules: ${this.data.vehicles ? this.data.vehicles.length + ' entrées' : 'Non chargé'}`,
            `📅 Saisons: ${this.data.seasons ? this.data.seasons.length + ' saisons' : 'Non chargé'}`,
            `💰 Tarifs: ${this.data.rates ? Object.keys(this.data.rates).length + ' saisons tarifaires' : 'Non chargé'}`,
            `⚙️ Config: ${this.data.rateConfig ? 'Chargée' : 'Non chargée'}`
        ];

        statusDiv.innerHTML = status.join('<br>');
    }

    exportConfiguration() {
        const config = {
            vehicles: this.data.vehicles,
            seasons: this.data.seasons,
            rates: this.data.rates,
            rateConfig: this.data.rateConfig,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rms-helper-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Configuration exportée!', 'success');
    }

    // Système de notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 25000;
            animation: slideDown 0.3s ease-out;
        `;

        const styles = {
            success: 'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;',
            error: 'background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;',
            info: 'background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd;'
        };

        notification.style.cssText += styles[type] || styles.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Fonction pour déclencher la validation Infragistics après modification directe
    triggerInfragisticsValidation(rateCell, carType) {
        try {
            this.log('🔄 VALIDATION', 'Début validation Infragistics', {
                carType,
                cellId: rateCell.id || 'no-id',
                sessionId: this.sessionId
            });

            // Événements de modification sur la cellule
            rateCell.dispatchEvent(new Event('input', { bubbles: true }));
            rateCell.dispatchEvent(new Event('change', { bubbles: true }));
            rateCell.dispatchEvent(new Event('blur', { bubbles: true }));
            
            // Événements Infragistics spécifiques
            rateCell.dispatchEvent(new CustomEvent('cellvaluechanged', { 
                bubbles: true,
                detail: { newValue: rateCell.getAttribute('uv') }
            }));
            
            // Événements sur la grille pour forcer la mise à jour
            const grid = document.getElementById('uwgDisplayGrid');
            if (grid) {
                grid.dispatchEvent(new CustomEvent('cellchange', { bubbles: true }));
                grid.dispatchEvent(new CustomEvent('aftercellupdate', { bubbles: true }));
            }

            // Événements clavier sur la cellule
            rateCell.dispatchEvent(new KeyboardEvent('keydown', { 
                key: 'Enter', 
                keyCode: 13, 
                which: 13,
                bubbles: true 
            }));
            
            rateCell.dispatchEvent(new KeyboardEvent('keyup', { 
                key: 'Enter', 
                keyCode: 13, 
                which: 13,
                bubbles: true 
            }));

            // Validation finale : clic sur header pour forcer la sauvegarde
            setTimeout(() => {
                try {
                    const gridHeader = document.querySelector('#uwgDisplayGrid_hdiv');
                    if (gridHeader) {
                        gridHeader.click();
                        this.log('🔄 HEADER_CLICK', 'Clic header pour validation finale', {
                            carType,
                            sessionId: this.sessionId
                        });
                    }
                } catch (e) {
                    this.log('⚠️ HEADER_ERROR', 'Erreur clic header', {
                        carType,
                        error: e.message,
                        sessionId: this.sessionId
                    });
                }
            }, 50);
            
            this.log('✅ VALIDATION_OK', 'Événements de validation déclenchés', {
                carType,
                sessionId: this.sessionId
            });
            
        } catch (error) {
            this.log('❌ VALIDATION_ERROR', 'Erreur lors de la validation', {
                carType,
                error: error.message,
                sessionId: this.sessionId
            });
        }
    }
}

// Initialisation
if (window.location.href.includes('rmsweb.prod.rms.hertz.io/RateManagement/RateEntry.aspx')) {
    // Attendre que la page soit complètement chargée
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new RMSHelper();
        });
    } else {
        new RMSHelper();
    }
}

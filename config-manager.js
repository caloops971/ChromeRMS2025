// Gestionnaire de configuration RMS Helper
class ConfigManager {
    constructor() {
        this.data = {
            vehicles: [],
            seasons: [],
            rates: {},
            rateConfig: {},
            coefficients: {}
        };
        this.currentEditItem = null;
        this.currentEditType = null;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadAllData();
        this.updateOverview();
        this.renderAllTables();
    }
    
    setupEventListeners() {
        // Gestion des onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Boutons d'ajout
        document.getElementById('add-rate-btn').addEventListener('click', () => this.showAddRateModal());
        document.getElementById('add-vehicle-btn').addEventListener('click', () => this.showAddVehicleModal());
        document.getElementById('add-season-btn').addEventListener('click', () => this.showAddSeasonModal());
        
        // Boutons d'export
        document.getElementById('export-rates-btn').addEventListener('click', () => this.exportRates());
        document.getElementById('export-vehicles-btn').addEventListener('click', () => this.exportVehicles());
        document.getElementById('export-seasons-btn').addEventListener('click', () => this.exportSeasons());
        
        // Boutons de chargement de données
        document.getElementById('load-default-data-btn').addEventListener('click', () => this.loadAndSaveDefaultData());
        document.getElementById('refresh-all-btn').addEventListener('click', () => this.refreshAllData());
        
        // Boutons de la grille de tarifs
        document.getElementById('grid-rate-code-select').addEventListener('change', (e) => this.renderRatesGrid(e.target.value));
        document.getElementById('save-grid-btn').addEventListener('click', () => this.saveRatesGrid());
        document.getElementById('reset-grid-btn').addEventListener('click', () => this.resetRatesGrid());
        document.getElementById('export-grid-btn').addEventListener('click', () => this.exportRatesGridCSV());
        
        // Boutons de suggestions
        document.getElementById('close-suggestions').addEventListener('click', () => this.hideSuggestions());
        document.getElementById('apply-all-suggestions').addEventListener('click', () => this.applyAllSuggestions());
        document.getElementById('apply-selected-suggestions').addEventListener('click', () => this.applySelectedSuggestions());
        
        // Boutons de l'onglet coefficients
        document.getElementById('add-coefficient-btn').addEventListener('click', () => this.addNewCoefficient());
        document.getElementById('save-coefficients-btn').addEventListener('click', () => this.saveCoefficients());
        document.getElementById('export-coefficients-btn').addEventListener('click', () => this.exportCoefficients());
        document.getElementById('reset-coefficients-btn').addEventListener('click', () => this.resetCoefficients());
        document.getElementById('calculate-preview-btn').addEventListener('click', () => this.calculatePreview());
        
        // Recherche
        const ratesSearch = document.getElementById('rates-search');
        if (ratesSearch) {
            ratesSearch.addEventListener('input', (e) => {
                console.log('🔍 Recherche tarifs:', e.target.value);
                this.filterRates(e.target.value);
            });
        } else {
            console.error('❌ Element rates-search non trouvé');
        }
        
        const vehiclesSearch = document.getElementById('vehicles-search');
        if (vehiclesSearch) {
            vehiclesSearch.addEventListener('input', (e) => {
                console.log('🔍 Recherche véhicules:', e.target.value);
                this.filterVehicles(e.target.value);
            });
        } else {
            console.error('❌ Element vehicles-search non trouvé');
        }
        
        const seasonsSearch = document.getElementById('seasons-search');
        if (seasonsSearch) {
            seasonsSearch.addEventListener('input', (e) => {
                console.log('🔍 Recherche saisons:', e.target.value);
                this.filterSeasons(e.target.value);
            });
        } else {
            console.error('❌ Element seasons-search non trouvé');
        }
        
        // Filtre par saison
        const seasonFilter = document.getElementById('season-filter');
        if (seasonFilter) {
            seasonFilter.addEventListener('change', (e) => {
                console.log('🔍 Filtre saison:', e.target.value);
                this.filterRatesBySeason(e.target.value);
            });
        } else {
            console.error('❌ Element season-filter non trouvé');
        }
        
        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('save-btn').addEventListener('click', () => this.saveCurrentEdit());
        
        // Fermer modal en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }
    
    async loadAllData() {
        return new Promise((resolve) => {
            chrome.storage.local.get([
                'rms_vehicles', 
                'rms_seasons', 
                'rms_rates', 
                'rms_rate_config',
                'rms_coefficients'
            ], async (result) => {
                // Si les données ne sont pas en storage, charger les données par défaut
                this.data.vehicles = result.rms_vehicles || await this.loadDefaultVehicles();
                this.data.seasons = result.rms_seasons || await this.loadDefaultSeasons();
                this.data.rates = result.rms_rates || await this.loadDefaultRates();
                this.data.rateConfig = result.rms_rate_config || await this.loadDefaultRateConfig();
                this.data.coefficients = result.rms_coefficients || await this.loadDefaultCoefficients();
                
                // Sauvegarder les données par défaut si elles ont été chargées
                if (!result.rms_vehicles && this.data.vehicles.length > 0) {
                    await this.saveData('rms_vehicles', this.data.vehicles);
                }
                if (!result.rms_seasons && this.data.seasons.length > 0) {
                    await this.saveData('rms_seasons', this.data.seasons);
                }
                if (!result.rms_rates && Object.keys(this.data.rates).length > 0) {
                    await this.saveData('rms_rates', this.data.rates);
                }
                if (!result.rms_rate_config && Object.keys(this.data.rateConfig).length > 0) {
                    await this.saveData('rms_rate_config', this.data.rateConfig);
                }
                if (!result.rms_coefficients && Object.keys(this.data.coefficients).length > 0) {
                    await this.saveData('rms_coefficients', this.data.coefficients);
                }
                
                resolve();
            });
        });
    }
    
    switchTab(tabName) {
        // Mettre à jour les onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Recharger les données si nécessaire
        if (tabName === 'rates') {
            this.renderRatesTable();
            this.populateSeasonFilter();
        } else if (tabName === 'rates-grid') {
            this.populateGridRateCodeSelect();
            this.renderRatesGrid();
        } else if (tabName === 'coefficients') {
            this.renderCoefficientsTab();
        } else if (tabName === 'vehicles') {
            this.renderVehiclesTable();
        } else if (tabName === 'seasons') {
            this.renderSeasonsTable();
        } else if (tabName === 'settings') {
            this.renderConfigTable();
        }
    }
    
    updateOverview() {
        // Compter les éléments
        const vehicleCount = this.data.vehicles.length;
        const seasonCount = this.data.seasons.length;
        const rateCount = this.countTotalRates();
        const brandCount = this.data.rateConfig.pickup_locations ? 
            [...new Set(this.data.rateConfig.pickup_locations.map(p => p.brand))].length : 0;
        
        document.getElementById('vehicles-count').textContent = vehicleCount;
        document.getElementById('seasons-count').textContent = seasonCount;
        document.getElementById('rates-count').textContent = rateCount;
        document.getElementById('brands-count').textContent = brandCount;
        
        // Mettre à jour le tableau d'état
        this.renderDataStatusTable();
    }
    
    countTotalRates() {
        let total = 0;
        Object.values(this.data.rates).forEach(season => {
            Object.values(season).forEach(rateCode => {
                total += Object.keys(rateCode).length;
            });
        });
        return total;
    }
    
    renderDataStatusTable() {
        const tbody = document.getElementById('data-status-table');
        const dataTypes = [
            { name: 'Véhicules', key: 'vehicles', icon: '🚗' },
            { name: 'Saisons', key: 'seasons', icon: '📅' },
            { name: 'Tarifs', key: 'rates', icon: '💰' },
            { name: 'Configuration', key: 'rateConfig', icon: '⚙️' }
        ];
        
        tbody.innerHTML = '';
        
        dataTypes.forEach(type => {
            const row = document.createElement('tr');
            const data = this.data[type.key];
            const hasData = Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0;
            const status = hasData ? 'loaded' : 'missing';
            const statusText = hasData ? 'Chargé' : 'Manquant';
            
            row.innerHTML = `
                <td>${type.icon} ${type.name}</td>
                <td>
                    <span class="status-indicator status-${status}"></span>
                    ${statusText}
                </td>
                <td>${hasData ? 'Récemment' : 'Jamais'}</td>
                <td>
                    <button class="btn btn-secondary" data-action="refresh" data-type="${type.key}">
                        🔄 Actualiser
                    </button>
                </td>
            `;
            
            // Ajouter l'event listener pour le bouton
            const refreshBtn = row.querySelector('[data-action="refresh"]');
            refreshBtn.addEventListener('click', () => this.refreshData(type.key));
            
            tbody.appendChild(row);
        });
    }
    
    renderRatesTable() {
        const tbody = document.getElementById('rates-table');
        tbody.innerHTML = '';
        
        Object.entries(this.data.rates).forEach(([season, rateCodes]) => {
            Object.entries(rateCodes).forEach(([rateCode, vehicles]) => {
                Object.entries(vehicles).forEach(([sipp, price]) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${season}</td>
                        <td>${rateCode}</td>
                        <td>${sipp}</td>
                        <td>${price}€</td>
                        <td>
                            <button class="btn btn-primary" data-action="edit-rate" data-season="${season}" data-rate-code="${rateCode}" data-sipp="${sipp}" data-price="${price}">
                                ✏️ Éditer
                            </button>
                            <button class="btn btn-danger" data-action="delete-rate" data-season="${season}" data-rate-code="${rateCode}" data-sipp="${sipp}">
                                🗑️ Supprimer
                            </button>
                        </td>
                    `;
                    
                    // Ajouter les event listeners
                    const editBtn = row.querySelector('[data-action="edit-rate"]');
                    const deleteBtn = row.querySelector('[data-action="delete-rate"]');
                    
                    editBtn.addEventListener('click', () => this.editRate(season, rateCode, sipp, price));
                    deleteBtn.addEventListener('click', () => this.deleteRate(season, rateCode, sipp));
                    tbody.appendChild(row);
                });
            });
        });
    }
    
    renderVehiclesTable() {
        const tbody = document.getElementById('vehicles-table');
        tbody.innerHTML = '';
        
        this.data.vehicles.forEach((vehicle, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${vehicle.sipp}</strong></td>
                <td>${vehicle.make_model}</td>
                <td>${vehicle.categorie}</td>
                <td>${vehicle.NumberOfAdults}</td>
                <td>${vehicle.MinOfDoors}-${vehicle.MaxOfDoors}</td>
                <td>G:${vehicle.LargeSuitcases} P:${vehicle.SmallSuitcases}</td>
                <td>
                    <button class="btn btn-primary" data-action="edit-vehicle" data-index="${index}">
                        ✏️ Éditer
                    </button>
                    <button class="btn btn-danger" data-action="delete-vehicle" data-index="${index}">
                        🗑️ Supprimer
                    </button>
                </td>
            `;
            
            // Ajouter les event listeners
            const editBtn = row.querySelector('[data-action="edit-vehicle"]');
            const deleteBtn = row.querySelector('[data-action="delete-vehicle"]');
            
            editBtn.addEventListener('click', () => this.editVehicle(index));
            deleteBtn.addEventListener('click', () => this.deleteVehicle(index));
            tbody.appendChild(row);
        });
    }
    
    renderSeasonsTable() {
        const tbody = document.getElementById('seasons-table');
        tbody.innerHTML = '';
        
        this.data.seasons.forEach((season, index) => {
            const ranges = season.ranges || [];
            const firstRange = ranges[0];
            const lastRange = ranges[ranges.length - 1];
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${season.saison}</strong></td>
                <td>${ranges.length}</td>
                <td>${firstRange ? this.formatDate(firstRange.start) : '-'}</td>
                <td>${lastRange ? this.formatDate(lastRange.end) : '-'}</td>
                <td>
                    <button class="btn btn-primary" data-action="edit-season" data-index="${index}">
                        ✏️ Éditer
                    </button>
                    <button class="btn btn-danger" data-action="delete-season" data-index="${index}">
                        🗑️ Supprimer
                    </button>
                </td>
            `;
            
            // Ajouter les event listeners
            const editBtn = row.querySelector('[data-action="edit-season"]');
            const deleteBtn = row.querySelector('[data-action="delete-season"]');
            
            editBtn.addEventListener('click', () => this.editSeason(index));
            deleteBtn.addEventListener('click', () => this.deleteSeason(index));
            tbody.appendChild(row);
        });
    }
    
    renderConfigTable() {
        const tbody = document.getElementById('config-table');
        tbody.innerHTML = '';
        
        if (this.data.rateConfig.pickup_locations) {
            this.data.rateConfig.pickup_locations.forEach((location, index) => {
                const rates = location.rates || [];
                const rateCodes = rates.map(r => `${r.rate_code} (${r.plan_code})`).join(', ');
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${location.brand}</strong></td>
                    <td>${location.pickup_location_level_name}</td>
                    <td>${rateCodes}</td>
                    <td>
                        <button class="btn btn-primary" data-action="edit-config" data-index="${index}">
                            ✏️ Éditer
                        </button>
                    </td>
                `;
                
                // Ajouter l'event listener
                const editBtn = row.querySelector('[data-action="edit-config"]');
                editBtn.addEventListener('click', () => this.editConfig(index));
                tbody.appendChild(row);
            });
        }
    }
    
    populateSeasonFilter() {
        const select = document.getElementById('season-filter');
        select.innerHTML = '<option value="">Toutes les saisons</option>';
        
        Object.keys(this.data.rates).forEach(season => {
            const option = document.createElement('option');
            option.value = season;
            option.textContent = season;
            select.appendChild(option);
        });
    }
    
    // Fonctions d'édition
    editRate(season, rateCode, sipp, price) {
        this.currentEditType = 'rate';
        this.currentEditItem = { season, rateCode, sipp, price };
        
        document.getElementById('modal-title').textContent = 'Éditer Tarif';
        document.getElementById('modal-body').innerHTML = `
            <div class="form-group">
                <label>Saison</label>
                <input type="text" id="edit-season" value="${season}" readonly>
            </div>
            <div class="form-group">
                <label>Rate Code</label>
                <input type="text" id="edit-rate-code" value="${rateCode}" readonly>
            </div>
            <div class="form-group">
                <label>Véhicule (SIPP)</label>
                <input type="text" id="edit-sipp" value="${sipp}" readonly>
            </div>
            <div class="form-group">
                <label>Tarif (€)</label>
                <input type="number" id="edit-price" value="${price}" step="0.01" min="0">
            </div>
        `;
        
        this.showModal();
    }
    
    editVehicle(index) {
        const vehicle = this.data.vehicles[index];
        this.currentEditType = 'vehicle';
        this.currentEditItem = { index, ...vehicle };
        
        document.getElementById('modal-title').textContent = 'Éditer Véhicule';
        document.getElementById('modal-body').innerHTML = `
            <div class="form-group">
                <label>Code SIPP</label>
                <input type="text" id="edit-sipp" value="${vehicle.sipp}">
            </div>
            <div class="form-group">
                <label>Marque/Modèle</label>
                <input type="text" id="edit-make-model" value="${vehicle.make_model}">
            </div>
            <div class="form-group">
                <label>Catégorie</label>
                <input type="text" id="edit-categorie" value="${vehicle.categorie}">
            </div>
            <div class="form-group">
                <label>Nombre d'adultes</label>
                <input type="number" id="edit-adults" value="${vehicle.NumberOfAdults}" min="1" max="10">
            </div>
            <div class="form-group">
                <label>Nombre d'enfants</label>
                <input type="number" id="edit-children" value="${vehicle.NumberOfChildren}" min="0" max="10">
            </div>
            <div class="form-group">
                <label>Portes minimum</label>
                <input type="number" id="edit-min-doors" value="${vehicle.MinOfDoors}" min="2" max="5">
            </div>
            <div class="form-group">
                <label>Portes maximum</label>
                <input type="number" id="edit-max-doors" value="${vehicle.MaxOfDoors}" min="2" max="5">
            </div>
            <div class="form-group">
                <label>Grandes valises</label>
                <input type="number" id="edit-large-suitcases" value="${vehicle.LargeSuitcases}" min="0" max="10">
            </div>
            <div class="form-group">
                <label>Petites valises</label>
                <input type="number" id="edit-small-suitcases" value="${vehicle.SmallSuitcases}" min="0" max="10">
            </div>
        `;
        
        this.showModal();
    }
    
    editSeason(index) {
        const season = this.data.seasons[index];
        this.currentEditType = 'season';
        this.currentEditItem = { index, ...season };
        
        const rangesHtml = season.ranges.map((range, i) => `
            <div class="form-group" style="display: flex; gap: 8px; align-items: end;">
                <div style="flex: 1;">
                    <label>Début ${i + 1}</label>
                    <input type="date" class="range-start" value="${range.start}">
                </div>
                <div style="flex: 1;">
                    <label>Fin ${i + 1}</label>
                    <input type="date" class="range-end" value="${range.end}">
                </div>
                <button type="button" class="btn btn-danger range-remove-btn">🗑️</button>
            </div>
        `).join('');
        
        document.getElementById('modal-title').textContent = 'Éditer Saison';
        document.getElementById('modal-body').innerHTML = `
            <div class="form-group">
                <label>Nom de la saison</label>
                <input type="text" id="edit-season-name" value="${season.saison}">
            </div>
            <div class="form-group">
                <label>Périodes</label>
                <div id="ranges-container">
                    ${rangesHtml}
                </div>
                <button type="button" class="btn btn-secondary" id="add-range-btn">➕ Ajouter période</button>
            </div>
        `;
        
        // Ajouter les event listeners après avoir inséré le HTML
        this.setupRangeEventListeners();
        
        this.showModal();
    }
    
    editConfig(index) {
        const location = this.data.rateConfig.pickup_locations[index];
        this.currentEditType = 'config';
        this.currentEditItem = { index, ...location };
        
        document.getElementById('modal-title').textContent = 'Éditer Configuration';
        document.getElementById('modal-body').innerHTML = `
            <div class="form-group">
                <label>Marque</label>
                <select id="edit-brand">
                    <option value="HERTZ" ${location.brand === 'HERTZ' ? 'selected' : ''}>HERTZ</option>
                    <option value="DOLLAR" ${location.brand === 'DOLLAR' ? 'selected' : ''}>DOLLAR</option>
                    <option value="THRIFTY" ${location.brand === 'THRIFTY' ? 'selected' : ''}>THRIFTY</option>
                </select>
            </div>
            <div class="form-group">
                <label>Pickup Location Level Name</label>
                <input type="text" id="edit-pickup-location" value="${location.pickup_location_level_name}">
            </div>
            <div class="form-group">
                <label>Rate Codes (JSON)</label>
                <textarea id="edit-rates" placeholder='[{"rate_code": "AFFA1", "type": "Fixed", "plan_code": "D"}]'>${JSON.stringify(location.rates, null, 2)}</textarea>
            </div>
        `;
        
        this.showModal();
    }
    
    addRangeInput() {
        const container = document.getElementById('ranges-container');
        const rangeCount = container.children.length + 1;
        
        const rangeDiv = document.createElement('div');
        rangeDiv.className = 'form-group';
        rangeDiv.style.cssText = 'display: flex; gap: 8px; align-items: end;';
        rangeDiv.innerHTML = `
            <div style="flex: 1;">
                <label>Début ${rangeCount}</label>
                <input type="date" class="range-start" value="">
            </div>
            <div style="flex: 1;">
                <label>Fin ${rangeCount}</label>
                <input type="date" class="range-end" value="">
            </div>
            <button type="button" class="btn btn-danger range-remove-btn">🗑️</button>
        `;
        
        // Ajouter event listener pour le bouton de suppression
        const removeBtn = rangeDiv.querySelector('.range-remove-btn');
        removeBtn.addEventListener('click', () => rangeDiv.remove());
        
        container.appendChild(rangeDiv);
    }
    
    setupRangeEventListeners() {
        // Event listener pour le bouton d'ajout de période
        const addBtn = document.getElementById('add-range-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addRangeInput());
        }
        
        // Event listeners pour tous les boutons de suppression existants
        const removeButtons = document.querySelectorAll('.range-remove-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.form-group').remove();
            });
        });
    }
    
    // Fonctions de sauvegarde
    async saveCurrentEdit() {
        if (!this.currentEditType || !this.currentEditItem) return;
        
        try {
            if (this.currentEditType === 'rate') {
                await this.saveRateEdit();
            } else if (this.currentEditType === 'vehicle') {
                await this.saveVehicleEdit();
            } else if (this.currentEditType === 'season') {
                await this.saveSeasonEdit();
            } else if (this.currentEditType === 'config') {
                await this.saveConfigEdit();
            }
            
            this.closeModal();
            await this.loadAllData();
            this.updateOverview();
            this.renderAllTables();
            this.showNotification('Modifications sauvegardées avec succès!', 'success');
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    async saveRateEdit() {
        const price = parseFloat(document.getElementById('edit-price').value);
        const { season, rateCode, sipp } = this.currentEditItem;
        
        if (!this.data.rates[season]) this.data.rates[season] = {};
        if (!this.data.rates[season][rateCode]) this.data.rates[season][rateCode] = {};
        
        this.data.rates[season][rateCode][sipp] = price;
        
        await this.saveData('rms_rates', this.data.rates);
    }
    
    async saveVehicleEdit() {
        const vehicle = {
            sipp: document.getElementById('edit-sipp').value,
            make_model: document.getElementById('edit-make-model').value,
            categorie: document.getElementById('edit-categorie').value,
            NumberOfAdults: parseInt(document.getElementById('edit-adults').value),
            NumberOfChildren: parseInt(document.getElementById('edit-children').value),
            MinOfDoors: parseInt(document.getElementById('edit-min-doors').value),
            MaxOfDoors: parseInt(document.getElementById('edit-max-doors').value),
            LargeSuitcases: parseInt(document.getElementById('edit-large-suitcases').value),
            SmallSuitcases: parseInt(document.getElementById('edit-small-suitcases').value)
        };
        
        this.data.vehicles[this.currentEditItem.index] = vehicle;
        await this.saveData('rms_vehicles', this.data.vehicles);
    }
    
    async saveSeasonEdit() {
        const seasonName = document.getElementById('edit-season-name').value;
        const rangeInputs = document.querySelectorAll('#ranges-container .form-group');
        const ranges = [];
        
        rangeInputs.forEach(rangeDiv => {
            const start = rangeDiv.querySelector('.range-start').value;
            const end = rangeDiv.querySelector('.range-end').value;
            if (start && end) {
                ranges.push({ start, end });
            }
        });
        
        const season = {
            saison: seasonName,
            ranges: ranges
        };
        
        this.data.seasons[this.currentEditItem.index] = season;
        await this.saveData('rms_seasons', this.data.seasons);
    }
    
    async saveConfigEdit() {
        const brand = document.getElementById('edit-brand').value;
        const pickupLocation = document.getElementById('edit-pickup-location').value;
        const ratesText = document.getElementById('edit-rates').value;
        
        let rates;
        try {
            rates = JSON.parse(ratesText);
        } catch (error) {
            throw new Error('Format JSON invalide pour les rate codes');
        }
        
        const config = {
            brand: brand,
            pickup_location_level_name: pickupLocation,
            rates: rates
        };
        
        this.data.rateConfig.pickup_locations[this.currentEditItem.index] = config;
        await this.saveData('rms_rate_config', this.data.rateConfig);
    }
    
    async saveData(key, data) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: data }, resolve);
        });
    }
    
    // Fonctions de suppression
    async deleteRate(season, rateCode, sipp) {
        if (confirm(`Supprimer le tarif ${sipp} pour ${season} - ${rateCode} ?`)) {
            delete this.data.rates[season][rateCode][sipp];
            
            // Nettoyer si vide
            if (Object.keys(this.data.rates[season][rateCode]).length === 0) {
                delete this.data.rates[season][rateCode];
            }
            if (Object.keys(this.data.rates[season]).length === 0) {
                delete this.data.rates[season];
            }
            
            await this.saveData('rms_rates', this.data.rates);
            this.renderRatesTable();
            this.updateOverview();
        }
    }
    
    async deleteVehicle(index) {
        const vehicle = this.data.vehicles[index];
        if (confirm(`Supprimer le véhicule ${vehicle.sipp} - ${vehicle.make_model} ?`)) {
            this.data.vehicles.splice(index, 1);
            await this.saveData('rms_vehicles', this.data.vehicles);
            this.renderVehiclesTable();
            this.updateOverview();
        }
    }
    
    async deleteSeason(index) {
        const season = this.data.seasons[index];
        if (confirm(`Supprimer la saison ${season.saison} ?`)) {
            this.data.seasons.splice(index, 1);
            await this.saveData('rms_seasons', this.data.seasons);
            this.renderSeasonsTable();
            this.updateOverview();
        }
    }
    
    // Fonctions utilitaires
    showModal() {
        document.getElementById('editModal').style.display = 'block';
    }
    
    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditType = null;
        this.currentEditItem = null;
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR');
    }
    
    showNotification(message, type) {
        // Créer une notification moderne
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            transform: translateX(400px);
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            notification.innerHTML = '✅ ' + message;
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            notification.innerHTML = '❌ ' + message;
        } else {
            notification.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            notification.innerHTML = 'ℹ️ ' + message;
        }
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Supprimer après 4 secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    renderAllTables() {
        this.renderRatesTable();
        this.renderVehiclesTable();
        this.renderSeasonsTable();
        this.renderConfigTable();
        // Note: renderRatesGrid est appelée seulement quand l'onglet est actif
    }
    
    // Fonctions de filtrage
    filterRates(searchTerm) {
        const rows = document.querySelectorAll('#rates-table tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }
    
    filterVehicles(searchTerm) {
        const rows = document.querySelectorAll('#vehicles-table tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }
    
    filterSeasons(searchTerm) {
        const rows = document.querySelectorAll('#seasons-table tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }
    
    filterRatesBySeason(season) {
        const rows = document.querySelectorAll('#rates-table tr');
        rows.forEach(row => {
            const seasonCell = row.cells[0];
            if (!season || !seasonCell) {
                row.style.display = '';
            } else {
                row.style.display = seasonCell.textContent === season ? '' : 'none';
            }
        });
    }
    
    // Fonctions d'export
    exportRates() {
        this.downloadJSON(this.data.rates, 'rms-rates.json');
    }
    
    exportVehicles() {
        this.downloadJSON(this.data.vehicles, 'rms-vehicles.json');
    }
    
    exportSeasons() {
        this.downloadJSON(this.data.seasons, 'rms-seasons.json');
    }
    
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    async refreshData(dataType) {
        await this.loadAllData();
        this.updateOverview();
        this.renderAllTables();
        this.showNotification(`Données ${dataType} actualisées`, 'success');
    }

    async loadAndSaveDefaultData() {
        try {
            console.log('🔄 Chargement des données par défaut...');
            
            // Charger toutes les données par défaut
            const vehicles = await this.loadDefaultVehicles();
            const seasons = await this.loadDefaultSeasons();
            const rates = await this.loadDefaultRates();
            const rateConfig = await this.loadDefaultRateConfig();
            const coefficients = await this.loadDefaultCoefficients();
            
            // Sauvegarder dans Chrome Storage
            if (vehicles.length > 0) {
                await this.saveData('rms_vehicles', vehicles);
                this.data.vehicles = vehicles;
            }
            
            if (seasons.length > 0) {
                await this.saveData('rms_seasons', seasons);
                this.data.seasons = seasons;
            }
            
            if (Object.keys(rates).length > 0) {
                await this.saveData('rms_rates', rates);
                this.data.rates = rates;
            }
            
            if (Object.keys(rateConfig).length > 0) {
                await this.saveData('rms_rate_config', rateConfig);
                this.data.rateConfig = rateConfig;
            }
            
            if (Object.keys(coefficients).length > 0) {
                await this.saveData('rms_coefficients', coefficients);
                this.data.coefficients = coefficients;
            }
            
            // Mettre à jour l'interface
            this.updateOverview();
            this.renderAllTables();
            
            this.showNotification('✅ Données par défaut chargées avec succès!', 'success');
            
        } catch (error) {
            console.error('Erreur lors du chargement des données par défaut:', error);
            this.showNotification('❌ Erreur lors du chargement des données par défaut', 'error');
        }
    }

    async refreshAllData() {
        await this.loadAllData();
        this.updateOverview();
        this.renderAllTables();
        this.showNotification('🔄 Toutes les données ont été actualisées', 'success');
    }

    // Fonctions pour charger les données par défaut
    async loadDefaultVehicles() {
        try {
            const response = await fetch(chrome.runtime.getURL('config/vehicles.json'));
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Erreur chargement vehicles.json:', error);
        }
        return [];
    }

    async loadDefaultSeasons() {
        try {
            const response = await fetch(chrome.runtime.getURL('config/seasons.json'));
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Erreur chargement seasons.json:', error);
        }
        return [];
    }

    async loadDefaultRates() {
        try {
            const response = await fetch(chrome.runtime.getURL('config/rates.json'));
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Erreur chargement rates.json:', error);
        }
        return {};
    }

    async loadDefaultRateConfig() {
        try {
            const response = await fetch(chrome.runtime.getURL('config/rate_config.json'));
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Erreur chargement rate_config.json:', error);
        }
        return {};
    }

    async loadDefaultCoefficients() {
        try {
            const response = await fetch(chrome.runtime.getURL('config/coefficients.json'));
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Erreur chargement coefficients.json:', error);
        }
        return {};
    }

    // === FONCTIONS GRILLE DE TARIFS ===
    
    populateGridRateCodeSelect() {
        const select = document.getElementById('grid-rate-code-select');
        if (!select) return;
        
        // Récupérer tous les rate codes uniques depuis la configuration et les données
        const rateCodes = new Set();
        
        // Depuis la configuration
        if (this.data.rateConfig && this.data.rateConfig.pickup_locations) {
            this.data.rateConfig.pickup_locations.forEach(location => {
                if (location.rates) {
                    location.rates.forEach(rate => {
                        rateCodes.add(rate.rate_code);
                    });
                }
            });
        }
        
        // Depuis les données de tarifs (au cas où il y aurait des rate codes supplémentaires)
        if (this.data.rates) {
            Object.values(this.data.rates).forEach(seasonRates => {
                Object.keys(seasonRates).forEach(rateCode => {
                    rateCodes.add(rateCode);
                });
            });
        }
        
        // Trier les rate codes
        const sortedRateCodes = Array.from(rateCodes).sort();
        
        // Peupler le sélecteur
        const currentValue = select.value;
        select.innerHTML = '';
        
        if (sortedRateCodes.length === 0) {
            // Valeurs par défaut si aucun rate code trouvé
            select.innerHTML = `
                <option value="AFFA1">AFFA1</option>
                <option value="AFFA7">AFFA7</option>
            `;
        } else {
            sortedRateCodes.forEach(rateCode => {
                const option = document.createElement('option');
                option.value = rateCode;
                option.textContent = rateCode;
                select.appendChild(option);
            });
        }
        
        // Restaurer la valeur précédente si elle existe encore
        if (currentValue && sortedRateCodes.includes(currentValue)) {
            select.value = currentValue;
        } else if (sortedRateCodes.length > 0) {
            select.value = sortedRateCodes[0];
        }
        
        console.log(`📋 Rate codes chargés: ${sortedRateCodes.join(', ')}`);
    }
    
    renderRatesGrid(rateCode = 'AFFA1') {
        console.log(`🔢 Rendu de la grille pour rate code: ${rateCode}`);
        
        // Vérifier les données
        if (!this.data.vehicles || !this.data.seasons || !this.data.rates) {
            console.log('❌ Données manquantes pour la grille');
            return;
        }

        // Trier les véhicules par catégorie
        const sortedVehicles = [...this.data.vehicles].sort((a, b) => {
            if (a.categorie !== b.categorie) {
                return a.categorie.localeCompare(b.categorie);
            }
            return a.make_model.localeCompare(b.make_model);
        });

        // Ordre spécifique des saisons demandé
        const seasonOrder = ['Basse Saison', 'Moyenne Saison', 'Haute Saison', 'Très Haute Saison', 'Festive'];
        
        // Trier les saisons selon l'ordre demandé
        const orderedSeasons = [];
        seasonOrder.forEach(seasonName => {
            const season = this.data.seasons.find(s => s.saison === seasonName);
            if (season) {
                orderedSeasons.push(season);
            }
        });
        
        // Ajouter les saisons non listées à la fin
        this.data.seasons.forEach(season => {
            if (!seasonOrder.includes(season.saison)) {
                orderedSeasons.push(season);
            }
        });

        // Construire les en-têtes (maintenant les saisons)
        const thead = document.querySelector('#rates-grid-table thead tr');
        thead.innerHTML = '<th class="sticky-header" style="min-width: 250px;">Véhicule</th>';
        
        orderedSeasons.forEach(season => {
            const th = document.createElement('th');
            th.className = 'season-header-col';
            th.style.cssText = 'min-width: 120px; text-align: center; font-weight: 600; background: #f8fafc;';
            th.textContent = season.saison;
            thead.appendChild(th);
        });

        // Construire le corps du tableau (maintenant les véhicules en lignes)
        const tbody = document.getElementById('rates-grid-tbody');
        tbody.innerHTML = '';

        sortedVehicles.forEach(vehicle => {
            const row = document.createElement('tr');
            
            // Cellule de véhicule (première colonne)
            const vehicleCell = document.createElement('td');
            vehicleCell.className = 'vehicle-header-row';
            vehicleCell.style.cssText = `
                background: #f1f5f9; 
                font-weight: 600; 
                text-align: left; 
                padding: 12px 16px; 
                position: sticky; 
                left: 0; 
                z-index: 5; 
                border-right: 2px solid #cbd5e1;
                min-width: 250px;
            `;
            vehicleCell.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <div style="font-weight: bold; color: #1e293b; font-size: 14px;">${vehicle.categorie} - ${vehicle.make_model}</div>
                    <div style="font-size: 12px; color: #64748b;">(${vehicle.sipp})</div>
                </div>
            `;
            row.appendChild(vehicleCell);

            // Cellules de tarifs pour chaque saison (dans l'ordre spécifié)
            orderedSeasons.forEach(season => {
                const cell = document.createElement('td');
                cell.className = 'rate-cell';
                
                // Obtenir le tarif s'il existe
                const seasonRates = this.data.rates[season.saison];
                let rate = '';
                if (seasonRates && seasonRates[rateCode] && seasonRates[rateCode][vehicle.sipp]) {
                    rate = seasonRates[rateCode][vehicle.sipp];
                }

                if (rate) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.className = 'rate-input';
                    input.value = rate;
                    input.step = '0.01';
                    input.min = '0';
                    input.dataset.season = season.saison;
                    input.dataset.vehicle = vehicle.sipp;
                    input.dataset.originalValue = rate;
                    
                    // Événements pour détecter les modifications
                    input.addEventListener('input', (e) => this.onRateInputChange(e));
                    input.addEventListener('blur', (e) => this.onRateInputBlur(e));
                    
                    cell.appendChild(input);
                } else {
                    cell.className += ' empty';
                    cell.innerHTML = '<span style="color: #9ca3af; font-size: 12px;">—</span>';
                    
                    // Permettre d'ajouter un tarif en cliquant
                    cell.addEventListener('click', () => this.addRateToCell(cell, season.saison, vehicle.sipp, rateCode));
                }

                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        // Mettre à jour les statistiques
        this.updateGridStats();
        
        // Mettre à jour le sélecteur de rate code
        document.getElementById('grid-rate-code-select').value = rateCode;
    }

    onRateInputChange(event) {
        const input = event.target;
        const originalValue = parseFloat(input.dataset.originalValue) || 0;
        const currentValue = parseFloat(input.value) || 0;
        
        if (currentValue !== originalValue) {
            input.parentElement.classList.add('modified');
        } else {
            input.parentElement.classList.remove('modified');
        }
        
        // Vérifier si c'est un tarif Basse Saison pour afficher les suggestions
        if (input.dataset.season === 'Basse Saison' && currentValue > 0) {
            this.showRateSuggestions(input.dataset.vehicle, currentValue, input);
        }
        
        this.updateGridStats();
    }

    onRateInputBlur(event) {
        const input = event.target;
        const value = parseFloat(input.value);
        
        if (isNaN(value) || value < 0) {
            input.value = input.dataset.originalValue || '';
            input.parentElement.classList.remove('modified');
        }
        
        this.updateGridStats();
    }

    addRateToCell(cell, season, vehicle, rateCode) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'rate-input';
        input.value = '';
        input.step = '0.01';
        input.min = '0';
        input.placeholder = '0.00';
        input.dataset.season = season;
        input.dataset.vehicle = vehicle;
        input.dataset.originalValue = '';
        
        input.addEventListener('input', (e) => this.onRateInputChange(e));
        input.addEventListener('blur', (e) => this.onRateInputBlur(e));
        
        cell.innerHTML = '';
        cell.className = 'rate-cell';
        cell.appendChild(input);
        
        input.focus();
    }

    updateGridStats() {
        const inputs = document.querySelectorAll('.rate-input');
        const modifiedCells = document.querySelectorAll('.rate-cell.modified');
        
        let totalValue = 0;
        inputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            totalValue += value;
        });

        document.getElementById('grid-total-cells').textContent = inputs.length;
        document.getElementById('grid-modified-cells').textContent = modifiedCells.length;
        document.getElementById('grid-total-value').textContent = totalValue.toFixed(2);
    }

    async saveRatesGrid() {
        const rateCode = document.getElementById('grid-rate-code-select').value;
        const modifiedInputs = document.querySelectorAll('.rate-cell.modified .rate-input');
        
        if (modifiedInputs.length === 0) {
            this.showNotification('Aucune modification à sauvegarder', 'info');
            return;
        }

        try {
            // Appliquer les modifications aux données
            modifiedInputs.forEach(input => {
                const season = input.dataset.season;
                const vehicle = input.dataset.vehicle;
                const newValue = parseFloat(input.value) || 0;

                // S'assurer que la structure existe
                if (!this.data.rates[season]) {
                    this.data.rates[season] = {};
                }
                if (!this.data.rates[season][rateCode]) {
                    this.data.rates[season][rateCode] = {};
                }

                // Mettre à jour la valeur
                if (newValue > 0) {
                    this.data.rates[season][rateCode][vehicle] = newValue;
                } else {
                    delete this.data.rates[season][rateCode][vehicle];
                }

                // Mettre à jour la valeur originale
                input.dataset.originalValue = newValue;
                input.parentElement.classList.remove('modified');
            });

            // Sauvegarder dans Chrome Storage
            await this.saveData('rms_rates', this.data.rates);
            
            this.showNotification(`✅ ${modifiedInputs.length} tarifs sauvegardés pour ${rateCode}!`, 'success');
            this.updateGridStats();
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la grille:', error);
            this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
        }
    }

    resetRatesGrid() {
        const rateCode = document.getElementById('grid-rate-code-select').value;
        if (confirm(`Voulez-vous réinitialiser la grille pour ${rateCode} ?`)) {
            this.renderRatesGrid(rateCode);
            this.showNotification('🔄 Grille réinitialisée', 'info');
        }
    }

    exportRatesGridCSV() {
        const rateCode = document.getElementById('grid-rate-code-select').value;
        
        // Construire les données CSV avec la nouvelle structure (véhicules en lignes, saisons en colonnes)
        let csvContent = 'Vehicule';
        
        // Ordre spécifique des saisons
        const seasonOrder = ['Basse Saison', 'Moyenne Saison', 'Haute Saison', 'Très Haute Saison', 'Festive'];
        
        // Trier les saisons selon l'ordre demandé
        const orderedSeasons = [];
        seasonOrder.forEach(seasonName => {
            const season = this.data.seasons.find(s => s.saison === seasonName);
            if (season) {
                orderedSeasons.push(season);
            }
        });
        
        // Ajouter les saisons non listées à la fin
        this.data.seasons.forEach(season => {
            if (!seasonOrder.includes(season.saison)) {
                orderedSeasons.push(season);
            }
        });

        // En-têtes des saisons
        orderedSeasons.forEach(season => {
            csvContent += `,${season.saison}`;
        });
        csvContent += '\n';

        // Trier les véhicules par catégorie
        const sortedVehicles = [...this.data.vehicles].sort((a, b) => {
            if (a.categorie !== b.categorie) {
                return a.categorie.localeCompare(b.categorie);
            }
            return a.make_model.localeCompare(b.make_model);
        });

        // Lignes de données (une ligne par véhicule)
        sortedVehicles.forEach(vehicle => {
            csvContent += `"${vehicle.categorie} - ${vehicle.make_model} (${vehicle.sipp})"`;
            
            orderedSeasons.forEach(season => {
                const seasonRates = this.data.rates[season.saison];
                let rate = '';
                if (seasonRates && seasonRates[rateCode] && seasonRates[rateCode][vehicle.sipp]) {
                    rate = seasonRates[rateCode][vehicle.sipp];
                }
                csvContent += `,${rate}`;
            });
            csvContent += '\n';
        });

        // Télécharger le fichier
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarifs-grille-${rateCode}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification(`📤 Grille ${rateCode} exportée en CSV`, 'success');
    }

    // === FONCTIONS ONGLET COEFFICIENTS ===
    
    renderCoefficientsTab() {
        this.populateBaseSeasonsSelect();
        this.renderCoefficientsCards();
        this.loadCoefficientsRules();
    }
    
    populateBaseSeasonsSelect() {
        const select = document.getElementById('base-season-select');
        if (!select) return;
        
        select.innerHTML = '';
        this.data.seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.saison;
            option.textContent = season.saison;
            if (this.data.coefficients.base_season === season.saison) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
    
    renderCoefficientsCards() {
        const container = document.querySelector('.coefficients-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.data.coefficients.coefficients) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 40px;">Aucun coefficient configuré</div>';
            return;
        }
        
        Object.entries(this.data.coefficients.coefficients).forEach(([season, coefficient]) => {
            const isBaseSeason = season === this.data.coefficients.base_season;
            
            const card = document.createElement('div');
            card.style.cssText = `
                background: ${isBaseSeason ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white'};
                color: ${isBaseSeason ? 'white' : '#374151'};
                padding: 20px;
                border-radius: 12px;
                border: 1px solid ${isBaseSeason ? '#10b981' : '#e5e7eb'};
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: all 0.2s;
            `;
            
            card.innerHTML = `
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${season}</h4>
                    ${isBaseSeason ? '<span style="font-size: 12px; opacity: 0.9;">📊 BASE</span>' : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 24px; font-weight: bold;">${coefficient}</span>
                    <span style="opacity: 0.8;">×</span>
                </div>
                <div style="font-size: 12px; opacity: ${isBaseSeason ? '0.9' : '0.7'}; margin-bottom: 12px;">
                    ${isBaseSeason ? 'Saison de référence' : `Multiplie la base par ${coefficient}`}
                </div>
                <div style="display: flex; gap: 8px;">
                    <input type="number" 
                           class="coefficient-input" 
                           data-season="${season}"
                           value="${coefficient}" 
                           step="0.01" 
                           min="0.1" 
                           max="10"
                           ${isBaseSeason ? 'readonly' : ''}
                           style="
                               flex: 1; 
                               padding: 6px 8px; 
                               border: 1px solid ${isBaseSeason ? 'rgba(255,255,255,0.3)' : '#d1d5db'}; 
                               border-radius: 4px; 
                               background: ${isBaseSeason ? 'rgba(255,255,255,0.1)' : 'white'};
                               color: ${isBaseSeason ? 'white' : '#374151'};
                           ">
                    ${!isBaseSeason ? `<button class="btn btn-danger btn-small coefficient-delete-btn" data-season="${season}">🗑️</button>` : ''}
                </div>
            `;
            
            container.appendChild(card);
            
            // Ajouter event listeners
            const input = card.querySelector('.coefficient-input');
            const deleteBtn = card.querySelector('.coefficient-delete-btn');
            
            input.addEventListener('input', () => this.onCoefficientChange());
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Supprimer le coefficient pour "${season}" ?`)) {
                        card.remove();
                        this.onCoefficientChange();
                    }
                });
            }
        });
    }
    
    loadCoefficientsRules() {
        if (!this.data.coefficients.calculation_rules) return;
        
        const rules = this.data.coefficients.calculation_rules;
        
        const roundCheckbox = document.getElementById('round-to-integer');
        const roundMethod = document.getElementById('round-method');
        const minValue = document.getElementById('min-value');
        
        if (roundCheckbox) roundCheckbox.checked = rules.round_to_integer || false;
        if (roundMethod) roundMethod.value = rules.round_method || 'round';
        if (minValue) minValue.value = rules.min_value || 1;
    }
    
    onCoefficientChange() {
        // Marquer comme modifié (vous pourriez ajouter un indicateur visuel)
        console.log('🔄 Coefficient modifié');
    }
    
    saveCoefficients() {
        try {
            // Collecter les coefficients depuis les inputs
            const coefficients = {};
            const inputs = document.querySelectorAll('.coefficient-input');
            
            inputs.forEach(input => {
                const season = input.dataset.season;
                const value = parseFloat(input.value) || 1;
                coefficients[season] = value;
            });
            
            // Collecter les règles
            const rules = {
                round_to_integer: document.getElementById('round-to-integer').checked,
                round_method: document.getElementById('round-method').value,
                min_value: parseInt(document.getElementById('min-value').value) || 1
            };
            
            // Mettre à jour les données
            this.data.coefficients = {
                ...this.data.coefficients,
                coefficients: coefficients,
                calculation_rules: rules,
                base_season: document.getElementById('base-season-select').value
            };
            
            // Sauvegarder
            this.saveData('rms_coefficients', this.data.coefficients);
            this.showNotification('✅ Coefficients sauvegardés avec succès!', 'success');
            
        } catch (error) {
            console.error('Erreur sauvegarde coefficients:', error);
            this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
        }
    }
    
    exportCoefficients() {
        this.downloadJSON(this.data.coefficients, 'rms-coefficients.json');
        this.showNotification('📤 Coefficients exportés', 'success');
    }
    
    resetCoefficients() {
        if (confirm('Voulez-vous réinitialiser les coefficients aux valeurs par défaut ?')) {
            this.loadDefaultCoefficients().then(defaultCoeffs => {
                this.data.coefficients = defaultCoeffs;
                this.renderCoefficientsTab();
                this.showNotification('🔄 Coefficients réinitialisés', 'info');
            });
        }
    }
    
    calculatePreview() {
        const baseRate = parseFloat(document.getElementById('calc-base-rate').value);
        if (!baseRate || baseRate <= 0) {
            this.showNotification('Veuillez saisir un tarif de base valide', 'error');
            return;
        }
        
        const resultsDiv = document.getElementById('calculation-results');
        if (!resultsDiv) return;
        
        let resultsHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">';
        
        Object.entries(this.data.coefficients.coefficients).forEach(([season, coefficient]) => {
            let calculatedRate = baseRate * coefficient;
            
            // Appliquer les règles d'arrondi
            const rules = this.data.coefficients.calculation_rules;
            if (rules?.round_to_integer) {
                switch (rules.round_method) {
                    case 'floor': calculatedRate = Math.floor(calculatedRate); break;
                    case 'ceil': calculatedRate = Math.ceil(calculatedRate); break;
                    default: calculatedRate = Math.round(calculatedRate);
                }
            }
            
            calculatedRate = Math.max(calculatedRate, rules?.min_value || 1);
            
            const isBase = season === this.data.coefficients.base_season;
            
            resultsHTML += `
                <div style="
                    background: ${isBase ? '#10b981' : '#3b82f6'}; 
                    color: white; 
                    padding: 16px; 
                    border-radius: 8px; 
                    text-align: center;
                ">
                    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">${season}</div>
                    <div style="font-size: 20px; font-weight: bold;">${calculatedRate}€</div>
                    <div style="font-size: 11px; opacity: 0.8;">×${coefficient}</div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        resultsDiv.innerHTML = resultsHTML;
        resultsDiv.style.display = 'block';
    }
    
    addNewCoefficient() {
        const seasonName = prompt('Nom de la nouvelle saison :');
        if (!seasonName) return;
        
        const coefficient = prompt('Coefficient multiplicateur :', '1.0');
        if (!coefficient) return;
        
        const coeffValue = parseFloat(coefficient);
        if (isNaN(coeffValue) || coeffValue <= 0) {
            this.showNotification('Coefficient invalide', 'error');
            return;
        }
        
        // Ajouter le coefficient
        if (!this.data.coefficients.coefficients) {
            this.data.coefficients.coefficients = {};
        }
        
        this.data.coefficients.coefficients[seasonName] = coeffValue;
        
        // Recharger l'affichage
        this.renderCoefficientsCards();
        this.showNotification(`✅ Coefficient ajouté pour "${seasonName}"`, 'success');
    }

    // === FONCTIONS DE SUGGESTIONS DE TARIFS ===
    
    showRateSuggestions(vehicle, baseRate, triggerElement = null) {
        if (!this.data.coefficients || !this.data.coefficients.coefficients) {
            console.log('❌ Coefficients non chargés');
            return;
        }

        const coefficients = this.data.coefficients.coefficients;
        const baseSeason = this.data.coefficients.base_season || 'Basse Saison';
        
        // Calculer les suggestions pour toutes les saisons
        const suggestions = {};
        Object.entries(coefficients).forEach(([season, coefficient]) => {
            if (season !== baseSeason) {
                let calculatedRate = baseRate * coefficient;
                
                // Appliquer les règles d'arrondi
                if (this.data.coefficients.calculation_rules?.round_to_integer) {
                    calculatedRate = Math.round(calculatedRate);
                }
                
                // Appliquer la valeur minimum
                const minValue = this.data.coefficients.calculation_rules?.min_value || 1;
                calculatedRate = Math.max(calculatedRate, minValue);
                
                suggestions[season] = calculatedRate;
            }
        });

        // Afficher le panneau de suggestions
        this.displaySuggestions(vehicle, baseRate, suggestions, triggerElement);
    }

    displaySuggestions(vehicle, baseRate, suggestions, triggerElement = null) {
        // Supprimer l'ancien panneau s'il existe
        const existingModal = document.getElementById('floating-suggestions-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Créer la modale flottante
        const modal = document.createElement('div');
        modal.id = 'floating-suggestions-modal';
        modal.style.cssText = `
            position: fixed;
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
            z-index: 20000;
            max-width: 400px;
            min-width: 350px;
            font-family: 'Segoe UI', sans-serif;
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.2s ease;
        `;

        // Mettre à jour les informations de base
        const vehicleInfo = this.data.vehicles.find(v => v.sipp === vehicle);
        const vehicleDisplay = vehicleInfo ? 
            `${vehicleInfo.categorie} - ${vehicleInfo.make_model} (${vehicle})` : 
            vehicle;

        // Générer le contenu de la modale
        let suggestionsHTML = '';
        Object.entries(suggestions).forEach(([season, rate]) => {
            suggestionsHTML += `
                <div class="suggestion-item" style="
                    background: white;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #fbbf24;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                ">
                    <div>
                        <div style="font-weight: 600; color: #374151;">${season}</div>
                        <div style="font-size: 12px; color: #6b7280;">Coefficient: ${this.data.coefficients.coefficients[season]}</div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span style="font-size: 18px; font-weight: bold; color: #f59e0b; margin-right: 8px;">${rate}€</span>
                        <input type="checkbox" class="suggestion-checkbox" data-season="${season}" data-rate="${rate}" data-vehicle="${vehicle}" checked>
                    </div>
                </div>
            `;
        });

        modal.innerHTML = `
            <div style="background: #f59e0b; color: white; padding: 12px 16px; border-radius: 10px 10px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0; font-size: 16px; font-weight: 600;">🧮 Suggestions de tarifs</h4>
                <button id="close-floating-suggestions" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px 8px;">✖️</button>
            </div>
            <div style="padding: 16px;">
                <div style="margin-bottom: 12px; font-size: 14px; color: #92400e;">
                    <strong>Basé sur :</strong> ${vehicleDisplay} - Basse Saison: ${baseRate}€
                </div>
                <div style="margin-bottom: 16px;">
                    ${suggestionsHTML}
                </div>
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button id="apply-all-floating" style="
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-weight: 500;
                        cursor: pointer;
                    ">✅ Appliquer tout</button>
                    <button id="apply-selected-floating" style="
                        background: #f3f4f6;
                        color: #374151;
                        border: 1px solid #d1d5db;
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-weight: 500;
                        cursor: pointer;
                    ">📝 Appliquer sélection</button>
                </div>
            </div>
        `;

        // Positionner la modale près de l'élément déclencheur
        document.body.appendChild(modal);
        this.positionModalNearElement(modal, triggerElement);

        // Animation d'apparition
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);

        // Ajouter les event listeners
        document.getElementById('close-floating-suggestions').addEventListener('click', () => {
            this.closeFloatingModal(modal);
        });

        document.getElementById('apply-all-floating').addEventListener('click', () => {
            this.applyAllSuggestions();
            this.closeFloatingModal(modal);
        });

        document.getElementById('apply-selected-floating').addEventListener('click', () => {
            this.applySelectedSuggestions();
            this.closeFloatingModal(modal);
        });

        // Fermer en cliquant à l'extérieur
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!modal.contains(e.target) && e.target !== triggerElement) {
                    this.closeFloatingModal(modal);
                }
            }, { once: true });
        }, 100);

        // Stocker les suggestions pour utilisation ultérieure
        this.currentSuggestions = {
            vehicle: vehicle,
            baseRate: baseRate,
            suggestions: suggestions,
            modal: modal
        };
    }

    positionModalNearElement(modal, triggerElement) {
        if (!triggerElement) {
            // Position par défaut au centre
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = triggerElement.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // Calculer la position optimale
        let top = rect.top;
        let left = rect.right + 10; // À droite de l'élément

        // Ajustements si la modale dépasse de la fenêtre
        if (left + modal.offsetWidth > viewport.width) {
            left = rect.left - modal.offsetWidth - 10; // À gauche
        }

        if (top + modal.offsetHeight > viewport.height) {
            top = viewport.height - modal.offsetHeight - 10; // Vers le haut
        }

        if (top < 10) {
            top = 10; // Minimum du haut
        }

        if (left < 10) {
            left = 10; // Minimum de la gauche
        }

        modal.style.position = 'fixed';
        modal.style.top = top + 'px';
        modal.style.left = left + 'px';
        modal.style.transform = 'none';
    }

    closeFloatingModal(modal) {
        if (!modal) return;
        
        // Animation de fermeture
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
            this.currentSuggestions = null;
        }, 200);
    }

    hideSuggestions() {
        const panel = document.getElementById('suggestions-panel');
        panel.style.display = 'none';
        this.currentSuggestions = null;
    }

    applyAllSuggestions() {
        if (!this.currentSuggestions) return;

        const { vehicle, suggestions } = this.currentSuggestions;
        const rateCode = document.getElementById('grid-rate-code-select').value;
        
        let appliedCount = 0;

        // Appliquer toutes les suggestions
        Object.entries(suggestions).forEach(([season, rate]) => {
            const success = this.applySuggestionToGrid(vehicle, season, rate, rateCode);
            if (success) appliedCount++;
        });

        this.showNotification(`✅ ${appliedCount} suggestions appliquées pour ${vehicle}`, 'success');
        this.hideSuggestions();
        this.updateGridStats();
    }

    applySelectedSuggestions() {
        if (!this.currentSuggestions) return;

        const { vehicle } = this.currentSuggestions;
        const rateCode = document.getElementById('grid-rate-code-select').value;
        const checkboxes = document.querySelectorAll('.suggestion-checkbox:checked');
        
        let appliedCount = 0;

        checkboxes.forEach(checkbox => {
            const season = checkbox.dataset.season;
            const rate = parseFloat(checkbox.dataset.rate);
            const success = this.applySuggestionToGrid(vehicle, season, rate, rateCode);
            if (success) appliedCount++;
        });

        this.showNotification(`✅ ${appliedCount} suggestions sélectionnées appliquées`, 'success');
        this.hideSuggestions();
        this.updateGridStats();
    }

    applySuggestionToGrid(vehicle, season, rate, rateCode) {
        // Trouver la cellule correspondante dans la grille
        const rows = document.querySelectorAll('#rates-grid-tbody tr');
        
        for (const row of rows) {
            const vehicleCell = row.querySelector('.vehicle-header-row');
            if (!vehicleCell) continue;

            // Vérifier si c'est la bonne ligne de véhicule
            if (vehicleCell.textContent.includes(vehicle)) {
                // Trouver la cellule de la saison
                const seasonHeaders = document.querySelectorAll('.season-header-col');
                let seasonIndex = -1;
                
                seasonHeaders.forEach((header, index) => {
                    if (header.textContent.trim() === season) {
                        seasonIndex = index;
                    }
                });

                if (seasonIndex >= 0) {
                    // +1 pour compenser la première colonne (véhicule)
                    const targetCell = row.cells[seasonIndex + 1];
                    if (targetCell) {
                        // Créer ou mettre à jour l'input
                        let input = targetCell.querySelector('.rate-input');
                        if (!input) {
                            // Créer un nouvel input si la cellule était vide
                            this.addRateToCell(targetCell, season, vehicle, rateCode);
                            input = targetCell.querySelector('.rate-input');
                        }
                        
                        if (input) {
                            input.value = rate;
                            input.dataset.originalValue = input.dataset.originalValue || '';
                            
                            // Marquer comme modifié
                            targetCell.classList.add('modified');
                            
                            return true;
                        }
                    }
                }
                break;
            }
        }
        
        return false;
    }
}

// Initialiser le gestionnaire
let configManager;
document.addEventListener('DOMContentLoaded', () => {
    configManager = new ConfigManager();
});

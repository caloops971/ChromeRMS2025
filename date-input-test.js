// Test spécifique pour la saisie de dates dans les champs RMS
// À utiliser dans la console développeur

function testDateInputSimulation() {
    console.log('📅 === TEST SIMULATION SAISIE DATES ===');
    
    // Vérifier les champs de date
    const pickupInput = document.getElementById('wdtePickupDate_input');
    const discontinueInput = document.getElementById('dtDiscontinueDate_ovw_input');
    
    console.log('🔍 Champs trouvés:');
    console.log('- Pickup Date:', pickupInput ? '✅' : '❌');
    console.log('- Discontinue Date:', discontinueInput ? '✅' : '❌');
    
    if (pickupInput) {
        console.log(`  Pickup - Valeur actuelle: "${pickupInput.value}"`);
        console.log(`  Pickup - Désactivé: ${pickupInput.disabled}`);
        console.log(`  Pickup - Attribut maskid: "${pickupInput.getAttribute('maskid')}"`);
    }
    
    if (discontinueInput) {
        console.log(`  Discontinue - Valeur actuelle: "${discontinueInput.value}"`);
        console.log(`  Discontinue - Désactivé: ${discontinueInput.disabled}`);
    }
    
    // Test de simulation de saisie
    if (window.rmsHelper && pickupInput) {
        console.log('\n🧪 Test simulation saisie pickup date...');
        const testDate = '12/25/2025';
        const originalValue = pickupInput.value;
        
        console.log(`📝 Changement: "${originalValue}" → "${testDate}"`);
        
        // Utiliser la fonction de simulation
        window.rmsHelper.simulateUserInput(pickupInput, testDate);
        
        // Vérifier après un délai
        setTimeout(() => {
            const newValue = pickupInput.value;
            const isChanged = newValue !== originalValue;
            
            console.log(`✅ Résultat: "${newValue}"`);
            console.log(`🔄 Changement effectif: ${isChanged ? '✅ OUI' : '❌ NON'}`);
            
            if (!isChanged) {
                console.log('⚠️ Le champ n\'a pas accepté la nouvelle valeur');
                console.log('💡 Possible solutions:');
                console.log('   - Le champ a un masque de saisie strict');
                console.log('   - Il faut déclencher d\'autres événements');
                console.log('   - Le format de date n\'est pas correct');
            } else {
                console.log('🎉 Simulation réussie !');
            }
        }, 200);
    }
}

function testDateFormatCompatibility() {
    console.log('📅 === TEST COMPATIBILITÉ FORMAT DATES ===');
    
    const pickupInput = document.getElementById('wdtePickupDate_input');
    if (!pickupInput) {
        console.log('❌ Champ pickup non trouvé');
        return;
    }
    
    const currentValue = pickupInput.value;
    console.log(`📋 Format actuel: "${currentValue}"`);
    
    // Analyser le format
    const datePattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
    const match = currentValue.match(datePattern);
    
    if (match) {
        const [, month, day, year] = match;
        console.log(`📊 Format détecté: MM/dd/yyyy`);
        console.log(`   Mois: ${month}, Jour: ${day}, Année: ${year}`);
    } else {
        console.log('❌ Format non reconnu');
    }
    
    // Tester différents formats
    const testFormats = [
        { format: 'MM/dd/yyyy', example: '03/15/2025' },
        { format: 'M/d/yyyy', example: '3/15/2025' },
        { format: 'MM/dd/yy', example: '03/15/25' },
        { format: 'dd/MM/yyyy', example: '15/03/2025' }
    ];
    
    console.log('\n🧪 Tests de formats:');
    testFormats.forEach(({ format, example }) => {
        console.log(`${format}: ${example}`);
    });
    
    console.log('\n💡 Recommandation: Utiliser MM/dd/yyyy comme détecté');
}

function testAdvancedDateSimulation() {
    console.log('🔬 === TEST SIMULATION AVANCÉE ===');
    
    const pickupInput = document.getElementById('wdtePickupDate_input');
    if (!pickupInput || !window.rmsHelper) {
        console.log('❌ Éléments requis non trouvés');
        return;
    }
    
    const testDate = '01/15/2026';
    const originalValue = pickupInput.value;
    
    console.log(`🎯 Test avec date: ${testDate}`);
    console.log(`📋 Valeur originale: ${originalValue}`);
    
    // Méthode avancée avec plus d'événements
    function advancedSimulation(input, value) {
        console.log('🔄 Simulation avancée en cours...');
        
        // Étape 1: Activer et focus
        const wasDisabled = input.disabled;
        if (wasDisabled) {
            input.disabled = false;
            console.log('  1. Champ activé temporairement');
        }
        
        // Étape 2: Events de focus
        input.focus();
        input.dispatchEvent(new Event('mousedown', { bubbles: true }));
        input.dispatchEvent(new Event('mouseup', { bubbles: true }));
        input.dispatchEvent(new Event('click', { bubbles: true }));
        input.dispatchEvent(new Event('focusin', { bubbles: true }));
        console.log('  2. Événements de focus déclenchés');
        
        // Étape 3: Sélection et suppression
        input.select();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Delete', bubbles: true }));
        console.log('  3. Contenu sélectionné et supprimé');
        
        // Étape 4: Saisie caractère par caractère
        input.value = '';
        for (let i = 0; i < value.length; i++) {
            const char = value[i];
            input.value += char;
            
            input.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
            input.dispatchEvent(new Event('input', { bubbles: true, inputType: 'insertText', data: char }));
            input.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
        }
        console.log('  4. Saisie caractère par caractère terminée');
        
        // Étape 5: Validation et blur
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        
        setTimeout(() => {
            input.blur();
            input.dispatchEvent(new Event('blur', { bubbles: true }));
            input.dispatchEvent(new Event('focusout', { bubbles: true }));
            
            if (wasDisabled) {
                input.disabled = true;
            }
            
            console.log('  5. Validation et blur terminés');
            
            // Vérifier le résultat
            setTimeout(() => {
                const finalValue = input.value;
                const success = finalValue === value;
                console.log(`🏁 Résultat final: "${finalValue}"`);
                console.log(`✅ Succès: ${success ? 'OUI' : 'NON'}`);
                
                if (!success) {
                    console.log('🔍 Le champ a peut-être un masque de validation spécifique');
                    console.log('💡 Essayez avec le format exact du système RMS');
                }
            }, 100);
        }, 100);
    }
    
    advancedSimulation(pickupInput, testDate);
}

// Fonction pour tester la persistance des dates
function testDatePersistence() {
    console.log('💾 === TEST PERSISTANCE DATES ===');
    
    const pickupInput = document.getElementById('wdtePickupDate_input');
    const discontinueInput = document.getElementById('dtDiscontinueDate_ovw_input');
    
    if (pickupInput) {
        console.log(`📅 Pickup Date: "${pickupInput.value}"`);
    }
    if (discontinueInput) {
        console.log(`📅 Discontinue Date: "${discontinueInput.value}"`);
    }
    
    // Vérifier si les dates persistent après un délai
    setTimeout(() => {
        console.log('\n🔄 Vérification après 2 secondes:');
        if (pickupInput) {
            console.log(`📅 Pickup Date: "${pickupInput.value}"`);
        }
        if (discontinueInput) {
            console.log(`📅 Discontinue Date: "${discontinueInput.value}"`);
        }
    }, 2000);
}

// Exporter les fonctions
window.dateInputTest = {
    testDateInputSimulation,
    testDateFormatCompatibility,
    testAdvancedDateSimulation,
    testDatePersistence
};

console.log('📅 Fonctions de test de dates disponibles:');
console.log('- dateInputTest.testDateInputSimulation() : Test simulation basique');
console.log('- dateInputTest.testDateFormatCompatibility() : Test formats');
console.log('- dateInputTest.testAdvancedDateSimulation() : Simulation avancée');
console.log('- dateInputTest.testDatePersistence() : Test persistance');

console.log('\n💡 Pour tester: dateInputTest.testDateInputSimulation()');

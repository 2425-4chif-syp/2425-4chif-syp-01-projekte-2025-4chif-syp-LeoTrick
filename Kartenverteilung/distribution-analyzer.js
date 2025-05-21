/**
 * Distribution Analyzer
 * Add support for custom card distribution formats
 */

/**
 * Analyze custom card distribution (JSON or string format)
 * @param {string} input - The card distribution input
 */
function analyzeCustomDistribution(input) {
    console.log("analyzeCustomDistribution aufgerufen mit:", input);
    try {
        // Create a new deal card
        const dealCard = document.createElement('div');
        dealCard.className = 'deal-card';
        dealCard.style.border = '1px solid #ddd';
        dealCard.style.borderRadius = '8px';
        dealCard.style.padding = '15px';
        dealCard.style.marginBottom = '20px';
        dealCard.style.backgroundColor = 'white';
        dealCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        
        // Add title
        const dealTitle = document.createElement('h2');
        dealTitle.textContent = 'Benutzerdefinierte Kartenverteilung';
        dealTitle.style.marginTop = '0';
        dealTitle.style.marginBottom = '15px';
        dealCard.appendChild(dealTitle);
        
        // Loading indicator
        const loadingText = document.createElement('p');
        loadingText.textContent = 'Analysiere Kartenverteilung...';
        dealCard.appendChild(loadingText);
        
        // Add it to the page
        const dealsContainer = document.getElementById('deals-container') || document.body;
        if (!dealsContainer) {
            console.error("Container #deals-container nicht gefunden!");
        }
        dealsContainer.prepend(dealCard);
        
        // Process the distribution asynchronously
        setTimeout(() => {
            try {
                console.log("Distribution Verarbeitung startet...");
                // Process the input
                let hands;
                
                // Check if it's a JSON string
                if (input.trim().startsWith('{')) {
                    try {
                        console.log("Versuche JSON zu parsen");
                        hands = parseJsonDistribution(input);
                        console.log("JSON erfolgreich geparst:", hands);
                    } catch (error) {
                        console.warn('Failed to parse as JSON, trying string format:', error);
                        hands = parseStringDistribution(input);
                        console.log("String format geparst nach JSON-Fehler:", hands);
                    }
                } 
                // Check if it's the semicolon-dash format (T-QT-K-T;AQ--A-AJ;K-KJ-Q-K;J-A-JT-Q)
                else if (input.includes(';') && input.includes('-')) {
                    console.log("Erkenne Semikolon-Strich-Format, versuche zu parsen");
                    hands = parseStringDistribution(input);
                    console.log("String-Format geparst:", hands);
                } 
                // Unknown format
                else {
                    console.error("Unbekanntes Format:", input);
                    throw new Error('Unrecognized distribution format');
                }
                
                // Remove loading text
                dealCard.removeChild(loadingText);
                
                if (hands.every(hand => hand.length > 0)) {
                    // Display the hand visualization
                    displayHandVisualization(dealCard, hands);
                    
                    // Run the trick analysis
                    displayTrickAnalysisWithCalculator(dealCard, hands);
                } else {
                    throw new Error('Failed to parse card distribution');
                }
            } catch (error) {
                dealCard.removeChild(loadingText);
                
                const errorMsg = document.createElement('p');
                errorMsg.textContent = 'Fehler beim Parsen der Kartenverteilung: ' + error.message;
                errorMsg.style.color = 'red';
                dealCard.appendChild(errorMsg);
                
                console.error('Error analyzing distribution:', error);
            }
        }, 10); // Small timeout to allow UI to update
    } catch (error) {
        alert('Fehler bei der Analyse: ' + error.message);
        console.error('Error analyzing distribution:', error);
    }
}

// Add UI elements for direct distribution input
function setupDistributionInput() {
    const customInputBtn = document.createElement('button');
    customInputBtn.id = 'customInputBtn';
    customInputBtn.className = 'btn btn-primary mb-3';
    customInputBtn.textContent = 'Eigene Kartenverteilung analysieren';
    customInputBtn.style.marginTop = '20px';
    customInputBtn.style.padding = '10px 15px';
    customInputBtn.style.backgroundColor = '#4CAF50';
    customInputBtn.style.color = 'white';
    customInputBtn.style.border = 'none';
    customInputBtn.style.borderRadius = '4px';
    customInputBtn.style.cursor = 'pointer';
    
    const customInputContainer = document.createElement('div');
    customInputContainer.id = 'customInputContainer';
    customInputContainer.style.display = 'none';
    customInputContainer.style.marginTop = '15px';
    customInputContainer.style.padding = '15px';
    customInputContainer.style.backgroundColor = '#f8f9fa';
    customInputContainer.style.border = '1px solid #ddd';
    customInputContainer.style.borderRadius = '8px';
    
    const inputLabel = document.createElement('label');
    inputLabel.htmlFor = 'distributionInput';
    inputLabel.textContent = 'Kartenverteilung eingeben (JSON oder Format: T-QT-K-T;AQ--A-AJ;K-KJ-Q-K;J-A-JT-Q)';
    inputLabel.style.display = 'block';
    inputLabel.style.marginBottom = '10px';
    
    const distributionInput = document.createElement('textarea');
    distributionInput.id = 'distributionInput';
    distributionInput.style.width = '100%';
    distributionInput.style.padding = '10px';
    distributionInput.style.border = '1px solid #ccc';
    distributionInput.style.borderRadius = '4px';
    distributionInput.style.minHeight = '100px';
    distributionInput.style.fontFamily = 'monospace';
    
    const analyzeBtn = document.createElement('button');
    analyzeBtn.id = 'analyzeBtn';
    analyzeBtn.textContent = 'Analysieren';
    analyzeBtn.style.marginTop = '10px';
    analyzeBtn.style.padding = '8px 12px';
    analyzeBtn.style.backgroundColor = '#007bff';
    analyzeBtn.style.color = 'white';
    analyzeBtn.style.border = 'none';
    analyzeBtn.style.borderRadius = '4px';
    analyzeBtn.style.cursor = 'pointer';
    
    customInputContainer.appendChild(inputLabel);
    customInputContainer.appendChild(distributionInput);
    customInputContainer.appendChild(analyzeBtn);
    
    // Add event listeners
    customInputBtn.addEventListener('click', () => {
        customInputContainer.style.display = customInputContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    analyzeBtn.addEventListener('click', () => {
        const input = distributionInput.value.trim();
        if (input) {
            analyzeCustomDistribution(input);
        } else {
            alert('Bitte eine Kartenverteilung eingeben.');
        }
    });
    
    // Insert elements into the page
    const container = document.querySelector('.import-container') || document.body;
    container.appendChild(customInputBtn);
    container.appendChild(customInputContainer);
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupDistributionInput, 500); // Slight delay to ensure other elements are loaded
});

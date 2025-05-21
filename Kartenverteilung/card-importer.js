/**
 * Card Distribution Text File Importer
 * Reads card distribution from text files and prepares them for trick analysis
 */

/**
 * Parse a bridge hand text file into a format usable by the calculator
 * @param {string} fileContent - The raw content of the text file
 * @return {Array} - Array of four hands (N, E, S, W) in the format required by the analyzer
 */
function parseCardTextFile(fileContent) {
    // Initialize hands array (N, E, S, W)
    const hands = [[], [], [], []];
    
    try {
        // Split by lines and process
        const lines = fileContent.split('\n');
        
        // Find and process the North, East, South, West sections
        let currentHand = -1;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect which hand we're parsing
            if (line.startsWith('Nord:') || line.startsWith('North:')) {
                currentHand = 0; // North
                continue;
            } else if (line.startsWith('Ost:') || line.startsWith('East:')) {
                currentHand = 1; // East
                continue;
            } else if (line.startsWith('Süd:') || line.startsWith('South:')) {
                currentHand = 2; // South
                continue;
            } else if (line.startsWith('West:')) {
                currentHand = 3; // West
                continue;
            }
            
            // If we're in a hand section and the line contains cards
            if (currentHand >= 0 && line.length > 0 && !line.startsWith('-')) {
                // Extract cards from the line
                const suitMatches = line.match(/([♠♥♦♣]|[SHDC])[:\s]+([AKQJT0-9]+)/i);
                
                if (suitMatches && suitMatches.length >= 3) {
                    const suitSymbol = suitMatches[1];
                    const cardValues = suitMatches[2].split('');
                    
                    // Convert suit symbols to letters if needed
                    let suitLetter;
                    switch (suitSymbol) {
                        case '♠': case 'S': suitLetter = 'S'; break;
                        case '♥': case 'H': suitLetter = 'H'; break;
                        case '♦': case 'D': suitLetter = 'D'; break;
                        case '♣': case 'C': suitLetter = 'C'; break;
                        default: continue; // Skip if suit is unrecognized
                    }
                    
                    // Convert T to 10 if needed for the UI
                    cardValues.forEach(value => {
                        // Add the card to the current hand
                        if (value === 'T' || value === '0') {
                            hands[currentHand].push('10' + suitLetter);
                        } else {
                            hands[currentHand].push(value + suitLetter);
                        }
                    });
                }
            }
        }
        
        // Validate that all hands have cards
        if (hands.some(hand => hand.length === 0)) {
            console.error('Failed to parse at least one hand from the text file');
        }
        
        return hands;
    } catch (error) {
        console.error('Error parsing card text file:', error);
        return [[], [], [], []];
    }
}

/**
 * Load card distribution from a text file
 * @param {File} file - The file object from a file input
 * @param {Function} callback - Function to call with the parsed hands
 */
function loadCardsFromTextFile(file, callback) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const fileContent = event.target.result;
        const hands = parseCardTextFile(fileContent);
        callback(hands);
    };
    
    reader.onerror = function() {
        console.error('Error reading the file');
        callback([[], [], [], []]);
    };
    
    reader.readAsText(file);
}

/**
 * Add file import capability to the UI
 */
function addFileImportToUI() {
    // Create a file input and button for importing
    const importContainer = document.createElement('div');
    importContainer.className = 'import-container';
    importContainer.style.margin = '20px 0';
    
    // File input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'cardFileInput';
    fileInput.accept = '.txt';
    fileInput.style.display = 'none';
    
    // Import button
    const importButton = document.createElement('button');
    importButton.textContent = 'Kartenverteilung aus Datei laden';
    importButton.style.padding = '10px 15px';
    importButton.style.backgroundColor = '#4CAF50';
    importButton.style.color = 'white';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '4px';
    importButton.style.cursor = 'pointer';
    importButton.style.marginRight = '10px';
    
    importButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const selectedFile = this.files[0];
            
            // Create a new deal card
            const dealCard = document.createElement('div');
            dealCard.className = 'deal-card';
            dealCard.style.border = '1px solid #ddd';
            dealCard.style.borderRadius = '8px';
            dealCard.style.padding = '15px';
            dealCard.style.marginBottom = '20px';
            dealCard.style.backgroundColor = 'white';
            dealCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            
            // Add title with filename
            const dealTitle = document.createElement('h2');
            dealTitle.textContent = selectedFile.name;
            dealTitle.style.marginTop = '0';
            dealTitle.style.marginBottom = '15px';
            dealCard.appendChild(dealTitle);
            
            // Loading indicator
            const loadingText = document.createElement('p');
            loadingText.textContent = 'Analysiere Kartenverteilung...';
            dealCard.appendChild(loadingText);
            
            // Add it to the page
            const dealsContainer = document.getElementById('dealsContainer') || document.body;
            dealsContainer.prepend(dealCard);
            
            // Process the file
            loadCardsFromTextFile(selectedFile, function(hands) {
                // Remove loading text
                dealCard.removeChild(loadingText);
                
                if (hands.every(hand => hand.length > 0)) {
                    // Display the hand visualization
                    displayHandVisualization(dealCard, hands);
                    
                    // Run the trick analysis
                    if (typeof displayTrickAnalysisWithCalculator === 'function') {
                        displayTrickAnalysisWithCalculator(dealCard, hands);
                    } else {
                        console.error('Trick analysis function not available');
                    }
                } else {
                    const errorMsg = document.createElement('p');
                    errorMsg.textContent = 'Fehler beim Parsen der Datei. Bitte Dateiformat überprüfen.';
                    errorMsg.style.color = 'red';
                    dealCard.appendChild(errorMsg);
                }
            });
            
            // Reset the file input
            this.value = '';
        }
    });
    
    // Add elements to the container
    importContainer.appendChild(fileInput);
    importContainer.appendChild(importButton);
    
    // Add to page
    const container = document.getElementById('importContainer') || document.body;
    container.prepend(importContainer);
}

/**
 * Display a visualization of the bridge hands
 * @param {Element} container - The container element to add the visualization to
 * @param {Array} hands - Array of four hands (N, E, S, W)
 */
function displayHandVisualization(container, hands) {
    const [northHand, eastHand, southHand, westHand] = hands;
    
    // Create table for hand visualization
    const table = document.createElement('table');
    table.className = 'hand-visualization';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '20px';
    
    // Create rows and cells for the hands
    const northRow = document.createElement('tr');
    const northCell = document.createElement('td');
    northCell.colSpan = 3;
    northCell.textContent = formatHand(northHand);
    northCell.style.textAlign = 'center';
    northCell.style.padding = '10px';
    northRow.appendChild(northCell);
    table.appendChild(northRow);
    
    const middleRow = document.createElement('tr');
    
    const westCell = document.createElement('td');
    westCell.textContent = formatHand(westHand);
    westCell.style.padding = '10px';
    westCell.style.width = '33%';
    middleRow.appendChild(westCell);
    
    const centerCell = document.createElement('td');
    centerCell.style.padding = '10px';
    centerCell.textContent = '♣ ♦ ♥ ♠';
    centerCell.style.textAlign = 'center';
    centerCell.style.fontSize = '24px';
    middleRow.appendChild(centerCell);
    
    const eastCell = document.createElement('td');
    eastCell.textContent = formatHand(eastHand);
    eastCell.style.padding = '10px';
    eastCell.style.width = '33%';
    eastCell.style.textAlign = 'right';
    middleRow.appendChild(eastCell);
    
    table.appendChild(middleRow);
    
    const southRow = document.createElement('tr');
    const southCell = document.createElement('td');
    southCell.colSpan = 3;
    southCell.textContent = formatHand(southHand);
    southCell.style.textAlign = 'center';
    southCell.style.padding = '10px';
    southRow.appendChild(southCell);
    table.appendChild(southRow);
    
    // Add the table to the container
    container.appendChild(table);
}

/**
 * Format a hand for display
 * @param {Array} hand - Array of cards
 * @return {string} - Formatted string representation of the hand
 */
function formatHand(hand) {
    if (!hand || hand.length === 0) return 'No cards';
    
    // Group cards by suit
    const suits = {
        S: [],
        H: [],
        D: [],
        C: []
    };
    
    hand.forEach(card => {
        const suit = card.slice(-1);
        const value = card.slice(0, -1);
        if (suits[suit]) {
            suits[suit].push(value);
        }
    });
    
    // Sort each suit
    const rankOrder = {};
    "AKQJT98765432".split('').forEach((rank, index) => {
        rankOrder[rank] = index;
        // Handle 10 as well
        if (rank === 'T') rankOrder['10'] = index;
    });
    
    Object.keys(suits).forEach(suit => {
        suits[suit].sort((a, b) => rankOrder[a] - rankOrder[b]);
    });
    
    // Format for display
    const suitSymbols = {
        S: '♠',
        H: '♥',
        D: '♦',
        C: '♣'
    };
    
    let result = '';
    ['S', 'H', 'D', 'C'].forEach(suit => {
        if (suits[suit].length > 0) {
            result += suitSymbols[suit] + ': ' + suits[suit].join(' ') + '\n';
        }
    });
    
    return result;
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    addFileImportToUI();
});

/**
 * Parse a string format card distribution (e.g., "T-QT-K-T;AQ--A-AJ;K-KJ-Q-K;J-A-JT-Q")
 * @param {string} distribution - The string format card distribution
 * @return {Array} - Array of four hands (N, E, S, W) in the format required by the analyzer
 */
function parseStringDistribution(distribution) {
    // Initialize hands array (N, E, S, W)
    const hands = [[], [], [], []];
    
    try {
        // Split the string by semicolons to get the four players' hands
        const playerDistributions = distribution.split(';');
        
        if (playerDistributions.length !== 4) {
            throw new Error('Invalid distribution format: expected 4 hands separated by semicolons');
        }
        
        // Process each player's hand
        playerDistributions.forEach((playerHand, playerIndex) => {
            // Split the hand by dashes to get the four suits
            const suits = playerHand.split('-');
            
            if (suits.length !== 4) {
                throw new Error(`Invalid hand format for player ${playerIndex}: expected 4 suits separated by dashes`);
            }
            
            // Process each suit (Spades, Hearts, Diamonds, Clubs in order)
            const suitLetters = ['S', 'H', 'D', 'C'];
            suits.forEach((cardsInSuit, suitIndex) => {
                // For each card in the suit
                for (let i = 0; i < cardsInSuit.length; i++) {
                    const cardRank = cardsInSuit[i].toUpperCase();
                    const suitLetter = suitLetters[suitIndex];
                    
                    // Add the card to the hand with proper format
                    if (cardRank === 'T' || cardRank === '0') {
                        hands[playerIndex].push('10' + suitLetter);
                    } else {
                        hands[playerIndex].push(cardRank + suitLetter);
                    }
                }
            });
        });
        
        // Validate that all hands have cards
        if (hands.some(hand => hand.length === 0)) {
            console.error('Failed to parse at least one hand from the string distribution');
        }
        
        return hands;
    } catch (error) {
        console.error('Error parsing string distribution:', error);
        return [[], [], [], []];
    }
}

/**
 * Parse a JSON-formatted card distribution
 * @param {string|object} jsonDistribution - The JSON card distribution (either as string or parsed object)
 * @return {Array} - Array of four hands (N, E, S, W) in the format required by the analyzer
 */
function parseJsonDistribution(jsonDistribution) {
    // Initialize hands array (N, E, S, W)
    const hands = [[], [], [], []];
    
    try {
        // Parse the JSON if it's provided as a string
        const distribution = typeof jsonDistribution === 'string' 
            ? JSON.parse(jsonDistribution) 
            : jsonDistribution;
        
        // Check if distribution is valid
        if (!distribution || typeof distribution !== 'object') {
            throw new Error('Invalid JSON distribution format');
        }
        
        // Expected properties are N, E, S, W or North, East, South, West
        const playerKeys = ['N', 'E', 'S', 'W'];
        const playerLongKeys = ['North', 'East', 'South', 'West'];
        
        // Map to convert long names to position indices
        const playerIndexMap = {
            'N': 0, 'North': 0,
            'E': 1, 'East': 1,
            'S': 2, 'South': 2,
            'W': 3, 'West': 3
        };
        
        // Process the distribution
        Object.keys(distribution).forEach(playerKey => {
            const playerIndex = playerIndexMap[playerKey];
            
            // Skip invalid player keys
            if (playerIndex === undefined) return;
            
            const playerHand = distribution[playerKey];
            
            // If playerHand is an object with suit properties
            if (typeof playerHand === 'object') {
                // Expected suit properties are S/H/D/C or Spades/Hearts/Diamonds/Clubs
                const suitKeys = ['S', 'H', 'D', 'C'];
                const suitLongKeys = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
                
                // Map to convert suit names to letters
                const suitLetterMap = {
                    'S': 'S', 'Spades': 'S',
                    'H': 'H', 'Hearts': 'H',
                    'D': 'D', 'Diamonds': 'D',
                    'C': 'C', 'Clubs': 'C'
                };
                
                // Process each suit
                Object.keys(playerHand).forEach(suitKey => {
                    const suitLetter = suitLetterMap[suitKey];
                    
                    // Skip invalid suit keys
                    if (suitLetter === undefined) return;
                    
                    // Get cards in the suit
                    const cardsInSuit = playerHand[suitKey];
                    
                    if (typeof cardsInSuit === 'string') {
                        // If suit is provided as a string like "AKQ"
                        for (let i = 0; i < cardsInSuit.length; i++) {
                            const cardRank = cardsInSuit[i].toUpperCase();
                            
                            // Add the card to the hand with proper format
                            if (cardRank === 'T' || cardRank === '0') {
                                hands[playerIndex].push('10' + suitLetter);
                            } else {
                                hands[playerIndex].push(cardRank + suitLetter);
                            }
                        }
                    } else if (Array.isArray(cardsInSuit)) {
                        // If suit is provided as an array like ["A", "K", "Q"]
                        cardsInSuit.forEach(cardRank => {
                            const rank = cardRank.toUpperCase();
                            
                            // Add the card to the hand with proper format
                            if (rank === 'T' || rank === '0') {
                                hands[playerIndex].push('10' + suitLetter);
                            } else {
                                hands[playerIndex].push(rank + suitLetter);
                            }
                        });
                    }
                });
            }
        });
        
        // Validate that all hands have cards
        if (hands.some(hand => hand.length === 0)) {
            console.error('Failed to parse at least one hand from the JSON distribution');
        }
        
        return hands;
    } catch (error) {
        console.error('Error parsing JSON distribution:', error);
        return [[], [], [], []];
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseCardTextFile,
        loadCardsFromTextFile,
        displayHandVisualization,
        parseStringDistribution,
        parseJsonDistribution
    };
}

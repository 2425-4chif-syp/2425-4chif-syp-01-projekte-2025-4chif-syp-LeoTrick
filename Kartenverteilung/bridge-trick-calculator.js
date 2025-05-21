/**
 * Bridge Game Trick Calculator
 * JavaScript implementation of the Excel VBA trick calculation algorithm
 */

class BridgeTrickCalculator {
    constructor() {
        // Constants
        this.RANK_STRING = "AKQJT98765432"; // Card ranks from highest to lowest
        
        // Default values
        this.dealer = 0; // N
        this.height = 1;
        this.lead = 1; // Default lead is player after dealer
        this.trump = "0"; // Default trump is Spades
    }

    /**
     * Sets parameters for the analysis similar to Excel version
     */
    setParameters(dealerStr, contractStr) {
        // Set dealer
        switch (dealerStr) {
            case "N": this.dealer = 0; break;
            case "O": this.dealer = 1; break;
            case "S": this.dealer = 2; break;
            case "W": this.dealer = 3; break;
            default: this.dealer = 0;
        }
        
        // Contract height
        this.height = parseInt(contractStr.charAt(0));
        
        // Trump suit
        const trumpChar = contractStr.charAt(1);
        switch (trumpChar) {
            case 'P': this.trump = "0"; break; // Pik (Spades)
            case 'H': this.trump = "1"; break; // Herz (Hearts)
            case 'K': this.trump = "2"; break; // Karo (Diamonds)
            case 'T': this.trump = "3"; break; // Treff (Clubs)
            case 'N': this.trump = "5"; break; // NT (No Trump)
            default: this.trump = "0";
        }
        
        // Who begins (Lead), player after dealer
        this.lead = (this.dealer + 1) % 4;
    }

    /**
     * Calculate tricks for a specific deal
     * This is the main function that reproduces the Excel VBA calculation
     */
    calculate(deck) {
        // Calculate the number of cards per color
        this.cardsPerColor = this.calculateCardsPerColor(deck);
        
        // Initialize the count for tracking performance
        const count = [0];
        
        // Initialize trick array (empty cards)
        const trick = ["", "", "", ""];
        
        // Deep copy the deck to avoid modifying the original
        const deckCopy = JSON.parse(JSON.stringify(deck));
        
        // Start with the specified lead player
        // Use the recursion function
        const NS = this.tiefensuche(deckCopy, this.trump, this.lead, trick, 0, 1, count);
        
        // Return the NS tricks
        return NS;
    }
    
    /**
     * Calculate cards per color based on the deck
     */
    calculateCardsPerColor(deck) {
        let totalCards = 0;
        for (let player = 0; player < 4; player++) {
            for (let suit = 0; suit < 4; suit++) {
                if (deck[player][suit] && deck[player][suit].length) {
                    totalCards += deck[player][suit].length;
                }
            }
        }
        return Math.floor(totalCards / 4); // Divide by 4 suits
    }

    /**
     * The deep search recursion function, following the VBA implementation
     */
    tiefensuche(deck, trump, lead, trick, winner, depth, count) {
        // Update counter for performance tracking
        count[0] = count[0] + 1;
        
        // Safety check - prevent infinite recursion
        if (count[0] > 100000) {
            return Math.floor(this.cardsPerColor / 2); // Default to even split
        }
        
        // Check if game is over (all cards played)
        let allCardsPlayed = true;
        let remainingCards = 0;
        
        for (let player = 0; player < 4; player++) {
            for (let suit = 0; suit < 4; suit++) {
                if (deck[player][suit] && deck[player][suit].length > 0) {
                    allCardsPlayed = false;
                    remainingCards += deck[player][suit].length;
                }
            }
            if (!allCardsPlayed) continue; // Continue checking all players for card count
        }
        
        // All cards played - game is over
        if (allCardsPlayed) {
            return 0; // No more tricks to take
        }
        
        // Maximum depth reached - game would not terminate normally
        if (depth > this.cardsPerColor * 4 + 4) {
            console.warn(`Maximum recursion depth reached (${depth})`);
            return Math.floor(this.cardsPerColor / 2); // Default to even split
        }
        
        // Determine which player's turn it is
        let toPlay = lead;
        
        // Find the first player who hasn't played a card yet in the current trick
        for (let i = 0; i < 4; i++) {
            if (!trick[toPlay] || trick[toPlay] === "") {
                break;
            }
            toPlay = (toPlay + 1) % 4;
        }
        
        // Check if trick is complete (all 4 players played)
        if ((toPlay === lead) && trick[0] && trick[1] && trick[2] && trick[3]) {
            // Award trick to winning team and start a new trick
            const trickWinner = winner;
            
            // Clear trick for next round
            trick[0] = "";
            trick[1] = "";
            trick[2] = "";
            trick[3] = "";
            
            // Recursive call - start new trick with winner leading
            const moreNSTricks = this.tiefensuche(deck, trump, trickWinner, trick, trickWinner, depth + 1, count);
            
            // Add current trick if NS won
            return ((trickWinner === 0 || trickWinner === 2) ? 1 : 0) + moreNSTricks;
        }
        
        // Determine which suit must be followed
        let leadSuit = 5; // Default: can play any suit
        if (trick[lead] && trick[lead] !== "") {
            leadSuit = parseInt(trick[lead].charAt(0));
            
            // Check if player has cards of led suit
            if (!deck[toPlay][leadSuit] || deck[toPlay][leadSuit].length === 0) {
                leadSuit = 5; // Player doesn't have the led suit, can play any
            }
        }
        
        // Determine which suits can be played
        let von = 0;
        let bis = 3;
        
        if (leadSuit !== 5) {
            von = leadSuit;
            bis = leadSuit;
        }
        
        // For minimax algorithm: NS wants to maximize, EW wants to minimize
        let bestScore = (toPlay === 0 || toPlay === 2) ? -1 : this.cardsPerColor + 1;
        let foundMove = false;
        
        // Loop through all possible suits to play
        for (let f = von; f <= bis; f++) {
            // Skip if no cards in this suit
            if (!deck[toPlay][f] || deck[toPlay][f].length === 0) continue;
            
            // Try each card in the suit
            const suitLength = deck[toPlay][f].length;
            for (let k = 0; k < suitLength; k++) {
                // Optimization: only consider non-equivalent cards
                let shouldPlayCard = false;
                
                if (k === 0) {
                    shouldPlayCard = true;
                } else {
                    // Check if there's a gap in ranks (skip equivalent cards)
                    const currentRank = deck[toPlay][f].charAt(k);
                    const prevRank = deck[toPlay][f].charAt(k - 1);
                    if (this.RANK_STRING.indexOf(currentRank) - this.RANK_STRING.indexOf(prevRank) > 1) {
                        shouldPlayCard = true;
                    }
                }
                
                if (shouldPlayCard) {
                    foundMove = true;
                    
                    // Play this card
                    const playedCard = f + deck[toPlay][f].charAt(k);
                    trick[toPlay] = playedCard;
                    
                    // Determine new winner of the trick
                    let newWinner = winner;
                    
                    // If this is the first card played in the trick
                    if (toPlay === lead) {
                        newWinner = toPlay;
                    } else {
                        // Compare with current winning card
                        const winningCardSuit = parseInt(trick[newWinner].charAt(0));
                        const playedCardSuit = parseInt(playedCard.charAt(0));
                        const trumpSuitNumber = parseInt(trump);
                        
                        // Trump beats non-trump
                        if (playedCardSuit === trumpSuitNumber && winningCardSuit !== trumpSuitNumber) {
                            newWinner = toPlay;
                        }
                        // Same suit - higher rank wins
                        else if (playedCardSuit === winningCardSuit) {
                            const winningRank = trick[newWinner].charAt(1);
                            const playedRank = playedCard.charAt(1);
                            
                            // In RANK_STRING, lower index means higher rank (A is better than K)
                            if (this.RANK_STRING.indexOf(playedRank) < this.RANK_STRING.indexOf(winningRank)) {
                                newWinner = toPlay;
                            }
                        }
                        // Different non-trump suits - first suit wins (do nothing, winner stays the same)
                    }
                    
                    // Remove the played card from the deck
                    const originalCards = deck[toPlay][f];
                    deck[toPlay][f] = originalCards.substring(0, k) + originalCards.substring(k + 1);
                    
                    // Recursive call - next player's turn
                    const nextToPlay = (toPlay + 1) % 4;
                    const nsScore = this.tiefensuche(deck, trump, lead, trick, newWinner, depth + 1, count);
                    
                    // Restore the deck
                    deck[toPlay][f] = originalCards.substring(0, k) + originalCards.charAt(k) + originalCards.substring(k + 1);
                    
                    // Remove the card from the trick
                    trick[toPlay] = "";
                    
                    // Update best score using minimax
                    if (toPlay === 0 || toPlay === 2) { // NS player (maximizing)
                        bestScore = Math.max(bestScore, nsScore);
                    } else { // EW player (minimizing)
                        bestScore = Math.min(bestScore, nsScore);
                    }
                }
            }
        }
        
        // If no moves were found (shouldn't happen if deck is valid)
        if (!foundMove) {
            return 0;
        }
        
        return bestScore === -1 ? 0 : bestScore;
    }

    /**
     * Convert a hand format to the deck format required by the trick calculator
     */
    convertHandsToDeck(northHand, eastHand, southHand, westHand) {
        const deck = new Array(4);
        for (let player = 0; player < 4; player++) {
            deck[player] = new Array(4);
            for (let suit = 0; suit < 4; suit++) {
                deck[player][suit] = "";
            }
        }
        
        // Order is N, E, S, W (0, 1, 2, 3)
        const hands = [northHand, eastHand, southHand, westHand];
        
        // Mapping of suits
        const suitMapping = {
            'S': 0, // Spades
            'H': 1, // Hearts
            'D': 2, // Diamonds
            'C': 3  // Clubs
        };
        
        // Parse each hand and organize by suit
        hands.forEach((hand, playerIndex) => {
            // For each suit in the hand
            Object.entries(hand).forEach(([suit, cards]) => {
                if (suitMapping[suit] !== undefined) {
                    // Convert the cards array to a string
                    if (Array.isArray(cards)) {
                        // Make sure cards are sorted by rank before joining
                        const sortedCards = [...cards].sort((a, b) => 
                            this.RANK_STRING.indexOf(a) - this.RANK_STRING.indexOf(b)
                        );
                        deck[playerIndex][suitMapping[suit]] = sortedCards.join("");
                    } else if (typeof cards === 'string') {
                        // If already a string, make sure it's sorted properly
                        const cardArray = cards.split('');
                        const sortedCards = cardArray.sort((a, b) => 
                            this.RANK_STRING.indexOf(a) - this.RANK_STRING.indexOf(b)
                        );
                        deck[playerIndex][suitMapping[suit]] = sortedCards.join("");
                    }
                }
            });
        });
        
        return deck;
    }
}

/**
 * Process card distribution in various formats
 * @param {string|object} distribution - The card distribution in either string format or JSON
 * @returns {Array} - Array of four hands (N, E, S, W) for the calculator
 */
function processCardDistribution(distribution) {
    let hands = [[], [], [], []];
    
    if (typeof distribution === 'string') {
        // Check if it's a JSON string
        if (distribution.trim().startsWith('{')) {
            try {
                hands = parseJsonDistribution(distribution);
            } catch (error) {
                console.error('Failed to parse JSON distribution:', error);
            }
        } 
        // Check if it's the semicolon-dash format (T-QT-K-T;AQ--A-AJ;K-KJ-Q-K;J-A-JT-Q)
        else if (distribution.includes(';') && distribution.includes('-')) {
            hands = parseStringDistribution(distribution);
        } 
        // Unknown format
        else {
            console.error('Unknown distribution format');
        }
    } 
    // Already in object format, assume it's JSON
    else if (typeof distribution === 'object') {
        if (Array.isArray(distribution) && distribution.length === 4) {
            // Already in the correct format (array of four hands)
            hands = distribution;
        } else {
            hands = parseJsonDistribution(distribution);
        }
    }
    
    return hands;
}

/**
 * Function to display the trick analysis in the deal card
 * Integrates with the existing UI
 */
function displayTrickAnalysisWithCalculator(dealCard, allPlayerHands) {
    // Create calculator instance
    const calculator = new BridgeTrickCalculator();
    
    // Process hands if needed
    let processedHands = allPlayerHands;
    if (typeof allPlayerHands === 'string' || 
        (typeof allPlayerHands === 'object' && !Array.isArray(allPlayerHands))) {
        processedHands = processCardDistribution(allPlayerHands);
    }
    
    // Format hands for the calculator
    const northHand = formatHandForAnalysis(processedHands[0]);
    const eastHand = formatHandForAnalysis(processedHands[2]); // Note order difference
    const southHand = formatHandForAnalysis(processedHands[3]);
    const westHand = formatHandForAnalysis(processedHands[1]);
    
    // Convert to the deck format
    const deck = calculator.convertHandsToDeck(northHand, eastHand, southHand, westHand);
    
    // Container for the analysis
    const analysisContainer = document.createElement('div');
    analysisContainer.className = 'analysis-container';
    analysisContainer.style.marginTop = '20px';
    
    // Get cards per color
    calculator.calculateCardsPerColor(deck);
    const cardsPerColor = calculator.cardsPerColor;
    
    // Add title
    const analysisTitle = document.createElement('h3');
    analysisTitle.textContent = 'Stichanalyse';
    analysisTitle.style.marginBottom = '10px';
    analysisContainer.appendChild(analysisTitle);
    
    // Create the table
    const table = document.createElement('table');
    table.className = 'analysis-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Trumpf', 'NS Stiche', 'OW Stiche', 'Gewinner'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        th.style.borderBottom = '1px solid #ddd';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Calculate results for each trump suit
    const trumpSuits = [
        { name: "♠ Pik", code: "0" },
        { name: "♥ Herz", code: "1" },
        { name: "♦ Karo", code: "2" },
        { name: "♣ Kreuz", code: "3" },
        { name: "NT", code: "5" }
    ];        // Perform calculations for each trump suit
    for (const trumpSuit of trumpSuits) {
        const startTime = Date.now();
        
        try {
            // Create a deep copy of the deck for each analysis
            const deckCopy = JSON.parse(JSON.stringify(deck));
            
            // Set trump suit
            calculator.trump = trumpSuit.code;
            
            // Try with different lead players for a better analysis
            let totalNSScore = 0;
            let validCalculations = 0;
            
            // Each player leads once
            for (let leader = 0; leader < 4; leader++) {
                try {
                    calculator.lead = leader;
                    const nsScore = calculator.calculate(JSON.parse(JSON.stringify(deckCopy)));
                    
                    if (nsScore >= 0 && nsScore <= cardsPerColor) {
                        // Only count valid scores
                        totalNSScore += nsScore;
                        validCalculations++;
                    }
                } catch (err) {
                    console.warn(`Error calculating with leader ${leader}:`, err);
                }
            }
            
            // Average the results, default to half if no valid calculations
            const nsStiche = validCalculations > 0 ? 
                Math.round(totalNSScore / validCalculations) :
                Math.floor(cardsPerColor / 2);
            
            // Make sure the score is valid
            const validNSStiche = Math.max(0, Math.min(nsStiche, cardsPerColor));
            const owStiche = cardsPerColor - validNSStiche;
            
            // Determine winner
            let winner = "Unentschieden";
            if (validNSStiche > owStiche) {
                winner = "NS";
            } else if (owStiche > validNSStiche) {
                winner = "OW";
            }
            
            const endTime = Date.now();
            const calculationTime = endTime - startTime;
        
        // Create row
        const row = document.createElement('tr');
        
        // Trump cell
        const trumpCell = document.createElement('td');
        trumpCell.textContent = trumpSuit.name;
        trumpCell.style.padding = '8px';
        trumpCell.style.borderBottom = '1px solid #ddd';
        
        // Set color for heart and diamond
        if (trumpSuit.name === "♥ Herz" || trumpSuit.name === "♦ Karo") {
            trumpCell.style.color = '#e74c3c';
        }
        
        row.appendChild(trumpCell);
        
        // NS tricks cell
        const nsCell = document.createElement('td');
        nsCell.textContent = validNSStiche;
        nsCell.style.padding = '8px';
        nsCell.style.borderBottom = '1px solid #ddd';
        nsCell.style.textAlign = 'center';
        row.appendChild(nsCell);
        
        // OW tricks cell
        const owCell = document.createElement('td');
        owCell.textContent = owStiche;
        owCell.style.padding = '8px';
        owCell.style.borderBottom = '1px solid #ddd';
        owCell.style.textAlign = 'center';
        row.appendChild(owCell);
        
        // Winner cell
        const winnerCell = document.createElement('td');
        winnerCell.textContent = winner;
        winnerCell.style.padding = '8px';
        winnerCell.style.borderBottom = '1px solid #ddd';
        winnerCell.style.fontWeight = 'bold';
        winnerCell.style.textAlign = 'center';
        
        // Color for winner
        if (winner === 'NS') {
            winnerCell.style.color = '#27ae60';
        } else if (winner === 'OW') {
            winnerCell.style.color = '#e74c3c';
        }
        
        row.appendChild(winnerCell);
        
        tbody.appendChild(row);
        } catch (error) {
            console.error(`Error analyzing trump ${trumpSuit.name}:`, error);
            
            // Create error row
            const row = document.createElement('tr');
            
            // Trump cell
            const trumpCell = document.createElement('td');
            trumpCell.textContent = trumpSuit.name;
            trumpCell.style.padding = '8px';
            trumpCell.style.borderBottom = '1px solid #ddd';
            
            // Set color for heart and diamond
            if (trumpSuit.name === "♥ Herz" || trumpSuit.name === "♦ Karo") {
                trumpCell.style.color = '#e74c3c';
            }
            
            row.appendChild(trumpCell);
            
            // Error message cell that spans 3 columns
            const errorCell = document.createElement('td');
            errorCell.textContent = "Berechnungsfehler";
            errorCell.colSpan = 3;
            errorCell.style.padding = '8px';
            errorCell.style.borderBottom = '1px solid #ddd';
            errorCell.style.textAlign = 'center';
            errorCell.style.fontStyle = 'italic';
            row.appendChild(errorCell);
            
            tbody.appendChild(row);
        }
    }
    
    table.appendChild(tbody);
    analysisContainer.appendChild(table);
    
    // Add the analysis to the deal card
    dealCard.appendChild(analysisContainer);
}

/**
 * Analyze a card distribution directly and return the results
 * @param {string|object} distribution - Card distribution in string format or JSON
 * @returns {Object} - Analysis results for all trump suits
 */
function analyzeCardDistribution(distribution) {
    // Process the distribution
    const hands = processCardDistribution(distribution);
    
    // Create calculator instance
    const calculator = new BridgeTrickCalculator();
    
    // Format hands for the calculator
    const northHand = formatHandForAnalysis(hands[0]);
    const eastHand = formatHandForAnalysis(hands[1]);
    const southHand = formatHandForAnalysis(hands[2]);
    const westHand = formatHandForAnalysis(hands[3]);
    
    // Convert to the deck format
    const deck = calculator.convertHandsToDeck(northHand, eastHand, southHand, westHand);
    
    // Get cards per color
    calculator.calculateCardsPerColor(deck);
    const cardsPerColor = calculator.cardsPerColor;
    
    // Calculate results for each trump suit
    const trumpSuits = [
        { name: "♠ Pik", code: "0" },
        { name: "♥ Herz", code: "1" },
        { name: "♦ Karo", code: "2" },
        { name: "♣ Kreuz", code: "3" },
        { name: "NT", code: "5" }
    ];
    
    const results = {};
    
    // Perform calculations for each trump suit
    for (const trumpSuit of trumpSuits) {
        try {
            // Create a deep copy of the deck for each analysis
            const deckCopy = JSON.parse(JSON.stringify(deck));
            
            // Set trump suit
            calculator.trump = trumpSuit.code;
            
            // Try with different lead players for a better analysis
            let totalNSScore = 0;
            let validCalculations = 0;
            
            // Each player leads once
            for (let leader = 0; leader < 4; leader++) {
                try {
                    calculator.lead = leader;
                    const nsScore = calculator.calculate(JSON.parse(JSON.stringify(deckCopy)));
                    
                    if (nsScore >= 0 && nsScore <= cardsPerColor) {
                        // Only count valid scores
                        totalNSScore += nsScore;
                        validCalculations++;
                    }
                } catch (err) {
                    console.warn(`Error calculating with leader ${leader}:`, err);
                }
            }
            
            // Average the results, default to half if no valid calculations
            const nsStiche = validCalculations > 0 ? 
                Math.round(totalNSScore / validCalculations) :
                Math.floor(cardsPerColor / 2);
            
            // Make sure the score is valid
            const validNSStiche = Math.max(0, Math.min(nsStiche, cardsPerColor));
            const owStiche = cardsPerColor - validNSStiche;
            
            // Determine winner
            let winner = "Unentschieden";
            if (validNSStiche > owStiche) {
                winner = "NS";
            } else if (owStiche > validNSStiche) {
                winner = "OW";
            }
            
            // Store results
            results[trumpSuit.name] = {
                nsStiche: validNSStiche,
                owStiche: owStiche,
                winner: winner
            };
            
        } catch (error) {
            console.error(`Error analyzing trump ${trumpSuit.name}:`, error);
            
            results[trumpSuit.name] = {
                nsStiche: "Error",
                owStiche: "Error",
                winner: "Error"
            };
        }
    }
    
    return results;
}

/**
 * Helper function to format a hand for the analyzer
 * Maps the hand to the format expected by the calculator
 */
function formatHandForAnalysis(hand) {
    const formattedHand = {
        'S': [],
        'H': [],
        'D': [],
        'C': []
    };
    
    // Sort cards by rank within each suit for better analysis
    const rankOrder = {};
    "AKQJT98765432".split('').forEach((rank, index) => {
        rankOrder[rank] = index;
    });
    
    hand.forEach(card => {
        const suit = card.slice(-1);
        const value = card.slice(0, -1);
        if (formattedHand[suit]) {
            formattedHand[suit].push(value);
        }
    });
    
    // Sort each suit by rank
    Object.keys(formattedHand).forEach(suit => {
        formattedHand[suit].sort((a, b) => rankOrder[a] - rankOrder[b]);
    });
    
    // Convert arrays to strings
    Object.keys(formattedHand).forEach(suit => {
        if (formattedHand[suit].length === 0) {
            formattedHand[suit] = "";
        } else {
            formattedHand[suit] = formattedHand[suit].join("");
        }
    });
    
    return formattedHand;
}

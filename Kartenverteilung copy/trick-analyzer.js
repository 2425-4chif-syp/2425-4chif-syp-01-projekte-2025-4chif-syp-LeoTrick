/**
 * Bridge Game Trick Analyzer
 * This file provides functionality to analyze bridge card tricks and determine winners.
 * Optimized for performance with variable card counts.
 */

class BridgeGameAnalyzer {
    constructor() {
        // Constants
        this.RANK_STRING = "AKQJT98765432"; // Card ranks from highest to lowest
        this.CARDS_PER_COLOR = 5; // Default, will be adjusted based on actual cards
        
        // Default initialization
        this.noDeals = 10;
        this.dealer = 0; // N
        this.height = 1;
        this.trump = "0"; // Spades
        this.lead = (this.dealer + 1) % 4;
        this.deals = [];
        
        // Performance settings
        this.MAX_CALCULATION_TIME = 3000; // Max 3 seconds per trump suit
        this.USE_MEMOIZATION = true; // Use memoization to avoid recalculating positions
        this.USE_ALPHA_BETA = true; // Use alpha-beta pruning
        this.ADJUST_DEPTH_LIMIT = true; // Automatically adjust max depth based on card count
        this.startTime = 0; // Track calculation start time
        this.memo = new Map(); // Memoization cache
    }

    /**
     * Sets parameters for the analysis
     */
    setParameters(dealerStr, contractStr, noDeals) {
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
            case 'P': this.trump = "0"; break;
            case 'H': this.trump = "1"; break;
            case 'K': this.trump = "2"; break;
            case 'T': this.trump = "3"; break;
            case 'N': this.trump = "5"; break;
            default: this.trump = "0";
        }
        
        // Number of deals
        this.noDeals = noDeals;
        
        // Who begins (Lead)
        this.lead = (this.dealer + 1) % 4;
    }

    /**
     * Analyze all deals
     */
    analyzeDeals(deals) {
        this.deals = deals;
        this.noDeals = deals.length;
        
        const results = [];
        
        for (let d = 0; d < this.noDeals; d++) {
            const results_for_deal = this.analyzeDealWithAllTrumps(deals[d]);
            results.push(results_for_deal);
        }
        
        return results;
    }
    
    /**
     * Calculate the total number of cards in the deck based on the hands
     */
    calculateCardsPerColor(deck) {
        let totalCards = 0;
        for (let player = 0; player < 4; player++) {
            for (let suit = 0; suit < 4; suit++) {
                if (deck[player][suit]) {
                    totalCards += deck[player][suit].length;
                }
            }
        }
        return Math.floor(totalCards / 4); // Total cards divided by number of suits
    }
    
    /**
     * Count total cards in a specific suit for all players
     */
    countCardsBySuit(deck, suitIndex) {
        let count = 0;
        for (let player = 0; player < 4; player++) {
            if (deck[player][suitIndex]) {
                count += deck[player][suitIndex].length;
            }
        }
        return count;
    }
    
    /**
     * Analyze a single deal with all possible trump suits
     * For ≤ 5 cards, calculate all trumps
     * For > 5 cards, only calculate NT (No Trump)
     */
    analyzeDealWithAllTrumps(deck) {
        // Calculate cards per suit based on the actual distribution
        this.CARDS_PER_COLOR = this.calculateCardsPerColor(deck);
        
        // Determine which trump suits to analyze based on card count
        let trumpSuits = ["0", "1", "2", "3", "5"]; // Spades, Hearts, Diamonds, Clubs, No Trump
        let trumpNames = ["♠ Pik", "♥ Herz", "♦ Karo", "♣ Kreuz", "NT"];
        
        // For more than 5 cards, only calculate NT
        if (this.CARDS_PER_COLOR > 5) {
            trumpSuits = ["5"]; // Only No Trump
            trumpNames = ["NT"];
        }
        
        const results = {};
        
        // Adjust max search depth based on card count
        let maxDepth = this.CARDS_PER_COLOR * 4; // Default full depth
        if (this.ADJUST_DEPTH_LIMIT) {
            if (this.CARDS_PER_COLOR > 8) {
                maxDepth = Math.min(12, this.CARDS_PER_COLOR * 1.5); // Very limited for many cards
            } else if (this.CARDS_PER_COLOR > 6) {
                maxDepth = Math.min(14, this.CARDS_PER_COLOR * 2); // Limited for medium-high card count
            } else if (this.CARDS_PER_COLOR > 5) {
                maxDepth = Math.min(16, this.CARDS_PER_COLOR * 3); // Moderate for 6 cards
            }
        }
        
        // If only calculating NT, allocate more resources to it
        if (trumpSuits.length === 1) {
            this.MAX_CALCULATION_TIME = 8000; // Allow more time for NT calculation
            this.memo = new Map(); // Clear memoization cache
        }
        
        for (let i = 0; i < trumpSuits.length; i++) {
            // Reset memoization cache for each trump suit
            if (this.USE_MEMOIZATION && trumpSuits.length > 1) {
                this.memo.clear();
            }
            
            this.trump = trumpSuits[i];
            const trick = ["", "", "", ""];
            const count = [0];
            
            // Reset timer
            this.startTime = Date.now();
            
            // Clone the deck to avoid modifying the original
            const deckCopy = JSON.parse(JSON.stringify(deck));
            
            // Start with NS player (North)
            let nsStiche;
            try {
                // Use alpha-beta pruning for better performance
                if (this.USE_ALPHA_BETA) {
                    nsStiche = this.tiefensucheAlphaBeta(
                        deckCopy, 
                        this.trump, 
                        0, 
                        trick, 
                        0, 
                        1, 
                        count, 
                        0, 
                        this.CARDS_PER_COLOR,
                        maxDepth
                    );
                } else {
                    nsStiche = this.tiefensuche(
                        deckCopy, 
                        this.trump, 
                        0, 
                        trick, 
                        0, 
                        1, 
                        count,
                        maxDepth
                    );
                }
            } catch (e) {
                if (e.message === 'TIMEOUT') {
                    // If timeout, use a more sophisticated estimation
                    nsStiche = this.estimatePosition(deckCopy, 0, this.trump);
                } else {
                    throw e;
                }
            }
            
            // Ensure the number of tricks is valid
            nsStiche = Math.max(0, nsStiche);
            nsStiche = Math.min(nsStiche, this.CARDS_PER_COLOR);
            
            // Calculate OW tricks
            const owStiche = this.CARDS_PER_COLOR - nsStiche;
            
            // Determine winner
            let winner = "Unentschieden";
            if (nsStiche > owStiche) {
                winner = "NS";
            } else if (owStiche > nsStiche) {
                winner = "OW";
            }
            
            // Calculate elapsed time
            const elapsedTime = Date.now() - this.startTime;
            
            results[trumpNames[i]] = {
                nsStiche,
                owStiche,
                winner,
                count: count[0], // Number of evaluations
                time: elapsedTime // Calculation time in ms
            };
        }
        
        // For cards > 5, fill in dummy values for the other trump suits
        if (this.CARDS_PER_COLOR > 5) {
            const ntResult = results["NT"];
            
            // Fill in placeholder values for other trumps
            ["♠ Pik", "♥ Herz", "♦ Karo", "♣ Kreuz"].forEach(suit => {
                results[suit] = {
                    nsStiche: "-",
                    owStiche: "-",
                    winner: "-",
                    count: 0,
                    time: 0
                };
            });
        }
        
        return results;
    }

    /**
     * Recursive search algorithm with alpha-beta pruning and depth limiting
     */
    tiefensucheAlphaBeta(deck, trump, lead, trick, winner, depth, count, alpha, beta, maxDepth) {
        count[0]++;
        
        // Check for timeout to prevent browser hang (check less frequently for better performance)
        if (count[0] % 2000 === 0 && (Date.now() - this.startTime) > this.MAX_CALCULATION_TIME) {
            throw new Error('TIMEOUT');
        }
        
        // Try to use memoization if enabled
        if (this.USE_MEMOIZATION) {
            const key = this.createPositionKey(deck, trump, lead, trick, winner, depth);
            if (this.memo.has(key)) {
                return this.memo.get(key);
            }
        }
        
        let toPlay = lead;
        let farbe = "5"; // No suit specified initially
        
        // Determine who plays next
        for (let i = 0; i < 4; i++) {
            if (!trick[toPlay] || trick[toPlay] === "") break;
            toPlay = (toPlay + 1) % 4;
        }
        
        // Determine suit if cards are already on the table
        if (trick[lead] && trick[lead] !== "") {
            farbe = trick[lead].substring(0, 1);
        }
        
        // Check if we've reached max depth (optimization for many cards)
        if (depth > maxDepth) {
            // Return a heuristic estimate when max depth is reached
            return this.estimatePosition(deck, winner, trump);
        }
        
        // Check if all cards have been played
        let allCardsPlayed = true;
        for (let player = 0; player < 4; player++) {
            for (let suit = 0; suit < 4; suit++) {
                if (deck[player][suit] && deck[player][suit].length > 0) {
                    allCardsPlayed = false;
                    break;
                }
            }
            if (!allCardsPlayed) break;
        }
        
        // If all cards have been played, count winning tricks for NS
        if (allCardsPlayed) {
            return (winner === 0 || winner === 2) ? 1 : 0;
        }
        
        let von = 0;
        let bis = 3;
        
        // If a suit was played and is still available, it must be followed
        if (farbe !== "5") {
            const f = parseInt(farbe);
            if (deck[toPlay][f] && deck[toPlay][f] !== "") {
                von = f;
                bis = f;
            }
        }
        
        let value = (toPlay === 0 || toPlay === 2) ? -1 : this.CARDS_PER_COLOR + 1;
        let foundMove = false;
        
        // Go through all possible moves with optimizations
        for (let f = von; f <= bis; f++) {
            if (!deck[toPlay][f] || deck[toPlay][f].length === 0) continue;
            
            // Get unique cards (optimization to avoid trying equivalent cards)
            const uniqueCards = this.getUniqueCards(deck[toPlay][f]);
            
            for (const cardIndex of uniqueCards) {
                foundMove = true;
                
                // Play card
                const cardValue = deck[toPlay][f].charAt(cardIndex);
                trick[toPlay] = String(f) + cardValue;
                let newWinner = winner;
                
                // Determine who wins the trick
                if (toPlay === lead) {
                    newWinner = toPlay;
                } else {
                    const winnerSuit = parseInt(trick[winner].substring(0, 1));
                    const playedSuit = parseInt(trick[toPlay].substring(0, 1));
                    
                    if (playedSuit === parseInt(trump) && winnerSuit !== parseInt(trump)) {
                        // Trump beats non-trump
                        newWinner = toPlay;
                    } else if (playedSuit === winnerSuit) {
                        // Same suit - compare ranks
                        const winnerRank = trick[winner].charAt(1);
                        const playedRank = trick[toPlay].charAt(1);
                        
                        if (this.RANK_STRING.indexOf(playedRank) < this.RANK_STRING.indexOf(winnerRank)) {
                            newWinner = toPlay;
                        }
                    }
                }
                
                // Remove card from deck
                const originalSuit = deck[toPlay][f];
                deck[toPlay][f] = originalSuit.substring(0, cardIndex) + originalSuit.substring(cardIndex+1);
                
                let nextLead = lead;
                let nextTrick = [...trick];
                let nextDepth = depth;
                let currentTrickScore = 0;
                
                // Check if trick is complete (all 4 players played)
                if ((toPlay + 1) % 4 === lead) {
                    // Trick is complete, start new trick
                    nextLead = newWinner;
                    nextTrick = ["", "", "", ""];
                    nextDepth += 1;
                    
                    // Award trick to winning team
                    if (newWinner === 0 || newWinner === 2) {
                        currentTrickScore = 1; // NS won this trick
                    }
                }
                
                // Recursive call with alpha-beta parameters
                const result = currentTrickScore + this.tiefensucheAlphaBeta(
                    deck, 
                    trump, 
                    nextLead, 
                    nextTrick, 
                    newWinner, 
                    nextDepth, 
                    count,
                    alpha,
                    beta,
                    maxDepth
                );
                
                // Put card back in deck for next iteration
                deck[toPlay][f] = originalSuit;
                
                // Minimax logic with alpha-beta pruning
                if (toPlay === 0 || toPlay === 2) { // NS player (maximizing)
                    value = Math.max(value, result);
                    alpha = Math.max(alpha, value);
                    if (alpha >= beta) break; // Beta cutoff
                } else { // EW player (minimizing)
                    value = Math.min(value, result);
                    beta = Math.min(beta, value);
                    if (beta <= alpha) break; // Alpha cutoff
                }
            }
            
            // If we've done a cutoff, no need to check other suits
            if ((toPlay === 0 || toPlay === 2) && alpha >= beta) break;
            if ((toPlay === 1 || toPlay === 3) && beta <= alpha) break;
        }
        
        // If no moves were found, return a default value
        if (!foundMove) {
            return (winner === 0 || winner === 2) ? 1 : 0;
        }
        
        // Normalize the result
        value = value === -1 ? 0 : (value > this.CARDS_PER_COLOR ? 0 : value);
        
        // Store in memoization cache if enabled
        if (this.USE_MEMOIZATION) {
            const key = this.createPositionKey(deck, trump, lead, trick, winner, depth);
            this.memo.set(key, value);
        }
        
        return value;
    }
    
    /**
     * Create a unique key for the current game position for memoization
     */
    createPositionKey(deck, trump, lead, trick, winner, depth) {
        // More efficient key creation
        let key = `${trump}|${lead}|${winner}|${depth}|`;
        
        // Add trick info
        for (let i = 0; i < 4; i++) {
            key += trick[i] || "-";
            key += ",";
        }
        
        // Add deck info (simplified to reduce key size)
        for (let player = 0; player < 4; player++) {
            for (let suit = 0; suit < 4; suit++) {
                if (deck[player][suit]) {
                    key += deck[player][suit].length;
                } else {
                    key += "0";
                }
                key += ",";
            }
        }
        
        return key;
    }
    
    /**
     * Get indices of unique cards in a suit to avoid redundant calculations
     */
    getUniqueCards(suitCards) {
        const uniqueIndices = [];
        const seen = new Set();
        
        for (let i = 0; i < suitCards.length; i++) {
            const card = suitCards[i];
            const rankIndex = this.RANK_STRING.indexOf(card);
            
            // Consider all high cards (A,K,Q,J,T) as unique for better accuracy
            if (rankIndex <= 4 || i === 0 || !seen.has(rankIndex) || 
                this.RANK_STRING.indexOf(suitCards[i-1]) !== rankIndex - 1) {
                uniqueIndices.push(i);
                seen.add(rankIndex);
            }
        }
        
        return uniqueIndices;
    }
    
    /**
     * Improved estimation function with trump consideration
     */
    estimatePosition(deck, winner, trumpSuit) {
        // Count high cards and trump cards for each team
        let nsScore = 0;
        let ewScore = 0;
        const highCards = "AKQJT"; // Consider more high cards for better estimation
        const trumpSuitNumber = parseInt(trumpSuit);
        
        for (let player = 0; player < 4; player++) {
            for (let suit = 0; suit < 4; suit++) {
                if (!deck[player][suit]) continue;
                
                for (const card of deck[player][suit]) {
                    // High card points
                    if (highCards.includes(card)) {
                        let value = 5 - highCards.indexOf(card); // A=5, K=4, Q=3, J=2, T=1
                        
                        // Add extra value for trumps
                        if (suit === trumpSuitNumber && trumpSuit !== "5") {
                            value *= 1.5; // Trumps are more valuable
                        }
                        
                        if (player === 0 || player === 2) { // NS
                            nsScore += value;
                        } else { // EW
                            ewScore += value;
                        }
                    }
                    // Add small value for low trump cards
                    else if (suit === trumpSuitNumber && trumpSuit !== "5") {
                        const value = 0.5; // Small value for low trumps
                        if (player === 0 || player === 2) {
                            nsScore += value;
                        } else {
                            ewScore += value;
                        }
                    }
                }
            }
        }
        
        // Also consider current trick winner
        if (winner === 0 || winner === 2) {
            nsScore += 1;
        } else if (winner === 1 || winner === 3) {
            ewScore += 1;
        }
        
        // Convert to expected number of tricks based on points
        const totalScore = nsScore + ewScore;
        if (totalScore === 0) return this.CARDS_PER_COLOR / 2; // Equal
        
        const nsRatio = nsScore / totalScore;
        // Apply a slight correction to avoid extreme values
        return Math.round(nsRatio * this.CARDS_PER_COLOR);
    }
    
    /**
     * Original tiefensuche method without alpha-beta pruning (kept as fallback)
     */
    tiefensuche(deck, trump, lead, trick, winner, depth, count, maxDepth) {
        count[0]++;
        
        // Check for timeout
        if (count[0] % 1000 === 0 && (Date.now() - this.startTime) > this.MAX_CALCULATION_TIME) {
            throw new Error('TIMEOUT');
        }
        
        // Similar to tiefensucheAlphaBeta but without pruning
        let toPlay = lead;
        let farbe = "5"; // No suit specified initially
        
        // Determine who plays next
        for (let i = 0; i < 4; i++) {
            if (!trick[toPlay] || trick[toPlay] === "") break;
            toPlay = (toPlay + 1) % 4;
        }
        
        // Determine suit if cards are already on the table
        if (trick[lead] && trick[lead] !== "") {
            farbe = trick[lead].substring(0, 1);
        }
        
        // Check if we've reached max depth
        if (depth > maxDepth) {
            return this.estimatePosition(deck, winner);
        }
        
        let von = 0;
        let bis = 3;
        
        // If a suit was played and is still available, it must be followed
        if (farbe !== "5") {
            const f = parseInt(farbe);
            if (deck[toPlay][f] && deck[toPlay][f] !== "") {
                von = f;
                bis = f;
            }
        }
        
        // Check if all cards have been played
        let allCardsPlayed = true;
        for (let player = 0; player < 4; player++) {
            for (let suit = 0; suit < 4; suit++) {
                if (deck[player][suit] && deck[player][suit].length > 0) {
                    allCardsPlayed = false;
                    break;
                }
            }
            if (!allCardsPlayed) break;
        }
        
        // If all cards have been played, count winning tricks for NS
        if (allCardsPlayed) {
            return (winner === 0 || winner === 2) ? 1 : 0;
        }
        
        let bestScore = (toPlay === 0 || toPlay === 2) ? -1 : this.CARDS_PER_COLOR + 1;
        let foundMove = false;
        
        // Go through all possible moves
        for (let f = von; f <= bis; f++) {
            if (!deck[toPlay][f] || deck[toPlay][f].length === 0) continue;
            
            // Use unique cards optimization here too
            const uniqueCards = this.getUniqueCards(deck[toPlay][f]);
            
            for (const cardIndex of uniqueCards) {
                foundMove = true;
                
                // Play card
                const cardValue = deck[toPlay][f].charAt(cardIndex);
                trick[toPlay] = String(f) + cardValue;
                let newWinner = winner;
                
                // Determine who wins the trick
                if (toPlay === lead) {
                    newWinner = toPlay;
                } else {
                    const winnerSuit = parseInt(trick[winner].substring(0, 1));
                    const playedSuit = parseInt(trick[toPlay].substring(0, 1));
                    
                    if (playedSuit === parseInt(trump) && winnerSuit !== parseInt(trump)) {
                        // Trump beats non-trump
                        newWinner = toPlay;
                    } else if (playedSuit === winnerSuit) {
                        // Same suit - compare ranks
                        const winnerRank = trick[winner].charAt(1);
                        const playedRank = trick[toPlay].charAt(1);
                        
                        if (this.RANK_STRING.indexOf(playedRank) < this.RANK_STRING.indexOf(winnerRank)) {
                            newWinner = toPlay;
                        }
                    }
                }
                
                // Remove card from deck
                const originalSuit = deck[toPlay][f];
                deck[toPlay][f] = originalSuit.substring(0, cardIndex) + originalSuit.substring(cardIndex+1);
                
                let nextLead = lead;
                let nextTrick = [...trick];
                let nextDepth = depth;
                let currentTrickScore = 0;
                
                // Check if trick is complete (all 4 players played)
                if ((toPlay + 1) % 4 === lead) {
                    // Trick is complete, start new trick
                    nextLead = newWinner;
                    nextTrick = ["", "", "", ""];
                    nextDepth += 1;
                    
                    // Award trick to winning team
                    if (newWinner === 0 || newWinner === 2) {
                        currentTrickScore = 1; // NS won this trick
                    }
                }
                
                // Recursive call
                const result = currentTrickScore + this.tiefensuche(
                    deck, 
                    trump, 
                    nextLead, 
                    nextTrick, 
                    newWinner, 
                    nextDepth, 
                    count,
                    maxDepth
                );
                
                // Put card back in deck for next iteration
                deck[toPlay][f] = originalSuit;
                
                // Minimax logic - NS wants to maximize, EW wants to minimize
                if (toPlay === 0 || toPlay === 2) { // NS player
                    bestScore = Math.max(bestScore, result);
                } else { // EW player
                    bestScore = Math.min(bestScore, result);
                }
            }
        }
        
        // If no moves were found, return a default value
        if (!foundMove) {
            return (winner === 0 || winner === 2) ? 1 : 0;
        }
        
        return bestScore === -1 ? 0 : (bestScore > this.CARDS_PER_COLOR ? 0 : bestScore);
    }

    /**
     * Convert the card distribution data from the CardDealer format to analyzer format
     */
    convertDealerOutputToAnalyzerFormat(northHand, westHand, eastHand, southHand) {
        const result = new Array(4);
        for (let player = 0; player < 4; player++) {
            result[player] = new Array(4);
            for (let suit = 0; suit < 4; suit++) {
                result[player][suit] = "";
            }
        }
        
        // Map formatted hands to the analyzer format
        if (northHand.S && northHand.S.cards) result[0][0] = northHand.S.cards.join("");
        if (northHand.H && northHand.H.cards) result[0][1] = northHand.H.cards.join("");
        if (northHand.D && northHand.D.cards) result[0][2] = northHand.D.cards.join("");
        if (northHand.C && northHand.C.cards) result[0][3] = northHand.C.cards.join("");
        
        if (westHand.S && westHand.S.cards) result[1][0] = westHand.S.cards.join("");
        if (westHand.H && westHand.H.cards) result[1][1] = westHand.H.cards.join("");
        if (westHand.D && westHand.D.cards) result[1][2] = westHand.D.cards.join("");
        if (westHand.C && westHand.C.cards) result[1][3] = westHand.C.cards.join("");
        
        if (eastHand.S && eastHand.S.cards) result[2][0] = eastHand.S.cards.join("");
        if (eastHand.H && eastHand.H.cards) result[2][1] = eastHand.H.cards.join("");
        if (eastHand.D && eastHand.D.cards) result[2][2] = eastHand.D.cards.join("");
        if (eastHand.C && eastHand.C.cards) result[2][3] = eastHand.C.cards.join("");
        
        if (southHand.S && southHand.S.cards) result[3][0] = southHand.S.cards.join("");
        if (southHand.H && southHand.H.cards) result[3][1] = southHand.H.cards.join("");
        if (southHand.D && southHand.D.cards) result[3][2] = southHand.D.cards.join("");
        if (southHand.C && southHand.C.cards) result[3][3] = southHand.C.cards.join("");
        
        return result;
    }
}

/**
 * Display the trick analysis results in the deal card
 */
function displayTrickAnalysis(dealCard, allPlayerHands) {
    // Create an instance of the analyzer
    const analyzer = new BridgeGameAnalyzer();
    
    // Erzeuge eine eindeutige ID für diesen Analysevorgang
    const analysisId = 'analysis-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Markiere, dass eine Berechnung im Gange ist
    calculationInProgress = true;
    shouldAbortCalculation = false;
    
    // Display a loading indicator
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading-container';
    loadingContainer.id = analysisId;
    loadingContainer.style.textAlign = 'center';
    loadingContainer.style.padding = '20px';
    
    // Füge Lade-Indikator und Abbrechen-Button hinzu
    loadingContainer.innerHTML = `
        <p>Berechne Stichanalyse...</p>
        <button id="abort-${analysisId}" class="abort-button">Abbrechen</button>
    `;
    dealCard.appendChild(loadingContainer);
    
    // Füge Event-Listener zum Abbrechen-Button hinzu
    setTimeout(() => {
        const abortButton = document.getElementById(`abort-${analysisId}`);
        if (abortButton) {
            abortButton.addEventListener('click', () => {
                shouldAbortCalculation = true;
                abortButton.textContent = "Wird abgebrochen...";
                abortButton.disabled = true;
            });
        }
    }, 0);
    
    // Use setTimeout to allow the UI to update
    setTimeout(() => {
        try {
            // Convert hand format
            const northHand = formatHandForTrickAnalyzer(allPlayerHands[0]);
            const westHand = formatHandForTrickAnalyzer(allPlayerHands[1]);
            const eastHand = formatHandForTrickAnalyzer(allPlayerHands[2]);
            const southHand = formatHandForTrickAnalyzer(allPlayerHands[3]);
            
            // Convert the deal to the analyzer format
            const formattedDeal = analyzer.convertDealerOutputToAnalyzerFormat(northHand, westHand, eastHand, southHand);
            
            // Analyze the deal with all trumps
            const results = analyzer.analyzeDealWithAllTrumps(formattedDeal);
            
            // Berechnung ist fertig
            calculationInProgress = false;
            
            // Remove loading indicator
            const loadingEl = document.getElementById(analysisId);
            if (loadingEl && loadingEl.parentNode) {
                loadingEl.parentNode.removeChild(loadingEl);
            }
            
            // Create the analysis table
            const tableContainer = document.createElement('div');
            tableContainer.className = 'analysis-container';
            tableContainer.style.marginTop = '20px';
            
            // Get number of cards per color
            const cardsPerColor = analyzer.CARDS_PER_COLOR;
            
            const analysisTitle = document.createElement('h3');
            if (cardsPerColor > 5) {
                analysisTitle.textContent = 'Stichanalyse (Nur NT berechnet)';
            } else {
                analysisTitle.textContent = 'Stichanalyse';
            }
            analysisTitle.style.marginBottom = '10px';
            tableContainer.appendChild(analysisTitle);
            
            const table = document.createElement('table');
            table.className = 'constraints-table';
            table.style.width = '100%';
            
            // Create header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['Trumpf', 'NS Stiche', 'OW Stiche', 'Gewinner'];
            
            // Only show time column for ≤ 5 cards
            if (cardsPerColor <= 5) {
                headers.push('Zeit (ms)');
            }
            
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create table body
            const tbody = document.createElement('tbody');
            
            // Display all trump options in the table
            const trumpOrder = ["♠ Pik", "♥ Herz", "♦ Karo", "♣ Kreuz", "NT"];
            
            trumpOrder.forEach(trumpName => {
                const result = results[trumpName];
                if (!result) return;
                
                const row = document.createElement('tr');
                
                const trumpCell = document.createElement('td');
                trumpCell.textContent = trumpName;
                trumpCell.className = 'label-cell';
                
                // Setze rote Farbe für Herz und Karo
                if (trumpName === "♥ Herz" || trumpName === "♦ Karo") {
                    trumpCell.style.color = '#e74c3c'; // Rote Farbe für Herz und Karo
                }
                
                row.appendChild(trumpCell);
                
                const nsCell = document.createElement('td');
                nsCell.textContent = result.nsStiche;
                
                // Highlight NT row for cards > 5
                if (cardsPerColor > 5 && trumpName === "NT") {
                    nsCell.style.fontWeight = 'bold';
                }
                row.appendChild(nsCell);
                
                const owCell = document.createElement('td');
                owCell.textContent = result.owStiche;
                if (cardsPerColor > 5 && trumpName === "NT") {
                    owCell.style.fontWeight = 'bold';
                }
                row.appendChild(owCell);
                
                const winnerCell = document.createElement('td');
                winnerCell.textContent = result.winner;
                winnerCell.style.fontWeight = 'bold';
                
                // Add color based on winner
                if (result.winner === 'NS') {
                    winnerCell.style.color = '#27ae60'; // Green
                } else if (result.winner === 'OW') {
                    winnerCell.style.color = '#e74c3c'; // Red
                }
                
                row.appendChild(winnerCell);
                
                // Add time cell for ≤ 5 cards
                if (cardsPerColor <= 5) {
                    const timeCell = document.createElement('td');
                    timeCell.textContent = result.time || '-';
                    row.appendChild(timeCell);
                }
                
                // Gray out rows that weren't calculated for > 5 cards
                if (cardsPerColor > 5 && trumpName !== "NT") {
                    row.style.color = '#999';
                    row.style.fontStyle = 'italic';
                    
                    // Für Herz und Karo trotz Grau-Ausblendung die rote Farbe beibehalten
                    if (trumpName === "♥ Herz" || trumpName === "♦ Karo") {
                        trumpCell.style.color = '#e74c3c';
                        trumpCell.style.opacity = '0.6'; // Etwas transparenter für grauen Effekt
                    }
                }
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            tableContainer.appendChild(table);
            
            // Add note for > 5 cards
            if (cardsPerColor > 5) {
                const note = document.createElement('p');
                note.style.fontSize = '0.9em';
                note.style.fontStyle = 'italic';
                note.style.marginTop = '10px';
                note.textContent = `Hinweis: Bei ${cardsPerColor} Karten wird aus Performance-Gründen nur "NT" berechnet.`;
                tableContainer.appendChild(note);
            }
            
            // Add the table to the deal card
            dealCard.appendChild(tableContainer);
            
            return results;
        } catch (error) {
            // Berechnung ist fertig (auch bei Fehler)
            calculationInProgress = false;
            
            // Handle errors gracefully
            const loadingEl = document.getElementById(analysisId);
            if (loadingEl && loadingEl.parentNode) {
                if (error.message === 'CALCULATION_ABORTED') {
                    loadingEl.innerHTML = '<p>Berechnung abgebrochen.</p>';
                    
                    // Füge einen Button hinzu, um die Berechnung neu zu starten
                    const retryButton = document.createElement('button');
                    retryButton.textContent = 'Erneut versuchen';
                    retryButton.className = 'retry-button';
                    retryButton.addEventListener('click', () => {
                        // Entferne die Meldung
                        if (loadingEl.parentNode) {
                            loadingEl.parentNode.removeChild(loadingEl);
                        }
                        
                        // Starte die Stichanalyse neu
                        displayTrickAnalysis(dealCard, allPlayerHands);
                    });
                    loadingEl.appendChild(retryButton);
                } else {
                    loadingEl.innerHTML = '<p>Fehler bei der Analyse. Zu komplexe Kartenverteilung.</p>';
                }
            }
            
            console.error("Trick analysis error:", error);
            return {};
        }
    }, 10); // Small timeout to ensure UI updates
    
    // Return empty result initially
    return {};
}

/**
 * Helper function to format a hand for the trick analyzer
 */
function formatHandForTrickAnalyzer(hand) {
    const formattedHand = {
        S: { cards: [] },
        H: { cards: [] },
        D: { cards: [] },
        C: { cards: [] }
    };
    
    hand.forEach(card => {
        const suit = card.slice(-1);
        const value = card.slice(0, -1);
        formattedHand[suit].cards.push(value);
    });
    
    return formattedHand;
}
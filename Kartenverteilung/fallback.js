/**
 * Bridge Card Distribution Analysis - Double Dummy Solver (Fallback Implementation)
 * 
 * This module provides functionality to analyze bridge card distributions
 * and calculate the maximum number of tricks each player/direction can make
 * with perfect play (double dummy analysis).
 * 
 * @author LeoTrick Project
 */

class BridgeDoubleDummySolver {
    constructor() {
        // Card representation constants
        this.SUITS = ["S", "H", "D", "C"]; // Spades, Hearts, Diamonds, Clubs
        this.DIRECTIONS = ["N", "E", "S", "W"]; // North, East, South, West
        this.TRUMPS = ["S", "H", "D", "C", "NT"]; // Spades, Hearts, Diamonds, Clubs, No Trump
        
        // Define default RANKS and CARD_VALUES
        const defaultRanks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
        
        // Card values for scoring (indexed by card rank)
        this.CARD_VALUES = {};
        for (let i = 0; i < defaultRanks.length; i++) {
            this.CARD_VALUES[defaultRanks[i]] = 14 - i; // A=14, K=13, etc.
        }
        
        // Update RANKS dynamically from window.values if available
        if (typeof window !== 'undefined' && window.values && Array.isArray(window.values)) {
            // Use window values directly (should be already filtered)
            this.RANKS = [...window.values]; // Create a new array to avoid reference issues
        } else {
            // Fall back to default if window.values is not available
            this.RANKS = defaultRanks.slice(0, 5); // Default to 5 cards if no preference set
        }
        
        // Performance optimization settings
        this.USE_MEMOIZATION = true;
        this.MAX_CALCULATION_TIME = 5000; // 5 seconds per analysis
        
        // Cache for memoization
        this.cache = new Map();
    }

    /**
     * Analyzes a card distribution to find the maximum number of tricks
     * each player can take with each trump suit
     * 
     * @param {Object} distribution - Object containing the cards for each player
     * @returns {Object} Analysis results for each trump suit and each direction
     */
    analyzeDistribution(distribution) {
        const results = {};
        
        // For each trump option
        for (const trump of this.TRUMPS) {
            results[trump] = this.analyzeWithTrump(distribution, trump);
        }
        
        return results;
    }
    
    /**
     * Analyzes a card distribution with a specific trump suit
     * 
     * @param {Object} distribution - Object containing the cards for each player
     * @param {String} trump - The trump suit (S, H, D, C, or NT)
     * @returns {Object} Number of tricks each direction can take
     */
    analyzeWithTrump(distribution, trump) {
        // Start with each player having 0 tricks
        const tricks = { "N": 0, "E": 0, "S": 0, "W": 0 };
        
        // Convert distribution to our internal format for analysis
        const gameState = this.prepareGameState(distribution, trump);
        
        // For each direction as the leader
        for (const leader of this.DIRECTIONS) {
            // Deep clone the game state to avoid modifying the original
            const initialState = this.cloneGameState(gameState);
            
            // Set the leader
            initialState.nextPlayer = this.DIRECTIONS.indexOf(leader);
            
            // Calculate maximum tricks
            const leaderIndex = this.DIRECTIONS.indexOf(leader);
            const partnerIndex = (leaderIndex + 2) % 4; // Partner is across the table
            
            // Reset memoization cache for this calculation
            this.cache.clear();
            const startTime = Date.now();
            
            // Run the double dummy solver
            const maxTricks = this.findMaxTricks(initialState, leaderIndex, startTime);
            
            // Update the tricks count for this player and their partner
            tricks[leader] = Math.max(tricks[leader], maxTricks);
            tricks[this.DIRECTIONS[partnerIndex]] = Math.max(tricks[this.DIRECTIONS[partnerIndex]], maxTricks);
        }
        
        return tricks;
    }
    
    /**
     * Recursive function to find the maximum number of tricks
     * 
     * @param {Object} state - Current game state
     * @param {Number} initialPlayer - The initial leading player
     * @param {Number} startTime - Time when calculation started (for timeout)
     * @returns {Number} Maximum number of tricks
     */
    findMaxTricks(state, initialPlayer, startTime) {
        // Check if we've timed out
        if (Date.now() - startTime > this.MAX_CALCULATION_TIME) {
            return this.estimateRemainingTricks(state, initialPlayer);
        }
        
        // Check if game is over
        if (this.isGameOver(state)) {
            return state.tricks[initialPlayer % 2]; // Count tricks for the partnership
        }
        
        // Check cache if memoization is enabled
        if (this.USE_MEMOIZATION) {
            const key = this.getStateKey(state);
            if (this.cache.has(key)) {
                return this.cache.get(key);
            }
        }
        
        // Determine which player's turn it is
        const currentPlayer = state.nextPlayer;
        const isMaximizingPlayer = currentPlayer % 2 === initialPlayer % 2;
        
        // Get legal moves
        const legalMoves = this.getLegalMoves(state);
        
        // No legal moves left, game is over
        if (legalMoves.length === 0) {
            return state.tricks[initialPlayer % 2];
        }
        
        let bestScore = isMaximizingPlayer ? -1 : 999;
        
        // Try each legal move
        for (const move of legalMoves) {
            // Make the move and get the new state
            const newState = this.makeMove(state, move);
            
            // Recursive call to continue the game
            const score = this.findMaxTricks(newState, initialPlayer, startTime);
            
            // Update best score
            if (isMaximizingPlayer) {
                bestScore = Math.max(bestScore, score);
            } else {
                bestScore = Math.min(bestScore, score);
            }
        }
        
        // Store in cache if memoization is enabled
        if (this.USE_MEMOIZATION) {
            const key = this.getStateKey(state);
            this.cache.set(key, bestScore);
        }
        
        return bestScore;
    }
    
    /**
     * Get a unique key for memoization cache
     */
    getStateKey(state) {
        // Create a string representation of the state
        const cardsKey = JSON.stringify(state.cards);
        return `${cardsKey}-${state.nextPlayer}-${JSON.stringify(state.tricks)}-${state.currentTrick.length}`;
    }
    
    /**
     * Finds legal moves for the current player
     */
    getLegalMoves(state) {
        const legalMoves = [];
        const currentPlayer = state.nextPlayer;
        const playerCards = state.cards[currentPlayer];
        
        // If this is the first card in the trick, any card is legal
        if (state.currentTrick.length === 0) {
            return [...playerCards];
        }
        
        // Must follow suit if possible
        const leadSuit = state.currentTrick[0].suit;
        const hasSuit = playerCards.some(card => card.suit === leadSuit);
        
        if (hasSuit) {
            // Must follow suit
            return playerCards.filter(card => card.suit === leadSuit);
        } else {
            // Can play any card
            return [...playerCards];
        }
    }
    
    /**
     * Makes a move and returns the new game state
     */
    makeMove(state, card) {
        // Clone the state to avoid modifying the original
        const newState = this.cloneGameState(state);
        const currentPlayer = newState.nextPlayer;
        
        // Remove the played card from player's hand
        newState.cards[currentPlayer] = newState.cards[currentPlayer].filter(c => 
            !(c.suit === card.suit && c.rank === card.rank)
        );
        
        // Add the card to the current trick
        newState.currentTrick.push({
            player: currentPlayer,
            suit: card.suit,
            rank: card.rank
        });
        
        // If the trick is complete (4 cards), determine winner and start a new trick
        if (newState.currentTrick.length === 4) {
            const winner = this.determineTrickWinner(newState.currentTrick, newState.trumpSuit);
            
            // Add trick to winner's count
            const partnershipIndex = winner % 2; // 0 for N-S, 1 for E-W
            newState.tricks[partnershipIndex] += 1;
            
            // Winner leads next trick
            newState.nextPlayer = winner;
            newState.currentTrick = [];
        } else {
            // Move to next player
            newState.nextPlayer = (currentPlayer + 1) % 4;
        }
        
        return newState;
    }
    
    /**
     * Determines the winner of a trick
     */
    determineTrickWinner(trick, trumpSuit) {
        // Handle the case when we have fewer than 4 players
        if (trick.length === 0) {
            return 0; // Default to first player if no cards
        }
        
        // The first card sets the lead suit
        const leadSuit = trick[0].suit;
        
        let winningCard = trick[0];
        let winningPlayer = trick[0].player;
        
        // Check each card in the trick
        for (let i = 1; i < trick.length; i++) {
            const card = trick[i];
            
            // Trump wins over all non-trump cards
            if (card.suit === trumpSuit && winningCard.suit !== trumpSuit) {
                winningCard = card;
                winningPlayer = card.player;
            } 
            // Higher trump card wins
            else if (card.suit === trumpSuit && winningCard.suit === trumpSuit) {
                if (this.CARD_VALUES[card.rank] > this.CARD_VALUES[winningCard.rank]) {
                    winningCard = card;
                    winningPlayer = card.player;
                }
            }
            // Higher card of the led suit wins if no trump played
            else if (card.suit === leadSuit && winningCard.suit === leadSuit) {
                if (this.CARD_VALUES[card.rank] > this.CARD_VALUES[winningCard.rank]) {
                    winningCard = card;
                    winningPlayer = card.player;
                }
            }
            // Card is neither trump nor the led suit, cannot win
        }
        
        return winningPlayer;
    }
    
    /**
     * Prepares a game state from the distribution
     */
    prepareGameState(distribution, trump) {
        const state = {
            cards: [[], [], [], []], // Cards for N, E, S, W
            nextPlayer: 0,          // N leads first by default
            currentTrick: [],       // Cards in current trick
            tricks: [0, 0],         // Tricks taken by each partnership (NS and EW)
            trumpSuit: trump === "NT" ? null : trump // No trump or specific suit
        };
        
        // Process each player's cards
        for (let i = 0; i < this.DIRECTIONS.length; i++) {
            const direction = this.DIRECTIONS[i];
            const playerCards = distribution[direction];
            
            // Process each card for this player
            for (const card of playerCards) {
                // Extract suit and rank
                const suit = card.charAt(1);
                const rank = card.charAt(0);
                
                // Add to player's hand
                state.cards[i].push({
                    suit: suit,
                    rank: rank
                });
            }
        }
        
        return state;
    }
    
    /**
     * Creates a deep clone of a game state
     */
    cloneGameState(state) {
        return {
            cards: state.cards.map(hand => hand.map(card => ({ ...card }))),
            nextPlayer: state.nextPlayer,
            currentTrick: [...state.currentTrick.map(card => ({ ...card }))],
            tricks: [...state.tricks],
            trumpSuit: state.trumpSuit
        };
    }
    
    /**
     * Checks if the game is over
     */
    isGameOver(state) {
        // Game is over when all cards are played
        return state.cards.every(hand => hand.length === 0);
    }
    
    /**
     * Estimates remaining tricks for heuristic evaluation
     * Used when calculation time exceeds limit
     */
    estimateRemainingTricks(state, initialPlayer) {
        // Count sure tricks based on high cards
        let remainingTricks = 0;
        const partnership = initialPlayer % 2; // 0 for N-S, 1 for E-W
        
        // Count tricks already taken
        remainingTricks += state.tricks[partnership];
        
        // Count total cards to determine max possible tricks
        let totalCards = 0;
        state.cards.forEach(hand => totalCards += hand.length);
        // Add cards in current trick
        totalCards += state.currentTrick.length;
        // Add played tricks
        totalCards += (state.tricks[0] + state.tricks[1]) * 4;
        
        // Maximum possible tricks is total cards / 4 (now based on card count selected)
        // For a 5-card game, this should be 5 tricks total (20 / 4)
        const maxPossibleTricks = Math.ceil(totalCards / 4);
        
        // Get the currently selected card count from window if available
        let selectedCardCount = 5; // Default to mini-bridge (5 cards)
        if (typeof window !== 'undefined' && window.values && Array.isArray(window.values)) {
            selectedCardCount = window.values.length;
        }
        
        // Adjust trick estimation based on the card count
        // For a 5-card game, no partnership can take more than 5 tricks
        const absoluteMaxTricks = selectedCardCount;
        
        // Count remaining sure tricks (but respect the card count limit)
        for (let i = 0; i < 4; i++) {
            // Only count for players in the partnership
            if (i % 2 === partnership) {
                const hand = state.cards[i];
                
                // Group cards by suit
                const bySuit = {};
                for (const card of hand) {
                    if (!bySuit[card.suit]) bySuit[card.suit] = [];
                    bySuit[card.suit].push(card);
                }
                
                // Count top cards (Aces and guarded Kings)
                for (const suit in bySuit) {
                    const suitCards = bySuit[suit].map(c => c.rank);
                    
                    // Aces always win
                    if (suitCards.includes("A")) {
                        remainingTricks += 1;
                    }
                    // Kings might win
                    else if (suitCards.includes("K") && suitCards.length > 1) {
                        remainingTricks += 0.5; // Partial trick probability
                    }
                }
            }
        }
        
        // Make sure we don't exceed the absolute maximum tricks possible
        return Math.min(Math.ceil(remainingTricks), maxPossibleTricks, absoluteMaxTricks);
    }
    
    /**
     * Formats the analysis results for display
     */
    formatResults(results) {
        const formattedResults = {
            byTrump: {},
            byDirection: {}
        };
        
        // Format by trump suit
        for (const trump in results) {
            formattedResults.byTrump[trump] = { ...results[trump] };
        }
        
        // Format by direction
        for (const direction of this.DIRECTIONS) {
            formattedResults.byDirection[direction] = {};
            for (const trump in results) {
                formattedResults.byDirection[direction][trump] = results[trump][direction];
            }
        }
        
        return formattedResults;
    }
    
    /**
     * Generates a double dummy table as seen in BBO
     */
    generateDoubleDummyTable(results) {
        // Determine max possible tricks from the results
        let maxPossibleTricks = 0;
        for (const trump of this.TRUMPS) {
            const rowData = results.byTrump[trump];
            for (const dir of this.DIRECTIONS) {
                maxPossibleTricks = Math.max(maxPossibleTricks, rowData[dir]);
            }
        }
        
        let table = `Double Dummy Analysis (Max Tricks: ${maxPossibleTricks}):\n`;
        table += " Trump  |   N   |   E   |   S   |   W   |\n";
        table += "--------|-------|-------|-------|-------|\n";
        
        for (const trump of this.TRUMPS) {
            const rowData = results.byTrump[trump];
            table += ` ${trump.padEnd(6)} | ${String(rowData.N).padStart(3)}   | ${String(rowData.E).padStart(3)}   | ${String(rowData.S).padStart(3)}   | ${String(rowData.W).padStart(3)}   |\n`;
        }
        
        return table;
    }
}

// Export the solver for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BridgeDoubleDummySolver };
} else {
    // Make available in browser global context
    // But do not redeclare if already defined (fixes duplicate declaration error)
    if (typeof window !== 'undefined' && !window.BridgeDoubleDummySolver) {
        window.BridgeDoubleDummySolver = BridgeDoubleDummySolver;
    }
}
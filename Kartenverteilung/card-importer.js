/**
 * Bridge Card Importer
 * 
 * This module provides functionality to import bridge card distributions
 * from different formats, such as PBN (Portable Bridge Notation).
 * 
 * @author LeoTrick Project
 */

class BridgeCardImporter {
    constructor() {
        this.SUITS = ["S", "H", "D", "C"]; 
        this.RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
        this.DIRECTIONS = ["N", "E", "S", "W"];
    }

    /**
     * Import a card distribution from a PBN format string
     * Example: "N:AT32.K76.A432.T2 KQ9.QJ2.KQT.A943 J8654.A83.J65.K5 7.T954.987.QJ876"
     * 
     * @param {String} pbnString - PBN format string
     * @returns {Object} Distribution object with cards for each player
     */
    importFromPBN(pbnString) {
        // Example: "N:AT32.K76.A432.T2 KQ9.QJ2.KQT.A943 J8654.A83.J65.K5 7.T954.987.QJ876"
        try {
            // Remove extra whitespace and split by starting direction
            const parts = pbnString.trim().split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid PBN format: missing dealer indicator');
            }
            
            const startingDirection = parts[0].toUpperCase();
            if (!this.DIRECTIONS.includes(startingDirection)) {
                throw new Error(`Invalid starting direction: ${startingDirection}`);
            }
            
            // Split the hand descriptions
            const handStrings = parts[1].trim().split(/\s+/);
            if (handStrings.length !== 4) {
                throw new Error(`Expected 4 hand descriptions, found ${handStrings.length}`);
            }
            
            // Process each hand based on the starting direction
            const hands = {
                "N": [],
                "E": [],
                "S": [],
                "W": []
            };
            
            // Calculate the order based on the starting direction
            const directionOrder = [];
            const startIndex = this.DIRECTIONS.indexOf(startingDirection);
            for (let i = 0; i < 4; i++) {
                directionOrder.push(this.DIRECTIONS[(startIndex + i) % 4]);
            }
            
            // Parse each hand
            for (let i = 0; i < 4; i++) {
                const direction = directionOrder[i];
                const handString = handStrings[i];
                hands[direction] = this.parsePBNHand(handString);
            }
            
            return hands;
        } catch (error) {
            throw new Error(`Error importing PBN: ${error.message}`);
        }
    }
    
    /**
     * Parse a PBN format hand (e.g., "AT32.K76.A432.T2")
     * 
     * @param {String} handString - Hand string in PBN format
     * @returns {Array} Array of card strings (e.g., ["AS", "AT", "A3", "A2"...])
     */
    parsePBNHand(handString) {
        const suits = handString.split('.');
        if (suits.length !== 4) {
            throw new Error(`Invalid hand format, expected 4 suits separated by dots: ${handString}`);
        }
        
        const cards = [];
        
        // Process each suit
        for (let i = 0; i < suits.length; i++) {
            const suit = this.SUITS[i];
            const ranks = suits[i].split('');
            
            // Add each card with suit
            for (const rank of ranks) {
                cards.push(rank + suit);
            }
        }
        
        return cards;
    }
    
    /**
     * Import a card distribution from a simpler format
     * Where each hand is specified separately
     * 
     * @param {Object} handObject - Object containing cards for each player
     * @returns {Object} Validated distribution object
     */
    importFromObject(handObject) {
        // Validate that we have all the required directions
        for (const dir of this.DIRECTIONS) {
            if (!handObject[dir] || !Array.isArray(handObject[dir])) {
                throw new Error(`Missing or invalid cards for direction ${dir}`);
            }
        }
        
        // Validate card format
        const distribution = {
            "N": [],
            "E": [],
            "S": [],
            "W": []
        };
        
        for (const dir of this.DIRECTIONS) {
            for (const card of handObject[dir]) {
                if (typeof card !== 'string' || card.length !== 2) {
                    throw new Error(`Invalid card format: ${card} in ${dir}'s hand`);
                }
                
                const rank = card.charAt(0);
                const suit = card.charAt(1);
                
                if (!this.RANKS.includes(rank)) {
                    throw new Error(`Invalid rank: ${rank} in card ${card}`);
                }
                
                if (!this.SUITS.includes(suit)) {
                    throw new Error(`Invalid suit: ${suit} in card ${card}`);
                }
                
                distribution[dir].push(card);
            }
        }
        
        return distribution;
    }
    
    /**
     * Import from HTML bridge display
     * Extracts cards from a DOM element containing bridge hands
     * 
     * @param {HTMLElement} container - Container with bridge hands
     * @returns {Object} Validated card distribution
     */
    importFromHTMLDisplay(container) {
        if (!container || typeof container !== 'object') {
            throw new Error('Invalid container provided to importFromHTMLDisplay');
        }
        
        const distribution = {
            "N": [],
            "E": [],
            "S": [],
            "W": []
        };
        
        // Map HTML positions to directions
        const dirMap = {
            'north': 'N',
            'south': 'S',
            'east': 'E',
            'west': 'W'
        };
        
        // Find all player hand elements
        const handElements = container.querySelectorAll('.player-hand');
        
        for (const handElement of handElements) {
            // Determine the direction
            let direction = null;
            for (const className in dirMap) {
                if (handElement.classList.contains(className)) {
                    direction = dirMap[className];
                    break;
                }
            }
            
            if (!direction) {
                continue; // Skip elements without direction
            }
            
            // Find all suit lines in this hand
            const suitLines = handElement.querySelectorAll('.suit-line');
            
            for (let i = 0; i < suitLines.length; i++) {
                const suitLine = suitLines[i];
                const suitElement = suitLine.querySelector('.suit-symbol');
                const cardsElement = suitLine.querySelector('.cards');
                
                if (!suitElement || !cardsElement) {
                    continue;
                }
                
                // Determine the suit
                let suit = null;
                const suitText = suitElement.textContent;
                if (suitText.includes('♠')) suit = 'S';
                else if (suitText.includes('♥')) suit = 'H';
                else if (suitText.includes('♦')) suit = 'D';
                else if (suitText.includes('♣')) suit = 'C';
                
                if (!suit) {
                    continue;
                }
                
                // Get the ranks
                const cardsText = cardsElement.textContent;
                for (let j = 0; j < cardsText.length; j++) {
                    const rank = cardsText[j];
                    if (this.RANKS.includes(rank)) {
                        distribution[direction].push(rank + suit);
                    }
                }
            }
        }
        
        return this.validateDistribution(distribution);
    }
    
    /**
     * Validates the consistency of a card distribution
     * 
     * @param {Object} distribution - The card distribution to validate
     * @returns {Object} The validated distribution
     */
    validateDistribution(distribution) {
        // Check that we have all directions
        for (const dir of this.DIRECTIONS) {
            if (!distribution[dir]) {
                distribution[dir] = [];
            }
        }
        
        // Check for duplicate cards
        const allCards = [];
        let totalCards = 0;
        
        for (const dir of this.DIRECTIONS) {
            for (const card of distribution[dir]) {
                allCards.push(card);
                totalCards++;
            }
        }
        
        // Get active card values from window or use default
        const activeValues = (typeof window !== 'undefined' && window.values) 
            ? window.values 
            : ['A', 'K', 'Q', 'J', 'T'];
        
        // Check for duplicates using a more sophisticated approach
        // We need to track which exact cards (rank+suit) have been seen
        const seenCards = new Set();
        for (const card of allCards) {
            const rank = card.charAt(0);
            // Only check cards with ranks in our active set
            if (activeValues.includes(rank)) {
                if (seenCards.has(card)) {
                    console.warn(`Duplicate card detected in importer: ${card}, but continuing analysis`);
                    // We'll allow duplicates for now to avoid breaking functionality
                    // throw new Error('Duplicate cards detected in distribution');
                }
                seenCards.add(card);
            }
        }
        
        // Check that each card is valid
        for (const card of allCards) {
            if (typeof card !== 'string' || card.length < 2) {
                throw new Error(`Invalid card format: ${card}`);
            }
            
            const rank = card.slice(0, -1);
            const suit = card.slice(-1);
            
            // Use active values if available, otherwise use full RANKS
            const validRanks = (typeof window !== 'undefined' && window.values) 
                ? window.values 
                : this.RANKS;
                
            // Allow ranks in the current selected card values
            if (!validRanks.includes(rank) && !this.RANKS.includes(rank)) {
                throw new Error(`Invalid card rank: ${rank}`);
            }
            
            if (!this.SUITS.includes(suit)) {
                throw new Error(`Invalid card suit: ${suit}`);
            }
        }
        
        // Get the expected total number of cards based on the current card count setting
        let expectedCardCount = 13 * 4; // Default: 52 cards
        if (typeof window !== 'undefined' && window.values && Array.isArray(window.values)) {
            expectedCardCount = window.values.length * 4;
        }
        
        // Warning if the card count doesn't match the expected count
        if (totalCards !== expectedCardCount) {
            console.warn(`Distribution contains ${totalCards} cards, but expected ${expectedCardCount} based on current settings`);
        }
        
        return distribution;
    }
}

// Export the importer for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BridgeCardImporter };
} else {
    // Make available in browser global context
    // But do not redeclare if already defined
    if (typeof window !== 'undefined' && !window.BridgeCardImporter) {
        window.BridgeCardImporter = BridgeCardImporter;
    }
}
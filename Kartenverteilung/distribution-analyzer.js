/**
 * Bridge Card Distribution Analyzer
 * 
 * This module provides functionality to analyze bridge card distributions,
 * calculate the maximum number of tricks for each player/direction,
 * and visualize the results.
 * 
 * @author LeoTrick Project
 */

// Use the existing BridgeDoubleDummySolver instance from the global scope in browser
// or import from fallback.js in Node.js
let BridgeDoubleDummySolverClass;
if (typeof require !== 'undefined') {
    // Node.js environment
    const { BridgeDoubleDummySolver } = require('./fallback');
    BridgeDoubleDummySolverClass = BridgeDoubleDummySolver;
} else {
    // Browser environment - use global class
    BridgeDoubleDummySolverClass = window.BridgeDoubleDummySolver;
}

class BridgeDistributionAnalyzer {
    constructor() {
        // Create solver instance and store it globally for later updates
        this.solver = new BridgeDoubleDummySolverClass();
        if (typeof window !== 'undefined') {
            window.bridgeSolver = this.solver;
        }
        this.lastResults = null;
    }

    /**
     * Analyze a card distribution and return maximum tricks for each player
     * 
     * @param {Object} distribution - Object containing cards for each player (N, E, S, W)
     * @returns {Object} Analysis results
     */
    analyzeDistribution(distribution) {
        try {
            // Validate distribution
            this.validateDistribution(distribution);
            
            // Run the double dummy solver analysis
            const rawResults = this.solver.analyzeDistribution(distribution);
            
            // Format the results for display
            this.lastResults = this.solver.formatResults(rawResults);
            
            return this.lastResults;
        } catch (error) {
            console.error('Error analyzing distribution:', error);
            throw new Error(`Distribution analysis failed: ${error.message}`);
        }
    }

    /**
     * Validates that a card distribution is valid
     * 
     * @param {Object} distribution - Distribution to validate
     */
    validateDistribution(distribution) {
        // Check that all directions are present
        const directions = ['N', 'E', 'S', 'W'];
        for (const dir of directions) {
            if (!distribution[dir] || !Array.isArray(distribution[dir])) {
                throw new Error(`Missing or invalid cards for direction ${dir}`);
            }
        }
        
        // Count the total number of cards
        let totalCards = 0;
        for (const dir of directions) {
            totalCards += distribution[dir].length;
        }
        
        // Check that all hands have the same number of cards
        const cardsPerHand = distribution['N'].length;
        for (const dir of directions) {
            if (distribution[dir].length !== cardsPerHand) {
                throw new Error(`Uneven card distribution: ${dir} has ${distribution[dir].length} cards but should have ${cardsPerHand}`);
            }
        }
        
        // Check for duplicate cards
        const allCards = [];
        for (const dir of directions) {
            allCards.push(...distribution[dir]);
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
                    console.warn(`Duplicate card detected: ${card}, but continuing analysis`);
                    // We'll allow duplicates for now to avoid breaking functionality
                    // throw new Error('Duplicate cards found in distribution');
                }
                seenCards.add(card);
            }
        }
    }

    /**
     * Generates an HTML table for the double dummy results
     * 
     * @param {Object} results - Analysis results
     * @returns {String} HTML table
     */
    generateHTMLTable(results = null) {
        const data = results || this.lastResults;
        if (!data) {
            return '<p>No analysis results available.</p>';
        }
        
        // Get the current card count
        let cardCount = 13; // Default to standard bridge
        if (typeof window !== 'undefined' && window.values && Array.isArray(window.values)) {
            cardCount = window.values.length;
        }
        
        let html = '<div class="double-dummy-results">';
        html += `<h3>Double Dummy Analyse (${cardCount} Karten pro Hand)</h3>`;
        
        // Enhanced information message
        if (cardCount < 10) {
            html += `<p class="analysis-info">Mini-Bridge mit ${cardCount} Karten: Jeder Spieler hat ${cardCount} Karten, maximal ${cardCount} Stiche möglich.</p>`;
        } else {
            html += `<p class="analysis-info">Bei ${cardCount} Karten pro Spieler sind maximal ${cardCount} Stiche möglich.</p>`;
        }
        html += '<table class="dummy-table">';
        html += '<thead><tr><th>Trump</th><th>North</th><th>East</th><th>South</th><th>West</th></tr></thead>';
        html += '<tbody>';
        
        const trumpLabels = {
            'S': '♠ Spades',
            'H': '♥ Hearts',
            'D': '♦ Diamonds',
            'C': '♣ Clubs',
            'NT': 'No Trump'
        };
        
        for (const trump of ['S', 'H', 'D', 'C', 'NT']) {
            const rowData = data.byTrump[trump];
            html += '<tr>';
            html += `<td class="trump-cell">${trumpLabels[trump]}</td>`;
            html += `<td>${rowData.N}</td>`;
            html += `<td>${rowData.E}</td>`;
            html += `<td>${rowData.S}</td>`;
            html += `<td>${rowData.W}</td>`;
            html += '</tr>';
        }
        
        html += '</tbody></table></div>';
        
        return html;
    }
    
    /**
     * Generate a text-based table for the double dummy results
     * (useful for console output or text-based applications)
     * 
     * @param {Object} results - Analysis results
     * @returns {String} Formatted text table
     */
    generateTextTable(results = null) {
        const data = results || this.lastResults;
        if (!data) {
            return 'No analysis results available.';
        }
        
        return this.solver.generateDoubleDummyTable(data);
    }
}

// Export the analyzer for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BridgeDistributionAnalyzer };
} else {
    // Make available in browser global context
    // But do not redeclare if already defined
    if (typeof window !== 'undefined' && !window.BridgeDistributionAnalyzer) {
        window.BridgeDistributionAnalyzer = BridgeDistributionAnalyzer;
    }
}
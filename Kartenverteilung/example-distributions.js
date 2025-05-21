/**
 * Example Bridge Card Distributions
 * 
 * This file contains example bridge card distributions for testing
 * the double dummy solver algorithm.
 * 
 * @author LeoTrick Project
 */

// Card format: [rank][suit], e.g., "AS" for Ace of Spades
// Use var instead of const to avoid redeclaration errors in browser
var EXAMPLE_DISTRIBUTIONS = window.EXAMPLE_DISTRIBUTIONS || {
    // Example 1: Standard balanced distribution
    standard: {
        "N": ["AS", "KS", "5S", "4S", "AH", "QH", "JH", "AD", "5D", "4D", "3D", "KC", "7C"],
        "E": ["QS", "9S", "8S", "7S", "KH", "7H", "6H", "KD", "JD", "8D", "QC", "JC", "5C"],
        "S": ["JS", "6S", "3S", "2S", "5H", "4H", "3H", "QD", "TD", "9D", "AC", "TC", "9C"],
        "W": ["TS", "7S", "TH", "9H", "8H", "2H", "7D", "6D", "2D", "8C", "6C", "4C", "3C"]
    },

    // Example 2: Distribution with a very strong North hand
    strongNorth: {
        "N": ["AS", "KS", "QS", "JS", "AH", "KH", "QH", "JH", "AD", "KD", "QD", "AC", "KC"],
        "E": ["TS", "9S", "8S", "TH", "9H", "8H", "JD", "TD", "9D", "QC", "JC", "TC", "9C"],
        "S": ["7S", "6S", "5S", "7H", "6H", "5H", "8D", "7D", "6D", "8C", "7C", "6C", "5C"],
        "W": ["4S", "3S", "2S", "4H", "3H", "2H", "5D", "4D", "3D", "2D", "4C", "3C", "2C"]
    },

    // Example 3: Distribution with extreme shape
    extremeShape: {
        "N": ["AS", "KS", "QS", "JS", "TS", "9S", "8S", "7S", "6S", "5S", "4S", "3S", "2S"],
        "E": ["AH", "KH", "QH", "JH", "TH", "9H", "8H", "7H", "6H", "5H", "4H", "3H", "2H"],
        "S": ["AD", "KD", "QD", "JD", "TD", "9D", "8D", "7D", "6D", "5D", "4D", "3D", "2D"],
        "W": ["AC", "KC", "QC", "JC", "TC", "9C", "8C", "7C", "6C", "5C", "4C", "3C", "2C"]
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EXAMPLE_DISTRIBUTIONS };
} else if (typeof window !== 'undefined') {
    // Make available in browser global context
    window.EXAMPLE_DISTRIBUTIONS = EXAMPLE_DISTRIBUTIONS;
}
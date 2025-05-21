/**
 * Bridge Trick Calculator
 * 
 * This module provides a high-level interface for calculating
 * the maximum possible tricks in a bridge hand distribution.
 * 
 * @author LeoTrick Project
 */

// Use global variables in browser context or imports in Node.js
let BridgeDistributionAnalyzerClass, ExampleDistributions;

if (typeof require !== 'undefined') {
    // Node.js environment
    const { BridgeDistributionAnalyzer } = require('./distribution-analyzer');
    const { EXAMPLE_DISTRIBUTIONS } = require('./example-distributions');
    BridgeDistributionAnalyzerClass = BridgeDistributionAnalyzer;
    ExampleDistributions = EXAMPLE_DISTRIBUTIONS;
} else {
    // Browser environment
    BridgeDistributionAnalyzerClass = window.BridgeDistributionAnalyzer;
    ExampleDistributions = window.EXAMPLE_DISTRIBUTIONS;
}

class BridgeTrickCalculator {
    constructor() {
        this.analyzer = new BridgeDistributionAnalyzerClass();
    }

    /**
     * Calculate the maximum possible tricks for each direction
     * 
     * @param {Object} distribution - Card distribution object
     * @returns {Object} Maximum tricks per direction and trump
     */
    calculateMaxTricks(distribution) {
        return this.analyzer.analyzeDistribution(distribution);
    }

    /**
     * Generate an HTML representation of the double dummy analysis
     * 
     * @param {Object} results - Analysis results (optional, uses last results if not provided)
     * @returns {String} HTML markup for the results
     */
    generateHTML(results) {
        return this.analyzer.generateHTMLTable(results);
    }

    /**
     * Generate a text-based representation of the double dummy analysis
     * 
     * @param {Object} results - Analysis results (optional, uses last results if not provided)
     * @returns {String} Formatted text representation
     */
    generateTextOutput(results) {
        return this.analyzer.generateTextTable(results);
    }

    /**
     * Get example distributions for testing
     * 
     * @param {String} name - Name of the example (optional)
     * @returns {Object} Example distribution(s)
     */
    getExampleDistribution(name) {
        if (name && ExampleDistributions[name]) {
            return ExampleDistributions[name];
        }
        return ExampleDistributions;
    }
    
    /**
     * Create a distribution from card strings
     * 
     * @param {Array} northCards - Array of card strings for North
     * @param {Array} eastCards - Array of card strings for East
     * @param {Array} southCards - Array of card strings for South
     * @param {Array} westCards - Array of card strings for West
     * @returns {Object} Card distribution object
     */
    createDistribution(northCards, eastCards, southCards, westCards) {
        return {
            "N": northCards,
            "E": eastCards,
            "S": southCards,
            "W": westCards
        };
    }
    
    /**
     * Run an example calculation with output
     * 
     * @param {String} exampleName - Name of the example to run (defaults to 'standard')
     * @returns {Object} The analysis results
     */
    runExample(exampleName = 'standard') {
        console.log(`Running bridge trick calculation for example: ${exampleName}`);
        
        // Get the example distribution
        const distribution = this.getExampleDistribution(exampleName);
        if (!distribution) {
            console.error(`Example '${exampleName}' not found`);
            return null;
        }
        
        // Run the analysis
        const results = this.calculateMaxTricks(distribution);
        
        // Output the results
        console.log(this.generateTextOutput(results));
        
        return results;
    }
}

// Export the calculator for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BridgeTrickCalculator };
    
    // Allow direct execution for testing
    if (require.main === module) {
        const calculator = new BridgeTrickCalculator();
        calculator.runExample();
    }
} else {
    // Make available in browser global context
    // But do not redeclare if already defined
    if (typeof window !== 'undefined' && !window.BridgeTrickCalculator) {
        window.BridgeTrickCalculator = BridgeTrickCalculator;
    }
}
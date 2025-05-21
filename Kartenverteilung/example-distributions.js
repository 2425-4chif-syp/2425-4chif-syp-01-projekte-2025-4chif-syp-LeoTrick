/**
 * Example Card Distributions for Bridge
 * This file contains examples in different formats for testing
 */

// Example distributions in string format (Spades-Hearts-Diamonds-Clubs order for each player)
const stringDistributions = [
    // North;East;South;West
    "T-QT-K-T;AQ--A-AJ;K-KJ-Q-K;J-A-JT-Q", // Basic example
    "AKJ-QT9-K7-AQJ2;Q82-A65-AQT5-T53;T93-J87-J932-K87;7654-K432-864-96", // Full deck example
    // Empty suits represented by dashes
    "AKQ-A-T-JT;--KQJ-AKQ;-KQJ-A-T;JT-T-A-A"
];

// Example distributions in JSON format
const jsonDistributions = [
    // Basic example with short keys
    {
        "N": {"S": "T", "H": "QT", "D": "K", "C": "T"},
        "E": {"S": "AQ", "H": "", "D": "A", "C": "AJ"},
        "S": {"S": "K", "H": "KJ", "D": "Q", "C": "K"},
        "W": {"S": "J", "H": "A", "D": "JT", "C": "Q"}
    },
    
    // Full deck example with full names
    {
        "North": {
            "Spades": "AKJ",
            "Hearts": "QT9",
            "Diamonds": "K7",
            "Clubs": "AQJ2"
        },
        "East": {
            "Spades": "Q82",
            "Hearts": "A65",
            "Diamonds": "AQT5",
            "Clubs": "T53"
        },
        "South": {
            "Spades": "T93",
            "Hearts": "J87",
            "Diamonds": "J932",
            "Clubs": "K87"
        },
        "West": {
            "Spades": "7654",
            "Hearts": "K432",
            "Diamonds": "864",
            "Clubs": "96"
        }
    },
    
    // Array format example
    {
        "N": {"S": ["A", "K", "J"], "H": ["Q", "T", "9"], "D": ["K", "7"], "C": ["A", "Q", "J", "2"]},
        "E": {"S": ["Q", "8", "2"], "H": ["A", "6", "5"], "D": ["A", "Q", "T", "5"], "C": ["T", "5", "3"]},
        "S": {"S": ["T", "9", "3"], "H": ["J", "8", "7"], "D": ["J", "9", "3", "2"], "C": ["K", "8", "7"]},
        "W": {"S": ["7", "6", "5", "4"], "H": ["K", "4", "3", "2"], "D": ["8", "6", "4"], "C": ["9", "6"]}
    }
];

// Function to get a random example distribution
function getRandomDistribution() {
    // Randomly choose between string and JSON format
    const useStringFormat = Math.random() > 0.5;
    
    if (useStringFormat) {
        const index = Math.floor(Math.random() * stringDistributions.length);
        return stringDistributions[index];
    } else {
        const index = Math.floor(Math.random() * jsonDistributions.length);
        return JSON.stringify(jsonDistributions[index]);
    }
}

// Add examples to the UI if appropriate elements exist
document.addEventListener('DOMContentLoaded', function() {
    const exampleDistElem = document.getElementById('exampleDistribution');
    
    if (exampleDistElem) {
        // Start with the simplest example
        exampleDistElem.textContent = stringDistributions[0];
        
        // Add a button to cycle through examples if it doesn't exist
        if (!document.getElementById('cycleExamplesBtn')) {
            const cycleBtn = document.createElement('button');
            cycleBtn.id = 'cycleExamplesBtn';
            cycleBtn.textContent = 'Nächstes Beispiel';
            cycleBtn.style.padding = '8px 16px';
            cycleBtn.style.backgroundColor = '#27ae60';
            cycleBtn.style.color = 'white';
            cycleBtn.style.border = 'none';
            cycleBtn.style.borderRadius = '4px';
            cycleBtn.style.cursor = 'pointer';
            cycleBtn.style.marginLeft = '10px';
            
            cycleBtn.addEventListener('click', function() {
                const newExample = getRandomDistribution();
                exampleDistElem.textContent = newExample;
            });
            
            const exampleSection = document.querySelector('.example-section');
            if (exampleSection) {
                exampleSection.appendChild(cycleBtn);
            }
        }
    }
});
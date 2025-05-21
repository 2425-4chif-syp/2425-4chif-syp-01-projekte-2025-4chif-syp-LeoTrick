document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for improved toast notification
    const style = document.createElement('style');
    style.textContent = `
        .fixed-cards-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 1;
            transition: opacity 0.5s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 90%;
        }
        
        .toast-icon {
            font-size: 1.2rem;
        }
        
        .toast-close {
            margin-left: 12px;
            cursor: pointer;
            font-size: 1.2rem;
            font-weight: bold;
            opacity: 0.8;
        }
        
        .toast-close:hover {
            opacity: 1;
        }
        
        .fixed-cards-toast.fade-out {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);

    // Add style for the analysis-info
    const analysisInfoStyle = document.createElement('style');
    analysisInfoStyle.textContent = `
        .analysis-info {
            background-color: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
            margin-bottom: 10px;
            border-left: 3px solid var(--accent-color);
        }
    `;
    document.head.appendChild(analysisInfoStyle);
    // DOM-Elemente
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const dealsContainer = document.getElementById('deals-container');
    const playerSelect = document.getElementById('player');
    const singlePlayerConstraints = document.getElementById('single-player-constraints');
    const allPlayersConstraints = document.getElementById('all-players-constraints');
    const cardCountSelect = document.getElementById('cardCount');

    // Kartenwerte und Farben
    window.values = ['A', 'K', 'Q', 'J', 'T']; // Default: 5 Karten (wird durch cardCountSelect aktualisiert)
    const values = window.values; // Local reference for easier access
    const suits = ['S', 'H', 'D', 'C'];
    const suitSymbols = {
        'S': '♠',
        'H': '♥',
        'D': '♦',
        'C': '♣'
    };
    const playerNames = ['Nord', 'West', 'Ost', 'Süd'];
    const positions = ['N', 'W', 'O', 'S'];

    // Event Listener für Spielerauswahl
    playerSelect.addEventListener('change', () => {
        const selectedPlayer = playerSelect.value;
        if (selectedPlayer === 'all') {
            singlePlayerConstraints.style.display = 'none';
            allPlayersConstraints.style.display = 'block';
        } else {
            singlePlayerConstraints.style.display = 'block';
            allPlayersConstraints.style.display = 'none';
        }
    });

    // Funktion zum Aktualisieren der Kartenwerte basierend auf der ausgewählten Anzahl
    function updateCardValues() {
        const selectedCount = parseInt(cardCountSelect.value);
        
        // Reset both arrays completely
        values.length = 0;
        window.values = []; // Create a new array instead of modifying the existing one
        
        // Make values reference the global array to ensure they're always in sync
        window.values = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'].slice(0, selectedCount);
        // Point the local reference to the same array
        Object.assign(values, window.values);
        
        // Update solver array and trick analyzer when changing card count
        if (window.BridgeDoubleDummySolver && window.bridgeSolver) {
            window.bridgeSolver.RANKS = [...window.values];
        }
        
        // Reset any fixed hands when card count changes
        document.getElementById('fixedHandFormat').value = '';
        
        // Update trick analysis UI elements if they exist
        const analysisInfoElements = document.querySelectorAll('.analysis-info');
        analysisInfoElements.forEach(el => {
            el.textContent = `Bei ${selectedCount} Karten pro Spieler sind maximal ${selectedCount} Stiche möglich.`;
        });
        
        // Wenn ein Solver vorhanden ist, aktualisiere seine Arrays
        if (window.BridgeDoubleDummySolver && window.bridgeSolver instanceof window.BridgeDoubleDummySolver) {
            // Update RANKS - create a new array to avoid reference issues
            const allRanks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
            window.bridgeSolver.RANKS = allRanks.slice(0, selectedCount);
            
            // Update CARD_VALUES based on rank position
            window.bridgeSolver.CARD_VALUES = {};
            for (let i = 0; i < allRanks.length; i++) {
                window.bridgeSolver.CARD_VALUES[allRanks[i]] = 14 - i; // A=14, K=13, etc.
            }
        }
        
        console.log(`Card values updated to: ${window.values.join(', ')}`);
    }
    
    // Initialisiere Kartenwerte bei Seitenladung
    updateCardValues();
    
    // Eventlistener für Kartenzahlauswahl
    cardCountSelect.addEventListener('change', updateCardValues);

    // Hilfsfunktionen
    function createDeck() {
        const deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push(value + suit);
            }
        }
        return deck;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function calculateHCP(hand) {
        const points = {
            'A': 4,
            'K': 3,
            'Q': 2,
            'J': 1
        };
        return hand.reduce((sum, card) => sum + (points[card[0]] || 0), 0);
    }

    function calculateTP(hand) {
        const hcp = calculateHCP(hand);
        const distribution = {
            'S': 0, 'H': 0, 'D': 0, 'C': 0
        };

        hand.forEach(card => {
            const suit = card.slice(-1);
            distribution[suit]++;
        });

        let distributionPoints = 0;
        Object.values(distribution).forEach(length => {
            if (length === 0) distributionPoints += 3;
            else if (length === 1) distributionPoints += 2;
            else if (length === 2) distributionPoints += 1;
        });

        return hcp + distributionPoints;
    }

    function getSuitLength(hand, targetSuit) {
        return hand.filter(card => card.endsWith(targetSuit)).length;
    }

    function checkConstraints(hand, playerIndex) {
        const selectedPlayer = playerSelect.value;

        if (selectedPlayer === 'all') {
            // Bestehende Logik für alle Spieler
            const position = positions[playerIndex];

            const hcp = calculateHCP(hand);
            const minHcp = parseInt(document.getElementById(`hcp_min_${position}`).value) || 0;
            const maxHcp = parseInt(document.getElementById(`hcp_max_${position}`).value) || 40;
            if (hcp < minHcp || hcp > maxHcp) return false;

            const tp = calculateTP(hand);
            const minTp = parseInt(document.getElementById(`tp_min_${position}`).value) || 0;
            const maxTp = parseInt(document.getElementById(`tp_max_${position}`).value) || 50;
            if (tp < minTp || tp > maxTp) return false;

            const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
            const suitCodes = ['S', 'H', 'D', 'C'];

            for (let i = 0; i < suits.length; i++) {
                const length = getSuitLength(hand, suitCodes[i]);
                const minLength = parseInt(document.getElementById(`${suits[i]}_min_${position}`).value) || 0;
                const maxLength = parseInt(document.getElementById(`${suits[i]}_max_${position}`).value) || 13;
                if (length < minLength || length > maxLength) return false;
            }
        } else {
            // Neue Logik für einzelnen Spieler
            const selectedIndex = parseInt(selectedPlayer);
            if (playerIndex !== selectedIndex) return true; // Keine Bedingungen für andere Spieler

            const hcp = calculateHCP(hand);
            const minHcp = parseInt(document.getElementById('minHcp').value) || 0;
            const maxHcp = parseInt(document.getElementById('maxHcp').value) || 40;
            if (hcp < minHcp || hcp > maxHcp) return false;

            const tp = calculateTP(hand);
            const minTp = parseInt(document.getElementById('minTp').value) || 0;
            const maxTp = parseInt(document.getElementById('maxTp').value) || 50;
            if (tp < minTp || tp > maxTp) return false;

            const suitLengths = {
                'S': getSuitLength(hand, 'S'),
                'H': getSuitLength(hand, 'H'),
                'D': getSuitLength(hand, 'D'),
                'C': getSuitLength(hand, 'C')
            };

            const minSpades = parseInt(document.getElementById('minSpades').value) || 0;
            const maxSpades = parseInt(document.getElementById('maxSpades').value) || 13;
            if (suitLengths['S'] < minSpades || suitLengths['S'] > maxSpades) return false;

            const minHearts = parseInt(document.getElementById('minHearts').value) || 0;
            const maxHearts = parseInt(document.getElementById('maxHearts').value) || 13;
            if (suitLengths['H'] < minHearts || suitLengths['H'] > maxHearts) return false;

            const minDiamonds = parseInt(document.getElementById('minDiamonds').value) || 0;
            const maxDiamonds = parseInt(document.getElementById('maxDiamonds').value) || 13;
            if (suitLengths['D'] < minDiamonds || suitLengths['D'] > maxDiamonds) return false;

            const minClubs = parseInt(document.getElementById('minClubs').value) || 0;
            const maxClubs = parseInt(document.getElementById('maxClubs').value) || 13;
            if (suitLengths['C'] < minClubs || suitLengths['C'] > maxClubs) return false;
        }

        return true;
    }

    function formatHandForDisplay(hand) {
        const suits = {
            'S': [], 'H': [], 'D': [], 'C': []
        };

        hand.forEach(card => {
            const suit = card.slice(-1);
            const value = card.slice(0, -1);
            suits[suit].push(value);
        });

        Object.values(suits).forEach(suitCards => {
            suitCards.sort((a, b) => values.indexOf(a) - values.indexOf(b));
        });

        return suits;
    }

    function createDealCard(hands, dealNumber) {
        const dealCard = document.createElement('div');
        dealCard.className = 'deal-card';

        const title = document.createElement('div');
        title.className = 'deal-title';
        title.textContent = `Verteilung ${dealNumber}`;
        dealCard.appendChild(title);

        const bridgeTable = document.createElement('div');
        bridgeTable.className = 'bridge-table';

        // Leere Zelle oben links
        bridgeTable.appendChild(document.createElement('div'));

        // Nord
        const northHand = document.createElement('div');
        northHand.className = 'player-hand north';
        displayHand(hands[0], northHand);
        bridgeTable.appendChild(northHand);

        // Leere Zelle oben rechts
        bridgeTable.appendChild(document.createElement('div'));

        // West
        const westHand = document.createElement('div');
        westHand.className = 'player-hand west';
        displayHand(hands[1], westHand);
        bridgeTable.appendChild(westHand);

        // Leere Zelle in der Mitte
        bridgeTable.appendChild(document.createElement('div'));

        // Ost
        const eastHand = document.createElement('div');
        eastHand.className = 'player-hand east';
        displayHand(hands[2], eastHand);
        bridgeTable.appendChild(eastHand);

        // Leere Zelle unten links
        bridgeTable.appendChild(document.createElement('div'));

        // Süd
        const southHand = document.createElement('div');
        southHand.className = 'player-hand south';
        displayHand(hands[3], southHand);
        bridgeTable.appendChild(southHand);

        // Leere Zelle unten rechts
        bridgeTable.appendChild(document.createElement('div'));

        dealCard.appendChild(bridgeTable);
        
        // Add trick analysis to the deal card
        displayTrickAnalysis(dealCard, hands);
        
        return dealCard;
    }
    
    /**
     * Display the trick analysis for a given deal
     * @param {HTMLElement} container - The element to append the analysis to
     * @param {Array} hands - The hands for North, West, East, South
     */
    function displayTrickAnalysis(container, hands) {
        try {
            // First create a distribution object in the format our analyzer expects
            const distribution = {
                "N": [],
                "E": [],
                "S": [],
                "W": []
            };
            
            // Map the positions from our order (N, W, E, S) to expected order (N, E, S, W)
            const positionMap = {
                0: "N", // North stays North
                1: "W", // West stays West
                2: "E", // East stays East 
                3: "S"  // South stays South
            };
            
            // For each hand, convert cards to the format expected by the analyzer
            hands.forEach((hand, index) => {
                const position = positionMap[index];
                hand.forEach(card => {
                    distribution[position].push(card);
                });
            });
            
            // Initialize the Bridge Trick Calculator
            // Make sure BridgeTrickCalculator is defined in the global scope
            if (typeof window.BridgeTrickCalculator === 'undefined') {
                throw new Error('BridgeTrickCalculator is not defined. Make sure it is loaded before script.js');
            }
            
            const calculator = new window.BridgeTrickCalculator();
            
            // Calculate the maximum tricks
            const results = calculator.calculateMaxTricks(distribution);
            
            // Generate HTML representation
            const analysisHTML = calculator.generateHTML(results);
            
            // Create and append the analysis section
            const analysisSection = document.createElement('div');
            analysisSection.className = 'trick-analysis-section';
            analysisSection.innerHTML = '<h3>Stichanalyse (Double Dummy)</h3>' + analysisHTML;
            container.appendChild(analysisSection);
            
            // Return the results for potential further use
            return results;
        } catch (error) {
            console.error('Error in trick analysis:', error);
            
            // Create error message element
            const errorElement = document.createElement('div');
            errorElement.className = 'trick-analysis-error';
            errorElement.textContent = 'Stichanalyse konnte nicht durchgeführt werden.';
            container.appendChild(errorElement);
            
            return null;
        }
    }

    function displayHand(hand, container) {
        const formattedHand = formatHandForDisplay(hand);
        const handDiv = document.createElement('div');
        handDiv.className = 'hand-content';

        suits.forEach(suit => {
            const suitLine = document.createElement('div');
            suitLine.className = `suit-line ${suit === 'H' || suit === 'D' ? 'red' : 'black'}`;

            const symbol = document.createElement('span');
            symbol.className = 'suit-symbol';
            symbol.textContent = suitSymbols[suit];
            suitLine.appendChild(symbol);

            const cards = document.createElement('span');
            cards.className = 'cards';
            cards.textContent = formattedHand[suit].join('') || '-';
            suitLine.appendChild(cards);

            handDiv.appendChild(suitLine);
        });

        container.appendChild(handDiv);
    }
    

    function formatHandForText(hand) {
        const formattedHand = formatHandForDisplay(hand);
        return Object.values(formattedHand)
            .map(suitCards => suitCards.join('') || '-')
            .join('-');
    }

    function formatDealsForSimpleText(deals) {
        return deals.map((hands, gameIndex) => {
            let output = `# Spiel ${gameIndex + 1}\n`;
            const handStrings = hands.map(hand => {
                const formattedHand = formatHandForDisplay(hand);
                return Object.values(formattedHand)
                    .map(suitCards => suitCards.join('') || '-')
                    .join('-');
            });
            output += handStrings.join(';');
            
            // Add analysis results if available
            if (deals.analysisResults && deals.analysisResults[gameIndex]) {
                output += '\n# Stichanalyse\n';
                const analysis = deals.analysisResults[gameIndex];
                for (const [trumpName, result] of Object.entries(analysis)) {
                    output += `${trumpName}: NS=${result.nsStiche} OW=${result.owStiche} Gewinner=${result.winner}\n`;
                }
            }
            
            output += '\n====================';
            return output;
        }).join('\n\n');
    }

    function formatDealsForJSON(deals) {
        return deals.map((hands, gameIndex) => {
            const dealData = {
                gameNumber: gameIndex + 1,
                hands: hands.map((hand, playerIndex) => {
                    const formattedHand = formatHandForDisplay(hand);
                    const hcp = calculateHCP(hand);
                    const tp = calculateTP(hand);

                    return {
                        player: playerNames[playerIndex],
                        position: positions[playerIndex],
                        suits: {
                            spades: {
                                cards: formattedHand['S'],
                                length: formattedHand['S'].length
                            },
                            hearts: {
                                cards: formattedHand['H'],
                                length: formattedHand['H'].length
                            },
                            diamonds: {
                                cards: formattedHand['D'],
                                length: formattedHand['D'].length
                            },
                            clubs: {
                                cards: formattedHand['C'],
                                length: formattedHand['C'].length
                            }
                        },
                        hcp: hcp,
                        tp: tp,
                        totalCards: hand.length
                    };
                })
            };
            
            // Add analysis results if available
            if (deals.analysisResults && deals.analysisResults[gameIndex]) {
                dealData.analysis = deals.analysisResults[gameIndex];
            }
            
            return dealData;
        });
    }

    /**
     * Parse fixed hand input in format "J-QJ-K-J;QT---Q-QT;" into card objects
     * Format ist: Spades-Hearts-Diamonds-Clubs;
     * @returns {Array} Array of card objects with player index and card value
     */
    function parseFixedHand() {
        // Get the fixed hand input in new format
        const fixedHandFormat = document.getElementById('fixedHandFormat').value.trim().toUpperCase();
        
        // Check if we have any fixed cards
        if (!fixedHandFormat) {
            return [];
        }
        
        // Validate the format (should contain dashes and semicolon)
        if (!fixedHandFormat.includes('-') || !fixedHandFormat.includes(';')) {
            alert('Ungültiges Format. Bitte verwenden Sie das Format: Pik-Herz-Karo-Kreuz; (z.B. AK-QJ-KQ-AJ;)');
            return [];
        }
        
        // Split by semicolon to get each player's fixed cards
        const playerInputs = fixedHandFormat.split(';').filter(input => input.trim().length > 0);
        
        // If no valid inputs, return empty array
        if (playerInputs.length === 0) {
            return [];
        }
        
        // Get the selected player
        const selectedPlayer = playerSelect.value;
        let playerIndex = -1;
        
        if (selectedPlayer !== 'all') {
            playerIndex = parseInt(selectedPlayer);
            if (isNaN(playerIndex) || playerIndex < 0 || playerIndex > 3) {
                return []; // No valid player selected
            }
        } else {
            // Handle "all" players case - show an alert since we need a specific player
            alert('Bitte wählen Sie einen bestimmten Spieler (Nord, West, Ost oder Süd) aus, um fixierte Karten zu verwenden.');
            document.getElementById('fixedHandFormat').value = '';
            return [];
        }
        
        const fixedCards = [];
        
        // Process first player input (only support one player's fixed cards for now)
        const playerInput = playerInputs[0];
        
        // Split by dash to get each suit
        const suitInputs = playerInput.split('-');
        
        // Make sure we have exactly 4 entries, even if they're empty
        while (suitInputs.length < 4) {
            suitInputs.push('');
        }
        
        // If we have more than 4, combine the extra ones with the last one
        if (suitInputs.length > 4) {
            suitInputs[3] = suitInputs.slice(3).join('-');
            suitInputs.length = 4;
        }
        
        // Parse each suit
        const suits = ['S', 'H', 'D', 'C']; // Spades, Hearts, Diamonds, Clubs
        
        for (let i = 0; i < 4; i++) {
            const suitInput = suitInputs[i];
            const suit = suits[i];
            
            // Parse cards for this suit
            for (const card of suitInput) {
                // Skip invalid characters and check if the card is valid in the current card set
                if (!values.includes(card)) continue;
                
                // Add card
                fixedCards.push({
                    playerIndex: playerIndex,
                    card: card + suit
                });
            }
        }
        
        // Check if the fixed cards exceed the selected card count per player
        const selectedCardCount = values.length;
        if (fixedCards.length > selectedCardCount) {
            alert(`Sie haben zu viele Karten fixiert (${fixedCards.length}). Bei ${selectedCardCount} Karten pro Spieler können maximal ${selectedCardCount} Karten fixiert werden.`);
            return [];
        }
        
        // Check for duplicate cards
        const cardSet = new Set();
        const duplicates = [];
        
        for (const card of fixedCards) {
            if (cardSet.has(card.card)) {
                duplicates.push(card.card);
            } else {
                cardSet.add(card.card);
            }
        }
        
        if (duplicates.length > 0) {
            alert(`Doppelte Karten gefunden: ${duplicates.join(', ')}. Bitte fixieren Sie jede Karte nur einmal.`);
            return [];
        }
        
        return fixedCards;
    }
    
    // Funktion, um eine Zusammenfassung der fixierten Karten anzuzeigen
    function showFixedCardsSummary(fixedCards) {
        if (fixedCards.length === 0) return;
        
        // Organisiere die Karten nach Farben
        const cardsBySuit = {
            'S': [],
            'H': [],
            'D': [],
            'C': []
        };
        
        // Sammle alle Karten nach Farben
        for (const fc of fixedCards) {
            const suit = fc.card.charAt(1);
            const rank = fc.card.charAt(0);
            cardsBySuit[suit].push(rank);
        }
        
        // Get player name
        const playerIndex = fixedCards[0]?.playerIndex;
        const playerNames = ['Nord', 'Ost', 'Süd', 'West'];
        const playerName = playerNames[playerIndex] || 'Spieler';
        
        // Baue die Zusammenfassung
        let summary = `Fixierte Karten für ${playerName}: `;
        const suitSymbols = {
            'S': '♠',
            'H': '♥',
            'D': '♦',
            'C': '♣'
        };
        
        for (const suit in cardsBySuit) {
            if (cardsBySuit[suit].length > 0) {
                // Sort cards in descending order of rank for better display
                cardsBySuit[suit].sort((a, b) => {
                    const rankOrder = window.values;
                    return rankOrder.indexOf(a) - rankOrder.indexOf(b);
                });
                
                summary += `${suitSymbols[suit]} ${cardsBySuit[suit].join('')} `;
            }
        }
        
        // Count total fixed cards
        const totalFixedCards = fixedCards.length;
        summary += `(${totalFixedCards} Karten)`;
        
        // Zeige einen kurzen Toast/Alert
        const toast = document.createElement('div');
        toast.className = 'fixed-cards-toast';
        
        // Add an icon
        const iconSpan = document.createElement('span');
        iconSpan.className = 'toast-icon';
        iconSpan.textContent = '📌';
        toast.appendChild(iconSpan);
        
        // Add the message
        const messageSpan = document.createElement('span');
        messageSpan.textContent = summary;
        toast.appendChild(messageSpan);
        
        // Add a close button
        const closeBtn = document.createElement('span');
        closeBtn.className = 'toast-close';
        closeBtn.textContent = '×';
        closeBtn.onclick = () => toast.remove();
        toast.appendChild(closeBtn);
        
        document.body.appendChild(toast);
        
        // Lösche den Toast nach 5 Sekunden (länger für mehr Lesbarkeit)
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }
    
    function generateDeal() {
        const maxAttempts = 1000;
        let attempts = 0;
        
        // Parse fixed hand cards
        const fixedCards = parseFixedHand();
        const fixedCardValues = fixedCards.map(fc => fc.card);
        
        // Zeige Zusammenfassung der fixierten Karten an
        showFixedCardsSummary(fixedCards);
        
        while (attempts < maxAttempts) {
            attempts++;
            
            // Create deck without fixed cards
            const deck = createDeck().filter(card => !fixedCardValues.includes(card));
            shuffle(deck);
            
            // Initialize hands
            const hands = [[], [], [], []];
            
            // Add fixed cards to the appropriate hands
            for (const fixedCard of fixedCards) {
                hands[fixedCard.playerIndex].push(fixedCard.card);
            }
            
            // Distribute remaining cards
            let currentIndex = 0;
            for (let i = 0; i < deck.length; i++) {
                // Find next hand that needs cards
                while (true) {
                    if (hands[currentIndex % 4].length < values.length) {
                        break;
                    }
                    currentIndex++;
                }
                
                hands[currentIndex % 4].push(deck[i]);
                currentIndex++;
            }
            
            if (hands.every((hand, index) => checkConstraints(hand, index))) {
                return hands;
            }
        }
        
        return null;
    }

    // Event listener for player selection to show/hide fixed hand
    playerSelect.addEventListener('change', () => {
        // Existing player selection logic...
        const selectedPlayer = playerSelect.value;
        if (selectedPlayer === 'all') {
            singlePlayerConstraints.style.display = 'none';
            allPlayersConstraints.style.display = 'block';
            // Clear fixed hand input for 'all' selection
            document.getElementById('fixedHandFormat').value = '';
        } else {
            singlePlayerConstraints.style.display = 'block';
            allPlayersConstraints.style.display = 'none';
        }
    });
    
    // Event Listeners
    generateBtn.addEventListener('click', () => {
        const noDeals = parseInt(document.getElementById('noDeals').value) || 1;
        const allDeals = [];
        let dealsGenerated = 0;

        dealsContainer.innerHTML = '';

        for (let i = 0; i < noDeals; i++) {
            const hands = generateDeal();

            if (hands) {
                dealsGenerated++;
                allDeals.push(hands);

                const dealCard = createDealCard(hands, dealsGenerated);
                dealsContainer.appendChild(dealCard);
            }
        }

        if (dealsGenerated < noDeals) {
            alert('Es konnten nicht alle gewünschten Verteilungen mit den gegebenen Bedingungen generiert werden.');
        }

        dealsContainer.dataset.deals = JSON.stringify(allDeals);
    });

    copyBtn.addEventListener('click', () => {
        const allDeals = JSON.parse(dealsContainer.dataset.deals || '[]');
        const textToCopy = formatDealsForSimpleText(allDeals);

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Kopiert!';
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 5H7C5.89543 5 5 5.89543 5 7V13C5 14.1046 5.89543 15 7 15H13C14.1046 15 15 14.1046 15 13V7C15 5.89543 14.1046 5 13 5Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M3 11H2C0.895431 11 0 10.1046 0 9V2C0 0.895431 0.895431 0 2 0H9C10.1046 0 11 0.895431 11 2V3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Kopieren
                `;
            }, 2000);
        });
    });

    downloadBtn.addEventListener('click', () => {
        const allDeals = JSON.parse(dealsContainer.dataset.deals || '[]');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        const jsonContent = formatDealsForJSON(allDeals);
        const jsonBlob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
        const jsonUrl = window.URL.createObjectURL(jsonBlob);

        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `kartenverteilung_${timestamp}.json`;
        document.body.appendChild(jsonLink);
        jsonLink.click();
        window.URL.revokeObjectURL(jsonUrl);
        document.body.removeChild(jsonLink);

        const textContent = formatDealsForSimpleText(allDeals);
        const textBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const textUrl = window.URL.createObjectURL(textBlob);

        const textLink = document.createElement('a');
        textLink.href = textUrl;
        textLink.download = `kartenverteilung_${timestamp}.txt`;
        document.body.appendChild(textLink);
        textLink.click();
        window.URL.revokeObjectURL(textUrl);
        document.body.removeChild(textLink);
    });
    
    // Stichanalyse für alle angezeigten Verteilungen
    analyzeBtn.addEventListener('click', () => {
        const allDeals = JSON.parse(dealsContainer.dataset.deals || '[]');
        if (allDeals.length === 0) {
            alert('Bitte zuerst Kartenverteilungen generieren.');
            return;
        }
        
        // Find or create status element
        const statusElement = document.querySelector('.analysis-status') || (() => {
            const element = document.createElement('div');
            element.className = 'analysis-status';
            const controls = document.querySelector('.controls');
            if (controls) {
                controls.appendChild(element);
            }
            return element;
        })();
        
        // Show status and update
        statusElement.classList.remove('hidden', 'error', 'success');
        statusElement.textContent = `Stichanalyse wird gestartet...`;
        
        // Save the original button text
        const originalButtonText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
        analyzeBtn.disabled = true;
        
        // Start analysis in the next tick to allow UI update
        setTimeout(() => {
            try {
                // Create instances of the needed classes
                if (typeof window.BridgeTrickCalculator === 'undefined') {
                    throw new Error('BridgeTrickCalculator is not defined. Make sure it is loaded before script.js');
                }
                if (typeof window.BridgeCardImporter === 'undefined') {
                    throw new Error('BridgeCardImporter is not defined. Make sure it is loaded before script.js');
                }
                
                const calculator = new window.BridgeTrickCalculator();
                const importer = new window.BridgeCardImporter();
                
                // Store analysis results
                const analysisResults = [];
                
                // Get all deal cards in the container
                const dealCards = document.querySelectorAll('.deal-card');
                const totalDeals = dealCards.length;
                
                // Update status
                if (statusElement) {
                    statusElement.textContent = `Analysiere 0 von ${totalDeals} Verteilungen...`;
                }
                
                dealCards.forEach((dealCard, index) => {
                    try {
                        // Import hand from HTML display
                        const bridgeTable = dealCard.querySelector('.bridge-table');
                        if (!bridgeTable) return;
                        
                        const distribution = importer.importFromHTMLDisplay(bridgeTable);
                        
                        // Calculate maximum tricks
                        const results = calculator.calculateMaxTricks(distribution);
                        
                        // Store results
                        analysisResults[index] = results;
                        
                        // Display results in the UI
                        let existingAnalysis = dealCard.querySelector('.trick-analysis-section');
                        if (existingAnalysis) {
                            dealCard.removeChild(existingAnalysis);
                        }
                        
                        // Create and append analysis section
                        const analysisHTML = calculator.generateHTML(results);
                        const analysisSection = document.createElement('div');
                        analysisSection.className = 'trick-analysis-section';
                        analysisSection.innerHTML = '<h3>Stichanalyse (Double Dummy)</h3>' + analysisHTML;
                        dealCard.appendChild(analysisSection);
                        
                        // Update progress status
                        if (statusElement) {
                            statusElement.textContent = `Analysiere ${index + 1} von ${totalDeals} Verteilungen...`;
                        }
                    } catch (error) {
                        console.error(`Error analyzing deal ${index + 1}:`, error);
                        
                        // Show error in deal card
                        const errorElement = document.createElement('div');
                        errorElement.className = 'trick-analysis-error';
                        errorElement.textContent = `Fehler bei der Analyse: ${error.message}`;
                        dealCard.appendChild(errorElement);
                    }
                });
                
                // Store analysis results in the dataset for later export
                allDeals.analysisResults = analysisResults;
                dealsContainer.dataset.deals = JSON.stringify(allDeals);
                
                // Reset button state
                analyzeBtn.innerHTML = originalButtonText;
                analyzeBtn.disabled = false;
                
                // Update completion status
                if (statusElement) {
                    statusElement.classList.add('success');
                    statusElement.textContent = `Stichanalyse abgeschlossen für ${dealCards.length} Verteilungen`;
                    
                    // Hide success message after a few seconds
                    setTimeout(() => {
                        if (statusElement.classList.contains('success')) {
                            statusElement.classList.add('hidden');
                        }
                    }, 5000);
                }
                
                console.log('Stichanalyse abgeschlossen für', dealCards.length, 'Verteilungen');
            } catch (error) {
                console.error('Fehler bei der Stichanalyse:', error);
                
                // Show error in status
                if (statusElement) {
                    statusElement.classList.add('error');
                    statusElement.textContent = `Fehler bei der Stichanalyse: ${error.message}`;
                } else {
                    alert('Bei der Stichanalyse ist ein Fehler aufgetreten: ' + error.message);
                }
                
                // Reset button state
                analyzeBtn.innerHTML = originalButtonText;
                analyzeBtn.disabled = false;
            }
        }, 100);
    });

    // Example button for fixed hand format
    const exampleBtn = document.getElementById('exampleBtn');
    if (exampleBtn) {
        exampleBtn.addEventListener('click', function() {
            const fixedHandFormatInput = document.getElementById('fixedHandFormat');
            if (fixedHandFormatInput) {
                // Generate example based on current card count
                const selectedCount = parseInt(cardCountSelect.value);
                let example = '';
                
                if (selectedCount === 5) {
                    // Example for 5-card game: AK-QJ--; (A,K of Spades, Q,J of Hearts)
                    example = 'AK-QJ--;';
                } else if (selectedCount === 13) {
                    // Example for full bridge deck
                    example = 'AKQ-AKQ-AKQ-AKQ;';
                } else {
                    // Generate dynamic example based on card count
                    const cards = window.values.slice(0, Math.min(4, selectedCount));
                    example = `${cards.slice(0, 2).join('')}-${cards.slice(0, 2).join('')}-${cards.slice(0, 1).join('')}-;`;
                }
                
                // Insert example format
                fixedHandFormatInput.value = example;
                // Focus on the input
                fixedHandFormatInput.focus();
            }
        });
    }
});
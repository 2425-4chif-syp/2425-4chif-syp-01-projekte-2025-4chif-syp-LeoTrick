document.addEventListener('DOMContentLoaded', () => {
    // DOM-Elemente
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const dealsContainer = document.getElementById('deals-container');
    const playerSelect = document.getElementById('player');
    const singlePlayerConstraints = document.getElementById('single-player-constraints');
    const allPlayersConstraints = document.getElementById('all-players-constraints');
    const cardCountSelect = document.getElementById('cardCount');

    // Kartenwerte und Farben
    const values = ['A', 'K', 'Q', 'J', 'T'];
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

    // Hinzufügen eines Dropdown-Menüs für die Kartenauswahl
    cardCountSelect.addEventListener('change', () => {
        const selectedCount = parseInt(cardCountSelect.value);
        values.length = 0; // Leere das Array

        // Füge die entsprechenden Kartenwerte hinzu
        const allValues = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        for (let i = 0; i < selectedCount; i++) {
            values.push(allValues[i]);
        }
    });

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

        // Format suits to ensure correct dash handling for empty suits and separation
        const formattedSuits = {
            'S': suits['S'].join('') || '-',
            'H': suits['H'].join('') || '-',
            'D': suits['D'].join('') || '-',
            'C': suits['C'].join('') || '-'
        };

        return {
            'S': formattedSuits['S'],
            'H': formattedSuits['H'],
            'D': formattedSuits['D'],
            'C': formattedSuits['C']
        };
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
            const suitCards = Array.isArray(formattedHand[suit]) ? formattedHand[suit] : [formattedHand[suit]]; // Sicherstellen, dass es ein Array ist
            cards.textContent = suitCards.join('') || '-';
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
        return deals.map((hands) => {
            // Rearrange hands to follow clockwise order: North, East, South, West
            const clockwiseHands = [hands[0], hands[2], hands[3], hands[1]];

            const handStrings = clockwiseHands.map(hand => {
                const formattedHand = formatHandForDisplay(hand);
                return Object.values(formattedHand)
                    .map(suitCards => suitCards || '-') // Ensure empty suits are represented by a single dash
                    .join('-') // Add a single dash for separation
                    .replace(/--+/g, '--'); // Ensure no more than two dashes in a row
            });

            return handStrings.join(';');
        }).join('\n'); // Zeilenumbruch nach jedem Spiel
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

    function generateDeal() {
        const maxAttempts = 1000;
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;
            const deck = createDeck();
            shuffle(deck);

            const hands = [[], [], [], []];
            for (let i = 0; i < deck.length; i++) {
                hands[i % 4].push(deck[i]);
            }

            if (hands.every((hand, index) => checkConstraints(hand, index))) {
                return hands;
            }
        }

        return null;
    }

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
});
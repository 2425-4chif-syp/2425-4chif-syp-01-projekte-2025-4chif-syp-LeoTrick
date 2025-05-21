/**
 * Fallback-Funktionen für die Kartenverteilungs-Analyse
 * Diese Datei enthält vereinfachte Versionen der Funktionen für das Parsen und Anzeigen von Kartenverteilungen
 */

// Vereinfachte Funktion zum Parsen von String-Distributionen im Format "T-QT-K-T;AQ--A-AJ;K-KJ-Q-K;J-A-JT-Q"
function parseSimpleStringDistribution(distribution) {
    console.log("parseSimpleStringDistribution aufgerufen mit:", distribution);
    // Initialisiere Hands-Array (N, E, S, W)
    const hands = [[], [], [], []];
    
    try {
        // Teile den String bei Semikolons, um die vier Spielerhände zu erhalten
        const playerDistributions = distribution.split(';');
        
        if (playerDistributions.length !== 4) {
            throw new Error('Ungültiges Format: Erwarte 4 Hände, getrennt durch Semikolons');
        }
        
        // Verarbeite jede Spielerhand
        playerDistributions.forEach((playerHand, playerIndex) => {
            // Teile die Hand bei Bindestrichen, um die vier Farben zu erhalten
            const suits = playerHand.split('-');
            
            if (suits.length !== 4) {
                throw new Error(`Ungültiges Format für Spieler ${playerIndex}: Erwarte 4 Farben, getrennt durch Bindestriche`);
            }
            
            // Verarbeite jede Farbe (Pik, Herz, Karo, Kreuz in dieser Reihenfolge)
            const suitLetters = ['S', 'H', 'D', 'C'];
            suits.forEach((cardsInSuit, suitIndex) => {
                // Für jede Karte in der Farbe
                for (let i = 0; i < cardsInSuit.length; i++) {
                    const cardRank = cardsInSuit[i].toUpperCase();
                    const suitLetter = suitLetters[suitIndex];
                    
                    // Füge die Karte zur Hand hinzu
                    if (cardRank === 'T' || cardRank === '0') {
                        hands[playerIndex].push('10' + suitLetter);
                    } else {
                        hands[playerIndex].push(cardRank + suitLetter);
                    }
                }
            });
        });
        
        console.log("Geparste Hände:", hands);
        return hands;
    } catch (error) {
        console.error('Fehler beim Parsen der Verteilung:', error);
        return [[], [], [], []];
    }
}

// Vereinfachte Funktion zur Anzeige einer Distribution
function displaySimpleDistribution(distribution) {
    console.log("displaySimpleDistribution aufgerufen mit:", distribution);
    try {
        // Erstelle ein neues Deal-Karten-Element
        const dealCard = document.createElement('div');
        dealCard.className = 'deal-card';
        dealCard.style.border = '1px solid #ddd';
        dealCard.style.borderRadius = '8px';
        dealCard.style.padding = '15px';
        dealCard.style.marginBottom = '20px';
        dealCard.style.backgroundColor = 'white';
        dealCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        
        // Füge einen Titel hinzu
        const title = document.createElement('h2');
        title.textContent = 'Beispielverteilung';
        dealCard.appendChild(title);
        
        // Parse die Verteilung
        const hands = parseSimpleStringDistribution(distribution);
        
        // Erstelle eine einfache Tabelle zur Visualisierung
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '15px';
        
        // Kopfzeile
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Nord', 'Ost', 'Süd', 'West'].forEach(player => {
            const th = document.createElement('th');
            th.textContent = player;
            th.style.padding = '5px';
            th.style.border = '1px solid #ddd';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Karten sortieren und anzeigen
        const tbody = document.createElement('tbody');
        const cardsRow = document.createElement('tr');
        
        hands.forEach(hand => {
            const cell = document.createElement('td');
            cell.style.padding = '10px';
            cell.style.border = '1px solid #ddd';
            cell.style.verticalAlign = 'top';
            
            // Gruppiere Karten nach Farbe
            const suits = { S: [], H: [], D: [], C: [] };
            
            hand.forEach(card => {
                const suit = card.slice(-1);
                const value = card.slice(0, -1);
                if (suits[suit]) {
                    suits[suit].push(value);
                }
            });
            
            // Formatiere für die Anzeige
            const suitSymbols = { S: '♠', H: '♥', D: '♦', C: '♣' };
            let formattedHand = '';
            
            ['S', 'H', 'D', 'C'].forEach(suit => {
                const suitSpan = document.createElement('div');
                suitSpan.style.marginBottom = '5px';
                
                const suitSymbol = document.createElement('span');
                suitSymbol.textContent = suitSymbols[suit] + ': ';
                suitSymbol.style.fontWeight = 'bold';
                if (suit === 'H' || suit === 'D') {
                    suitSymbol.style.color = 'red';
                }
                suitSpan.appendChild(suitSymbol);
                
                const cards = document.createElement('span');
                cards.textContent = suits[suit].join(' ') || '-';
                suitSpan.appendChild(cards);
                
                cell.appendChild(suitSpan);
            });
            
            cardsRow.appendChild(cell);
        });
        
        tbody.appendChild(cardsRow);
        table.appendChild(tbody);
        dealCard.appendChild(table);
        
        // Füge eine einfache Nachricht über die Stichanalyse hinzu
        const analysisMessage = document.createElement('p');
        analysisMessage.textContent = 'Eine detaillierte Stichanalyse ist verfügbar, wenn die Funktionen korrekt geladen sind.';
        analysisMessage.style.marginTop = '15px';
        analysisMessage.style.fontStyle = 'italic';
        dealCard.appendChild(analysisMessage);
        
        // Füge die Karte zur Seite hinzu
        const dealsContainer = document.getElementById('deals-container');
        if (dealsContainer) {
            dealsContainer.prepend(dealCard);
            return true;
        } else {
            console.error('Container #deals-container nicht gefunden!');
            document.body.appendChild(dealCard);
            return true;
        }
    } catch (error) {
        console.error('Fehler bei der Anzeige der Verteilung:', error);
        alert('Fehler bei der Anzeige der Verteilung: ' + error.message);
        return false;
    }
}

// Registriere Event-Listener, sobald das Dokument geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log("Fallback.js geladen, füge Event-Listener hinzu");
    
    // Überprüfe den Run-Example-Button und füge Listener hinzu
    const runExampleBtn = document.getElementById('runExampleBtn');
    if (runExampleBtn) {
        runExampleBtn.addEventListener('click', function() {
            const exampleDistribution = document.getElementById('exampleDistribution').innerText.trim();
            if (exampleDistribution) {
                console.log("Beispieldistribution gefunden:", exampleDistribution);
                displaySimpleDistribution(exampleDistribution);
            } else {
                console.error("Keine Beispieldistribution gefunden");
            }
        });
        console.log("Event-Listener zum Beispiel-Button hinzugefügt");
        
        // Automatisch nach dem Laden ausführen
        setTimeout(() => {
            console.log("Automatische Ausführung des Beispiels");
            const exampleDistribution = document.getElementById('exampleDistribution').innerText.trim();
            if (exampleDistribution) {
                console.log("Beispieldistribution gefunden:", exampleDistribution);
                displaySimpleDistribution(exampleDistribution);
            }
        }, 1000); // 1 Sekunde verzögern, um sicherzustellen, dass alles geladen ist
    } else {
        console.log("Beispiel-Button nicht gefunden");
    }
});

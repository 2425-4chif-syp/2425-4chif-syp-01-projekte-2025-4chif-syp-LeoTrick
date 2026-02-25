# Datenschutzerklärung – LeoTrick Accessibility Toolkit

**Stand: Februar 2025**

## Welche Daten werden erhoben?

LeoTrick speichert ausschließlich **lokale Einstellungen** auf Ihrem Gerät. Es werden **keine personenbezogenen Daten** an externe Server gesendet.

### Gespeicherte Daten (lokal im Browser)

| Datum | Zweck |
|---|---|
| Aktivierungsstatus (An/Aus) | Merkt sich ob die Extension aktiv ist |
| Schriftgröße-Einstellung (12–50 px) | Ihre gewählte Mindest-Schriftgröße |
| Farbenblindheit-Modus | Gewählter Farbmodus (Protanopie, Deuteranopie, Tritanopie) |
| Hochkontrast An/Aus | Hochkontrast-Einstellung |
| Schimpfwort-Filter An/Aus | Aktivierungsstatus des Wortfilters |
| Eigene Filterwörter | Von Ihnen hinzugefügte Schimpfwörter |
| Ad-Blocker An/Aus | Aktivierungsstatus des Ad-Blockers |
| Seitenbesuch-Zähler | Anonymer Zähler pro Domain (nur Hostname, z. B. „google.com": 5) |
| Popup-Größe | Ihre bevorzugte Popup-Skalierung |

Alle Daten werden über die `browser.storage.local` API gespeichert und verlassen **niemals Ihr Gerät**.

## Seitenbesuch-Tracking

LeoTrick zählt wie oft Sie eine bestimmte Domain besuchen (z. B. „google.com": 12). Dies dient ausschließlich dazu, häufig besuchte Seiten mit einem Badge zu markieren. Es werden:

- **Keine** vollständigen URLs gespeichert (nur der Hostname)
- **Keine** Daten an Dritte übermittelt
- **Keine** Browsing-Verläufe erstellt

## Webseiten-Veränderungen

Die Extension verändert die Darstellung von Webseiten direkt in Ihrem Browser:

- **Schriftgröße**: Setzt eine Mindest-Schriftgröße für bessere Lesbarkeit
- **Farbfilter**: Wendet CSS-Filter für Farbenblindheit-Unterstützung an
- **Schimpfwort-Filter**: Ersetzt Schimpfwörter auf der angezeigten Seite
- **Ad-Blocker**: Blendet Werbeelemente aus
- **Link-Hervorhebung**: Macht Links besser sichtbar

Diese Änderungen passieren **lokal in Ihrem Browser**. Die originalen Webseiten werden nicht verändert.

## Berechtigungen

| Berechtigung | Begründung |
|---|---|
| `storage` | Speicherung Ihrer Einstellungen |
| `tabs` | Badge-Aktualisierung und Erkennung häufig besuchter Seiten |
| `activeTab` | Zugriff auf den aktiven Tab für Content-Script-Kommunikation |
| Content Scripts auf allen Seiten | Schriftgröße, Farben und Filter müssen auf jeder Webseite angewandt werden |

## Datenübertragung

LeoTrick überträgt **keine Daten** an externe Server. Die Extension funktioniert vollständig offline.

## Datenlöschung

Alle gespeicherten Daten können jederzeit gelöscht werden:

1. Firefox → Add-ons → LeoTrick → Entfernen
2. Oder: Browserdaten löschen → Erweiterungsdaten

## Kontakt

Dieses Projekt ist Open Source und wird im Rahmen eines Schulprojekts der 4CHIF entwickelt.

Repository: https://github.com/2425-4chif-syp/2425-4chif-syp-01-projekte-2025-4chif-syp-LeoTrick

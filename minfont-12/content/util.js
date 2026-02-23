window.MF = window.MF || {};

MF.clampPx = v => Math.max(12, Math.min(50, parseInt(v,10) || 12));
MF.setRootVar = (name, value) => document.documentElement.style.setProperty(name, value);

// Hybrid-Lösung: Sichtbare + wissenschaftlich basierte Farbenblindheit-Simulation
MF.filterForMode = m => {
  switch (m) {
    // Basiert auf echten Forschungsdaten, aber mit CSS umsetzbar
    case 'prot':    return 'contrast(1.1) brightness(1.05) sepia(0.3) hue-rotate(-15deg) saturate(0.9)'; // Protanopie: Rot-Verlust
    case 'deuter':  return 'contrast(1.1) brightness(1.05) sepia(0.25) hue-rotate(10deg) saturate(0.85)'; // Deuteranopie: Grün-Verlust  
    case 'trit':    return 'contrast(1.15) brightness(1.1) sepia(0.4) hue-rotate(-60deg) saturate(0.7)'; // Tritanopie: Blau-Verlust
    case 'achroma': return 'grayscale(100%) contrast(1.2)'; // Achromatopsie: Kein Farbsehen
    default:        return 'none';
  }
};

MF.applyHighlightPalette = m => {
  const set = MF.setRootVar;
  switch (m) {
    // Optimierte Farben die auch für Farbenblinde gut sichtbar sind
    case 'prot':    set('--hl-bg','#0066cc'); set('--hl-fg','#ffffff'); break; // Blau für Protanope gut sichtbar
    case 'deuter':  set('--hl-bg','#0066cc'); set('--hl-fg','#ffffff'); break; // Blau für Deuteranope gut sichtbar
    case 'trit':    set('--hl-bg','#cc0066'); set('--hl-fg','#ffffff'); break; // Magenta für Tritanope gut sichtbar
    case 'achroma': set('--hl-bg','#000000'); set('--hl-fg','#ffffff'); break; // Schwarz/Weiß für Achromatopsie
    default:        set('--hl-bg','#002aff'); set('--hl-fg','#ffffff'); break; // Standard Blau
  }
};

// High Contrast Modus
MF.applyHighContrast = (enabled) => {
  const root = document.documentElement;
  
  if (enabled) {
    // Hoher Kontrast: Schwarzer Hintergrund, weißer Text
    root.style.setProperty('--hc-bg', '#000000', 'important');
    root.style.setProperty('--hc-text', '#ffffff', 'important');
    root.style.setProperty('--hc-link', '#ffff00', 'important');
    root.style.setProperty('--hc-border', '#ffffff', 'important');
    
    // CSS-Klasse hinzufügen für erweiterte Styles
    root.classList.add('mf-high-contrast');
    
    console.log('🔆 Hoher Kontrast aktiviert');
  } else {
    // High Contrast deaktivieren
    root.classList.remove('mf-high-contrast');
    console.log('🔅 Hoher Kontrast deaktiviert');
  }
};

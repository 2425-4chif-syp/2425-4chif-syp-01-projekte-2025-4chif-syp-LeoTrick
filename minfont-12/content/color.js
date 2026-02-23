window.MF = window.MF || {};
(() => {
  const { setRootVar, filterForMode, applyHighlightPalette, applyHighContrast } = MF;
  MF.colorApply = () => {
    const s = MF.state;
    const filter = filterForMode(s.mode);
    console.log('🎨 Farbenblindheit-Filter angewendet:', s.mode, '→', filter);
    setRootVar('--cbfilter', filter);
    applyHighlightPalette(s.mode);
    
    // High Contrast Modus anwenden
    if (applyHighContrast) {
      applyHighContrast(s.highContrastEnabled);
    }
    
    // Visueller Test - zeige angewendeten Filter
    if (s.mode !== 'off') {
      console.log('🔍 Filter aktiv! HTML-Element sollte verändert aussehen.');
    }
  };
})();

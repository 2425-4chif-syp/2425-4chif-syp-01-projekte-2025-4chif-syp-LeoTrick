window.MF = window.MF || {};

MF.clampPx = v => Math.max(12, Math.min(50, parseInt(v,10) || 12));
MF.setRootVar = (name, value) => document.documentElement.style.setProperty(name, value);

MF.filterForMode = m => {
  switch (m) {
    case 'prot':    return 'contrast(1.2) sepia(1) hue-rotate(-30deg)'; // Rot-Schwäche
    case 'deuter':  return 'contrast(1.2) sepia(1) hue-rotate(30deg)';  // Grün-Schwäche
    case 'trit':    return 'contrast(1.2) sepia(1) hue-rotate(90deg)';  // Blau-Gelb
    case 'achroma': return 'grayscale(100%)';
    default:        return 'none';
  }
};

MF.applyHighlightPalette = m => {
  const set = MF.setRootVar;
  switch (m) {
    case 'prot':    set('--hl-bg','#0057ff'); set('--hl-fg','#ffffff'); break;
    case 'deuter':  set('--hl-bg','#7a00ff'); set('--hl-fg','#ffffff'); break;
    case 'trit':    set('--hl-bg','#ff3d00'); set('--hl-fg','#000000'); break;
    case 'achroma': set('--hl-bg','#000000'); set('--hl-fg','#ffffff'); break;
    default:        set('--hl-bg','#002aff'); set('--hl-fg','#ffffff'); break;
  }
};

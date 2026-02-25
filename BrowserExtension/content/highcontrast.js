window.MF = window.MF || {};
(() => {
  // High Contrast CSS Styles - Verbesserte Version
  const highContrastStyles = `
    /* High Contrast Modus - Intelligente Lesbarkeit */
    
    /* Basis: Nur Body und große Container */
    .mf-high-contrast body,
    .mf-high-contrast main,
    .mf-high-contrast article,
    .mf-high-contrast section,
    .mf-high-contrast div:not([class*="icon"]):not([class*="logo"]):not([class*="svg"]) {
      background-color: #000000 !important;
    }
    
    /* Text-Elemente in Weiß */
    .mf-high-contrast p,
    .mf-high-contrast span:not([class*="icon"]):not([class*="logo"]),
    .mf-high-contrast li,
    .mf-high-contrast td,
    .mf-high-contrast th,
    .mf-high-contrast div[class*="text"],
    .mf-high-contrast div[class*="content"],
    .mf-high-contrast label {
      color: #ffffff !important;
    }
    
    /* Überschriften extra hervorgehoben */
    .mf-high-contrast h1,
    .mf-high-contrast h2,
    .mf-high-contrast h3,
    .mf-high-contrast h4,
    .mf-high-contrast h5,
    .mf-high-contrast h6 {
      color: #ffffff !important;
      background-color: #000000 !important;
      border-bottom: 2px solid #888888 !important;
      padding-bottom: 0.2em !important;
    }
    
    /* Links in auffälligem Gelb */
    .mf-high-contrast a {
      color: #ffff00 !important;
      text-decoration: underline !important;
      background-color: transparent !important;
    }
    
    .mf-high-contrast a:visited {
      color: #ff00ff !important;
    }
    
    .mf-high-contrast a:hover,
    .mf-high-contrast a:focus {
      color: #00ffff !important;
      background-color: #222222 !important;
    }
    
    /* Buttons und Inputs mit Rahmen */
    .mf-high-contrast button,
    .mf-high-contrast input:not([type="radio"]):not([type="checkbox"]),
    .mf-high-contrast select,
    .mf-high-contrast textarea {
      background-color: #1a1a1a !important;
      color: #ffffff !important;
      border: 2px solid #888888 !important;
    }
    
    .mf-high-contrast button:hover,
    .mf-high-contrast button:focus {
      background-color: #333333 !important;
      border-color: #ffffff !important;
    }
    
    /* Bilder und SVGs - NICHT schwarz machen, nur Kontrast erhöhen */
    .mf-high-contrast img,
    .mf-high-contrast svg,
    .mf-high-contrast [class*="icon"],
    .mf-high-contrast [class*="logo"] {
      filter: contrast(150%) brightness(130%) !important;
      background-color: transparent !important;
    }
    
    /* Video separat */
    .mf-high-contrast video {
      filter: contrast(140%) brightness(110%) !important;
      border: 1px solid #888888 !important;
    }
    
    /* Hervorhebungen */
    .mf-high-contrast mark,
    .mf-high-contrast ::selection {
      background-color: #ffff00 !important;
      color: #000000 !important;
    }
    
    /* Tabellen mit Struktur */
    .mf-high-contrast table {
      border-collapse: collapse !important;
      background-color: #000000 !important;
    }
    
    .mf-high-contrast th,
    .mf-high-contrast td {
      border: 1px solid #666666 !important;
      padding: 8px !important;
      color: #ffffff !important;
    }
    
    .mf-high-contrast th {
      background-color: #2a2a2a !important;
      font-weight: bold !important;
    }
    
    .mf-high-contrast tr:nth-child(even) {
      background-color: #0a0a0a !important;
    }
    
    .mf-high-contrast tr:nth-child(odd) {
      background-color: #000000 !important;
    }
    
    /* Code und Pre */
    .mf-high-contrast code,
    .mf-high-contrast pre {
      background-color: #1a1a1a !important;
      color: #00ff00 !important;
      border: 1px solid #666666 !important;
      padding: 4px !important;
    }
    
    /* Navigation und Menüs */
    .mf-high-contrast nav,
    .mf-high-contrast [role="navigation"],
    .mf-high-contrast [class*="menu"],
    .mf-high-contrast [class*="nav"] {
      background-color: #0a0a0a !important;
      border: 1px solid #444444 !important;
    }
    
    /* Cards und Panels */
    .mf-high-contrast [class*="card"],
    .mf-high-contrast [class*="panel"],
    .mf-high-contrast [class*="box"] {
      background-color: #0f0f0f !important;
      border: 1px solid #555555 !important;
      color: #ffffff !important;
    }
    
    /* Focus Indicator */
    .mf-high-contrast *:focus {
      outline: 3px solid #ffff00 !important;
      outline-offset: 2px !important;
    }
    
    /* Scrollbars */
    .mf-high-contrast ::-webkit-scrollbar {
      background-color: #1a1a1a !important;
      width: 12px !important;
    }
    
    .mf-high-contrast ::-webkit-scrollbar-thumb {
      background-color: #666666 !important;
      border: 2px solid #1a1a1a !important;
      border-radius: 6px !important;
    }
    
    .mf-high-contrast ::-webkit-scrollbar-thumb:hover {
      background-color: #888888 !important;
    }
    
    /* Transparente Elemente sichtbar machen */
    .mf-high-contrast [style*="opacity: 0"],
    .mf-high-contrast [style*="opacity:0"] {
      opacity: 1 !important;
    }
  `;

  let styleElement = null;

  MF.highContrastAttach = () => {
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'mf-high-contrast-styles';
      styleElement.textContent = highContrastStyles;
      document.head.appendChild(styleElement);
      console.log('🔧 High Contrast Styles injiziert');
    }
  };

  MF.highContrastDetach = () => {
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
      styleElement = null;
      console.log('🔧 High Contrast Styles entfernt');
    }
  };
})();

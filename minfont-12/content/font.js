window.MF = window.MF || {};
(() => {
  const { setRootVar, clampPx } = MF;
  let styleEl = null;

  const BASE_CSS = `
    :root {
      --minfont: 16px;
      --cbfilter: none;
      --hl-bg: #002aff;
      --hl-fg: #ffffff;
    }
    html { filter: var(--cbfilter) !important; }

    /* KEINE universelle Schriftvergrößerung mehr - wird per JavaScript gemacht */
    
    /* Icons nicht aufblasen */
    .fa, .fas, .far, .fal, .fab,
    [class*="fa-"], .material-icons, .mdi, .bi, .octicon, .ion, .gg {
      font-size: inherit !important;
    }

    /* Markierte Links - neue auffällige Gestaltung - nur Links betroffen */
    a[href].mf-hotlink:not([class*="mf-hotlink-"]) {
      font-weight: 800 !important;
      color: #ffffff !important;
      background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
      text-decoration: none !important;
      border-radius: 8px !important;
      padding: 4px 8px !important;
      margin: 0 2px !important;
      display: inline-block !important;
      box-shadow: 
        0 4px 12px rgba(231, 76, 60, 0.4),
        0 2px 6px rgba(231, 76, 60, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      border: 2px solid #ffffff !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5) !important;
      transform: translateY(-2px) !important;
      transition: all 0.3s ease !important;
      position: relative !important;
      z-index: 999 !important;
      isolation: isolate !important;
      contain: layout style !important;
    }
    
    a[href].mf-hotlink:not([class*="mf-hotlink-"]):hover {
      transform: translateY(-4px) scale(1.05) !important;
      box-shadow: 
        0 6px 20px rgba(231, 76, 60, 0.6),
        0 4px 10px rgba(231, 76, 60, 0.8),
        inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
      background: linear-gradient(135deg, #c0392b, #e74c3c) !important;
    }
    
    a[href].mf-hotlink:not([class*="mf-hotlink-"])::before {
      content: "🔥" !important;
      position: absolute !important;
      top: -8px !important;
      right: -8px !important;
      font-size: 12px !important;
      background: #f39c12 !important;
      border-radius: 50% !important;
      width: 20px !important;
      height: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
      animation: hotlink-pulse 2s ease-in-out infinite !important;
      z-index: 1000 !important;
      pointer-events: none !important;
    }
    
    @keyframes hotlink-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
    }
    
    /* Verhindert dass Parent-Elemente beeinflusst werden */
    *:has(> a.mf-hotlink) {
      background: inherit !important;
      color: inherit !important;
    }
    
    /* Verhindert dass Child-Elemente den Style übernehmen */
    a.mf-hotlink * {
      background: transparent !important;
      color: inherit !important;
      font-weight: inherit !important;
    }
  `;

  function attachStyle() {
    if (styleEl && styleEl.isConnected) return;
    styleEl = document.createElement('style');
    styleEl.id = 'minfont-style';
    styleEl.textContent = BASE_CSS;
    (document.documentElement || document.head || document.body).prepend(styleEl);
  }
  function detachStyle() {
    if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
    styleEl = null;
  }

  // JavaScript-basierte echte Mindestschriftgröße
  let observer = null;

  function isIconElement(el) {
    const cls = (el.className || '') + '';
    return /icon|fa-|material-icons|mdi|bi|octicon|glyph|ion|gg/.test(cls);
  }

  function applyMinFontSize(minPx) {
    if (!MF.state.fontEnabled) return;

    const root = document.body || document.documentElement;
    if (!root) return;

    // Alle Textelemente finden
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: function(node) {
          if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_SKIP;
          if (isIconElement(node)) return NodeFilter.FILTER_SKIP;
          const style = getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden') return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const elementsToProcess = [];
    let node;
    while (node = walker.nextNode()) {
      elementsToProcess.push(node);
    }

    // Batch-Verarbeitung für Performance
    elementsToProcess.forEach(el => {
      try {
        // Originalgröße ermitteln (gespeicherte oder aktuelle)
        let originalSize = el.getAttribute('data-mf-original-font');
        if (!originalSize) {
          originalSize = getComputedStyle(el).fontSize;
          el.setAttribute('data-mf-original-font', originalSize);
        }
        const originalPx = parseFloat(originalSize);

        if (originalPx < minPx) {
          el.style.setProperty('font-size', minPx + 'px', 'important');
          el.setAttribute('data-mf-enhanced', 'true');
        } else if (el.getAttribute('data-mf-enhanced') === 'true') {
          // War vorher vergrößert, jetzt nicht mehr nötig (z.B. min gesenkt)
          el.style.removeProperty('font-size');
          el.removeAttribute('data-mf-enhanced');
          el.removeAttribute('data-mf-original-font');
        }
      } catch (e) {
        // Ignoriere Fehler bei einzelnen Elementen
      }
    });
  }

  function resetMinFontSize() {
    document.querySelectorAll('[data-mf-enhanced="true"]').forEach(el => {
      const original = el.getAttribute('data-mf-original-font');
      if (original) {
        el.style.setProperty('font-size', original, 'important');
      } else {
        el.style.removeProperty('font-size');
      }
      el.removeAttribute('data-mf-enhanced');
      el.removeAttribute('data-mf-original-font');
    });
  }

  function startMinFontObserver(minPx) {
    if (observer) observer.disconnect();
    
    let debounceTimer = null;
    
    observer = new MutationObserver(mutations => {
      let hasChanges = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              hasChanges = true;
            }
          });
        }
      });
      
      if (hasChanges) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => applyMinFontSize(minPx), 200);
      }
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function stopMinFontObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  MF.fontAttach = () => attachStyle();
  MF.fontDetach = () => {
    detachStyle();
    resetMinFontSize();
    stopMinFontObserver();
  };
  
  MF.fontApply = () => {
    const s = MF.state;
    MF.setRootVar('--minfont', s.minPx + 'px');
    
    if (s.fontEnabled) {
      // Direkt anwenden ohne Reset — applyMinFontSize vergleicht mit gespeicherter Originalgröße
      applyMinFontSize(s.minPx);
      startMinFontObserver(s.minPx);
    } else {
      resetMinFontSize();
      stopMinFontObserver();
    }
  };
  
  MF.fontReevalIfNeeded = (oldMin) => {
    const s = MF.state;
    if (s.enabled && s.fontEnabled && s.minPx !== oldMin) {
      // Direkt mit neuem Wert anwenden — kein Reset nötig
      applyMinFontSize(s.minPx);
    }
  };

})();

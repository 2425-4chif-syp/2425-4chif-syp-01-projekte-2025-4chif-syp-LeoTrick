window.MF = window.MF || {};
(() => {
  // Nur offensichtliche Werbe-Pop-ups - sehr konservativ
  const AD_SELECTORS = [
    // Offensichtliche Pop-up Overlays
    '.popup-overlay[style*="position: fixed"]',
    '.modal-overlay[style*="position: fixed"]', 
    '[class*="popup-ad"][style*="position: fixed"]',
    '[class*="overlay-ad"][style*="position: fixed"]',
    
    // Cookie Banner - nur störende mit fixed position
    '[class*="cookie-banner"][style*="position: fixed"]',
    '[id*="cookieConsent"][style*="position: fixed"]',
    
    // Newsletter Pop-ups - nur mit fixed position
    '[class*="newsletter-popup"][style*="position: fixed"]',
    '[class*="subscribe-modal"][style*="position: fixed"]',
    
    // Interstitial Ads - ganze Seite blockierend
    '[class*="interstitial"][style*="position: fixed"]',
    '[class*="takeover"][style*="position: fixed"]',
    
    // Sehr spezifische Google Ads nur in iFrames
    'iframe[src*="googleads.g.doubleclick.net"]',
    'iframe[src*="googlesyndication.com/pagead"]'
  ];

  // Nur die aggressivsten Werbe-Domains - sehr begrenzt
  const AD_DOMAINS = [
    'googleads.g.doubleclick.net',  // Google Ads iFrames
    'pagead2.googlesyndication.com', // Google AdSense
    'tpc.googlesyndication.com'     // Google Tag Partner
  ];

  // Wichtige Content-Container die NIEMALS blockiert werden dürfen
  const CONTENT_WHITELIST = [
    // YouTube spezifisch
    '#movie_player', '.html5-video-player', '.video-stream',
    '[id*="player"]', '.ytp-chrome-bottom', '.ytp-chrome-top',
    
    // Video-Player allgemein
    'video', 'audio', '.video-player', '.media-player',
    '[class*="video-container"]', '[class*="player-container"]',
    
    // Hauptcontent-Bereiche
    'main', '[role="main"]', '.main-content', '#main', '#content',
    'article', '[role="article"]', '.post-content', '.article-content',
    
    // Navigation
    'nav', '[role="navigation"]', '.navigation', '.menu',
    'header', '[role="banner"]', 'footer', '[role="contentinfo"]',
    
    // Formulare und wichtige UI
    'form', '[role="form"]', '.form', '.search',
    'button:not([class*="ad"])', 'input', 'textarea', 'select',
    
    // Social Media Content
    '[data-testid="tweet"]', '.post', '.story', '.feed-item',
    
    // E-Commerce
    '.product', '.cart', '.checkout', '.price'
  ];

  let blockedCount = 0;
  let observer = null;
  let deletedElements = new Map(); // Speichert gelöschte Elemente für Wiederherstellung

  function isProtectedElement(el) {
    // Prüfe ob Element in Whitelist ist
    for (const selector of CONTENT_WHITELIST) {
      try {
        if (el.matches && el.matches(selector)) return true;
        if (el.closest && el.closest(selector)) return true;
      } catch {}
    }
    
    // YouTube spezifische Prüfungen
    if (window.location.hostname.includes('youtube.com')) {
      // Video-Player und Controls schützen
      if (el.closest('#movie_player') || 
          el.closest('.html5-video-player') ||
          el.id === 'movie_player' ||
          el.classList.contains('video-stream')) {
        return true;
      }
    }
    
    return false;
  }

  function removeElement(el, reason = 'ad-selector') {
    if (el && !el.hasAttribute('data-mf-blocked')) {
      
      // Schutz vor wichtigen Elementen
      if (isProtectedElement(el)) {
        console.log('🛡️ MinFont AdBlocker: Geschütztes Element nicht blockiert', el);
        return;
      }
      
      // Element für Wiederherstellung speichern
      const elementInfo = {
        element: el.cloneNode(true), // Deep clone
        parent: el.parentNode,
        nextSibling: el.nextSibling,
        reason: reason
      };
      
      // Eindeutige ID für das Element erstellen
      const elementId = 'mf-deleted-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      deletedElements.set(elementId, elementInfo);
      
      // Markierung hinzufügen bevor gelöscht wird
      el.setAttribute('data-mf-deleted-id', elementId);
      
      // Element komplett aus DOM entfernen
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      
      blockedCount++;
      console.log(`🗑️ MinFont AdBlocker: Element gelöscht (${reason})`, el);
    }
  }

  function restoreDeletedElements() {
    try {
      deletedElements.forEach((elementInfo, elementId) => {
        const { element, parent, nextSibling } = elementInfo;
        
        // Element wieder einfügen wenn Parent noch existiert
        if (parent && document.contains(parent)) {
          if (nextSibling && parent.contains(nextSibling)) {
            parent.insertBefore(element, nextSibling);
          } else {
            parent.appendChild(element);
          }
          console.log('♻️ MinFont AdBlocker: Element wiederhergestellt', element);
        }
      });
      
      // Map leeren nach Wiederherstellung
      deletedElements.clear();
      blockedCount = 0;
    } catch (e) {
      console.warn('MinFont AdBlocker restore error:', e);
    }
  }

  function blockBySelectors() {
    try {
      AD_SELECTORS.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Doppelte Prüfung auf Schutz
          if (!isProtectedElement(el)) {
            removeElement(el, `selector: ${selector}`);
          }
        });
      });
    } catch (e) {
      console.warn('MinFont AdBlocker selector error:', e);
    }
  }

  function blockByDomain(el) {
    try {
      // Nur blockieren wenn nicht geschützt
      if (isProtectedElement(el)) return false;
      
      const src = el.src || el.href || '';
      if (src) {
        const isBlocked = AD_DOMAINS.some(domain => src.includes(domain));
        if (isBlocked) {
          removeElement(el, `domain: ${src}`);
          return true;
        }
      }
    } catch (e) {
      console.warn('MinFont AdBlocker domain error:', e);
    }
    return false;
  }

  function blockNetworkRequests() {
    try {
      // Nur offensichtliche Werbe-iFrames blockieren
      document.querySelectorAll('iframe[src]').forEach(el => {
        const src = el.src || '';
        if (src && AD_DOMAINS.some(domain => src.includes(domain))) {
          if (!isProtectedElement(el)) {
            blockByDomain(el);
          }
        }
      });

      // Nur 1x1 Tracking-Pixel blockieren (eindeutig Tracking)
      document.querySelectorAll('img[src]').forEach(el => {
        if ((el.width <= 1 && el.height <= 1) && !isProtectedElement(el)) {
          const src = el.src || '';
          if (src.includes('tracking') || src.includes('pixel') || 
              AD_DOMAINS.some(domain => src.includes(domain))) {
            removeElement(el, 'tracking-pixel');
          }
        }
      });

      // KEINE Link-Blockierung mehr - zu aggressiv
    } catch (e) {
      console.warn('MinFont AdBlocker network error:', e);
    }
  }

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              // Erstmal prüfen ob es geschützt ist
              if (isProtectedElement(node)) return;
              
              // NUR bei offensichtlichen Pop-ups eingreifen
              const hasFixedPosition = node.style && node.style.position === 'fixed';
              const isOverlay = node.className && (
                node.className.includes('popup-overlay') ||
                node.className.includes('modal-overlay') ||
                node.className.includes('popup-ad') ||
                node.className.includes('overlay-ad')
              );
              
              if (hasFixedPosition && isOverlay) {
                // Prüfe das Element gegen unsere begrenzten Selektoren
                AD_SELECTORS.forEach(selector => {
                  try {
                    if (node.matches && node.matches(selector)) {
                      removeElement(node, `new-popup: ${selector}`);
                    }
                  } catch (e) {}
                });
              }

              // Prüfe nur auf Werbe-Domains bei iFrames
              if (node.tagName === 'IFRAME') {
                blockByDomain(node);
              }
            }
          });
        }

        // Nur bei src-Änderungen von iFrames reagieren
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'src' && 
            mutation.target.tagName === 'IFRAME') {
          if (!isProtectedElement(mutation.target)) {
            blockByDomain(mutation.target);
          }
        }
      });
    });

    // Weniger invasive Überwachung
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'] // Nur src-Änderungen
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Öffentliche API
  MF.adBlockerApply = () => {
    // KEINE interne State-Prüfung mehr - wird von main.js gesteuert
    console.log('🚫 MinFont AdBlocker: Aktiviert');
    blockBySelectors();
    blockNetworkRequests();
    startObserver();

    // Statistik nach 2 Sekunden
    setTimeout(() => {
      if (blockedCount > 0) {
        console.log(`🚫 MinFont AdBlocker: ${blockedCount} Werbungen blockiert`);
      } else {
        console.log('🚫 MinFont AdBlocker: Bereit, aber keine Werbung gefunden');
      }
    }, 2000);
  };

  // Neue Stop-Funktion
  MF.adBlockerStop = () => {
    console.log('⭕ MinFont AdBlocker: Deaktiviert');
    stopObserver();
    restoreDeletedElements();
    blockedCount = 0;
  };

  // CSS nur für offensichtliche Pop-ups - sehr konservativ
  const adBlockCSS = `
    /* Nur störende Pop-ups mit fixed position */
    [class*="popup-overlay"][style*="position: fixed"],
    [class*="modal-overlay"][style*="position: fixed"],
    [class*="popup-ad"][style*="position: fixed"],
    [class*="overlay-ad"][style*="position: fixed"] {
      display: none !important;
    }
    
    /* Cookie Banner nur wenn störend positioniert */
    [class*="cookie-banner"][style*="position: fixed"],
    [id*="cookieConsent"][style*="position: fixed"] {
      display: none !important;
    }
    
    /* Newsletter Pop-ups nur mit fixed position */
    [class*="newsletter-popup"][style*="position: fixed"],
    [class*="subscribe-modal"][style*="position: fixed"] {
      display: none !important;
    }
    
    /* Interstitials - ganze Seite blockierend */
    [class*="interstitial"][style*="position: fixed"],
    [class*="takeover"][style*="position: fixed"] {
      display: none !important;
    }
    
    /* Nur Google Ads in iFrames */
    iframe[src*="googleads.g.doubleclick.net"],
    iframe[src*="googlesyndication.com/pagead"] {
      display: none !important;
    }
    
    /* Nur 1x1 Tracking Pixel */
    img[width="1"][height="1"],
    iframe[width="1"][height="1"] {
      display: none !important;
    }
  `;

  MF.adBlockerAttachCSS = () => {
    if (document.getElementById('mf-adblocker-style')) return;
    const style = document.createElement('style');
    style.id = 'mf-adblocker-style';
    style.textContent = adBlockCSS;
    (document.head || document.documentElement).appendChild(style);
  };

  MF.adBlockerDetachCSS = () => {
    const style = document.getElementById('mf-adblocker-style');
    if (style) style.remove();
  };
})();
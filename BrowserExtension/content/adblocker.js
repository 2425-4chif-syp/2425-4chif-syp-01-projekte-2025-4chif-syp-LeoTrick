window.MF = window.MF || {};
(() => {
  // Erweiterte Werbe-Selektoren - viel umfassender
  const AD_SELECTORS = [
    // Standard Werbung
    '[class*="ad-"], [id*="ad-"], [class*="ads-"], [id*="ads-"]',
    '[class*="banner"], [class*="popup"], [class*="overlay"]',
    '[class*="sponsored"], [class*="promotion"]',
    
    // Pop-ups und Overlays
    '.popup-overlay, .modal-overlay, .ad-overlay',
    '[style*="position: fixed"][style*="z-index"]',
    
    // Cookie und Newsletter Banner
    '[class*="cookie"], [class*="gdpr"], [class*="consent"]',
    '[class*="newsletter"], [class*="subscribe"]',
    
    // Spezifische Werbenetzwerke
    '[class*="google-ad"], [class*="doubleclick"]',
    '[class*="adsystem"], [class*="adnxs"]',
    
    // Social Media Werbung
    '[data-testid*="placementTracking"]',
    '[class*="promoted"], [class*="sponsor"]',
    
    // Video Ads (nicht YouTube - das ist zu komplex)
    '.video-ads, .preroll-ads, .midroll-ads',
    
    // Sidebar und Banner Ads
    '.sidebar-ad, .header-ad, .footer-ad',
    '.leaderboard, .skyscraper, .rectangle',
    
    // Mobile Ads
    '.mobile-banner, .sticky-banner',
    
    // Tracking und Analytics (optional)
    '[class*="tracking"], [class*="analytics"]'
  ];

  // Erweiterte Werbe-Domains
  const AD_DOMAINS = [
    // Google Ads
    'googleads.g.doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
    'google-analytics.com', 'googletagmanager.com',
    
    // Facebook/Meta Ads
    'facebook.com/tr', 'connect.facebook.net',
    
    // Amazon Ads
    'amazon-adsystem.com', 'media-amazon.com',
    
    // Microsoft Ads
    'bat.bing.com', 'ads.microsoft.com',
    
    // Andere große Werbenetzwerke
    'adsystem.com', 'advertising.com', 'adsrvr.org',
    'criteo.com', 'outbrain.com', 'taboola.com',
    'scorecardresearch.com', 'quantserve.com',
    
    // Tracking
    'hotjar.com', 'mouseflow.com', 'fullstory.com'
  ];

  let blockedCount = 0;
  let observer = null;
  let deletedElements = new Map();
  let blockingEnabled = false;

  function isProtectedElement(el) {
    // Basis-Schutz für wichtige Inhalte
    const importantSelectors = [
      'video', 'audio', 'main', 'article', 'nav', 'header', 'footer',
      '[role="main"]', '[role="article"]', '[role="navigation"]',
      '.video-player', '.main-content', '#content', '.post-content'
    ];
    
    for (const selector of importantSelectors) {
      try {
        if (el.matches && el.matches(selector)) return true;
        if (el.closest && el.closest(selector)) return true;
      } catch {}
    }
    
    // YouTube-spezifischer Schutz (Player, aber nicht Ads)
    if (window.location.hostname.includes('youtube.com')) {
      if (el.closest('#movie_player') || 
          el.closest('.html5-video-player') ||
          el.id === 'movie_player' ||
          el.classList.contains('video-stream')) {
        return true;
      }
    }
    
    // Schutz vor zu kleinen oder zu großen Elementen (wahrscheinlich wichtig)
    const rect = el.getBoundingClientRect();
    if (rect.width > window.innerWidth * 0.8 || rect.height > window.innerHeight * 0.8) {
      return true; // Zu groß = wahrscheinlich Hauptcontent
    }
    
    return false;
  }

  function isAdElement(el) {
    if (!el || !el.tagName) return false;
    
    // Klassen- und ID-basierte Erkennung
    const className = (el.className || '').toLowerCase();
    const id = (el.id || '').toLowerCase();
    const adKeywords = ['ad', 'ads', 'banner', 'popup', 'sponsored', 'promotion', 
                       'google-ad', 'doubleclick', 'adsystem', 'adnxs'];
    
    for (const keyword of adKeywords) {
      if (className.includes(keyword) || id.includes(keyword)) {
        return true;
      }
    }
    
    // Domain-basierte Erkennung für iFrames
    if (el.tagName === 'IFRAME') {
      const src = el.src || '';
      for (const domain of AD_DOMAINS) {
        if (src.includes(domain)) return true;
      }
    }
    
    // Große Overlays mit fixed position (wahrscheinlich Pop-ups)
    const style = getComputedStyle(el);
    if (style.position === 'fixed' && style.zIndex > 1000) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 300 && rect.height > 200) {
        return true;
      }
    }
    
    // Tracking-Pixel (1x1 Bilder)
    if (el.tagName === 'IMG') {
      if ((el.width <= 1 && el.height <= 1) || 
          (el.style.width === '1px' && el.style.height === '1px')) {
        return true;
      }
    }
    
    return false;
  }

  function removeElement(el, reason = 'ad-detected') {
    if (!el || el.hasAttribute('data-mf-blocked') || !blockingEnabled) return;
    
    // Doppelte Prüfung auf Schutz
    if (isProtectedElement(el)) {
      console.log('🛡️ MinFont AdBlocker: Geschütztes Element nicht blockiert', el);
      return;
    }
    
    // Element für Wiederherstellung speichern
    const elementInfo = {
      element: el.cloneNode(true),
      parent: el.parentNode,
      nextSibling: el.nextSibling,
      reason: reason
    };
    
    const elementId = 'mf-deleted-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    deletedElements.set(elementId, elementInfo);
    
    el.setAttribute('data-mf-deleted-id', elementId);
    el.setAttribute('data-mf-blocked', 'true');
    
    // Sanfte Entfernung mit Animation
    el.style.transition = 'opacity 0.3s ease';
    el.style.opacity = '0';
    
    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 300);
    
    blockedCount++;
    console.log(`🗑️ MinFont AdBlocker: Element entfernt (${reason})`, el);
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

  // Einfache aber effektive Blockierung
  function simpleAdBlock() {
    if (!blockingEnabled) return;
    
    console.log('🚫 Starting simple ad block...');
    let blocked = 0;
    
    // 1. Direkte Selektor-Blockierung
    const simpleSelectors = [
      '[class*="ad"]:not(main):not(article):not(header):not(nav)',
      '[id*="ad"]:not(main):not(article):not(header):not(nav)', 
      '[class*="banner"]', '[class*="popup"]', '[class*="overlay"]',
      '[class*="sponsored"]', '[class*="promotion"]',
      'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
      'iframe[src*="google-analytics"]', 'iframe[src*="facebook.com/tr"]'
    ];
    
    simpleSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (!isProtectedElement(el)) {
            el.style.display = 'none !important';
            el.style.visibility = 'hidden !important';
            el.style.opacity = '0 !important';
            blocked++;
            console.log('🗑️ Blocked:', selector, el);
          }
        });
      } catch (e) {}
    });
    
    // 2. Tracking-Pixel entfernen
    document.querySelectorAll('img').forEach(img => {
      if ((img.width <= 1 && img.height <= 1) || 
          (img.style.width === '1px' && img.style.height === '1px')) {
        img.remove();
        blocked++;
      }
    });
    
    // 3. Werbe-Scripts stoppen
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.src || '';
      if (src.includes('googleads') || src.includes('doubleclick') || 
          src.includes('analytics') || src.includes('facebook.com')) {
        script.remove();
        blocked++;
        console.log('🚫 Script blocked:', src);
      }
    });
    
    console.log(`✅ Simple AdBlock: ${blocked} items blocked`);
    return blocked;
  }

  function blockByContent() {
    if (!blockingEnabled) return;
    
    try {
      // Text-basierte Erkennung
      const adTexts = ['advertisement', 'sponsored', 'promoted', 'anzeige', 'werbung'];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.toLowerCase();
        for (const adText of adTexts) {
          if (text.includes(adText)) {
            let element = node.parentElement;
            while (element && element !== document.body) {
              if (isAdElement(element) && !isProtectedElement(element)) {
                removeElement(element, `content: ${adText}`);
                break;
              }
              element = element.parentElement;
            }
            break;
          }
        }
      }
    } catch (e) {
      console.warn('MinFont AdBlocker content error:', e);
    }
  }

  function blockNetworkRequests() {
    if (!blockingEnabled) return;
    
    try {
      // iFrame-Blockierung
      document.querySelectorAll('iframe[src]').forEach(el => {
        const src = el.src || '';
        for (const domain of AD_DOMAINS) {
          if (src.includes(domain) && !isProtectedElement(el)) {
            removeElement(el, `domain: ${domain}`);
            break;
          }
        }
      });

      // Script-Blockierung (vorsichtig)
      document.querySelectorAll('script[src]').forEach(el => {
        const src = el.src || '';
        for (const domain of AD_DOMAINS) {
          if (src.includes(domain)) {
            el.remove();
            console.log('🚫 MinFont AdBlocker: Script blockiert', src);
            break;
          }
        }
      });

      // Tracking-Pixel
      document.querySelectorAll('img[src]').forEach(el => {
        if (isAdElement(el) && !isProtectedElement(el)) {
          removeElement(el, 'tracking-pixel');
        }
      });
    } catch (e) {
      console.warn('MinFont AdBlocker network error:', e);
    }
  }

  function startObserver() {
    if (observer || !blockingEnabled) return;

    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              // Sofortiger Check für neue Ads
              if (isAdElement(node) && !isProtectedElement(node)) {
                removeElement(node, 'new-ad-detected');
              }
              
              // Check für Kinder-Elemente
              if (node.querySelectorAll) {
                node.querySelectorAll('iframe, img, div').forEach(child => {
                  if (isAdElement(child) && !isProtectedElement(child)) {
                    removeElement(child, 'new-child-ad');
                  }
                });
              }
            }
          });
        }

        if (mutation.type === 'attributes' && 
            ['src', 'class', 'id'].includes(mutation.attributeName)) {
          const target = mutation.target;
          if (isAdElement(target) && !isProtectedElement(target)) {
            removeElement(target, 'attribute-change');
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class', 'id']
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Öffentliche API - vereinfacht und direkt
  MF.adBlockerApply = () => {
    blockingEnabled = true;
    console.log('🚫 MinFont AdBlocker: AKTIVIERT - Einfache aber effektive Blockierung');
    
    // Sofortige Blockierung
    const blocked1 = simpleAdBlock();
    
    // Wiederholung nach kurzer Zeit für nachlaufende Ads
    setTimeout(() => {
      const blocked2 = simpleAdBlock();
      console.log(`� Total blockiert: ${blocked1 + blocked2} Elemente`);
    }, 1000);
    
    // Observer für neue Ads
    startObserver();
  };

  MF.adBlockerStop = () => {
    console.log('⛔ MinFont AdBlocker: DEAKTIVIERT');
    blockingEnabled = false;
    stopObserver();
    restoreDeletedElements();
    blockedCount = 0;
    
    // Versteckte Elemente wieder anzeigen
    document.querySelectorAll('[style*="display: none"]').forEach(el => {
      if (el.style.display === 'none') {
        el.style.display = '';
        el.style.visibility = '';
        el.style.opacity = '';
      }
    });
  };

  // Verstärktes CSS für sofortige Werbungsblockierung
  const adBlockCSS = `
    /* Banner-Werbung und Anzeigen */
    [class*="ad-"]:not([class*="ad-m"]):not([class*="ad-s"]),
    [id*="ad-"]:not([id*="ad-m"]):not([id*="ad-s"]),
    [class*="ads-"], [id*="ads-"],
    [class*="banner"], [class*="popup"], [class*="overlay"],
    [class*="sponsored"], [class*="promotion"],
    [class*="google-ad"], [class*="doubleclick"],
    [class*="adsystem"], [class*="adnxs"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      width: 0 !important;
      position: absolute !important;
      left: -9999px !important;
    }
    
    /* Pop-ups und Overlays */
    .popup-overlay, .modal-overlay, .ad-overlay,
    [class*="popup-ad"], [class*="overlay-ad"],
    [class*="interstitial"], [class*="takeover"] {
      display: none !important;
    }
    
    /* Cookie und GDPR Banner */
    [class*="cookie"]:not([class*="cookie-"]):not(.cookie-policy),
    [class*="gdpr"], [class*="consent"],
    [id*="cookieConsent"], [id*="gdprConsent"] {
      display: none !important;
    }
    
    /* Newsletter Pop-ups */
    [class*="newsletter"]:not(.newsletter-content):not(.newsletter-article),
    [class*="subscribe"]:not(.subscribe-button):not(.subscribe-link),
    [class*="signup-modal"], [class*="email-popup"] {
      display: none !important;
    }
    
    /* Spezifische Werbenetzwerke */
    iframe[src*="googleads.g.doubleclick.net"],
    iframe[src*="googlesyndication.com"],
    iframe[src*="google-analytics.com"],
    iframe[src*="facebook.com/tr"],
    iframe[src*="amazon-adsystem.com"],
    iframe[src*="advertising.com"],
    iframe[src*="criteo.com"],
    iframe[src*="outbrain.com"],
    iframe[src*="taboola.com"] {
      display: none !important;
    }
    
    /* Tracking-Pixel */
    img[width="1"][height="1"],
    img[style*="width: 1px"],
    img[style*="height: 1px"],
    iframe[width="1"][height="1"] {
      display: none !important;
    }
    
    /* Video-Ads (nicht YouTube) */
    .video-ads, .preroll-ads, .midroll-ads,
    [class*="video-ad"], [id*="video-ad"] {
      display: none !important;
    }
    
    /* Sidebar und Position-basierte Ads */
    .sidebar-ad, .header-ad, .footer-ad,
    .leaderboard, .skyscraper, .rectangle,
    .mobile-banner, .sticky-banner {
      display: none !important;
    }
    
    /* Social Media Promoted Content */
    [class*="promoted"], [data-testid*="placementTracking"],
    [class*="sponsor"] {
      display: none !important;
    }
    
    /* Tracking und Analytics */
    [class*="tracking"], [class*="analytics"],
    script[src*="google-analytics.com"],
    script[src*="googletagmanager.com"],
    script[src*="hotjar.com"],
    script[src*="mouseflow.com"] {
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
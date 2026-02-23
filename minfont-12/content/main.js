// Orchestrierung
(() => {
  const S = MF.state;

  function applyAll(oldMin){
    if (!S.enabled) {
      MF.fontDetach();
      MF.adBlockerDetachCSS();
      MF.highContrastDetach();
      MF.profanityApply(); // stoppt sich selbst
      // Ad Blocker explizit stoppen wenn Extension deaktiviert
      if (MF.adBlockerStop) MF.adBlockerStop();
      return;
    }
    MF.fontAttach();
    MF.colorApply();
    MF.fontApply();
    MF.profanityApply(); // Jetzt wieder synchron
    
    // Ad Blocker separat behandeln
    if (S.adBlockerEnabled) {
      MF.adBlockerAttachCSS();
      MF.adBlockerApply();
    } else {
      MF.adBlockerDetachCSS();
      // Ad Blocker explizit stoppen
      if (MF.adBlockerStop) MF.adBlockerStop();
    }
    
    // High Contrast separat behandeln
    if (S.highContrastEnabled) {
      MF.highContrastAttach();
    } else {
      MF.highContrastDetach();
    }
    
    MF.fontReevalIfNeeded(oldMin);
  }

  // Initial laden
  chrome.storage.local.get(
    { enabled:true, fontEnabled:true, mode:"off", minPx:16, profanityEnabled:true, adBlockerEnabled:false, highContrastEnabled:false, mf_linkClicks:{} },
    s => {
      S.enabled = !!s.enabled;
      S.fontEnabled = !!s.fontEnabled;
      S.mode = s.mode || "off";
      S.minPx = MF.clampPx(s.minPx);
      S.profanityEnabled = !!s.profanityEnabled;
      S.adBlockerEnabled = !!s.adBlockerEnabled;
      S.highContrastEnabled = !!s.highContrastEnabled;
      S.linkClicks = s.mf_linkClicks || {};

      // Hotlinks NACH dem Laden der Daten initialisieren
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          applyAll();
          // Hotlinks erst nach applyAll initialisieren
          setTimeout(() => {
            MF.hotlinksInit();
            console.log('🔗 Hotlinks initialisiert mit', Object.keys(S.linkClicks).length, 'gespeicherten Links');
          }, 100);
        }, { once:true });
      } else {
        applyAll();
        // Hotlinks erst nach applyAll initialisieren  
        setTimeout(() => {
          MF.hotlinksInit();
          console.log('🔗 Hotlinks initialisiert mit', Object.keys(S.linkClicks).length, 'gespeicherten Links');
        }, 100);
      }
    }
  );

  // Änderungen aus Popup
  chrome.runtime.onMessage.addListener(msg => {
    if (msg && msg.type === "MINFONT_STATE_CHANGED") {
      chrome.storage.local.get(
        { enabled:true, fontEnabled:true, mode:"off", minPx:16, profanityEnabled:true, adBlockerEnabled:false, highContrastEnabled:false, mf_linkClicks:{} },
        s => {
          const oldMin = S.minPx;
          S.enabled = !!s.enabled;
          S.fontEnabled = !!s.fontEnabled;
          S.mode = s.mode || "off";
          S.minPx = MF.clampPx(s.minPx);
          S.profanityEnabled = !!s.profanityEnabled;
          S.adBlockerEnabled = !!s.adBlockerEnabled;
          S.highContrastEnabled = !!s.highContrastEnabled;
          // Wichtig: Hotlink-Daten auch bei Updates synchronisieren
          S.linkClicks = s.mf_linkClicks || {};
          applyAll(oldMin);
          
          // Hotlinks nach State-Update neu anwenden
          setTimeout(() => {
            document.querySelectorAll('a[href]').forEach(link => {
              if (MF.applyHot) MF.applyHot(link);
            });
          }, 50);
        }
      );
    }
  });

  // Melde Seitenbesuch an Background-Script
  chrome.runtime.sendMessage({ type: "SITE_VISIT" });

  // Storage-Änderungen verfolgen für Echtzeit-Synchronisation zwischen Tabs
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.mf_linkClicks) {
      // Aktualisiere lokale Hotlink-Daten bei Änderungen
      S.linkClicks = changes.mf_linkClicks.newValue || {};
      console.log('🔄 Hotlink-Daten von anderem Tab aktualisiert:', Object.keys(S.linkClicks).length, 'Links');
      
      // Alle Links sofort mit neuen Daten aktualisieren
      setTimeout(() => {
        document.querySelectorAll('a[href]').forEach(link => {
          if (MF.applyHot) MF.applyHot(link);
        });
      }, 10);
    }
  });
})();

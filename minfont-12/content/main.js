// Orchestrierung
(() => {
  const S = MF.state;

  function applyAll(oldMin){
    if (!S.enabled) {
      MF.fontDetach();
      MF.adBlockerDetachCSS();
      MF.profanityApply(); // stoppt sich selbst
      MF.adBlockerApply(); // stoppt sich selbst
      return;
    }
    MF.fontAttach();
    MF.colorApply();
    MF.fontApply();
    MF.profanityApply();
    
    // Ad Blocker separat behandeln
    if (S.adBlockerEnabled) {
      MF.adBlockerAttachCSS();
      MF.adBlockerApply();
    } else {
      MF.adBlockerDetachCSS();
      // Ad Blocker explizit stoppen
      if (MF.adBlockerStop) MF.adBlockerStop();
    }
    
    if (S.autoFillEnabled) {
      MF.autoFillInit();
    }
    MF.fontReevalIfNeeded(oldMin);
  }

  // Initial laden
  chrome.storage.local.get(
    { enabled:true, fontEnabled:true, mode:"off", minPx:16, compat:false, profanityEnabled:true, adBlockerEnabled:false, autoFillEnabled:false, mf_linkClicks:{} },
    s => {
      S.enabled = !!s.enabled;
      S.fontEnabled = !!s.fontEnabled;
      S.mode = s.mode || "off";
      S.minPx = MF.clampPx(s.minPx);
      S.compat = !!s.compat;
      S.profanityEnabled = !!s.profanityEnabled;
      S.adBlockerEnabled = !!s.adBlockerEnabled;
      S.autoFillEnabled = !!s.autoFillEnabled;
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
        { enabled:true, fontEnabled:true, mode:"off", minPx:16, compat:false, profanityEnabled:true, adBlockerEnabled:false, autoFillEnabled:false, mf_linkClicks:{} },
        s => {
          const oldMin = S.minPx;
          S.enabled = !!s.enabled;
          S.fontEnabled = !!s.fontEnabled;
          S.mode = s.mode || "off";
          S.minPx = MF.clampPx(s.minPx);
          S.compat = !!s.compat;
          S.profanityEnabled = !!s.profanityEnabled;
          S.adBlockerEnabled = !!s.adBlockerEnabled;
          S.autoFillEnabled = !!s.autoFillEnabled;
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

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

      MF.hotlinksInit();

      // Melde Seitenbesuch an Background-Script
      chrome.runtime.sendMessage({ type: "SITE_VISIT" });

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyAll(), { once:true });
      } else applyAll();
    }
  );

  // Änderungen aus Popup
  chrome.runtime.onMessage.addListener(msg => {
    if (msg && msg.type === "MINFONT_STATE_CHANGED") {
      chrome.storage.local.get(
        { enabled:true, fontEnabled:true, mode:"off", minPx:16, compat:false, profanityEnabled:true, adBlockerEnabled:false, autoFillEnabled:false },
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
          applyAll(oldMin);
        }
      );
    }
  });
})();

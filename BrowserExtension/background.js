function setBadge(enabled, isFrequentSite = false) {
  if (isFrequentSite && enabled) {
    // Rotes Badge für häufig besuchte Seiten
    chrome.browserAction.setBadgeText({ text: "🔥" });
    chrome.browserAction.setBadgeBackgroundColor({ color: "#e74c3c" });
  } else {
    // Normales grünes/rotes Badge
    chrome.browserAction.setBadgeText({ text: enabled ? "ON" : "OFF" });
    chrome.browserAction.setBadgeBackgroundColor({ color: enabled ? "#2ecc71" : "#e74c3c" });
  }
}

// Seitenbesuche tracken
let siteVisits = {};
const FREQUENT_VISIT_THRESHOLD = 10; // Ab 10 Besuchen gilt eine Seite als "häufig besucht"

function getHostFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function checkIfFrequentSite(url) {
  const host = getHostFromUrl(url);
  if (!host) return false;
  
  return (siteVisits[host] || 0) >= FREQUENT_VISIT_THRESHOLD;
}

function updateSiteVisits(url) {
  const host = getHostFromUrl(url);
  if (!host) return;
  
  siteVisits[host] = (siteVisits[host] || 0) + 1;
  
  // Speichere die Besuchszahlen
  chrome.storage.local.set({ mf_siteVisits: siteVisits });
  
  // Prüfe ob Badge aktualisiert werden muss
  chrome.storage.local.get({ enabled: true }, (result) => {
    const isFrequent = checkIfFrequentSite(url);
    setBadge(result.enabled, isFrequent);
  });
}
chrome.runtime.onInstalled.addListener(() => {
  // Lade gespeicherte Besuchsdaten
  chrome.storage.local.get({ mf_siteVisits: {}, enabled: true }, (result) => {
    siteVisits = result.mf_siteVisits || {};
    setBadge(!!result.enabled);
  });
});

// Tab-Updates überwachen für Seitenbesuche
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateSiteVisits(tab.url);
  }
});

// Aktiven Tab überwachen
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      chrome.storage.local.get({ enabled: true }, (result) => {
        const isFrequent = checkIfFrequentSite(tab.url);
        setBadge(result.enabled, isFrequent);
      });
    }
  });
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  chrome.storage.local.get({ enabled: true }, s => {
    // Aktualisiere Badge für aktuellen Tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const isFrequent = checkIfFrequentSite(tabs[0].url);
        setBadge(!!s.enabled, isFrequent);
      } else {
        setBadge(!!s.enabled);
      }
    });
  });
  
  chrome.tabs.query({}, tabs => tabs.forEach(t => {
    try { chrome.tabs.sendMessage(t.id, { type: "MINFONT_STATE_CHANGED" }); } catch {}
  }));
});

// Message-Handler für Content-Scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SITE_VISIT" && sender.tab && sender.tab.url) {
    updateSiteVisits(sender.tab.url);
  }
});

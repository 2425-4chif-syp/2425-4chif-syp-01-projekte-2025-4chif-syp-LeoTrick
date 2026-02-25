window.MF = window.MF || {};
(() => {
  // Umfassende hardcodierte Schimpfwörterliste (über 200 Wörter)
  const PROFANITY_WORDS = [
    // Deutsche Schimpfwörter - Basis
    "scheiße", "Trump","edwards","scheisse","arsch","arschloch","hurensohn","wichser","fotze","miststück",
    "fick","ficken","ficker","schlampe","spasti","spast","drecksau","penner",
    "bastard","pisser","kackbratze","vollpfosten","vollidiot","dummkopf","blödmann",
    "arschgesicht","scheißkerl","dreckssau","hurenbock","fickschnitzel","wixe","wixen",
    
    // Deutsche Schimpfwörter - Erweitert
    "aas","abschaum","afterlecker","analritter","arschficker","arschkriecher","arschlecker",
    "arschlochmongo","backpfeifengesicht","bauerntrampel","bescheuert","bimbo","blödian",
    "brainlet","bratze","charakterschwein","deppenkind","dickschädel","doofkopf",
    "dreckskerl","dreckstück","dummbatz","dummrian","eierkopf","eierlutscher",
    "fettarsch","fickfehler","flachwichser","fotzenknecht","frechdachs","vollhonk",
    "gelbschnabel","gestörter","schwachmat","hirnverbrannt","hohlbirne","honk",
    "hutzel","jammerlappen","kacknase","kacknoob","kakerlake","kaputtnik",
    "knalltüte","knülch","korinthenkacker","lauch","loser","lump","maulheld",
    "memme","missgeburt","mongo","mutterficker","naivling","nervensäge",
    "nichtsnutz","niete","nullchecker","nulpe","oberaffe","pfeife","plebejer",
    "pseudointellektueller","quatschkopf","randerscheinung","saftladen","sauladen",
    "scheißhaufen","schlemihl","schleimer","schnarchnase","schnösel","schwanzlutscher",
    "schwuchtel","spack","spießer","stinkstiefel","stümper","trantüte","trotzkopf",
    "tunte","uhrensohn","unmensch","versager","vögel","vollhorst","volltrottel",
    "warmduscher","weichei","wichtigtuer","wixxer","wurst","zipfelklatscher",
    
    // Deutsche Vulgäre Begriffe
    "anal","vagina","penis","muschi","schwanz","pimmel","titten","möse","porno",
    "bumsen","vögeln","rammen","stechen","orgasmus","masturbieren","onanieren",
    "geil","horny","versaut","pervers","sperma","samen","ejakulation","kondome",
    "dildos","vibrator","sexspielzeug","gruppensex","fetisch","bdsm","sm",
    
    // Deutsche Religiöse Flüche
    "verdammt","verflucht","himmelherrgott","gottverdammt","scheinheilig",
    "herrgottsakrament","kruzifix","heilandszack","donnerwetter","potzblitz",
    
    // Deutsche Diskriminierende Begriffe
    "schwuchtel","tunte","kampflesbe","asylant","kanacke","polacke","itaker",
    "spaghettifresser","froschfresser","inselaffe","ami","schlitzauge","neger",
    
    // Englische Schimpfwörter - Basis
    "fuck","fucking","motherfucker","shit","bitch","bastard","asshole","dick",
    "pussy","slut","whore","cunt","wanker","cocksucker","douchebag","prick",
    "damn","goddamn","hell","bloody","crap","piss","tits","boobs","ass",
    
    // Englische Schimpfwörter - Erweitert
    "shithead","fuckface","dickhead","asswipe","shitbag","fucktard","shitstain",
    "dumbfuck","fuckwit","cumslut","cockslave","bitchboy","fuckboy","manwhore",
    "dickwad","asslicker","buttmunch","dicksucker","cumface","shitface","turd",
    "douchebucket","fucknugget","shitlord","dickweasel","assnugget","buttface",
    "cumstain","shitcock","fucknut","dickbag","asshat","shitbrick","turdface",
    "dickless","ballsack","nutjob","jackoff","jerkoff","wanker","tosser",
    "bellend","knobhead","pillock","plonker","muppet","nonce","tosspot",
    "bawbag","fanny","minge","gash","snatch","twat","slag","scrubber",
    
    // Englische Diskriminierende Begriffe
    "retard","retarded","moron","imbecile","mongoloid","spastic","cripple",
    "faggot","fag","dyke","lesbo","tranny","shemale","homo","queer",
    "nigger","nigga","spic","wetback","beaner","chink","gook","slope",
    "kike","heeb","raghead","towelhead","sandnigger","camel",
    
    // Englische Vulgäre Begriffe
    "sex","porn","xxx","nude","naked","orgasm","masturbate","horny","kinky",
    "blowjob","handjob","footjob","titjob","anal","oral","vaginal","penetration",
    "cumshot","facial","creampie","gangbang","threesome","foursome","orgy",
    "bdsm","bondage","fetish","kink","dildo","vibrator","fleshlight","sextoy",
    "erotic","erection","aroused","climax","ejaculate","squirt","moan","groan",
    
    // Englische Religiöse Begriffe
    "jesus","christ","god","lord","holy","sacred","church","bible","christian",
    "muslim","jewish","buddhist","hindu","atheist","blasphemy","heretic",
    
    // Gewalt und Bedrohungen
    "kill","murder","die","death","suicide","bomb","terrorist","weapon","gun",
    "knife","stab","shoot","torture","rape","assault","violence","hurt","pain",
    "blood","gore","corpse","dead","killing","slaughter","massacre","genocide",
    
    // Drogen
    "weed","marijuana","cannabis","joint","blunt","bong","cocaine","heroin",
    "crack","meth","ecstasy","lsd","acid","shrooms","drugs","dealer","junkie",
    "high","stoned","blazed","trip","overdose","addiction","rehab",
    
    // Zusätzliche vulgäre und beleidigende Begriffe
    "kotzen","kotz","kotze","furzen","furz","pups","pupsen","kacken","kacke",
    "pinkeln","pinkel","urin","blut","wunde","verletzt","tot","sterben",
    "umbringen","erschießen","erstechen","erhängen","vergiften","foltern",
    "vergewaltigen","missbrauchen","schlagen","prügeln","treten","boxen",
    "spucken","speichel","rotz","schleim","eiter","pickel","warze","krätze",
    "läuse","flöhe","ungeziefer","parasit","bakterie","virus","seuche","pest",
    
    // Neue deutsche Schimpfwörter - Zusätzliche Kategorie 1
    "kackboon","vollarsch","drecksfotze","pissnelke","scheißdreck","arschfurz",
    "schweinearsch","kackbrocken","rotzbremse","sabberlatz","pisshasser","drecksfink",
    "kackspecht","rotzpickel","furzkissen","kotzhaufen","stinkaffe","dreckschwein",
    "pisser","scheißladen","volldepp","arschkanal","fickwurst","wichsgriff",
    "schlampentod","hurenprügel","arschkriecher","kackverein","pissnase","rotzkugel",
    
    // Neue deutsche Schimpfwörter - Internet/Gaming Slang
    "keksrolle","lowbob","kekskrümel","noobcake","randstein","hartzer","mongo",
    "spast","behinderter","körperbehinderter","geistigbehinderter","downie","autist",
    "retardiert","krebsgeschwür","hurenkind","hackfresse","visage","fratze","vogel",
    "spinner","psycho","verrückter","irrer","bekloppter","durchgeknallter","bekloppt",
    
    // Neue deutsche Obszönitäten
    "blasen","lutschen","lecken","fingern","reiben","wichsen","abspritzen","kommen",
    "feucht","nass","tropfen","sabbern","leckerchen","saftsack","spritzpistole",
    "schwengel","prügel","knüppel","stab","rohr","säule","mast","pfahl",
    
    // Neue englische Vulgaritäten
    "fingering","licking","sucking","jerking","stroking","rubbing","pounding",
    "banging","drilling","hammering","nailing","screwing","plowing","ramming",
    "thrusting","pumping","grinding","humping","mounting","riding","bouncing"
  ];

  const PROFANITY_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${PROFANITY_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})(?![\\p{L}\\p{N}])`, "giu");
  
  // Eigene Wörter aus Storage + kombiniertes Regex
  let customWords = [];
  let combinedRE = PROFANITY_RE;

  function rebuildRegex() {
    const all = [...new Set([...PROFANITY_WORDS, ...customWords, ...fileWords])].filter(Boolean);
    combinedRE = new RegExp(`(?<![\\p{L}\\p{N}])(${all.map(w => w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})(?![\\p{L}\\p{N}])`, "giu");
    // Cache leeren da sich Wörter geändert haben
    textCache.clear();
  }

  // Eigene Wörter initial laden
  chrome.storage.local.get({ customProfanityWords: [] }, res => {
    customWords = res.customProfanityWords || [];
    if (customWords.length) {
      rebuildRegex();
      console.log(`📋 ${customWords.length} eigene Schimpfwörter geladen`);
    }
  });

  // ========== WORTLISTEN AUS TXT-DATEIEN LADEN ==========
  // Lädt profanity_de.txt und profanity_en.txt aus dem Extension-Ordner
  // und merged sie mit der hardcodierten Liste.
  // So musst du Wörter nur in den txt-Dateien hinzufügen!
  let fileWords = [];
  function loadWordFiles() {
    const files = ['profanity_de.txt', 'profanity_en.txt'];
    let loaded = 0;
    files.forEach(file => {
      try {
        const url = chrome.runtime.getURL(file);
        fetch(url)
          .then(r => r.text())
          .then(text => {
            const words = text.split('\n')
              .map(w => w.trim())
              .filter(w => w.length >= 2 && !w.includes(' '));  // mind. 2 Zeichen, keine Sätze
            fileWords = fileWords.concat(words);
            loaded++;
            if (loaded === files.length) {
              // Alle geladen → Regex neu bauen
              rebuildRegex();
              console.log(`📄 ${fileWords.length} Wörter aus txt-Dateien geladen`);
              // CSS-Regeln neu bauen mit den neuen Wörtern
              if (profanityCSSInjected) {
                removeProfanityCSS();
                injectProfanityCSS();
              }
              // Scan nochmal wenn schon aktiv
              if (MF.state && MF.state.enabled && MF.state.profanityEnabled) {
                try { fullScan(document.body || document.documentElement); } catch(e) {}
              }
            }
          })
          .catch(e => {
            loaded++;
            console.warn(`⚠️ Konnte ${file} nicht laden:`, e.message);
          });
      } catch(e) {
        loaded++;
      }
    });
  }
  loadWordFiles();

  // Bei Änderungen neu laden
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.customProfanityWords) {
      customWords = changes.customProfanityWords.newValue || [];
      rebuildRegex();
      console.log(`🔄 Eigene Schimpfwörter aktualisiert: ${customWords.length} Wörter`);
      // Seite erneut filtern
      if (MF.state.enabled && MF.state.profanityEnabled) {
        initial();
      }
    }
  });

  // Cache für bereits gefilterte Texte
  const textCache = new Map();
  const CACHE_MAX_SIZE = 1000;

  function skippable(node){
    const p = node.parentNode;
    if (!p || p.nodeType !== 1) return true;
    const tn = p.nodeName;
    if (tn === 'SCRIPT' || tn === 'STYLE' || tn === 'NOSCRIPT' || tn === 'TEXTAREA' || tn === 'INPUT') return true;
    if (p.isContentEditable) return true;
    return false;
  }

  // Reine lokale Filterung
  const filterText = (text) => {
    if (!text || text.length < 3) return text;
    
    // Cache prüfen
    const cacheKey = text.toLowerCase().trim();
    if (textCache.has(cacheKey)) {
      return textCache.get(cacheKey);
    }
    
    const filteredText = text.replace(combinedRE, match => "*".repeat(match.length));
    
    // Cache speichern
    if (textCache.size >= CACHE_MAX_SIZE) {
      const firstKey = textCache.keys().next().value;
      textCache.delete(firstKey);
    }
    textCache.set(cacheKey, filteredText);
    
    return filteredText;
  };

  // Speicher für Originaltexte um sie wiederherstellen zu können
  const originalTexts = new Map();

  // ⚡ Batch-Verarbeitung (optimiert, kein per-match logging)
  function batchProcess(nodes) {
    let filtered = 0;
    
    for (let i = 0, len = nodes.length; i < len; i++) {
      const n = nodes[i];
      const old = n.nodeValue;
      if (!old || old.length < 3) continue;
      
      if (!originalTexts.has(n)) originalTexts.set(n, old);
      
      const filteredText = filterText(originalTexts.get(n));
      if (filteredText !== n.nodeValue) {
        n.nodeValue = filteredText;
        filtered++;
      }
    }
    
    return filtered;
  }

  function initial(){
    try {
      // CSS-Regeln zuerst - wirken sofort auf alle Elemente
      injectProfanityCSS();
      const root = document.body || document.documentElement; 
      if (!root) return;
      fullScan(root);
      console.log('✅ Profanity-Filter: Scan abgeschlossen');
      startContinuousScanning();
    } catch (error) {
      console.error('❌ Filter error:', error);
    }
  }

  // === CONTINUOUS SCANNING ===
  // Google und andere Seiten laden Inhalte dynamisch nach.
  // Wir brauchen: Scroll-Listener + periodische Re-Scans + Interval
  let continuousScanActive = false;
  let scanInterval = null;
  let scrollTimer = 0;
  
  function startContinuousScanning() {
    if (continuousScanActive) return;
    continuousScanActive = true;
    
    // 1. Periodische Re-Scans in schneller Folge am Anfang
    const delays = [200, 500, 1000, 2000, 3500, 5000];
    delays.forEach(delay => {
      setTimeout(() => {
        if (!(MF.state && MF.state.enabled && MF.state.profanityEnabled)) return;
        fullScan(document.body || document.documentElement);
      }, delay);
    });
    
    // 2. Dauerhafter Interval jede Sekunde
    scanInterval = setInterval(() => {
      if (!(MF.state && MF.state.enabled && MF.state.profanityEnabled)) return;
      try { fullScan(document.body || document.documentElement); } catch(e) {}
    }, 1000);
    
    // 3. Scroll-Listener für Infinite Scroll (Google Images, News, etc.)
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // 4. Attribute-Observer: Google ändert data-src → src beim Lazy-Load
    //    Wenn ein Bild sein src bekommt, prüfe auch alle Eltern-Container
    const attrObs = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type !== 'attributes' || m.target.tagName !== 'IMG') continue;
        const img = m.target;
        if (hiddenElements.has(img) || isAncestorHidden(img)) continue;
        // Walk up: wenn ein Eltern-Container Profanity in Attributen hat → verstecken
        let el = img;
        for (let d = 0; d < 25 && el; d++) {
          if (PAGE_TAGS.has(el.tagName)) break;
          const attrs = el.attributes;
          if (attrs) {
            for (let j = 0; j < attrs.length; j++) {
              const name = attrs[j].name;
              if (name === 'class' || name === 'style' || name === 'id') continue;
              const v = attrs[j].value;
              if (v && v.length >= 3 && containsProfanity(v)) {
                hideElement(el);
                el = null; // break outer loop
                break;
              }
            }
          }
          if (!el) break;
          el = el.parentElement;
        }
      }
    });
    attrObs.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['src','data-src','alt','title'] });
  }
  
  function stopContinuousScanning() {
    continuousScanActive = false;
    if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
    window.removeEventListener('scroll', onScroll);
  }
  
  function onScroll() {
    if (scrollTimer) return;
    scrollTimer = setTimeout(() => {
      scrollTimer = 0;
      if (!(MF.state && MF.state.enabled && MF.state.profanityEnabled)) return;
      try { fullScan(document.body || document.documentElement); } catch(e) {}
    }, 150);
  }

  let obs=null;
  
  function start(){
    if (obs) return;
    let queue=new Set(), scheduled=false;
    let newElements = [];
    
    function flush() {
      try {
        // fullScan auf alle neuen Elemente
        const els = newElements;
        newElements = [];
        for (let i = 0; i < els.length; i++) {
          if (els[i].nodeType === 1 && els[i].isConnected) fullScan(els[i]);
        }
        // Text-only changes
        if (queue.size) batchProcess(Array.from(queue));
      } finally { 
        queue.clear(); 
        scheduled=false; 
      } 
    }
    
    obs = new MutationObserver(muts=>{
      for (const m of muts){
        if (m.type==="characterData"){ 
          const n=m.target; 
          if (n && n.nodeType===3 && !skippable(n)) queue.add(n); 
        }
        else if (m.type==="childList" && m.addedNodes.length){
          for (let i = 0; i < m.addedNodes.length; i++) {
            const nd = m.addedNodes[i];
            collect(nd, queue);
            if (nd.nodeType === 1) newElements.push(nd);
          }
        }
      }
      if (!scheduled && (queue.size || newElements.length)){ 
        scheduled=true; 
        setTimeout(flush, 100);
      }
    });
    
    obs.observe(document.documentElement, { subtree:true, childList:true, characterData:true });
  }
  
  function stop(){ 
    if (obs){ obs.disconnect(); obs=null; }
    stopContinuousScanning();
  }

  function restoreOriginals() {
    let restored = 0;
    for (const [node, original] of originalTexts) {
      try {
        if (node.nodeValue !== original) {
          node.nodeValue = original;
          restored++;
        }
      } catch (e) { /* Node evtl. nicht mehr im DOM */ }
    }
    originalTexts.clear();
    textCache.clear();
    console.log(`🔄 ${restored} Textstellen wiederhergestellt`);
  }

  // ========== 🖼️ BILD- & LINK-FILTER ==========
  // Versteckt <img>, <a>, <video>, <picture>, <source> die Schimpfwörter in Attributen enthalten
  const hiddenElements = new Set();

  // ⚡ PERFORMANCE: Ein einziges Regex für ALLE Wörter statt pro-Wort-Loop
  let imageFilterRE = null;
  function buildImageFilterRegex() {
    const all = [...new Set([...PROFANITY_WORDS, ...customWords, ...fileWords])].filter(w => w && w.length >= 2);
    if (!all.length) { imageFilterRE = null; return; }
    imageFilterRE = new RegExp(all.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
  }
  buildImageFilterRegex();

  // Rebuild auch bei custom word changes
  const origRebuild = rebuildRegex;
  rebuildRegex = function() {
    origRebuild();
    buildImageFilterRegex();
  };

  function containsProfanity(text) {
    if (!text || text.length < 2 || !imageFilterRE) return false;
    return imageFilterRE.test(text);
  }

  // Prüfe ALLE Attribute eines Elements (fängt data-lpage, data-ref-docid, etc.)
  function checkElementAttributes(el) {
    if (!el.attributes) return false;
    for (let i = 0; i < el.attributes.length; i++) {
      const val = el.attributes[i].value;
      if (val && val.length >= 3 && containsProfanity(val)) return true;
    }
    return false;
  }

  // CSS Injection - !important damit Google/Webseiten es nicht überschreiben können
  let cssInjected = false;
  let profanityCSSElement = null;
  function injectHideCSS() {
    if (cssInjected) return;
    cssInjected = true;
    const style = document.createElement('style');
    style.textContent = '[data-mf-hidden]{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;clip:rect(0,0,0,0)!important;}';
    (document.head || document.documentElement).appendChild(style);
  }

  // ========== CSS-BASIERTER BILD-FILTER ==========
  // Versteckt Elemente per CSS-Attribut-Selektoren + :has() für Eltern
  let profanityCSSInjected = false;
  function injectProfanityCSS() {
    if (profanityCSSInjected) return;
    profanityCSSInjected = true;

    const allWords = [...new Set([...PROFANITY_WORDS, ...customWords, ...fileWords])]
      .filter(w => w && w.length >= 2 && !w.includes(' '));

    const attrs = [
      'data-lpage', 'data-docid', 'data-ref-docid', 'data-attrid', 'data-ipage',
      'data-item-card', 'data-tbn-id'
    ];
    const imgAttrs = ['src', 'data-src', 'alt', 'title'];

    const HIDE = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;';

    let css = '';
    for (const word of allWords) {
      const escaped = word.replace(/["\\]/g, '\\$&');
      // Nur das Element SELBST verstecken - NICHT Eltern-Container!
      // Sonst verschwinden ALLE Ergebnisse wenn ein Eltern-Container
      // mehrere Ergebnisse enthält (z.B. Edwards + andere Spieler)
      for (const attr of attrs) {
        css += `[${attr}*="${escaped}" i]{${HIDE}}\n`;
      }
      for (const attr of imgAttrs) {
        css += `img[${attr}*="${escaped}" i]{${HIDE}}\n`;
      }
    }

    profanityCSSElement = document.createElement('style');
    profanityCSSElement.id = 'mf-profanity-css';
    profanityCSSElement.textContent = css;
    (document.head || document.documentElement).appendChild(profanityCSSElement);
    console.log(`🎨 CSS-Bildfilter injiziert: ${allWords.length} Wörter, ${css.length} Bytes CSS`);
  }

  function removeProfanityCSS() {
    if (profanityCSSElement) {
      profanityCSSElement.remove();
      profanityCSSElement = null;
    }
    profanityCSSInjected = false;
  }

  function hideElement(el) {
    if (hiddenElements.has(el)) return;
    injectHideCSS();
    hiddenElements.add(el);
    el.setAttribute('data-mf-hidden', '1');
  }

  function restoreHiddenElements() {
    for (const el of hiddenElements) {
      try { el.removeAttribute('data-mf-hidden'); } catch (e) {}
    }
    hiddenElements.clear();
  }

  // Tags die nie versteckt werden sollen (nur body/html)
  const PAGE_TAGS = new Set(['BODY','HTML']);

  function isAncestorHidden(el) {
    let p = el.parentElement;
    while (p) { if (hiddenElements.has(p)) return true; p = p.parentElement; }
    return false;
  }

  // ========== KERN-FUNKTION: hideImageContainer ==========
  function hideImageContainer(startEl) {
    let el = startEl;
    for (let depth = 0; depth < 25 && el; depth++) {
      if (PAGE_TAGS.has(el.tagName)) return false;
      if (hiddenElements.has(el)) return true;
      if (el.tagName === 'IMG' || el.querySelector('img')) {
        if ((el.textContent || '').length < 2000) {
          hideElement(el);
          return true;
        }
      }
      el = el.parentElement;
    }
    return false;
  }

  // =================================================================
  // ========== NUKLEARER FULL SCAN - EINFACH UND AGGRESSIV ==========
  // =================================================================
  function fullScan(root) {
    if (!root || !imageFilterRE) return;
    let hidden = 0;

    const SKIP = {SCRIPT:1, STYLE:1, NOSCRIPT:1, LINK:1, META:1, BR:1, HR:1};

    // ===============================================================
    // --- SCHRITT 0: SUCHANFRAGE PRÜFEN ---
    // Wenn die Suchanfrage selbst ein Schimpfwort enthält (z.B. "trump"
    // auf Google Bildersuche), dann sind ALLE Ergebnisse betroffen.
    // → Verstecke ALLE Content-Bilder auf der Seite.
    // ===============================================================
    try {
      const params = new URLSearchParams(window.location.search);
      const q = (params.get('q') || params.get('query') || params.get('search_query') || params.get('p') || '').toLowerCase();
      if (q && containsProfanity(q)) {
        const allImgs = root.querySelectorAll('img');
        for (let i = 0; i < allImgs.length; i++) {
          const img = allImgs[i];
          if (hiddenElements.has(img) || isAncestorHidden(img)) continue;
          // Kleine Icons/Logos überspringen (< 48px)
          const rect = img.getBoundingClientRect();
          if (rect.width > 0 && rect.width < 48 && rect.height > 0 && rect.height < 48) continue;
          // Google-Logo und Navigation überspringen
          if (img.alt === 'Google' || img.id === 'logo') continue;
          hideElement(
            img.closest('[data-lpage]') ||
            img.closest('[data-docid]') ||
            img.closest('[data-id]') ||
            img.closest('[data-ved]') ||
            img.closest('a') ||
            img
          );
          hidden++;
        }
        // Auch Video-Thumbnails und iframes verstecken
        const media = root.querySelectorAll('video, iframe');
        for (let i = 0; i < media.length; i++) {
          if (!hiddenElements.has(media[i]) && !isAncestorHidden(media[i])) {
            hideElement(media[i]);
            hidden++;
          }
        }
      }
    } catch(e) {}

    // --- SCHRITT 1: JEDES Element auf Profanity-Attribute prüfen ---
    // Wenn Profanity in IRGENDEINEM Attribut → Element SOFORT verstecken.
    // Kein Check auf img-Kinder nötig - wenn "edwards" im data-lpage steht,
    // ist das Element ein Ergebnis-Container und muss weg.
    const all = root.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      if (PAGE_TAGS.has(el.tagName) || SKIP[el.tagName]) continue;
      if (hiddenElements.has(el) || isAncestorHidden(el)) continue;

      const attrs = el.attributes;
      if (!attrs || !attrs.length) continue;
      
      let found = false;
      for (let j = 0; j < attrs.length; j++) {
        const name = attrs[j].name;
        if (name === 'class' || name === 'style' || name === 'id') continue;
        const v = attrs[j].value;
        if (v && v.length >= 3 && containsProfanity(v)) {
          found = true;
          break;
        }
      }

      if (!found) continue;

      // Profanity in Attribut gefunden → VERSTECKEN!
      // Nur nicht verstecken wenn der textContent zu groß ist (ganze Seite)
      const textLen = (el.textContent || '').length;
      if (textLen > 5000) continue; // Zu großer Container, ist wahrsch. die ganze Seite

      hideElement(el);
      hidden++;
    }

    // --- SCHRITT 2: Text-Nodes filtern + Bild-Container verstecken ---
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while ((n = walker.nextNode())) {
      if (skippable(n)) continue;
      const old = n.nodeValue;
      if (!old || old.length < 3) continue;

      if (!originalTexts.has(n)) originalTexts.set(n, old);
      const orig = originalTexts.get(n);
      
      // Text ersetzen
      const filtered = filterText(orig);
      if (filtered !== n.nodeValue) n.nodeValue = filtered;

      // Profanity im Original? → Bild-Container verstecken
      if (containsProfanity(orig)) {
        const parent = n.parentElement;
        if (parent && !hiddenElements.has(parent) && !isAncestorHidden(parent)) {
          if (hideImageContainer(parent)) hidden++;
        }
      }
    }

    // --- SCHRITT 3: Letzte Chance - alle noch sichtbaren Bilder ---
    // Für jedes sichtbare Bild: lauf hoch, prüfe ob Container-Text
    // Profanity oder *** enthält
    const imgs = root.querySelectorAll('img');
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      if (hiddenElements.has(img) || isAncestorHidden(img)) continue;
      
      let container = img.parentElement;
      for (let d = 0; d < 25 && container; d++) {
        if (PAGE_TAGS.has(container.tagName)) break;
        if (hiddenElements.has(container)) break;

        // Prüfe Attribute des Containers
        const cAttrs = container.attributes;
        let cFound = false;
        if (cAttrs) {
          for (let j = 0; j < cAttrs.length; j++) {
            const name = cAttrs[j].name;
            if (name === 'class' || name === 'style' || name === 'id') continue;
            const v = cAttrs[j].value;
            if (v && v.length >= 3 && containsProfanity(v)) { cFound = true; break; }
          }
        }
        // Oder Text enthält Profanity/***
        if (!cFound) {
          const text = container.textContent || '';
          if (text.length >= 3 && text.length < 2000) {
            if (containsProfanity(text) || text.includes('***')) cFound = true;
          }
        }

        if (cFound && (container.textContent || '').length < 2000) {
          hideElement(container);
          hidden++;
          break;
        }
        container = container.parentElement;
      }
    }

    if (hidden > 0) console.log(`🖼️🚫 ${hidden} Elemente versteckt`);
  }
  // ========== ENDE FULL SCAN ==========

  function collect(root,set){
    if (!root) return;
    if (root.nodeType===3){ if(!skippable(root)) set.add(root); return; }
    if (root.nodeType!==1) return;
    const tn = root.nodeName;
    if (['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','INPUT'].includes(tn)) return;
    if (root.isContentEditable) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let n; while ((n=w.nextNode())) { if (!skippable(n)) set.add(n); }
  }

  MF.profanityApply = () => {
    if (!MF.state.enabled) { 
      stop();
      restoreOriginals();
      restoreHiddenElements();
      console.log('🔴 Profanity Filter deaktiviert (Extension aus)');
      return; 
    }
    
    if (MF.state.profanityEnabled) { 
      console.log(`🟢 Profanity-Filter aktiv (${PROFANITY_WORDS.length + customWords.length} Wörter)`);
      initial(); 
      start(); 
    } else { 
      console.log('🟡 Profanity Filter aus');
      stop();
      restoreOriginals();
      restoreHiddenElements();
      removeProfanityCSS();
    }
  };

  // Cache-Management
  MF.profanityClearCache = () => {
    textCache.clear();
    console.log('🗑️ Profanity-Cache geleert');
  };

  // Debug-Info
  MF.profanityInfo = () => {
    console.log('📊 Profanity Filter Info:', {
      enabled: MF.state.profanityEnabled,
      cacheSize: textCache.size,
      totalWords: PROFANITY_WORDS.length,
      mode: 'HARDCODED (keine API)',
      sampleWords: PROFANITY_WORDS.slice(0, 10)
    });
  };

  // Test-Funktion
  MF.profanityTest = (testText = "This hurensohn is fucking shit test vollpfosten") => {
    console.log('🧪 Testing hardcoded filter with:', testText);
    
    const result = filterText(testText);
    console.log('📝 Result:', result);
    
    return { original: testText, filtered: result, wordsFound: PROFANITY_WORDS.length };
  };
})();
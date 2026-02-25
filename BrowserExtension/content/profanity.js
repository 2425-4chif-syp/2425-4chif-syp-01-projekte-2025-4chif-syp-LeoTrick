window.MF = window.MF || {};
(() => {
  // Umfassende hardcodierte Schimpfwörterliste (über 200 Wörter)
  const PROFANITY_WORDS = [
    // Deutsche Schimpfwörter - Basis
    "scheiße", "Trump","scheisse","arsch","arschloch","hurensohn","wichser","fotze","miststück",
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
    const all = [...PROFANITY_WORDS, ...customWords].filter(Boolean);
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
    
    const originalText = text;
    const filteredText = text.replace(combinedRE, match => {
      console.log(`🚫 [HARDCODED] Schimpfwort erkannt: "${match}" → "${"*".repeat(match.length)}"`);
      return "*".repeat(match.length);
    });
    
    // Cache speichern
    if (textCache.size >= CACHE_MAX_SIZE) {
      const firstKey = textCache.keys().next().value;
      textCache.delete(firstKey);
    }
    textCache.set(cacheKey, filteredText);
    
    if (filteredText !== originalText) {
      console.log(`📝 [GEFILTERT] "${originalText.substring(0, 30)}..." → "${filteredText.substring(0, 30)}..."`);
    }
    
    return filteredText;
  };

  // Speicher für Originaltexte um sie wiederherstellen zu können
  const originalTexts = new Map();

  // Batch-Verarbeitung
  function batchProcess(nodes) {
    let filtered = 0;
    const foundWords = [];
    
    for (const n of nodes) {
      const old = n.nodeValue;
      if (!old || old.length < 3) continue;
      
      // Original merken falls noch nicht gespeichert
      if (!originalTexts.has(n)) {
        originalTexts.set(n, old);
      }
      
      // Immer vom Original aus filtern
      const originalForNode = originalTexts.get(n);
      
      const matches = originalForNode.match(combinedRE);
      if (matches) {
        foundWords.push(...matches);
      }
      
      const filteredText = filterText(originalForNode);
      if (filteredText !== n.nodeValue) {
        n.nodeValue = filteredText;
        filtered++;
      }
    }
    
    if (filtered > 0) {
      console.log(`🚫 [BATCH] ${filtered} Textstellen gefiltert, gefundene Wörter:`, foundWords);
    }
    
    return filtered;
  }

  function initial(){
    try {
      const root = document.body || document.documentElement; 
      if (!root) return;
      
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      const arr = []; 
      let n;
      let totalNodes = 0;
      
      console.log(`🔍 Starte Schimpfwort-Scan mit ${PROFANITY_WORDS.length + customWords.length} Wörtern (${customWords.length} eigene)...`);
      
      while ((n = w.nextNode())) { 
        if (!skippable(n)) {
          arr.push(n); 
          totalNodes++;
        }
        
        if (arr.length >= 100) { 
          console.log(`🔄 [BATCH ${Math.ceil(totalNodes/100)}] Verarbeite ${arr.length} Textstellen...`);
          batchProcess(arr);
          arr.length = 0; 
        } 
      }
      
      if (arr.length) {
        console.log(`🔄 [FINAL-BATCH] Verarbeite ${arr.length} verbleibende Textstellen...`);
        batchProcess(arr);
      }
      
      console.log(`✅ Hardcodierte Schimpfwort-Filterung abgeschlossen für ${totalNodes} Textstellen`);
      
    } catch (error) {
      console.error('❌ Filter error:', error);
    }
  }

  let obs=null;
  
  function start(){
    if (obs) return;
    let queue=new Set(), scheduled=false;
    
    function flushSync() {
      try { 
        const nodes = Array.from(queue);
        console.log(`🔄 [LIVE-UPDATE] Verarbeite ${nodes.length} neue/geänderte Textstellen...`);
        batchProcess(nodes);
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
        else if (m.type==="childList"){ 
          m.addedNodes && m.addedNodes.forEach(nd => collect(nd, queue)); 
        }
      }
      if (!scheduled && queue.size){ 
        scheduled=true; 
        setTimeout(flushSync, 100);
      }
    });
    
    obs.observe(document.documentElement, { subtree:true, childList:true, characterData:true });
  }
  
  function stop(){ 
    if (obs){ 
      obs.disconnect(); 
      obs=null; 
    } 
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
      console.log('🔴 Profanity Filter deaktiviert (Extension aus)');
      return; 
    }
    
    if (MF.state.profanityEnabled) { 
      console.log('🟢 Starte hardcodierte Schimpfwort-Filterung...');
      console.log(`📋 Verfügbare Wörter: ${PROFANITY_WORDS.length + customWords.length}`);
      initial(); 
      start(); 
    } else { 
      console.log('🟡 Profanity Filter deaktiviert (Feature aus)');
      stop();
      restoreOriginals();
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
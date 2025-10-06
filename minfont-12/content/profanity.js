window.MF = window.MF || {};
(() => {
  const WORDS = [
    "scheiße","scheisse","arsch","arschloch","hurensohn","wichser","fotze","miststück",
    "fick","ficken","ficker","schlampe","spasti","spast","drecksau","penner",
    "fuck","fucking","motherfucker","shit","bitch","bastard","asshole","dick","pussy","slut","whore","cunt","wanker"
  ];
  const RE = new RegExp(`\\b(${WORDS.map(w => w.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")).join("|")})\\b`, "giu");
  const mask = m => "*".repeat(m.length);

  function skippable(node){
    const p = node.parentNode;
    if (!p || p.nodeType !== 1) return true;
    const tn = p.nodeName;
    if (tn === 'SCRIPT' || tn === 'STYLE' || tn === 'NOSCRIPT' || tn === 'TEXTAREA' || tn === 'INPUT') return true;
    if (p.isContentEditable) return true;
    return false;
  }
  function batch(nodes){
    for (const n of nodes) {
      const old = n.nodeValue; if (!old) continue;
      const nu = old.replace(RE, mask); if (nu !== old) n.nodeValue = nu;
    }
  }
  function initial(){
    try {
      const root = document.body || document.documentElement; if (!root) return;
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      const arr = []; let n;
      while ((n = w.nextNode())) { if (!skippable(n)) arr.push(n); if (arr.length >= 2000){ batch(arr); arr.length=0; } }
      if (arr.length) batch(arr);
    } catch {}
  }
  let obs=null;
  function start(){
    if (obs) return;
    let queue=new Set(), scheduled=false;
    function flush(){ try { batch(Array.from(queue)); } finally { queue.clear(); scheduled=false; } }
    obs = new MutationObserver(muts=>{
      for (const m of muts){
        if (m.type==="characterData"){ const n=m.target; if (n && n.nodeType===3 && !skippable(n)) queue.add(n); }
        else if (m.type==="childList"){ m.addedNodes && m.addedNodes.forEach(nd => collect(nd, queue)); }
      }
      if (!scheduled && queue.size){ scheduled=true; setTimeout(flush, 50); }
    });
    obs.observe(document.documentElement, { subtree:true, childList:true, characterData:true });
  }
  function stop(){ if (obs){ obs.disconnect(); obs=null; } }
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
    if (!MF.state.enabled) { stop(); return; }
    if (MF.state.profanityEnabled) { initial(); start(); } else { stop(); }
  };
})();

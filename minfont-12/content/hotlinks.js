window.MF = window.MF || {};
(() => {
  const CLICK_LIMIT = 5;

  function keyFor(a){
    try { const u = new URL(a.href, location.href); return `${u.origin}|${u.pathname}${u.search}${u.hash}`; }
    catch { return (a.getAttribute('href') || '').trim(); }
  }
  function applyHot(a){
    // Nur echte Links mit href-Attribut
    if (!a || !a.href || !a.getAttribute('href')) return;
    
    // Verhindere mehrfache Anwendung
    if (a.classList.contains('mf-hotlink')) return;
    
    // Ignoriere spezielle Links
    const href = a.getAttribute('href');
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
    
    const cnt = (MF.state.linkClicks[keyFor(a)] || 0);
    if (cnt >= CLICK_LIMIT) {
      a.classList.add('mf-hotlink');
      
      // Verhindere Style-Bleeding zu Parent/Child-Elementen
      a.style.cssText += `
        isolation: isolate !important;
        contain: layout style !important;
      `;
    }
  }
  function initialPass(){
    try { document.querySelectorAll('a[href]').forEach(applyHot); } catch {}
  }
  function clicks(){
    document.addEventListener('click', e=>{
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      
      // Nur echte Links behandeln
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
      
      const k = keyFor(a);
      MF.state.linkClicks[k] = (MF.state.linkClicks[k] || 0) + 1;
      
      if (MF.state.linkClicks[k] >= CLICK_LIMIT) {
        // Verhindere mehrfache Anwendung
        if (!a.classList.contains('mf-hotlink')) {
          a.classList.add('mf-hotlink');
          
          // Style-Isolation
          a.style.cssText += `
            isolation: isolate !important;
            contain: layout style !important;
          `;
        }
      }
      
      chrome.storage.local.set({ mf_linkClicks: MF.state.linkClicks });
    }, true);
  }
  function watchNew(){
    const mo = new MutationObserver(muts=>{
      for (const m of muts){
        if (m.type==='childList'){
          m.addedNodes && m.addedNodes.forEach(node=>{
            if (!node || node.nodeType!==1) return;
            if (node.matches && node.matches('a[href]')) applyHot(node);
            node.querySelectorAll && node.querySelectorAll('a[href]').forEach(applyHot);
          });
        }
        if (m.type==='attributes' && m.target && m.target.matches && m.target.matches('a[href]')) applyHot(m.target);
      }
    });
    mo.observe(document.documentElement, { subtree:true, childList:true, attributes:true, attributeFilter:['href'] });
  }

  MF.hotlinksInit = () => { clicks(); watchNew(); initialPass(); };
})();

const clamp = v => Math.max(12, Math.min(50, parseInt(v,10) || 12));
const setKV = (k,v) => new Promise(res => chrome.storage.local.set({ [k]: v }, res));
const getKV = def   => new Promise(res => chrome.storage.local.get(def, res));

(async function init(){
  const state = await getKV({
    enabled:true,
    fontEnabled:true,
    mode:"off",
    minPx:16,
    compat:false,
    profanityEnabled:true,
    adBlockerEnabled:false,
    autoFillEnabled:false
  });

  const toggleBtn   = document.getElementById('toggle');
  const fontChk     = document.getElementById('fontEnabled');
  const compatChk   = document.getElementById('compat');
  const profChk     = document.getElementById('profanity');
  const adBlockChk  = document.getElementById('adBlocker');
  const autoFillChk = document.getElementById('autoFill');
  const autoFillSection = document.getElementById('autoFillSection');
  const loginList = document.getElementById('loginList');

  const sizeWrap    = document.getElementById('sizeWrap');
  const slider      = document.getElementById('slider');
  const pxInput     = document.getElementById('pxInput');
  const pxLabel     = document.getElementById('pxLabel');

  const modeButtons = [...document.querySelectorAll('.btn[data-mode]')];

  function renderToggleColors() {
    toggleBtn.classList.toggle('on',  state.enabled);
    toggleBtn.classList.toggle('off', !state.enabled);
    toggleBtn.querySelector('strong').textContent = state.enabled ? "Deaktivieren" : "Aktivieren";
    toggleBtn.querySelector('small').textContent  = state.enabled ? "Add-on ist aktiv" : "Add-on ist aus";
    
    // Ausgrauen wenn Extension deaktiviert
    document.body.classList.toggle('extension-disabled', !state.enabled);
  }

  function renderSliderFill() {
    // Firefox nutzt ::-moz-range-progress für native runde Füllung
    // Für WebKit simulieren wir die grüne Füllung mit einem Pseudo-Element über JavaScript
    const pct = ((state.minPx - 12) / (50 - 12)) * 100;
    
    // Erstelle oder aktualisiere den dynamischen Style für WebKit
    let fillStyle = document.getElementById('slider-fill-style');
    if (!fillStyle) {
      fillStyle = document.createElement('style');
      fillStyle.id = 'slider-fill-style';
      document.head.appendChild(fillStyle);
    }
    
    fillStyle.textContent = `
      #slider::-webkit-slider-runnable-track {
        background: linear-gradient(90deg, 
          #2ecc71 0%, 
          #27ae60 ${pct}%, 
          #e8e8e8 ${pct}%, 
          #e8e8e8 100%
        ) !important;
      }
    `;
  }

  function renderDisableState() {
    // Wenn Schrift-Zoom aus, den ganzen Block ausgrauen + deaktivieren
    sizeWrap.classList.toggle('disabled', !state.fontEnabled || !state.enabled);
    slider.disabled  = (!state.fontEnabled || !state.enabled);
    pxInput.disabled = (!state.fontEnabled || !state.enabled);
  }

  function render() {
    renderToggleColors();
    fontChk.checked   = !!state.fontEnabled;
    compatChk.checked = !!state.compat;
    profChk.checked   = !!state.profanityEnabled;
    adBlockChk.checked = !!state.adBlockerEnabled;
    autoFillChk.checked = !!state.autoFillEnabled;
    
    // Auto-Fill Section anzeigen/verstecken
    autoFillSection.style.display = state.autoFillEnabled ? 'block' : 'none';
    if (state.autoFillEnabled) {
      loadLoginList();
    }

    modeButtons.forEach(b => b.classList.toggle('on', b.dataset.mode === state.mode));

    slider.min = "12"; slider.max = "50"; slider.step = "1";
    slider.value = state.minPx;
    pxInput.value = state.minPx;
    pxLabel.textContent = `${state.minPx} px`;

    renderSliderFill();
    renderDisableState();
  }
  render();

  // Master an/aus (grün/rot)
  toggleBtn.addEventListener('click', async () => {
    state.enabled = !state.enabled;
    await setKV('enabled', state.enabled);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
    render();
  });

  // Schrift-Zoom an/aus
  fontChk.addEventListener('change', async ()=>{
    state.fontEnabled = !!fontChk.checked;
    await setKV('fontEnabled', state.fontEnabled);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
    render();
  });

  // Kompatibilitätsmodus
  compatChk.addEventListener('change', async ()=>{
    state.compat = !!compatChk.checked;
    await setKV('compat', state.compat);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
  });

  // Schimpfwörter-Filter
  profChk.addEventListener('change', async ()=>{
    state.profanityEnabled = !!profChk.checked;
    await setKV('profanityEnabled', state.profanityEnabled);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
  });

  // Auto-Fill
  autoFillChk.addEventListener('change', async ()=>{
    state.autoFillEnabled = !!autoFillChk.checked;
    await setKV('autoFillEnabled', state.autoFillEnabled);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
    
    // Auto-Fill Section anzeigen/verstecken
    autoFillSection.style.display = state.autoFillEnabled ? 'block' : 'none';
    if (state.autoFillEnabled) {
      loadLoginList();
    }
  });

  // Ad Blocker Event Listener (war vergessen!)
  adBlockChk.addEventListener('change', async ()=>{
    state.adBlockerEnabled = !!adBlockChk.checked;
    await setKV('adBlockerEnabled', state.adBlockerEnabled);
    
    // Debug-Log
    console.log('💾 Ad Blocker Toggle:', state.adBlockerEnabled ? 'EIN' : 'AUS');
    
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
  });

  // Toggle-Schalter direkt klickbar machen
  document.querySelectorAll('.toggle-switch').forEach(toggleSwitch => {
    toggleSwitch.addEventListener('click', (e) => {
      const checkbox = toggleSwitch.querySelector('input[type="checkbox"]');
      if (checkbox && e.target !== checkbox) {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      }
    });
  });

  // Farbmodus
  modeButtons.forEach(b=>{
    b.addEventListener('click', async ()=>{
      state.mode = b.dataset.mode;
      await setKV('mode', state.mode);
      chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
      render(); // UI aktualisieren um den gewählten Modus zu zeigen
    });
  });

  // Slider live + speichern
  function updateFromSliderLive(){
    state.minPx = clamp(slider.value);
    pxLabel.textContent = `${state.minPx} px`;
    pxInput.value = state.minPx;
    renderSliderFill();
  }
  slider.addEventListener('input', updateFromSliderLive);
  slider.addEventListener('change', async ()=>{
    state.minPx = clamp(slider.value);
    await setKV('minPx', state.minPx);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
  });

  // Manuelle Eingabe
  pxInput.addEventListener('input', ()=>{
    const v = clamp(pxInput.value);
    slider.value = v;
    pxLabel.textContent = `${v} px`;
    renderSliderFill();
  });
  pxInput.addEventListener('change', async ()=>{
    state.minPx = clamp(pxInput.value);
    pxInput.value = state.minPx;
    slider.value  = state.minPx;
    await setKV('minPx', state.minPx);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
  });

  // Login-Liste laden und anzeigen
  async function loadLoginList() {
    try {
      const autoFillData = await getKV({ mf_autoFillData: {} });
      const logins = autoFillData.mf_autoFillData || {};
      
      if (Object.keys(logins).length === 0) {
        loginList.innerHTML = '<div class="no-logins">Noch keine Login-Daten gespeichert</div>';
        return;
      }

      let html = '';
      Object.keys(logins).forEach(domain => {
        const login = logins[domain];
        // Einfache Entschlüsselung für Anzeige (username)
        const username = simpleDecryptForDisplay(login.username);
        const passwordMask = '•'.repeat(Math.min(simpleDecryptForDisplay(login.password).length, 12));
        
        html += `
          <div class="login-item">
            <div class="login-info">
              <div class="login-domain">${domain}</div>
              <div class="login-username">${username} • ${passwordMask}</div>
            </div>
            <button class="login-delete" data-domain="${domain}">🗑️</button>
          </div>
        `;
      });
      
      loginList.innerHTML = html;
      
      // Delete-Buttons Event-Listener
      loginList.querySelectorAll('.login-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const domain = e.target.getAttribute('data-domain');
          if (confirm(`Login-Daten für ${domain} löschen?`)) {
            const autoFillData = await getKV({ mf_autoFillData: {} });
            const logins = autoFillData.mf_autoFillData || {};
            delete logins[domain];
            await setKV('mf_autoFillData', logins);
            loadLoginList(); // Liste neu laden
          }
        });
      });
    } catch (error) {
      console.error('Fehler beim Laden der Login-Liste:', error);
      loginList.innerHTML = '<div class="no-logins">Fehler beim Laden der Daten</div>';
    }
  }

  // Vereinfachte Entschlüsselung nur für Anzeige
  function simpleDecryptForDisplay(encrypted) {
    try {
      const ENCRYPT_KEY = 'MinFont2024SecureKey';
      const decoded = atob(encrypted);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length));
      }
      return result;
    } catch {
      return 'Fehler';
    }
  }
})();

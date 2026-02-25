const clamp = v => Math.max(12, Math.min(50, parseInt(v,10) || 12));
const setKV = (k,v) => new Promise(res => chrome.storage.local.set({ [k]: v }, res));
const getKV = def   => new Promise(res => chrome.storage.local.get(def, res));

// Popup-Größe Funktionen
function setPopupScale(scale) {
  document.documentElement.style.setProperty('--popup-scale', scale);
  // Entferne die manuelle Breiten-/Höhenänderung da CSS das jetzt übernimmt
}

function updatePopupSizeDisplay(scale) {
  const percentage = Math.round(scale * 100);
  document.getElementById('popupSizeValue').textContent = `${percentage}%`;
}

(async function init(){
  const state = await getKV({
    enabled:true,
    fontEnabled:true,
    mode:"off",
    minPx:16,
    profanityEnabled:true,
    highContrastEnabled:false,
    popupScale:1
  });

  const toggleBtn   = document.getElementById('toggle');
  const fontChk     = document.getElementById('fontEnabled');
  const profChk     = document.getElementById('profanity');
  const highContrastChk = document.getElementById('highContrast');

  const sizeWrap    = document.getElementById('sizeWrap');
  const slider      = document.getElementById('slider');
  const pxInput     = document.getElementById('pxInput');
  const pxLabel     = document.getElementById('pxLabel');

  const modeButtons = [...document.querySelectorAll('.btn[data-mode]')];
  
  // Popup-Größe Elemente
  const popupSizeSlider = document.getElementById('popupSizeSlider');
  const popupSizeValue = document.getElementById('popupSizeValue');
  const popupSizeReset = document.getElementById('popupSizeReset');

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
    profChk.checked   = !!state.profanityEnabled;
    highContrastChk.checked = !!state.highContrastEnabled;

    modeButtons.forEach(b => b.classList.toggle('on', b.dataset.mode === state.mode));

    slider.min = "12"; slider.max = "50"; slider.step = "1";
    slider.value = state.minPx;
    pxInput.value = state.minPx;
    pxLabel.textContent = `${state.minPx} px`;

    // Popup-Größe rendern
    popupSizeSlider.value = state.popupScale || 1;
    setPopupScale(state.popupScale || 1);
    updatePopupSizeDisplay(state.popupScale || 1);

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



  // Schimpfwörter-Filter
  profChk.addEventListener('change', async ()=>{
    state.profanityEnabled = !!profChk.checked;
    await setKV('profanityEnabled', state.profanityEnabled);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
  });

  // ── Eigene Schimpfwörter ──
  const customWordInput = document.getElementById('customWordInput');
  const addWordBtn      = document.getElementById('addWordBtn');
  const customWordList  = document.getElementById('customWordList');
  const noCustomWords   = document.getElementById('noCustomWords');

  let customWords = [];

  function renderCustomWords() {
    customWordList.innerHTML = '';
    noCustomWords.style.display = customWords.length ? 'none' : 'block';
    customWords.forEach(word => {
      const tag = document.createElement('span');
      tag.className = 'custom-word-tag';
      tag.textContent = word + ' ';
      const rm = document.createElement('span');
      rm.className = 'remove-word';
      rm.textContent = '×';
      rm.addEventListener('click', () => removeCustomWord(word));
      tag.appendChild(rm);
      customWordList.appendChild(tag);
    });
  }

  async function saveCustomWords() {
    await setKV('customProfanityWords', customWords);
    chrome.runtime.sendMessage({ type:"MINFONT_STATE_CHANGED" });
  }

  async function addCustomWord() {
    const raw = customWordInput.value.trim().toLowerCase();
    if (!raw) return;
    if (!customWords.includes(raw)) {
      customWords.push(raw);
      await saveCustomWords();
      renderCustomWords();
    }
    customWordInput.value = '';
  }

  async function removeCustomWord(word) {
    customWords = customWords.filter(w => w !== word);
    await saveCustomWords();
    renderCustomWords();
  }

  addWordBtn.addEventListener('click', addCustomWord);
  customWordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addCustomWord();
  });

  // Eigene Wörter laden
  chrome.storage.local.get({ customProfanityWords: [] }, res => {
    customWords = res.customProfanityWords || [];
    renderCustomWords();
  });



  // High Contrast Event Listener
  highContrastChk.addEventListener('change', async ()=>{
    state.highContrastEnabled = !!highContrastChk.checked;
    await setKV('highContrastEnabled', state.highContrastEnabled);
    
    console.log('💾 High Contrast Toggle:', state.highContrastEnabled ? 'EIN' : 'AUS');
    
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

  // Popup-Größe Event Listeners
  popupSizeSlider.addEventListener('input', (e) => {
    const scale = parseFloat(e.target.value);
    state.popupScale = scale;
    setPopupScale(scale);
    updatePopupSizeDisplay(scale);
  });

  popupSizeSlider.addEventListener('change', async (e) => {
    const scale = parseFloat(e.target.value);
    state.popupScale = scale;
    await setKV('popupScale', scale);
    console.log('💾 Popup-Größe gespeichert:', `${Math.round(scale * 100)}%`);
  });

  popupSizeReset.addEventListener('click', async () => {
    state.popupScale = 1;
    popupSizeSlider.value = 1;
    setPopupScale(1);
    updatePopupSizeDisplay(1);
    await setKV('popupScale', 1);
    console.log('🔄 Popup-Größe zurückgesetzt');
  });

})();

from mitmproxy import http
import re

def response(flow: http.HTTPFlow) -> None:
    # Nur HTML-Seiten bearbeiten
    if flow.response and "text/html" in flow.response.headers.get("content-type", ""):
        try:
            content = flow.response.get_text()
            url = flow.request.pretty_url
            
            # UNIVERSELLES ADAPTIVES FONT-SYSTEM
            font_script = f"""
<style>
/* 🌍 UNIVERSELLER FONT-FIXER - PASST SICH AUTOMATISCH AN JEDE WEBSITE AN */
/* Verstecke das Script visuell, aber lass es arbeiten */
#font-fixer-status {{
    position: fixed; top: 10px; right: 10px; 
    background: rgba(0,0,0,0.8); color: white; 
    padding: 5px 10px; border-radius: 5px; font-size: 11px;
    z-index: 999999; display: none;
}}
</style>

<div id="font-fixer-status">🔧 Font-Fixer aktiv</div>

<script>
console.log('� Universeller Adaptive Font-Fixer geladen für: {url}');

function universalFontFixer() {{
    const hostname = window.location.hostname;
    const url = window.location.href;
    let totalChanged = 0;
    let analysisResults = {{}};
    
    // 🔍 SCHRITT 1: WEBSITE ANALYSIEREN
    console.log('🔍 Analysiere Website:', hostname);
    
    // Sammle alle Schriftgrößen auf der Seite
    const fontSizes = [];
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(el => {{
        const size = parseFloat(window.getComputedStyle(el).fontSize);
        if (size && el.innerText && el.innerText.trim() && el.children.length === 0) {{
            fontSizes.push(size);
        }}
    }});
    
    // Berechne Statistiken
    const sortedSizes = fontSizes.sort((a, b) => a - b);
    const avgSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;
    const minSize = Math.min(...fontSizes);
    const maxSize = Math.max(...fontSizes);
    const medianSize = sortedSizes[Math.floor(sortedSizes.length / 2)];
    
    console.log('� Website-Analyse:', {{
        average: Math.round(avgSize), 
        median: Math.round(medianSize),
        min: Math.round(minSize), 
        max: Math.round(maxSize),
        elements: fontSizes.length
    }});
    
    // 🎯 SCHRITT 2: INTELLIGENTE GRENZWERTE BESTIMMEN
    let intelligentMinSize;
    let boostAmount;
    
    if (avgSize < 13) {{
        // Sehr kleine Schriften dominieren
        intelligentMinSize = 15;
        boostAmount = 4;
        console.log('🔬 Mikro-Text Website erkannt');
    }} else if (avgSize < 15) {{
        // Kleine Schriften
        intelligentMinSize = 16;
        boostAmount = 3;
        console.log('🔍 Klein-Text Website erkannt');
    }} else if (avgSize > 18) {{
        // Große Schriften - sehr vorsichtig
        intelligentMinSize = Math.max(12, minSize);
        boostAmount = 2;
        console.log('📖 Groß-Text Website erkannt');
    }} else {{
        // Normale Schriften
        intelligentMinSize = 14;
        boostAmount = 3;
        console.log('� Normal-Text Website erkannt');
    }}
    
    // 🌐 SCHRITT 3: WEBSITE-SPEZIFISCHE FEINTUNING
    if (hostname.includes('moodle') || hostname.includes('edu') || hostname.includes('htl-leonding')) {{
        intelligentMinSize = Math.max(intelligentMinSize, 16);
        console.log('🎓 Bildungsplattform erkannt - höhere Standards');
    }} else if (hostname.includes('orf.at')) {{
        intelligentMinSize = Math.max(intelligentMinSize, 15);
        console.log('📺 News-Website erkannt');
    }} else if (hostname.includes('google.com')) {{
        intelligentMinSize = Math.max(intelligentMinSize, 13);
        boostAmount = 2; // Google ist empfindlich
        console.log('🔍 Google erkannt - vorsichtige Anpassung');
    }} else if (hostname.includes('apple.com')) {{
        intelligentMinSize = Math.max(intelligentMinSize, 14);
        console.log('🍎 Apple erkannt');
    }}
    
    // 🛠 SCHRITT 4: SCHRIFTEN REPARIEREN
    let elementsChanged = 0;
    let sizesChanged = {{}};
    
    allElements.forEach(el => {{
        if (el.innerText && el.innerText.trim() && el.children.length === 0) {{
            const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
            
            if (currentSize && currentSize < intelligentMinSize) {{
                const newSize = Math.max(intelligentMinSize, currentSize + boostAmount);
                
                // Sanfte, sichere Anpassung
                el.style.setProperty('font-size', newSize + 'px', 'important');
                el.style.setProperty('line-height', '1.5', 'important');
                
                // Statistik
                const change = Math.round(currentSize) + '→' + Math.round(newSize);
                sizesChanged[change] = (sizesChanged[change] || 0) + 1;
                elementsChanged++;
            }}
        }}
    }});
    
    // 📊 SCHRITT 5: ERGEBNIS BERICHTEN
    console.log('✨ Einfache Font-Reparatur abgeschlossen:');
    console.log('  🎯 Regel: Nur unter 12px → 20px'); 
    console.log('  🔧 Elemente repariert:', elementsChanged);
    console.log('  📏 Änderungen:', sizesChanged);
    
    if (elementsChanged > 0) {{
        console.log('🎉 ' + elementsChanged + ' kleine Schriften (<12px) auf ' + hostname + ' auf 20px vergrößert!');
        
        // Zeige kurz Status an
        const status = document.getElementById('font-fixer-status');
        if (status) {{
            status.textContent = '✅ ' + elementsChanged + ' kleine Schriften → 20px';
            status.style.display = 'block';
            setTimeout(() => status.style.display = 'none', 3000);
        }}
    }} else {{
        console.log('👍 Keine Schriften unter 12px gefunden auf ' + hostname + ' - alles OK!');
    }}
    
    return {{ elementsChanged, criticalMinSize: CRITICAL_MIN_SIZE, targetSize: TARGET_SIZE, hostname }};
}}

// 🚀 STARTE UNIVERSELLEN FONT-FIXER
setTimeout(() => {{
    try {{
        universalFontFixer();
    }} catch(error) {{
        console.error('Font-Fixer Fehler:', error);
    }}
}}, 1500); // Etwas mehr Zeit für komplexe Websites

// 🔄 ERNEUT NACH DOM-ÄNDERUNGEN (für dynamische Websites)
let lastCheck = Date.now();
const observer = new MutationObserver(() => {{
    if (Date.now() - lastCheck > 2000) {{ // Nicht zu oft
        console.log('🔄 DOM geändert - erneute Font-Prüfung');
        setTimeout(universalFontFixer, 500);
        lastCheck = Date.now();
    }}
}});

// Starte Beobachtung nach kurzer Verzögerung
setTimeout(() => {{
    observer.observe(document.body, {{ childList: true, subtree: true }});
}}, 3000);

console.log('🎯 Universeller Font-Fixer vollständig geladen und bereit!');
</script>"""
            
            # Script einfügen
            if "</head>" in content:
                content = content.replace("</head>", font_script + "</head>")
            else:
                content = font_script + content
            
            flow.response.set_text(content)
            print(f"✅ Adaptive Font-Fix: {url}")
            
        except Exception as e:
            print(f"❌ Fehler: {e}")

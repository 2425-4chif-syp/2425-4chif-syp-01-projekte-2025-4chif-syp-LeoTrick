from mitmproxy import http

def response(flow: http.HTTPFlow) -> None:
    if flow.response and "text/html" in flow.response.headers.get("content-type", ""):
        try:
            content = flow.response.get_text()
            url = flow.request.pretty_url
            
            font_script = '''
<style>
#font-fixer-status {
    position: fixed; top: 10px; right: 10px; 
    background: rgba(0,150,0,0.9); color: white; 
    padding: 5px 10px; border-radius: 5px; font-size: 12px;
    z-index: 999999; display: none;
}
.font-fixer-changed {
    color: #00AA00 !important;
    text-shadow: 0 0 1px rgba(0,170,0,0.3) !important;
}
</style>

<div id="font-fixer-status">Font-Fixer aktiv</div>

<script>
console.log('Font-Fixer gestartet');

function simpleFontFixer() {
    const MIN_SIZE = 12;
    const TARGET_SIZE = 20;
    let elementsChanged = 0;
    
    document.querySelectorAll('*').forEach(el => {
        if (el.innerText && el.innerText.trim() && el.children.length === 0) {
            const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
            if (currentSize && currentSize < MIN_SIZE) {
                el.style.setProperty('font-size', TARGET_SIZE + 'px', 'important');
                el.classList.add('font-fixer-changed');
                elementsChanged++;
            }
        }
    });
    
    if (elementsChanged > 0) {
        console.log('Schriften geändert: ' + elementsChanged + ' (< 12px -> 20px grün)');
        const status = document.getElementById('font-fixer-status');
        if (status) {
            status.textContent = elementsChanged + ' Schriften geändert';
            status.style.display = 'block';
            setTimeout(() => status.style.display = 'none', 3000);
        }
    }
}

setTimeout(simpleFontFixer, 1500);
</script>
'''
            
            if "</head>" in content:
                content = content.replace("</head>", font_script + "</head>")
            else:
                content = font_script + content
            
            flow.response.set_text(content)
            print(f"Font-Fix aktiv: {url}")
            
        except Exception as e:
            print(f"Fehler: {e}")

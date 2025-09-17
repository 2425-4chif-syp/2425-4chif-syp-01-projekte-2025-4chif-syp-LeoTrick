from mitmproxy import http

def response(flow: http.HTTPFlow) -> None:
    # Nur bei HTL Leonding Website
    if "htl-leonding.at" in flow.request.host:
        
        # Nur HTML-Seiten
        if flow.response and "text/html" in flow.response.headers.get("content-type", ""):
            try:
                content = flow.response.get_text()
                
                # EINFACHE ERSETZUNGEN
                content = content.replace("TOP NEWS", "SUPER NEWS")
                content = content.replace("Bildungsangebot", "Angebot")
                content = content.replace("Informatik", "Design")
                
                # CSS für blaue Farben einfügen
                css_injection = """<style>
                body { background: linear-gradient(135deg, #74b9ff, #0984e3) !important; }
                .header, header { background: #2d3436 !important; }
                h1, h2, h3 { color: #ffffff !important; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
                a { color: #00b894 !important; }
                .container { background: rgba(255,255,255,0.9) !important; border-radius: 10px; }
                </style>"""
                content = content.replace("</head>", css_injection + "</head>")
                
                flow.response.set_text(content)
                print(f"✅ TOP NEWS → SUPER NEWS in: {flow.request.url}")
                
            except Exception as e:
                print(f"❌ Fehler: {e}")
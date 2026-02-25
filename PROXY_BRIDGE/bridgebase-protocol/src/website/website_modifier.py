from mitmproxy import http
import re
import os

# WELTWEITE SCHIMPFWORT-DATENBANK laden
def load_profanity_list():
    """Lädt Schimpfwörter aus Dateien"""
    profanity_words = set()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Deutsche Schimpfwörter
    de_file = os.path.join(script_dir, "profanity_de.txt")
    if os.path.exists(de_file):
        with open(de_file, 'r', encoding='utf-8') as f:
            profanity_words.update(line.strip() for line in f if line.strip())
    
    # Englische Schimpfwörter
    en_file = os.path.join(script_dir, "profanity_en.txt")
    if os.path.exists(en_file):
        with open(en_file, 'r', encoding='utf-8') as f:
            profanity_words.update(line.strip() for line in f if line.strip())
    
    return profanity_words

# Globale Variable - wird beim Start geladen
PROFANITY_WORDS = load_profanity_list()
print(f"🤬 {len(PROFANITY_WORDS)} Schimpfwörter geladen!")

# ⚡ PERFORMANCE: Einmalig ein kombiniertes Regex für ALLE Wörter kompilieren
_profanity_words_3plus = sorted([w for w in PROFANITY_WORDS if len(w) >= 3], key=len, reverse=True)
if _profanity_words_3plus:
    _combined_text_pattern = re.compile(
        r'\b(' + '|'.join(re.escape(w) for w in _profanity_words_3plus) + r')\b',
        re.IGNORECASE
    )
    # Für Attribute-Matching (ohne Wortgrenzen, da URLs keine Wortgrenzen haben)
    _combined_attr_pattern = re.compile(
        '|'.join(re.escape(w) for w in _profanity_words_3plus),
        re.IGNORECASE
    )
else:
    _combined_text_pattern = None
    _combined_attr_pattern = None

# ⚡ CSS-REGELN + JS-SCANNER für Bild-Verstecken generieren
def _generate_profanity_css():
    """Generiert CSS + JS das Bilder/Container mit Schimpfwörtern versteckt"""
    words = [w for w in PROFANITY_WORDS if len(w) >= 2 and ' ' not in w]
    if not words:
        return ''
    
    HIDE = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;'
    attrs = ['data-lpage', 'data-docid', 'data-ref-docid', 'data-attrid', 'data-ipage']
    img_attrs = ['src', 'data-src', 'alt', 'title']
    
    rules = []
    rules.append('[data-mf-hidden]{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;clip:rect(0,0,0,0)!important;}')
    
    for word in words:
        escaped = word.replace('"', '\\"')
        for attr in attrs:
            rules.append(f'[{attr}*="{escaped}" i]{{{HIDE}}}')
        for attr in img_attrs:
            rules.append(f'img[{attr}*="{escaped}" i]{{{HIDE}}}')
    
    css_part = '<style id="mf-profanity-css">' + '\n'.join(rules) + '</style>'
    
    # JS-Teil: Escaped JSON-Array der Wörter
    words_json = ','.join(f'"{w.replace(chr(34), "")}"' for w in words if len(w) >= 3)
    
    js_part = f'''<script>
(function(){{
  var W=[{words_json}];
  var RE=new RegExp(W.join("|"),"i");
  var H="display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;";
  var done=new WeakSet();
  function hide(el){{if(!el||done.has(el))return;done.add(el);el.style.cssText+=H;el.setAttribute("data-mf-hidden","1");}}
  function chk(s){{return s&&s.length>=3&&RE.test(s);}}
  function scanEl(el){{
    if(!el||!el.attributes)return false;
    var a=el.attributes;
    for(var i=0;i<a.length;i++){{
      var n=a[i].name;
      if(n==="class"||n==="style"||n==="id")continue;
      if(chk(a[i].value))return true;
    }}
    return false;
  }}
  function scan(){{
    var all=document.querySelectorAll("*");
    for(var i=0;i<all.length;i++){{
      var el=all[i];
      if(done.has(el))continue;
      var tag=el.tagName;
      if(tag==="BODY"||tag==="HTML"||tag==="HEAD"||tag==="SCRIPT"||tag==="STYLE")continue;
      if(!scanEl(el))continue;
      var txt=(el.textContent||"").length;
      if(txt>5000)continue;
      if(tag==="IMG"||el.querySelector("img")||tag==="VIDEO"||tag==="IFRAME"){{
        hide(el);
      }}else{{
        var imgs=el.querySelectorAll("img");
        if(imgs.length>0&&imgs.length<20)hide(el);
      }}
    }}
  }}
  function ready(fn){{if(document.body)fn();else document.addEventListener("DOMContentLoaded",fn);}}
  ready(function(){{
    scan();
    var t=[200,500,1000,2000,3000,5000];
    for(var i=0;i<t.length;i++)setTimeout(scan,t[i]);
    setInterval(scan,1500);
    new MutationObserver(function(){{setTimeout(scan,50);}}).observe(document.documentElement,{{childList:true,subtree:true}});
    window.addEventListener("scroll",function(){{setTimeout(scan,100);}},{{passive:true}});
  }});
}})();
</script>'''
    
    return css_part + js_part

_PROFANITY_CSS = _generate_profanity_css()
print(f"🎨 CSS-Bildfilter generiert: {len(_PROFANITY_CSS)} Bytes")

# Regex um Nonce aus CSP-Header zu extrahieren
_nonce_re = re.compile(r"'nonce-([A-Za-z0-9+/=_-]+)'")

# ⚡ Einmal kompilierte Tag-Patterns
_img_tag_re = re.compile(r'<img\b[^>]*/?>',  re.IGNORECASE)
_a_tag_re = re.compile(r'<a\b[^>]*>.*?</a>', re.IGNORECASE | re.DOTALL)
_video_tag_re = re.compile(r'<video\b[^>]*>.*?</video>', re.IGNORECASE | re.DOTALL)
_picture_tag_re = re.compile(r'<picture\b[^>]*>.*?</picture>', re.IGNORECASE | re.DOTALL)
_iframe_tag_re = re.compile(r'<iframe\b[^>]*>.*?</iframe>', re.IGNORECASE | re.DOTALL)
_attr_val_re = re.compile(r'(?:src|href|alt|title|data-src|srcset|poster|aria-label)\s*=\s*["\']([^"\']*)["\']', re.IGNORECASE)

# ABSOLUTE MAXIMUM Werbe-Domain Blocklist - 150+ Domains!
AD_DOMAINS = [
    # Google Ads & Tracking
    'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
    'google-analytics.com', 'googletagmanager.com', 'googletagservices.com',
    'adservice.google.com', 'pagead2.googlesyndication.com', 'googleads.g.doubleclick.net',
    # Facebook/Meta Tracking
    'facebook.net', 'connect.facebook.net', 'facebook.com/tr', 'fbcdn.net',
    # Tracking & Analytics
    'scorecardresearch.com', 'quantserve.com', 'hotjar.com', 'mouseflow.com',
    'newrelic.com', 'nr-data.net', 'segment.com', 'segment.io', 'mixpanel.com',
    'fullstory.com', 'loggly.com', 'bugsnag.com',
    # Ad Networks
    'adnxs.com', 'advertising.com', 'criteo.com', 'outbrain.com', 'taboola.com',
    'pubmatic.com', 'rubiconproject.com', 'openx.net', 'casalemedia.com',
    'adsafeprotected.com', 'moatads.com', 'serving-sys.com', 'adsrvr.org',
    'adform.net', 'smartadserver.com', 'contextweb.com', 'turn.com',
    # ADITION (NEU - für flashscore!)
    'adition.com', 'adfarm1.adition.com', 'imagesrv.adition.com',
    # LIVESPORT MEDIA (NEU - für flashscore!)
    'livesportmedia.eu', 'advert.livesportmedia.eu', 'content.livesportmedia.eu',
    # BANNERFLOW (NEU!)
    'bannerflow.net', 'c.bannerflow.net',
    # BET365 AFFILIATES (NEU!)
    'bet365affiliates.com', 'imstore.bet365affiliates.com',
    # STREAMING SITE POPUPS & REDIRECTS (CRITICAL!)
    'popcash.net', 'popads.net', 'adcash.com', 'propellerads.com', 'adsterra.com',
    'clickadu.com', 'hilltopads.net', 'exoclick.com', 'trafficjunky.com',
    'juicyads.com', 'ero-advertising.com', 'adxpansion.com', 'plugrush.com',
    'tsyndicate.com', 'adserve.work', 'popunderspace.com', 'adtng.com',
    'adk2x.com', 'bidvertiser.com', 'revcontent.com', 'mgid.com',
    'adskeeper.co.uk', 'adnow.com', 'content-ad.net',
    'popunder.net', 'popmyads.com', 'adcpatrk.com', 'cdn77.org',
    'adspyglass.com', 'adriver.ru', 'advertserve.com', 'adzerk.net',
    # Betting/Casino - ALLE!
    'bet365.com', 'tipico.com', 'bwin.com', 'unibet.com', 'betway.com',
    'williamhill.com', 'ladbrokes.com', 'skybet.com', 'pokerstars.com',
    'bet-at-home.com', 'betsson.com', 'paddypower.com', '888casino.com',
    # Video Ad Networks
    'videoadex.com', 'smartclip.net', 'innovid.com', 'tremormedia.com',
    'spotxchange.com', 'cedexis.com', 'springserve.com',
    # Mehr Popup & Redirect Networks
    'zeroredirect', 'zeroupload', 'streamtape', 'dood', 'upstream.to',
    'shorte.st', 'adf.ly', 'bc.vc', 'linkbucks.com', 'ouo.io',
    # Native Ads
    'sharethrough.com', 'plista.com', 'gravity.com', 'nativo.com',
]

def request(flow: http.HTTPFlow) -> None:
    """Blockiert ALLES - Werbe-Requests auf Netzwerk-Ebene"""
    url = flow.request.pretty_url.lower()
    host = flow.request.host.lower()
    referrer = flow.request.headers.get("referer", "").lower()
    
    # Blockiere Werbe-Domains
    for ad_domain in AD_DOMAINS:
        if ad_domain in url:
            flow.response = http.Response.make(204, b"", {"Content-Type": "text/plain"})
            print(f"🚫 AD BLOCKED: {ad_domain}")
            return
    
    # Blockiere ALLE typischen Werbe-URL-Pfade - ultra aggressiv!
    ad_patterns = [
        '/ads/', '/ad/', '/ad.', '/ad_', '/banner/', '/popup', '/popunder',
        'doubleclick', 'googlesyndication', 'adserver', 'advert', '/sponsor',
        '/track', '/pixel', '/beacon', '/analytics'
    ]
    for pattern in ad_patterns:
        if pattern in url:
            flow.response = http.Response.make(204, b"")
            print(f"🚫 AD PATH BLOCKED: {pattern}")
            return

def response(flow: http.HTTPFlow) -> None:
    """Modifiziert HTML - NUR HTL + MINIMALE Adblocker-CSS"""
    if not (flow.response and "text/html" in flow.response.headers.get("content-type", "")):
        return
        
    try:
        content = flow.response.get_text()
        host = flow.request.host.lower()
        
        # HTL Leonding Modifikationen
        if "htl-leonding.at" in host:
            content = content.replace("TOP NEWS", "SUPER NEWS")
            content = content.replace("Bildungsangebot", "Angebot")
            content = content.replace("Informatik", "Design")
            
            htl_css = """<style>
            body{background:linear-gradient(135deg,#74b9ff,#0984e3)!important}
            .header,header{background:#2d3436!important}
            h1,h2,h3{color:#fff!important;text-shadow:2px 2px 4px rgba(0,0,0,.5)}
            a{color:#00b894!important}
            .container{background:rgba(255,255,255,.9)!important;border-radius:10px}
            </style>"""
            content = content.replace("</head>", htl_css + "</head>")
            print(f"✅ HTL-Leonding modifiziert")
        
        # ORF.at Modifikationen - Österreichische News-Seite!
        elif "orf.at" in host:
            content = content.replace("ORF.at", "🔥 ORF.at 🔥")
            content = content.replace("Nachrichten", "Breaking News")
            
            orf_css = """<style>
            body{background:#f0f0f0!important}
            header,.site-header{background:linear-gradient(90deg,#e74c3c,#c0392b)!important}
            h1,h2,h3{color:#e74c3c!important;font-weight:bold!important}
            a{color:#3498db!important}
            .ticker{background:#2ecc71!important;color:#fff!important;padding:10px!important;
            font-weight:bold!important;border-radius:5px!important}
            </style>"""
            content = content.replace("</head>", orf_css + "</head>")
            print(f"✅ ORF.at modifiziert")
        
        # Nonce aus CSP-Header holen (wird für alle Script-Injektionen gebraucht)
        csp = flow.response.headers.get("content-security-policy", "")
        nonce_match = _nonce_re.search(csp)
        if nonce_match:
            nonce = nonce_match.group(1)
        else:
            nonce = None
            # Kein CSP/Nonce → CSP-Header entfernen damit Scripts laufen
            if "content-security-policy" in flow.response.headers:
                del flow.response.headers["content-security-policy"]
        
        # ⚡ ZUERST: CSS-Regeln + JS-Scanner für Bild-Verstecken injizieren
        if _PROFANITY_CSS:
            inject = _PROFANITY_CSS
            if nonce:
                inject = inject.replace('<script>', f'<script nonce="{nonce}">')
            
            if "</head>" in content:
                content = content.replace("</head>", inject + "</head>", 1)
            elif "<body" in content:
                content = content.replace("<body", inject + "<body", 1)
            else:
                content = inject + content
        
        # ⚡ DANN: BILD- & LINK-FILTER (einzelne Tags verstecken)
        if _combined_attr_pattern:
            hidden_count = 0
            
            def _hide_if_profane(match):
                """Prüft ob ein Tag Schimpfwörter in Attributen hat und versteckt es"""
                nonlocal hidden_count
                tag_html = match.group(0)
                attrs = _attr_val_re.findall(tag_html)
                for attr_val in attrs:
                    if _combined_attr_pattern.search(attr_val):
                        hidden_count += 1
                        return f'<span style="display:none">{tag_html}</span>'
                return tag_html
            
            content = _img_tag_re.sub(_hide_if_profane, content)
            content = _a_tag_re.sub(_hide_if_profane, content)
            content = _video_tag_re.sub(_hide_if_profane, content)
            content = _picture_tag_re.sub(_hide_if_profane, content)
            content = _iframe_tag_re.sub(_hide_if_profane, content)
            
            if hidden_count > 0:
                print(f"🖼️🚫 {hidden_count} Bilder/Links/Media versteckt")
        
        # ⚡ DANN: Text-Ersetzung
        if _combined_text_pattern:
            content = _combined_text_pattern.sub("***", content)
        
        print(f"✅ 🤬 Schimpwort-Blocker aktiviert ({len(PROFANITY_WORDS)} Wörter)")
        
        # MINIMAL ADBLOCKER - nur Google Ads blockieren
        
        # MINIMAL ADBLOCKER - nur Google Ads + Ad-Iframes
        smart_adblocker = r"""<style>
        /* Ad-Network iframes */
        iframe[src*="doubleclick"],iframe[src*="googlesyndication"],
        iframe[src*="googleadservices"],
        /* Google Ads Elemente */
        ins.adsbygoogle,.adsbygoogle,div[id^="google_ads"]
        {display:none!important}
        </style>
        <script>
        (function(){
            'use strict';
            console.log('🎯 SMART ADBLOCKER + ANTI-DETECTION ACTIVE');
            
            // 1. Blockiere window.open
            window.open=function(){console.log('🚫 popup blocked');return null;};
            
            // 2. ANTI-ADBLOCKER BYPASS - täusche dass Ads geladen sind
            // Fake AdSense API
            if(!window.adsbygoogle){
                window.adsbygoogle=[];
                window.adsbygoogle.loaded=true;
                window.adsbygoogle.push=function(){return true;};
            }
            
            // Fake common ad detection variables - SEHR AGGRESSIV!
            window.canRunAds=true;
            window.adsLoaded=true;
            window.isAdBlockActive=false;
            window.adBlockDetected=false;
            window.adBlockEnabled=false;
            window.hasAdblock=false;
            
            // Fake Adblock Detection Functions
            window.checkAdBlock=function(){return false;};
            window.detectAdBlock=function(){return false;};
            window.isAdBlockEnabled=function(){return false;};
            window.adsLoaded=true;
            window.isAdBlockActive=false;
            
            // 3. Blockiere NUR eindeutige Ad-Redirects
            const origSetTimeout=window.setTimeout;
            window.setTimeout=function(fn,delay){
                try{
                    const fnStr=(typeof fn==='function'?fn.toString():fn+'');
                    // NUR blockieren wenn es EINDEUTIG eine Ad ist
                    if(fnStr.match(/popcash|popads|exoclick|adcash|clickadu|window\.open.*popup/i)){
                        console.log('🚫 ad setTimeout blocked');
                        return 999999;
                    }
                }catch(e){}
                return origSetTimeout.apply(this,arguments);
            };
            
            // 4. Blockiere NUR Clicks auf Ad-Domains
            document.addEventListener('click',function(e){
                let el=e.target;
                for(let i=0;i<5&&el&&el!==document;i++){
                    try{
                        const href=(el.href||'').toLowerCase();
                        // NUR blockieren wenn es EINDEUTIG eine Ad-Domain ist
                        if(href.match(/popcash|popads|clickadu|exoclick|adcash|bet365affiliates|adition|adfarm|bannerflow/i)){
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🚫 ad click blocked');
                            return false;
                        }
                    }catch(err){}
                    el=el.parentElement;
                }
            },true);
            
            // 5. AGGRESSIVE Anti-Adblocker Entfernung mit MutationObserver
            const removeAntiAdblock=function(){
                // Suche nach typischen Anti-Adblocker Elementen
                const selectors=[
                    '[class*="adblock"]','[id*="adblock"]','[class*="blocker"]',
                    '[class*="ad-block"]','[id*="ad-block"]','[class*="adblocker"]'
                ];
                selectors.forEach(function(sel){
                    try{
                        document.querySelectorAll(sel).forEach(function(el){
                            const txt=(el.innerText||'').toLowerCase();
                            // Nur entfernen wenn es wirklich eine Warnung ist
                            if(txt.match(/blocker|werbung.*block|deaktivieren|aufgrund.*blocker/i)){
                                el.remove();
                                console.log('🚫 Anti-adblocker removed');
                            }
                        });
                    }catch(e){}
                });
                
                // Entsperre body wenn es geblockt ist
                if(document.body){
                    document.body.style.overflow='auto';
                    document.body.style.position='static';
                }
                if(document.documentElement){
                    document.documentElement.style.overflow='auto';
                }
            };
            
            // Führe mehrmals aus
            if(document.readyState==='loading'){
                document.addEventListener('DOMContentLoaded',removeAntiAdblock);
            }else{
                removeAntiAdblock();
            }
            setTimeout(removeAntiAdblock,100);
            setTimeout(removeAntiAdblock,500);
            setTimeout(removeAntiAdblock,1000);
            setTimeout(removeAntiAdblock,2000);
            setTimeout(removeAntiAdblock,3000);
            
            // CONTINUOUS MutationObserver - entfernt SOFORT neue Anti-Adblocker!
            const antiAdblockObs=new MutationObserver(function(muts){
                muts.forEach(function(mut){
                    mut.addedNodes.forEach(function(node){
                        if(node.nodeType===1){
                            try{
                                const cn=(node.className||'').toString().toLowerCase();
                                const id=(node.id||'').toString().toLowerCase();
                                const txt=(node.innerText||'').toLowerCase();
                                
                                // Entferne wenn es eine Anti-Adblocker Warnung ist
                                if((cn.match(/adblock|blocker/)||id.match(/adblock|blocker/))&&
                                   txt.match(/blocker|werbung.*block|deaktivieren|aufgrund/i)){
                                    node.remove();
                                    console.log('🚫 Dynamic anti-adblocker removed');
                                    // Entsperre body
                                    if(document.body){
                                        document.body.style.overflow='auto';
                                        document.body.style.position='static';
                                    }
                                }
                            }catch(e){}
                        }
                    });
                });
            });
            
            // Starte Observer sobald body existiert
            const startAntiAdblockObs=function(){
                if(document.body){
                    antiAdblockObs.observe(document.body,{childList:true,subtree:true});
                    console.log('✅ Anti-Adblocker Observer active');
                }
            };
            if(document.body)startAntiAdblockObs();
            else document.addEventListener('DOMContentLoaded',startAntiAdblockObs);
            
            console.log('✅ SMART ADBLOCKER + ANTI-DETECTION READY');
        })();
        </script>"""
        
        if "</head>" in content:
            if nonce:
                smart_adblocker = smart_adblocker.replace('<script>', f'<script nonce="{nonce}">')
            content = content.replace("</head>", smart_adblocker + "</head>")
        elif "<body" in content:
            content = content.replace("<body", smart_adblocker + "<body", 1)
        else:
            content = smart_adblocker + content
        
        flow.response.set_text(content)
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
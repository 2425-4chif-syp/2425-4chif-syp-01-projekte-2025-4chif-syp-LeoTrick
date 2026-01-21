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
        
        # 🤬 WELTWEITER SCHIMPWORT-BLOCKER - Datenbank mit 469+ Wörtern!
        if PROFANITY_WORDS:
            for word in PROFANITY_WORDS:
                if len(word) >= 3:  # Nur Wörter mit 3+ Buchstaben (vermeidet False Positives)
                    # Case-insensitive replacement mit Regex - Wort-Grenzen beachten
                    pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
                    content = pattern.sub("***", content)
        
        print(f"✅ 🤬 Schimpwort-Blocker aktiviert ({len(PROFANITY_WORDS)} Wörter)")
        
        # MINIMAL ADBLOCKER - nur Google Ads blockieren
        
        # MINIMAL ADBLOCKER - nur Google Ads + Ad-Iframes
        smart_adblocker = """<style>
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
            content = content.replace("</head>", smart_adblocker + "</head>")
        elif "<body" in content:
            content = content.replace("<body", smart_adblocker + "<body", 1)
        else:
            content = smart_adblocker + content
        
        flow.response.set_text(content)
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
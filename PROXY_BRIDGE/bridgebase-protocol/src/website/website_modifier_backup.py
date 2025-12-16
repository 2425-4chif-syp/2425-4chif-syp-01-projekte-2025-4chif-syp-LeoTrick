from mitmproxy import http
import re

# ULTRA MASSIVE Werbe-Domain Blocklist
AD_DOMAINS = [
    # Google Ads & Tracking
    'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
    'google-analytics.com', 'googletagmanager.com', 'googletagservices.com',
    'adservice.google.com', 'pagead2.googlesyndication.com',
    # Facebook/Meta Tracking
    'facebook.net', 'connect.facebook.net', 'facebook.com/tr',
    # Tracking & Analytics
    'scorecardresearch.com', 'quantserve.com', 'hotjar.com', 'mouseflow.com',
    'newrelic.com', 'nr-data.net', 'segment.com', 'segment.io', 'mixpanel.com',
    # Ad Networks
    'adnxs.com', 'advertising.com', 'criteo.com', 'outbrain.com', 'taboola.com',
    'pubmatic.com', 'rubiconproject.com', 'openx.net', 'casalemedia.com',
    'adsafeprotected.com', 'moatads.com', 'serving-sys.com', 'adsrvr.org',
    # STREAMING SITE POPUPS (WICHTIG!)
    'popcash.net', 'popads.net', 'adcash.com', 'propellerads.com', 'adsterra.com',
    'clickadu.com', 'hilltopads.net', 'exoclick.com', 'trafficjunky.com',
    'juicyads.com', 'ero-advertising.com', 'adxpansion.com', 'plugrush.com',
    'tsyndicate.com', 'adserve.work', 'popunderspace.com', 'adtng.com',
    'adk2x.com', 'bidvertiser.com', 'revcontent.com', 'mgid.com',
    'adskeeper.co.uk', 'adnow.com', 'content-ad.net',
    # Betting/Casino
    'bet365.com', 'tipico.com', 'bwin.com', 'unibet.com', 'betway.com',
    'williamhill.com', 'ladbrokes.com', 'skybet.com', 'pokerstars.com',
    # Mehr Popup-Netzwerke
    'zeroredirect', 'zeroupload', 'streamtape', 'dood', 'upstream.to',
]

def request(flow: http.HTTPFlow) -> None:
    """Blockiert ALLES - Werbe-Requests auf Netzwerk-Ebene"""
    url = flow.request.pretty_url.lower()
    
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
        
        # HTL Leonding Modifikationen
        if "htl-leonding.at" in flow.request.host:
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
        
        # NUCLEAR ADBLOCKER - MAXIMUM AGGRESSION! 🔥🔥🔥
        nuclear_adblocker = """<style>
        /* Google Ads - ALLE Varianten */
        ins.adsbygoogle,.adsbygoogle,iframe[src*="doubleclick"],iframe[src*="googlesyndication"],
        iframe[src*="googleadservices"],div[id^="google_ads"],div[id^="aswift"],div[id*="google_ad"],
        /* Werbe-Container - ULTRA AGGRESSIVE */
        .advertisement,.ad-container,.ad-wrapper,.ad-banner,.ad-slot,.ad-box,.ad-space,
        .ads-container,.ads-wrapper,.ads-banner,#advertisement,#ad-container,#ads,#advert,
        /* Popup/Overlay - ALLES */
        .popup-ad,.popup-overlay,.popup,.modal-ad,.ad-modal,.interstitial,.overlay-ad,
        div[id*="popup"],div[class*="popup"],div[id*="overlay"],div[class*="overlay"],
        /* Alle bekannten Ad-Network iframes */
        iframe[src*="adnxs"],iframe[src*="advertising"],iframe[src*="exoclick"],
        iframe[src*="popcash"],iframe[src*="popads"],iframe[src*="propellerads"],
        iframe[src*="adcash"],iframe[src*="adsterra"],iframe[src*="clickadu"],
        iframe[src*="hilltopads"],iframe[src*="trafficjunky"],iframe[src*="mgid"],
        iframe[src*="revcontent"],iframe[src*="bidvertiser"],iframe[src*="adtng"],
        iframe[src*="outbrain"],iframe[src*="taboola"],iframe[src*="criteo"],
        /* Sponsored & Promo */
        .sponsored,.sponsored-content,.promo-banner,.promo-box,.marketing-banner,
        /* Betting/Casino */
        [class*="bet365"],[class*="tipico"],[class*="bwin"],[class*="casino"],[class*="betting"],
        /* Standard Ad Positions */
        .banner-ad,.sidebar-ad,.header-ad,.footer-ad,.video-ad,.video-ad-container,
        /* Streaming Site Specific */
        .ad-overlay,.overlay-ad,.pre-roll,.post-roll,.ad-break,
        /* Mehr aggressive Selektoren */
        [id*="_ad_"],[class*="_ad_"],[id*="-ad-"],[class*="-ad-"]
        {display:none!important;visibility:hidden!important;opacity:0!important;
        height:0!important;width:0!important;pointer-events:none!important;position:absolute!important;left:-9999px!important}
        body,html{overflow:auto!important}
        </style>
        <script>
        (function(){
            console.log('🔥 NUCLEAR ADBLOCKER ACTIVATED');
            
            // 1. TOTALE Popup-Blockierung
            window.open=function(){console.log('🚫 window.open BLOCKED');return null;};
            
            // 2. Blockiere alert/confirm/prompt (manchmal für Ads genutzt)
            window.alert=function(){console.log('🚫 alert BLOCKED');return true;};
            window.confirm=function(){console.log('🚫 confirm BLOCKED');return false;};
            
            // 3. Blockiere ALLE setTimeout/setInterval mit Redirects
            const origSetTimeout=window.setTimeout,origSetInterval=window.setInterval;
            window.setTimeout=function(fn,delay){
                try{
                    const fnStr=(typeof fn==='function'?fn.toString():fn+'');
                    if(fnStr.match(/window\.location|location\.href|location\.replace|location\.assign|window\.open|\.reload/)){
                        console.log('🚫 setTimeout redirect BLOCKED');
                        return 999999;
                    }
                }catch(e){}
                return origSetTimeout.apply(this,arguments);
            };
            window.setInterval=function(fn,delay){
                try{
                    const fnStr=(typeof fn==='function'?fn.toString():fn+'');
                    if(fnStr.match(/window\.location|location\.href|window\.open|\.reload/)){
                        console.log('🚫 setInterval redirect BLOCKED');
                        return 999999;
                    }
                }catch(e){}
                return origSetInterval.apply(this,arguments);
            };
            
            // 4. Blockiere beforeunload (verhindert "Are you sure you want to leave")
            window.addEventListener('beforeunload',function(e){
                e.preventDefault();
                e.stopImmediatePropagation();
            },true);
            
            // 5. Blockiere ALLE verdächtigen Clicks - ULTRA AGGRESSIVE
            document.addEventListener('click',function(e){
                let el=e.target;
                for(let i=0;i<10&&el&&el!==document;i++){
                    try{
                        const tag=el.tagName||'';
                        const onclick=(el.getAttribute&&el.getAttribute('onclick'))||'';
                        const href=el.href||'';
                        const target=(el.getAttribute&&el.getAttribute('target'))||'';
                        const cn=el.className||'';
                        const id=el.id||'';
                        
                        // Blockiere wenn verdächtig
                        const suspicious=(
                            onclick.match(/window\.open|popup|location\.|redirect/i)||
                            href.match(/bet365|casino|popcash|popads|clickadu|exoclick|adcash|propeller/i)||
                            target==='_blank'&&href.match(/\.(top|xyz|club|click|link|site|online|stream)/)||
                            cn.match(/popup|ad-|overlay/i)||
                            id.match(/popup|ad-|overlay/i)
                        );
                        
                        if(suspicious){
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            console.log('🚫 SUSPICIOUS CLICK BLOCKED',tag,href);
                            return false;
                        }
                    }catch(err){}
                    el=el.parentElement;
                }
            },true);
            
            // 6. Entferne dynamisch eingefügte Ads/Popups - AGGRESSIV
            const obs=new MutationObserver(function(muts){
                muts.forEach(function(mut){
                    mut.addedNodes.forEach(function(node){
                        if(node.nodeType===1){
                            try{
                                const cn=(node.className||'').toString();
                                const id=(node.id||'').toString();
                                const tag=node.tagName||'';
                                
                                // Entferne wenn verdächtig
                                if(cn.match(/popup|interstitial|ad-overlay|ad-modal|overlay-ad/i)||
                                   id.match(/popup|ad-overlay|interstitial/i)||
                                   (tag==='DIV'&&node.style&&node.style.position==='fixed'&&node.style.zIndex>9990)){
                                    node.remove();
                                    console.log('🚫 Dynamic ad removed',tag,cn,id);
                                }
                            }catch(e){}
                        }
                    });
                });
            });
            
            // Observer starten
            const startObs=function(){
                if(document.body){
                    obs.observe(document.body,{childList:true,subtree:true});
                    console.log('✅ MutationObserver active');
                }
            };
            if(document.body)startObs();
            else document.addEventListener('DOMContentLoaded',startObs);
            
            // 7. Blockiere iframe-Erstellung (manchmal für Ads)
            const origCreateElement=document.createElement;
            document.createElement=function(tag){
                const el=origCreateElement.apply(document,arguments);
                if(tag.toLowerCase()==='iframe'){
                    const origSetAttribute=el.setAttribute;
                    el.setAttribute=function(attr,val){
                        if(attr==='src'&&val&&val.match(/doubleclick|googlesyndication|adnxs|exoclick|popcash/)){
                            console.log('🚫 iframe ad BLOCKED',val);
                            return;
                        }
                        return origSetAttribute.apply(this,arguments);
                    };
                }
                return el;
            };
            
            console.log('✅ NUCLEAR ADBLOCKER READY - All systems armed!');
        })();
        </script>"""
        
        if "</head>" in content:
            content = content.replace("</head>", aggressive_adblocker + "</head>")
        elif "<body" in content:
            content = content.replace("<body", aggressive_adblocker + "<body", 1)
        else:
            content = aggressive_adblocker + content
        
        flow.response.set_text(content)
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
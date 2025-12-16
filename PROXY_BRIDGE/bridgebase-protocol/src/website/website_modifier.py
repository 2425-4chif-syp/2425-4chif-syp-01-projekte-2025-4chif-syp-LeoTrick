from mitmproxy import http
import re

# ABSOLUTE MAXIMUM Werbe-Domain Blocklist - 100+ Domains!
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
        
        # ABSOLUTE MAXIMUM ADBLOCKER - NICHTS KOMMT DURCH! 🔥💀🔥
        nuclear_adblocker = """<style>
        /* Google Ads - KOMPLETT */
        ins.adsbygoogle,.adsbygoogle,iframe[src*="doubleclick"],iframe[src*="googlesyndication"],
        iframe[src*="googleadservices"],div[id^="google_ads"],div[id^="aswift"],div[id*="google_ad"],
        script[src*="googlesyndication"],script[src*="doubleclick"],
        /* Werbe-Container - ULTRA MEGA AGGRESSIVE */
        .advertisement,.ad-container,.ad-wrapper,.ad-banner,.ad-slot,.ad-box,.ad-space,.ad-unit,
        .ads-container,.ads-wrapper,.ads-banner,#advertisement,#ad-container,#ads,#advert,
        .adsbyvli,.ads-box,.adsbox,[id^="ad-"],[id^="ads-"],[class^="ad-"],[class^="ads-"],
        /* Popup/Overlay - ALLES ALLES ALLES */
        .popup,.popup-ad,.popup-overlay,.popup-container,.modal-ad,.ad-modal,
        .interstitial,.overlay-ad,.modal-overlay,[id*="popup"],[class*="popup"],
        [id*="overlay"],[class*="overlay"],[id*="modal"],[class*="modal"],
        /* ALLE bekannten Ad-Network iframes + scripts */
        iframe[src*="adnxs"],iframe[src*="advertising"],iframe[src*="exoclick"],
        iframe[src*="popcash"],iframe[src*="popads"],iframe[src*="propellerads"],
        iframe[src*="adcash"],iframe[src*="adsterra"],iframe[src*="clickadu"],
        iframe[src*="hilltopads"],iframe[src*="trafficjunky"],iframe[src*="mgid"],
        iframe[src*="revcontent"],iframe[src*="bidvertiser"],iframe[src*="adtng"],
        iframe[src*="outbrain"],iframe[src*="taboola"],iframe[src*="criteo"],
        iframe[src*="adform"],iframe[src*="smartadserver"],iframe[src*="spotx"],
        script[src*="popcash"],script[src*="popads"],script[src*="exoclick"],
        script[src*="adcash"],script[src*="propellerads"],script[src*="adsterra"],
        /* Sponsored & Promo */
        .sponsored,.sponsored-content,.promo-banner,.promo-box,.marketing-banner,.promotion,
        /* Betting/Casino */
        [class*="bet365"],[class*="tipico"],[class*="bwin"],[class*="casino"],[class*="betting"],
        [href*="bet365"],[href*="casino"],[href*="betting"],
        /* Standard Ad Positions */
        .banner-ad,.sidebar-ad,.header-ad,.footer-ad,.video-ad,.video-ad-container,
        .top-ad,.bottom-ad,.left-ad,.right-ad,
        /* Streaming Site Specific */
        .ad-overlay,.overlay-ad,.pre-roll,.post-roll,.ad-break,.ad-label,
        /* MEGA AGGRESSIVE - alle mit ad/ads im Namen */
        [id*="_ad_"],[class*="_ad_"],[id*="-ad-"],[class*="-ad-"],
        [id*="_ads_"],[class*="_ads_"],[id*="-ads-"],[class*="-ads-"],
        [id$="_ad"],[class$="_ad"],[id$="-ad"],[class$="-ad"]
        {display:none!important;visibility:hidden!important;opacity:0!important;
        height:0!important;width:0!important;max-height:0!important;max-width:0!important;
        pointer-events:none!important;position:absolute!important;left:-9999px!important;top:-9999px!important;
        z-index:-1!important;overflow:hidden!important}
        body,html{overflow:auto!important;position:static!important}
        body *{pointer-events:auto!important}
        </style>
        <script>
        (function(){
            'use strict';
            console.log('🔥💀 ABSOLUTE MAXIMUM ADBLOCKER ACTIVATED 💀🔥');
            
            // 1. TOTALE Popup-Blockierung - ALLE Varianten
            window.open=function(){console.log('🚫 window.open KILLED');return null;};
            Object.defineProperty(window,'open',{value:function(){console.log('🚫 window.open KILLED');return null;},writable:false,configurable:false});
            
            // 2. Blockiere alert/confirm/prompt
            window.alert=function(){console.log('🚫 alert KILLED');return true;};
            window.confirm=function(){console.log('🚫 confirm KILLED');return false;};
            window.prompt=function(){console.log('🚫 prompt KILLED');return null;};
            
            // 3. Blockiere ALLE setTimeout/setInterval mit Redirects/Popups
            const origSetTimeout=window.setTimeout,origSetInterval=window.setInterval,origRequestAnimationFrame=window.requestAnimationFrame;
            window.setTimeout=function(fn,delay){
                try{
                    const fnStr=(typeof fn==='function'?fn.toString():fn+'');
                    if(fnStr.match(/window\.location|location\.(href|replace|assign|reload)|window\.open|\.click\(\)|popup|redirect/i)){
                        console.log('🚫 setTimeout BLOCKED:',fnStr.substring(0,100));
                        return 999999;
                    }
                }catch(e){}
                return origSetTimeout.apply(this,arguments);
            };
            window.setInterval=function(fn,delay){
                try{
                    const fnStr=(typeof fn==='function'?fn.toString():fn+'');
                    if(fnStr.match(/window\.location|location\.(href|replace|assign)|window\.open|popup/i)){
                        console.log('🚫 setInterval BLOCKED');
                        return 999999;
                    }
                }catch(e){}
                return origSetInterval.apply(this,arguments);
            };
            window.requestAnimationFrame=function(fn){
                try{
                    const fnStr=(typeof fn==='function'?fn.toString():fn+'');
                    if(fnStr.match(/window\.open|popup/i)){
                        console.log('🚫 requestAnimationFrame BLOCKED');
                        return 999999;
                    }
                }catch(e){}
                return origRequestAnimationFrame.apply(this,arguments);
            };
            
            // 4. Blockiere beforeunload/unload Events
            window.addEventListener('beforeunload',function(e){e.preventDefault();e.stopImmediatePropagation();},true);
            window.addEventListener('unload',function(e){e.preventDefault();e.stopImmediatePropagation();},true);
            
            // 5. MEGA AGGRESSIVE Click-Blocking
            document.addEventListener('click',function(e){
                let el=e.target;
                for(let i=0;i<15&&el&&el!==document;i++){
                    try{
                        const tag=(el.tagName||'').toLowerCase();
                        const onclick=(el.getAttribute&&el.getAttribute('onclick'))||'';
                        const href=(el.href||'').toLowerCase();
                        const target=(el.getAttribute&&el.getAttribute('target'))||'';
                        const cn=(el.className||'').toString().toLowerCase();
                        const id=(el.id||'').toString().toLowerCase();
                        
                        // MEGA AGGRESSIVE - blockiere fast alles verdächtige
                        const suspicious=(
                            onclick.match(/window\.open|popup|location\.|redirect|\.click\(\)/i)||
                            href.match(/bet365|casino|popcash|popads|clickadu|exoclick|adcash|propeller|adsterra|hilltop|mgid|outbrain|taboola/i)||
                            href.match(/\.(top|xyz|club|click|link|site|online|stream|info|icu|pw|tk|ml|ga|cf|gq)($|\/)/i)||
                            target==='_blank'&&(href.includes('ad')||href.includes('redirect')||href.includes('track'))||
                            cn.match(/popup|ad-|overlay|-ad|_ad|^ad[^a-z]|sponsor|promo/)||
                            id.match(/popup|ad-|overlay|-ad|_ad|^ad[^a-z]/)
                        );
                        
                        if(suspicious){
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            console.log('🚫 CLICK KILLED:',tag,href.substring(0,50));
                            return false;
                        }
                    }catch(err){}
                    el=el.parentElement;
                }
            },true);
            
            // 6. Blockiere mousedown/mouseup für Ad-Tricks
            ['mousedown','mouseup','touchstart','touchend'].forEach(function(evt){
                document.addEventListener(evt,function(e){
                    const el=e.target;
                    if(el&&el.className&&el.className.toString().match(/popup|ad-overlay|interstitial/i)){
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        console.log('🚫',evt,'on ad element BLOCKED');
                        return false;
                    }
                },true);
            });
            
            // 7. ULTRA AGGRESSIVE MutationObserver - entfernt ALLES verdächtige
            const obs=new MutationObserver(function(muts){
                muts.forEach(function(mut){
                    mut.addedNodes.forEach(function(node){
                        if(node.nodeType===1){
                            try{
                                const cn=(node.className||'').toString().toLowerCase();
                                const id=(node.id||'').toString().toLowerCase();
                                const tag=(node.tagName||'').toLowerCase();
                                const style=node.style||{};
                                
                                // Entferne wenn IRGENDWAS verdächtig ist
                                const remove=(
                                    cn.match(/popup|interstitial|ad-overlay|ad-modal|overlay-ad|modal-ad|_ad_|-ad-|^ad[^a-z]/)||
                                    id.match(/popup|ad-overlay|interstitial|modal-ad|_ad_|-ad-|^ad[^a-z]/)||
                                    (tag==='div'&&style.position==='fixed'&&parseInt(style.zIndex)>9000)||
                                    (tag==='iframe'&&node.src&&node.src.match(/popcash|popads|exoclick|adcash|propeller|adsterra/i))
                                );
                                
                                if(remove){
                                    node.remove();
                                    console.log('🚫 REMOVED:',tag,cn||id);
                                }
                            }catch(e){}
                        }
                    });
                });
            });
            
            const startObs=function(){
                if(document.body){
                    obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','id','style']});
                    console.log('✅ MEGA MutationObserver active');
                }
            };
            if(document.body)startObs();
            else document.addEventListener('DOMContentLoaded',startObs);
            
            // 8. Blockiere iframe/script-Erstellung mit Ad-Domains
            const origCreateElement=document.createElement;
            document.createElement=function(tag){
                const el=origCreateElement.apply(document,arguments);
                const t=tag.toLowerCase();
                if(t==='iframe'||t==='script'){
                    const origSetAttribute=el.setAttribute;
                    el.setAttribute=function(attr,val){
                        if(attr==='src'&&val&&val.match(/doubleclick|googlesyndication|adnxs|exoclick|popcash|popads|adcash|propeller|mgid|outbrain|taboola/i)){
                            console.log('🚫',t,'CREATION BLOCKED:',val);
                            return;
                        }
                        return origSetAttribute.apply(this,arguments);
                    };
                }
                return el;
            };
            
            // 9. Blockiere focus() auf hidden elements (Ad-Trick)
            const origFocus=HTMLElement.prototype.focus;
            HTMLElement.prototype.focus=function(){
                if(this.offsetParent===null||this.style.display==='none'){
                    console.log('🚫 focus() on hidden element BLOCKED');
                    return;
                }
                return origFocus.apply(this,arguments);
            };
            
            console.log('✅💀 ABSOLUTE MAXIMUM ADBLOCKER ARMED - Nothing gets through! 💀✅');
        })();
        </script>"""
        
        if "</head>" in content:
            content = content.replace("</head>", nuclear_adblocker + "</head>")
        elif "<body" in content:
            content = content.replace("<body", nuclear_adblocker + "<body", 1)
        else:
            content = nuclear_adblocker + content
        
        flow.response.set_text(content)
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
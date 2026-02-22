# 🚀 LeoTrick Proxy – Ein-Klick Starter

**User öffnet EXE → Proxy läuft, Firefox konfiguriert, fertig.**

---

## Was passiert automatisch?

| Schritt | Was wird gemacht |
|---|---|
| 1️⃣ | mitmproxy wird installiert (falls nicht vorhanden) |
| 2️⃣ | mitmproxy CA-Zertifikat wird erzeugt |
| 3️⃣ | Zertifikat in **Windows-Zertifikatspeicher** installiert |
| 4️⃣ | **Firefox-Proxy** automatisch auf `localhost:8081` gesetzt |
| 5️⃣ | Ad-Blocker + Schimpfwort-Filter + Website-Modifier startet |
| 6️⃣ | Beim Beenden (Strg+C): Firefox-Einstellungen werden zurückgesetzt |

---

## Option A – Standalone EXE (empfohlen für Chef/andere PCs)

### Schritt 1: EXE bauen (einmalig, auf einem Windows-PC mit Python)

```
1. Diesen Ordner auf den Windows-PC kopieren
2. Rechtsklick auf  build_windows.bat  → "Als Administrator ausführen"
3. Warten (~2-5 Minuten)
4. Fertig: dist\LeoTrickProxy.exe  ←  DAS ist die Datei zum Verteilen
```

### Schritt 2: EXE verteilen

- `dist\LeoTrickProxy.exe` auf den Ziel-PC kopieren (USB, Teams, E-Mail …)
- Kein Python, kein mitmproxy, keine weitere Installation nötig
- Einfach Doppelklick → **Als Administrator ausführen**

> ⚠️ Windows SmartScreen warnt eventuell weil die EXE kein Zertifikat hat.  
> Klick auf "Weitere Informationen" → "Trotzdem ausführen"

---

## Option B – Direkt starten (Python muss vorhanden sein)

Wenn Python auf dem Ziel-PC bereits installiert ist, genügt:

```
start_windows.bat  →  Rechtsklick → "Als Administrator ausführen"
```

Das Script installiert mitmproxy automatisch (einmalig) und startet dann den Launcher.

---

## Nach dem Start

1. **Firefox neu starten** (Proxy-Einstellungen werden erst beim Neustart aktiv)
2. Eine beliebige Website aufrufen → Ads werden geblockt
3. `htl-leonding.at` oder `orf.at` besuchen → Website-Modifier aktiv

### Falls HTTPS-Seiten nicht funktionieren

Beim allerersten Start auf einem neuen PC:
1. Firefox öffnen
2. **http://mitm.it** aufrufen
3. "Windows" auswählen und das Zertifikat herunterladen
4. Doppelklick auf die `.pem` Datei → Zertifikat installieren → "Vertrauenswürdige Stammzertifizierungsstellen"

Danach läuft auch HTTPS automatisch.

---

## Proxy beenden

`Strg+C` im Konsolenfenster drücken → Firefox-Einstellungen werden automatisch zurückgesetzt.

---

## Projektstruktur

```
PROXY_BRIDGE/launcher/
├── launcher.py          ← Haupt-Launcher (Python)
├── build_windows.bat    ← EXE bauen (Windows + Python nötig)
├── start_windows.bat    ← Direkt starten ohne EXE-Build
└── README.md            ← Diese Datei

PROXY_BRIDGE/bridgebase-protocol/src/website/
├── website_modifier.py  ← Wird in die EXE eingebettet
├── profanity_de.txt     ← Wird in die EXE eingebettet
└── profanity_en.txt     ← Wird in die EXE eingebettet
```

---

## Technische Details

| Parameter | Wert |
|---|---|
| Proxy-Port | `8081` |
| Proxy-Host | `127.0.0.1` |
| Firefox-Konfig | `%APPDATA%\Mozilla\Firefox\Profiles\*\user.js` |
| Zertifikat | `%USERPROFILE%\.mitmproxy\mitmproxy-ca-cert.pem` |
| Windows-Zertifikatspeicher | `certutil -addstore Root` |

---

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| "Windows SmartScreen blockiert" | "Weitere Informationen" → "Trotzdem ausführen" |
| HTTPS-Seiten laden nicht | http://mitm.it im Firefox aufrufen, Zertifikat installieren |
| Firefox zeigt noch kein Proxy | Firefox neu starten! |
| "Als Administrator ausführen" vergessen | EXE schließen, Rechtsklick → "Als Administrator ausführen" |
| pip install schlägt fehl | Netzwerk prüfen, ev. Proxy/Firewall im Unternehmen |

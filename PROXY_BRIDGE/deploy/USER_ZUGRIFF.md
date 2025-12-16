# 🌐 Zugriff für andere User einrichten

## 🎯 Aktuelle Situation

Dein Proxy läuft auf LeoCloud mit **NodePort 31420**.

---

## ✅ Option 1: NodePort (Sofort verfügbar!)

**Jeder User kann deinen Proxy JETZT nutzen!**

### Was User brauchen:

1. **Firefox Proxy konfigurieren:**
   - Settings → Network Settings → Manual proxy
   - HTTP Proxy: **`<htl-cluster-ip>`**
   - Port: **`31420`**
   - ✅ Also use this proxy for HTTPS

2. **Zertifikat installieren** (für HTTPS):
   - Download: [mitmproxy-ca-cert.pem](https://he200101.cloud.htl-leonding.ac.at/cert) (falls verfügbar)
   - Firefox → Settings → Certificates → Import

### Cluster-IP herausfinden:

Frag deinen Lehrer nach der **externen IP** oder **Domain** des Clusters.

Mögliche IPs:
- `193.170.119.XXX` (HTL Leonding IP-Range)
- `10.0.0.XXX` (Internes Netzwerk)
- Domain: `cluster.htl-leonding.ac.at`

---

## 🚀 Option 2: Ingress mit Domain (Besser!)

### Schritt 1: Ingress deployen

```bash
export KUBECONFIG=~/leocloud-kubeconfig.yaml
kubectl apply -f ingress.yaml
```

### Schritt 2: Ingress-IP prüfen

```bash
kubectl get ingress -n student-he200101
```

### Dann ist der Proxy erreichbar unter:
```
http://he200101.cloud.htl-leonding.ac.at:8081
```

**User konfigurieren:**
- HTTP Proxy: `he200101.cloud.htl-leonding.ac.at`
- Port: `8081`

---

## 🔐 Option 3: Public URL mit ngrok (Für Tests)

Falls du außerhalb der Schule testen willst:

### Schritt 1: Port-Forward starten
```bash
export KUBECONFIG=~/leocloud-kubeconfig.yaml
kubectl port-forward -n student-he200101 service/mitm-proxy-service 8081:8081
```

### Schritt 2: ngrok starten
```bash
ngrok tcp 8081
```

Gibt dir eine öffentliche URL wie: `tcp://0.tcp.ngrok.io:12345`

**User nutzen dann:**
- HTTP Proxy: `0.tcp.ngrok.io`
- Port: `12345`

---

## 📋 Einfachste Anleitung für User

### Für User in der HTL (gleiches Netzwerk):

**1. Firefox öffnen**

**2. Settings → Network Settings**

**3. Manual proxy configuration:**
```
HTTP Proxy: <htl-cluster-ip>
Port: 31420
☑ Also use this proxy for HTTPS
```

**4. Zertifikat installieren** (für HTTPS):
- Download von dir: `mitmproxy-ca-cert.pem`
- Firefox → Certificates → Import
- ✅ Trust this CA to identify websites

**5. Fertig!** → htl-leonding.at öffnen

---

## 🎓 Was du dem User geben musst:

### 1. Proxy-Adresse
```
<htl-cluster-ip>:31420
```

### 2. Zertifikat-Datei

Hole das Zertifikat vom Pod:
```bash
export KUBECONFIG=~/leocloud-kubeconfig.yaml
kubectl cp student-he200101/mitm-proxy-74dffbb55f-6vwkg:/home/mitmproxy/.mitmproxy/mitmproxy-ca-cert.pem ~/mitmproxy-ca-cert.pem
```

Dann gib diese Datei dem User!

### 3. Kurze Anleitung

```
1. Firefox → Settings → Network Settings
2. Manual proxy: <IP>:31420
3. Zertifikat importieren: mitmproxy-ca-cert.pem
4. htl-leonding.at besuchen
```

---

## 🔍 Cluster-IP herausfinden

**Methode 1: Lehrer fragen**
- "Wie lautet die externe IP des LeoCloud Clusters?"

**Methode 2: kubectl (falls du Rechte hast)**
```bash
kubectl get nodes -o wide
# EXTERNAL-IP Spalte
```

**Methode 3: Service-Details**
```bash
kubectl get service mitm-proxy-service -n student-he200101 -o yaml
```

Suche nach:
- `externalIPs`
- `loadBalancerIP`
- `nodePort: 31420` → Nutze Node-IP + 31420

---

## 💡 Tipps

### Für HTL-Interne User:
- Nutze NodePort `31420`
- Funktioniert sofort, keine extra Konfiguration!

### Für Externe User:
- Ingress mit Domain
- Oder ngrok für temporären Zugriff

### Zertifikat-Download automatisieren:

Erstelle eine kleine Webseite auf der LeoCloud, die das Zertifikat bereitstellt:

```yaml
# Simple Nginx mit Cert-Download
apiVersion: v1
kind: ConfigMap
metadata:
  name: cert-html
data:
  index.html: |
    <html>
    <h1>MITM Proxy Zertifikat</h1>
    <a href="/mitmproxy-ca-cert.pem" download>Download</a>
    </html>
```

---

## 🆘 Troubleshooting für User

### "Proxy refuses connections"
→ Firewall/Port blockiert. Nutze HTL-Netzwerk.

### "Certificate error"
→ Zertifikat nicht installiert. Siehe Schritt 4.

### "Website lädt nicht"
→ Proxy-Settings falsch. IP/Port nochmal prüfen.

---

## ✨ Schnell-Setup für Lehrer/Mitschüler

```bash
# 1. Cluster-IP erfragen
# 2. Firefox konfigurieren:
#    - Proxy: <cluster-ip>:31420
#    - Cert importieren
# 3. htl-leonding.at öffnen
# 4. Sehen: "SUPER NEWS" statt "TOP NEWS"!
```

---

**Wichtig:** Frag deinen Lehrer nach der **Cluster-IP** oder **Domain**!
Dann können alle im HTL-Netzwerk deinen Proxy nutzen. 🚀

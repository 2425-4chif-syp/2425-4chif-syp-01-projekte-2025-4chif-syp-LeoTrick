# 📊 Beweis: MITM Proxy läuft auf LeoCloud

**Schüler:** Luka Ignjatovic (he200101)  
**Datum:** 16. Dezember 2025  
**Projekt:** MITM Proxy mit Website-Modifier

---

## ✅ 1. Live-Demo beim Lehrer

### Option A: Kubectl-Befehle zeigen

```bash
# Kubeconfig setzen
export KUBECONFIG=~/leocloud-kubeconfig.yaml

# 1. Pod-Status zeigen (läuft seit 12 Tagen!)
kubectl get pods -n student-he200101

# 2. Service zeigen
kubectl get service -n student-he200101

# 3. Deployment-Details
kubectl describe deployment mitm-proxy -n student-he200101

# 4. Live-Logs zeigen
kubectl logs -f -n student-he200101 deployment/mitm-proxy

# 5. ConfigMap mit dem Script zeigen
kubectl get configmap proxy-script -n student-he200101 -o yaml
```

### Option B: Port-Forward + Browser-Demo

1. **Terminal 1 - Port-Forward starten:**
```bash
export KUBECONFIG=~/leocloud-kubeconfig.yaml
kubectl port-forward -n student-he200101 service/mitm-proxy-service 8081:8081
```

2. **Firefox konfigurieren:**
   - Settings → Network → Manual Proxy
   - HTTP Proxy: `localhost`, Port: `8081`

3. **htl-leonding.at öffnen** → Zeigt modifizierte Website!

---

## 📸 2. Screenshots machen

### Screenshot 1: Pod läuft
```bash
kubectl get pods -n student-he200101 -o wide
```
**Zeigt:** Pod läuft seit 12 Tagen, Status "Running"

### Screenshot 2: Deployment
```bash
kubectl describe deployment mitm-proxy -n student-he200101
```
**Zeigt:** Image, ConfigMap, Namespace = student-he200101

### Screenshot 3: ConfigMap mit Script
```bash
kubectl get configmap proxy-script -n student-he200101 -o yaml | head -50
```
**Zeigt:** Dein `website_modifier.py` Script ist deployed

### Screenshot 4: Live-Logs
```bash
kubectl logs -n student-he200101 deployment/mitm-proxy --tail=20
```
**Zeigt:** Aktive Proxy-Verbindungen zu htl-leonding.at

### Screenshot 5: Browser mit modifizierter Website
- Firefox mit Proxy
- htl-leonding.at öffnen
- "TOP NEWS" wurde zu "SUPER NEWS"
- Blaues CSS-Design sichtbar

---

## 🎯 3. Wichtigste Beweis-Punkte

### ✅ Namespace: `student-he200101`
- Das ist DEIN LeoCloud-Account
- Niemand anderes hat Zugriff darauf
- Beweist: Es läuft auf LeoCloud!

### ✅ Pod läuft seit 12 Tagen
- Deployment-Datum: ~3. Dezember 2025
- Status: Running, 0 Restarts
- Beweist: Stabiles Deployment!

### ✅ ConfigMap enthält dein Script
- `website_modifier.py` ist im Cluster gespeichert
- Ersetzt "TOP NEWS" → "SUPER NEWS"
- CSS-Injection für blaues Design
- Beweist: Dein Code läuft wirklich!

### ✅ Service auf Port 31420
- Kubernetes-interner Port: 8081
- NodePort: 31420
- Beweist: Service ist exposed!

---

## 🔥 4. Die beste Demo (Live!)

**Was du dem Lehrer zeigst:**

1. **"Ich zeige Ihnen, dass mein Pod läuft..."**
   ```bash
   kubectl get pods -n student-he200101
   ```
   → Zeigt: `mitm-proxy-74dffbb55f-6vwkg   1/1   Running   0   12d`

2. **"Hier ist mein deployed Script..."**
   ```bash
   kubectl get configmap proxy-script -n student-he200101 -o yaml | grep -A 10 "TOP NEWS"
   ```
   → Zeigt: Dein Code im Cluster!

3. **"Jetzt starte ich Port-Forward..."**
   ```bash
   kubectl port-forward -n student-he200101 service/mitm-proxy-service 8081:8081
   ```
   → Terminal zeigt: `Forwarding from [::1]:8081 -> 8081`

4. **"Und hier sehen Sie die modifizierte Website!"**
   - Browser öffnen: htl-leonding.at
   - "TOP NEWS" ist jetzt "SUPER NEWS"
   - Blauer Hintergrund sichtbar

5. **"In den Logs sieht man die Verbindungen..."**
   ```bash
   kubectl logs -f -n student-he200101 deployment/mitm-proxy
   ```
   → Zeigt: `✅ TOP NEWS → SUPER NEWS in: https://www.htl-leonding.at/`

---

## 💻 5. Einfacher One-Liner für Demo

Kopiere das und führe es beim Lehrer aus:

```bash
export KUBECONFIG=~/leocloud-kubeconfig.yaml && \
echo "=== BEWEIS ===" && \
echo "Pod-Status:" && kubectl get pods -n student-he200101 && \
echo "" && echo "Service:" && kubectl get svc -n student-he200101 && \
echo "" && echo "Script im Cluster:" && kubectl get configmap proxy-script -n student-he200101 -o jsonpath='{.data.website_modifier\.py}' | head -20
```

---

## 📋 6. Checkliste für die Demo

- [ ] Laptop mit Kubeconfig bereit
- [ ] Terminal geöffnet
- [ ] Firefox mit mitmproxy-Zertifikat installiert
- [ ] KUBECONFIG exportiert
- [ ] kubectl Befehle getestet
- [ ] Port-Forward funktioniert
- [ ] htl-leonding.at im Browser testen

---

## 🎓 7. Alternative: Ingress/Domain

Falls LeoCloud einen Ingress hat, könnte der Proxy auch direkt über eine URL erreichbar sein:

```
https://he200101.cloud.htl-leonding.ac.at
```

**Frag deinen Lehrer:**
- Gibt es einen Ingress-Controller?
- Kann ich eine Domain für meinen Service bekommen?

---

## 🔍 Zusätzliche Beweise

### Kubeconfig zeigen
```bash
cat ~/leocloud-kubeconfig.yaml | grep -A 5 "name: he200101"
```
**Zeigt:** Dein User-Account im Cluster

### Namespace-Details
```bash
kubectl describe namespace student-he200101
```
**Zeigt:** Dein dedizierter Namespace

### Resource Usage
```bash
kubectl top pod -n student-he200101
```
**Zeigt:** CPU/Memory-Nutzung deines Pods

---

## ✨ Zusammenfassung

**3 stärkste Beweise:**

1. **Pod läuft in `student-he200101`** → Das ist eindeutig dein LeoCloud-Account
2. **ConfigMap mit deinem Code** → Dein Script ist deployed
3. **Live-Demo mit Port-Forward** → Website wird tatsächlich modifiziert

**Empfehlung:** Mach eine Live-Demo mit kubectl + Browser!

---

**Viel Erfolg bei der Präsentation! 🚀**

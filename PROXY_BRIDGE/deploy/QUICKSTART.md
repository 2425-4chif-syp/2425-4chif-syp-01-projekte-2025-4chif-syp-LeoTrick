# 🚀 LeoCloud Quick Start für Luka (he200101)

Super einfache Anleitung für dein LeoCloud Deployment!

## 🎯 Alles in einem Befehl

```bash
cd PROXY_BRIDGE/deploy
chmod +x start-leocloud.sh
./start-leocloud.sh
```

**Das macht das Script automatisch:**
1. ✅ Dashboard installieren
2. ✅ Bearer Token erstellen
3. ✅ Port-Forward starten
4. ✅ Browser öffnen
5. ✅ Token anzeigen zum Copy-Paste

---

## 📋 Was du machen musst:

### Schritt 1: Script starten
```bash
./start-leocloud.sh
```

### Schritt 2: Im Browser
- Dashboard öffnet sich automatisch
- **Token einfügen** (steht im Terminal)
- Im Dashboard: **Kubeconfig downloaden**
- Speichern als: `~/leocloud-kubeconfig.yaml`

### Schritt 3: Proxy deployen
```bash
export KUBECONFIG=~/leocloud-kubeconfig.yaml
./deploy-k8s.sh
```

**FERTIG!** 🎉

---

## 📊 Deine LeoCloud Info

- **Username:** `he200101`
- **Email:** `l.ignjatovic@students.htl-leonding.ac.at`
- **Namespace:** `student-he200101`
- **URL:** `https://he200101.cloud.htl-leonding.ac.at`

---

## 🔍 Nützliche Befehle

```bash
# Token erstellen (falls nötig)
kubectl create token he200101

# Dashboard manuell starten
leocloud get template dashboard | kubectl apply -f -
kubectl port-forward svc/dashboard 8000:8000

# Dashboard löschen
leocloud get template dashboard | kubectl delete -f -

# Proxy Status
kubectl get all -n student-he200101

# Logs ansehen
kubectl logs -f -n student-he200101 deployment/mitm-proxy

# Port-Forward für Proxy (falls kein LoadBalancer)
kubectl port-forward -n student-he200101 service/mitm-proxy-service 8081:8081
```

---

## 🎁 Was alles angepasst wurde

Ich habe **alles** für deinen LeoCloud-Account konfiguriert:

✅ `kubernetes-deployment.yaml` → Nutzt `student-he200101` namespace  
✅ `deploy-k8s.sh` → Angepasst für LeoCloud  
✅ `start-leocloud.sh` → Automatisches Setup  

---

## 🆘 Troubleshooting

### Problem: "leocloud: command not found"
```bash
# Installiere leocloud CLI
# Frag deinen Lehrer nach der Installation
```

### Problem: "kubectl: command not found"
```bash
brew install kubectl
```

### Problem: Token nicht akzeptiert
```bash
# Neuen Token erstellen
kubectl create token he200101
```

### Problem: Port-Forward bricht ab
```bash
# Neu starten
kubectl port-forward svc/dashboard 8000:8000
```

---

## 🎓 Alternative: Manuelle Schritte

Falls das Script nicht funktioniert:

```bash
# 1. Dashboard
leocloud get template dashboard | kubectl apply -f -

# 2. Token
kubectl create token he200101

# 3. Port-Forward
kubectl port-forward svc/dashboard 8000:8000

# 4. Browser
open "http://localhost:8000/#/workloads?namespace=student-he200101"

# 5. Token eingeben und kubeconfig downloaden

# 6. Cleanup
leocloud get template dashboard | kubectl delete -f -
```

---

**Los geht's! 🚀**

```bash
./start-leocloud.sh
```

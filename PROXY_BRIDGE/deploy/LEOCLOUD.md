# 🌐 LeoCloud Deployment Guide

Spezielle Anleitung für das Deployment auf **LeoCloud** (HTL Leonding Kubernetes Cluster).

## 🎯 Was ist LeoCloud?

LeoCloud ist wahrscheinlich ein **Kubernetes-Cluster** von der HTL Leonding. Je nachdem, wie es aufgesetzt ist, gibt es verschiedene Möglichkeiten:

### Option 1: Kubernetes Cluster ✅ (Wahrscheinlich)
→ Nutze `kubernetes-deployment.yaml` + `deploy-k8s.sh`

### Option 2: Normaler VM/Server
→ Nutze `deploy.sh` (klassisches Deployment)

---

## 🚀 Deployment auf Kubernetes/LeoCloud

### Voraussetzungen

1. **kubectl installiert**
   ```bash
   brew install kubectl
   ```

2. **Kubeconfig von deinem Lehrer**
   - Datei: z.B. `leocloud-kubeconfig.yaml`
   - Diese Datei brauchst du, um dich mit dem Cluster zu verbinden

3. **Kubeconfig konfigurieren**
   ```bash
   # Temporär (nur für diese Session)
   export KUBECONFIG=/path/to/leocloud-kubeconfig.yaml
   
   # Oder dauerhaft in ~/.kube/config kopieren
   mkdir -p ~/.kube
   cp /path/to/leocloud-kubeconfig.yaml ~/.kube/config
   ```

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Cluster-Verbindung testen

```bash
kubectl cluster-info
kubectl get nodes
```

Wenn das funktioniert → alles gut! 🎉

### Schritt 2: Proxy deployen

```bash
cd PROXY_BRIDGE/deploy
chmod +x deploy-k8s.sh
./deploy-k8s.sh
```

Das Script macht automatisch:
- ✅ Namespace `mitm-proxy` erstellen
- ✅ Deployment mit mitmproxy erstellen
- ✅ Service (LoadBalancer) erstellen
- ✅ ConfigMap mit deinem Python-Script

### Schritt 3: IP-Adresse herausfinden

```bash
kubectl get service mitm-proxy-service -n mitm-proxy
```

Output:
```
NAME                  TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)
mitm-proxy-service    LoadBalancer   10.43.123.45    192.168.1.100   8081:30123/TCP
```

Die **EXTERNAL-IP** ist wichtig! Das ist deine Proxy-Adresse.

### Schritt 4: Firefox konfigurieren

1. **Settings** → **Network Settings**
2. **Manual proxy configuration**
3. HTTP Proxy: `EXTERNAL-IP` (z.B. `192.168.1.100`)
4. Port: `8081`
5. ✅ **Also use this proxy for HTTPS**

---

## 🔍 Wichtige kubectl Befehle

### Status checken
```bash
# Alle Pods
kubectl get pods -n mitm-proxy

# Pod-Details
kubectl describe pod <pod-name> -n mitm-proxy

# Service-Info
kubectl get service -n mitm-proxy
```

### Logs ansehen
```bash
# Live-Logs
kubectl logs -f -n mitm-proxy deployment/mitm-proxy

# Letzte 100 Zeilen
kubectl logs --tail=100 -n mitm-proxy deployment/mitm-proxy
```

### Script updaten
```bash
# ConfigMap ändern in kubernetes-deployment.yaml
# Dann:
kubectl apply -f kubernetes-deployment.yaml
kubectl rollout restart deployment/mitm-proxy -n mitm-proxy
```

### Port-Forward (falls kein LoadBalancer)
```bash
# Lokaler Zugriff über localhost:8081
kubectl port-forward -n mitm-proxy service/mitm-proxy-service 8081:8081
```

Dann in Firefox: `localhost:8081`

---

## 🛠️ Troubleshooting

### Problem: "kubectl: command not found"
```bash
brew install kubectl
```

### Problem: "The connection to the server was refused"
→ Kubeconfig fehlt oder ist falsch
```bash
export KUBECONFIG=/pfad/zu/deiner/kubeconfig.yaml
kubectl cluster-info
```

### Problem: "ImagePullBackOff"
→ Docker-Image kann nicht geladen werden
```bash
kubectl describe pod -n mitm-proxy <pod-name>
```

Lösung: Verwende öffentliches mitmproxy-Image (schon in YAML)

### Problem: "Pending" Pod-Status
→ Nicht genug Ressourcen im Cluster
```bash
kubectl describe pod -n mitm-proxy <pod-name>
```

Lösung: Ressourcen-Limits reduzieren in `kubernetes-deployment.yaml`:
```yaml
resources:
  requests:
    memory: "128Mi"  # Statt 256Mi
    cpu: "100m"      # Statt 250m
```

### Problem: Keine EXTERNAL-IP
→ LoadBalancer nicht verfügbar
```bash
# Nutze Port-Forward stattdessen
kubectl port-forward -n mitm-proxy service/mitm-proxy-service 8081:8081
```

---

## 🔐 Zertifikat von Kubernetes-Pod holen

```bash
# 1. Pod-Name herausfinden
kubectl get pods -n mitm-proxy

# 2. In Pod einloggen
kubectl exec -it -n mitm-proxy <pod-name> -- /bin/sh

# 3. Zertifikat kopieren (in neuem Terminal)
kubectl cp mitm-proxy/<pod-name>:/home/mitmproxy/.mitmproxy/mitmproxy-ca-cert.pem ~/Downloads/mitmproxy-ca-cert.pem
```

Dann in Firefox importieren (siehe Haupt-README).

---

## 🔄 Updates & Maintenance

### Script-Änderungen deployen
```bash
# 1. Bearbeite kubernetes-deployment.yaml (ConfigMap Sektion)
# 2. Apply
kubectl apply -f kubernetes-deployment.yaml

# 3. Restart
kubectl rollout restart deployment/mitm-proxy -n mitm-proxy
```

### Komplett löschen
```bash
kubectl delete namespace mitm-proxy
```

### Neu deployen
```bash
./deploy-k8s.sh
```

---

## 📊 Monitoring

### Resource Usage
```bash
kubectl top pods -n mitm-proxy
kubectl top nodes
```

### Events
```bash
kubectl get events -n mitm-proxy --sort-by='.lastTimestamp'
```

### Service-Endpunkte
```bash
kubectl get endpoints -n mitm-proxy
```

---

## 💡 Tipps für LeoCloud

1. **Ressourcen-Limits beachten**: Cluster könnte quotas haben
2. **Namespace-Name**: Eventuell muss es `<dein-name>-mitm-proxy` heißen
3. **LoadBalancer**: Wenn nicht verfügbar, nutze `NodePort` oder `port-forward`
4. **Storage**: Falls du Logs persistent speichern willst, nutze PersistentVolumeClaim

### NodePort statt LoadBalancer

Falls LoadBalancer nicht funktioniert, ändere in `kubernetes-deployment.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mitm-proxy-service
  namespace: mitm-proxy
spec:
  type: NodePort  # Statt LoadBalancer
  selector:
    app: mitm-proxy
  ports:
  - protocol: TCP
    port: 8081
    targetPort: 8081
    nodePort: 30081  # Fest definierter Port
    name: proxy
```

Dann erreichbar über: `<node-ip>:30081`

---

## 🆘 Support

**Frag deinen Lehrer nach:**
1. ✅ Kubeconfig-Datei für LeoCloud
2. ✅ Externe IP/Domain des Clusters
3. ✅ Gibt es Resource-Quotas?
4. ✅ Welchen Service-Type nutzen? (LoadBalancer/NodePort)
5. ✅ Gibt es ein Ingress-Setup?

---

## 📝 Cheat Sheet

```bash
# Deployment
./deploy-k8s.sh

# Status
kubectl get all -n mitm-proxy

# Logs
kubectl logs -f -n mitm-proxy deployment/mitm-proxy

# Port-Forward
kubectl port-forward -n mitm-proxy service/mitm-proxy-service 8081:8081

# Update
kubectl apply -f kubernetes-deployment.yaml
kubectl rollout restart deployment/mitm-proxy -n mitm-proxy

# Löschen
kubectl delete namespace mitm-proxy
```

---

**Viel Erfolg auf LeoCloud! 🚀**

#!/bin/bash

# ==============================================
# LeoCloud Komplettes Setup für Luka (he200101)
# ==============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
    _               ____ _                 _ 
   | |    ___  ___ / ___| | ___  _   _  __| |
   | |   / _ \/ _ \ |   | |/ _ \| | | |/ _` |
   | |__|  __/ (_) | |___| | (_) | |_| | (_| |
   |_____\___|\___/ \____|_|\___/ \__,_|\__,_|
                                              
   MITM Proxy Deployment für he200101
EOF
echo -e "${NC}"

# 1. Dashboard installieren
echo -e "${BLUE}📊 Installing Dashboard...${NC}"
leocloud get template dashboard | kubectl apply -f -

# 2. Bearer Token erstellen
echo -e "${BLUE}🔑 Creating Bearer Token...${NC}"
TOKEN=$(kubectl create token he200101)
echo -e "${GREEN}✅ Token created!${NC}"
echo ""
echo -e "${YELLOW}📋 Your token (save this!):${NC}"
echo "$TOKEN"
echo ""

# 3. Port-Forward im Hintergrund starten
echo -e "${BLUE}🔄 Starting port-forward...${NC}"
kubectl port-forward svc/dashboard 8000:8000 > /dev/null 2>&1 &
PF_PID=$!
sleep 2

# 4. Browser öffnen
echo -e "${BLUE}🌐 Opening dashboard...${NC}"
open "http://localhost:8000/#/workloads?namespace=student-he200101"

echo ""
echo -e "${GREEN}✅ Dashboard is ready!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Paste the token above into the login dialog"
echo "2. Look for 'Download kubeconfig' or 'Kubernetes Config'"
echo "3. Save it as ~/leocloud-kubeconfig.yaml"
echo ""
echo -e "${BLUE}Then deploy the proxy:${NC}"
echo "export KUBECONFIG=~/leocloud-kubeconfig.yaml"
echo "cd $(pwd)"
echo "./deploy-k8s.sh"
echo ""
echo -e "${YELLOW}⚠️  Press Ctrl+C when done to cleanup${NC}"

# Warte auf Ctrl+C
trap cleanup INT
cleanup() {
    echo ""
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    kill $PF_PID 2>/dev/null || true
    leocloud get template dashboard | kubectl delete -f -
    echo -e "${GREEN}✅ Cleanup done!${NC}"
    exit 0
}

# Keep running
while true; do
    sleep 1
done

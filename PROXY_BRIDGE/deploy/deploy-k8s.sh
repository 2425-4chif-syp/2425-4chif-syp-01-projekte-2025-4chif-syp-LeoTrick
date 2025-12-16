#!/bin/bash

# ==============================================
# Kubernetes/LeoCloud Deployment Script
# ==============================================

set -e

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying MITM Proxy to Kubernetes/LeoCloud...${NC}"

# 1. Prüfe ob kubectl installiert ist
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found! Please install kubectl first.${NC}"
    echo "Install: brew install kubectl"
    exit 1
fi

# 2. Prüfe ob Cluster erreichbar ist
echo -e "${BLUE}🔍 Checking cluster connection...${NC}"
if ! kubectl get nodes &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to cluster!${NC}"
    echo "Please configure your kubeconfig first:"
    echo "  export KUBECONFIG=/path/to/your/kubeconfig"
    exit 1
fi

echo -e "${GREEN}✅ Connected to cluster${NC}"

# 3. Namespace erstellen (nicht nötig - nutzen student-he200101)
echo -e "${BLUE}📁 Using namespace: student-he200101${NC}"
kubectl apply -f kubernetes-deployment.yaml

# 4. Warte bis Deployment fertig ist
echo -e "${BLUE}⏳ Waiting for deployment...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/mitm-proxy -n student-he200101

# 5. Hole Service-Informationen
echo -e "${BLUE}🔍 Getting service information...${NC}"
kubectl get service mitm-proxy-service -n student-he200101

# 6. Hole externe IP/Port
EXTERNAL_IP=$(kubectl get service mitm-proxy-service -n student-he200101 -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ -z "$EXTERNAL_IP" ]; then
    EXTERNAL_IP=$(kubectl get service mitm-proxy-service -n student-he200101 -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
fi

if [ -z "$EXTERNAL_IP" ]; then
    echo -e "${YELLOW}⚠️  LoadBalancer IP not available yet. Use port-forward:${NC}"
    echo "kubectl port-forward -n student-he200101 service/mitm-proxy-service 8081:8081"
    EXTERNAL_IP="localhost (via port-forward)"
fi

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo -e "${BLUE}📋 Your proxy is accessible at:${NC}"
echo -e "   ${GREEN}$EXTERNAL_IP:8081${NC}"
echo ""
echo -e "${BLUE}🔧 Configure Firefox:${NC}"
echo "   1. Settings → Network Settings"
echo "   2. Manual proxy configuration"
echo "   3. HTTP Proxy: $EXTERNAL_IP"
echo "   4. Port: 8081"
echo "   5. ✅ Also use this proxy for HTTPS"
echo ""
echo -e "${BLUE}📊 Useful commands:${NC}"
echo "   View logs:    kubectl logs -f -n student-he200101 deployment/mitm-proxy"
echo "   View pods:    kubectl get pods -n student-he200101"
echo "   Delete all:   kubectl delete deployment mitm-proxy -n student-he200101"
echo "   Port forward: kubectl port-forward -n student-he200101 service/mitm-proxy-service 8081:8081"
echo ""
echo -e "${BLUE}🔄 Update script:${NC}"
echo "   kubectl apply -f kubernetes-deployment.yaml"

#!/bin/bash

# ==============================================
# LeoCloud Setup für Luka (he200101)
# ==============================================

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up LeoCloud access...${NC}"

# 1. Dashboard öffnen
echo -e "${BLUE}📊 Opening LeoCloud Dashboard...${NC}"
leocloud dashboard

echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. In the dashboard, look for 'Download kubeconfig' or 'Access Token'"
echo "2. Download the kubeconfig file"
echo "3. Save it as: ~/leocloud-kubeconfig.yaml"
echo ""
echo -e "${BLUE}Then run:${NC}"
echo "export KUBECONFIG=~/leocloud-kubeconfig.yaml"
echo "kubectl cluster-info"
echo "./deploy-k8s.sh"
echo ""
echo -e "${GREEN}Your LeoCloud info:${NC}"
echo "  Username:  he200101"
echo "  Namespace: student-he200101"
echo "  URL:       https://he200101.cloud.htl-leonding.ac.at"

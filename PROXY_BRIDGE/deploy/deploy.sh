#!/bin/bash

# ==============================================
# Local Deployment Script - Run on your Mac
# ==============================================

# Konfiguration - BITTE ANPASSEN!
LEOCLOUD_USER="your-username"        # Dein LeoCloud Username
LEOCLOUD_IP="your-server-ip"         # Deine LeoCloud IP/Domain
SSH_KEY="~/.ssh/id_rsa"               # Dein SSH Key (optional)

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying to LeoCloud...${NC}"

# Prüfe ob Konfiguration angepasst wurde
if [ "$LEOCLOUD_USER" = "your-username" ] || [ "$LEOCLOUD_IP" = "your-server-ip" ]; then
    echo -e "${RED}❌ Error: Please configure LEOCLOUD_USER and LEOCLOUD_IP in this script!${NC}"
    exit 1
fi

SERVER="$LEOCLOUD_USER@$LEOCLOUD_IP"

# 1. Setup-Script hochladen und ausführen
echo -e "${BLUE}📤 Uploading setup script...${NC}"
scp setup.sh $SERVER:~/
ssh $SERVER "chmod +x ~/setup.sh && ~/setup.sh"

# 2. Proxy-Script hochladen
echo -e "${BLUE}📤 Uploading proxy script...${NC}"
scp ../bridgebase-protocol/src/website/website_modifier.py $SERVER:~/mitm-proxy/

# 3. Service starten
echo -e "${BLUE}🔄 Starting proxy service...${NC}"
ssh $SERVER << 'EOF'
sudo systemctl daemon-reload
sudo systemctl enable mitm-proxy
sudo systemctl start mitm-proxy
sleep 2
sudo systemctl status mitm-proxy
EOF

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo -e "${BLUE}📋 Your proxy is now running on:${NC}"
echo -e "   ${GREEN}$LEOCLOUD_IP:8081${NC}"
echo ""
echo -e "${BLUE}🔧 Configure Firefox:${NC}"
echo "   1. Settings → Network Settings"
echo "   2. Manual proxy configuration"
echo "   3. HTTP Proxy: $LEOCLOUD_IP"
echo "   4. Port: 8081"
echo "   5. ✅ Also use this proxy for HTTPS"
echo ""
echo -e "${BLUE}🔍 Check logs:${NC} ssh $SERVER 'sudo journalctl -u mitm-proxy -f'"

#!/bin/bash

# ==============================================
# LeoCloud Deployment Script für MITM Proxy
# ==============================================

set -e  # Exit bei Fehler

echo "🚀 Starting LeoCloud Proxy Deployment..."

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. System Update
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# 2. Python installieren
echo -e "${BLUE}🐍 Installing Python and pip...${NC}"
sudo apt install -y python3 python3-pip python3-venv

# 3. Proxy-Verzeichnis erstellen
echo -e "${BLUE}📁 Creating proxy directory...${NC}"
mkdir -p ~/mitm-proxy
cd ~/mitm-proxy

# 4. Virtual Environment erstellen
echo -e "${BLUE}🔧 Creating virtual environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# 5. mitmproxy installieren
echo -e "${BLUE}📥 Installing mitmproxy...${NC}"
pip install --upgrade pip
pip install mitmproxy

# 6. Proxy-Script kopieren (wird später von deinem Mac hochgeladen)
echo -e "${BLUE}📝 Proxy script will be uploaded separately${NC}"

# 7. Firewall-Regel hinzufügen
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
sudo ufw allow 8081/tcp
sudo ufw status

# 8. Systemd Service erstellen
echo -e "${BLUE}⚙️ Creating systemd service...${NC}"
sudo tee /etc/systemd/system/mitm-proxy.service > /dev/null <<EOF
[Unit]
Description=MITM Proxy Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/mitm-proxy
ExecStart=$HOME/mitm-proxy/venv/bin/mitmproxy -p 8081 --listen-host 0.0.0.0 -s website_modifier.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Upload website_modifier.py to ~/mitm-proxy/"
echo "2. Run: sudo systemctl daemon-reload"
echo "3. Run: sudo systemctl enable mitm-proxy"
echo "4. Run: sudo systemctl start mitm-proxy"
echo ""
echo -e "${BLUE}🔍 Check status with:${NC} sudo systemctl status mitm-proxy"

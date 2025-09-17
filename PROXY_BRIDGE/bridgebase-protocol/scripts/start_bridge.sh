#!/bin/bash

# Professional Bridge Base Online Monitoring
# Author: Your Name
# Version: 1.0

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🃏 Bridge Base Online Proxy"
echo "=========================="
echo "📍 Project: $(basename "$PROJECT_ROOT")"
echo "📁 Data: data/output.txt"
echo

# Clean shutdown of existing proxies
echo "🔄 Stopping existing proxies..."
pkill -f mitmproxy 2>/dev/null || true
sleep 1

# Initialize data directory and output file
mkdir -p data
echo "noch keine Stiche" > data/output.txt

echo "🚀 Starting proxy on port 8081..."
echo "📝 Firefox proxy: localhost:8081"
echo "🌐 Visit: http://www.bridgebase.com"
echo "📊 Live data: data/output.txt"
echo
echo "⏹️  Stop: Ctrl+C"
echo "=========================="

# Start mitmproxy with bridge monitoring
/Users/luka/Library/Python/3.9/bin/mitmproxy \
    --listen-port 8081 \
    -s "src/bridge/interpret_log.py"
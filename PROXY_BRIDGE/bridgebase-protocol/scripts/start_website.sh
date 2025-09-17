#!/bin/bash

# Professional Website Modifier
# Author: Your Name  
# Version: 1.0

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🌐 Website Modifier Proxy"
echo "========================"
echo "📍 Project: $(basename "$PROJECT_ROOT")"
echo "🎯 Target: htl-leonding.at"
echo

# Clean shutdown of existing proxies
echo "🔄 Stopping existing proxies..."
pkill -f mitmproxy 2>/dev/null || true
sleep 1

echo "🚀 Starting proxy on port 8081..."
echo "📝 Firefox proxy: localhost:8081"
echo "🌐 Visit: https://www.htl-leonding.at"
echo "✨ Modifications: Text & CSS changes"
echo
echo "⏹️  Stop: Ctrl+C"
echo "========================"

# Start mitmproxy with website modifier
/Users/luka/Library/Python/3.9/bin/mitmproxy \
    --listen-port 8081 \
    -s "src/website/website_modifier.py"
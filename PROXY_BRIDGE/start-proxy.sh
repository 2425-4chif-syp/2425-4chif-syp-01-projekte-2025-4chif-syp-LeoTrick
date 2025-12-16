#!/bin/bash

echo "🚀 Starte stabilen Proxy-Zugriff..."

# Stoppe alte Port-Forwards
pkill -f "port-forward.*8081" 2>/dev/null

# Warte kurz
sleep 1

echo "📡 Port-Forward wird gestartet..."
echo "⚠️  DIESES FENSTER OFFEN LASSEN!"
echo ""
echo "Firefox Proxy-Einstellungen:"
echo "  HTTP Proxy: localhost"
echo "  Port: 8081"
echo ""
echo "Drücke Strg+C zum Stoppen"
echo ""

# Starte Port-Forward (läuft im Vordergrund)
kubectl port-forward -n student-he200101 service/mitm-proxy-service 8081:8081

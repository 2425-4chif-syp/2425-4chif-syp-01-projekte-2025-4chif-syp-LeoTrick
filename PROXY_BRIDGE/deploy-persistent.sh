#!/bin/bash
kubectl apply -f /Users/luka/Documents/GitHub/2425-4chif-syp-01-projekte-2025-4chif-syp-LeoTrick/PROXY_BRIDGE/deploy/kubernetes-deployment.yaml
echo "Warte auf Pod-Neustart..."
sleep 10
kubectl get pods -n student-he200101
kubectl get pvc -n student-he200101
echo ""
echo "✅ Jetzt hat der Pod einen persistenten Speicher für das Zertifikat!"
echo "Das Zertifikat bleibt bei jedem Neustart gleich!"

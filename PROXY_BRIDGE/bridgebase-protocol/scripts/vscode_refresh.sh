#!/bin/zsh

# Auto-refresh VS Code file watcher
cd "$(dirname "$0")"

echo "🔄 VS Code Auto-Refresh für output.txt aktiviert"
echo "📝 Öffne output.txt in VS Code"
echo "👀 Die Datei wird automatisch aktualisiert"
echo "⏹️  Zum Beenden: Drücke Ctrl+C"

# Touch die Datei alle 2 Sekunden um VS Code zum Refresh zu zwingen
while true; do
    if [ -f "output.txt" ]; then
        # Trigger VS Code file watcher
        touch output.txt
        echo "🔄 $(date '+%H:%M:%S') - Datei aktualisiert"
    fi
    sleep 2
done
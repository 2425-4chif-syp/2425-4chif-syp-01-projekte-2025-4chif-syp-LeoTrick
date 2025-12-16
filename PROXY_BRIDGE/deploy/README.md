# 🚀 LeoCloud Deployment Guide

Deployment-Setup für den MITM Proxy auf deinem LeoCloud Server.

## 📋 Voraussetzungen

- LeoCloud Server mit Ubuntu/Debian
- SSH-Zugang zu deinem Server
- Deine LeoCloud IP-Adresse/Domain

## 🎯 Schnellstart (Automatisch)

### Option 1: Automatisches Deployment (Empfohlen)

1. **Öffne `deploy.sh` und konfiguriere:**
   ```bash
   LEOCLOUD_USER="dein-username"      # Dein LeoCloud Username
   LEOCLOUD_IP="deine-server-ip"      # Deine LeoCloud IP
   ```

2. **Führe das Deployment aus:**
   ```bash
   cd deploy
   chmod +x deploy.sh
   ./deploy.sh
   ```

Das war's! 🎉 Der Proxy läuft jetzt auf `deine-ip:8081`

### Option 2: Docker Deployment

```bash
cd deploy

# Docker-Image bauen und starten
docker-compose up -d

# Logs ansehen
docker-compose logs -f
```

## 🔧 Manuelle Installation

Falls du es manuell machen willst:

### 1. Setup-Script auf Server ausführen

```bash
# Von deinem Mac aus
scp setup.sh dein-user@leocloud-ip:~/
ssh dein-user@leocloud-ip
chmod +x setup.sh
./setup.sh
```

### 2. Proxy-Script hochladen

```bash
# Von deinem Mac aus
scp ../bridgebase-protocol/src/website/website_modifier.py dein-user@leocloud-ip:~/mitm-proxy/
```

### 3. Service starten

```bash
# Auf dem Server
sudo systemctl daemon-reload
sudo systemctl enable mitm-proxy
sudo systemctl start mitm-proxy
```

## 🔍 Proxy verwalten

### Status checken
```bash
sudo systemctl status mitm-proxy
```

### Logs ansehen
```bash
sudo journalctl -u mitm-proxy -f
```

### Neustarten
```bash
sudo systemctl restart mitm-proxy
```

### Stoppen
```bash
sudo systemctl stop mitm-proxy
```

## 🌐 Firefox konfigurieren

1. **Settings** → **Network Settings** → **Settings...**
2. Wähle: **Manual proxy configuration**
3. Trage ein:
   - HTTP Proxy: `deine-leocloud-ip`
   - Port: `8081`
   - ✅ **Also use this proxy for HTTPS**
4. Klicke auf **OK**

## 🔐 Zertifikat installieren (für HTTPS)

### 1. Zertifikat vom Server holen
```bash
# Von deinem Mac aus
scp dein-user@leocloud-ip:~/.mitmproxy/mitmproxy-ca-cert.pem ~/Downloads/
```

### 2. In Firefox importieren
1. **Settings** → Suche nach "Certificates"
2. **View Certificates...** → **Authorities** Tab
3. **Import...** → Wähle `mitmproxy-ca-cert.pem`
4. ✅ **Trust this CA to identify websites**
5. **OK**

## 🛠️ Proxy-Script updaten

```bash
# Von deinem Mac aus
scp ../bridgebase-protocol/src/website/website_modifier.py dein-user@leocloud-ip:~/mitm-proxy/

# Service neustarten
ssh dein-user@leocloud-ip "sudo systemctl restart mitm-proxy"
```

## 📊 Nützliche Befehle

### Firewall-Status
```bash
sudo ufw status
```

### Port 8081 checken
```bash
sudo netstat -tlnp | grep 8081
```

### Alle aktiven Verbindungen
```bash
sudo ss -tunap | grep 8081
```

## ⚠️ Troubleshooting

### Proxy startet nicht
```bash
# Logs ansehen
sudo journalctl -u mitm-proxy -n 50

# Permissions checken
ls -la ~/mitm-proxy/
```

### Port schon belegt
```bash
# Prozess finden
sudo lsof -i :8081

# Prozess killen (PID aus obigem Befehl)
sudo kill -9 <PID>
```

### Firefox kann nicht verbinden
- Prüfe ob Proxy läuft: `sudo systemctl status mitm-proxy`
- Prüfe Firewall: `sudo ufw status`
- Prüfe ob Port offen: `telnet deine-ip 8081`

## 🔒 Sicherheit

⚠️ **WICHTIG**: Der Proxy ist öffentlich erreichbar!

### IP-Whitelist einrichten (Empfohlen)

Bearbeite `/etc/systemd/system/mitm-proxy.service`:
```ini
ExecStart=/home/user/mitm-proxy/venv/bin/mitmproxy -p 8081 --listen-host 0.0.0.0 --set block_global=false --set client_certs=* -s website_modifier.py
```

Dann Firewall-Regel:
```bash
# Nur deine IP erlauben (ersetze X.X.X.X mit deiner IP)
sudo ufw delete allow 8081/tcp
sudo ufw allow from X.X.X.X to any port 8081
```

## 📝 Struktur

```
deploy/
├── setup.sh              # Server-Setup (auf Server ausführen)
├── deploy.sh             # Automatisches Deployment (auf Mac ausführen)
├── Dockerfile            # Docker-Image
├── docker-compose.yml    # Docker Compose Config
└── README.md            # Diese Anleitung
```

## 🎓 Nächste Schritte

Nach erfolgreichem Deployment:

1. ✅ Teste den Proxy mit htl-leonding.at
2. 📝 Passe `website_modifier.py` an
3. 🔄 Update mit: `./deploy.sh` (deployed automatisch neu)
4. 📊 Monitor mit: `ssh dein-user@leocloud-ip 'sudo journalctl -u mitm-proxy -f'`

## 💡 Tipps

- **Automatisches Update**: Erstelle einen Cronjob für automatische Updates
- **Monitoring**: Nutze `htop` oder `glances` für Server-Monitoring
- **Backup**: Erstelle regelmäßig Backups von `website_modifier.py`
- **Logs rotieren**: Konfiguriere Log-Rotation für mitmproxy

## 🆘 Support

Bei Problemen:
1. Prüfe Logs: `sudo journalctl -u mitm-proxy -f`
2. Prüfe Status: `sudo systemctl status mitm-proxy`
3. Prüfe Netzwerk: `sudo netstat -tlnp | grep 8081`

---

**Viel Erfolg! 🚀**

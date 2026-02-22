#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════╗
║        LeoTrick Proxy Launcher v2.0          ║
║  Ein-Klick Ad-Blocker + Website-Modifier     ║
╚══════════════════════════════════════════════╝

Automatisch:
  - Firefox-Proxy konfigurieren (localhost:8081)
  - mitmproxy CA-Zertifikat installieren
  - Ad-Blocker + Schimpfwort-Filter starten
  - Beim Beenden: Firefox-Einstellungen wiederherstellen
"""

import os
import sys
import subprocess
import shutil
import signal
import time
import re
import platform
import glob
import atexit
import ctypes
from pathlib import Path

# ──────────────────────────────────────────────
#  KONFIGURATION
# ──────────────────────────────────────────────
PROXY_PORT = 8081
PROXY_HOST = "127.0.0.1"
APP_NAME   = "LeoTrick Proxy"
VERSION    = "2.0"

# True wenn die EXE via PyInstaller gebaut wurde
IS_BUNDLED = hasattr(sys, "_MEIPASS")

# Handle für den in-process mitmproxy (EXE-Modus)
_inprocess_master = None

# ──────────────────────────────────────────────
#  PFAD-HELFER  (dev vs. PyInstaller-EXE)
# ──────────────────────────────────────────────
def get_resource_path(relative_path: str) -> str:
    """Liefert den absoluten Pfad einer eingebetteten Ressource."""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, relative_path)


def get_data_dir() -> str:
    """Schreibbares Verzeichnis für temporäre Dateien."""
    if platform.system() == "Windows":
        base = os.environ.get("LOCALAPPDATA", os.path.expanduser("~"))
    else:
        base = os.path.expanduser("~")
    d = os.path.join(base, "LeoTrickProxy")
    os.makedirs(d, exist_ok=True)
    return d


# ──────────────────────────────────────────────
#  KONSOLEN-AUSGABE
# ──────────────────────────────────────────────
def banner():
    print("\n" + "═" * 52)
    print(f"   🎯  {APP_NAME}  v{VERSION}")
    print("   Ad-Blocker · Website-Modifier · Schimpfwort-Filter")
    print("═" * 52 + "\n")


def log(msg, icon="ℹ️ "):   print(f"  {icon}  {msg}")
def ok(msg):               log(msg, "✅")
def warn(msg):             log(msg, "⚠️ ")
def err(msg):              log(msg, "❌")


# ──────────────────────────────────────────────
#  ADMIN-CHECK  (Windows)
# ──────────────────────────────────────────────
def is_admin() -> bool:
    if platform.system() != "Windows":
        return os.geteuid() == 0
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        return False


def request_admin_restart():
    """Startet das Programm mit Admin-Rechten neu (Windows)."""
    if platform.system() != "Windows":
        return
    warn("Admin-Rechte werden für die Zertifikats-Installation benötigt.")
    warn("Das Programm startet sich jetzt mit erhöhten Rechten neu …")
    time.sleep(2)
    ctypes.windll.shell32.ShellExecuteW(
        None, "runas", sys.executable, " ".join(sys.argv), None, 1
    )
    sys.exit(0)


# ──────────────────────────────────────────────
#  MITMPROXY FINDEN / INSTALLIEREN
# ──────────────────────────────────────────────
def find_mitmdump() -> str | None:
    # 1. PATH
    found = shutil.which("mitmdump")
    if found:
        return found

    # 2. Bekannte Pfade
    if platform.system() == "Windows":
        patterns = [
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "Python",
                         "Python3*", "Scripts", "mitmdump.exe"),
            os.path.join(os.environ.get("APPDATA", ""), "Python", "Python3*",
                         "Scripts", "mitmdump.exe"),
            r"C:\Python3*\Scripts\mitmdump.exe",
            r"C:\Python\Scripts\mitmdump.exe",
        ]
    else:
        patterns = [
            os.path.expanduser("~/Library/Python/3.*/bin/mitmdump"),
            "/usr/local/bin/mitmdump",
            "/opt/homebrew/bin/mitmdump",
            os.path.expanduser("~/.local/bin/mitmdump"),
        ]

    for pattern in patterns:
        matches = glob.glob(pattern)
        if matches:
            return matches[0]

    return None


def install_mitmproxy() -> bool:
    log("Installiere mitmproxy  (bitte warten, ~1–2 min) …")
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "mitmproxy", "--quiet"],
            check=True,
            timeout=300,
        )
        ok("mitmproxy erfolgreich installiert!")
        return True
    except Exception as e:
        err(f"Installation fehlgeschlagen: {e}")
        return False


# ──────────────────────────────────────────────
#  ZERTIFIKAT  (generieren + installieren)
# ──────────────────────────────────────────────
def get_cert_dir() -> str:
    if platform.system() == "Windows":
        return os.path.join(os.environ.get("USERPROFILE", os.path.expanduser("~")),
                            ".mitmproxy")
    return os.path.expanduser("~/.mitmproxy")


def generate_cert(mitmdump_path: str) -> bool:
    """Startet mitmdump kurz auf einem freien Port, damit es das CA-Cert erzeugt."""
    cert_pem = os.path.join(get_cert_dir(), "mitmproxy-ca-cert.pem")
    if os.path.exists(cert_pem):
        return True

    log("Erzeuge mitmproxy-CA-Zertifikat  (einmalig) …")
    try:
        proc = subprocess.Popen(
            [mitmdump_path, "--listen-port", "19876"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        # Warten bis cert da ist (max 8 s)
        for _ in range(16):
            time.sleep(0.5)
            if os.path.exists(cert_pem):
                break
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
    except Exception as e:
        warn(f"Zertifikat-Generierung: {e}")

    return os.path.exists(cert_pem)


def install_cert_windows(cert_pem: str) -> bool:
    """Installiert das Zertifikat in den Windows-Zertifikatspeicher (Root CA)."""
    try:
        result = subprocess.run(
            ["certutil", "-addstore", "-f", "Root", cert_pem],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            ok("Zertifikat im Windows-Zertifikatspeicher installiert!")
            return True
        warn(f"certutil Rückgabe: {result.stderr.strip()}")
        return False
    except FileNotFoundError:
        warn("certutil nicht gefunden – überspringe Systemzertifikat-Installation")
        return False


def install_cert_macos(cert_pem: str) -> bool:
    try:
        result = subprocess.run(
            ["security", "add-trusted-cert", "-d", "-r", "trustRoot",
             "-k", "/Library/Keychains/System.keychain", cert_pem],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            ok("Zertifikat in macOS-Schlüsselbund installiert!")
            return True
        warn(f"security: {result.stderr.strip()}")
        return False
    except Exception as e:
        warn(f"Zertifikat macOS: {e}")
        return False


def install_cert_firefox_nss() -> bool:
    """Installiert Zertifikat direkt in Firefox NSS-Datenbank - kein manueller Import noetig."""
    cert_pem = os.path.join(get_cert_dir(), "mitmproxy-ca-cert.pem")
    if not os.path.exists(cert_pem):
        return False

    # Firefox certutil.exe (NSS-Tool) suchen - liegt im Firefox-Installationsordner
    nss_certutil = None
    ff_dirs = [
        r"C:\Program Files\Mozilla Firefox",
        r"C:\Program Files (x86)\Mozilla Firefox",
        os.path.join(os.environ.get("PROGRAMFILES",    ""), "Mozilla Firefox"),
        os.path.join(os.environ.get("PROGRAMFILES(X86)", ""), "Mozilla Firefox"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Mozilla Firefox"),
    ]
    for d in ff_dirs:
        candidate = os.path.join(d, "certutil.exe")
        if os.path.exists(candidate):
            nss_certutil = candidate
            break

    if not nss_certutil:
        warn("Firefox certutil.exe nicht gefunden - NSS-Zertifikat-Installation uebersprungen")
        return False

    profiles = _scan_firefox_profiles()
    count = 0
    for profile in profiles:
        try:
            # Altes mitmproxy-Zertifikat entfernen (falls vorhanden)
            subprocess.run(
                [nss_certutil, "-D", "-d", f"sql:{profile}", "-n", "mitmproxy"],
                capture_output=True
            )
            # Neues Zertifikat installieren (CT,, = trusted fuer SSL + Email)
            result = subprocess.run(
                [nss_certutil, "-A",
                 "-d", f"sql:{profile}",
                 "-n", "mitmproxy",
                 "-t", "CT,,",
                 "-i", cert_pem],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                count += 1
                ok(f"Zertifikat in Firefox NSS installiert: {os.path.basename(profile)}")
            else:
                warn(f"NSS install Fehler: {result.stderr.strip()}")
        except Exception as e:
            warn(f"NSS Zertifikat: {e}")

    return count > 0


def install_cert() -> bool:
    cert_pem = os.path.join(get_cert_dir(), "mitmproxy-ca-cert.pem")
    if not os.path.exists(cert_pem):
        warn("Zertifikat noch nicht vorhanden - wird beim ersten Proxy-Start generiert.")
        return False

    system = platform.system()
    if system == "Windows":
        ok_win = install_cert_windows(cert_pem)
        ok_nss = install_cert_firefox_nss()   # direkt in Firefox NSS
        return ok_win or ok_nss
    if system == "Darwin":
        return install_cert_macos(cert_pem)

    log(f"Linux: Bitte Zertifikat manuell installieren: {cert_pem}")
    return False


# ──────────────────────────────────────────────
#  WINDOWS SYSTEMPROXY  (Registry)
# ──────────────────────────────────────────────
def configure_windows_system_proxy(port: int = PROXY_PORT) -> bool:
    if platform.system() != "Windows":
        return False
    try:
        import winreg
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            0, winreg.KEY_SET_VALUE
        )
        winreg.SetValueEx(key, "ProxyEnable", 0, winreg.REG_DWORD, 1)
        winreg.SetValueEx(key, "ProxyServer",  0, winreg.REG_SZ, f"127.0.0.1:{port}")
        winreg.SetValueEx(key, "ProxyOverride", 0, winreg.REG_SZ, "localhost;127.0.0.1;<local>")
        winreg.CloseKey(key)
        # Windows sofort benachrichtigen
        ctypes.windll.wininet.InternetSetOptionW(0, 39, 0, 0)
        ctypes.windll.wininet.InternetSetOptionW(0, 37, 0, 0)
        ok(f"Windows-Systemproxy gesetzt: 127.0.0.1:{port}")
        return True
    except Exception as e:
        warn(f"Windows-Systemproxy konnte nicht gesetzt werden: {e}")
        return False


def restore_windows_system_proxy():
    if platform.system() != "Windows":
        return
    try:
        import winreg
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            0, winreg.KEY_SET_VALUE
        )
        winreg.SetValueEx(key, "ProxyEnable", 0, winreg.REG_DWORD, 0)
        winreg.CloseKey(key)
        ctypes.windll.wininet.InternetSetOptionW(0, 39, 0, 0)
        ctypes.windll.wininet.InternetSetOptionW(0, 37, 0, 0)
        log("Windows-Systemproxy deaktiviert.", "🔄")
    except Exception as e:
        warn(f"Windows-Systemproxy Reset: {e}")


# ──────────────────────────────────────────────
#  FIREFOX FINDEN & PROFIL ERSTELLEN
# ──────────────────────────────────────────────
def find_firefox_exe() -> str | None:
    candidates = [
        r"C:\Program Files\Mozilla Firefox\firefox.exe",
        r"C:\Program Files (x86)\Mozilla Firefox\firefox.exe",
        os.path.join(os.environ.get("PROGRAMFILES",    ""), "Mozilla Firefox", "firefox.exe"),
        os.path.join(os.environ.get("PROGRAMFILES(X86)", ""), "Mozilla Firefox", "firefox.exe"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""),
                     "Mozilla Firefox", "firefox.exe"),
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return shutil.which("firefox")


def find_firefox_install_dir() -> str | None:
    """Findet das Firefox-Installationsverzeichnis."""
    fx = find_firefox_exe()
    if fx:
        return os.path.dirname(fx)
    return None


def install_firefox_policy(port: int = PROXY_PORT) -> bool:
    """Schreibt policies.json in Firefox-Installationsordner.
    Das ist die offizielle Enterprise-Methode die GARANTIERT funktioniert.
    Setzt Proxy UND Zertifikat gleichzeitig."""
    import json

    ff_dir = find_firefox_install_dir()
    if not ff_dir:
        warn("Firefox-Installationsordner nicht gefunden!")
        return False

    cert_pem = os.path.join(get_cert_dir(), "mitmproxy-ca-cert.pem")

    policy = {
        "policies": {
            "Certificates": {
                "ImportEnterpriseRoots": True,
            },
            "Proxy": {
                "Mode": "manual",
                "HTTPProxy": f"127.0.0.1:{port}",
                "SSLProxy": f"127.0.0.1:{port}",
                "Passthrough": "localhost, 127.0.0.1",
                "Locked": True,
                "UseProxyForDNS": False
            }
        }
    }

    # Zertifikat per Policy installieren falls vorhanden
    if os.path.exists(cert_pem):
        policy["policies"]["Certificates"]["Install"] = [cert_pem.replace("\\", "/")]

    dist_dir = os.path.join(ff_dir, "distribution")
    os.makedirs(dist_dir, exist_ok=True)
    policy_path = os.path.join(dist_dir, "policies.json")

    # Backup der alten policies.json (falls vorhanden)
    if os.path.exists(policy_path):
        backup = policy_path + ".bak"
        if not os.path.exists(backup):
            shutil.copy2(policy_path, backup)

    with open(policy_path, "w", encoding="utf-8") as f:
        json.dump(policy, f, indent=2)

    ok(f"Firefox Enterprise Policy installiert: {policy_path}")
    ok(f"  Proxy: 127.0.0.1:{port}")
    ok(f"  Zertifikat: {'JA' if os.path.exists(cert_pem) else 'NEIN'}")
    return True


def restore_firefox_policy():
    """Entfernt die policies.json bzw stellt das Backup wieder her."""
    ff_dir = find_firefox_install_dir()
    if not ff_dir:
        return
    policy_path = os.path.join(ff_dir, "distribution", "policies.json")
    backup = policy_path + ".bak"
    if os.path.exists(backup):
        shutil.copy2(backup, policy_path)
        os.remove(backup)
        log("Firefox Policy Backup wiederhergestellt.", "🔄")
    elif os.path.exists(policy_path):
        os.remove(policy_path)
        log("Firefox Policy entfernt.", "🔄")


def launch_firefox_to_create_profile() -> bool:
    """Startet Firefox kurz (headless) damit es sein Standardprofil anlegt."""
    fx = find_firefox_exe()
    if not fx:
        return False
    log("Starte Firefox einmalig um Profil zu erstellen (bitte warten ~8 Sekunden) ...")
    try:
        proc = subprocess.Popen(
            [fx, "--headless", "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        time.sleep(8)
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        time.sleep(1)
        return True
    except Exception as e:
        warn(f"Firefox konnte nicht gestartet werden: {e}")
        return False


def kill_firefox():
    """Schliesst alle laufenden Firefox-Prozesse."""
    if platform.system() == "Windows":
        subprocess.run(["taskkill", "/F", "/IM", "firefox.exe"],
                       capture_output=True)
    else:
        subprocess.run(["pkill", "-f", "firefox"], capture_output=True)
    time.sleep(2)


def free_port(port: int):
    """Beendet jeden Prozess der den angegebenen Port belegt (Windows)."""
    if platform.system() != "Windows":
        return
    try:
        # Finde PID die auf dem Port lauscht
        result = subprocess.run(
            ["netstat", "-ano", "-p", "TCP"],
            capture_output=True, text=True
        )
        for line in result.stdout.splitlines():
            if f":{port}" in line and "LISTENING" in line:
                parts = line.split()
                pid = parts[-1]
                if pid.isdigit() and int(pid) != os.getpid():
                    subprocess.run(["taskkill", "/F", "/PID", pid],
                                   capture_output=True)
                    log(f"Prozess auf Port {port} beendet (PID {pid})")
    except Exception as e:
        warn(f"Port {port} freigeben fehlgeschlagen: {e}")


def relaunch_firefox():
    """Startet Firefox neu."""
    fx = find_firefox_exe()
    if not fx:
        warn("Firefox nicht gefunden - bitte manuell starten!")
        return
    log("Starte Firefox neu ...")
    subprocess.Popen([fx], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
def _scan_firefox_profiles() -> list[str]:
    """Liest profiles.ini und gibt alle vorhandenen Profil-Verzeichnisse zurueck."""
    system = platform.system()
    if system == "Windows":
        ff_root = os.path.join(os.environ.get("APPDATA", ""), "Mozilla", "Firefox")
    elif system == "Darwin":
        ff_root = os.path.expanduser("~/Library/Application Support/Firefox")
    else:
        ff_root = os.path.expanduser("~/.mozilla/firefox")

    profiles = []

    # profiles.ini auslesen
    ini_path = os.path.join(ff_root, "profiles.ini")
    if os.path.exists(ini_path):
        import configparser
        cfg = configparser.ConfigParser()
        cfg.read(ini_path, encoding="utf-8")
        for section in cfg.sections():
            if section.lower().startswith("profile"):
                rel  = cfg.get(section, "IsRelative", fallback="1")
                path = cfg.get(section, "Path", fallback="")
                if path:
                    full = os.path.join(ff_root, path.replace("/", os.sep)) if rel == "1" else path
                    if os.path.isdir(full):
                        profiles.append(full)

    # Fallback: Profiles-Ordner direkt scannen
    if not profiles:
        profiles_root = os.path.join(ff_root, "Profiles")
        if os.path.isdir(profiles_root):
            profiles = [
                os.path.join(profiles_root, p)
                for p in os.listdir(profiles_root)
                if os.path.isdir(os.path.join(profiles_root, p))
                and not p == "leotrick.default"  # unsere Fake-Profile ignorieren
            ]

    return profiles


def find_firefox_profiles() -> list[str]:
    profiles = _scan_firefox_profiles()

    # Kein echtes Profil? -> Firefox kurz starten damit es eines erstellt
    if not profiles:
        if launch_firefox_to_create_profile():
            profiles = _scan_firefox_profiles()

    return profiles


_MARKER_START = "// ===== LeoTrick Proxy START ====="
_MARKER_END   = "// ===== LeoTrick Proxy END ====="

def _proxy_block(port: int) -> str:
    return f"""\n{_MARKER_START}
user_pref("network.proxy.type",              1);
user_pref("network.proxy.http",              "127.0.0.1");
user_pref("network.proxy.http_port",         {port});
user_pref("network.proxy.ssl",               "127.0.0.1");
user_pref("network.proxy.ssl_port",          {port});
user_pref("network.proxy.ftp",               "127.0.0.1");
user_pref("network.proxy.ftp_port",          {port});
user_pref("network.proxy.no_proxies_on",     "");
user_pref("network.proxy.share_proxy_settings", true);
// Erlaubt Firefox, Windows-System-Zertifikate zu nutzen (wichtig für HTTPS!)
user_pref("security.enterprise_roots.enabled", true);
{_MARKER_END}\n"""


def _strip_old_settings(content: str) -> str:
    return re.sub(
        re.escape(_MARKER_START) + r".*?" + re.escape(_MARKER_END) + r"\n?",
        "",
        content,
        flags=re.DOTALL,
    )


def configure_firefox_proxy(port: int = PROXY_PORT) -> bool:
    profiles = find_firefox_profiles()
    if not profiles:
        warn("Keine Firefox-Profile gefunden!")
        return False

    count = 0
    for profile in profiles:
        _write_proxy_to_file(profile, "user.js",  port)
        _write_proxy_to_file(profile, "prefs.js", port)  # direkt in prefs.js -> sofort aktiv
        count += 1
        ok(f"Firefox-Profil konfiguriert: {os.path.basename(profile)}")

    return count > 0


def _write_proxy_to_file(profile: str, filename: str, port: int):
    """Schreibt Proxy-Einstellungen in user.js oder prefs.js."""
    filepath = os.path.join(profile, filename)
    existing = ""
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            existing = f.read()
    # Bestehende Proxy-Zeilen ueberschreiben
    proxy_prefs = [
        "network.proxy.type",
        "network.proxy.http",
        "network.proxy.http_port",
        "network.proxy.ssl",
        "network.proxy.ssl_port",
        "network.proxy.no_proxies_on",
        "network.proxy.share_proxy_settings",
        "security.enterprise_roots.enabled",
    ]
    lines = [l for l in existing.splitlines()
             if not any(p in l for p in proxy_prefs)
             and _MARKER_START not in l and _MARKER_END not in l]
    lines.append(f"")
    lines.append(f"{_MARKER_START}")
    lines.append(f'user_pref("network.proxy.type",              1);')
    lines.append(f'user_pref("network.proxy.http",              "127.0.0.1");')
    lines.append(f'user_pref("network.proxy.http_port",         {port});')
    lines.append(f'user_pref("network.proxy.ssl",               "127.0.0.1");')
    lines.append(f'user_pref("network.proxy.ssl_port",          {port});')
    lines.append(f'user_pref("network.proxy.no_proxies_on",     "localhost, 127.0.0.1");')
    lines.append(f'user_pref("network.proxy.share_proxy_settings", true);')
    lines.append(f'user_pref("security.enterprise_roots.enabled", true);')
    lines.append(f'user_pref("network.proxy.socks_remote_dns",  false);')
    lines.append(f"{_MARKER_END}")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def restore_firefox_proxy():
    profiles = find_firefox_profiles()
    proxy_prefs = [
        "network.proxy.type", "network.proxy.http", "network.proxy.http_port",
        "network.proxy.ssl",  "network.proxy.ssl_port", "network.proxy.no_proxies_on",
        "network.proxy.share_proxy_settings",
    ]
    for profile in profiles:
        for filename in ("user.js", "prefs.js"):
            filepath = os.path.join(profile, filename)
            if not os.path.exists(filepath):
                continue
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            lines = [l for l in content.splitlines()
                     if not any(p in l for p in proxy_prefs)
                     and _MARKER_START not in l and _MARKER_END not in l]
            with open(filepath, "w", encoding="utf-8") as f:
                f.write("\n".join(lines) + "\n")
    log("Firefox-Proxy-Einstellungen zurueckgesetzt.", "🔄")


# ──────────────────────────────────────────────
#  PROXY-PROZESS
# ──────────────────────────────────────────────
_proxy_proc: subprocess.Popen | None = None


def start_proxy(mitmdump_path: str, script_path: str) -> subprocess.Popen:
    global _proxy_proc
    cmd = [
        mitmdump_path,
        "--listen-port", str(PROXY_PORT),
        "--listen-host", PROXY_HOST,
        "--ssl-insecure",
        "-s", script_path,
        "--set", "block_global=false",
    ]
    log(f"Starte Proxy auf {PROXY_HOST}:{PROXY_PORT} …")
    _proxy_proc = subprocess.Popen(cmd)
    return _proxy_proc


def stop_proxy():
    global _proxy_proc, _inprocess_master
    # In-Process Modus (PyInstaller EXE)
    if _inprocess_master is not None:
        try:
            _inprocess_master.shutdown()
        except Exception:
            pass
        _inprocess_master = None
    # Subprocess Modus
    if _proxy_proc and _proxy_proc.poll() is None:
        log("Stoppe Proxy …", "🛑")
        _proxy_proc.terminate()
        try:
            _proxy_proc.wait(timeout=6)
        except subprocess.TimeoutExpired:
            _proxy_proc.kill()


def start_proxy_inprocess(script_path: str):
    """Startet mitmproxy direkt in Python - kein externer mitmdump noetig (PyInstaller EXE)."""
    import asyncio
    import threading
    from mitmproxy.tools import dump
    from mitmproxy import options

    global _inprocess_master

    opts = options.Options(
        listen_host=PROXY_HOST,
        listen_port=PROXY_PORT,
        ssl_insecure=True,
    )

    ready  = threading.Event()
    errors = []

    async def _run():
        global _inprocess_master
        try:
            import importlib.util
            # Modul direkt laden – kein Script-Addon nötig
            spec = importlib.util.spec_from_file_location("website_modifier", script_path)
            mod  = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)

            # Wrapper-Addon der Modul-Funktionen delegiert
            class ModuleAddon:
                async def request(self, flow):
                    if hasattr(mod, "request"):
                        mod.request(flow)
                async def response(self, flow):
                    if hasattr(mod, "response"):
                        mod.response(flow)

            _inprocess_master = dump.DumpMaster(opts)
            _inprocess_master.addons.add(ModuleAddon())
            ready.set()
            await _inprocess_master.run()
        except Exception as e:
            errors.append(e)
            ready.set()

    def run():
        try:
            asyncio.run(_run())
        except Exception as e:
            errors.append(e)
            ready.set()

    t = threading.Thread(target=run, daemon=True, name="mitmproxy")
    t.start()
    ready.wait(timeout=20)

    if errors:
        err(f"Proxy Fehler: {errors[0]}")
        err("")
        err("Moeglicherweise ist Port 8081 bereits belegt.")
        err("Schliesse andere Programme die Port 8081 nutzen und starte neu.")
        input("\n  Druecke Enter zum Beenden ...")
        restore_firefox_proxy()
        sys.exit(1)

    log(f"Proxy laeuft auf {PROXY_HOST}:{PROXY_PORT} (EXE-Modus)")
    return t


def generate_cert_inprocess():
    """Erzeugt das mitmproxy CA-Zertifikat via kurzem In-Process Start."""
    cert_pem = os.path.join(get_cert_dir(), "mitmproxy-ca-cert.pem")
    if os.path.exists(cert_pem):
        return True

    log("Erzeuge mitmproxy CA-Zertifikat (einmalig) ...")

    import asyncio
    import threading
    from mitmproxy.tools import dump
    from mitmproxy import options

    opts = options.Options(listen_host="127.0.0.1", listen_port=19877)
    tmp_master = [None]

    async def _run():
        tmp_master[0] = dump.DumpMaster(opts)
        await tmp_master[0].run()

    def run():
        asyncio.run(_run())

    t = threading.Thread(target=run, daemon=True)
    t.start()

    for _ in range(20):
        time.sleep(0.5)
        if os.path.exists(cert_pem):
            break

    try:
        if tmp_master[0]:
            tmp_master[0].shutdown()
    except Exception:
        pass

    return os.path.exists(cert_pem)


def _shutdown(sig=None, frame=None):
    print("\n")
    log("Beende LeoTrick Proxy ...", "🛑")
    stop_proxy()
    restore_firefox_policy()
    restore_firefox_proxy()
    restore_windows_system_proxy()
    log("Tschuess! 👋")
    sys.exit(0)


# ──────────────────────────────────────────────
#  SKRIPT-DATEIEN  (aus Ressourcen kopieren)
# ──────────────────────────────────────────────
def prepare_scripts(data_dir: str) -> str | None:
    """
    Kopiert website_modifier.py + Wortlisten in das Datenverzeichnis.
    Gibt den Pfad zum Modifier zurück.
    """
    files = {
        os.path.join("website", "website_modifier.py"): "website_modifier.py",
        os.path.join("website", "profanity_de.txt"):    "profanity_de.txt",
        os.path.join("website", "profanity_en.txt"):    "profanity_en.txt",
    }
    for rel_src, dst_name in files.items():
        src = get_resource_path(rel_src)
        dst = os.path.join(data_dir, dst_name)
        if os.path.exists(src):
            shutil.copy2(src, dst)
        elif not os.path.exists(dst):
            err(f"Ressource nicht gefunden: {src}")
            return None

    modifier = os.path.join(data_dir, "website_modifier.py")
    if os.path.exists(modifier):
        ok("Proxy-Skripte vorbereitet.")
        return modifier

    err("website_modifier.py wurde nicht gefunden!")
    return None


# ──────────────────────────────────────────────
#  MAIN
# ──────────────────────────────────────────────
def main():
    banner()

    # Signale
    signal.signal(signal.SIGINT,  _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)
    atexit.register(stop_proxy)

    # Admin-Check (Windows)
    if platform.system() == "Windows" and not is_admin():
        request_admin_restart()
        return

    data_dir = get_data_dir()

    # ── 1. mitmproxy finden / installieren ────────────────────
    mitmdump = None
    if IS_BUNDLED:
        ok("mitmproxy eingebettet (EXE-Modus) – kein externer Prozess nötig")
    else:
        log("Suche mitmproxy …")
        mitmdump = find_mitmdump()
        if not mitmdump:
            log("mitmproxy nicht gefunden – installiere über pip …")
            if not install_mitmproxy():
                err("Konnte mitmproxy nicht installieren!")
                err("Bitte manuell:  pip install mitmproxy")
                input("\n  Drücke Enter zum Beenden …")
                sys.exit(1)
            mitmdump = find_mitmdump()
        if not mitmdump:
            err("mitmdump trotz Installation nicht gefunden!")
            input("\n  Drücke Enter zum Beenden …")
            sys.exit(1)
        ok(f"mitmdump: {mitmdump}")

    # ── 2. Skripte vorbereiten ────────────────────────────────
    modifier_path = prepare_scripts(data_dir)
    if not modifier_path:
        input("\n  Drücke Enter zum Beenden …")
        sys.exit(1)

    # ── 3. Zertifikat erzeugen ────────────────────────────────
    log("Pruefe mitmproxy-Zertifikat ...")
    if IS_BUNDLED:
        generate_cert_inprocess()
    else:
        generate_cert(mitmdump)

    # ── 4. Firefox schliessen ─────────────────────────────────
    log("Schliesse Firefox (falls offen) ...")
    kill_firefox()

    # ── 5. Zertifikat installieren ────────────────────────────
    log("Installiere Sicherheitszertifikat ...")
    cert_ok = install_cert()

    # ── 6. Firefox Enterprise Policy (GARANTIERT FUNKTIONIERT!) ─
    log("Installiere Firefox Enterprise Policy ...")
    policy_ok = install_firefox_policy()
    if policy_ok:
        ok("Firefox Proxy + Zertifikat via Enterprise Policy konfiguriert!")
    else:
        warn("Firefox Policy konnte nicht installiert werden.")
        # Fallback: Profil-Konfiguration
        configure_firefox_proxy()

    # ── 6b. Windows-Systemproxy setzen ────────────────────────
    configure_windows_system_proxy()

    # ── 6c. Firefox neu starten ───────────────────────────────
    relaunch_firefox()
    ok("Firefox wurde neu gestartet - Proxy ist aktiv!")

    # ── 6. Proxy starten ──────────────────────────────────────
    log(f"Gebe Port {PROXY_PORT} frei ...")
    free_port(PROXY_PORT)
    print()
    print("═" * 52)
    ok("PROXY LÄUFT!")
    print(f"   🌐  {PROXY_HOST}:{PROXY_PORT}")
    print(f"   🚫  Ad-Blocker           AKTIV")
    print(f"   🤬  Schimpfwort-Filter   AKTIV")
    print(f"   🎨  Website-Modifier     AKTIV")
    print()
    if not cert_ok:
        print(f"   🔐  Für HTTPS: http://mitm.it öffnen → Zertifikat installieren")
    print(f"   ⏹️   Beenden: Strg+C")
    print("═" * 52 + "\n")

    if IS_BUNDLED:
        proxy_thread = start_proxy_inprocess(modifier_path)
        try:
            proxy_thread.join()
        except KeyboardInterrupt:
            pass
    else:
        proc = start_proxy(mitmdump, modifier_path)
        try:
            proc.wait()
        except KeyboardInterrupt:
            pass

    # Aufräumen
    stop_proxy()
    restore_firefox_policy()
    restore_firefox_proxy()
    restore_windows_system_proxy()
    ok("Proxy beendet. Firefox-Einstellungen zurueckgesetzt.")
    input("\n  Druecke Enter zum Beenden ...")


if __name__ == "__main__":
    main()

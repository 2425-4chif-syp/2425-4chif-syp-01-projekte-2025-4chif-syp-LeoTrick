@echo off
title LeoTrick Proxy - EXE Builder

echo.
echo  ================================================
echo   LeoTrick Proxy - EXE Builder
echo  ================================================
echo.

:: Python pruefen
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [FEHLER] Python nicht gefunden!
    echo.
    echo  Bitte Python 3.10+ von https://python.org installieren.
    echo  Beim Setup UNBEDINGT ankreuzen: Add Python to PATH
    echo.
    pause
    exit /b 1
)

echo  [OK] Python gefunden:
python --version
echo.

:: Pfade setzen
set "LAUNCHER_DIR=%~dp0"

:: 1. Suche Dateien im gleichen Ordner wie dieses Bat-Script
set "MODIFIER=%LAUNCHER_DIR%website_modifier.py"
set "PFILE_DE=%LAUNCHER_DIR%profanity_de.txt"
set "PFILE_EN=%LAUNCHER_DIR%profanity_en.txt"

:: 2. Falls nicht dort, versuche relativen Pfad (bei vollstaendiger Git-Struktur)
if not exist "%MODIFIER%" (
    set "PROXY_SRC=%LAUNCHER_DIR%..\bridgebase-protocol\src\website"
    set "MODIFIER=%LAUNCHER_DIR%..\bridgebase-protocol\src\website\website_modifier.py"
    set "PFILE_DE=%LAUNCHER_DIR%..\bridgebase-protocol\src\website\profanity_de.txt"
    set "PFILE_EN=%LAUNCHER_DIR%..\bridgebase-protocol\src\website\profanity_en.txt"
)

:: 3. Immer noch nicht gefunden -> Fehler mit Anleitung
if not exist "%MODIFIER%" (
    echo.
    echo  [FEHLER] website_modifier.py nicht gefunden!
    echo.
    echo  Bitte folgende Dateien in DENSELBEN Ordner legen wie dieses Bat-Script:
    echo.
    echo    website_modifier.py
    echo    profanity_de.txt
    echo    profanity_en.txt
    echo    launcher.py
    echo.
    echo  Diese Dateien findest du im Ordner:
    echo    bridgebase-protocol\src\website\
    echo.
    pause
    exit /b 1
)

:: Abhaengigkeiten installieren
echo  Installiere pyinstaller und mitmproxy ...
python -m pip install --upgrade pyinstaller mitmproxy
if %errorlevel% neq 0 (
    echo  [FEHLER] pip install fehlgeschlagen!
    pause
    exit /b 1
)
echo  [OK] Abhaengigkeiten bereit.
echo.

:: Alten Build loeschen
if exist "%LAUNCHER_DIR%dist\LeoTrickProxy.exe" del /q "%LAUNCHER_DIR%dist\LeoTrickProxy.exe"
if exist "%LAUNCHER_DIR%build" rmdir /s /q "%LAUNCHER_DIR%build"
if exist "%LAUNCHER_DIR%LeoTrickProxy.spec" del /q "%LAUNCHER_DIR%LeoTrickProxy.spec"

:: EXE bauen
echo  Erstelle EXE (bitte warten, ca. 2-5 Minuten) ...
echo.

cd /d "%LAUNCHER_DIR%"

pyinstaller --onefile --name LeoTrickProxy --console --collect-all mitmproxy --collect-all cryptography --collect-all OpenSSL --hidden-import mitmproxy.addons --hidden-import mitmproxy.proxy.layers --hidden-import mitmproxy.proxy.layers.http --hidden-import mitmproxy.proxy.layers.tls "--add-data=%MODIFIER%;website" "--add-data=%PFILE_DE%;website" "--add-data=%PFILE_EN%;website" launcher.py
if %errorlevel% neq 0 (
    python -m PyInstaller --onefile --name LeoTrickProxy --console --collect-all mitmproxy --collect-all cryptography --collect-all OpenSSL --hidden-import mitmproxy.addons --hidden-import mitmproxy.proxy.layers --hidden-import mitmproxy.proxy.layers.http --hidden-import mitmproxy.proxy.layers.tls "--add-data=%MODIFIER%;website" "--add-data=%PFILE_DE%;website" "--add-data=%PFILE_EN%;website" launcher.py
)

:: Ergebnis
echo.
echo  ================================================
if exist "%LAUNCHER_DIR%dist\LeoTrickProxy.exe" (
    echo  [ERFOLG] EXE erfolgreich erstellt!
    echo.
    echo  Pfad: %LAUNCHER_DIR%dist\LeoTrickProxy.exe
    echo.
    echo  EXE auf Ziel-PC kopieren und als Administrator starten.
    echo  Firefox danach neu starten.
) else (
    echo  [FEHLER] EXE konnte nicht erstellt werden.
    echo  Siehe Ausgabe oben fuer Details.
)
echo  ================================================
echo.
pause

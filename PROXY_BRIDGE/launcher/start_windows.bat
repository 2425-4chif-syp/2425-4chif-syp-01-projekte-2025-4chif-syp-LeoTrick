@echo off
title LeoTrick Proxy

echo.
echo  ================================================
echo   LeoTrick Proxy - Ad-Blocker + Website-Modifier
echo  ================================================
echo.

:: ──────────────────────────────────────────────
::  Admin-Rechte  (für Zertifikats-Installation)
:: ──────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  Admin-Rechte erforderlich - starte neu als Administrator ...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: ──────────────────────────────────────────────
::  Python prüfen / installieren
:: ──────────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  Python nicht gefunden - versuche Installation via winget ...
    winget install Python.Python.3.11 --silent --accept-package-agreements
    if %errorlevel% neq 0 (
        echo.
        echo  [FEHLER] Python konnte nicht automatisch installiert werden.
        echo  Bitte manuell installieren: https://python.org
        echo  Beim Setup: "Add Python to PATH" ankreuzen!
        pause
        exit /b 1
    )
    :: PATH neu laden
    refreshenv >nul 2>&1
    set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Python\Python311\;%LOCALAPPDATA%\Programs\Python\Python311\Scripts\"
)

echo  [OK] Python vorhanden.

:: ──────────────────────────────────────────────
::  mitmproxy installieren (falls nicht vorhanden)
:: ──────────────────────────────────────────────
where mitmdump >nul 2>&1
if %errorlevel% neq 0 (
    echo  Installiere mitmproxy (einmalig, ~1-2 Minuten) ...
    python -m pip install mitmproxy
    if %errorlevel% neq 0 (
        echo  [FEHLER] mitmproxy konnte nicht installiert werden!
        pause
        exit /b 1
    )
    echo  [OK] mitmproxy installiert.
)

:: ──────────────────────────────────────────────
::  Launcher starten
:: ──────────────────────────────────────────────
echo.
echo  Starte LeoTrick Proxy Launcher ...
echo.

set "LAUNCHER_DIR=%~dp0"
python "%LAUNCHER_DIR%launcher.py"

echo.
echo  Proxy beendet.
pause

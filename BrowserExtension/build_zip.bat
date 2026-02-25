@echo off
title Leo-Extension - Firefox Extension ZIP Builder

echo.
echo  ================================================
echo   Leo-Extension - Firefox Extension ZIP Builder
echo  ================================================
echo.

set "EXT_DIR=%~dp0"
set "ZIP_NAME=Leo-Extension.zip"
set "ZIP_PATH=%EXT_DIR%%ZIP_NAME%"

:: Pruefen ob alle noetigen Dateien da sind
set "MISSING=0"

if not exist "%EXT_DIR%manifest.json" (
    echo  [FEHLER] manifest.json fehlt!
    set "MISSING=1"
)
if not exist "%EXT_DIR%background.js" (
    echo  [FEHLER] background.js fehlt!
    set "MISSING=1"
)
if not exist "%EXT_DIR%popup.html" (
    echo  [FEHLER] popup.html fehlt!
    set "MISSING=1"
)
if not exist "%EXT_DIR%popup.js" (
    echo  [FEHLER] popup.js fehlt!
    set "MISSING=1"
)
if not exist "%EXT_DIR%icon48.png" (
    echo  [WARNUNG] icon48.png fehlt! Mozilla verlangt Icons.
    echo            Bitte 48x48px Icon erstellen und als icon48.png speichern.
    echo.
)
if not exist "%EXT_DIR%icon96.png" (
    echo  [WARNUNG] icon96.png fehlt! Mozilla verlangt Icons.
    echo            Bitte 96x96px Icon erstellen und als icon96.png speichern.
    echo.
)
if not exist "%EXT_DIR%content\main.js" (
    echo  [FEHLER] content/main.js fehlt!
    set "MISSING=1"
)

if "%MISSING%"=="1" (
    echo.
    echo  Bitte fehlende Dateien ergaenzen und erneut starten.
    pause
    exit /b 1
)

:: Alte ZIP loeschen
if exist "%ZIP_PATH%" del /q "%ZIP_PATH%"

echo  Erstelle %ZIP_NAME% ...
echo.

:: ZIP mit .NET ZipFile API erstellen (korrekte Forward Slashes fuer AMO!)
powershell -NoProfile -Command ^
  "Add-Type -AssemblyName System.IO.Compression;" ^
  "Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
  "$extDir = '%EXT_DIR%'.TrimEnd('\');" ^
  "$zipPath = '%ZIP_PATH%';" ^
  "" ^
  "$rootFiles = @(" ^
  "  'manifest.json'," ^
  "  'background.js'," ^
  "  'popup.html'," ^
  "  'popup.js'," ^
  "  'enforce-font.css'," ^
  "  'profanity-hide.css'," ^
  "  'profanity_de.txt'," ^
  "  'profanity_en.txt'," ^
  "  'icon48.png'," ^
  "  'icon96.png'," ^
  "  'icon128.png'" ^
  ");" ^
  "" ^
  "$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create');" ^
  "" ^
  "foreach ($f in $rootFiles) {" ^
  "  $src = Join-Path $extDir $f;" ^
  "  if (Test-Path $src) {" ^
  "    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $src, $f) | Out-Null;" ^
  "    Write-Host ('  + ' + $f)" ^
  "  }" ^
  "};" ^
  "" ^
  "$contentDir = Join-Path $extDir 'content';" ^
  "if (Test-Path $contentDir) {" ^
  "  Get-ChildItem $contentDir -Filter '*.js' | Where-Object { $_.Name -ne 'adblocker.js' } | ForEach-Object {" ^
  "    $entryName = 'content/' + $_.Name;" ^
  "    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName) | Out-Null;" ^
  "    Write-Host ('  + ' + $entryName)" ^
  "  }" ^
  "};" ^
  "" ^
  "$zip.Dispose();" ^
  "" ^
  "if (Test-Path $zipPath) {" ^
  "  Write-Host '';" ^
  "  Write-Host ('  [OK] ZIP erstellt: ' + $zipPath)" ^
  "} else {" ^
  "  Write-Host '  [FEHLER] ZIP konnte nicht erstellt werden!'" ^
  "}"

echo.
echo  ================================================
if exist "%ZIP_PATH%" (
    echo  [ERFOLG] %ZIP_NAME% erstellt!
    echo.
    echo  Naechste Schritte:
    echo    1. https://addons.mozilla.org/de/developers/ oeffnen
    echo    2. "Submit a New Add-on" klicken
    echo    3. %ZIP_NAME% hochladen
    echo    4. Store-Infos ausfuellen (Name, Beschreibung, Screenshots)
    echo    5. Privacy Policy Link angeben (PRIVACY.md auf GitHub)
) else (
    echo  [FEHLER] ZIP konnte nicht erstellt werden!
)
echo  ================================================
echo.
pause

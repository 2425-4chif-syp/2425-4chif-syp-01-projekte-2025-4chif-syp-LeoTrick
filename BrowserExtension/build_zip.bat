@echo off
title LeoTrick - Firefox Extension ZIP Builder

echo.
echo  ================================================
echo   LeoTrick - Firefox Extension ZIP Builder
echo  ================================================
echo.

set "EXT_DIR=%~dp0"
set "ZIP_NAME=LeoTrick-Extension.zip"
set "ZIP_PATH=%EXT_DIR%%ZIP_NAME%"

:: Pruefen ob alle nötigen Dateien da sind
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

:: ZIP mit PowerShell erstellen (ohne generate_css.py und Build-Dateien)
powershell -NoProfile -Command ^
  "$extDir = '%EXT_DIR%'.TrimEnd('\');" ^
  "$zipPath = '%ZIP_PATH%';" ^
  "$tempDir = Join-Path $env:TEMP 'leotrick_zip_build';" ^
  "if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force };" ^
  "New-Item $tempDir -ItemType Directory | Out-Null;" ^
  "" ^
  "$filesToInclude = @(" ^
  "  'manifest.json'," ^
  "  'background.js'," ^
  "  'popup.html'," ^
  "  'popup.js'," ^
  "  'enforce-font.css'," ^
  "  'profanity-hide.css'," ^
  "  'profanity_de.txt'," ^
  "  'profanity_en.txt'" ^
  ");" ^
  "" ^
  "$optionalFiles = @('icon48.png', 'icon96.png', 'icon128.png');" ^
  "" ^
  "foreach ($f in $filesToInclude) {" ^
  "  $src = Join-Path $extDir $f;" ^
  "  if (Test-Path $src) { Copy-Item $src (Join-Path $tempDir $f) }" ^
  "};" ^
  "" ^
  "foreach ($f in $optionalFiles) {" ^
  "  $src = Join-Path $extDir $f;" ^
  "  if (Test-Path $src) { Copy-Item $src (Join-Path $tempDir $f) }" ^
  "};" ^
  "" ^
  "$contentSrc = Join-Path $extDir 'content';" ^
  "$contentDst = Join-Path $tempDir 'content';" ^
  "if (Test-Path $contentSrc) {" ^
  "  New-Item $contentDst -ItemType Directory | Out-Null;" ^
  "  Get-ChildItem $contentSrc -Filter '*.js' | ForEach-Object { Copy-Item $_.FullName $contentDst }" ^
  "};" ^
  "" ^
  "Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $zipPath -Force;" ^
  "Remove-Item $tempDir -Recurse -Force;" ^
  "" ^
  "if (Test-Path $zipPath) {" ^
  "  Write-Host ('  [OK] ZIP erstellt: ' + $zipPath);" ^
  "  Write-Host '';" ^
  "  Write-Host '  Inhalt:';" ^
  "  Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
  "  $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath);" ^
  "  $zip.Entries | ForEach-Object { Write-Host ('    ' + $_.FullName) };" ^
  "  $zip.Dispose()" ^
  "} else {" ^
  "  Write-Host '  [FEHLER] ZIP konnte nicht erstellt werden!'" ^
  "}"

echo.
echo  ================================================
if exist "%EXT_DIR%LeoTrick-Extension.zip" (
    echo  [ERFOLG] LeoTrick-Extension.zip erstellt!
    echo.
    echo  Naechste Schritte:
    echo    1. https://addons.mozilla.org/de/developers/ oeffnen
    echo    2. "Submit a New Add-on" klicken
    echo    3. LeoTrick-Extension.zip hochladen
    echo    4. Store-Infos ausfuellen (Name, Beschreibung, Screenshots)
    echo    5. Privacy Policy Link angeben (PRIVACY.md auf GitHub)
) else (
    echo  [FEHLER] ZIP konnte nicht erstellt werden!
)
echo  ================================================
echo.
pause

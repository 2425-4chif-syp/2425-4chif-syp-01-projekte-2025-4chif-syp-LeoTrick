# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all

datas = [('C:\\Schule\\SYP\\2425-4chif-syp-01-projekte-2025-4chif-syp-LeoTrick\\PROXY_BRIDGE\\launcher\\website_modifier.py', 'website'), ('C:\\Schule\\SYP\\2425-4chif-syp-01-projekte-2025-4chif-syp-LeoTrick\\PROXY_BRIDGE\\launcher\\profanity_de.txt', 'website'), ('C:\\Schule\\SYP\\2425-4chif-syp-01-projekte-2025-4chif-syp-LeoTrick\\PROXY_BRIDGE\\launcher\\profanity_en.txt', 'website')]
binaries = []
hiddenimports = ['mitmproxy.addons', 'mitmproxy.proxy.layers', 'mitmproxy.proxy.layers.http', 'mitmproxy.proxy.layers.tls']
tmp_ret = collect_all('mitmproxy')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]
tmp_ret = collect_all('cryptography')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]
tmp_ret = collect_all('OpenSSL')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]


a = Analysis(
    ['launcher.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='LeoTrickProxy',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

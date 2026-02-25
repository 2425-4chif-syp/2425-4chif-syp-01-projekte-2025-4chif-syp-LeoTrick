#!/usr/bin/env python3
"""Generate profanity-hide.css from word lists."""
import os

words = set()
for f in ['profanity_de.txt', 'profanity_en.txt']:
    if os.path.exists(f):
        for line in open(f, encoding='utf-8'):
            w = line.strip()
            if len(w) >= 2 and ' ' not in w:
                words.add(w.lower())

words.add('trump')
words.add('edwards')
print(f'Total unique words: {len(words)}')

attrs = ['data-lpage', 'data-docid', 'data-ref-docid', 'data-attrid', 'data-ipage']
img_attrs = ['src', 'data-src', 'alt', 'title']
HIDE = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;'

lines = []
lines.append('/* Auto-generated profanity image filter CSS */')
lines.append('/* Loaded via manifest.json - bypasses CSP completely */')
lines.append('')
lines.append('[data-mf-hidden]{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;clip:rect(0,0,0,0)!important;}')
lines.append('')

for word in sorted(words):
    escaped = word.replace('"', '\\"')
    for attr in attrs:
        sel = f'[{attr}*="{escaped}" i]'
        lines.append(f'{sel}{{{HIDE}}}')
        lines.append(f'div:has(> {sel}){{{HIDE}}}')
        lines.append(f'div:has(> div > {sel}){{{HIDE}}}')
        lines.append(f'div:has(> div > div > {sel}){{{HIDE}}}')
    for attr in img_attrs:
        lines.append(f'img[{attr}*="{escaped}" i]{{{HIDE}}}')
    lines.append(f'a[href*="{escaped}" i]{{{HIDE}}}')
    lines.append('')

css = '\n'.join(lines)
with open('profanity-hide.css', 'w', encoding='utf-8') as f:
    f.write(css)
print(f'Generated profanity-hide.css: {len(css)} bytes, {len(lines)} lines')

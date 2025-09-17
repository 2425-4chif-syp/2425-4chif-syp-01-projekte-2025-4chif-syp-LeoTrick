from mitmproxy import http
import re
import json
import time
import os

# Debug-Logging aktivieren
DEBUG = True
debug_log_file = 'debug_log.txt'

def log_debug(message):
    if DEBUG:
        with open(debug_log_file, 'a', encoding='utf-8') as f:
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            f.write(f"[{timestamp}] {message}\n")

# Beim Start eine Markierung im Debug-Log setzen
log_debug("=== Script started ===")

# Reihenfolge der Spieler im Uhrzeigersinn
players = ['North', 'East', 'South', 'West']

# Aktueller Kartenbestand und bereits gespielte Karten
hands  = {p: [] for p in players}
played = {p: [] for p in players}

# Stich-Tracking
tricks               = []  # abgeschlossene Stiche
current_trick_cards  = []
current_trick_leader = None

# History aus dem h-Attribut
prev_actions = []

# Sortierreihenfolge und Symbole
suit_order   = ['S', 'H', 'C', 'D']
suit_symbols = {'S': '♠', 'H': '♥', 'C': '♣', 'D': '♦'}


def split_and_format_raw(raw: str):
    """ PBN → ['S8','S7',…] """
    result, suit = [], ''
    for ch in raw:
        if ch in suit_order:
            suit = ch
        else:
            result.append(suit + ch)
    return result


def format_for_log(code: str) -> str:
    """ 'ST' → '♠T', 'HJ' → '♥J' """
    sym = suit_symbols.get(code[0], code[0])
    r   = code[1]
    return f"{sym}{r}"


def write_output():
    """ Stich-Verlauf + Spielerstatus mit sauberen Spalten """
    import os
    import time
    
    # Use proper path structure
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(script_dir, "..", "..")
    output_file = os.path.join(project_root, "data", "output.txt")
    temp_file = os.path.join(project_root, "data", "output.tmp")
    
    with open(temp_file, 'w', encoding='utf-8') as f:
        # --- Spielverlauf ---
        f.write("----- Spielverlauf -----\n")
        if tricks:
            for i, t in enumerate(tricks, start=1):
                cards = "-".join(format_for_log(c) for c in t['cards'])
                f.write(f"{i}. {t['leader']}: {cards}\n")
        else:
            f.write("noch keine Stiche\n")
        f.write("\n")

        # --- Spielerstatus ---
        f.write("----- Spielerstatus -----\n\n")

        # Felder sammeln
        played_matrix = []
        rem_matrix    = []
        for p in players:
            p_row, r_row = [], []
            for s in suit_order:
                # gespielt
                pr = [c[1] for c in played[p] if c[0] == s]
                p_row.append(suit_symbols[s] + ''.join(pr))
                # verbleibend
                rr = [c[1] for c in hands[p] if c[0] == s and c not in played[p]]
                r_row.append(suit_symbols[s] + ''.join(rr))
            played_matrix.append(p_row)
            rem_matrix.append(r_row)

        # Ausgabe je Spieler (ohne unnötige Abstände)
        for idx, p in enumerate(players):
            f.write(f"{p}:\n\n")
            # Gespielt-Zeile
            played_fields = [field.strip() for field in played_matrix[idx]]
            f.write("Gespielt: " + " | ".join(played_fields) + "\n")
            # Verbleibend-Zeile
            rem_fields = [field.strip() for field in rem_matrix[idx]]
            f.write("Verbleibend: " + " | ".join(rem_fields) + "\n\n")
        
        # Zeitstempel für VS Code File Watcher
        f.write(f"\n<!-- Last updated: {time.time()} -->\n")
    
    # Atomic move um VS Code File Watcher zu triggern
    if os.path.exists(output_file):
        os.remove(output_file)
    os.rename(temp_file, output_file)
    
    # Zusätzlicher Trigger für VS Code
    os.utime(output_file, None)


def get_owner(card: str) -> str:
    """ Spieler finden, dem die Karte gehört """
    for p in players:
        if card in hands[p]:
            return p
    return None


def response(flow: http.HTTPFlow) -> None:
    global prev_actions, current_trick_cards, current_trick_leader, tricks

    # Log basic request information
    if DEBUG:
        host = flow.request.host
        path = flow.request.path
        method = flow.request.method
        if 'bridgebase' in host or 'bbo' in host:
            log_debug(f"Request: {method} {host}{path}")

    try:
        body = flow.response.get_text()
        
        # Log responses from BBO
        if DEBUG and ('bridgebase' in flow.request.host or 'bbo' in flow.request.host):
            preview = body[:200] + "..." if len(body) > 200 else body
            log_debug(f"Response from {flow.request.host}: {preview}")
            
            # Save full response to a separate file if it contains interesting patterns
            if '<sc_deal' in body or '<sc_bm' in body or 'deal=' in body or '"deal":' in body:
                with open(f"bbo_response_{int(time.time())}.txt", "w", encoding="utf-8") as f:
                    f.write(body)
                log_debug(f"Full response saved to bbo_response_{int(time.time())}.txt")
    except Exception as e:
        log_debug(f"Error getting response text: {str(e)}")
        return

    # Try to detect if response is JSON
    try:
        if body.strip().startswith('{') and body.strip().endswith('}'):
            json_data = json.loads(body)
            log_debug(f"JSON detected: {json.dumps(json_data)[:200]}...")
            
            # Check for deal information in JSON format
            if 'deal' in json_data:
                log_debug("JSON contains deal information")
                # Add JSON parsing logic here if needed
    except Exception as e:
        # Not JSON or invalid JSON
        pass

    # 1) Neue Verteilung - Original-Format
    if '<sc_deal ' in body:
        log_debug("Found <sc_deal> tag in response")
        m = re.search(r'<sc_deal ([^/>]*)/>', body)
        if not m:
            log_debug("Could not extract sc_deal attributes")
            return
        tag = m.group(1)
        log_debug(f"Found deal tag: {tag}")
        for d in ('north', 'east', 'south', 'west'):
            mm = re.search(fr'{d}="([^"]+)"', tag)
            if mm:
                hands[d.capitalize()] = split_and_format_raw(mm.group(1))
                played[d.capitalize()] = []
                log_debug(f"Extracted {d} hand: {mm.group(1)}")
        tricks, current_trick_cards, current_trick_leader = [], [], None
        prev_actions = []
        write_output()
        return

    # Alternative Format für die Verteilung
    deal_pattern = r'deal="([^"]+)"'
    deal_match = re.search(deal_pattern, body)
    if deal_match:
        log_debug("Found alternative deal format")
        # Handle alternative format if needed
        # Implementation would depend on the format

    # 2) Board-Manager - Original Format
    if '<sc_bm ' in body:
        log_debug("Found <sc_bm> tag in response")
        mh = re.search(r'h="([^"]+)"', body)
        if not mh:
            log_debug("Could not extract h attribute from sc_bm")
            return
        acts = mh.group(1).split('-')
        log_debug(f"Actions: {acts}")
        new  = acts[len(prev_actions):]
        prev_actions = acts

        for act in new:
            log_debug(f"Processing action: {act}")
            if re.match(r'^[SHDC][2-9TJQKA]$', act):
                owner = get_owner(act)
                log_debug(f"Card {act} belongs to {owner}")
                if not owner:
                    continue
                if not current_trick_cards:
                    current_trick_leader = owner
                current_trick_cards.append(act)
                played[owner].append(act)
                if len(current_trick_cards) == 4:
                    tricks.append({
                        'leader': current_trick_leader,
                        'cards':  current_trick_cards.copy()
                    })
                    current_trick_cards, current_trick_leader = [], None

        write_output()

from mitmproxy import http
import re

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
    with open('output.txt', 'w', encoding='utf-8') as f:
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


def get_owner(card: str) -> str:
    """ Spieler finden, dem die Karte gehört """
    for p in players:
        if card in hands[p]:
            return p
    return None


def response(flow: http.HTTPFlow) -> None:
    global prev_actions, current_trick_cards, current_trick_leader, tricks

    try:
        body = flow.response.get_text()
    except:
        return

    # 1) Neue Verteilung
    if '<sc_deal ' in body:
        m = re.search(r'<sc_deal ([^/>]*)/>', body)
        if not m:
            return
        tag = m.group(1)
        for d in ('north', 'east', 'south', 'west'):
            mm = re.search(fr'{d}="([^"]+)"', tag)
            if mm:
                hands[d.capitalize()] = split_and_format_raw(mm.group(1))
                played[d.capitalize()] = []
        tricks, current_trick_cards, current_trick_leader = [], [], None
        prev_actions = []
        write_output()
        return

    # 2) Board-Manager
    if '<sc_bm ' in body:
        mh = re.search(r'h="([^"]+)"', body)
        if not mh:
            return
        acts = mh.group(1).split('-')
        new  = acts[len(prev_actions):]
        prev_actions = acts

        for act in new:
            if re.match(r'^[SHDC][2-9TJQKA]$', act):
                owner = get_owner(act)
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

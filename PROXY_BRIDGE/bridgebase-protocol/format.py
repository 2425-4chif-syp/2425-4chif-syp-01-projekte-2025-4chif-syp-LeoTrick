import re
import urllib.parse
import json

# Für die Konvertierung ins englische Format
suit_names = {'S': 'Spades', 'H': 'Hearts', 'D': 'Diamonds', 'C': 'Clubs'}
rank_names = {
    'T': '10', 'J': 'Jack', 'Q': 'Queen',
    'K': 'King', 'A': 'Ace'
}

def format_card(card: str) -> str:
    """
    Wandelt z.B. "ST" in "10 of Spades", "HJ" in "Jack of Hearts" um.
    """
    if len(card) != 2:
        return card
    s, r = card[0], card[1]
    suit = suit_names.get(s)
    rank = rank_names.get(r, r)
    if not suit:
        return card
    return f"{rank} of {suit}"

def format_direction(letter: str) -> str:
    """
    N → North, E → East, S → South, W → West
    """
    return {'N':'North','E':'East','S':'South','W':'West'}.get(letter, letter)

def format_played(s: str):
    """
    Parst einen URL-Parameter actions=... und gibt eine Liste
    lesbarer Kartennamen zurück.
    """
    m = re.search(r'actions=([^&]+)', s)
    if not m:
        return []
    decoded = urllib.parse.unquote(m.group(1))
    data = json.loads(decoded)
    return [format_card(item['c']) for item in data]

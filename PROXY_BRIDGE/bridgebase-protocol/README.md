# 🃏 Bridge Base Online Proxy & Website Modifier

Professional proxy tools for Bridge Base Online monitoring and website content modification.

## 🚀 Features

### Bridge Monitoring
- **Real-time card tracking** from Bridge Base Online
- **Live VS Code integration** with auto-refresh
- **Professional logging** with structured output
- **Game state visualization** with suit symbols

### Website Modification  
- **Dynamic text replacement** on websites
- **CSS injection** for visual modifications
- **Real-time content transformation** via proxy

## 📁 Project Structure

```
bridgebase-protocol/
├── src/
│   ├── bridge/
│   │   └── interpret_log.py      # Bridge card monitoring
│   └── website/
│       └── website_modifier.py   # Website content modifier
├── scripts/
│   ├── start_bridge.sh          # Start bridge monitoring
│   ├── start_website.sh         # Start website modifier
│   └── vscode_refresh.sh        # VS Code integration
├── data/
│   └── output.txt               # Bridge game data
├── docs/
│   └── readme-images/           # Documentation images
├── config/
└── README.md
```

## 🛠️ Setup

### Prerequisites
- macOS with Python 3.9+
- mitmproxy installed: `/Users/luka/Library/Python/3.9/bin/mitmproxy`
- Firefox browser
- VS Code (optional, for live updates)

### Installation
1. Clone this repository
2. Make scripts executable: `chmod +x scripts/*.sh`
3. Configure Firefox proxy: `localhost:8081`

## 🎯 Usage

### Bridge Monitoring
```bash
./scripts/start_bridge.sh
```
- Visit http://www.bridgebase.com
- Play bridge games
- View live data in `data/output.txt`

### Website Modification
```bash
./scripts/start_website.sh
```
- Visit https://www.htl-leonding.at
- See real-time text and CSS modifications

## 🔧 Configuration

### Bridge Monitoring
Edit `src/bridge/interpret_log.py` to customize:
- Card display format
- Output structure
- Debug logging

### Website Modifications
Edit `src/website/website_modifier.py` to customize:
- Text replacements
- CSS styling
- Target websites

## 📊 Output Format

Bridge monitoring creates structured output:
```
----- Spielverlauf -----
Stich 1: North: ♠K, East: ♠A, South: ♠Q, West: ♠J

----- Spielerstatus -----
North:
Gespielt: ♠K | ♥ | ♣ | ♦
Verbleibend: ♠AQJ1098765432 | ♥AKQJ1098765432 | ...
```

## 🔧 Technical Details

- **Proxy Port**: 8081
- **SSL**: Handled automatically
- **File Watching**: VS Code integration with `os.utime()`
- **Error Handling**: Graceful degradation
- **Cross-Platform**: macOS optimized

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes in appropriate `src/` directory
4. Test with relevant start script
5. Submit pull request

## 📝 License

MIT License - Feel free to use and modify.

---

**Author**: Your Name  
**Version**: 1.0  
**Last Updated**: September 2025
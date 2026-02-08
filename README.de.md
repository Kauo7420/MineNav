# PluginMarket - Minecraft Plugin-Navigationsplattform

Eine moderne und funktionsreiche Minecraft Plugin-Navigationswebseite, die Plugin-Ressourcen von **Modrinth** und **SpigotMC** aggregiert.

## ✨ Funktionen

### Kernfunktionen
- 🔍 **Plattformübergreifende Suche** - Durchsuchen Sie Plugins von Modrinth und SpigotMC gleichzeitig
- 🎯 **Intelligente Kategorisierung** - Filtern Sie nach mehreren Dimensionen: Administration, Gameplay, Welt, Wirtschaft und mehr
- 📊 **Echtzeit-Statistiken** - Zeigen Sie Plattformstatistiken und Download-Zahlen an
- 🔄 **Flexible Sortierung** - Sortieren Sie nach Downloads, neuesten Releases, Aktualisierungszeit und mehr
- 📱 **Responsive Design** - Perfekte Anpassung für Desktop, Tablet und Mobilgeräte

### UI/UX
- 🌓 **Dunkel-/Helldesign** - Systemeinstellung automatisch erkennen mit manueller Umschaltoption
- ⌨️ **Tastaturkürzel** - Drücken Sie `/`, um die Suche schnell zu öffnen
- ✨ **Sanfte Animationen** - Seitenladung, Kartenschwebeffekte, Designübergänge
- ♿ **Barrierefreiheit** - Vollständige ARIA-Beschriftungen und Tastaturnavigation
- 📐 **Modernes Design-System** - 8px-Raster, CSS-Custom-Properties und bewährte Praktiken

### Technische Highlights
- 💯 **Framework-frei** - Reines HTML5 + CSS3 + Vanilla JavaScript
- 🚀 **Hohe Leistung** - Caching-Strategie, entprellte Suche, verzögertes Laden von Bildern
- 🛡️ **API-Integration** - Vollständige Unterstützung für Modrinth und SpigotMC APIs
- 💾 **Zustandsverwaltung** - localStorage-Speicherung für Design- und Benutzereinstellungen
- 📍 **URL-Routing** - Unterstützung für freigabbare und speicherbare Seitenzustände

## 📁 Projektstruktur

```
index.html                 # Haupt-HTML-Datei
styles/
  ├── variables.css       # CSS-Variablen und Design-System
  ├── base.css            # Grundstile und Typografie
  ├── layout.css          # Layout-System und Gitter
  ├── components.css      # Stile für UI-Komponenten
  ├── sections.css        # Stilbereiche der Seite
  └── animations.css      # Animationen und Übergänge
scripts/
  ├── config.js           # Konfiguration und Konstanten
  ├── api.js              # API-Integration
  ├── theme.js            # Design-Management
  ├── router.js           # Routing und Zustandsverwaltung
  ├── cards.js            # Karten-Rendering
  ├── modal.js            # Modal-Verwaltung
  └── app.js              # Hauptanwendung
LICENSE                    # Lizenzdatei
README.md                  # Diese Datei
```

## 🚀 Verwendung

### Schnellstart

1. **Projekt klonen oder herunterladen**
   ```bash
   git clone <repository-url>
   cd MineNav
   ```

2. **Website öffnen**
   - Öffnen Sie `index.html` direkt in Ihrem Browser
   - Oder verwenden Sie einen lokalen Server

3. **Website besuchen**
   Genießen Sie das Durchsuchen und Suchen nach Plugins!

## 🎨 Funktionsnutzung

- **Suche**: Geben Sie Schlüsselwörter in das Suchfeld oben ein oder drücken Sie `/`, um schnell zu öffnen
- **Plattformauswahl**: Wählen Sie Alle/Modrinth/SpigotMC
- **Nach Kategorie durchsuchen**: Verwenden Sie die Kategorienavigationsleiste zum Filtern von Plugins
- **Sortierung**: Sortieren Sie nach Downloads, neuesten Releases oder letzten Aktualisierungen
- **Designon umschalten**: Klicken Sie oben rechts auf die Schaltfläche "Design", um zwischen Hell- und Dunkelmodus umzuschalten
- **Details anzeigen**: Klicken Sie auf eine Plugin-Karte, um vollständige Informationen zu sehen

## 💻 Technologie-Stack

- HTML5 - Struktur
- CSS3 - Gestaltung (Design-System mit CSS-Custom-Properties)
- Vanilla JavaScript - Funktionalität und Interaktion
- Modrinth API - Plugin-Datenquelle
- SpigotMC API - Plugin-Datenquelle
- FontAwesome - Icon-Bibliothek
- Google Fonts - Schriftartenbibliothek

## 🌐 Browser-Unterstützung

- Chrome/Chromium (Neueste)
- Firefox (Neueste)
- Safari (Neueste)
- Edge (Neueste)

## ♿ Barrierefreiheit

- Vollständige ARIA-Label-Unterstützung
- Tastaturnavigation
- High-Contrast-Modus
- Bildschirmleser-freundlich

# PluginMarket - Minecraft Plugin Navigation Platform

A modern and feature-rich Minecraft plugin navigation website that aggregates plugin resources from **Modrinth** and **SpigotMC**.

## ✨ Features

### Core Features
- 🔍 **Cross-Platform Search** - Search plugins from both Modrinth and SpigotMC simultaneously
- 🎯 **Smart Categorization** - Filter by multiple dimensions: Management, Gameplay, World, Economy, and more
- 📊 **Real-time Statistics** - Display platform statistics and download counts
- 🔄 **Flexible Sorting** - Sort by downloads, latest releases, update time, and more
- 📱 **Responsive Design** - Perfect adaptation for desktop, tablet, and mobile devices

### UI/UX
- 🌓 **Dark/Light Theme** - Automatically detect system preference with manual toggle support
- ⌨️ **Keyboard Shortcuts** - Press `/` to quickly open search
- ✨ **Smooth Animations** - Page loading, card hover effects, theme switching animations
- ♿ **Accessibility Support** - Complete ARIA labels and keyboard navigation
- 📐 **Modern Design System** - 8px grid, CSS custom properties, and modern best practices

### Technical Highlights
- 💯 **Framework-Free** - Pure HTML5 + CSS3 + Vanilla JavaScript
- 🚀 **High Performance** - Caching strategy, debounced search, lazy-loaded images
- 🛡️ **API Integration** - Complete support for Modrinth and SpigotMC APIs
- 💾 **State Persistence** - localStorage storage for theme and user preferences
- 📍 **URL Routing** - Support for shareable and bookmarkable page states

## 📁 Project Structure

```
index.html                 # Main HTML file
styles/
  ├── variables.css       # CSS variables and design system
  ├── base.css            # Base styles and typography
  ├── layout.css          # Layout system and grid
  ├── components.css      # UI component styles
  ├── sections.css        # Page section styles
  └── animations.css      # Animations and transitions
scripts/
  ├── config.js           # Configuration and constants
  ├── api.js              # API integration
  ├── theme.js            # Theme management
  ├── router.js           # Routing and state management
  ├── cards.js            # Card rendering
  ├── modal.js            # Modal management
  └── app.js              # Main application
LICENSE                    # License file
README.md                  # This file
```

## 🚀 Usage

### Quick Start

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd MineNav
   ```

2. **Open the website**
   - Open `index.html` directly in your browser
   - Or use a local server

3. **Visit the website**
   Enjoy browsing and searching for plugins!

## 🎨 Features Usage

- **Search**: Enter keywords in the search box at the top or press `/` to quickly open
- **Platform Selection**: Choose All/Modrinth/SpigotMC
- **Browse by Category**: Use the category navigation bar to filter plugins
- **Sorting**: Sort by downloads, latest releases, or recent updates
- **Theme Toggle**: Click the theme button in the top right to switch between dark/light mode
- **View Details**: Click on a plugin card to view complete information

## 💻 Technology Stack

- HTML5 - Structure
- CSS3 - Styling (Design system with CSS custom properties)
- Vanilla JavaScript - Functionality and interaction
- Modrinth API - Plugin data source
- SpigotMC API - Plugin data source
- FontAwesome - Icon library
- Google Fonts - Font library

## 🌐 Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## ♿ Accessibility

- Complete ARIA label support
- Keyboard navigation
- High contrast mode
- Screen reader friendly

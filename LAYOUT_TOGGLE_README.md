# Layout-Umschaltung: 1 Spalte / 2 Spalten

## Übersicht
Der Button "2 Spalten" / "1 Spalte" ermöglicht es, zwischen einem zweispaltigen und einem einspaltigen Dashboard-Layout zu wechseln.

## Funktionsweise

### Button-Position
Der Button befindet sich im Hero-Bereich des Dashboards, neben dem "Widgets" Button.

### Verhalten

#### 2-Spalten-Modus (Standard)
- Karten werden in einem 4-spaltigen Grid angeordnet
- Kleinere Karten (`.card-mini`) nehmen 1 Spalte ein
- Mittlere Karten (`.card-medium`) nehmen 2 Spalten ein
- Große Karten (`.card-wide`) nehmen 4 Spalten ein
- To-Do und Einkaufs-Karten stehen nebeneinander

#### 1-Spalten-Modus
- **Alle Karten werden untereinander angeordnet**
- Jede Karte nimmt die volle Breite ein
- To-Do und Einkaufs-Karten werden ebenfalls untereinander gestapelt
- Ideal für fokussiertes Arbeiten oder schmale Bildschirme

### Button-Text
- Zeigt den **aktuellen** Modus an:
  - "2 Spalten" = Aktuell im 2-Spalten-Modus
  - "1 Spalte" = Aktuell im 1-Spalten-Modus
- Klick wechselt zum jeweils anderen Modus

## Technische Details

### CSS-Klassen
```css
/* 1-Spalten-Modus aktiviert */
.dashboard-grid.single-column-mode {
    grid-template-columns: 1fr !important;
}

.dashboard-grid.single-column-mode > .card {
    grid-column: span 1 !important;
}

/* Side-by-side Container im 1-Spalten-Modus */
.dashboard-grid.single-column-mode .dashboard-grid-row-todos-shopping {
    grid-column: span 1;
    grid-template-columns: 1fr;
}
```

### JavaScript-Funktionen

#### `toggleLayoutQuick()`
Wechselt zwischen den Modi:
```javascript
toggleLayoutQuick() {
    const currentLayout = app.state.dashboardLayout || 'double';
    const newLayout = currentLayout === 'single' ? 'double' : 'single';
    
    app.state.dashboardLayout = newLayout;
    app.saveState();
    this.applyLayoutPreference();
    
    // Update button text
    btnText.textContent = newLayout === 'single' ? '1 Spalte' : '2 Spalten';
}
```

#### `applyLayoutPreference()`
Wendet den gespeicherten Modus an:
```javascript
applyLayoutPreference() {
    const grids = document.querySelectorAll('.dashboard-grid');
    grids.forEach(g => {
        if (app.state.dashboardLayout === 'single') {
            g.classList.add('single-column-mode');
        } else {
            g.classList.remove('single-column-mode');
        }
    });
    
    // Update button text
    btnText.textContent = app.state.dashboardLayout === 'single' ? '1 Spalte' : '2 Spalten';
}
```

### Persistenz
Die Layout-Einstellung wird in `app.state.dashboardLayout` gespeichert:
- `'single'` = 1-Spalten-Modus
- `'double'` = 2-Spalten-Modus (Standard)

## Zusammenspiel mit Card Resize

### 2-Spalten-Modus
- Individuelle Kartengrößen werden respektiert
- To-Do und Einkaufs-Karten bleiben nebeneinander
- Beide können individuell vergrößert werden

### 1-Spalten-Modus
- Individuelle Kartengrößen werden weiterhin respektiert
- **Alle Karten werden untereinander gestapelt**
- To-Do und Einkaufs-Karten werden ebenfalls untereinander angezeigt
- Jede Karte kann weiterhin in Breite und Höhe angepasst werden

## Mobile Responsiveness

### Automatische Anpassung
- Auf Bildschirmen < 600px wird automatisch 1-Spalten-Modus erzwungen
- Auf Bildschirmen 600-768px: 2 Spalten (außer im 1-Spalten-Modus)
- Auf Bildschirmen > 768px: Benutzereinstellung wird respektiert

## Verwendung

1. **Zum 1-Spalten-Modus wechseln:**
   - Klicke auf den Button "2 Spalten"
   - Button ändert sich zu "1 Spalte"
   - Alle Karten werden untereinander angeordnet

2. **Zurück zum 2-Spalten-Modus:**
   - Klicke auf den Button "1 Spalte"
   - Button ändert sich zu "2 Spalten"
   - Karten werden wieder im Grid angeordnet

## Vorteile

### 1-Spalten-Modus
- ✅ Fokussiertes Arbeiten
- ✅ Bessere Lesbarkeit auf schmalen Bildschirmen
- ✅ Klare Hierarchie
- ✅ Weniger Ablenkung

### 2-Spalten-Modus
- ✅ Mehr Informationen auf einen Blick
- ✅ Effiziente Raumnutzung
- ✅ Schneller Überblick
- ✅ Ideal für große Bildschirme

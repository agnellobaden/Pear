# Card Resize Funktionalität

## Übersicht
Alle Dashboard-Karten können jetzt individuell in Breite und Höhe angepasst werden.

## Features

### 1. **Individuelles Resizing**
- Jede Karte hat einen Resize-Handle in der unteren rechten Ecke
- Der Handle erscheint beim Hover über die Karte
- Ziehen Sie den Handle, um die Karte in beide Richtungen zu vergrößern/verkleinern
- Minimale Größe: 200px x 150px

### 2. **To-Do & Einkaufs-Karten nebeneinander**
- Die To-Do-Karte und die Einkaufskarte werden automatisch nebeneinander positioniert
- Beide Karten können individuell vergrößert werden
- Auf mobilen Geräten werden sie untereinander angezeigt

### 3. **Größen-Persistenz**
- Alle Kartengrößen werden automatisch gespeichert
- Nach einem Reload bleiben die Größen erhalten
- Größen werden pro Karte im localStorage gespeichert

### 4. **Reset-Funktion**
- Jede Karte mit angepasster Größe zeigt einen Reset-Button (oben rechts)
- Klick auf den Reset-Button stellt die Standardgröße wieder her

## Verwendung

1. **Karte vergrößern/verkleinern:**
   - Bewegen Sie die Maus über eine Karte
   - Der blaue Resize-Handle erscheint unten rechts
   - Klicken und ziehen Sie den Handle

2. **Größe zurücksetzen:**
   - Bewegen Sie die Maus über eine angepasste Karte
   - Klicken Sie auf den roten Reset-Button oben rechts

## Technische Details

### Dateien
- `card-resize.css` - Styling für Resize-Handles und Container
- `app.js` - JavaScript-Logik im `dashboard` Objekt
- `index.html` - CSS-Einbindung

### Methoden
- `initCardResize()` - Initialisiert Resize-Handles für alle Karten
- `startResize(e, card)` - Startet den Resize-Vorgang
- `saveCardSize(cardId, width, height)` - Speichert Kartengröße
- `loadCardSizes()` - Lädt gespeicherte Größen
- `resetCardSize(cardId)` - Setzt Kartengröße zurück
- `createTodoShoppingContainer()` - Erstellt Side-by-Side Container

### Datenspeicherung
```javascript
app.state.ui.cardSizes = {
    "dashboardTasksCard": { width: 400, height: 300 },
    "dashboardShoppingCard": { width: 450, height: 350 },
    // ...
}
```

## Styling

### Resize-Handle
- Blauer Gradient-Hintergrund
- Wird beim Hover sichtbar
- Zeigt visuelle Linien-Indikatoren

### Reset-Button
- Roter Hintergrund mit Transparenz
- Zeigt Zurücksetzen-Icon
- Nur bei angepassten Karten sichtbar

### Visual Feedback
- Blaue Border während des Resizing
- Schatten-Effekt beim Ziehen
- Cursor ändert sich zu Resize-Cursor

## Browser-Kompatibilität
- Chrome/Edge: ✅ Vollständig unterstützt
- Firefox: ✅ Vollständig unterstützt
- Safari: ✅ Vollständig unterstützt
- Mobile: ✅ Touch-optimiert (größere Handles)

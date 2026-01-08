# Test-Anleitung: KI-Recherche

## So testest du die neue Recherche-Funktion:

### Test 1: Telefonnummer suchen

1. **Öffne die App** (`index.html`)
2. **Gib ein:**
   ```
   Finde die Telefonnummer von Anwalt Vetter in Rastatt
   ```
3. **Erwartetes Verhalten:**
   - Grok/ChatGPT/Gemini öffnet sich in neuem Tab
   - Toast-Nachricht: "🔍 Starte KI-Recherche..."
   - Toast-Nachricht: "📋 Grok sucht nach Telefonnummer..."
   - Toast-Nachricht: "💡 Kopiere die Antwort und kehre zurück..."
   - Termin-Formular öffnet sich mit:
     - Titel: "Anwalt Vetter"
     - Ort: "Rastatt"
     - Telefon-Feld ist fokussiert

4. **In der KI:**
   - Warte auf die Antwort
   - Kopiere die Telefonnummer (Strg+C)

5. **Zurück zur App:**
   - Wechsle zurück zur App (Alt+Tab)
   - Die Telefonnummer sollte automatisch eingefügt werden
   - Das Feld sollte kurz aufblinken (Highlight-Effekt)
   - Toast-Nachricht: "✅ Telefonnummer automatisch eingefügt!"

### Test 2: Adresse suchen

```
Finde die Adresse von Anwalt Vetter in Rastatt
```

**Erwartung:**
- Termin-Formular öffnet sich
- Ort-Feld ist fokussiert
- Nach Kopieren: Adresse wird automatisch eingefügt

### Test 3: E-Mail suchen

```
Suche die E-Mail von Firma XY
```

**Erwartung:**
- Termin-Formular öffnet sich
- Notizen-Feld ist fokussiert
- Nach Kopieren: E-Mail wird ins Notizen-Feld eingefügt

### Test 4: Spracheingabe

1. Klicke auf das Mikrofon-Symbol (🎤)
2. Sage: "Finde die Telefonnummer von Anwalt Vetter in Rastatt"
3. Gleicher Ablauf wie bei Text-Eingabe

## Fehlerbehebung

### Problem: KI öffnet sich nicht
- **Überprüfe:** Popup-Blocker deaktiviert?
- **Lösung:** Erlaube Popups für die App

### Problem: Automatisches Einfügen funktioniert nicht
- **Überprüfe:** Hast du die Antwort kopiert?
- **Überprüfe:** Bist du zur App zurückgekehrt?
- **Lösung:** Füge manuell ein (Strg+V)

### Problem: Falsche Information wird eingefügt
- **Ursache:** KI-Antwort enthält mehrere Nummern/Adressen
- **Lösung:** Korrigiere manuell im Feld

## Erwartete Console-Logs

Bei erfolgreicher Recherche solltest du in der Browser-Console (F12) sehen:

```
🔍 Starte KI-Recherche...
📋 Grok sucht nach Telefonnummer...
💡 Kopiere die Antwort und kehre zurück...
Clipboard access: [Telefonnummer]
✅ Telefonnummer automatisch eingefügt!
```

## Bekannte Einschränkungen

1. **Clipboard-Zugriff:** Browser muss Clipboard-Zugriff erlauben
2. **Fokus-Erkennung:** App muss Fokus haben, um Clipboard zu lesen
3. **KI-Antworten:** Qualität hängt von der KI ab
4. **Extraktion:** Funktioniert am besten mit klaren Formaten

## Erfolgs-Kriterien

✅ **Erfolgreich**, wenn:
- KI öffnet sich automatisch
- Termin-Formular wird vorbereitet
- Richtige Felder sind fokussiert
- Information wird automatisch eingefügt
- Highlight-Effekt ist sichtbar
- Toast-Nachrichten erscheinen

❌ **Fehlgeschlagen**, wenn:
- KI öffnet sich nicht
- Formular öffnet sich nicht
- Automatisches Einfügen funktioniert nicht
- Keine Toast-Nachrichten

## Weitere Tests

Probiere verschiedene Variationen:

```
"Suche die Nummer von Dr. Müller in Berlin"
"Ermittle die Adresse der Stadtverwaltung"
"Finde die Website von Firma ABC"
"Suche die Öffnungszeiten von Aldi in Karlsruhe"
```

---

**Viel Erfolg beim Testen! 🚀**

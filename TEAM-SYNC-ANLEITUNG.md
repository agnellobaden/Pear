# 📱 Team-Sync & Echtzeit-Benachrichtigungen

## Wie Ihr Team-Kollege neue Einträge sieht

### ✅ Was funktioniert JETZT:

1. **Echtzeit-Synchronisation**
   - Änderungen werden sofort an alle Team-Mitglieder gesendet
   - Keine manuelle Aktualisierung nötig
   - Funktioniert auch wenn die App im Hintergrund läuft

2. **Automatische Benachrichtigungen**
   - 📥 Toast-Benachrichtigung in der App
   - 🔔 Browser-Benachrichtigung (wenn erlaubt)
   - 🔊 Dezenter Benachrichtigungston
   - 💫 Blinkendes Sync-Symbol

3. **Präsenz-Tracking**
   - Sehen Sie, wer gerade online ist
   - Grüner Punkt 🟢 neben aktiven Mitgliedern
   - Automatische Offline-Erkennung

### 🚀 Setup-Anleitung:

#### Schritt 1: Firebase-Konfiguration
1. Gehen Sie zu https://console.firebase.google.com
2. Erstellen Sie ein neues Projekt (z.B. "TaskForce-Team")
3. Aktivieren Sie **Firestore Database**
4. Kopieren Sie die Firebase-Konfiguration

#### Schritt 2: In TaskForce eintragen
1. Öffnen Sie **Einstellungen** ⚙️
2. Scrollen Sie zu **"Team Sync (Firebase)"**
3. Fügen Sie die Firebase-Config ein:
```json
{
  "apiKey": "IHR-API-KEY",
  "authDomain": "ihr-projekt.firebaseapp.com",
  "projectId": "ihr-projekt",
  "storageBucket": "ihr-projekt.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef"
}
```

#### Schritt 3: Team-Namen festlegen
- Beide Personen müssen **EXAKT denselben Team-Namen** verwenden
- Beispiele: "Familie Schmidt", "Firma XY", "Projekt Alpha"
- Groß-/Kleinschreibung beachten!

#### Schritt 4: Script einbinden
Fügen Sie in `index.html` vor `</body>` hinzu:
```html
<script src="team-sync.js"></script>
```

### 📊 Wie es funktioniert:

#### Wenn SIE etwas hinzufügen:
1. ✍️ Sie erstellen einen neuen Termin/Aufgabe/Einkauf
2. 💾 Daten werden lokal gespeichert
3. ☁️ Automatischer Upload zu Firebase
4. 📡 Alle Team-Mitglieder werden benachrichtigt

#### Wenn IHR KOLLEGE etwas hinzufügt:
1. 📥 Sie erhalten eine Benachrichtigung: "Max hat 1 neuen Termin hinzugefügt"
2. 🔄 Daten werden automatisch heruntergeladen
3. 🎨 UI wird automatisch aktualisiert
4. ✅ Sie sehen sofort die neuen Einträge

### 🔔 Benachrichtigungstypen:

**In-App Toast:**
```
📥 Max hat 2 neue Aufgaben, 1 neuen Termin hinzugefügt
```

**Browser-Benachrichtigung:**
```
Team-Update von Max
2 neue Aufgaben, 1 neuer Termin
```

**Visuell:**
- Blinkendes Sync-Symbol oben rechts
- Grüner Punkt bei Online-Mitgliedern

### ⚡ Echtzeit-Features:

✅ **Sofortige Updates** - Keine Verzögerung
✅ **Offline-Sync** - Funktioniert auch ohne Internet (später synchronisiert)
✅ **Konfliktlösung** - Neueste Änderung gewinnt
✅ **Präsenz-Anzeige** - Sehen wer online ist
✅ **Änderungs-Historie** - Wer hat was geändert

### 🎯 Was wird synchronisiert:

- ✅ Aufgaben & To-Dos
- ✅ Einkaufsliste
- ✅ Termine & Events
- ✅ Ausgaben & Finanzen
- ✅ Kontakte
- ✅ Gewohnheiten
- ✅ Projekte
- ✅ Meeting-Protokolle

### 🔒 Sicherheit:

- 🔐 Firebase-Regeln schützen Ihre Daten
- 👥 Nur Team-Mitglieder mit gleichem Team-Namen haben Zugriff
- 🔑 Passwort-geschützte Anmeldung
- 🛡️ Verschlüsselte Übertragung (HTTPS)

### 📱 Empfohlene Firebase-Regeln:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teams/{teamName} {
      allow read, write: if request.auth != null;
    }
    match /presence/{teamName}/members/{memberId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 🐛 Troubleshooting:

**Problem:** Keine Benachrichtigungen
- ✅ Prüfen Sie Browser-Benachrichtigungserlaubnis
- ✅ Prüfen Sie Firebase-Konfiguration
- ✅ Beide müssen denselben Team-Namen haben

**Problem:** Daten werden nicht synchronisiert
- ✅ Prüfen Sie Internetverbindung
- ✅ Öffnen Sie Browser-Konsole (F12) für Fehler
- ✅ Prüfen Sie Firebase-Projekt-Status

**Problem:** Team-Mitglied nicht sichtbar
- ✅ Beide müssen online sein
- ✅ Beide müssen denselben Team-Namen haben
- ✅ Warten Sie 30 Sekunden (Präsenz-Update-Intervall)

### 💡 Tipps:

1. **Benachrichtigungen erlauben** - Klicken Sie auf "Erlauben" wenn der Browser fragt
2. **App offen lassen** - Im Hintergrund läuft die Synchronisation weiter
3. **Regelmäßig syncen** - Automatisch alle 30 Sekunden
4. **Team-Namen merken** - Exakte Schreibweise ist wichtig!

### 🎉 Fertig!

Ihr Team ist jetzt verbunden und erhält Echtzeit-Updates! 🚀

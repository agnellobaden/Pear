# 🚀 Pear App - Profi Installations-Setup 📱

Dieses Setup ermöglicht es dir, deine Pear App auf einer eigenen Domain zu hosten und sie wie ein echtes Programm auf Windows, Mac, Android oder iOS zu installieren.

## 1. Voraussetzungen
Damit die App installierbar ist (PWA-Standard), benötigt deine Webseite:
- Eine **HTTPS-Verbindung** (SSL-Zertifikat)
- Eine gültige `manifest.json` (bereits konfiguriert)
- Einen aktiven Service Worker `sw.js` (bereits konfiguriert)

## 2. Deployment (Die App online bringen)
Du hast mehrere Möglichkeiten, die App in eine Domain zu hinterlegen:

### Option A: Hosting über Netlify (Empfohlen & Kostenlos)
1. Erstelle einen Account auf [netlify.com](https://www.netlify.com).
2. Ziehe einfach den gesamten Ordner deiner App in das Feld "Drag & Drop your site folder here".
3. Netlify gibt dir eine zufällige URL (z.B. `sunny-pear-123.netlify.app`).
4. **Fertig!** Die App ist sofort über diese URL installierbar.
   - *Tipp: Du kannst dort auch deine eigene Domain (z.B. app.deine-domain.de) kostenlos verknüpfen.*

### Option B: Hosting über GitHub Pages
1. Lade deine Dateien in ein GitHub Repository hoch.
2. Gehe zu **Settings > Pages**.
3. Wähle den `main` branch als Source.
4. Deine App ist unter `deinname.github.io/dein-repo/` erreichbar.

### Option C: Eigener Webserver (FTP/SFTP)
1. Lade alle Dateien aus diesem Ordner per FTP in dein Web-Verzeichnis hoch.
2. Stelle sicher, dass HTTPS aktiv ist.

---

## 3. Installation auf Endgeräten
Sobald die App auf deiner Domain liegt, können du und dein Team sie installieren:

### 🖥️ Am Computer (Windows / Mac)
1. Öffne deine Domain in Google Chrome oder Edge.
2. In der Adresszeile erscheint oben rechts ein **Installations-Symbol** (kleines Viereck mit Plus).
3. Klicke auf **"Installieren"**.
4. Die App wird nun im Startmenü/Dock angezeigt und öffnet sich in einem eigenen Fenster ohne Browser-Leisten.

### 📱 Auf dem Smartphone (Android / iOS)
1. Öffne die App in deinem mobilen Browser.
2. Gehe in der App auf **Einstellungen ⚙️ > App installieren & Teilen**.
3. Klicke auf den Button **"PEAR APP INSTALLIEREN"**.
4. Falls der Button nicht erscheint (bei iOS/Safari):
   - Tippe auf das **Teilen-Icon** (Viereck mit Pfeil).
   - Wähle **"Zum Home-Bildschirm hinzufügen"**.

---

## 4. Updates
Wenn du Änderungen an der App vornimmst (z.B. neue Features oder Designs):
1. Lade die geänderten Dateien auf deinen Server/Netlify hoch.
2. Der Service Worker erkennt das Update automatisch im Hintergrund.
3. Beim nächsten Start der App wird die neue Version geladen.

**Pear | Dein intelligenter Team-Organizer**
Copyright © 2026 Andrea Agnello, Pear Company

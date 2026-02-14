# Erstelle das docs Verzeichnis, falls es nicht existiert
New-Item -ItemType Directory -Force -Path docs | Out-Null

# Verschiebe alle .md Dateien in den docs Ordner
Get-ChildItem -Filter *.md | Move-Item -Destination docs/ -Force -ErrorAction SilentlyContinue

# Verschiebe README.md zurück ins Hauptverzeichnis (optional, aber empfohlen)
Move-Item -Path docs/README.md -Destination . -Force -ErrorAction SilentlyContinue

# Zähle die Dateien im Hauptverzeichnis
$count = (Get-ChildItem -File).Count

Write-Host "------------------------------------------------"
Write-Host "Aufräumen abgeschlossen."
Write-Host "Aktuelle Anzahl Dateien im Hauptverzeichnis: $count"
Write-Host "Dokumentationen befinden sich jetzt im Ordner 'docs'."
Write-Host "Du kannst die Dateien im Hauptverzeichnis jetzt problemlos hochladen."
Write-Host "------------------------------------------------"

if ($count -gt 100) {
    Write-Host "WARNUNG: Es sind immer noch über 100 Dateien."
    Write-Host "Du solltest weitere Dateien in Unterordner verschieben (z.B. css/ oder js/)."
}

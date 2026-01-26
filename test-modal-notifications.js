// TEST SCRIPT FÜR MODAL-BENACHRICHTIGUNGEN
// Fügen Sie diesen Code in die Browser-Konsole ein, um die Modals zu testen

console.log('🧪 Modal-Benachrichtigungs-Test gestartet');

// Test 1: Info-Benachrichtigung (Team-Update)
function testTeamUpdate() {
    showModalNotification(
        'Team-Update von Max',
        'Max hat folgende Änderungen vorgenommen:',
        'info',
        `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: rgba(59, 130, 246, 0.1);
                border-left: 3px solid #3b82f6;
                border-radius: 6px;
            ">
                <span style="font-size: 1.2rem;">📌</span>
                <span style="font-weight: 600;">2 neue Aufgaben</span>
            </div>
            <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: rgba(59, 130, 246, 0.1);
                border-left: 3px solid #3b82f6;
                border-radius: 6px;
            ">
                <span style="font-size: 1.2rem;">📌</span>
                <span style="font-weight: 600;">1 neuer Termin</span>
            </div>
        </div>
        <div style="
            margin-top: 16px;
            padding: 12px;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 8px;
            text-align: center;
            color: #10b981;
            font-weight: 600;
        ">
            ✓ Daten wurden automatisch synchronisiert
        </div>
        `
    );
}

// Test 2: Erfolgs-Benachrichtigung
function testSuccess() {
    showModalNotification(
        'Erfolgreich gespeichert',
        'Alle Ihre Änderungen wurden erfolgreich gespeichert!',
        'success',
        '<div style="text-align: center; padding: 10px;">Ihre Daten sind jetzt sicher in der Cloud.</div>'
    );
}

// Test 3: Warnungs-Benachrichtigung
function testWarning() {
    showModalNotification(
        'Budget-Warnung',
        'Ihr monatliches Budget ist fast aufgebraucht!',
        'warning',
        `
        <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 10px;">💰</div>
            <div style="font-weight: 600; margin-bottom: 8px;">Noch verfügbar: 50€ von 2000€</div>
            <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Das sind nur noch 2.5% Ihres Budgets!</div>
        </div>
        `
    );
}

// Test 4: Fehler-Benachrichtigung
function testError() {
    showModalNotification(
        'Verbindungsfehler',
        'Die Verbindung zum Server wurde unterbrochen',
        'danger',
        `
        <div>
            <div style="margin-bottom: 12px; color: rgba(255,255,255,0.9);">
                <strong>Mögliche Ursachen:</strong>
            </div>
            <ul style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.7);">
                <li>Keine Internetverbindung</li>
                <li>Server ist offline</li>
                <li>Firewall blockiert Zugriff</li>
            </ul>
            <div style="margin-top: 12px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: 6px; text-align: center;">
                Bitte versuchen Sie es später erneut
            </div>
        </div>
        `
    );
}

// Test 5: Einfache Benachrichtigung
function testSimple() {
    showModalNotification(
        'Neue Nachricht',
        'Sie haben eine neue Nachricht von Anna erhalten',
        'info'
    );
}

// Test 6: Sequenz-Test (mehrere Benachrichtigungen nacheinander)
function testSequence() {
    console.log('🔄 Starte Sequenz-Test...');

    setTimeout(() => {
        console.log('1️⃣ Erste Benachrichtigung');
        testSimple();
    }, 500);

    setTimeout(() => {
        console.log('2️⃣ Zweite Benachrichtigung (nach 5 Sekunden)');
        testSuccess();
    }, 5500);

    setTimeout(() => {
        console.log('3️⃣ Dritte Benachrichtigung (nach 10 Sekunden)');
        testWarning();
    }, 10500);
}

// Alle Tests ausführen
function runAllTests() {
    console.log('🚀 Führe alle Tests aus...');
    console.log('');
    console.log('Verfügbare Test-Funktionen:');
    console.log('1. testTeamUpdate()  - Team-Update Benachrichtigung');
    console.log('2. testSuccess()     - Erfolgs-Benachrichtigung');
    console.log('3. testWarning()     - Warnungs-Benachrichtigung');
    console.log('4. testError()       - Fehler-Benachrichtigung');
    console.log('5. testSimple()      - Einfache Benachrichtigung');
    console.log('6. testSequence()    - Sequenz-Test (mehrere nacheinander)');
    console.log('');
    console.log('💡 Tipp: Führen Sie eine Funktion aus, z.B.: testTeamUpdate()');
}

// Auto-Start beim Laden
runAllTests();

// Mache Funktionen global verfügbar
window.testTeamUpdate = testTeamUpdate;
window.testSuccess = testSuccess;
window.testWarning = testWarning;
window.testError = testError;
window.testSimple = testSimple;
window.testSequence = testSequence;
window.runAllTests = runAllTests;

console.log('');
console.log('✅ Test-Script geladen!');
console.log('📝 Führen Sie eine Test-Funktion aus, um zu beginnen.');

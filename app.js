/**
 * MoltBot Organizer - Core Application Logic
 * Featuring: Firebase Cloud Sync, Modern Calendar, and Premium UI
 * 
 * Copyright © 2026 Andrea Agnello, Pear Company, Deutschland
 * All rights reserved.
 */

const app = {
    // --- STATE ---
    state: {
        user: {
            name: localStorage.getItem('moltbot_username') || 'User',
            address: localStorage.getItem('moltbot_user_address') || '',
            phone: localStorage.getItem('moltbot_user_phone') || '',
            email: localStorage.getItem('moltbot_user_email') || '',
            birthday: localStorage.getItem('moltbot_user_birthday') || '',
            avatar: localStorage.getItem('moltbot_user_avatar') || 'logo.svg',
            teamName: localStorage.getItem('moltbot_team') || '',
            teamPin: localStorage.getItem('moltbot_pin') || '',
        },
        events: [],
        view: 'dashboard',
        calendarView: 'month',
        monthViewMode: 'grid', // Default to Grid view per user request
        currentDate: new Date(),
        todos: [],
        todoFilter: 'all',
        todoCategories: [],
        contacts: [],
        alarms: [],
        nightModeStart: localStorage.getItem('moltbot_night_mode_start') || '01:00',
        nightModeColor: localStorage.getItem('moltbot_night_color') || '#ef4444',
        nightModeBrightness: localStorage.getItem('moltbot_night_brightness') || '1',
        isNightClockFullscreen: false,
        wakeLock: null,
        editingEventId: null,
        editingContactId: null,
        finance: [],
        monthlyBudget: parseFloat(localStorage.getItem('moltbot_budget')) || 0,
        budgetWarningLimit: parseFloat(localStorage.getItem('moltbot_budget_warning')) || 100, // Warn when X€ remains
        savingsGoal: parseFloat(localStorage.getItem('moltbot_savings_goal')) || 0,
        contactView: localStorage.getItem('moltbot_contact_view') || 'table',
        favsCollapsed: localStorage.getItem('moltbot_favs_collapsed') === 'true',
        theme: localStorage.getItem('moltbot_theme') || 'dark',
        quickActionLeft: localStorage.getItem('moltbot_qa_left') || 'dashboard',
        quickActionRight: localStorage.getItem('moltbot_qa_right') || 'settings',
        dockStyle: localStorage.getItem('moltbot_dock_style') || 'full',
        appName: localStorage.getItem('moltbot_app_name') || 'Pear',
        customFont: localStorage.getItem('moltbot_custom_font') || 'Outfit',
        customPrimary: localStorage.getItem('moltbot_custom_primary') || '',
        globalSaturation: parseInt(localStorage.getItem('moltbot_global_saturation')) || 100,
        globalContrast: parseInt(localStorage.getItem('moltbot_global_contrast')) || 100,
        globalBrightness: parseInt(localStorage.getItem('moltbot_global_brightness')) || 100,
        fontSizeScale: parseInt(localStorage.getItem('moltbot_font_size_scale')) || 100,
        highContrastMode: localStorage.getItem('moltbot_high_contrast') === 'true',
        boldMode: localStorage.getItem('moltbot_bold_mode') === 'true',
        teamHistory: [],
        isNightLandscape: localStorage.getItem('moltbot_night_landscape') === 'true',
        isAutoNightclockEnabled: localStorage.getItem('moltbot_auto_nightclock') === 'true',
        isWakeLockPersistent: localStorage.getItem('moltbot_wakelock_persistent') === 'true',
        isWakeWordEnabled: false, // Disabled by user request: Manual only operation
        widgetOrder: JSON.parse(localStorage.getItem('moltbot_widget_order')) || ['special', 'drive', 'kpis', 'quick_finance', 'events', 'mini_calendar'],
        widgetVisibility: JSON.parse(localStorage.getItem('moltbot_widgets')) || {
            'special': true,
            'drive': true,
            'kpis': true,
            'quick_finance': true,
            'events': true,
            'mini_calendar': true
        },
        deferredPrompt: null,
        fixedCosts: [],
        lastFixedCostsMonth: localStorage.getItem('moltbot_last_fixed_month') || '',
        savingsBalance: parseFloat(localStorage.getItem('moltbot_savings_balance')) || 0,
        menuOrder: JSON.parse(localStorage.getItem('moltbot_menu_order')) || ['dashboard', 'calendar', 'contacts', 'todo', 'finance', 'alarm', 'team', 'settings']
    },


    notify(title, message, type = 'primary') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const colorMap = {
            'primary': 'var(--primary)',
            'success': 'var(--success)',
            'warning': 'var(--warning)',
            'danger': 'var(--danger)'
        };
        const color = colorMap[type] || 'var(--primary)';

        toast.style.cssText = `
            background: rgba(15, 15, 15, 0.9);
            backdrop-filter: blur(15px);
            border-left: 4px solid ${color};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            min-width: 280px;
            max-width: 350px;
            transform: translateX(120%);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: all;
            cursor: pointer;
        `;

        toast.innerHTML = `
            <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px; color: ${color};">${title}</div>
            <div style="font-size: 0.85rem; opacity: 0.9;">${message}</div>
        `;

        document.getElementById('toast-container').appendChild(toast);

        // Animate in
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);

        // Click to dismiss
        toast.onclick = () => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 400);
        };

        // Auto dismiss
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(120%)';
                setTimeout(() => toast.remove(), 400);
            }
        }, 5000);
    },

    // --- INITIALIZATION ---
    init() {
        try {
            console.log("MoltBot Initializing...");

            // Load local data first
            this.loadLocal();

            // Auto-archive past events
            this.archivePastEvents();

            // Apply App Name
            this.updateAppName(this.state.appName);

            // Apply Theme
            this.updateTheme(this.state.theme);

            // Apply Visual Customizations
            this.applyVisuals();

            // Initialize Lucide Icons
            if (window.lucide) lucide.createIcons();

            // Setup Event Listeners
            this.setupEventListeners();

            // Initialize Sync
            this.sync.init();

            // Auto-apply Fixed Costs if month changed
            this.finance.checkAndApplyAutoFixedCosts();


            // Start Clock Interface
            this.alarm.init();
            this.alarm.render();

            // Setup Gestures
            this.setupGestures();

            // --- Service Worker & Notifications ---
            this.registerServiceWorker();
            this.requestNotificationPermission();


            // Initial Render & Navigation
            this.handleInitialNavigation();

            // Stop Wake Word listener if active (ensuring manual-only mode)
            this.voice.stopWakeWord();
            this.state.isWakeWordEnabled = false;
            localStorage.setItem('moltbot_wake_word_enabled', 'false');

            // Start Departure Reminders Check (every minute)
            setInterval(() => this.checkDepartureReminders(), 60000);
            this.checkDepartureReminders(); // Initial check

            // Listen for messages from Service Worker (e.g. for navigation from notifications)
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'NAVIGATE') {
                        this.navigateTo(event.data.view);
                    }
                });
            }

        } catch (e) {
            console.error("Critical Init Error:", e);
            alert("Fehler beim Starten: " + e.message);
        } finally {
            // SPLASH SCREEN LOGIC - Guaranteed removal
            setTimeout(() => {
                const splash = document.getElementById('splash-screen');
                if (splash) {
                    splash.style.opacity = '0';
                    splash.style.visibility = 'hidden';
                    setTimeout(() => {
                        if (splash.parentNode) splash.parentNode.removeChild(splash);
                    }, 600);
                }
            }, 2000);

            // Listen for PWA installation prompt
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.state.deferredPrompt = e;
                console.log("PWA Prompt saved. Ready for installation.");
                const installBtn = document.getElementById('pwaInstallBtn');
                if (installBtn) installBtn.style.display = 'flex';
            });
        }
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('SW Registered', reg))
                .catch(err => console.error('SW Error', err));
        }
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    notify(title, body, url = '/') {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        // Try service worker first for background support
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: 'icon-192.png',
                    badge: 'icon-192.png',
                    data: { url: url }
                });
            });
        } else {
            // Fallback to simple browser notification
            new Notification(title, { body: body, icon: 'icon-192.png' });
        }
    },

    async installApp() {
        if (!this.state.deferredPrompt) {
            alert("Die App kann momentan nicht direkt installiert werden. Nutze 'Zum Home-Bildschirm hinzufügen' in deinem Browser-Menü.");
            return;
        }
        this.state.deferredPrompt.prompt();
        const { outcome } = await this.state.deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        this.state.deferredPrompt = null;
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) installBtn.style.display = 'none';
    },

    async shareApp() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Pear Organizer',
                    text: 'Schau dir diesen genialen Team-Organizer an!',
                    url: window.location.href
                });
            } catch (err) {
                console.error('Sharing failed', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Link in die Zwischenablage kopiert! Du kannst ihn jetzt versenden.");
        }
    },

    handleInitialNavigation() {
        // Handle Back Button
        window.addEventListener('popstate', (event) => {
            // Close any open modals first (except the exit modal)
            const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
            if (modals.length > 0) {
                modals.forEach(m => m.classList.add('hidden'));
                // To keep the user on the same page after closing a modal via back button:
                history.pushState({ view: this.state.view }, '', '#' + this.state.view);
                return;
            }

            if (event.state && event.state.view) {
                if (event.state.view === 'root') {
                    // We hit the very base of history stack
                    if (this.state.view === 'dashboard') {
                        // Re-push dashboard so next back hits root again
                        history.pushState({ view: 'dashboard' }, '', '#dashboard');
                    } else {
                        // If not on dashboard, go to dashboard first before showing exit modal
                        this.navigateTo('dashboard', true);
                    }
                } else {
                    this.navigateTo(event.state.view, true); // true = replace (don't push)
                }
            } else {
                // Fallback for null state
                if (this.state.view === 'dashboard') {
                    history.pushState({ view: 'dashboard' }, '', '#dashboard');
                } else {
                    this.navigateTo('dashboard', true);
                }
            }
        });

        // Initialize history stack with a root entry to catch the back button
        history.replaceState({ view: 'root' }, '', '#root');

        // Push initial view entry
        const initialView = this.state.view || 'dashboard';
        history.pushState({ view: initialView }, '', '#' + initialView);
        this.navigateTo(initialView, true);
    },



    resetVisuals() {
        if (!confirm("Alle visuellen Einstellungen auf Standard zurücksetzen?")) return;

        // Reset Logic
        this.updateVisualSetting('customFont', 'Outfit');
        this.updateVisualSetting('customPrimary', '');
        this.updateVisualSetting('customSecondary', '');
        this.updateVisualSetting('globalSaturation', 100);
        this.updateVisualSetting('globalContrast', 100);
        this.updateVisualSetting('globalBrightness', 100);
        this.updateVisualSetting('fontSizeScale', 100);
        this.updateVisualSetting('highContrastMode', false);
        this.updateVisualSetting('boldMode', false);

        // Update DOM Inputs
        const inputs = {
            'settingsFont': 'Outfit',
            'settingsPrimaryColor': '#a1a1aa',
            'settingsSecondaryColor': '#52525b',
            'inputSat': 100,
            'inputCon': 100,
            'inputBri': 100
        };

        for (const [id, val] of Object.entries(inputs)) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }

        // Update Labels
        ['labelSat', 'labelCon', 'labelBri', 'labelFontScale'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '100%';
        });

        const highContrastCheck = document.getElementById('settingsHighContrast');
        if (highContrastCheck) highContrastCheck.checked = false;

        const boldCheck = document.getElementById('settingsBoldMode');
        if (boldCheck) boldCheck.checked = false;

        const fontScaleInput = document.getElementById('inputFontScale');
        if (fontScaleInput) fontScaleInput.value = 100;

        const appNameInput = document.getElementById('settingsAppName');
        if (appNameInput) appNameInput.value = 'Pear';
        this.updateAppName('Pear');

        alert("Standard-Einstellungen wiederhergestellt.");
    },

    resetUserProfile() {
        if (!confirm("Alle Profil-Daten wirklich löschen?")) return;

        this.state.user.name = 'User';
        this.state.user.address = '';
        this.state.user.phone = '';
        this.state.user.email = '';
        this.state.user.birthday = '';
        this.state.user.avatar = 'logo.svg';

        localStorage.setItem('moltbot_username', 'User');
        localStorage.setItem('moltbot_user_address', '');
        localStorage.setItem('moltbot_user_phone', '');
        localStorage.setItem('moltbot_user_email', '');
        localStorage.setItem('moltbot_user_birthday', '');
        localStorage.setItem('moltbot_user_avatar', 'logo.svg');

        this.updateAppName('Pear');
        this.render();
        if (this.sync && this.sync.push) this.sync.push();
        alert("Profil wurde zurückgesetzt.");
    },

    createNewTeamAccount() {
        const confirmMsg = "Möchtest du wirklich ein NEUES Team erstellen? \n\nACHTUNG: Alle deine aktuellen lokalen Daten (Termine, Aufgaben, Kontakte, Finanzen) werden UNWIDERRUFLICH gelöscht, um mit einem leeren Team zu starten.";
        if (!confirm(confirmMsg)) return;

        const team = prompt("Gewünschter Team-Name / Schlüssel (z.B. FamilieMüller):");
        if (!team) return;

        const pin = prompt("Vergebe einen 4-stelligen PIN (Zahlen):");
        if (!pin || pin.length !== 4 || isNaN(pin)) {
            return alert("Fehler: Der PIN muss genau 4 Ziffern haben.");
        }

        const userName = prompt("Dein Benutzername für dieses Team:");
        if (!userName) return;

        // 1. Clear State
        this.state.events = [];
        this.state.todos = [];
        this.state.contacts = [];
        this.state.finance = [];
        this.state.alarms = [];
        this.state.fixedCosts = [];

        // 2. Set Team & User
        this.state.user.name = userName;
        this.state.user.teamName = team;
        this.state.user.teamPin = pin;
        this.state.hasReceivedInitialSync = true;

        // 3. Save Locally
        localStorage.setItem('moltbot_username', userName);
        localStorage.setItem('moltbot_team', team);
        localStorage.setItem('moltbot_pin', pin);
        this.saveLocal();

        // 4. Initialize Sync
        if (this.sync) {
            this.sync.init();
            setTimeout(() => this.sync.push(), 1000);
        }

        // 5. Navigate & Notify
        this.navigateTo('dashboard');
        this.notify("Konto erstellt", `Das Team "${team}" wurde neu angelegt.`, "success");
    },

    loadLocal() {
        const safeLoad = (key, fallback) => {
            const val = localStorage.getItem(key);
            if (!val) return fallback;
            try {
                return JSON.parse(val);
            } catch (e) {
                console.error(`Error loading ${key}:`, e);
                return fallback;
            }
        };

        this.state.user.name = localStorage.getItem('moltbot_username') || 'User';
        this.state.user.address = localStorage.getItem('moltbot_user_address') || '';
        this.state.user.phone = localStorage.getItem('moltbot_user_phone') || '';
        this.state.user.email = localStorage.getItem('moltbot_user_email') || '';
        this.state.user.birthday = localStorage.getItem('moltbot_user_birthday') || '';
        let storedAvatar = localStorage.getItem('moltbot_user_avatar');
        // Migration: If avatar is old dicebear default, replace with logo.svg
        if (!storedAvatar || storedAvatar.includes('dicebear')) {
            storedAvatar = 'logo.svg';
            localStorage.setItem('moltbot_user_avatar', 'logo.svg');
        }
        this.state.user.avatar = storedAvatar;
        this.state.view = 'dashboard'; // Force dashboard on load to fix blank screen issues

        const savedEvents = localStorage.getItem('moltbot_events');
        if (savedEvents) {
            try {
                this.state.events = JSON.parse(savedEvents);
            } catch (e) { console.error("Error loading events", e); }
        }
        const savedTodos = localStorage.getItem('moltbot_todos');
        if (savedTodos) {
            try {
                this.state.todos = JSON.parse(savedTodos);
            } catch (e) { console.error("Error loading todos", e); }
        }

        this.state.contacts = safeLoad('moltbot_contacts', []);
        this.state.alarms = safeLoad('moltbot_alarms', []);
        this.state.finance = safeLoad('moltbot_finance', []);
        this.state.finance.forEach(f => {
            if (!f.type) f.type = 'expense';
        });
        this.state.monthlyBudget = parseFloat(localStorage.getItem('moltbot_budget')) || 0;
        this.state.budgetWarningLimit = parseFloat(localStorage.getItem('moltbot_budget_warning')) || 100;

        this.state.todoCategories = safeLoad('moltbot_todo_categories', ['🛒 Einkauf', '💼 Arbeit', '🏠 Zuhause', '👤 Privat']);
        this.state.teamHistory = safeLoad('moltbot_team_history', []);
        this.state.fixedCosts = safeLoad('moltbot_fixed_costs', []);
        this.state.lastFixedCostsMonth = localStorage.getItem('moltbot_last_fixed_month') || '';
        this.state.savingsGoal = parseFloat(localStorage.getItem('moltbot_savings_goal')) || 0;
        this.state.savingsBalance = parseFloat(localStorage.getItem('moltbot_savings_balance')) || 0;
        this.state.lastRemoteSync = parseInt(localStorage.getItem('moltbot_last_sync')) || 0;

        this.state.theme = localStorage.getItem('moltbot_theme') || 'dark';
        this.state.quickActionLeft = localStorage.getItem('moltbot_qa_left') || 'dashboard';
        this.state.quickActionRight = localStorage.getItem('moltbot_qa_right') || 'settings';
        this.state.dockStyle = localStorage.getItem('moltbot_dock_style') || 'full';
        this.state.appName = localStorage.getItem('moltbot_app_name') || 'Pear';
        this.state.customFont = localStorage.getItem('moltbot_custom_font') || 'Outfit',
            this.state.customPrimary = localStorage.getItem('moltbot_custom_primary') || '',
            this.state.globalSaturation = parseInt(localStorage.getItem('moltbot_global_saturation')) || 100;
        this.state.globalContrast = parseInt(localStorage.getItem('moltbot_global_contrast')) || 100;
        this.state.globalBrightness = parseInt(localStorage.getItem('moltbot_global_brightness')) || 100;

        // Cleanup legacy purple or previous gray to enforce new light gray default
        if (this.state.customPrimary === '#a855f7' || this.state.customPrimary === '#71717a') {
            this.state.customPrimary = '';
            localStorage.removeItem('moltbot_custom_primary');
        }

        const appNameInput = document.getElementById('settingsAppName');
        if (appNameInput) appNameInput.value = this.state.appName;

        // Restore Night Clock / Wake Lock persistence
        this.state.isAutoNightclockEnabled = localStorage.getItem('moltbot_auto_nightclock') === 'true';
        this.state.isWakeLockPersistent = localStorage.getItem('moltbot_wakelock_persistent') === 'true';
        this.state.nightModeStart = localStorage.getItem('moltbot_night_mode_start') || '01:00';
        this.state.isWakeWordEnabled = localStorage.getItem('moltbot_wake_word_enabled') === 'true';
    },

    saveLocal() {
        // Migration/Sanity: Ensure all items have at least a createdAt/updatedAt before saving
        const now = Date.now();
        this.state.events.forEach(e => { if (!e.updatedAt) e.updatedAt = e.createdAt || now; });
        this.state.todos.forEach(t => { if (!t.updatedAt) t.updatedAt = t.createdAt || now; });
        this.state.contacts.forEach(c => { if (!c.updatedAt) c.updatedAt = c.createdAt || now; });
        this.state.finance.forEach(f => { if (!f.updatedAt) f.updatedAt = f.createdAt || now; });

        localStorage.setItem('moltbot_events', JSON.stringify(this.state.events));
        localStorage.setItem('moltbot_todos', JSON.stringify(this.state.todos));
        localStorage.setItem('moltbot_contacts', JSON.stringify(this.state.contacts));
        localStorage.setItem('moltbot_finance', JSON.stringify(this.state.finance));
        localStorage.setItem('moltbot_todo_categories', JSON.stringify(this.state.todoCategories));
        localStorage.setItem('moltbot_alarms', JSON.stringify(this.state.alarms));
        localStorage.setItem('moltbot_team_history', JSON.stringify(this.state.teamHistory || []));

        // Persist Night Clock settings in every save cycle
        localStorage.setItem('moltbot_auto_nightclock', this.state.isAutoNightclockEnabled);
        localStorage.setItem('moltbot_wakelock_persistent', this.state.isWakeLockPersistent);
        localStorage.setItem('moltbot_night_mode_start', this.state.nightModeStart);
        localStorage.setItem('moltbot_fixed_costs', JSON.stringify(this.state.fixedCosts));
        localStorage.setItem('moltbot_last_fixed_month', this.state.lastFixedCostsMonth);
        localStorage.setItem('moltbot_savings_goal', this.state.savingsGoal);
        localStorage.setItem('moltbot_savings_balance', this.state.savingsBalance);
    },

    updateTheme(theme) {
        this.state.theme = theme;
        localStorage.setItem('moltbot_theme', theme);
        document.body.setAttribute('data-theme', theme);

        if (this.state.view === 'settings') {
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
            });
        }
    },

    updateAppName(name) {
        if (!name) return;
        this.state.appName = name;
        localStorage.setItem('moltbot_app_name', name);

        // Update DOM elements
        const logoText = document.querySelector('.logo span');
        if (logoText) logoText.textContent = name;

        const logoIcon = document.querySelector('.logo-icon');
        if (logoIcon) logoIcon.textContent = name.charAt(0).toUpperCase();

        document.title = `${name} | Smart Team Sync`;

        // Also update settings input if it exists
        const settingsInput = document.getElementById('settingsAppName');
        if (settingsInput) settingsInput.value = name;
    },

    updateUserName(name) {
        if (!name) return;
        this.state.user.name = name;
        localStorage.setItem('moltbot_username', name);

        // Update Dashboard and Header
        this.render();

        // Force update dashboard title even if not in dashboard view
        const dashTitle = document.getElementById('dashboardWelcomeTitle');
        if (dashTitle) this.renderDashboard();

        // Sync if possible
        if (this.sync && this.sync.push) this.sync.push();
    },

    updateUserData(key, value) {
        this.state.user[key] = value;
        localStorage.setItem(`moltbot_user_${key}`, value);

        if (this.state.view === 'settings' || this.state.view === 'dashboard') {
            this.render();
            // Also update action links explicitly for responsiveness
            if (key === 'phone') app.updateActionLink('settingsUserPhone', 'settingsCallBtn', 'tel:');
            if (key === 'email') app.updateActionLink('settingsUserEmail', 'settingsMailBtn', 'mailto:');
        }

        // Sync if possible
        if (this.sync && this.sync.push) this.sync.push();
    },

    handleAvatarUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                this.state.user.avatar = dataUrl;
                localStorage.setItem('moltbot_user_avatar', dataUrl);

                // Update Previews
                const preview = document.getElementById('settingsUserAvatarPreview');
                if (preview) preview.src = dataUrl;

                const headerAv = document.getElementById('headerUserAvatar');
                if (headerAv) headerAv.src = dataUrl;

                const headerAvMob = document.getElementById('headerUserAvatarMobile');
                if (headerAvMob) headerAvMob.src = dataUrl;

                if (this.sync && this.sync.push) this.sync.push();
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    updateVisualSetting(key, value) {
        this.state[key] = value;
        // Map state key to localStorage key correctly
        const storageKeyMap = {
            'customFont': 'moltbot_custom_font',
            'customPrimary': 'moltbot_custom_primary',
            'customSecondary': 'moltbot_custom_secondary',
            'globalSaturation': 'moltbot_global_saturation',
            'globalContrast': 'moltbot_global_contrast',
            'globalBrightness': 'moltbot_global_brightness',
            'fontSizeScale': 'moltbot_font_size_scale',
            'highContrastMode': 'moltbot_high_contrast',
            'boldMode': 'moltbot_bold_mode'
        };

        if (storageKeyMap[key]) {
            localStorage.setItem(storageKeyMap[key], value);
        }

        this.applyVisuals();
    },

    hexToRgb(hex) {
        if (!hex) return null;
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(', ');
        }
        return null;
    },

    applyVisuals() {
        const root = document.documentElement;
        const isLight = this.state.theme === 'light';

        // Font
        let fontStack = "'Outfit', sans-serif";
        if (this.state.customFont === 'Serif') fontStack = "Georgia, serif";
        if (this.state.customFont === 'Mono') fontStack = "'Courier New', monospace";
        if (this.state.customFont === 'System') fontStack = "system-ui, -apple-system, sans-serif";
        if (this.state.customFont === 'Dyslexic') fontStack = "'OpenDyslexic', 'Comic Sans MS', sans-serif";
        root.style.setProperty('--font-main', fontStack);

        // --- COLORS & CONTRAST ---

        // Primary Color Override
        if (this.state.customPrimary) {
            root.style.setProperty('--primary', this.state.customPrimary);
            const rgb = this.hexToRgb(this.state.customPrimary);
            if (rgb) {
                root.style.setProperty('--primary-rgb', rgb);
                root.style.setProperty('--primary-glow', `rgba(${rgb}, 0.4)`);
            }
        } else {
            root.style.removeProperty('--primary');
            root.style.removeProperty('--primary-rgb');
            root.style.removeProperty('--primary-glow');
        }

        // Secondary / Background Color Override
        let secondaryColor = this.state.customSecondary || this.state.customPrimary;
        if (secondaryColor) {
            root.style.setProperty('--secondary', secondaryColor);
            const rgb2 = this.hexToRgb(secondaryColor);
            if (rgb2) root.style.setProperty('--secondary-rgb', rgb2);
        } else {
            root.style.removeProperty('--secondary');
            root.style.removeProperty('--secondary-rgb');
        }

        // --- Solid Backgrounds ---
        let bgSolid1 = isLight ? '#ffffff' : '#18181b'; // Modal
        let bgSolid2 = isLight ? '#f1f5f9' : '#27272a'; // Input

        if (secondaryColor) {
            const mixBase = isLight ? 'white' : 'black';
            bgSolid1 = `color-mix(in srgb, ${secondaryColor}, ${mixBase} 85%)`;
            bgSolid2 = `color-mix(in srgb, ${secondaryColor}, ${mixBase} 75%)`;
            root.style.setProperty('--bg-card', isLight ? `rgba(var(--secondary-rgb), 0.08)` : `rgba(var(--secondary-rgb), 0.15)`);
        } else {
            root.style.removeProperty('--bg-card');
        }
        root.style.setProperty('--bg-solid-1', bgSolid1);
        root.style.setProperty('--bg-solid-2', bgSolid2);

        // High Contrast Mode Overrides
        if (this.state.highContrastMode) {
            root.style.setProperty('--text-main', isLight ? '#000000' : '#ffffff');
            root.style.setProperty('--text-muted', isLight ? '#000000' : '#ffffff');
            root.style.setProperty('--primary', isLight ? '#000000' : '#ffffff');
            root.style.setProperty('--bg-card', isLight ? '#ffffff' : '#000000');
            root.style.setProperty('--bg-dark', isLight ? '#ffffff' : '#000000');
        } else {
            root.style.removeProperty('--text-main');
            root.style.removeProperty('--text-muted');
            // primary and others already handled by their logic above
        }

        // Font Weight Mode
        if (this.state.boldMode) {
            root.style.setProperty('--font-weight-body', '600');
            root.style.setProperty('--font-weight-heading', '800');
        } else {
            root.style.setProperty('--font-weight-body', '400');
            root.style.setProperty('--font-weight-heading', '700');
        }

        // Filters
        document.body.style.filter = `
            saturate(${this.state.globalSaturation}%) 
            contrast(${this.state.globalContrast}%) 
            brightness(${this.state.globalBrightness}%)
        `;

        // Font Size Scale
        document.documentElement.style.fontSize = `${this.state.fontSizeScale || 100}%`;
    },

    // --- SYNC MODULE (Firebase Cloud) ---
    sync: {
        db: null,
        config: {
            apiKey: "AIzaSyCIKoI2e_68iT-ljyfjq0Zij9KedS1L8Qk",
            authDomain: "taskforce-9ffec.firebaseapp.com",
            projectId: "taskforce-9ffec",
            storageBucket: "taskforce-9ffec.firebasestorage.app",
            messagingSenderId: "719312099554",
            appId: "1:719312099554:web:e411a2566881238bd3e6bb",
            measurementId: "G-K75D9LJMX8"
        },
        unsubscribe: null,

        log(msg, type = 'info') {
            const logEl = document.getElementById('syncLog');
            if (logEl) {
                const time = new Date().toLocaleTimeString();
                const color = type === 'error' ? '#ff4444' : (type === 'success' ? '#44ff44' : '#aaa');
                logEl.innerHTML = `<div><span style="color: ${color}">[${time}]</span> ${msg}</div>` + logEl.innerHTML;
            }
            console.log(`Sync Log: ${msg}`);
        },

        init() {
            if (!window.firebase) {
                this.log("Firebase SDK fehlt!", "error");
                this.updateUI(false);
                return;
            }

            if (!app.state.user.teamName) {
                this.log("Kein Team gesetzt (Lokal)");
                this.updateUI(false);
                return;
            }

            try {
                // Initialize Firebase only if not already initialized
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.config);
                    this.log("Firebase initialisiert", "success");
                }
                this.db = firebase.firestore();
                this.log(`Verbinde zu Team: ${app.state.user.teamName}`);
                this.listen();
                this.startPresence();

                // --- Always in Sync: Auto Push ---
                if (this.autoSyncInterval) clearInterval(this.autoSyncInterval);
                this.autoSyncInterval = setInterval(() => {
                    this.log("Frische Daten (Auto-Sync)...");
                    this.push();
                }, 60000); // Every minute

                // Sync on visibility change
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        this.log("App wieder aktiv, synce...");
                        this.push();
                    }
                });
            } catch (e) {
                this.log(`Init Fehler: ${e.message}`, "error");
                this.updateUI(false);
            }
        },

        connect() {
            const userName = document.getElementById('userInput').value.trim();
            const team = document.getElementById('teamInput').value.trim();
            const pin = document.getElementById('teamPin').value.trim();

            if (!userName || !team || !pin) return alert("Bitte Name, Team-Schlüssel UND PIN eingeben!");
            if (pin.length < 4) return alert("Der PIN muss 4-stellig sein.");

            const isNewTeam = team !== app.state.user.teamName;

            if (isNewTeam && (app.state.events.length > 0 || app.state.todos.length > 0)) {
                if (confirm("Du wechselst das Team. Möchtest du die Termine des neuen Teams laden? (Lokale Daten werden dabei überschrieben)")) {
                    // Clear local data for isolation
                    app.state.events = [];
                    app.state.todos = [];
                    app.state.finance = [];
                    app.state.contacts = [];
                    app.saveLocal();
                }
            }

            this.log(`Anmeldeversuch: ${team} (User: ${userName})...`);
            app.state.user.name = userName;
            app.state.user.teamName = team;
            app.state.user.teamPin = pin;
            localStorage.setItem('moltbot_username', userName);
            localStorage.setItem('moltbot_team', team);
            localStorage.setItem('moltbot_pin', pin);

            // Update History
            if (!app.state.teamHistory) app.state.teamHistory = [];
            const historyItem = { team, pin, userName, lastUsed: Date.now() };
            const existingIdx = app.state.teamHistory.findIndex(h => h.team === team);
            if (existingIdx > -1) {
                app.state.teamHistory[existingIdx] = historyItem;
            } else {
                app.state.teamHistory.unshift(historyItem);
            }
            if (app.state.teamHistory.length > 5) app.state.teamHistory.pop();
            app.saveLocal();

            // Re-init sync
            this.init();

            // Push current state to cloud so other devices see it immediately
            setTimeout(() => {
                if (this.db) {
                    // CHANGED: We do NOT push immediately to avoid overwriting cloud data with empty local data.
                    // We wait for the listener to pull data first.
                    // If we have local data, it will be merged and pushed later if needed.
                    app.render();
                    this.log("Anmeldung abgeschlossen", "success");
                } else {
                    this.log("Verbindung fehlgeschlagen!", "error");
                }
            }, 800);
        },

        switchTeam(team, pin, userName) {
            document.getElementById('userInput').value = userName;
            document.getElementById('teamInput').value = team;
            document.getElementById('teamPin').value = pin;
            this.connect();
        },

        disconnect() {
            if (!confirm("Synchronisation wirklich beenden und vom Team abmelden?")) return;

            app.state.user.teamName = '';
            app.state.user.teamPin = '';
            localStorage.removeItem('moltbot_team');
            localStorage.removeItem('moltbot_pin');

            if (this.unsubscribe) this.unsubscribe();
            this.updateUI(false);
            app.render();
            alert("Abgemeldet. Deine Daten werden nur noch lokal gespeichert.");
        },

        togglePinVisibility() {
            const input = document.getElementById('teamPin');
            const icon = document.getElementById('pinToggleIcon');
            if (input && icon) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
                if (window.lucide) lucide.createIcons();
            }
        },

        listen() {
            if (!this.db || !app.state.user.teamName) return;

            // Use the teamName as a private document ID
            // "Nur Privat" logic: using a dedicated collection
            const docRef = this.db.collection('moltbot_private_sync').doc(app.state.user.teamName);

            // Cancel previous listener if exists
            if (this.unsubscribe) this.unsubscribe();

            this.unsubscribe = docRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data && data.payload) {
                        try {
                            const incoming = JSON.parse(data.payload);
                            this.log("Daten empfangen", "success");
                            app.mergeIncoming(incoming);
                            app.state.hasReceivedInitialSync = true; // Mark initial sync as done
                            this.updateUI(true);
                        } catch (e) { this.log("Parse Fehler", "error"); }
                    }
                } else {
                    this.log("Noch keine Team-Daten vorhanden");
                    app.state.hasReceivedInitialSync = true; // Mark initial sync as done (empty cloud)
                    this.updateUI(true);
                }
            }, (error) => {
                this.log(`Listen Fehler: ${error.code}`, "error");
                this.updateUI(false);
            });
        },

        push() {
            if (!this.db || !app.state.user.teamName) return;

            // SAFETY GUARD: Prevent wiping cloud data if local is empty and we haven't pulled yet
            const isLocalEmpty = app.state.events.length === 0 && app.state.todos.length === 0 && app.state.contacts.length === 0 && app.state.finance.length === 0;
            if (isLocalEmpty && !app.state.hasReceivedInitialSync) {
                console.log("Sync: Warte auf initialen Abgleich bevor Leere gesendet wird.");
                return;
            }

            // Visual feedback for ALL sync buttons
            const syncButtons = document.querySelectorAll('button[onclick="app.sync.push()"]');
            syncButtons.forEach(btn => {
                const icon = btn.querySelector('i');
                if (icon) icon.classList.add('spinning');
            });

            const payload = {
                events: app.state.events,
                todos: app.state.todos,
                contacts: app.state.contacts,
                finance: app.state.finance,
                alarms: app.state.alarms,
                todoCategories: app.state.todoCategories,
                userProfile: {
                    name: app.state.user.name,
                    avatar: app.state.user.avatar,
                    appName: app.state.appName,
                    autoNightclock: app.state.isAutoNightclockEnabled,
                    nightModeStart: app.state.nightModeStart,
                    wakeLockPersistent: app.state.isWakeLockPersistent
                },
                updatedAt: Date.now(),
                pushedBy: app.state.user.name,
                pin: app.state.user.teamPin,
                fixedCosts: app.state.fixedCosts,
                lastFixedCostsMonth: app.state.lastFixedCostsMonth,
                savingsGoal: app.state.savingsGoal,
                savingsBalance: app.state.savingsBalance
            };

            this.db.collection('moltbot_private_sync').doc(app.state.user.teamName).set({
                payload: JSON.stringify(payload),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdatedBy: app.state.user.name
            }).then(() => {
                this.log("Upload erfolgreich", "success");
                this.updateUI(true);
                syncButtons.forEach(btn => {
                    const icon = btn.querySelector('i');
                    if (icon) icon.classList.remove('spinning');
                });
            }).catch(e => {
                this.log(`Upload Fehler: ${e.code || e.message}`, "error");
                this.updateUI(false);
                syncButtons.forEach(btn => {
                    const icon = btn.querySelector('i');
                    if (icon) icon.classList.remove('spinning');
                });
            });
        },

        startPresence() {
            if (!this.db || !app.state.user.teamName) return;

            const setPresence = () => {
                const team = app.state.user.teamName;
                if (!team) return;

                this.db.collection('moltbot_presence').doc(team).set({
                    [app.state.user.name]: {
                        lastSeen: Date.now(),
                        status: 'online',
                        avatar: app.state.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.state.user.name}`
                    }
                }, { merge: true });
            };

            setPresence();
            setInterval(setPresence, 30000); // Heartbeat every 30s

            // Listen for other members
            this.db.collection('moltbot_presence').doc(app.state.user.teamName)
                .onSnapshot((doc) => {
                    const list = document.getElementById('presenceList');
                    if (!list || !doc.exists) return;

                    const members = doc.data();
                    const now = Date.now();
                    let html = '';

                    Object.entries(members).forEach(([name, data]) => {
                        // Only show if seen in last 5 minutes
                        if (now - data.lastSeen < 300000) {
                            const isMe = name === app.state.user.name;
                            html += `
                                <div class="member-badge ${isMe ? 'is-me' : ''}" title="${name} is online">
                                    <img src="${data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}" alt="${name}">
                                    <span class="status-indicator"></span>
                                    <span class="member-name">${name}</span>
                                </div>
                            `;
                        }
                    });
                    list.innerHTML = html;
                });
        },

        updateUI(online) {
            const isConnected = !!app.state.user.teamName;
            const dot = document.querySelector('.status-dot');
            const text = document.getElementById('syncStatusText');

            // Update stats if connected
            if (isConnected) {
                const eventCountEl = document.getElementById('teamEventCount');
                const todoCountEl = document.getElementById('teamTodoCount');
                if (eventCountEl) eventCountEl.textContent = app.state.events.length;
                if (todoCountEl) todoCountEl.textContent = app.state.todos.length;
            }
            if (dot) {
                // If connected but error: red. If not connected: blue (Local). If connected & ok: green.
                if (!isConnected) {
                    dot.style.background = 'var(--accent)'; // Blue for Local
                    dot.classList.remove('online');
                } else {
                    dot.style.background = online ? 'var(--success)' : 'var(--danger)';
                    dot.classList.toggle('online', online);
                }
            }
            if (text) text.textContent = isConnected ? app.state.user.teamName : 'Lokal';

            const nameDisplay = document.getElementById('currentUserDisplay');
            if (nameDisplay) nameDisplay.textContent = app.state.user.name || 'Hof';

            const display = document.getElementById('currentTeamDisplay');
            if (display) display.textContent = isConnected ? app.state.user.teamName : 'Lokal';

            const pinDisplay = document.getElementById('currentPinDisplay');
            if (pinDisplay) pinDisplay.textContent = '****'; // Always reset to hidden on UI update

            const teamKeyDisplay = document.getElementById('displayTeamKey');
            if (teamKeyDisplay) teamKeyDisplay.textContent = isConnected ? app.state.user.teamName : '---';

            const teamPinDisplay = document.getElementById('displayTeamPin');
            if (teamPinDisplay) teamPinDisplay.textContent = '****'; // Always reset to hidden on UI update

            const activeSyncInfo = document.getElementById('activeSyncInfo');
            const mobileSyncBtn = document.getElementById('mobileSyncBtn');
            const desktopSyncBtn = document.getElementById('desktopSyncBtn'); // In case we add it there too

            if (activeSyncInfo) activeSyncInfo.classList.toggle('hidden', !isConnected);
            if (mobileSyncBtn) mobileSyncBtn.classList.toggle('hidden', !isConnected);
            if (desktopSyncBtn) desktopSyncBtn.classList.toggle('hidden', !isConnected);

            const loginFields = document.querySelector('.login-fields');
            if (loginFields) {
                // If connected, we might want to hide login fields or just show status
                // For now, let's keep them so users can switch teams easily
            }

            // If local, show at least the current user in the presence list
            if (!isConnected) {
                const list = document.getElementById('presenceList');
                if (list) {
                    list.innerHTML = `
                        <div class="member-badge is-me" title="Du bist lokal angemeldet">
                            <img src="${app.state.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.state.user.name}`}" alt="Me">
                            <span class="status-indicator" style="background: var(--accent);"></span>
                            <span class="member-name">${app.state.user.name} (Ich)</span>
                        </div>
                    `;
                }
            }

            // Render Team History
            const historyCard = document.getElementById('recentTeamsCard');
            const historyList = document.getElementById('recentTeamsList');
            if (historyCard && historyList) {
                const history = app.state.teamHistory || [];
                // Only show history if we have items AND we are NOT currently trying to join a team (or always show it when not connected)
                if (history.length > 0) {
                    historyCard.style.display = 'block';
                    historyList.innerHTML = history.map(h => `
                        <div class="glass" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(var(--primary-rgb), 0.2); cursor: pointer; transition: all 0.2s;" 
                             onclick="app.sync.switchTeam('${h.team}', '${h.pin}', '${h.userName}')"
                             onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-2px)';"
                             onmouseout="this.style.borderColor='rgba(var(--primary-rgb), 0.2)'; this.style.transform='none';">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="avatar-small" style="background: var(--primary); width: 32px; height: 32px; font-size: 0.8rem;">
                                    ${h.team.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style="font-weight: 700; font-size: 0.95rem;">${h.team}</div>
                                    <div style="font-size: 0.75rem; opacity: 0.6;">Als: ${h.userName}</div>
                                </div>
                            </div>
                            <i data-lucide="chevron-right" size="18" style="opacity: 0.5;"></i>
                        </div>
                    `).join('');
                    if (window.lucide) lucide.createIcons();
                } else {
                    historyCard.style.display = 'none';
                }
            }
        }
    },

    // --- LOGIC ---
    getFilteredEvents() {
        const filters = {
            work: document.getElementById('filter-work')?.checked ?? true,
            private: document.getElementById('filter-private')?.checked ?? true,
            urgent: document.getElementById('filter-urgent')?.checked ?? true,
            birthday: document.getElementById('filter-birthday')?.checked ?? true,
            holiday: document.getElementById('filter-holiday')?.checked ?? true,
            archive: document.getElementById('filter-archive')?.checked ?? false
        };
        const search = document.querySelector('.search-bar input')?.value.toLowerCase() || '';

        // User Events
        let combined = this.state.events.filter(e => {
            // Archive Filter: Hide archived unless enabled
            if (e.archived && !filters.archive) return false;

            const matchesCategory = filters[e.category] !== false;
            const matchesSearch = e.title.toLowerCase().includes(search) || (e.notes && e.notes.toLowerCase().includes(search));
            return matchesCategory && matchesSearch;
        });

        // Add Holidays if enabled
        if (filters.holiday) {
            const year = this.state.currentDate.getFullYear();
            // Calculate holidays for current, prev and next year to be safe
            const holidays = [
                ...this.holidays.getForYear(year - 1),
                ...this.holidays.getForYear(year),
                ...this.holidays.getForYear(year + 1)
            ];

            // Filter holidays by search
            const matchingHolidays = holidays.filter(h =>
                h.title.toLowerCase().includes(search)
            );

            combined = [...combined, ...matchingHolidays];
        }

        return combined;
    },

    isEventOnDate(e, d) {
        if (!e.date) return false;
        const evDate = new Date(e.date);

        // Normalize dates to midnight for comparison
        const normalizedD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const normalizedEvDate = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate()).getTime();

        // Don't show recurring events before their start date
        if (normalizedD < normalizedEvDate) return false;

        // Recurrence Logic
        if (e.recurrence === 'daily') return true;

        if (e.recurrence === 'weekly') {
            return evDate.getDay() === d.getDay();
        }

        if (e.recurrence === 'monthly') {
            return evDate.getDate() === d.getDate();
        }

        if (e.recurrence === 'yearly') {
            return evDate.getDate() === d.getDate() && evDate.getMonth() === d.getMonth();
        }

        // Year-independent matching for birthdays and holidays
        if (e.category === 'birthday' || e.category === 'holiday') {
            return evDate.getDate() === d.getDate() && evDate.getMonth() === d.getMonth();
        }

        return evDate.toDateString() === d.toDateString();
    },

    mergeIncoming(incoming) {
        if (!incoming.events) return;

        // PRIVACY CHECK: Only merge if PIN matches (trimmed for safety)
        const incomingPin = (incoming.pin || "").toString().trim();
        const localPin = (app.state.user.teamPin || "").toString().trim();

        if (incomingPin !== localPin) {
            console.warn("Sync: PIN mismatch or missing pin. Data ignored.");
            return;
        }

        let changed = false;

        // Merge Events (Termine)
        if (incoming.events) {
            const incomingIds = new Set(incoming.events.map(e => e.id));
            const localMap = new Map(this.state.events.map(e => [e.id, e]));

            // 1. Update or Add from incoming
            incoming.events.forEach(incEvent => {
                const local = localMap.get(incEvent.id);
                const incUpd = incEvent.updatedAt || incEvent.createdAt || 1;
                const localUpd = local ? (local.updatedAt || local.createdAt || 0) : -1;

                if (!local || incUpd > localUpd) {
                    localMap.set(incEvent.id, incEvent);
                    changed = true;
                }
            });

            // 2. Remove local items that are missing in incoming AND are older than the incoming payload
            this.state.events.forEach(local => {
                if (!incomingIds.has(local.id)) {
                    if (incoming.updatedAt > (local.updatedAt || local.createdAt || 0)) {
                        localMap.delete(local.id);
                        changed = true;
                    }
                }
            });

            if (changed) this.state.events = Array.from(localMap.values());
        }

        // Merge Todos
        if (incoming.todos) {
            const incomingIds = new Set(incoming.todos.map(t => t.id));
            const localTodoMap = new Map(this.state.todos.map(t => [t.id, t]));

            incoming.todos.forEach(incTodo => {
                const local = localTodoMap.get(incTodo.id);
                const incUpd = incTodo.updatedAt || incTodo.createdAt || 1;
                const localUpd = local ? (local.updatedAt || local.createdAt || 0) : -1;

                if (!local || incUpd > localUpd) {
                    localTodoMap.set(incTodo.id, incTodo);
                    changed = true;
                }
            });

            // Remove local items missing in incoming
            this.state.todos.forEach(local => {
                if (!incomingIds.has(local.id)) {
                    if (incoming.updatedAt > (local.updatedAt || local.createdAt || 0)) {
                        localTodoMap.delete(local.id);
                        changed = true;
                    }
                }
            });

            if (changed) this.state.todos = Array.from(localTodoMap.values());
        }

        // Merge Contacts
        if (incoming.contacts) {
            const incomingIds = new Set(incoming.contacts.map(c => c.id));
            const localContactMap = new Map(this.state.contacts.map(c => [c.id, c]));

            incoming.contacts.forEach(incContact => {
                const local = localContactMap.get(incContact.id);
                const incUpd = incContact.updatedAt || incContact.createdAt || 1;
                const localUpd = local ? (local.updatedAt || local.createdAt || 0) : -1;

                if (!local || incUpd > localUpd) {
                    localContactMap.set(incContact.id, incContact);
                    changed = true;
                }
            });

            // Remove local items missing in incoming
            this.state.contacts.forEach(local => {
                if (!incomingIds.has(local.id)) {
                    if (incoming.updatedAt > (local.updatedAt || local.createdAt || 0)) {
                        localContactMap.delete(local.id);
                        changed = true;
                    }
                }
            });

            if (changed) this.state.contacts = Array.from(localContactMap.values());
        }

        // Merge Finance
        if (incoming.finance) {
            const incomingIds = new Set(incoming.finance.map(f => f.id));
            const localFinMap = new Map(this.state.finance.map(f => [f.id, f]));

            incoming.finance.forEach(incFin => {
                const local = localFinMap.get(incFin.id);
                // Respect soft deletes: don't re-add if we have a newer local tombstone
                const incUpd = incFin.updatedAt || incFin.createdAt || 1;
                const localUpd = local ? (local.updatedAt || local.createdAt || 0) : -1;

                if (!local || incUpd > localUpd) {
                    localFinMap.set(incFin.id, incFin);
                    changed = true;
                }
            });

            // Remove local items missing in incoming (Hard delete propagation)
            this.state.finance.forEach(local => {
                if (!incomingIds.has(local.id)) {
                    if (incoming.updatedAt > (local.updatedAt || local.createdAt || 0)) {
                        localFinMap.delete(local.id);
                        changed = true;
                    }
                }
            });

            if (changed) this.state.finance = Array.from(localFinMap.values());
        }

        // Merge Alarms
        if (incoming.alarms) {
            // Overwrite alarms if incoming is newer (simple approach for arrays)
            if (JSON.stringify(this.state.alarms) !== JSON.stringify(incoming.alarms)) {
                this.state.alarms = incoming.alarms;
                changed = true;
            }
        }

        // Merge Categories
        if (incoming.todoCategories) {
            if (JSON.stringify(this.state.todoCategories) !== JSON.stringify(incoming.todoCategories)) {
                this.state.todoCategories = incoming.todoCategories;
                changed = true;
            }
        }

        // Merge Fixed Costs
        if (incoming.fixedCosts) {
            if (JSON.stringify(this.state.fixedCosts) !== JSON.stringify(incoming.fixedCosts)) {
                this.state.fixedCosts = incoming.fixedCosts;
                changed = true;
            }
        }
        if (incoming.lastFixedCostsMonth && incoming.lastFixedCostsMonth !== this.state.lastFixedCostsMonth) {
            this.state.lastFixedCostsMonth = incoming.lastFixedCostsMonth;
            changed = true;
        }
        if (incoming.savingsGoal !== undefined && incoming.savingsGoal !== this.state.savingsGoal) {
            this.state.savingsGoal = incoming.savingsGoal;
            changed = true;
        }
        if (incoming.savingsBalance !== undefined && incoming.savingsBalance !== this.state.savingsBalance) {
            this.state.savingsBalance = incoming.savingsBalance;
            changed = true;
        }

        // Sync Profile / App Name if newer
        if (incoming.userProfile && incoming.updatedAt > (this.state.lastRemoteSync || 0)) {
            if (incoming.userProfile.appName && incoming.userProfile.appName !== this.state.appName) {
                this.updateAppName(incoming.userProfile.appName);
            }
            // Sync Night Mode settings
            if (incoming.userProfile.autoNightclock !== undefined) {
                this.state.isAutoNightclockEnabled = incoming.userProfile.autoNightclock;
            }
            if (incoming.userProfile.nightModeStart !== undefined) {
                this.state.nightModeStart = incoming.userProfile.nightModeStart;
            }
            if (incoming.userProfile.wakeLockPersistent !== undefined) {
                this.state.isWakeLockPersistent = incoming.userProfile.wakeLockPersistent;
            }
            this.state.lastRemoteSync = incoming.updatedAt;
        }

        if (changed) {
            this.saveLocal();
            // Store the timestamp to avoid redundant merges if needed
            this.state.lastRemoteSync = incoming.updatedAt;
            this.render();

            this.notify("Update erhalten", "Deine Daten wurden mit einem anderen Gerät synchronisiert.");
        }
    },



    // --- GESTURES & NAVIGATION ---
    setupGestures() {
        let touchStartY = 0;
        let ptrDist = 0;
        let ptrStartY = -1;

        document.addEventListener('touchstart', e => {
            // PULL TO REFRESH START
            // Only valid if scrolled to top AND touch starts in top area (e.g. navigation bar)
            if (window.scrollY === 0 && e.touches[0].clientY < 60) {
                ptrStartY = e.touches[0].clientY;
            } else {
                ptrStartY = -1; // Invalid start
            }
        }, { passive: true });

        document.addEventListener('touchmove', e => {
            // PULL TO REFRESH MOVE
            const y = e.touches[0].clientY;
            if (window.scrollY === 0 && ptrStartY > 0 && y > ptrStartY) {
                ptrDist = y - ptrStartY;
            } else {
                ptrDist = 0; // Cancel if scrolled down or invalid start
            }
        }, { passive: true });

        document.addEventListener('touchend', e => {
            // Handle Pull to Refresh
            if (window.scrollY === 0 && ptrDist > 150) {
                this.handlePullToRefresh();
            }
            ptrDist = 0;
            ptrStartY = 0;
        }, { passive: true });
    },

    handlePullToRefresh() {
        // Show loading overlay
        const overlay = document.createElement('div');
        overlay.id = 'ptr-overlay';
        overlay.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:var(--bg-dark); z-index:9999; display:flex; justify-content:center; align-items:center; color:white; font-size:1.2rem; animation: fadeIn 0.3s;';
        overlay.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; gap:15px;"><i data-lucide="loader-2" class="spinning" style="animation: spin 1s linear infinite;" width="40" height="40"></i><span>Wird aktualisiert...</span></div>';

        // Use Lucide if available, else plain text or SVG
        if (!window.lucide) {
            overlay.innerHTML = '<div style="color:white;">Aktualisiere...</div>';
        }

        document.body.appendChild(overlay);
        if (window.lucide) lucide.createIcons();

        // RELOAD
        setTimeout(() => {
            window.location.reload();
        }, 800);
    },

    addEvent(eventData) {
        if (this.state.editingEventId) {
            // Update existing
            const index = this.state.events.findIndex(e => e.id === this.state.editingEventId);
            if (index !== -1) {
                this.state.events[index] = {
                    ...this.state.events[index],
                    ...eventData,
                    updatedAt: Date.now()
                };
            }
            this.state.editingEventId = null;
        } else {
            // Create new
            const newEvent = {
                ...eventData,
                id: Date.now().toString(),
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            this.state.events.push(newEvent);
        }

        this.saveLocal();
        this.sync.push();

        // Navigate to the event's date and view
        const eventDate = new Date(eventData.date);
        this.state.currentDate = eventDate;
        this.navigateTo('calendar');

        // Notify
        if (!this.state.editingEventId) {
            this.notify("Termin gespeichert", `${eventData.title || 'Neuer Termin'} am ${eventData.date}`);
        } else {
            this.notify("Termin aktualisiert", `${eventData.title}`);
        }
    },

    deleteEvent(id) {
        if (!id && this.state.editingEventId) id = this.state.editingEventId;
        if (!id) return;

        if (confirm("Termin wirklich löschen?")) {
            this.state.events = this.state.events.filter(e => e.id !== id);
            this.state.editingEventId = null;
            this.saveLocal();
            this.sync.push();
            this.render();
            document.getElementById('modalOverlay').classList.add('hidden');
        }
    },

    editEvent(id) {
        this.state.editingEventId = id || null;
        const event = id ? this.state.events.find(e => e.id === id) : null;

        // Populate Modal Safe Check
        const setVal = (elmId, val) => {
            const el = document.getElementById(elmId);
            if (el) el.value = val;
        };

        setVal('eventTitle', event ? (event.title || '') : '');
        setVal('eventDate', event ? (event.date || '') : new Date().toISOString().split('T')[0]);
        setVal('eventTime', event ? (event.time || '') : '10:00');
        setVal('eventLocation', event ? (event.location || '') : '');
        setVal('eventPhone', event ? (event.phone || '') : '');
        setVal('eventEmail', event ? (event.email || '') : '');
        setVal('eventNotes', event ? (event.notes || '') : '');
        setVal('eventCategory', event ? (event.category || 'work') : 'work');
        setVal('eventRecurrence', event ? (event.recurrence || 'none') : 'none');
        setVal('eventColor', event ? (event.color || '#6366f1') : '#6366f1');

        // Update Action Buttons
        this.updateActionLink('eventPhone', 'eventCallBtn', 'tel:');
        this.updateActionLink('eventEmail', 'eventMailBtn', 'mailto:');

        // Toggle Delete Button
        const delBtn = document.getElementById('deleteEventBtn');
        if (delBtn) delBtn.style.display = event ? 'block' : 'none';

        const modal = document.getElementById('modalOverlay');
        if (modal) modal.classList.remove('hidden');
    },



    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('active');
    },

    toggleCalendarSidebar() {
        const sidebar = document.getElementById('calendarSidebar');
        if (sidebar) {
            sidebar.classList.toggle('is-collapsed-mobile');
            const icon = sidebar.querySelector('.sidebar-toggle-icon');
            if (icon && window.lucide) {
                // Lucide icons are SVGs, we just rotate them via CSS
            }
        }
    },

    // --- NAVIGATION ---
    setupEventListeners() {
        // Nav Items
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // Search
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.render());
        }

        // Modal
        const modal = document.getElementById('modalOverlay');
        const showModal = () => {
            app.state.editingEventId = null;
            document.getElementById('eventForm').reset();
            document.getElementById('eventDate').valueAsDate = new Date();
            // Hide delete btn for new events
            const delBtn = document.getElementById('deleteEventBtn');
            if (delBtn) delBtn.style.display = 'none';

            // Push history state to allow back button closing
            history.pushState({ view: app.state.view, modal: true }, '', '#new-event');
            modal.classList.remove('hidden');
        };
        const sidebarCreate = document.getElementById('sidebarCreateBtn');
        if (sidebarCreate) sidebarCreate.onclick = showModal;

        document.getElementById('closeModalBtn').onclick = () => {
            if (history.state && history.state.modal) history.back();
            else modal.classList.add('hidden');
        };


        // Todo Input Enter Key
        const todoInput = document.getElementById('todoInput');
        if (todoInput) {
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') app.todo.add();
            });
        }
        // Filters
        ['work', 'private', 'urgent', 'birthday', 'holiday'].forEach(cat => {
            const el = document.getElementById(`filter-${cat}`);
            if (el) el.onchange = () => this.render();
        });

        // Form Auto-Fill from Contacts
        const eventTitleInput = document.getElementById('eventTitle');
        if (eventTitleInput) {
            eventTitleInput.addEventListener('input', (e) => {
                const text = e.target.value.toLowerCase();
                if (text.length < 3) return;

                // Sort by name length descending to catch full names before partials
                const contacts = [...this.state.contacts].sort((a, b) => b.name.length - a.name.length);

                for (const contact of contacts) {
                    if (contact.name && text.includes(contact.name.toLowerCase())) {
                        const phoneInput = document.getElementById('eventPhone');
                        const emailInput = document.getElementById('eventEmail');

                        // Auto-fill if changed
                        if (contact.phone && phoneInput.value !== contact.phone) {
                            phoneInput.value = contact.phone;
                            app.updateActionLink('eventPhone', 'eventCallBtn', 'tel:');
                            // Visual feedback (optional flash)
                            phoneInput.style.borderColor = 'var(--success)';
                            setTimeout(() => phoneInput.style.borderColor = 'var(--glass-border)', 1000);
                        }
                        if (contact.email && emailInput.value !== contact.email) {
                            emailInput.value = contact.email;
                            app.updateActionLink('eventEmail', 'eventMailBtn', 'mailto:');
                            emailInput.style.borderColor = 'var(--success)';
                            setTimeout(() => emailInput.style.borderColor = 'var(--glass-border)', 1000);
                        }
                        break; // Stop after first match
                    }
                }
            });
        }

        // Live Action Button Updates
        ['eventPhone', 'eventEmail', 'contactPhone', 'contactEmail', 'settingsUserPhone', 'settingsUserEmail'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const isSettings = id.includes('settings');
                const btnId = isSettings ? (id.includes('Phone') ? 'settingsCallBtn' : 'settingsMailBtn') : (id.includes('event') ? (id.includes('Phone') ? 'eventCallBtn' : 'eventMailBtn') : (id.includes('Phone') ? 'contactCallBtn' : 'contactMailBtn'));
                const prefix = id.includes('Phone') ? 'tel:' : 'mailto:';
                el.addEventListener('input', () => app.updateActionLink(id, btnId, prefix));
                // Also update on change for settings (since they have onchange handlers)
                el.addEventListener('change', () => app.updateActionLink(id, btnId, prefix));
            }
        });

        // Form Submit
        document.getElementById('eventForm').onsubmit = (e) => {
            e.preventDefault();
            const event = {
                title: document.getElementById('eventTitle').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                location: document.getElementById('eventLocation').value,
                phone: document.getElementById('eventPhone').value,
                email: document.getElementById('eventEmail').value,
                notes: document.getElementById('eventNotes').value,
                category: document.getElementById('eventCategory').value,
                recurrence: document.getElementById('eventRecurrence').value,
                color: document.getElementById('eventCategory').value === 'urgent' ? '#ef4444' : document.getElementById('eventColor').value
            };
            e.target.reset();
            modal.classList.add('hidden');
            this.addEvent(event);
        };

        // Contact Modal
        document.getElementById('closeContactModalBtn').onclick = app.contacts.closeModal;
        document.getElementById('contactForm').onsubmit = (e) => {
            e.preventDefault();
            const contact = {
                name: document.getElementById('contactName').value,
                phone: document.getElementById('contactPhone').value,
                email: document.getElementById('contactEmail').value,
                address: document.getElementById('contactAddress').value,
                birthday: document.getElementById('contactBirthday').value,
                notes: document.getElementById('contactNotes').value,
                notes: document.getElementById('contactNotes').value,
                isFavorite: document.getElementById('contactIsFavorite').checked,
                isUrgent: document.getElementById('contactIsUrgent') ? document.getElementById('contactIsUrgent').checked : false
            };
            e.target.reset();
            app.contacts.closeModal();
            app.contacts.add(contact);
        };

        // Contact View Switcher
        const contactViewSelector = document.getElementById('contactViewSelector');
        if (contactViewSelector) {
            contactViewSelector.querySelectorAll('button').forEach(btn => {
                const view = btn.getAttribute('data-view');
                btn.classList.toggle('active', app.state.contactView === view);

                btn.onclick = () => {
                    this.state.contactView = view;
                    localStorage.setItem('moltbot_contact_view', view);
                    contactViewSelector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.contacts.render();
                };
            });
        }

        // Auto-close details/summary dropdowns
        document.addEventListener('click', (e) => {
            document.querySelectorAll('details[open]').forEach(details => {
                if (!details.contains(e.target)) {
                    details.removeAttribute('open');
                }
            });
        });

        // Calendar View Switcher
        const viewSelector = document.getElementById('calendarViewSelector');
        if (viewSelector) {
            viewSelector.querySelectorAll('button').forEach(btn => {
                btn.onclick = () => {
                    this.state.calendarView = btn.getAttribute('data-view');
                    viewSelector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.render();
                };
            });
        }

        // Calendar Nav
        const prev = document.getElementById('prevMonth');
        const next = document.getElementById('nextMonth');
        if (prev) prev.onclick = () => {
            const step = this.state.calendarView === 'year' ? 12 : (this.state.calendarView === 'month' ? 1 : 0);
            if (step) {
                this.state.currentDate.setMonth(this.state.currentDate.getMonth() - step);
            } else if (this.state.calendarView === 'week') {
                this.state.currentDate.setDate(this.state.currentDate.getDate() - 7);
            } else {
                this.state.currentDate.setDate(this.state.currentDate.getDate() - 1);
            }
            this.calendar.miniDate = new Date(this.state.currentDate);
            this.render();
        };
        if (next) next.onclick = () => {
            const step = this.state.calendarView === 'year' ? 12 : (this.state.calendarView === 'month' ? 1 : 0);
            if (step) {
                this.state.currentDate.setMonth(this.state.currentDate.getMonth() + step);
            } else if (this.state.calendarView === 'week') {
                this.state.currentDate.setDate(this.state.currentDate.getDate() + 7);
            } else {
                this.state.currentDate.setDate(this.state.currentDate.getDate() + 1);
            }
            this.calendar.miniDate = new Date(this.state.currentDate);
            this.render();
        };
    },

    async navigateTo(page, replace = false) {
        // Immediate Menu Close for responsiveness
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');

        // Visual feedback: Start transition (Avoid "blur" as users find it "verschwommen")
        const mainContent = document.querySelector('.content');
        if (mainContent) {
            mainContent.style.opacity = '0.6';
        }

        // Small delay to let UI settle
        await new Promise(r => setTimeout(r, 100));

        try {
            this.state.view = page;
            localStorage.setItem('moltbot_view', page);

            // Update History
            if (!replace) {
                history.pushState({ view: page }, '', '#' + page);
            }

            document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
            const targetView = document.getElementById(`view-${page}`);
            if (targetView) targetView.classList.add('active');

            document.querySelectorAll('.nav-item, .voice-side-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-page') === page);
            });


            // Toggle Header buttons based on view
            const addContactBtn = document.getElementById('addContactBtn');
            if (addContactBtn) {
                addContactBtn.style.display = (page === 'contacts') ? 'flex' : 'none';
            }

            if (page === 'settings') {
                this.renderWidgetSettings();

                // Update wake word toggle state
                const wakeWordToggle = document.getElementById('wakeWordToggle');
                if (wakeWordToggle) {
                    wakeWordToggle.checked = this.state.isWakeWordEnabled;
                }
            }

            // --- Toggle Back Buttons ---
            const backBtns = [document.getElementById('mobileBackBtn'), document.getElementById('desktopBackBtn')];
            backBtns.forEach(btn => {
                if (btn) btn.classList.toggle('hidden', page === 'dashboard');
            });

            this.render();

        } catch (e) {
            console.error("Navigation error:", e);
        } finally {
            // End transition ALWAYS (Removes the reported "verschwommen" look)
            if (mainContent) {
                mainContent.style.opacity = '1';
                mainContent.style.filter = 'none';
            }
        }
    },



    toggleCard(header) {
        const card = header.closest('.collapsible-card');
        card.classList.toggle('is-collapsed');

        const icon = header.querySelector('.toggle-icon');
        if (icon) {
            const isCollapsed = card.classList.contains('is-collapsed');
            icon.setAttribute('data-lucide', isCollapsed ? 'chevron-down' : 'chevron-up');
            if (window.lucide) lucide.createIcons();
        }
    },

    // --- CALENDAR MODULE ---
    calendar: {
        miniDate: new Date(),

        prevMini() {
            this.miniDate.setMonth(this.miniDate.getMonth() - 1);
            this.renderSidebarMini();
        },

        nextMini() {
            this.miniDate.setMonth(this.miniDate.getMonth() + 1);
            this.renderSidebarMini();
        },

        goToday() {
            app.state.currentDate = new Date();
            this.miniDate = new Date();
            app.render();
        },

        renderSidebarMini() {
            const grid = document.getElementById('sidebarMiniGrid');
            const monthHeader = document.getElementById('sidebarMiniMonth');
            if (!grid) return;

            const year = this.miniDate.getFullYear();
            const month = this.miniDate.getMonth();
            monthHeader.textContent = this.miniDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let html = '';
            ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].forEach(d => html += `<div class="calendar-day-name">${d}</div>`);

            let emptyCells = firstDay === 0 ? 6 : firstDay - 1;
            for (let i = 0; i < emptyCells; i++) html += '<div class="calendar-cell empty"></div>';

            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const currentCellDate = new Date(year, month, d);
                const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                const dayEvents = this.state.events.filter(e => this.isEventOnDate(e, currentCellDate));
                const hasEvent = dayEvents.length > 0;

                let styleStr = '';
                if (hasEvent) {
                    const evt = dayEvents.find(e => e.color) || dayEvents[0];
                    if (evt && evt.color) {
                        styleStr = `background: ${evt.color}; color: #fff; font-weight: 700; border: none;`;
                    } else {
                        styleStr = `background: var(--primary); color: #fff; font-weight: 700; border: none;`;
                    }
                }

                let classStr = `calendar-cell ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`;

                html += `<div class="${classStr}" style="${styleStr}" onclick="app.goToDay('${dateStr}')">${d}</div>`;
            }
            grid.innerHTML = html;
        }
    },

    // --- RENDERING ---
    render() {
        // Auto-archive past events
        this.checkArchivedEvents();

        // Sync Header Info
        const headerName = document.getElementById('headerUserName');
        if (headerName) headerName.textContent = this.state.user.name;

        const userAvatar = this.state.user.avatar || 'logo.svg';
        const headerAvatar = document.getElementById('headerUserAvatar');
        const headerAvatarMob = document.getElementById('headerUserAvatarMobile');
        const headerAvatarSettings = document.getElementById('settingsUserAvatarPreview');

        const updateAv = (el) => {
            if (el) {
                el.src = userAvatar;
                el.style.border = `2px solid var(--primary)`;
                el.style.borderRadius = '50%';
                el.style.objectFit = 'cover';
            }
        };

        updateAv(headerAvatar);
        updateAv(headerAvatarMob);
        updateAv(headerAvatarSettings);



        // Update Visual Settings Inputs
        const setFont = document.getElementById('settingsFont');
        if (setFont) setFont.value = this.state.customFont || 'Outfit';

        const setPrimary = document.getElementById('settingsPrimaryColor');
        if (setPrimary && this.state.customPrimary) setPrimary.value = this.state.customPrimary;

        const setSat = document.getElementById('inputSat');
        const setSatLabel = document.getElementById('labelSat');
        if (setSat) {
            setSat.value = this.state.globalSaturation;
            if (setSatLabel) setSatLabel.textContent = this.state.globalSaturation + '%';
        }

        const setCon = document.getElementById('inputCon');
        const setConLabel = document.getElementById('labelCon');
        if (setCon) {
            setCon.value = this.state.globalContrast;
            if (setConLabel) setConLabel.textContent = this.state.globalContrast + '%';
        }

        const setBri = document.getElementById('inputBri');
        const setBriLabel = document.getElementById('labelBri');
        if (setBri) {
            setBri.value = this.state.globalBrightness;
            if (setBriLabel) setBriLabel.textContent = this.state.globalBrightness + '%';
        }

        const setHC = document.getElementById('settingsHighContrast');
        if (setHC) setHC.checked = this.state.highContrastMode;

        const setBold = document.getElementById('settingsBoldMode');
        if (setBold) setBold.checked = this.state.boldMode;

        const setFontScale = document.getElementById('inputFontScale');
        const setFontLabel = document.getElementById('labelFontScale');
        if (setFontScale) {
            setFontScale.value = this.state.fontSizeScale || 100;
            if (setFontLabel) setFontLabel.textContent = (this.state.fontSizeScale || 100) + '%';
        }

        if (this.state.view === 'dashboard') {
            this.renderDashboard();
        } else if (this.state.view === 'calendar') {
            this.renderCalendar();
            this.calendar.renderSidebarMini();
        } else if (this.state.view === 'todo') {
            this.todo.render();
        } else if (this.state.view === 'contacts') {
            this.contacts.render();
        } else if (this.state.view === 'settings') {
            this.todo.render(); // Redraw categories in settings
            const nameInput = document.getElementById('settingsUserName');
            if (nameInput) nameInput.value = this.state.user.name;
            const addrInput = document.getElementById('settingsUserAddress');
            if (addrInput) addrInput.value = this.state.user.address;
            const emailInput = document.getElementById('settingsUserEmail');
            if (emailInput) {
                emailInput.value = this.state.user.email;
                app.updateActionLink('settingsUserEmail', 'settingsMailBtn', 'mailto:');
            }
            const bdayInput = document.getElementById('settingsUserBirthday');
            if (bdayInput) bdayInput.value = this.state.user.birthday;

            const phoneInput = document.getElementById('settingsUserPhone');
            if (phoneInput) {
                phoneInput.value = this.state.user.phone;
                app.updateActionLink('settingsUserPhone', 'settingsCallBtn', 'tel:');
            }

            const avatarPreview = document.getElementById('settingsUserAvatarPreview');
            if (avatarPreview) {
                avatarPreview.src = this.state.user.avatar || 'logo.svg';
            }

            // Render Holidays in Settings
            const holList = document.getElementById('settingsHolidayList');
            if (holList) {
                const year = new Date().getFullYear();
                const holidays = this.holidays.getForYear(year).sort((a, b) => a.date.localeCompare(b.date));

                holList.innerHTML = holidays.map(h => {
                    const dateObj = new Date(h.date);
                    const dateStr = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
                    const isBW = h.isBW ? '<span style="font-size:0.7em; background:var(--primary); color:white; padding:2px 6px; border-radius:4px; margin-left:8px;">BW</span>' : '';
                    return `
                        <div class="glass" style="padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--glass-border);">
                            <span style="font-weight: 500;">${h.title} ${isBW}</span>
                            <span class="text-muted" style="font-size: 0.9rem;">${dateStr}</span>
                        </div>
                    `;
                }).join('');
            }



            // Populate Quick Action Selects
            const qaLeft = document.getElementById('settingsQALeft');
            if (qaLeft) qaLeft.value = this.state.quickActionLeft;
            const qaRight = document.getElementById('settingsQARight');
            if (qaRight) qaRight.value = this.state.quickActionRight;
            const dockStyle = document.getElementById('settingsDockStyle');
            if (dockStyle) dockStyle.value = this.state.dockStyle;

            const qaSettings = document.getElementById('quickActionSettings');
            if (qaSettings) {
                qaSettings.style.display = (this.state.dockStyle === 'full') ? 'none' : 'grid';
            }

            // Highlight Active Theme Button
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-theme') === this.state.theme);
            });

            // Render menu order settings
            this.renderMenuOrderSettings();
        } else if (this.state.view === 'alarm') {
            this.alarm.render();
        } else if (this.state.view === 'finance') {
            this.finance.render();
        }

        this.renderVoiceDock();
        if (window.lucide) lucide.createIcons();
    },

    updateQuickAction(side, action) {
        if (side === 'Left') {
            this.state.quickActionLeft = action;
            localStorage.setItem('moltbot_qa_left', action);
        } else {
            this.state.quickActionRight = action;
            localStorage.setItem('moltbot_qa_right', action);
        }
        this.renderVoiceDock();
    },

    updateDockStyle(style) {
        this.state.dockStyle = style;
        localStorage.setItem('moltbot_dock_style', style);
        this.renderVoiceDock();
    },

    renderVoiceDock() {
        const actionIcons = {
            dashboard: 'layout-dashboard',
            calendar: 'calendar',
            finance: 'wallet',
            team: 'users',
            contacts: 'book-user',
            todo: 'check-square',
            alarm: 'alarm-clock',
            settings: 'settings'
        };

        const actionLabels = {
            dashboard: 'Dash',
            calendar: 'Plan',
            finance: 'Geld',
            team: 'Team',
            contacts: 'Leute',
            todo: 'ToDo',
            alarm: 'Uhr',
            settings: 'Setup'
        };

        const dock = document.querySelector('.voice-dock');
        if (!dock) return;

        // Apply class for CSS
        dock.classList.toggle('is-full-bar', this.state.dockStyle === 'full');

        if (this.state.dockStyle === 'full') {
            const views = this.state.menuOrder;

            let html = '';
            views.forEach((v, idx) => {
                // Add mic in the middle (after 4 items)
                if (idx === 4) {
                    html += `<button id="voiceControlBtn" class="voice-btn" onclick="app.voice.start()">
                                <i data-lucide="mic"></i>
                                <span class="dock-label">Pear</span>
                            </button>`;
                }
                html += `
                    <button class="voice-side-btn ${this.state.view === v ? 'active' : ''}" onclick="app.navigateTo('${v}')">
                        <i data-lucide="${actionIcons[v]}"></i>
                        <span class="dock-label">${actionLabels[v]}</span>
                    </button>
                `;
            });
            dock.innerHTML = html;
        } else {
            dock.innerHTML = `
                <button id="qaLeftBtn" class="voice-side-btn left" onclick="app.navigateTo('${this.state.quickActionLeft}')">
                    <i data-lucide="${actionIcons[this.state.quickActionLeft] || 'star'}"></i>
                    <span class="dock-label">${actionLabels[this.state.quickActionLeft]}</span>
                </button>
                <button id="voiceControlBtn" class="voice-btn" onclick="app.voice.start()">
                    <i data-lucide="mic"></i>
                    <span class="dock-label">Pear</span>
                </button>
                <button id="qaRightBtn" class="voice-side-btn right" onclick="app.navigateTo('${this.state.quickActionRight}')">
                    <i data-lucide="${actionIcons[this.state.quickActionRight] || 'star'}"></i>
                    <span class="dock-label">${actionLabels[this.state.quickActionRight]}</span>
                </button>
            `;
        }

        if (window.lucide) lucide.createIcons();
    },

    renderMenuOrderSettings() {
        const container = document.getElementById('menuOrderList');
        if (!container) return;

        const menuLabels = {
            dashboard: 'Dashboard',
            calendar: 'Kalender',
            contacts: 'Kontakte',
            todo: 'Aufgaben',
            finance: 'Finanzen',
            alarm: 'Wecker',
            team: 'Team Sync',
            settings: 'Einstellungen'
        };

        const menuIcons = {
            dashboard: 'layout-dashboard',
            calendar: 'calendar',
            contacts: 'contact',
            todo: 'check-square',
            finance: 'wallet',
            alarm: 'clock',
            team: 'users',
            settings: 'settings'
        };

        container.innerHTML = this.state.menuOrder.map((item, index) => `
            <div class="menu-order-item" draggable="true" data-menu-id="${item}" 
                style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: 12px; cursor: move; transition: all 0.2s;">
                <i data-lucide="grip-vertical" size="18" style="color: var(--text-muted);"></i>
                <i data-lucide="${menuIcons[item]}" size="20" style="color: var(--primary);"></i>
                <span style="flex: 1; font-weight: 600;">${menuLabels[item]}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(var(--primary-rgb), 0.1); padding: 4px 8px; border-radius: 6px;">#${index + 1}</span>
            </div>
        `).join('');

        const items = container.querySelectorAll('.menu-order-item');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.innerHTML);
                item.style.opacity = '0.4';
            });

            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const afterElement = this.getDragAfterElement(container, e.clientY);
                const draggable = document.querySelector('.menu-order-item[style*="opacity: 0.4"]');
                if (afterElement == null) {
                    container.appendChild(draggable);
                } else {
                    container.insertBefore(draggable, afterElement);
                }
            });

            item.addEventListener('drop', (e) => {
                e.stopPropagation();
                this.updateMenuOrderFromDOM();
            });
        });

        if (window.lucide) lucide.createIcons();
    },

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.menu-order-item:not([style*="opacity: 0.4"])')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },

    updateMenuOrderFromDOM() {
        const container = document.getElementById('menuOrderList');
        if (!container) return;

        const items = container.querySelectorAll('.menu-order-item');
        const newOrder = Array.from(items).map(item => item.getAttribute('data-menu-id'));

        this.state.menuOrder = newOrder;
        localStorage.setItem('moltbot_menu_order', JSON.stringify(newOrder));

        this.renderMenuOrderSettings();
        this.renderVoiceDock();
        this.notify('Menü aktualisiert', 'Die Reihenfolge wurde gespeichert.', 'success');
    },

    resetMenuOrder() {
        const defaultOrder = ['dashboard', 'calendar', 'contacts', 'todo', 'finance', 'alarm', 'team', 'settings'];
        this.state.menuOrder = defaultOrder;
        localStorage.setItem('moltbot_menu_order', JSON.stringify(defaultOrder));

        this.renderMenuOrderSettings();
        this.renderVoiceDock();
        this.notify('Zurückgesetzt', 'Standardreihenfolge wiederhergestellt.', 'success');
    },


    // --- FINANCE MODULE ---
    finance: {
        chart: null,

        openQuickAdd() {
            const modal = document.getElementById('quickExpenseModal');
            if (!modal) return;
            const form = document.getElementById('quickExpenseForm');
            if (form) form.reset();
            const dateInput = document.getElementById('quickFinDate');
            if (dateInput) dateInput.valueAsDate = new Date();

            const title = modal.querySelector('h3');
            if (title) title.textContent = 'Ausgabe hinzufügen';

            modal.classList.remove('hidden');
            document.getElementById('quickFinAmount').focus();
        },

        openIncomeAdd() {
            this.openQuickAdd();
            const typeSelect = document.getElementById('quickFinType');
            if (typeSelect) typeSelect.value = 'income';

            // Update title of modal if possible (optional but nice)
            const title = document.querySelector('#quickExpenseModal h3');
            if (title) title.textContent = 'Einnahme erfassen';
        },

        saveQuickAdd(e) {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('quickFinAmount').value);
            const date = document.getElementById('quickFinDate').value;
            const source = document.getElementById('quickFinSource').value || 'Schnell-Eintrag';
            const type = document.getElementById('quickFinType').value || 'expense';

            if (isNaN(amount)) return;

            const entry = {
                id: Date.now().toString(),
                amount,
                date,
                type,
                source,
                createdAt: Date.now()
            };

            app.state.finance.push(entry);
            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();

            document.getElementById('quickExpenseModal').classList.add('hidden');
            this.render();
            this.checkBudget(); // Trigger Warning Check
            app.notify(type === 'income' ? "Einnahme gespeichert" : "Ausgabe gespeichert",
                `${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} für ${source} erfasst.`);
        },

        addEntry(e) {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('finAmount').value);
            const date = document.getElementById('finDate').value;
            const source = document.getElementById('finSource').value || 'Eintrag';
            const type = document.getElementById('finType').value || 'expense';

            if (isNaN(amount)) return;

            const entry = {
                id: Date.now().toString(),
                amount,
                date,
                type,
                source,
                createdAt: Date.now()
            };

            app.state.finance.push(entry);
            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();

            document.getElementById('financeForm').reset();
            const dateInput = document.getElementById('finDate');
            if (dateInput) dateInput.valueAsDate = new Date();
            this.render();
            this.checkBudget(); // Trigger Warning Check
        },


        editSavingsGoal() {
            const newSavingsGoal = prompt("Wie viel möchtest du diesen Monat als Reserve sparen?", app.state.savingsGoal);
            if (newSavingsGoal !== null) {
                app.state.savingsGoal = parseFloat(newSavingsGoal) || 0;
                app.saveLocal();
                if (app.sync && app.sync.push) app.sync.push();
                this.render();
            }
        },

        editSavingsBalance() {
            const newBalanceValue = prompt("Aktueller Stand deines Sparkontos (€):", app.state.savingsBalance);
            if (newBalanceValue !== null) {
                app.state.savingsBalance = parseFloat(newBalanceValue) || 0;
                app.saveLocal();
                if (app.sync && app.sync.push) app.sync.push();
                this.render();
            }
        },

        depositToSavings(amount, source = "Monats-Überschuss") {
            if (amount <= 0) return;
            if (confirm(`Möchtest du ${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} auf dein Sparkonto einzahlen?`)) {
                app.state.savingsBalance += amount;
                app.saveLocal();
                if (app.sync && app.sync.push) app.sync.push();
                this.render();
                app.notify("Sparkonto Update", `${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} wurden eingezahlt.`);
            }
        },

        editBudget() {
            const newBudget = prompt('Bitte gib dein monatliches Budget Limit ein (€):', app.state.monthlyBudget);
            if (newBudget !== null) {
                const b = parseFloat(newBudget);
                app.state.monthlyBudget = isNaN(b) ? 0 : b;
                localStorage.setItem('moltbot_budget', app.state.monthlyBudget);
                this.render();
            }
        },

        editBudgetWarning() {
            const newLimit = prompt('Ab welchem Restbetrag soll ich dich warnen? (€):', app.state.budgetWarningLimit);
            if (newLimit !== null) {
                const l = parseFloat(newLimit);
                app.state.budgetWarningLimit = isNaN(l) ? 0 : l;
                localStorage.setItem('moltbot_budget_warning', app.state.budgetWarningLimit);
                this.render();
            }
        },

        checkBudget() {
            if (app.state.monthlyBudget <= 0) return;

            const currentMonth = new Date().toISOString().substring(0, 7);
            const monthlyExpenses = app.state.finance
                .filter(e => e.date.startsWith(currentMonth) && e.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const remaining = app.state.monthlyBudget - monthlyExpenses;

            if (remaining <= 0) {
                app.notify("Budget Alarm! 🚨", "Du hast dein monatliches Budget Limit erreicht oder überschritten!", "danger");
                if (window.vibrate) window.vibrate([200, 100, 200]);
            } else if (remaining <= app.state.budgetWarningLimit) {
                app.notify("Budget Warnung! ⚠️", `Dein Budget neigt sich dem Ende zu. Nur noch ${remaining.toFixed(2)}€ übrig.`, "warning");
            }
        },

        deleteEntry(id) {
            if (confirm("Eintrag wirklich löschen?")) {
                const entry = app.state.finance.find(e => e.id === id);
                if (entry) {
                    entry.deleted = true;
                    entry.updatedAt = Date.now();
                    app.saveLocal();
                    if (app.sync && app.sync.push) app.sync.push();
                    this.render();
                }
            }
        },

        editEntry(id) {
            const e = app.state.finance.find(entry => entry.id === id);
            if (!e) return;

            const newSource = prompt("Beschreibung:", e.source);
            if (newSource === null) return;
            const newAmountStr = prompt("Betrag in €:", e.amount);
            if (newAmountStr === null) return;
            const newDate = prompt("Datum (JJJJ-MM-TT):", e.date);
            if (newDate === null) return;
            const newType = confirm(`Ist dies eine EINNAHME?\n\n(OK = Einnahme, Abbrechen = Ausgabe)`) ? 'income' : 'expense';

            e.source = newSource;
            e.amount = parseFloat(newAmountStr) || 0;
            e.date = newDate;
            e.type = newType;
            e.updatedAt = Date.now();

            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();
            this.render();
        },

        clearAll() {
            if (confirm('Möchtest du wirklich den gesamten Finanzverlauf löschen?')) {
                const now = Date.now();
                app.state.finance.forEach(e => {
                    e.deleted = true;
                    e.updatedAt = now;
                });
                app.saveLocal();
                if (app.sync && app.sync.push) app.sync.push();
                this.render();
            }
        },

        render() {
            const tableBody = document.getElementById('financeTableBody');
            if (!tableBody) return;

            // Ensure date is set to today
            const dateInput = document.getElementById('finDate');
            if (dateInput && !dateInput.value) dateInput.valueAsDate = new Date();

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Today's start
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            // Start of this week (Monday)
            const freshNowForWeek = new Date();
            const currentDay = freshNowForWeek.getDay();
            const diff = freshNowForWeek.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
            const weekStart = new Date(new Date(freshNowForWeek).setDate(diff)).setHours(0, 0, 0, 0);

            // Calculate Stats
            let dailyExpenses = 0;
            let weeklyExpenses = 0;
            let monthlyExpenses = 0;
            let monthlyIncome = 0;
            let yearlyBalance = 0;
            let bookedFixedExpenses = 0;

            app.state.finance.forEach(e => {
                if (e.deleted) return;
                const d = new Date(e.date);
                const time = d.getTime();
                const isIncome = e.type === 'income';

                if (d.getFullYear() === currentYear) {
                    yearlyBalance += isIncome ? e.amount : -e.amount;
                    if (d.getMonth() === currentMonth) {
                        if (isIncome) monthlyIncome += e.amount;
                        else {
                            monthlyExpenses += e.amount;
                            if (e.source && e.source.startsWith('FIX:')) {
                                bookedFixedExpenses += e.amount;
                            }
                        }
                    }
                }

                if (time >= todayStart && !isIncome) {
                    dailyExpenses += e.amount;
                }

                if (time >= weekStart && !isIncome) {
                    weeklyExpenses += e.amount;
                }
            });

            // Variable Expenses = All expenses that are NOT fixed costs
            const variableExpenses = monthlyExpenses - bookedFixedExpenses;

            const balance = monthlyIncome - monthlyExpenses;
            const remainingBudget = app.state.monthlyBudget - monthlyExpenses;

            // Calculate Fixed Costs Plan
            let plannedFixedExpenses = 0;
            let plannedFixedIncome = 0;
            app.state.fixedCosts.forEach(f => {
                if (f.type === 'income') plannedFixedIncome += f.amount;
                else plannedFixedExpenses += f.amount;
            });

            // "Netto" calculation: Actual Income - Planned Fixed Expenses
            const nettoRemaining = monthlyIncome - plannedFixedExpenses;

            // "Verfügbar" calculation: Netto - Already spent variable costs - Savings Goal
            const totalAvailable = nettoRemaining - variableExpenses - app.state.savingsGoal;

            // Intelligent Daily Budget Calculation
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const remainingDays = lastDayOfMonth - now.getDate() + 1; // Includes today
            const dailyLimit = totalAvailable > 0 ? (totalAvailable / remainingDays) : 0;

            // Update UI
            if (document.getElementById('finTodayTotal')) {
                document.getElementById('finTodayTotal').textContent = dailyExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            }
            if (document.getElementById('finWeekTotal')) {
                document.getElementById('finWeekTotal').textContent = weeklyExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            }

            if (document.getElementById('finTotalIncome')) {
                document.getElementById('finTotalIncome').textContent = monthlyIncome.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            }
            if (document.getElementById('finTotalExpenses')) {
                document.getElementById('finTotalExpenses').textContent = monthlyExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            }
            if (document.getElementById('finFixedPlan')) {
                document.getElementById('finFixedPlan').textContent = '-' + plannedFixedExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                document.getElementById('finFixedPlan').style.color = 'var(--danger)';
            }
            if (document.getElementById('finNetto')) {
                const nettoEl = document.getElementById('finNetto');
                nettoEl.textContent = (nettoRemaining < 0 ? '-' : '+') + Math.abs(nettoRemaining).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                nettoEl.style.color = nettoRemaining < 0 ? 'var(--danger)' : 'var(--success)';
            }
            if (document.getElementById('finSavingsGoal')) {
                document.getElementById('finSavingsGoal').textContent = app.state.savingsGoal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            }

            // Automatic Savings Calculation: Historical Balance + Current Month Balance
            const currentMonthBalance = monthlyIncome - monthlyExpenses;
            const totalSavingsAutomatic = app.state.savingsBalance + currentMonthBalance;

            if (document.getElementById('finSavingsBalance')) {
                document.getElementById('finSavingsBalance').textContent = totalSavingsAutomatic.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            }

            if (document.getElementById('finDailyAvailable')) {
                const dailyEl = document.getElementById('finDailyAvailable');
                dailyEl.textContent = (totalAvailable < 0 ? '-' : '+') + Math.abs(totalAvailable).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                dailyEl.style.color = totalAvailable < 0 ? 'var(--danger)' : 'var(--success)';
            }

            // New: Daily Intelligent Limit
            if (document.getElementById('finDailyLimit')) {
                const limitEl = document.getElementById('finDailyLimit');
                limitEl.textContent = dailyLimit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                limitEl.style.color = dailyLimit <= 0 ? 'var(--danger)' : 'var(--primary)';
            }
            if (document.getElementById('finDaysLeft')) {
                document.getElementById('finDaysLeft').textContent = `noch ${remainingDays} Tage im Monat`;
            }

            if (document.getElementById('finBalance')) {
                const balanceEl = document.getElementById('finBalance');
                balanceEl.textContent = (balance < 0 ? '-' : '+') + Math.abs(balance).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                balanceEl.style.color = balance < 0 ? 'var(--danger)' : 'var(--success)';
            }

            document.getElementById('finTotalBudget').textContent = app.state.monthlyBudget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            document.getElementById('finRemaining').textContent = (remainingBudget < 0 ? '-' : '') + Math.abs(remainingBudget).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

            const yearTotalEl = document.getElementById('finYearTotal');
            if (yearTotalEl) {
                yearTotalEl.textContent = (yearlyBalance < 0 ? '-' : '+') + Math.abs(yearlyBalance).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                yearTotalEl.style.color = yearlyBalance < 0 ? 'var(--danger)' : 'var(--success)';
            }

            if (document.getElementById('finWarningLimit')) {
                document.getElementById('finWarningLimit').textContent = app.state.budgetWarningLimit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            }

            // Update settings inputs if they exist
            if (document.getElementById('settingsMonthlyBudget')) {
                document.getElementById('settingsMonthlyBudget').value = app.state.monthlyBudget;
            }
            if (document.getElementById('settingsBudgetWarning')) {
                document.getElementById('settingsBudgetWarning').value = app.state.budgetWarningLimit;
            }

            // Apply warning color if budget is exceeded
            const remainingEl = document.getElementById('finRemaining');
            if (remainingEl) {
                remainingEl.style.color = remainingBudget < 0 ? 'var(--danger)' : (remainingBudget <= app.state.budgetWarningLimit ? 'var(--warning)' : 'var(--text-bright)');
            }

            // Render Table (Filter out deleted entries)
            const sorted = [...app.state.finance]
                .filter(e => !e.deleted)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            tableBody.innerHTML = sorted.map(e => `
                <tr class="contact-row" style="border-bottom: 1px solid var(--glass-border);">
                    <td style="padding: 16px; color: var(--text-muted); font-size: 0.9rem;">${new Date(e.date).toLocaleDateString('de-DE')}</td>
                    <td style="padding: 16px; font-weight: 500;">${e.source}</td>
                    <td class="${e.type === 'income' ? 'text-success' : 'text-danger'}" style="padding: 16px; font-weight: 700; text-align: right;">
                        ${e.type === 'income' ? '+' : '-'} ${e.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td style="padding: 16px; display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="btn-icon" onclick="app.finance.editEntry('${e.id}')" style="width: 32px; height: 32px; background: var(--bg-hover); border-radius: var(--radius-sm); border: none; color: var(--text-muted);">
                            <i data-lucide="edit-3" size="14"></i>
                        </button>
                        <button class="btn-icon-danger" onclick="app.finance.deleteEntry('${e.id}')" style="width: 32px; height: 32px; border-radius: var(--radius-sm);">
                            <i data-lucide="trash-2" size="14"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            this.updateChart();
            this.renderFixedCosts(); // New: Keep templates list updated
            if (window.lucide) lucide.createIcons();
        },

        updateChart() {
            const ctx = document.getElementById('financeChart');
            if (!ctx) return;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            let monthlyExpenses = 0;
            const sourceTotals = {};

            app.state.finance.forEach(e => {
                if (e.deleted) return;
                const d = new Date(e.date);
                if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && e.type !== 'income') {
                    monthlyExpenses += e.amount;
                    sourceTotals[e.source] = (sourceTotals[e.source] || 0) + e.amount;
                }
            });

            const remaining = Math.max(0, app.state.monthlyBudget - monthlyExpenses);
            const labels = Object.keys(sourceTotals);
            const values = Object.values(sourceTotals);

            // Add remaining budget as a segment
            if (remaining > 0) {
                labels.push('Budget Frei');
                values.push(remaining);
            }

            if (this.chart) this.chart.destroy();

            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
                            '#ec4899', '#64748b', '#22c55e', '#eab308', '#a1a1aa'
                        ],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94a3b8',
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const val = context.raw;
                                    return `${context.label}: ${val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`;
                                }
                            }
                        }
                    }
                }
            });
        },

        // --- FIXED COSTS (TEMPLATES) ---
        addFixedCost() {
            const name = document.getElementById('fixedCostName').value.trim();
            const amount = parseFloat(document.getElementById('fixedCostAmount').value);
            const type = document.getElementById('fixedCostType').value;

            if (!name || isNaN(amount)) return;

            app.state.fixedCosts.push({
                id: Date.now().toString(),
                name,
                amount,
                type
            });

            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();

            document.getElementById('fixedCostName').value = '';
            document.getElementById('fixedCostAmount').value = '';

            this.renderFixedCosts();
            this.showToast("Fixkosten-Vorlage gespeichert", "var(--primary)");
        },

        createBaseTemplates() {
            const items = [
                { name: 'Gehalt 💰', amount: 2500, type: 'income' },
                { name: 'Miete/Wohnen 🏠', amount: 850, type: 'expense' },
                { name: 'Strom/Wasser ⚡', amount: 120, type: 'expense' },
                { name: 'Internet/Mobilfunk 🌐', amount: 50, type: 'expense' },
                { name: 'Versicherung 🛡️', amount: 80, type: 'expense' },
                { name: 'Einkaufen (Plan) 🛒', amount: 400, type: 'expense' },
                { name: 'Tanken (Plan) 🚗', amount: 150, type: 'expense' }
            ];

            if (confirm("Möchtest du Standard-Vorlagen hinzufügen? Bereits vorhandene Vorlagen (gleicher Name) werden nicht doppelt erstellt.")) {
                items.forEach(item => {
                    if (!app.state.fixedCosts.find(f => f.name === item.name)) {
                        app.state.fixedCosts.push({
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                            ...item
                        });
                    }
                });
                app.saveLocal();
                if (app.sync && app.sync.push) app.sync.push();
                this.renderFixedCosts();
                this.render();
                app.notify("Setup abgeschlossen", "Deine Vorlagen wurden aktualisiert.");
            }
        },

        deleteFixedCost(id) {
            const index = app.state.fixedCosts.findIndex(f => f.id === id);
            if (index > -1) {
                app.state.fixedCosts.splice(index, 1);
                app.saveLocal();
                if (app.sync && app.sync.push) app.sync.push();
                this.renderFixedCosts();
            }
        },

        editFixedCost(id) {
            const f = app.state.fixedCosts.find(cost => cost.id === id);
            if (!f) return;

            const newName = prompt("Name der Fixkosten:", f.name);
            if (newName === null) return;
            const newAmountStr = prompt("Betrag in €:", f.amount);
            if (newAmountStr === null) return;

            f.name = newName;
            f.amount = parseFloat(newAmountStr) || 0;

            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();
            this.renderFixedCosts();
            this.render();
        },

        checkAndApplyAutoFixedCosts() {
            const now = new Date();
            const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

            // 1. Check if already marked as applied via Month-Key
            if (app.state.lastFixedCostsMonth === currentMonthKey) return;

            // NEW: Auto-Harvest Savings from Previous Month before starting new one
            if (app.state.lastFixedCostsMonth) {
                const [y, m] = app.state.lastFixedCostsMonth.split('-').map(Number);
                let prevMonthIncome = 0;
                let prevMonthExpenses = 0;

                app.state.finance.forEach(e => {
                    if (e.deleted) return;
                    const d = new Date(e.date);
                    if (d.getFullYear() === y && d.getMonth() === (m - 1)) {
                        if (e.type === 'income') prevMonthIncome += e.amount;
                        else prevMonthExpenses += e.amount;
                    }
                });

                const prevBalance = prevMonthIncome - prevMonthExpenses;
                if (prevBalance > 0) {
                    console.log(`Auto-Harvesting ${prevBalance} € from last month into Savings Account.`);
                    app.state.savingsBalance += prevBalance;
                }
            }

            // 2. Extra Safety: Check if entries starting with "FIX:" already exist for this month
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const entriesExist = app.state.finance.some(e => {
                const d = new Date(e.date);
                return !e.deleted &&
                    d.getFullYear() === currentYear &&
                    d.getMonth() === currentMonth &&
                    e.source.startsWith('FIX:');
            });

            if (entriesExist) {
                app.state.lastFixedCostsMonth = currentMonthKey;
                app.saveLocal();
                return;
            }

            // If no templates, just update the tracker to current month
            if (!app.state.fixedCosts || app.state.fixedCosts.length === 0) {
                app.state.lastFixedCostsMonth = currentMonthKey;
                app.saveLocal();
                return;
            }

            console.log(`Auto-Applying Fixed Costs for ${currentMonthKey}`);

            // Create the first-of-month date string
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

            app.state.fixedCosts.forEach(f => {
                app.state.finance.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    amount: f.amount,
                    date: dateStr,
                    type: f.type,
                    source: `FIX: ${f.name}`,
                    createdAt: Date.now()
                });
            });

            app.state.lastFixedCostsMonth = currentMonthKey;
            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();

            if (app.state.view === 'finance') this.render();

            app.notify("Automatischer Finanzplaner", `${app.state.fixedCosts.length} Fixkosten wurden für diesen Monat automatisch gebucht.`);
        },

        applyFixedCosts() {
            if (app.state.fixedCosts.length === 0) {
                alert("Du hast noch keine Fixkosten-Vorlagen erstellt.");
                return;
            }

            if (!confirm(`Möchtest du alle ${app.state.fixedCosts.length} Fixkosten für den aktuellen Monat buchen?`)) return;

            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const entriesAdded = [];

            app.state.fixedCosts.forEach(f => {
                const entry = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    amount: f.amount,
                    date: dateStr,
                    type: f.type,
                    source: `FIX: ${f.name}`,
                    createdAt: Date.now()
                };
                app.state.finance.push(entry);
                entriesAdded.push(entry);
            });

            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();

            this.render();
            this.renderFixedCosts();
            alert(`${entriesAdded.length} Fixkosten wurden erfolgreich für heute gebucht.`);
        },

        renderFixedCosts() {
            const list = document.getElementById('fixedCostsList');
            if (!list) return;

            if (!app.state.fixedCosts || app.state.fixedCosts.length === 0) {
                list.innerHTML = '<p class="text-muted" style="text-align:center; padding:20px; font-style:italic;">Noch keine Vorlagen vorhanden.</p>';
                return;
            }

            list.innerHTML = app.state.fixedCosts.map(f => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-radius: var(--radius-md); background: var(--bg-element); border: 1px solid var(--glass-border); margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${f.type === 'income' ? 'var(--success)' : 'var(--danger)'}; color: var(--bg-card);">
                            <i data-lucide="${f.type === 'income' ? 'trending-up' : 'trending-down'}" size="18"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700; font-size: 1rem; color: var(--text-main);">${f.name}</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">${f.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-icon" onclick="app.finance.editFixedCost('${f.id}')" style="width: 36px; height: 36px; background: var(--bg-hover); border-radius: var(--radius-sm); border: none; color: var(--text-muted);">
                            <i data-lucide="edit-3" size="16"></i>
                        </button>
                        <button class="btn-icon-danger" onclick="app.finance.deleteFixedCost('${f.id}')" style="width: 36px; height: 36px; border-radius: var(--radius-sm);">
                            <i data-lucide="trash-2" size="16"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            if (window.lucide) lucide.createIcons();
        },

        showToast(text, color) {
            // Helper if not defined globally
            if (app.alarm && app.alarm.showToast) {
                app.alarm.showToast(text, color);
            } else {
                console.log("Toast:", text);
            }
        }
    },

    renderDriveMode() {
        const driveContainer = document.getElementById('dashboardDriveMode');
        if (!driveContainer) return;

        const today = new Date().toISOString().split('T')[0];
        // Get today's events with location info
        const driveEvents = this.state.events.filter(e =>
            !e.archived &&
            e.date === today &&
            e.location && e.location.trim() !== '' &&
            e.category !== 'holiday'
        ).sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

        if (driveEvents.length === 0) {
            driveContainer.style.display = 'none';
            return;
        }

        driveContainer.style.display = 'block';

        const now = new Date();
        const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        let isAnyUrgent = false;

        let stopsHtml = driveEvents.map((e, index) => {
            // Calculate departure time (Travel Time + 20 min buffer)
            const metrics = this.state.travelMetrics ? this.state.travelMetrics[e.id] : null;
            const travelMins = metrics ? metrics.duration : 0;
            const totalBuffer = travelMins + 20;

            const [hours, minutes] = (e.time || '00:00').split(':').map(Number);
            const depDate = new Date();
            depDate.setHours(hours, minutes - totalBuffer, 0, 0);
            const depTimeStr = depDate.getHours().toString().padStart(2, '0') + ':' + depDate.getMinutes().toString().padStart(2, '0');

            if (depTimeStr === currentTimeStr) isAnyUrgent = true;

            // Check for phone
            let phone = e.phone;
            if (!phone) {
                const contact = this.state.contacts.find(c => c.name && e.title.includes(c.name));
                if (contact) phone = contact.phone;
            }

            return `
                <div style="display: flex; align-items: flex-start; gap: 12px; position: relative; padding-bottom: ${index === driveEvents.length - 1 ? '0' : '20px'};">
                    ${index !== driveEvents.length - 1 ? '<div style="position: absolute; left: 14px; top: 30px; bottom: 0; width: 2px; background: rgba(var(--primary-rgb), 0.2);"></div>' : ''}
                    <div style="width: 30px; height: 30px; background: rgba(var(--primary-rgb), 0.1); border: 2px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 2;">
                        <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary);">${index + 1}</span>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="font-weight: 700; font-size: 1rem; color: var(--text-main);">${e.title}</div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${phone ? `
                                    <a href="tel:${phone}" onclick="event.stopPropagation()" class="btn-icon-subtle" style="width: 28px; height: 28px; color: var(--success); background: rgba(var(--success-rgb), 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                        <i data-lucide="phone" size="14"></i>
                                    </a>
                                ` : ''}
                                <div style="background: rgba(var(--primary-rgb), 0.1); color: var(--primary); font-size: 0.7rem; padding: 2px 8px; border-radius: 6px; font-weight: 800;">
                                    Abfahrt: ${depTimeStr}
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px;">
                            <i data-lucide="clock" size="14"></i> ${e.time || '--:--'} Uhr
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-top: 4px;">
                            <i data-lucide="map-pin" size="14"></i> ${e.location}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        driveContainer.innerHTML = `
            <div class="card glass animate-in ${isAnyUrgent ? 'drive-urgent' : ''}" style="margin-bottom: 20px; border: 1px solid rgba(var(--primary-rgb), 0.2); background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), rgba(0,0,0,0));">
                <div style="padding: 20px 20px 10px 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="icon-circle" style="background: rgba(var(--primary-rgb), 0.1); color: var(--primary); width: 36px; height: 36px; border-radius: 10px;">
                            <i data-lucide="car" size="18"></i>
                        </div>
                        <div>
                            <h3 style="font-size: 1.1rem; margin: 0;">Drive Mode</h3>
                            <small style="color: var(--text-muted);">${driveEvents.length} Ziele für heute</small>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="app.startDriveModeNavigation()" style="padding: 10px 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; border-radius: 12px; font-size: 0.9rem;">
                        <i data-lucide="navigation" size="18"></i> Route starten
                    </button>
                </div>
                
                <div style="padding: 10px 25px 25px 25px;">
                    <div style="margin-bottom: 15px; font-size: 0.85rem; color: var(--text-muted); font-style: italic; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="map-pin" size="14" style="color: var(--primary);"></i> Start: Aktueller Standort
                    </div>
                    ${stopsHtml}
                    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(var(--primary-rgb), 0.1); font-size: 0.75rem; color: var(--primary); font-weight: 600;">
                        <i data-lucide="info" size="14"></i> Abfahrt = Fahrzeit + 20 Min. Puffer.
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    },

    checkDepartureReminders() {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        // Refresh travel metrics every 15 mins if needed
        if (!this.lastTravelRefresh || (now.getTime() - this.lastTravelRefresh > 900000)) {
            this.calculateRealTravelTimes();
            this.lastTravelRefresh = now.getTime();
        }

        if (!this.departureNotified) this.departureNotified = new Set();

        this.state.events.forEach(e => {
            if (!e.archived && e.date === todayStr && e.location && e.time) {
                const metrics = this.state.travelMetrics ? this.state.travelMetrics[e.id] : null;
                const travelMins = metrics ? metrics.duration : 0;
                const totalBuffer = travelMins + 20;

                const [hours, minutes] = e.time.split(':').map(Number);
                const depDate = new Date();
                depDate.setHours(hours, minutes - totalBuffer, 0, 0);

                const depTimeStr = depDate.getHours().toString().padStart(2, '0') + ':' + depDate.getMinutes().toString().padStart(2, '0');
                const reminderKey = `${e.id}_${depTimeStr}`;

                if (currentTimeStr === depTimeStr && !this.departureNotified.has(reminderKey)) {
                    const infoText = travelMins > 0 ? `(Fahrtzeit: ~${travelMins} Min + 20 Min Puffer)` : `(inkl. 20 Min Puffer)`;
                    this.notify(
                        "Drive Mode: Zeit loszufahren! 🚗",
                        `Dein Termin "${e.title}" in ${e.location} beginnt um ${e.time}. Bitte jetzt losfahren ${infoText}.`,
                        '/'
                    );
                    this.departureNotified.add(reminderKey);
                    // Refresh UI to show pulse
                    this.renderDriveMode();
                }
            }
        });
    },

    startDriveModeNavigation() {
        if (!navigator.geolocation) {
            alert("Geolocation wird von deinem Browser nicht unterstützt.");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const driveEvents = this.state.events.filter(e =>
            !e.archived &&
            e.date === today &&
            e.location && e.location.trim() !== '' &&
            e.category !== 'holiday'
        ).sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

        if (driveEvents.length === 0) return;

        navigator.geolocation.getCurrentPosition((position) => {
            const origin = `${position.coords.latitude},${position.coords.longitude}`;
            const destination = encodeURIComponent(driveEvents[driveEvents.length - 1].location);

            let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

            if (driveEvents.length > 1) {
                const waypoints = driveEvents.slice(0, -1).map(e => encodeURIComponent(e.location)).join('|');
                url += `&waypoints=${waypoints}`;
            }

            window.open(url, '_blank');
        }, (error) => {
            console.error("Geolocation failed for drive mode:", error);
            const destination = encodeURIComponent(driveEvents[driveEvents.length - 1].location);
            let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
            if (driveEvents.length > 1) {
                const waypoints = driveEvents.slice(0, -1).map(e => encodeURIComponent(e.location)).join('|');
                url += `&waypoints=${waypoints}`;
            }
            window.open(url, '_blank');
        });
    },

    async calculateRealTravelTimes() {
        if (!navigator.geolocation) return;

        const today = new Date().toISOString().split('T')[0];
        const driveEvents = this.state.events.filter(e =>
            !e.archived && e.date === today && e.location && e.location.trim() !== '' && e.category !== 'holiday'
        );

        if (driveEvents.length === 0) return;

        navigator.geolocation.getCurrentPosition(async (position) => {
            const origin = { lat: position.coords.latitude, lon: position.coords.longitude };

            if (!this.state.travelMetrics) this.state.travelMetrics = {};

            for (const event of driveEvents) {
                try {
                    // 1. Geocode if needed
                    let destCoords = event.coords;
                    if (!destCoords) {
                        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.location)}&limit=1`;
                        const geoRes = await fetch(geoUrl);
                        const geoData = await geoRes.json();
                        if (geoData && geoData[0]) {
                            destCoords = { lat: geoData[0].lat, lon: geoData[0].lon };
                            event.coords = destCoords; // Save to event
                        }
                    }

                    if (destCoords) {
                        // 2. Fetch Duration from OSRM
                        const routeUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destCoords.lon},${destCoords.lat}?overview=false`;
                        const routeRes = await fetch(routeUrl);
                        const routeData = await routeRes.json();

                        if (routeData.routes && routeData.routes[0]) {
                            const durationSeconds = routeData.routes[0].duration;
                            const durationMinutes = Math.ceil(durationSeconds / 60);

                            this.state.travelMetrics[event.id] = {
                                duration: durationMinutes,
                                lastUpdate: new Date().getTime()
                            };

                            console.log(`Travel time for ${event.title}: ${durationMinutes} mins`);
                        }
                    }
                } catch (err) {
                    console.warn(`Could not fetch travel time for ${event.title}:`, err);
                }
            }
            // Trigger refresh after calcs
            this.renderDriveMode();
        }, (err) => {
            console.warn("Geolocation denied, using default buffer.");
        });
    },

    renderDashboard() {
        const grid = document.querySelector('.dashboard-grid');
        if (!grid) return;

        // Clear children to re-render in specified order
        grid.innerHTML = '';

        // Definition of widgets and their container templates
        const widgetTemplates = {
            'special': '<div id="dashboardSpecialContainer" style="grid-column: 1 / -1; display:none;"></div>',
            'drive': '<div id="dashboardDriveMode" style="grid-column: 1 / -1; display: none;"></div>',
            'kpis': '<div id="dashboardBudgetWidget" style="grid-column: 1 / -1; display: none;"></div>',
            'events': `
                <div class="card glass next-events collapsible-card is-collapsed">
                    <div class="card-header-toggle" onclick="app.toggleCard(this)">
                        <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
                            <h3 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin:0;">Termine & Wichtiges</h3>
                            <span id="eventCountBadge" style="background: rgba(var(--primary-rgb), 0.15); color: var(--primary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; flex-shrink:0;">0</span>
                            <button class="btn-icon-mini" onclick="event.stopPropagation(); app.editEvent()" 
                                style="background: rgba(var(--primary-rgb), 0.1); border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; color: var(--primary); cursor: pointer; margin-left: 5px;">
                                <i data-lucide="plus" size="18"></i>
                            </button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                            <button class="btn-text" style="font-size: 0.75rem; padding: 4px 8px;" onclick="event.stopPropagation(); app.navigateTo('calendar')">Alle ansehen</button>
                            <i data-lucide="chevron-down" class="toggle-icon" size="20"></i>
                        </div>
                    </div>
                    <div class="card-content" style="display: flex; flex-direction: column; gap: 15px;">
                        <!-- Urgent Section -->
                        <div id="dashboardUrgentTodos" style="display:none;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--glass-border);">
                                <i data-lucide="alert-circle" size="18" style="color:#ef4444;"></i>
                                <h4 style="margin: 0; color:#ef4444; font-size: 0.9rem; font-weight: 700;">Dringend / Wichtig</h4>
                            </div>
                            <div id="dashboardUrgentList" style="display:flex; flex-direction:column; gap:8px;"></div>
                        </div>
                        
                        <!-- Events Section -->
                        <div>
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--glass-border);">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <i data-lucide="calendar" size="18" style="color:var(--primary);"></i>
                                    <h4 style="margin: 0; color:var(--primary); font-size: 0.9rem; font-weight: 700;">Nächste Termine</h4>
                                </div>
                                <button class="btn-icon-mini" onclick="app.editEvent()" 
                                    style="background: rgba(var(--primary-rgb), 0.1); border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; color: var(--primary); cursor: pointer;">
                                    <i data-lucide="plus" size="14"></i>
                                </button>
                            </div>
                            <div class="event-list" id="dashboardEventList">
                                <div class="empty-state">Lade Termine...</div>
                            </div>
                        </div>
                    </div>
                </div>`,
            'mini_calendar': `
                <div class="card glass mini-calendar collapsible-card">
                    <div class="card-header-toggle" onclick="app.toggleCard(this)">
                        <div style="display: flex; align-items: center; gap: 10px; width: 100%; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <h3 id="miniCalendarMonth">Kalender</h3>
                                <button class="btn-icon-mini" onclick="event.stopPropagation(); app.editEvent()" 
                                    style="background: rgba(var(--primary-rgb), 0.1); border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; color: var(--primary); cursor: pointer;">
                                    <i data-lucide="plus" size="18"></i>
                                </button>
                            </div>
                            <i data-lucide="chevron-up" class="toggle-icon" size="20"></i>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="calendar-grid small" id="miniCalendarGrid"></div>
                    </div>
                </div>`,
            'quick_finance': `
                <div class="card glass collapsible-card">
                    <div class="card-header-toggle" onclick="app.toggleCard(this)">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <h3>Eintrag hinzufügen</h3>
                            <i data-lucide="chevron-up" class="toggle-icon" size="20"></i>
                        </div>
                    </div>
                    <div class="card-content">
                        <form onsubmit="app.finance.saveQuickAdd(event)" style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group" style="margin: 0;">
                                    <label style="font-size: 0.85rem; margin-bottom: 4px; display: block;">Betrag (€)</label>
                                    <input type="number" id="quickFinAmount" step="0.01" placeholder="0.00" required 
                                        style="width: 100%; padding: 10px; background: var(--bg-solid-2); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-main);">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label style="font-size: 0.85rem; margin-bottom: 4px; display: block;">Datum</label>
                                    <input type="date" id="quickFinDate" required
                                        style="width: 100%; padding: 10px; background: var(--bg-solid-2); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-main);">
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group" style="margin: 0;">
                                    <label style="font-size: 0.85rem; margin-bottom: 4px; display: block;">Typ</label>
                                    <select id="quickFinType" 
                                        style="width: 100%; padding: 10px; background: var(--bg-solid-2); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-main);">
                                        <option value="expense">Ausgabe</option>
                                        <option value="income">Einnahme</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label style="font-size: 0.85rem; margin-bottom: 4px; display: block;">Beschreibung</label>
                                    <input type="text" id="quickFinSource" placeholder="z.B. Miete..." required
                                        style="width: 100%; padding: 10px; background: var(--bg-solid-2); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-main);">
                                </div>
                            </div>
                            <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; font-weight: 700;">
                                <i data-lucide="plus" size="18"></i> Eintragen
                            </button>
                        </form>
                    </div>
                </div>`
        };

        // Create containers in order
        this.state.widgetOrder.forEach(key => {
            if (this.state.widgetVisibility[key] && widgetTemplates[key]) {
                const temp = document.createElement('div');
                temp.innerHTML = widgetTemplates[key];
                const element = temp.firstElementChild;
                grid.appendChild(element);

                // Set initial display to block if it was hidden by template ID (except kpis/drive which are handled specifically)
                if (element.id && !['dashboardBudgetWidget', 'dashboardDriveMode', 'dashboardSpecialContainer'].includes(element.id)) {
                    element.style.display = 'block';
                }
            }
        });

        const title = document.getElementById('dashboardWelcomeTitle');
        const userAvatar = this.state.user.avatar || 'logo.svg';
        const pearLogo = `
        <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-left: 2px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));">
            <defs>
                <linearGradient id="rainbowGradDash" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#FF0000;stop-opacity:1" />
                    <stop offset="16%" style="stop-color:#FF7F00;stop-opacity:1" />
                    <stop offset="33%" style="stop-color:#FFFF00;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#00FF00;stop-opacity:1" />
                    <stop offset="66%" style="stop-color:#0000FF;stop-opacity:1" />
                    <stop offset="83%" style="stop-color:#4B0082;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8B00FF;stop-opacity:1" />
                </linearGradient>
                <mask id="biteMaskDash">
                    <rect width="100" height="100" fill="white" />
                    <circle cx="78" cy="40" r="18" fill="black" />
                </mask>
            </defs>
            <path d="M50,10 C30,10 20,40 20,65 C20,90 35,95 50,95 C65,95 80,90 80,65 C80,40 70,10 50,10 Z"
                fill="url(#rainbowGradDash)" mask="url(#biteMaskDash)" />
            <path d="M50,10 Q50,0 60,5 C55,8 52,10 50,10" fill="url(#rainbowGradDash)" />
        </svg>`;

        if (title) {
            title.style.display = 'flex';
            title.style.alignItems = 'center';
            title.style.gap = '15px';
            title.innerHTML = `
                <div class="avatar-hero-container" onclick="app.navigateTo('settings')" style="cursor: pointer; position: relative; flex-shrink: 0;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid var(--primary); padding: 3px; background: rgba(var(--primary-rgb), 0.1); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.3);">
                        <img src="${userAvatar}" alt="Profil" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                    </div>
                    <div style="position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; background: var(--success); border: 2px solid #0a0c10; border-radius: 50%; box-shadow: 0 0 10px var(--success);"></div>
                </div>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: -4px;">Willkommen zurück,</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 800; font-size: 1.8rem; background: linear-gradient(to right, #fff, var(--text-muted)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${this.state.user.name.split(' ')[0]}
                        </span>
                        ${pearLogo}
                    </div>
                </div>
            `;
        }

        // CALCULATE METRICS FOR DASHBOARD KPI GRID
        const budgetWidget = document.getElementById('dashboardBudgetWidget');
        if (budgetWidget) {
            budgetWidget.style.display = 'block';

            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            // 1. Daily Expenses (only expenses)
            let dailyExpenses = 0;
            this.state.finance.forEach(e => {
                if (!e.deleted && e.date === todayStr && e.type !== 'income') dailyExpenses += e.amount;
            });

            // 2. Monthly Stats (Income & Expenses)
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            let monthlyIncome = 0;
            let monthlyExpenses = 0;
            let bookedFixedExpenses = 0;
            this.state.finance.forEach(e => {
                if (e.deleted) return;
                const d = new Date(e.date);
                if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
                    if (e.type === 'income') monthlyIncome += e.amount;
                    else {
                        monthlyExpenses += e.amount;
                        if (e.source && e.source.startsWith('FIX:')) {
                            bookedFixedExpenses += e.amount;
                        }
                    }
                }
            });

            // Variable Expenses (Daily spendings)
            const variableExpenses = monthlyExpenses - bookedFixedExpenses;

            // Calculate Fixed Costs Plan for Intelligence
            let plannedFixedExpenses = 0;
            app.state.fixedCosts.forEach(f => {
                if (f.type !== 'income') plannedFixedExpenses += f.amount;
            });

            const nettoRemaining = monthlyIncome - plannedFixedExpenses;
            const totalAvailable = nettoRemaining - variableExpenses - app.state.savingsGoal;

            // Intelligent Daily Budget
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const remainingDays = lastDayOfMonth - now.getDate() + 1;
            const dailyLimit = totalAvailable > 0 ? (totalAvailable / remainingDays) : 0;

            const budgetPercent = this.state.monthlyBudget > 0 ? Math.min(100, Math.round((monthlyExpenses / this.state.monthlyBudget) * 100)) : 0;
            const isOverBudget = this.state.monthlyBudget > 0 && monthlyExpenses > this.state.monthlyBudget;

            // 3. Next Appointment
            const futureEvents = this.getFilteredEvents().filter(e => e.date >= todayStr && e.category !== 'holiday').sort((a, b) => a.date.localeCompare(b.date) || (a.time || '00:00').localeCompare(b.time || '00:00'));
            const nextEvent = futureEvents[0];

            const remainingBudget = this.state.monthlyBudget - monthlyExpenses;
            const isWarning = remainingBudget > 0 && remainingBudget <= this.state.budgetWarningLimit;

            budgetWidget.innerHTML = `
            <div class="card glass animate-in collapsible-card is-collapsed" style="margin-bottom: 20px; border: 1px solid ${isOverBudget ? 'rgba(239, 68, 68, 0.4)' : (isWarning ? 'rgba(245, 158, 11, 0.4)' : 'var(--glass-border)')}; background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), rgba(0,0,0,0));">
                <div class="card-header-toggle" onclick="app.toggleCard(this)" style="position: relative;">
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                        <div class="icon-circle" style="background: ${isOverBudget ? 'rgba(239,68,68,0.1)' : (isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(var(--primary-rgb), 0.1)')}; color: ${isOverBudget ? '#ef4444' : (isWarning ? '#f59e0b' : 'var(--primary)')}; width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;">
                            <i data-lucide="${isOverBudget ? 'alert-octagon' : (isWarning ? 'bell-ring' : 'wallet')}" size="18"></i>
                        </div>
                        <div style="overflow: hidden;">
                            <h3 style="font-size: 0.95rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${isOverBudget ? 'Budget Überschritten! 🚨' : (isWarning ? 'Budget wird knapp! ⚠️' : 'Finanz-Status')}
                            </h3>
                            <small style="color: var(--text-muted); white-space: nowrap; font-size: 0.75rem;">${now.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</small>
                        </div>
                    </div>
                    
                    <!-- Quick Add Button -->
                    <button onclick="event.stopPropagation(); app.finance.openQuickAdd();" 
                        class="dashboard-finance-add-btn"
                        title="Schnell Ausgabe/Einnahme hinzufügen"
                        style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; color: white; font-size: 1.4rem; font-weight: 300; cursor: pointer; box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin: 0 8px;">
                        +
                    </button>
                    
                    <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                         <div style="text-align: right; margin-right: 5px;">
                            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Verfügbar:</div>
                            <div style="font-size: 1.1rem; font-weight: 800; color: ${isOverBudget ? '#ef4444' : (isWarning ? '#f59e0b' : 'var(--success)')};">
                                ${remainingBudget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                            </div>
                        </div>
                        <i data-lucide="chevron-down" class="toggle-icon" size="20"></i>
                    </div>
                </div>
                
                <div class="card-content">
                    <!-- Warning Message -->
                    ${isOverBudget ? `
                        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 0.85rem; color: #ef4444; display: flex; align-items: center; gap: 10px;">
                            <i data-lucide="alert-circle" size="16"></i>
                            <span>Achtung: Du hast dein Limit um ${Math.abs(remainingBudget).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} überschritten!</span>
                        </div>
                    ` : (isWarning ? `
                        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 0.85rem; color: #f59e0b; display: flex; align-items: center; gap: 10px;">
                            <i data-lucide="info" size="16"></i>
                            <span>Hinweis: Du hast nur noch ${remainingBudget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} bis zum Monatsende.</span>
                        </div>
                    ` : '')}

                    <!-- KPIs Row -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                        <div style="background: var(--bg-element); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                            <small style="display: block; color: var(--text-muted); margin-bottom: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Tageslimit</small>
                            <div style="font-weight: 700; color: var(--primary); font-size: 1.1rem;">${dailyLimit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                        </div>
                        <div style="background: var(--bg-element); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                            <small style="display: block; color: var(--text-muted); margin-bottom: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Ausgaben Heute</small>
                            <div style="font-weight: 700; color: var(--danger); font-size: 1.1rem;">${dailyExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                        </div>
                    </div>

                    <!-- Progress Section -->
                    <div style="height: 10px; background: var(--bg-element); border-radius: 5px; overflow: hidden; margin-bottom: 12px;">
                        <div style="width: ${budgetPercent}%; height: 100%; background: ${isOverBudget ? 'var(--danger)' : (isWarning ? 'var(--warning)' : 'var(--primary)')}; transition: width 1s cubic-bezier(0.2, 0, 0, 1);"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; color: var(--text-muted);">
                        <span>Gesamt-Eingänge: ${monthlyIncome.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                        <span>Budget-Limit (Gehalt): ${this.state.monthlyBudget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                </div>
            </div>
            `;
            if (window.lucide) lucide.createIcons();
        }


        // Auto-archive past events before rendering dashboard
        this.archivePastEvents();

        // Render Drive Mode widget
        this.renderDriveMode();

        // Set today's date in quick finance form
        const quickFinDate = document.getElementById('quickFinDate');
        if (quickFinDate && !quickFinDate.value) {
            quickFinDate.value = new Date().toISOString().split('T')[0];
        }

        const list = document.getElementById('dashboardEventList');
        if (!list) return;

        const filtered = this.getFilteredEvents();

        // Check for today's special occasions
        const today = new Date();
        const specials = filtered.filter(e => this.isEventOnDate(e, today) && (e.category === 'birthday' || e.category === 'holiday'));

        // Check Contact Birthdays for Today
        this.state.contacts.forEach(c => {
            if (c.birthday) {
                const bday = new Date(c.birthday);
                if (bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth()) {
                    // Check for duplicates in case a manual event exists
                    const alreadyAdded = specials.some(s => s.title.includes(c.name));
                    if (!alreadyAdded) {
                        specials.push({
                            title: `Geburtstag von ${c.name}`,
                            category: 'birthday',
                            date: today.toISOString().split('T')[0]
                        });
                    }
                }
            }
        });

        // Check user's own birthday
        if (this.state.user.birthday) {
            const userBday = new Date(this.state.user.birthday);
            if (userBday.getDate() === today.getDate() && userBday.getMonth() === today.getMonth()) {
                const alreadyAdded = specials.some(s => s.title === 'Dein Geburtstag!');
                if (!alreadyAdded) specials.push({ title: 'Dein Geburtstag!', category: 'birthday' });
            }
        }

        // Sort and future logic
        const sorted = [...filtered].sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')) - new Date(b.date + 'T' + (b.time || '00:00')));

        // For birthdays, we need a special "next occurrence" sorting if we want them in "Next Events"
        // For simplicity, let's keep the core list and add a special header for today

        const specialContainer = document.getElementById('dashboardSpecialContainer');
        let specialHtml = '';

        if (specials.length > 0) {
            specialHtml += `
                <div class="special-reminders animate-in" style="margin-bottom: 24px; background: var(--bg-element); border: 2px solid var(--primary); padding: 24px; border-radius: var(--radius-lg);">
                    <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
                        <i data-lucide="party-popper" size="28" style="color: var(--primary);"></i>
                        <div>
                            <h3 style="margin:0; font-size:1.2rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Besondere Anlässe</h3>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${specials.map(s => {
                // Find contact phone if not directly on event
                let phone = s.phone;
                if (!phone && s.category === 'birthday') {
                    // Extract name from title "Geburtstag von [Name]" or just assume title is name if virtual
                    const nameMatch = s.title.replace('Geburtstag von ', '').replace(' 🎂', '');
                    const contact = this.state.contacts.find(c => c.name.includes(nameMatch));
                    if (contact) phone = contact.phone;
                }

                return `
                            <div style="background: var(--bg-card); padding: 14px 20px; border-radius: var(--radius-md); display: flex; border: 1px solid var(--glass-border); justify-content: space-between; align-items: center;">
                                <span style="font-weight: 600; font-size: 1rem; color: var(--text-main);">${s.title} ${s.category === 'birthday' ? '🎂' : '🎊'}</span>
                                ${phone ? `
                                    <a href="tel:${phone}" class="btn-primary" style="min-height: 40px; padding: 0 16px; font-size: 0.9rem; text-decoration: none;">
                                        <i data-lucide="phone" size="14"></i> Anrufen
                                    </a>
                                ` : ''}
                            </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }

        // Upcoming Birthdays in Current Month Logic
        const currentMonth = today.getMonth();
        const upcomingBirthdays = this.state.contacts.filter(c => {
            if (!c.birthday) return false;
            const bday = new Date(c.birthday);
            // Must be in current month
            if (bday.getMonth() !== currentMonth) return false;
            // Must be today or future (in this month)
            return bday.getDate() >= today.getDate();
        }).sort((a, b) => new Date(a.birthday).getDate() - new Date(b.birthday).getDate());

        // Don't duplicate if shown in specials (today)
        const pureUpcoming = upcomingBirthdays.filter(c => new Date(c.birthday).getDate() !== today.getDate());

        if (pureUpcoming.length > 0) {
            specialHtml += `
                <div class="upcoming-birthdays animate-in" style="margin-bottom: 25px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 15px; border-radius: 16px;">
                    <h4 style="margin:0 0 10px 0; display:flex; align-items:center; gap:8px; color:var(--text-main); font-size:1rem;">
                        <i data-lucide="cake" size="18" style="color:#3b82f6;"></i> Geburtstage diesen Monat
                    </h4>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${pureUpcoming.map(c => {
                const bDay = new Date(c.birthday);
                const age = today.getFullYear() - bDay.getFullYear();
                return `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:10px;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-weight:600; font-size:0.9rem;">${c.name}</span>
                                    <span style="font-size:0.8rem; opacity:0.7;">am ${bDay.getDate()}.${bDay.getMonth() + 1}.</span>
                                </div>
                                <span style="font-size:0.8rem; background:rgba(59,130,246,0.2); color:#60a5fa; padding:2px 8px; border-radius:10px;">wird ${age}</span>
                            </div>`;
            }).join('')}
                    </div>
                </div>
            `;
        }

        // Render Special Container
        if (specialContainer) {
            if (specialHtml) {
                specialContainer.innerHTML = specialHtml;
                specialContainer.style.display = 'block';
            } else {
                specialContainer.style.display = 'none';
            }
        }

        // Render Regular Events List
        let html = '';
        const future = sorted.filter(e => {
            if (e.archived) return false; // Don't show archived
            if (e.category === 'birthday' || e.category === 'holiday') {
                // Show if today or in next 30 days regardless of year
                const d = new Date(e.date);
                const nextOcc = new Date(today.getFullYear(), d.getMonth(), d.getDate());
                if (nextOcc < today.setHours(0, 0, 0, 0)) nextOcc.setFullYear(today.getFullYear() + 1);
                const diff = (nextOcc - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 30;
            }
            const eventDateTime = new Date(e.date + 'T' + (e.time || '00:00'));
            const nowTime = new Date();
            // Strictly hide if the time has passed
            return eventDateTime >= nowTime;
        }).slice(0, 50);

        const eventCard = list.closest('.next-events');

        if (future.length === 0) {
            // Show empty state instead of hiding
            if (eventCard) {
                eventCard.style.display = 'block';
                eventCard.style.border = '1px solid var(--glass-border)';
            }
            list.innerHTML = `<div class="empty-state" style="text-align:center; padding:40px; color:var(--text-muted);">
                <i data-lucide="calendar-off" size="40" style="margin-bottom:12px; opacity:0.3;"></i>
                <p style="font-size: 0.9rem;">Keine anstehenden Termine.</p>
                <button class="btn-text" onclick="app.editEvent()" style="margin-top:12px;">+ Termin erstellen</button>
            </div>`;
        } else {
            // Show the card
            if (eventCard) {
                eventCard.style.display = 'block';
                eventCard.style.border = '1px solid var(--glass-border)';
            }

            list.innerHTML = html + future.map(e => {
                const d = new Date(e.date);
                const day = d.getDate();
                const month = d.toLocaleString('de-DE', { month: 'short' });

                const eventColor = e.color || 'var(--primary)';
                const itemStyle = `
                    cursor: pointer; 
                    position: relative; 
                    border-left: 4px solid ${eventColor};
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 0 5px ${eventColor}20;
                `;

                // Check for phone & email
                let phone = e.phone;
                let email = e.email;
                if (!phone || !email) {
                    const contact = this.state.contacts.find(c => c.name && e.title.includes(c.name));
                    if (contact) {
                        if (!phone) phone = contact.phone;
                        if (!email) email = contact.email;
                    }
                }

                return `
                    <div class="event-item" onclick="app.editEvent('${e.id}')" style="${itemStyle}">
                        <div class="event-time-box">
                            <span class="event-day">${day}</span>
                            <span class="event-month">${month}</span>
                        </div>
                        <div class="event-info">
                            <h4 style="color:var(--text-main); font-weight:700; display: flex; align-items: center; gap: 8px;">
                                ${e.title}
                                ${e.recurrence && e.recurrence !== 'none' ? `<i data-lucide="repeat" size="14" style="opacity:0.6;" title="Wiederholt sich ${e.recurrence}"></i>` : ''}
                            </h4>
                            <p style="opacity:0.8;">${e.time || '--:--'} Uhr ${e.location ? `• ${e.location}` : ''} ${email ? `• ${email}` : ''}</p>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; margin-left:auto;">
                            ${phone ? `
                                <a href="tel:${phone}" class="btn-icon-subtle" onclick="event.stopPropagation()" title="Anrufen" style="color:#d97706; background:rgba(217,119,6,0.1); width: 36px; height: 36px; border-radius: 10px;">
                                    <i data-lucide="phone" size="18"></i>
                                </a>
                            ` : ''}
                            ${email ? `
                                <a href="mailto:${email}" class="btn-icon-subtle" onclick="event.stopPropagation()" title="E-Mail schreiben" style="color:#3b82f6; background:rgba(59,130,246,0.1); width: 36px; height: 36px; border-radius: 10px;">
                                    <i data-lucide="mail" size="18"></i>
                                </a>
                            ` : ''}
                            ${e.location ? `
                                <button class="btn-icon-subtle" onclick="event.stopPropagation(); app.openRoute('${e.location}')" title="Karte öffnen" style="width: 36px; height: 36px; border-radius: 10px;">
                                    <i data-lucide="map" size="18"></i>
                                </button>
                            ` : ''}
                            <div class="event-category-badge category-${e.category}" style="${e.color ? `background:${e.color}; color:white;` : ''}">${e.category}</div>
                            <div class="event-hover-actions">
                                <button onclick="event.stopPropagation(); app.deleteEvent('${e.id}')" class="btn-delete-subtle" title="Löschen">
                                    <i data-lucide="trash-2" size="18"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Update event count badge
        const eventCountBadge = document.getElementById('eventCountBadge');
        if (eventCountBadge) {
            eventCountBadge.textContent = future.length;
        }

        // Urgent Todos & Contacts Logic for Dashboard
        const urgentContainer = document.getElementById('dashboardUrgentTodos');
        const urgentList = document.getElementById('dashboardUrgentList');

        if (urgentContainer && urgentList) {
            const urgentTodos = this.state.todos.filter(t => !t.completed && t.urgent);
            const urgentContacts = this.state.contacts.filter(c => c.isUrgent);

            // Filter urgent events: category 'urgent' AND date >= today
            const todayStr = new Date().toISOString().split('T')[0];
            const urgentEvents = this.state.events.filter(e => e.category === 'urgent' && e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));

            let urgentHtml = '';

            // Render Urgent Contacts (First!)
            urgentHtml += urgentContacts.map(c => `
                <div class="urgent-item-accent" onclick="${c.phone ? `window.location.href='tel:${c.phone}'` : `app.navigateTo('contacts')`}">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <i data-lucide="${c.phone ? 'phone-call' : 'user'}" size="18" style="color:#ef4444;"></i>
                        <span style="font-weight:700; font-size:1rem;">${c.name}</span>
                    </div>
                    ${c.phone ? '<span class="urgent-badge-pill">ANRUFEN!</span>' : '<span style="font-size:0.75rem; color:#ef4444; font-weight:800;">DRINGEND</span>'}
                </div>
            `).join('');

            // Render Urgent Events
            urgentHtml += urgentEvents.map(e => `
                <div class="urgent-item-accent" onclick="app.editEvent('${e.id}')">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <i data-lucide="calendar-clock" size="18" style="color:#ef4444;"></i>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:700; font-size:1rem;">${e.title}</span>
                            <span style="font-size:0.8rem; opacity:0.9;">Heute ${e.time || ''}</span>
                        </div>
                    </div>
                    ${e.phone ?
                    `<a href="tel:${e.phone}" class="urgent-badge-pill" onclick="event.stopPropagation()" style="text-decoration:none; display:flex; align-items:center; gap:4px;"><i data-lucide="phone" size="12"></i> ANRUFEN</a>`
                    : `<span class="urgent-badge-pill">TERMIN</span>`
                }
                </div>
            `).join('');

            // Render Urgent Todos
            urgentHtml += urgentTodos.map(t => `
                <div class="urgent-item-accent" onclick="app.navigateTo('todo')">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <i data-lucide="check-square" size="18" style="color:#ef4444;"></i>
                        <span style="font-weight:700; font-size:1rem;">${t.text}</span>
                    </div>
                    <span class="urgent-badge-pill">TODO</span>
                </div>
            `).join('');


            if (urgentTodos.length > 0 || urgentContacts.length > 0 || urgentEvents.length > 0) {
                urgentContainer.style.display = 'block';
                urgentList.innerHTML = urgentHtml;
            } else {
                urgentContainer.style.display = 'none';
            }
        }

        this.renderMiniCalendar();
    },



    toggleFavorites() {
        this.state.favsCollapsed = !this.state.favsCollapsed;
        localStorage.setItem('moltbot_favs_collapsed', this.state.favsCollapsed);
        this.renderFavorites();
    },

    renderFavorites() {
        const container = document.getElementById('quickContactsContainer');
        const bar = document.querySelector('.quick-contacts-bar');
        const toggleBtn = document.getElementById('toggleFavsBtn');
        if (!container) return;

        if (this.state.favsCollapsed) {
            container.classList.add('collapsed');
            if (bar) bar.classList.add('is-collapsed');
            if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="chevron-down"></i>';
        } else {
            container.classList.remove('collapsed');
            if (bar) bar.classList.remove('is-collapsed');
            if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="chevron-up"></i>';
        }

        const favs = this.state.contacts.filter(c => c.isFavorite);

        if (favs.length === 0) {
            container.innerHTML = `<div class="text-muted" style="font-size: 0.8rem; padding: 10px;">Keine Favoriten markiert. Klicke auf das Herz oder bearbeite einen Kontakt.</div>`;
            return;
        }

        container.innerHTML = favs.map(c => `
            <div class="quick-contact-item" title="${c.name}">
                <div class="avatar-circle" onclick="app.contacts.edit('${c.id}')">
                    ${c.name.charAt(0).toUpperCase()}
                </div>
                <span>${c.name.split(' ')[0]}</span>
                
                <div class="fav-hover-actions">
                    ${c.phone ? `
                    <a href="tel:${c.phone}" class="fav-action-btn call" title="Anrufen" onclick="event.stopPropagation()">
                        <i data-lucide="phone-forwarded" size="12"></i>
                    </a>` : ''}
                    <button class="fav-action-btn remove" onclick="event.stopPropagation(); app.contacts.toggleFavorite('${c.id}')" title="Als Favorit entfernen">
                        <i data-lucide="x" size="12"></i>
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
    },

    renderMiniCalendar() {
        // --- ADDED: Container for listing events ---
        // Ensure container exists in DOM (it might not if we don't modify HTML)
        // We will inject it dynamically if missing or assume user will add HTML? 
        // Better: Find parent of grid and append if not exists.
        const grid = document.getElementById('miniCalendarGrid');
        if (!grid) return;

        // Find or create event list container
        let eventListContainer = document.getElementById('dashboardSelectedDayEvents');
        if (!eventListContainer && grid.parentElement) {
            eventListContainer = document.createElement('div');
            eventListContainer.id = 'dashboardSelectedDayEvents';
            grid.parentElement.appendChild(eventListContainer);
        }

        const monthHeader = document.getElementById('miniCalendarMonth');

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // Use locally stored selected date for dashboard interaction or default to today
        if (!this.state.dashboardSelectedDate) {
            this.state.dashboardSelectedDate = new Date();
        }
        const selectedDate = new Date(this.state.dashboardSelectedDate);

        monthHeader.textContent = now.toLocaleString('de-DE', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';
        ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].forEach(d => {
            html += `<div class="calendar-day-name">${d}</div>`;
        });

        let emptyCells = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < emptyCells; i++) html += '<div class="calendar-cell empty"></div>';

        for (let d = 1; d <= daysInMonth; d++) {
            const currentCellDate = new Date(year, month, d);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            const isSelected = d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

            const dayEvents = this.state.events.filter(e => !e.archived && this.isEventOnDate(e, currentCellDate));
            const hasEvent = dayEvents.length > 0;

            let visualContent = `${d}`;
            if (hasEvent) {
                const dotsHtml = dayEvents.slice(0, 4).map(e => {
                    const color = e.color || 'var(--primary)';
                    return `<div class="mini-event-dot" style="background: ${color};"></div>`;
                }).join('');
                visualContent += `<div class="mini-event-dots">${dotsHtml}</div>`;
            }

            let classStr = `calendar-cell ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''} ${isSelected ? 'selected-day' : ''}`;
            let styleStr = isSelected ? `border-color: var(--text-main); background: rgba(255,255,255,0.1);` : '';

            // Update click to select date
            html += `<div class="${classStr}" style="${styleStr}" onclick="app.selectDashboardDate('${dateStr}')">${visualContent}</div>`;
        }

        grid.innerHTML = html;

        // Render the list for the selected date
        if (eventListContainer) {
            const events = this.state.events.filter(e => !e.archived && this.isEventOnDate(e, selectedDate));
            const dateDisplay = selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });

            let listHtml = `<div style="margin-top:15px; border-top:1px solid var(--glass-border); padding-top:10px; animation:fadeIn 0.3s;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h5 style="margin:0; color:var(--text-muted); font-size:0.9rem;">Termine am ${dateDisplay}</h5>
                    <button onclick="app.editEvent()" class="btn-icon-mini" 
                        style="background: rgba(var(--primary-rgb), 0.1); border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; color: var(--primary); cursor: pointer;">
                        <i data-lucide="plus" size="14"></i>
                    </button>
                </div>`;

            if (events.length === 0) {
                listHtml += `<div class="text-muted" style="font-size:0.8rem; text-align:center; padding:10px;">Keine Termine</div>`;
            } else {
                events.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
                listHtml += `<div style="display:flex; flex-direction:column; gap:8px;">`;
                listHtml += events.map(e => `
                    <div onclick="app.editEvent('${e.id}')" class="scale-hover" style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.05); border-radius:12px; cursor:pointer; border-left: 3px solid ${e.color || 'var(--primary)'};">
                        <span style="font-weight:700; font-size:0.9rem; min-width:45px;">${e.time || '--:--'}</span>
                        <div style="overflow:hidden;">
                            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display: flex; align-items: center; gap: 4px;">
                                ${e.title}
                                ${e.recurrence && e.recurrence !== 'none' ? `<i data-lucide="repeat" size="10" style="opacity:0.6;"></i>` : ''}
                            </div>
                        </div>
                    </div>
                 `).join('');
                listHtml += `</div>`;
            }
            listHtml += `</div>`;
            eventListContainer.innerHTML = listHtml;
            if (window.lucide) lucide.createIcons();
        }
    },

    selectDashboardDate(dateStr) {
        if (!dateStr) return;
        const [y, m, d] = dateStr.split('-').map(Number);
        this.state.dashboardSelectedDate = new Date(y, m - 1, d);
        this.renderMiniCalendar();
    },

    renderCalendar() {
        const grid = document.getElementById('fullCalendarGrid');
        const monthHeader = document.getElementById('fullCalendarMonth');
        const weekdayHeader = document.getElementById('weekdayHeader');
        if (!grid) return;

        const date = this.state.currentDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        const filteredEvents = this.getFilteredEvents();

        // Inject Contact Birthdays for the current view year
        const viewYear = date.getFullYear();
        this.state.contacts.forEach(c => {
            if (c.birthday && !c.archived) {
                const bday = new Date(c.birthday);
                // Create date string for the current view year
                const dateStr = `${viewYear}-${String(bday.getMonth() + 1).padStart(2, '0')}-${String(bday.getDate()).padStart(2, '0')}`;

                filteredEvents.push({
                    id: `virtual-bday-${c.id}`,
                    title: `${c.name} 🎂`,
                    date: dateStr,
                    category: 'birthday',
                    color: '#f59e0b', // Gold for birthdays
                    allDay: true,
                    isVirtual: true, // Marker
                    phone: c.phone // For quick actions
                });
            }
        });

        // Show/Hide Toggle Button
        const toggleBtn = document.getElementById('monthLayoutToggle');
        if (toggleBtn) {
            const isYear = this.state.calendarView === 'year';
            toggleBtn.style.display = isYear ? 'none' : 'inline-flex';

            const view = this.state.calendarView;
            const mode = this.state[`${view}LayoutMode`] || 'modern';
            toggleBtn.innerHTML = mode === 'modern' ? '<i data-lucide="list"></i>' : '<i data-lucide="layout"></i>';
            toggleBtn.title = mode === 'modern' ? 'Listenansicht' : 'Kartenansicht';

            if (window.lucide) lucide.createIcons();
        }

        if (this.state.calendarView === 'year') {
            monthHeader.textContent = year;
            weekdayHeader.innerHTML = '';
            this.renderYearView(grid, year, filteredEvents);
        } else if (this.state.calendarView === 'month') {
            monthHeader.textContent = date.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
            weekdayHeader.innerHTML = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<div>${d}</div>`).join('');
            this.renderMonthView(grid, year, month, filteredEvents);
        } else if (this.state.calendarView === 'week') {
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            monthHeader.textContent = `${startOfWeek.getDate()}. - ${endOfWeek.getDate()}. ${endOfWeek.toLocaleString('de-DE', { month: 'short', year: 'numeric' })}`;
            weekdayHeader.innerHTML = '';
            this.renderWeekView(grid, startOfWeek, filteredEvents);
        } else if (this.state.calendarView === 'day') {
            monthHeader.textContent = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            weekdayHeader.innerHTML = '';
            this.renderDayView(grid, date, filteredEvents);
        }
    },

    renderEventActions(e) {
        let customStyle = '';
        if (e.color) {
            customStyle = `background: ${e.color}E6; border-left-color: ${e.color};`;
        }
        let html = `<div class="event-pill ${e.category}" title="${e.title}" onclick="event.stopPropagation(); app.editEvent('${e.id}')" style="cursor: pointer; ${customStyle}">
            <div style="font-weight:600;">${e.time ? e.time + ' ' : ''}${e.title}</div>`;

        if (e.location || e.phone || e.email) {
            html += `<div style="display:flex; gap:6px; margin-top:4px;">`;
            if (e.location) html += `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}" target="_blank" class="event-link-btn" title="Navigieren" onclick="event.stopPropagation()"><i data-lucide="map-pin" size="10"></i></a>`;
            if (e.phone) html += `<a href="tel:${e.phone}" class="event-link-btn" title="Anrufen" onclick="event.stopPropagation()"><i data-lucide="phone" size="10"></i></a>`;
            if (e.email) html += `<a href="mailto:${e.email}" class="event-link-btn" title="E-Mail schreiben" onclick="event.stopPropagation()"><i data-lucide="mail" size="10"></i></a>`;
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    },

    toggleCalendarLayout() {
        const view = this.state.calendarView;
        const key = `${view}LayoutMode`;
        this.state[key] = (this.state[key] || 'modern') === 'modern' ? 'classic' : 'modern';
        localStorage.setItem(`moltbot_calendar_layout_${view}`, this.state[key]);
        this.render();
    },

    renderMonthView(grid, year, month, filteredEvents) {
        const mode = this.state.monthLayoutMode || 'modern';

        if (mode === 'modern') {
            this.renderMonthGridView(grid, year, month, filteredEvents);
        } else {
            this.renderMonthListView(grid, year, month, filteredEvents);
        }
    },

    renderMonthListView(grid, year, month, filteredEvents) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        grid.className = 'calendar-list-view';

        let html = '<div class="agenda-view-container">';

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            // FIX: Manual date string to match local time, avoiding UTC rollback
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvents = filteredEvents.filter(e => this.isEventOnDate(e, date));
            const isToday = date.toDateString() === new Date().toDateString();

            html += this.renderDayListRow(date, dayEvents, isToday, dateStr);
        }
        html += '</div>';
        grid.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    },

    renderMonthGridView(grid, year, month, filteredEvents) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Grid Class
        grid.className = 'calendar-grid-large view-month';

        let html = '';
        // Adjust for German week start (Monday=1)
        let emptyCells = (firstDay + 6) % 7;

        for (let i = 0; i < emptyCells; i++) html += '<div class="calendar-cell-large empty"></div>';

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvents = filteredEvents.filter(e => this.isEventOnDate(e, date));

            // Sort: Birthdays first, then by time
            dayEvents.sort((a, b) => {
                const aIsBday = a.category === 'birthday';
                const bIsBday = b.category === 'birthday';
                if (aIsBday && !bIsBday) return -1;
                if (!aIsBday && bIsBday) return 1;
                return (a.time || '00:00').localeCompare(b.time || '00:00');
            });
            const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            // Render Events as colored bars/pills for visibility
            // Limit to 3-4 to avoid overflow
            const visibleEvents = dayEvents.slice(0, 4);
            const eventHtml = visibleEvents.map(e => {
                let style = e.color ? `background-color:${e.color};` : '';
                // Add visibility enhancements
                style += `
                    font-weight: 700;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.2);
                `;

                // Extra styling for birthdays
                if (e.category === 'birthday') {
                    style += `border: 2px solid #fff; transform: scale(1.02); z-index: 2;`;
                }

                return `<div class="month-event-pill ${e.category}" style="${style}" title="${e.title}">
                    <span class="truncate" style="color:white; display:flex; align-items:center; gap:4px;">
                        ${e.time || ''} ${e.title}
                        ${e.recurrence && e.recurrence !== 'none' ? `<i data-lucide="repeat" size="10" style="opacity:0.8;"></i>` : ''}
                    </span>
                </div>`;
            }).join('');

            const moreCount = dayEvents.length - visibleEvents.length;

            html += `
                <div class="calendar-cell-large ${isToday ? 'today-full' : ''}" onclick="app.goToDay('${dateStr}')">
                    <div class="cell-header">
                        <span class="day-num">${d}</span>
                    </div>
                    <div class="day-events-container">
                        ${eventHtml}
                        ${moreCount > 0 ? `<div class="more-events">+${moreCount}</div>` : ''}
                    </div>
                </div>
            `;
        }
        grid.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    },

    renderArchiveSettings() {
        const container = document.getElementById('archiveManagerList');
        if (!container) return;

        const archived = this.state.events.filter(e => e.archived);

        if (archived.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding:15px; text-align:center; color:#888;">Das Archiv ist leer.</div>';
            return;
        }

        archived.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest archived first

        container.innerHTML = archived.map(e => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; border:1px solid var(--glass-border);">
                <div>
                    <div style="font-weight:600; color:var(--text-main);">${e.title}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${new Date(e.date).toLocaleDateString('de-DE')}</div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="icon-btn" onclick="app.unarchiveEvent('${e.id}')" title="Wiederherstellen" style="background:rgba(255,255,255,0.1);">
                        <i data-lucide="rotate-ccw" size="16"></i>
                    </button>
                    <button class="icon-btn" onclick="app.permanentlyDeleteEvent('${e.id}')" title="Endgültig löschen" style="color:var(--danger); background:rgba(255,0,0,0.1);">
                        <i data-lucide="trash-2" size="16"></i>
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
    },

    unarchiveEvent(id) {
        const evt = this.state.events.find(e => e.id === id);
        if (evt) {
            evt.archived = false;
            this.saveLocal();
            this.sync.push();
            this.renderArchiveSettings();
            this.render(); // Update calendar
            alert("Termin wiederhergestellt.");
        }
    },

    archivePastEvents() {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        let changed = false;

        this.state.events.forEach(e => {
            // Only archive one-time events that are NOT already archived
            // and NOT holidays/birthdays
            if (!e.archived && e.category !== 'holiday' && e.category !== 'birthday') {
                const eventDate = e.date;
                const eventTime = e.time || '00:00';

                // Case 1: Past date
                if (eventDate < todayStr) {
                    e.archived = true;
                    changed = true;
                }
                // Case 2: Today but already passed time
                else if (eventDate === todayStr && eventTime < currentTime) {
                    e.archived = true;
                    changed = true;
                }
            }
        });

        if (changed) {
            this.saveLocal();
            if (this.sync && this.sync.push) this.sync.push();
            console.log("Archiving updated for time-based completion.");
        }
    },

    permanentlyDeleteEvent(id) {
        if (confirm("Diesen Termin endgültig löschen? Er kann nicht wiederhergestellt werden.")) {
            this.state.events = this.state.events.filter(e => e.id !== id);
            this.saveLocal();
            this.sync.push();
            this.renderArchiveSettings();
        }
    },

    renderWeekView(grid, startOfWeek, filteredEvents) {
        const mode = this.state.weekLayoutMode || 'modern';

        if (mode === 'modern') {
            this.renderWeekMosaicView(grid, startOfWeek, filteredEvents);
        } else {
            this.renderWeekListView(grid, startOfWeek, filteredEvents);
        }
    },

    renderWeekListView(grid, startOfWeek, filteredEvents) {
        grid.className = 'calendar-list-view';
        let html = '<div class="agenda-view-container">';
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = filteredEvents.filter(e => this.isEventOnDate(e, date));
            const isToday = date.toDateString() === new Date().toDateString();
            html += `<div ${isToday ? 'id="agenda-today"' : ''}>${this.renderDayListRow(date, dayEvents, isToday, dateStr)}</div>`;
        }
        html += '</div>';
        grid.innerHTML = html;

        // Auto-scroll to today
        setTimeout(() => {
            const todayEl = document.getElementById('agenda-today');
            if (todayEl) {
                todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);

        if (window.lucide) lucide.createIcons();
    },

    renderWeekMosaicView(grid, startOfWeek, filteredEvents) {
        grid.className = 'lifestyle-week-grid';
        let html = '';

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const isToday = date.toDateString() === new Date().toDateString();
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = filteredEvents.filter(e => this.isEventOnDate(e, date));

            // Sort events by time
            dayEvents.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

            const intensity = Math.min(100, dayEvents.length * 20);

            html += `
                <div class="mosaic-day-card ${isToday ? 'today' : ''}" ${isToday ? 'id="mosaic-today"' : ''} onclick="app.goToDay('${dateStr}')">
                    <div class="mosaic-header">
                        <div style="display:flex; flex-direction:column;">
                            <span class="mosaic-day-name">${date.toLocaleDateString('de-DE', { weekday: 'short' })}</span>
                            <span class="mosaic-date-label">${date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}</span>
                        </div>
                        ${dayEvents.length > 0 ? `<div class="status-dot" style="background:var(--primary); width:10px; height:10px; border-radius:50%;"></div>` : ''}
                    </div>
                    <div class="mosaic-events-stack">
                        ${dayEvents.slice(0, 3).map(e => `
                            <div class="mosaic-event-item" style="border-left-color: ${e.color || 'var(--primary)'}">
                                <span class="m-time">${e.time || '--:--'}</span>
                                <span style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.title}</span>
                            </div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<div class="text-muted" style="font-size:0.75rem; padding-left:14px;">+ ${dayEvents.length - 3} weitere</div>` : ''}
                        ${dayEvents.length === 0 ? `<div style="padding:20px 0; font-size:0.8rem; opacity:0.5; text-align:center;">Freier Tag 🕊️</div>` : ''}
                    </div>
                    <div class="mosaic-intensity-bar">
                        <div class="intensity-fill" style="width:${intensity}%"></div>
                    </div>
                </div>
            `;
        }
        grid.innerHTML = html;

        // Auto-scroll to today
        setTimeout(() => {
            const todayEl = document.getElementById('mosaic-today');
            if (todayEl) {
                todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);

        if (window.lucide) lucide.createIcons();
    },

    renderDayListRow(date, events, isToday, dateStr) {
        const dayName = date.toLocaleDateString('de-DE', { weekday: 'long' });
        const dayDate = date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });

        let eventsHtml = '';
        if (events.length === 0) {
            eventsHtml = `<div class="text-muted" style="padding:10px; font-size:0.9rem;">Keine Termine</div>`;
        } else {
            // Sort by time
            const sorted = [...events].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
            eventsHtml = sorted.map(e => {
                const colorStyle = e.color ? `border-left: 3px solid ${e.color};` : '';

                // Contact Link Logic
                let phone = e.phone;
                let email = e.email;
                if (!phone || !email) {
                    const contact = this.state.contacts.find(c => c.name && e.title.toLowerCase().includes(c.name.toLowerCase()));
                    if (contact) {
                        if (!phone) phone = contact.phone;
                        if (!email) email = contact.email;
                    }
                }

                return `
                <div class="agenda-event-item" onclick="app.editEvent('${e.id}')" style="${colorStyle}">
                    <div class="agenda-time">${e.time || 'Ganztägig'}</div>
                    <div class="agenda-details">
                        <div class="agenda-title">${e.title} ${(e.recurrence && e.recurrence !== 'none') ? `<i data-lucide="repeat" size="12" style="margin-left: 5px; opacity: 0.5; vertical-align: middle;"></i>` : ''}</div>
                        ${e.location ? `<div class="agenda-loc"><i data-lucide="map-pin" size="12"></i> ${e.location}</div>` : ''}
                        <div style="display:flex; gap:8px; margin-top:4px;">
                            ${phone ? `<a href="tel:${phone}" onclick="event.stopPropagation()" class="text-link" style="font-size:0.75rem; color:var(--success); display:flex; align-items:center; gap:4px;"><i data-lucide="phone" size="11"></i> ${phone}</a>` : ''}
                            ${email ? `<a href="mailto:${email}" onclick="event.stopPropagation()" class="text-link" style="font-size:0.75rem; color:var(--primary); display:flex; align-items:center; gap:4px;"><i data-lucide="mail" size="11"></i> E-Mail</a>` : ''}
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        return `
            <div class="agenda-day-card ${isToday ? 'today-highlight' : ''}">
                <div class="agenda-day-header" onclick="app.goToDay('${dateStr}')">
                    <span class="agenda-day-name">${dayName}</span>
                    <span class="agenda-day-date">${dayDate}</span>
                    <button class="btn-icon-small"><i data-lucide="plus"></i></button>
                </div>
                <div class="agenda-day-body">
                    ${eventsHtml}
                </div>
            </div>
        `;
    },

    goToDay(dateStr) {
        if (!dateStr) return;
        const parts = dateStr.split('-');
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        this.state.currentDate = date;
        this.state.calendarView = 'day';

        // Update View Selector
        const selector = document.getElementById('calendarViewSelector');
        if (selector) {
            selector.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-view') === 'day');
            });
        }

        this.render();
    },

    renderDayView(grid, date, filteredEvents) {
        const mode = this.state.dayLayoutMode || 'modern';
        if (mode === 'modern') {
            this.renderDayTimelineView(grid, date, filteredEvents);
        } else {
            this.renderDayListView(grid, date, filteredEvents);
        }
    },

    renderDayListView(grid, date, filteredEvents) {
        grid.className = 'calendar-list-view';
        const dateStr = date.toISOString().split('T')[0];
        const dayEvents = filteredEvents.filter(e => this.isEventOnDate(e, date));
        const isToday = date.toDateString() === new Date().toDateString();
        grid.innerHTML = `<div class="agenda-view-container">${this.renderDayListRow(date, dayEvents, isToday, dateStr)}</div>`;
        if (window.lucide) lucide.createIcons();
    },

    renderDayTimelineView(grid, date, filteredEvents) {
        grid.className = 'lifestyle-day-container';
        const dayEvents = filteredEvents.filter(e => this.isEventOnDate(e, date));

        if (dayEvents.length === 0) {
            grid.innerHTML = `
                <div class="lifestyle-empty-day">
                    <i data-lucide="calendar-off" size="48" style="opacity:0.2; margin-bottom:20px;"></i>
                    <h2 style="font-size:2rem; font-weight:800;">Alles entspannt! 🕊️</h2>
                    <p>Keine festen Termine für diesen Tag.</p>
                    <button class="btn-primary" onclick="app.editEvent()" style="margin:20px auto; width:fit-content;">
                        <i data-lucide="plus"></i> Termin planen
                    </button>
                </div>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        // Sort by time
        dayEvents.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

        grid.innerHTML = dayEvents.map((e, idx) => `
            <div class="timeline-entry" style="animation-delay: ${idx * 0.1}s">
                <div class="timeline-time-col">
                    <div class="time-bubble">${e.time || 'Alle'}</div>
                    <div class="timeline-dot" style="background: ${e.color || 'var(--primary)'}"></div>
                </div>
                <div class="timeline-content-col">
                    <div class="lifestyle-event-card" onclick="app.editEvent('${e.id}')">
                        <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: ${e.color || 'var(--primary)'}; font-weight: 800; margin-bottom: 4px;">
                            ${e.category || 'Termin'}
                        </div>
                        <h3>${e.title} ${(e.recurrence && e.recurrence !== 'none') ? `<i data-lucide="repeat" size="16" style="margin-left: 8px; opacity: 0.5; vertical-align: middle;" title="Wiederholung"></i>` : ''}</h3>
                        <div class="event-meta-row">
                            ${e.location ? `
                                <div class="event-meta-item">
                                    <i data-lucide="map-pin" size="14"></i>
                                    <span>${e.location}</span>
                                </div>` : ''}
                            ${e.time ? `
                                <div class="event-meta-item">
                                    <i data-lucide="clock" size="14"></i>
                                    <span>${e.time} Uhr</span>
                                </div>` : ''}
                        </div>
                        ${e.notes ? `<div class="event-notes-preview">${e.notes}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
    },



    // --- HELPERS ---
    checkArchivedEvents() {
        const now = new Date();
        const currentTs = now.getTime();
        let changed = false;

        this.state.events.forEach(e => {
            if (e.archived) return; // Already archived

            // Determine end time (default 1h duration if not set)
            // If no time, assume end of day (23:59)
            let endTs;
            if (e.allDay || !e.time) {
                endTs = new Date(e.date + 'T23:59:59').getTime();
            } else {
                const start = new Date(`${e.date}T${e.time}`);
                // Default duration 1h
                endTs = start.getTime() + (60 * 60 * 1000);
            }

            if (endTs < currentTs) {
                e.archived = true;
                e.updatedAt = Date.now();
                changed = true;
            }
        });

        if (changed) {
            this.saveLocal();
            // Don't call render here to avoid loop if called from render, 
            // but since we modify data, next render will pick it up.
        }
    },

    createEventElement(e, offsetPercent = 0, widthPercent = 100) {
        // Calculate position
        const [h, m] = (e.time || '00:00').split(':').map(Number);
        const startMin = h * 60 + m;

        // Use duration if available, default to 60m
        const duration = e.duration || 60;

        const el = document.createElement('div');
        el.className = `event-card ${e.category || ''} ${e.archived ? 'archived' : ''}`;
        el.style.top = `${startMin}px`;
        el.style.height = `${duration}px`;

        // Handle overlapping columns within a day
        el.style.left = `${offsetPercent}%`;
        el.style.width = `calc(${widthPercent}% - 6px)`;

        // Styling options (color)
        let baseColor = e.color;
        if (!baseColor) {
            const cat = (e.category || '').toLowerCase();
            // Fallback to category colors (English and common German names)
            if (cat === 'work' || cat === 'arbeit' || cat === '💼 arbeit') baseColor = '#4f46e5';
            else if (cat === 'private' || cat === 'privat' || cat === '👤 privat') baseColor = '#9333ea';
            else if (cat === 'urgent' || cat === 'dringend' || cat === 'wichtig') baseColor = '#dc2626';
            else if (cat === 'birthday' || cat === 'geburtstag') baseColor = '#eab308';
            else if (cat === 'holiday' || cat === 'feiertag') baseColor = '#0891b2';
            else baseColor = '#64748b'; // default slate
        }

        if (e.archived) baseColor = '#94a3b8';

        // Use stronger opacities for better readability (77 = 47%, 44 = 27%)
        el.style.background = `linear-gradient(135deg, ${baseColor}77, ${baseColor}44)`;
        el.style.borderLeft = `4px solid ${baseColor}`;
        el.style.color = 'var(--text-main)';

        if (e.archived) el.style.opacity = '0.8';

        el.onclick = (ev) => {
            ev.stopPropagation();
            app.editEvent(e.id);
        };

        // Determine icon
        let icon = 'clock';
        const cat = (e.category || '').toLowerCase();
        if (cat.includes('birth') || cat.includes('geburt') || cat.includes('cake')) icon = 'cake';
        else if (e.location) icon = 'map-pin';

        el.innerHTML = `
            <div class="event-card-inner">
                <div class="event-card-header">
                    <i data-lucide="${icon}" size="12"></i>
                    <span class="event-time">${e.time || '--:--'}</span>
                </div>
                <div class="event-title">${e.title}</div>
                ${e.location ? `<div class="event-loc"><i data-lucide="map-pin" size="10"></i> ${e.location}</div>` : ''}
            </div>
        `;
        return el;
    },

    renderTimeGrid(container, days, events, viewType) {
        container.innerHTML = '';
        container.className = `time-grid-container view-${viewType}`;

        const header = this.renderTimeGridHeader(days, viewType);
        const allDayRow = this.renderAllDayRow(days, events);
        const body = this.renderTimeGridBody(days, events, viewType);

        container.appendChild(header);
        container.appendChild(allDayRow);
        container.appendChild(body);

        // Scroll Logic: Center first event or fallback to current time
        setTimeout(() => {
            const scrollArea = container.querySelector('.time-grid-scroll-area');
            if (scrollArea) {
                let targetScroll = 0;

                // Find earliest event top position in the rendered grid
                // We look for direct children of columns which are event cards
                // Since cols are in shadow DOM essentially, querySelector needs to be deep or just find .event-card
                const firstEvent = scrollArea.querySelector('.event-card');

                if (firstEvent) {
                    // Get top value (e.g. "480px")
                    const topVal = parseInt(firstEvent.style.top || '0');
                    // Scroll so event is vertically centered-ish (minus 150px padding)
                    targetScroll = Math.max(0, topVal - 150);
                } else {
                    // Fallback to current time
                    const now = new Date();
                    const currentHour = now.getHours();
                    targetScroll = Math.max(0, (currentHour - 1) * 60);
                }

                scrollArea.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
        }, 100);

        if (window.lucide) lucide.createIcons();
    },

    renderTimeGridHeader(days, viewType) {
        const header = document.createElement('div');
        header.className = 'time-grid-header';

        // Time gutter spacer (matches the width of time-axis in body)
        header.innerHTML += `<div class="time-gutter-header"></div>`;

        days.forEach(date => {
            const isToday = new Date().toDateString() === date.toDateString();
            const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase();
            const dayNum = date.getDate();

            // Google Calendar style: Day Name small top, Day Num big bottom
            // If today: Day Name is colored (e.g. Blue), Day Num is White on Blue Circle.

            let dayClasses = 'header-day-col';
            if (isToday) dayClasses += ' today';

            header.innerHTML += `
                <div class="${dayClasses}" data-date="${date.toISOString()}">
                    <div class="header-day-name">${dayName}</div>
                    <div class="header-day-num">${dayNum}</div>
                </div>
            `;
        });

        // Scrollbar spacer
        header.innerHTML += `<div class="scrollbar-spacer"></div>`;

        return header;
    },

    renderAllDayRow(days, events) {
        const row = document.createElement('div');
        row.className = 'all-day-events-row';

        const gutter = document.createElement('div');
        gutter.className = 'all-day-gutter';
        gutter.textContent = 'Ganztags';
        row.appendChild(gutter);

        const content = document.createElement('div');
        content.className = 'all-day-content';

        days.forEach(date => {
            const dayAllDayEvents = events.filter(e => e.allDay && this.isEventOnDate(e, date));
            dayAllDayEvents.forEach(e => {
                const pill = document.createElement('div');
                pill.className = `all-day-pill ${e.category || ''}`;
                if (e.color) pill.style.background = e.color;
                pill.textContent = e.title;
                pill.onclick = () => app.editEvent(e.id);
                content.appendChild(pill);
            });
        });

        row.appendChild(content);
        return row;
    },

    renderTimeGridBody(days, events, viewType) {
        const body = document.createElement('div');
        body.className = 'time-grid-scroll-area';

        const content = document.createElement('div');
        content.className = 'time-grid-content';
        content.style.height = '1440px';

        // 1. Time Axis (Left side labels)
        const timeAxis = document.createElement('div');
        timeAxis.className = 'time-axis';
        timeAxis.onclick = (ev) => {
            const rect = timeAxis.getBoundingClientRect();
            const relativeY = ev.clientY - rect.top;
            const hour = Math.floor(relativeY / 60);
            const minutes = Math.floor((relativeY % 60) / 15) * 15;
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            // Default to first day in current view
            app.openCreateAt(days[0].toISOString().split('T')[0], timeStr);
        };
        for (let h = 0; h <= 23; h++) {
            const label = document.createElement('div');
            label.className = 'time-label-slot';
            label.style.top = `${h * 60}px`;
            label.innerHTML = `<span>${String(h).padStart(2, '0')}:00</span>`;
            timeAxis.appendChild(label);
        }
        content.appendChild(timeAxis);

        // Grid Lines (Hours & Half-Hours)
        const gridLines = document.createElement('div');
        gridLines.className = 'grid-lines-layer';
        for (let h = 0; h < 24; h++) {
            // Hour Line
            const line = document.createElement('div');
            line.className = 'horizontal-line';
            line.style.top = `${h * 60}px`;
            gridLines.appendChild(line);

            // Half-Hour Line (except for the last hour maybe, but let's go full 24)
            const halfLine = document.createElement('div');
            halfLine.className = 'half-hour-line';
            halfLine.style.top = `${h * 60 + 30}px`;
            gridLines.appendChild(halfLine);
        }
        content.appendChild(gridLines);

        // Columns
        const columnsContainer = document.createElement('div');
        columnsContainer.className = 'day-columns-container';

        days.forEach((date, dayIndex) => {
            const col = document.createElement('div');
            col.className = 'day-column';
            col.style.width = `${100 / days.length}%`;

            const dayEvents = events.filter(e => !e.allDay && this.isEventOnDate(e, date));

            // Smarter Position Calculation (Overlap Handling)
            dayEvents.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

            dayEvents.forEach((e, idx) => {
                // Simplified overlap: if same hour, shift right
                // In a perfect world we'd check precise minute overlaps
                const startTime = e.time || '00:00';
                const overlaps = dayEvents.filter((other, oIdx) => {
                    if (idx === oIdx) return false;
                    const oStart = other.time || '00:00';
                    return oStart.split(':')[0] === startTime.split(':')[0];
                });

                let offset = 0;
                let width = 100;
                if (overlaps.length > 0) {
                    const myOverlapIdx = [e, ...overlaps].sort((a, b) => a.id.localeCompare(b.id)).indexOf(e);
                    width = 100 / (overlaps.length + 1);
                    offset = myOverlapIdx * width;
                }

                const eventEl = this.createEventElement(e, offset, width);
                col.appendChild(eventEl);
            });

            // Now Marker
            if (new Date().toDateString() === date.toDateString()) {
                const now = new Date();
                const nowTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                const topPx = now.getHours() * 60 + now.getMinutes();
                const marker = document.createElement('div');
                marker.className = 'now-marker';
                marker.style.top = `${topPx}px`;

                // Add a small time badge to the marker
                marker.innerHTML = `<div class="now-time-badge">${nowTime}</div>`;

                col.appendChild(marker);
            }

            col.onclick = (ev) => {
                if (ev.target.closest('.event-card')) return;
                const rect = col.getBoundingClientRect();
                const relativeY = ev.clientY - rect.top;

                // Snap to 15 minutes
                const totalMinutes = Math.floor(relativeY);
                const hour = Math.floor(totalMinutes / 60);
                const minutes = Math.floor((totalMinutes % 60) / 15) * 15;

                const timeStr = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                app.openCreateAt(date.toISOString().split('T')[0], timeStr);
            };

            columnsContainer.appendChild(col);
        });

        content.appendChild(columnsContainer);
        body.appendChild(content);
        return body;
    },



    getEventStyle(e, colIndex, totalCols) {
        if (!e.time) return 'display:none';

        const [h, m] = e.time.split(':').map(Number);
        const startMin = h * 60 + m;
        const duration = 60; // Default 1h
        const endMin = startMin + duration;

        const top = (startMin / 1440) * 100;
        const height = (duration / 1440) * 100;

        // CSS Grid Calculation
        // Left offset = Time Gutter (60px) + (Col Index * Col Width)
        // We use calc()

        return `
            top: ${top}%;
            height: ${height}%;
            left: calc(60px + (100% - 60px) * ${colIndex} / ${totalCols});
            width: calc((100% - 60px) / ${totalCols} - 4px);
        `;
    },

    addMinutes(time, mins) {
        if (!time) return '';
        const [h, m] = time.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m + mins);
        return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    },

    handleTimelineClick(event, date) {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const y = event.clientY - rect.top;
        const totalMinutes = Math.floor(y / 2.5); // Scaled
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor((totalMinutes % 60) / 15) * 15; // Snap to 15m
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        this.openCreateAt(date, timeStr);
    },

    openRoute(address) {
        if (!address) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    },

    openDayRoute(dateStr) {
        const dayEvents = this.state.events.filter(e => e.date === dateStr && e.location);
        if (dayEvents.length === 0) return;

        // Sort by time
        const sorted = [...dayEvents].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

        // Use the first location as destination (start is 'My Location')
        // And use the rest as waypoints
        const destination = sorted[sorted.length - 1].location;
        const waypoints = sorted.slice(0, -1).map(e => e.location).join('|');

        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}`;
        window.open(url, '_blank');
    },

    renderYearView(grid, year, filteredEvents) {
        const mode = this.state.calendarLayoutMode || 'modern';
        grid.className = 'lifestyle-year-container';
        let html = '';
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDate = today.getDate();

        for (let m = 0; m < 12; m++) {
            const monthName = new Date(year, m, 1).toLocaleString('de-DE', { month: 'long' });

            html += `
                <div class="year-feed-month-section" id="month-section-${m}">
                    <div class="month-label-sticky">
                        <h2>${monthName}</h2>
                    </div>
                    <div class="year-month-card-modern">`;

            if (mode === 'modern') {
                html += `<div class="year-mini-grid-large">`;
                const firstDay = new Date(year, m, 1).getDay();
                const daysInMonth = new Date(year, m + 1, 0).getDate();
                let emptyCells = (firstDay + 6) % 7;

                for (let i = 0; i < emptyCells; i++) {
                    html += '<div class="year-mini-cell-large empty" style="background:transparent; opacity:0;"></div>';
                }

                for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const dailyEvents = filteredEvents.filter(e => e.date === dateStr);
                    const isToday = (year === currentYear && m === currentMonth && d === currentDate);
                    let classStr = 'year-mini-cell-large';
                    if (dailyEvents.length > 0) classStr += ' has-event';
                    if (isToday) classStr += ' is-today';

                    let dotsHtml = '';
                    if (dailyEvents.length > 0) {
                        dotsHtml = `<div class="mini-event-dots" style="position:absolute; bottom:4px; gap:2px;">
                            ${dailyEvents.slice(0, 3).map(e => `<div class="mini-event-dot" style="background:${isToday ? 'white' : (e.color || 'var(--primary)')}; width:4px; height:4px;"></div>`).join('')}
                        </div>`;
                    }
                    html += `<div class="${classStr}" onclick="app.goToDay('${dateStr}')" style="position:relative;">${d}${dotsHtml}</div>`;
                }
                html += `</div>`;
            } else {
                html += `<div class="year-agenda-list">`;
                const daysInMonth = new Date(year, m + 1, 0).getDate();
                for (let d = 1; d <= daysInMonth; d++) {
                    const date = new Date(year, m, d);
                    const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const dailyEvents = filteredEvents.filter(e => e.date === dateStr);
                    const isToday = (year === currentYear && m === currentMonth && d === currentDate);
                    const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });

                    html += `
                        <div class="year-agenda-day-row ${isToday ? 'is-today' : ''}" onclick="app.goToDay('${dateStr}')">
                            <div class="y-day-num">${d}</div>
                            <div class="y-day-name">${dayName}</div>
                            <div class="y-day-content">
                                ${dailyEvents.length > 0 ? dailyEvents.map(e => `
                                    <div class="y-event-mini" style="border-left-color: ${e.color || 'var(--primary)'}">
                                        ${e.time ? e.time + ' ' : ''}${e.title}
                                    </div>
                                `).join('') : '<div class="y-empty-day">Keine Termine</div>'}
                            </div>
                        </div>`;
                }
                html += `</div>`;
            }

            html += `</div></div>`;
        }
        grid.innerHTML = html;

        if (year === currentYear) {
            setTimeout(() => {
                const currentMonthEl = document.getElementById(`month-section-${currentMonth}`);
                if (currentMonthEl) {
                    currentMonthEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
    },

    goToDay(dateStr) {
        if (!dateStr) return;
        const [y, m, d] = dateStr.split('-').map(Number);
        // Set date to local noon to avoid any midnight timezone shifts
        this.state.currentDate = new Date(y, m - 1, d, 12, 0, 0);
        this.state.calendarView = 'day';
        this.render();
    },

    openCreateAt(date, time = '') {
        document.getElementById('eventDate').value = date;
        if (time) {
            const formattedTime = time.includes(':') ? (time.split(':')[0].padStart(2, '0') + ':00') : time;
            document.getElementById('eventTime').value = formattedTime;
        }
        // Reset action buttons for new event
        this.updateActionLink('eventPhone', 'eventCallBtn', 'tel:');
        this.updateActionLink('eventEmail', 'eventMailBtn', 'mailto:');

        document.getElementById('modalOverlay').classList.remove('hidden');
    },

    updateActionLink(inputId, btnId, prefix) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        if (!input || !btn) return;

        const val = input.value.trim();
        if (val) {
            btn.href = prefix + val;
            btn.classList.remove('hidden');
        } else {
            btn.href = '#';
            btn.classList.add('hidden');
        }
    },

    // --- CREATE MENU ---
    toggleCreateMenu(btn) {
        let menu = document.getElementById('createMenuDropdown');

        // Safety: close if no button passed (e.g. from item click)
        if (!btn && menu) {
            menu.classList.add('hidden');
            return;
        }

        if (!menu) {
            // Create menu if not exists
            menu = document.createElement('div');
            menu.id = 'createMenuDropdown';
            menu.className = 'create-menu-dropdown hidden';
            menu.innerHTML = `
                <div class="create-menu-item" onclick="app.openCreateAt(new Date().toISOString().split('T')[0]); app.toggleCreateMenu()">
                    <i data-lucide="calendar-plus"></i> Termin
                </div>
                 <div class="create-menu-item" onclick="app.navigateTo('calendar'); app.toggleCreateMenu()">
                    <i data-lucide="calendar"></i> Kalender
                </div>
                <div class="create-menu-item" onclick="app.navigateTo('todo'); app.toggleCreateMenu()">
                    <i data-lucide="check-square"></i> Aufgabe
                </div>
                <div class="create-menu-item" onclick="app.navigateTo('contacts'); app.toggleCreateMenu()">
                    <i data-lucide="user-plus"></i> Kontakt
                </div>
            `;
            document.body.appendChild(menu);

            // Close when clicking outside
            // Close when clicking outside
            document.addEventListener('click', (e) => {
                const trigger = document.getElementById('dashboardCreateBtn');
                if (menu && !menu.contains(e.target) && (!trigger || !trigger.contains(e.target))) {
                    menu.classList.add('hidden');
                }
            });
        }

        if (menu.classList.contains('hidden')) {
            if (btn) {
                const rect = btn.getBoundingClientRect();
                menu.style.top = (rect.bottom + 10) + 'px';
                menu.style.left = rect.left + 'px'; // Align left
                // if too close to right edge, align right
                if (rect.left + 200 > window.innerWidth) {
                    menu.style.left = 'auto';
                    menu.style.right = (window.innerWidth - rect.right) + 'px';
                }
            }

            menu.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        } else {
            menu.classList.add('hidden');
        }
    },

    // --- TODO MODULE ---
    todo: {
        add() {
            const input = document.getElementById('todoInput');
            const categoryInput = document.getElementById('todoCategory');
            const text = input.value.trim();
            if (!text) return;

            const isUrgent = document.getElementById('todoUrgent') ? document.getElementById('todoUrgent').checked : false;

            const newTodo = {
                id: Date.now().toString(),
                text: text,
                category: categoryInput.value,
                completed: false,
                urgent: isUrgent,
                createdAt: Date.now()
            };

            app.state.todos.unshift(newTodo);
            input.value = '';
            // Reset urgent checkbox
            if (document.getElementById('todoUrgent')) document.getElementById('todoUrgent').checked = false;
            app.saveLocal();
            this.render();

            app.notify("Aufgabe erstellt", text);

            // Sync fallback (trigger cloud push)
            if (app.sync && app.sync.push) app.sync.push();
        },

        toggle(id) {
            const todo = app.state.todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                app.saveLocal();
                this.render();
                if (app.sync && app.sync.push) app.sync.push();
            }
        },

        delete(id) {
            if (confirm("Aufgabe wirklich löschen?")) {
                app.state.todos = app.state.todos.filter(t => t.id !== id);
                app.saveLocal();
                this.render();
                if (app.sync && app.sync.push) app.sync.push();
            }
        },

        setFilter(filter) {
            app.state.todoFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
            });
            this.render();
        },

        clearCompleted() {
            app.state.todos = app.state.todos.filter(t => !t.completed);
            app.saveLocal();
            this.render();
            if (app.sync && app.sync.push) app.sync.push();
        },

        addCategory() {
            const name = prompt("Name der neuen Bezeichnung/Liste (z.B. 🚀 Projekt X):");
            if (name && !app.state.todoCategories.includes(name)) {
                app.state.todoCategories.push(name);
                app.saveLocal();
                this.render();
                if (app.sync && app.sync.push) app.sync.push();
            }
        },

        deleteCategory(name) {
            if (confirm(`Möchtest du die Bezeichnung "${name}" wirklich löschen?`)) {
                app.state.todoCategories = app.state.todoCategories.filter(c => c !== name);
                app.saveLocal();
                this.render();
                if (app.sync && app.sync.push) app.sync.push();
            }
        },

        render() {
            const list = document.getElementById('todoList');
            const select = document.getElementById('todoCategory');

            // Render select options if on Todo page
            if (select) {
                select.innerHTML = app.state.todoCategories.map(c => `<option value="${c}">${c}</option>`).join('');
            }

            // Render Todo List if on Todo page
            if (list) {
                const filtered = app.state.todos.filter(t => {
                    if (app.state.todoFilter === 'active') return !t.completed;
                    if (app.state.todoFilter === 'completed') return t.completed;
                    return true;
                });

                list.innerHTML = filtered.map(t => `
                    <div class="todo-item ${t.completed ? 'completed' : ''}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; transition: var(--transition); ${t.urgent ? 'border: 1px solid rgba(239,68,68,0.5); box-shadow: 0 0 10px rgba(239,68,68,0.1);' : ''}">
                        <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="app.todo.toggle('${t.id}')" style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--success);">
                        <div style="flex: 1; display: flex; flex-direction: column;">
                            <div style="display:flex; align-items:center; gap:5px;">
                                ${t.urgent ? '<i data-lucide="alert-circle" size="14" style="color:#ef4444;"></i>' : ''}
                                <span style="${t.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}; font-weight:${t.urgent ? '700' : '400'};">${t.text}</span>
                            </div>
                            <small style="font-size: 0.7rem; opacity: 0.6; margin-top: 2px;">${t.category || 'Generell'}</small>
                        </div>
                        <button onclick="app.todo.delete('${t.id}')" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;"><i data-lucide="trash-2" size="18"></i></button>
                    </div>
                `).join('');

                const activeCount = app.state.todos.filter(t => !t.completed).length;
                const countEl = document.getElementById('todoCount');
                if (countEl) countEl.textContent = `${activeCount} Aufgabe${activeCount === 1 ? '' : 'n'} übrig`;
            }

            // Category Management UI (Settings page)
            const catManager = document.getElementById('categoryManager');
            if (catManager) {
                catManager.innerHTML = app.state.todoCategories.map(c => `
                    <div class="category-tag" style="display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:20px; font-size:0.8rem; margin:2px;">
                        ${c} <i data-lucide="x" size="12" style="cursor:pointer;" onclick="app.todo.deleteCategory('${c}')"></i>
                    </div>
                `).join('') + `<button class="btn-text" style="font-size:0.8rem; margin-left:10px;" onclick="app.todo.addCategory()">+ Neu</button>`;
            }

            if (window.lucide) lucide.createIcons();
        }
    },

    // --- FAVORITES & QUICK ACTIONS ---
    toggleFavorites() {
        this.state.favsCollapsed = !this.state.favsCollapsed;
        localStorage.setItem('moltbot_favs_collapsed', this.state.favsCollapsed);
        this.renderFavorites();
    },

    renderFavorites() {
        const container = document.getElementById('quickContactsContainer');
        if (!container) return;

        // Visual Toggle State
        const btn = document.getElementById('toggleFavsBtn');
        if (btn) {
            const icon = btn.querySelector('svg') || btn.querySelector('i');
            if (this.state.favsCollapsed) {
                container.style.display = 'none';
                if (window.lucide && icon) icon.setAttribute('data-lucide', 'chevron-down');
            } else {
                container.style.display = 'grid';
                if (window.lucide && icon) icon.setAttribute('data-lucide', 'chevron-up');
            }
            if (window.lucide) lucide.createIcons();
        }

        if (this.state.favsCollapsed) return;

        const favs = this.state.contacts.filter(c => c.isFavorite);

        if (favs.length === 0) {
            container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); font-size:0.8rem; padding:10px;">Markiere Kontakte mit ❤️ als Favorit</div>';
            return;
        }

        container.innerHTML = favs.map(c => `
            <a href="tel:${c.phone}" class="scale-hover" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; align-items:center; gap:5px; padding:5px;">
                <div style="position:relative; width:55px; height:55px;">
                    <div style="width:100%; height:100%; border-radius:50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; align-items:center; justify-content:center; overflow:hidden; border:2px solid var(--glass-border); box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                        ${c.importIcon
                ? `<img src="${c.importIcon}" style="width:100%; height:100%; object-fit:cover;">`
                : `<span style="font-size:1.2rem; font-weight:700; color:white;">${c.name.charAt(0).toUpperCase()}</span>`
            }
                    </div>
                    <div style="position:absolute; bottom:-2px; right:-2px; background:var(--success); color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid var(--bg-card);">
                        <i data-lucide="phone" style="width:10px; height:10px;"></i>
                    </div>
                </div>
                <span style="font-size:0.75rem; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;">${c.name.split(' ')[0]}</span>
            </a>
        `).join('');

        if (window.lucide) lucide.createIcons();
    },

    // --- CONTACTS MODULE ---
    contacts: {
        add(contactData) {
            if (app.state.editingContactId) {
                const index = app.state.contacts.findIndex(c => c.id === app.state.editingContactId);
                if (index !== -1) {
                    app.state.contacts[index] = {
                        ...app.state.contacts[index],
                        ...contactData,
                        updatedAt: Date.now()
                    };
                }
                app.state.editingContactId = null;
            } else {
                const newContact = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    ...contactData,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                app.state.contacts.unshift(newContact);
            }
            app.saveLocal();

            // Navigate and Feedback
            app.navigateTo('contacts');
            app.notify(app.state.editingContactId ? "Kontakt aktualisiert" : "Kontakt gespeichert", contactData.name);

            this.render();
            if (app.sync && app.sync.push) app.sync.push();
        },

        edit(id) {
            const contact = app.state.contacts.find(c => c.id === id);
            if (!contact) return;

            app.state.editingContactId = id;

            document.getElementById('contactModalTitle').textContent = "Kontakt bearbeiten";
            document.getElementById('contactName').value = contact.name || '';
            document.getElementById('contactPhone').value = contact.phone || '';
            document.getElementById('contactEmail').value = contact.email || '';
            document.getElementById('contactAddress').value = contact.address || '';
            document.getElementById('contactBirthday').value = contact.birthday || '';
            document.getElementById('contactNotes').value = contact.notes || '';
            document.getElementById('contactIsFavorite').checked = !!contact.isFavorite;
            if (document.getElementById('contactIsUrgent')) document.getElementById('contactIsUrgent').checked = !!contact.isUrgent;

            // Update Action Buttons
            app.updateActionLink('contactPhone', 'contactCallBtn', 'tel:');
            app.updateActionLink('contactEmail', 'contactMailBtn', 'mailto:');

            const delBtn = document.getElementById('deleteContactBtn');
            if (delBtn) delBtn.style.display = 'block';

            document.getElementById('contactModalOverlay').classList.remove('hidden');
        },

        toggleFavorite(id) {
            const contact = app.state.contacts.find(c => c.id === id);
            if (contact) {
                contact.isFavorite = !contact.isFavorite;
                contact.updatedAt = Date.now();
                app.saveLocal();
                this.render();
                if (app.sync && app.sync.push) app.sync.push();
            }
        },

        delete(id) {
            if (!id && app.state.editingContactId) id = app.state.editingContactId;
            if (!id) return;

            if (confirm("Kontakt wirklich löschen?")) {
                app.state.contacts = app.state.contacts.filter(c => c.id !== id);
                app.saveLocal();
                this.render();
                if (app.sync && app.sync.push) app.sync.push();
                this.closeModal();
            }
        },

        openModal() {
            app.state.editingContactId = null;
            document.getElementById('contactModalTitle').textContent = "Kontakt hinzufügen";
            document.getElementById('contactForm').reset();

            // Reset action buttons
            app.updateActionLink('contactPhone', 'contactCallBtn', 'tel:');
            app.updateActionLink('contactEmail', 'contactMailBtn', 'mailto:');

            const delBtn = document.getElementById('deleteContactBtn');
            if (delBtn) delBtn.style.display = 'none';
            document.getElementById('contactModalOverlay').classList.remove('hidden');
        },

        closeModal() {
            document.getElementById('contactModalOverlay').classList.add('hidden');
        },

        checkAutoImport() {
            // Only if supported, empty list, and not dismissed yet
            if (!('contacts' in navigator && 'ContactsManager' in window)) return;
            if (app.state.contacts.length > 0) return;
            if (sessionStorage.getItem('moltbot_skip_import')) return;

            // Create and show a custom modal for "Automatic" feel
            const modalId = 'autoImportModal';
            if (document.getElementById(modalId)) return; // Already showing

            const modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); z-index: 10000;
                display: flex; align-items: center; justify-content: center;
                backdrop-filter: blur(10px); animation: fadeIn 0.3s;
            `;
            modal.innerHTML = `
                <div class="glass" style="max-width: 90%; width: 400px; text-align: center; padding: 40px; border: 1px solid var(--primary);">
                    <div style="width: 80px; height: 80px; background: rgba(var(--primary-rgb), 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i data-lucide="smartphone" size="40" style="color: var(--primary);"></i>
                    </div>
                    <h2 style="margin-bottom: 10px;">Telefonbuch synchronisieren?</h2>
                    <p class="text-muted" style="margin-bottom: 30px;">Möchtest du alle Kontakte (Nummern & E-Mails) von deinem Handy in die App übertragen?</p>
                    
                    <button class="btn-primary w-full" style="justify-content: center; font-size: 1.1rem; padding: 15px; margin-bottom: 15px;" id="btnAutoImport">
                        <i data-lucide="download-cloud"></i> Ja, alle importieren
                    </button>
                    
                    <button class="btn-text" style="color: var(--text-muted);" onclick="sessionStorage.setItem('moltbot_skip_import', 'true'); document.getElementById('${modalId}').remove();">
                        Nein, später
                    </button>
                </div>
            `;
            document.body.appendChild(modal);

            // Re-init icons for the new modal
            if (window.lucide) lucide.createIcons();

            // Bind click manually to avoid inline JS restrictions/scope issues
            document.getElementById('btnAutoImport').onclick = () => {
                document.getElementById(modalId).remove();
                this.importMobile();
            };
        },

        async importMobile() {
            // Check for API support
            if (!('contacts' in navigator && 'ContactsManager' in window)) {
                alert("Dein Browser unterstützt den direkten Handy-Import nicht.\nBitte nutze 'Import (VCF/CSV)' und wähle eine exportierte Kontaktdatei aus.");
                return;
            }

            try {
                // Request as much info as possible
                const props = ['name', 'tel', 'email', 'address', 'icon'];
                const opts = { multiple: true };

                const contacts = await navigator.contacts.select(props, opts);

                if (contacts && contacts.length > 0) {
                    let count = 0;
                    contacts.forEach(c => {
                        // Handle multiple values properly, usually first one is main
                        const name = c.name ? c.name[0] : 'Unbekannt';

                        // Simple duplicate check
                        const exists = app.state.contacts.some(ex => ex.name === name);
                        if (exists) return;

                        const newContact = {
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                            name: name,
                            phone: c.tel ? c.tel[0] : '',
                            email: c.email ? c.email[0] : '',
                            // Address object structure handling
                            address: c.address && c.address[0] ?
                                (c.address[0].addressLine ? c.address[0].addressLine.join(', ') :
                                    Object.values(c.address[0]).join(', ')) : '',
                            birthday: '',
                            notes: 'Importiert vom Handy',
                            importIcon: c.icon && c.icon[0] ? URL.createObjectURL(c.icon[0]) : null, // Future use
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        };
                        app.state.contacts.unshift(newContact);
                        count++;
                    });

                    app.saveLocal();
                    this.render();
                    if (app.sync && app.sync.push) app.sync.push();

                    // Show success directly in UI
                    const msg = `${count} Kontakte erfolgreich übertragen!`;
                    app.voice.showFeedback(msg);
                    alert(msg);
                }
            } catch (ex) {
                console.error("Kontakt-Import Fehler:", ex);
            }
        },

        import(input) {
            const file = input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                if (file.name.toLowerCase().endsWith('.vcf')) {
                    this.parseVCF(text);
                } else if (file.name.toLowerCase().endsWith('.csv')) {
                    this.parseCSV(text);
                } else {
                    alert("Format nicht unterstützt. Bitte VCF oder CSV verwenden.");
                }
                input.value = ''; // Reset
            };
            reader.readAsText(file);
        },

        parseVCF(text) {
            const cards = text.split(/BEGIN:VCARD/i);
            let count = 0;

            cards.forEach(card => {
                if (!card.trim()) return;

                const fnMatch = card.match(/FN:(.*)/i);
                // Fallback to N if FN is missing: N:Last;First;...
                const nMatch = card.match(/N:(.*)/i);

                let name = fnMatch ? fnMatch[1].trim() : '';
                if (!name && nMatch) {
                    const parts = nMatch[1].split(';');
                    // Usually Last;First
                    const first = parts[1] || '';
                    const last = parts[0] || '';
                    name = (first + ' ' + last).trim();
                }

                // Simple Tel match - might catch multiple, just take first
                const telMatch = card.match(/TEL.*:(.*)/i);
                const emailMatch = card.match(/EMAIL.*:(.*)/i);

                const phone = telMatch ? telMatch[1].trim() : '';
                const email = emailMatch ? emailMatch[1].trim() : '';

                if (name) {
                    // Don't trigger sync/save for every single contact to avoid freeze
                    const newContact = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name, phone, email, address: '', notes: 'Importiert (VCF)',
                        createdAt: Date.now(), updatedAt: Date.now()
                    };
                    app.state.contacts.unshift(newContact);
                    count++;
                }
            });

            app.saveLocal();
            app.sync.push();
            this.render();
            alert(`${count} Kontakte importiert!`);
        },

        parseCSV(text) {
            const lines = text.split('\n');
            let count = 0;
            lines.forEach((line, i) => {
                if (i === 0) return; // Skip Header
                const [name, phone, email] = line.split(',');
                if (name && name.trim()) {
                    const newContact = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: name.trim(),
                        phone: phone?.trim().replace(/"/g, '') || '',
                        email: email?.trim().replace(/"/g, '') || '',
                        address: '',
                        notes: 'Importiert (CSV)',
                        createdAt: Date.now(), updatedAt: Date.now()
                    };
                    app.state.contacts.unshift(newContact);
                    count++;
                }
            });
            app.saveLocal();
            app.sync.push();
            this.render();
            alert(`${count} Kontakte importiert.`);
        },

        render() {
            const container = document.getElementById('contactMainContainer');
            if (!container) return;

            // Check for Auto-Import (Automatic Prompt)
            this.checkAutoImport();

            // Also render the favorites sub-section
            app.renderFavorites();

            const search = document.getElementById('contactSearch')?.value.toLowerCase() || '';
            const filtered = app.state.contacts.filter(c =>
                c.name.toLowerCase().includes(search) ||
                (c.notes && c.notes.toLowerCase().includes(search)) ||
                (c.address && c.address.toLowerCase().includes(search))
            ).sort((a, b) => a.name.localeCompare(b.name));

            if (filtered.length === 0) {
                let html = '<div class="glass" style="text-align:center; padding: 40px; color: var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:15px;">';
                html += '<i data-lucide="users" size="48" style="opacity:0.5;"></i>';
                html += '<span>Noch keine Kontakte.</span>';

                // Proactive Check: offer import directly if supported
                if ('contacts' in navigator && 'ContactsManager' in window) {
                    html += `<button class="btn-primary" onclick="app.contacts.importMobile()" style="animation: pulse 2s infinite;">
                        <i data-lucide="smartphone"></i> Jetzt Kontakte vom Handy importieren
                     </button>`;
                    html += `<small style="opacity:0.7;">(Erfordert Berechtigung)</small>`;
                } else {
                    html += `<small>Tipp: Importiere Kontakte über "Mehr" oder erstelle einen neuen.</small>`;
                }

                html += '</div>';
                container.innerHTML = html;
                if (window.lucide) lucide.createIcons();
                return;
            }

            if (app.state.contactView === 'table') {
                this.renderTable(container, filtered);
            } else {
                this.renderCards(container, filtered);
            }

            if (window.lucide) lucide.createIcons();
        },

        renderTable(container, filtered) {
            container.innerHTML = `
                <div class="glass" style="overflow-x: auto; padding: 0;">
                    <table class="contact-table">
                        <thead>
                            <tr>
                                <th style="width: 50px;"></th>
                                <th>Name</th>
                                <th>Telefon</th>
                                <th>E-Mail</th>
                                <th>Adresse</th>
                                <th>Geburtstag</th>
                                <th style="width: 80px;">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(c => `
                                <tr class="contact-row">
                                    <td>
                                        <div class="avatar-small" style="background: var(--bg-hover); color: var(--primary); border: 1px solid var(--glass-border); font-weight: 700;">
                                            ${c.name.charAt(0).toUpperCase()}
                                        </div>
                                    </td>
                                    <td class="font-medium">${c.name}</td>
                                    <td>${c.phone ? `<a href="tel:${c.phone}" class="text-link">${c.phone}</a>` : '<span class="text-muted">-</span>'}</td>
                                    <td>${c.email ? `<a href="mailto:${c.email}" class="text-link">${c.email}</a>` : '<span class="text-muted">-</span>'}</td>
                                    <td>${c.address ? `<a href="https://maps.google.com/?q=${encodeURIComponent(c.address)}" target="_blank" class="text-link truncate" title="${c.address}">${c.address}</a>` : '<span class="text-muted">-</span>'}</td>
                                    <td>${c.birthday ? `<span class="text-link">${new Date(c.birthday).toLocaleDateString('de-DE')} 🎂</span>` : '<span class="text-muted">-</span>'}</td>
                                    <td>
                                        <div style="display:flex; gap:5px;">
                                            <button class="btn-icon ${c.isFavorite ? 'active-fav' : ''}" onclick="app.contacts.toggleFavorite('${c.id}')" title="Favorit toggeln">
                                                <i data-lucide="${c.isFavorite ? 'heart-off' : 'heart'}" size="18"></i>
                                            </button>
                                            <button class="btn-icon" onclick="app.contacts.edit('${c.id}')" title="Bearbeiten">
                                                <i data-lucide="edit-2" size="18"></i>
                                            </button>
                                            <button class="btn-icon-danger" onclick="app.contacts.delete('${c.id}')" title="Löschen">
                                                <i data-lucide="trash-2" size="18"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        },

        renderCards(container, filtered) {
            container.innerHTML = `
                <div class="contact-cards-grid">
                    ${filtered.map(c => `
                        <div class="contact-card glass">
                            <div class="card-top">
                                <div class="avatar-large" style="background: var(--bg-hover); color: var(--primary); border: 1px solid var(--glass-border); font-weight: 800;">
                                    ${c.name.charAt(0).toUpperCase()}
                                </div>
                                <div class="card-actions">
                                    <button class="btn-icon ${c.isFavorite ? 'active-fav' : ''}" onclick="app.contacts.toggleFavorite('${c.id}')" title="Favorit toggeln">
                                        <i data-lucide="${c.isFavorite ? 'heart-off' : 'heart'}" size="16"></i>
                                    </button>
                                    <button class="btn-icon" onclick="app.contacts.edit('${c.id}')"><i data-lucide="edit-2" size="16"></i></button>
                                    <button class="btn-icon-danger" onclick="app.contacts.delete('${c.id}')"><i data-lucide="trash-2" size="16"></i></button>
                                </div>
                            </div>
                            <div class="card-info">
                                <h3>${c.name}</h3>
                                ${c.phone ? `<a href="tel:${c.phone}" class="info-line"><i data-lucide="phone" size="14"></i> ${c.phone}</a>` : ''}
                                ${c.email ? `<a href="mailto:${c.email}" class="info-line"><i data-lucide="mail" size="14"></i> ${c.email}</a>` : ''}
                                ${c.birthday ? `<div class="info-line"><i data-lucide="cake" size="14"></i> ${new Date(c.birthday).toLocaleDateString('de-DE')}</div>` : ''}
                                ${c.address ? `
                                    <div class="address-box">
                                        <i data-lucide="map-pin" size="14"></i>
                                        <div class="address-text">
                                            <p>${c.address}</p>
                                            <a href="https://maps.google.com/?q=${encodeURIComponent(c.address)}" target="_blank" class="map-link">Auf Karte zeigen →</a>
                                        </div>
                                    </div>
                                ` : ''}
                                ${c.notes ? `<p class="notes-preview">"${c.notes}"</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },
    },

    // --- ALARM MODULE ---
    alarm: {
        weatherLoaded: false,
        init() {
            // Request Notification Permission
            if ("Notification" in window && Notification.permission !== "granted") {
                Notification.requestPermission();
            }

            setInterval(() => {
                this.updateClock();
                this.checkAlarm();
                this.checkReminders();
                this.checkBirthdays();
            }, 1000);

            // Auto-request persistence if enabled
            if (app.state.isWakeLockPersistent) {
                setTimeout(() => this.toggleWakeLock(true), 2000); // Small delay to improve success chance
            }
        },

        updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const clockEl = document.getElementById('nightModeClock');
            if (clockEl) clockEl.textContent = timeStr;

            // Fullscreen Clock
            const fsClock = document.getElementById('fullscreenClock');
            if (fsClock) fsClock.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

            const fsDate = document.getElementById('fullscreenDate');
            if (fsDate) fsDate.textContent = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

            // Auto-Night Mode Check
            this.checkAutoNightMode(now);

            // Update Dashboard clock if visible
            if (app.state.view === 'dashboard') {
                this.updateDashboardTime(now);
            }
        },

        updateDashboardTime(now) {
            const clockEl = document.getElementById('dashClock');
            const dateEl = document.getElementById('dashDate');
            const tempEl = document.getElementById('dashTemp');
            const locEl = document.getElementById('dashLocation');

            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            }
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
            }

            // Fetch weather and location only once per session or periodically
            if (!this.weatherLoaded) {
                this.fetchWeatherData();
                this.weatherLoaded = true;
            }
        },

        async fetchWeatherData() {
            if (!navigator.geolocation) return;

            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Fetch real temperature from Open-Meteo
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                    const data = await response.json();

                    const tempEl = document.getElementById('dashTemp');
                    if (tempEl && data.current_weather) {
                        tempEl.textContent = `${Math.round(data.current_weather.temperature)}°C`;
                    }

                    // Fetch location name (Reverse Geocoding)
                    const locResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const locData = await locResponse.json();

                    const locEl = document.getElementById('dashLocation');
                    if (locEl) {
                        const city = locData.address.city || locData.address.town || locData.address.village || 'Standort';
                        locEl.textContent = city;
                    }
                } catch (error) {
                    console.error("Weather/Location fetch failed:", error);
                    const tempEl = document.getElementById('dashTemp');
                    if (tempEl) tempEl.textContent = 'N/A';
                    const locEl = document.getElementById('dashLocation');
                    if (locEl) locEl.textContent = 'Unbekannt';
                }
            }, (error) => {
                console.warn("Geolocation denied or failed:", error);
                const locEl = document.getElementById('dashLocation');
                if (locEl) locEl.textContent = 'Lokaler Modus';
            });
        },

        checkAutoNightMode(now) {
            if (!app.state.isAutoNightclockEnabled) return;

            const current = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

            // Trigger if exactly start time OR if app was just opened/resumed and it's within the night period
            // (Assuming night period is from start time until 06:00 for auto-activation)
            const startTime = app.state.nightModeStart;
            const isAtStartTime = current === startTime;

            // Experimental: If app is hidden/background, send a notification to "Wake up" for night mode
            if (isAtStartTime && document.visibilityState !== 'visible') {
                app.notify("Pear Nachtuhr", "Es ist Zeit für den Nachtmodus. Tippe hier, um die Uhr zu aktivieren.", "#view-alarm");
            }

            if (isAtStartTime && !app.state.isNightClockFullscreen) {
                this.toggleFullscreen(true);
                // Also ensure wake lock is on
                const wakeCheck = document.getElementById('wakeLockCheck');
                if (wakeCheck && !wakeCheck.checked) {
                    wakeCheck.checked = true;
                    this.toggleWakeLock();
                }
            }
        },

        checkReminders() {
            const now = new Date();
            app.state.events.forEach(e => {
                // Skip passed events or already notified
                if (e.notified) return;

                const eventTime = new Date(`${e.date}T${e.time || '00:00'}`);
                const diffMs = eventTime - now;
                const diffMins = diffMs / 60000;

                // Alert if within 60 minutes and future
                if (diffMins > 0 && diffMins <= 60) {
                    this.sendNotification(e, Math.ceil(diffMins));
                    e.notified = true; // Mark as notified in memory (resets on reload, reasonable)
                }
            });
        },

        checkBirthdays() {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();
            const currentDate = today.getDate();

            app.state.contacts.forEach(c => {
                if (!c.birthday) return;

                // Check if already notified this year
                if (c.lastBirthdayNotificationYear === currentYear) return;

                const bday = new Date(c.birthday);
                if (bday.getMonth() === currentMonth && bday.getDate() === currentDate) {
                    // It's their birthday today!
                    this.sendBirthdayNotification(c);

                    // Mark as notified and save
                    c.lastBirthdayNotificationYear = currentYear;
                    app.saveLocal();
                }
            });
        },

        sendNotification(event, minsLeft) {
            const title = `Termin in ${minsLeft} Min: ${event.title}`;
            const options = {
                body: `${event.time} Uhr - ${event.location || 'Kein Ort'}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png' // Generic calendar icon
            };

            // Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(title, options);
            }

            // Subtle In-App Toast (always works)
            this.showToast(title, event.color);
        },

        sendBirthdayNotification(contact) {
            const title = `🎉 Heute: Geburtstag von ${contact.name}!`;
            const body = "Nicht vergessen zu gratulieren!";

            // Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(title, {
                    body: body,
                    icon: 'https://cdn-icons-png.flaticon.com/512/2488/2488980.png' // Generic cake icon
                });
            }

            // In-App Toast
            this.showToast(`${title} \n${body}`, '#f59e0b'); // Gold color
        },

        showToast(text, color) {
            const toast = document.createElement('div');
            toast.className = 'glass animate-in';
            toast.style.cssText = `
                position: fixed; 
                top: 24px; 
                right: 24px; 
                background: var(--bg-card); 
                color: var(--text-main); 
                padding: 16px 24px; 
                border-radius: var(--radius-md); 
                z-index: 10000; 
                box-shadow: var(--card-shadow);
                display: flex; 
                align-items: center; 
                gap: 12px;
                min-width: 320px;
                border: 1px solid var(--primary);
                animation: slideInRight 0.4s cubic-bezier(0.2, 0, 0, 1);
            `;
            toast.innerHTML = `<i data-lucide="bell" size="20" style="color: var(--primary);"></i> <div style="font-weight:600; font-size: 0.95rem;">${text}</div>`;
            document.body.appendChild(toast);

            if (window.lucide) lucide.createIcons();

            // Sound (Subtle "Pop")
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio autoplay blocked"));

            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 500);
            }, 5000);
        },

        toggleFullscreen(force = null) {
            const desiredState = force !== null ? force : !app.state.isNightClockFullscreen;
            app.state.isNightClockFullscreen = desiredState;

            const overlay = document.getElementById('nightClockFullscreen');
            if (overlay) {
                overlay.classList.toggle('hidden', !desiredState);
                if (desiredState) {
                    overlay.classList.toggle('is-landscape-forced', app.state.isNightLandscape);
                    if (window.lucide) lucide.createIcons();
                }
            }

            // Browser Fullscreen API
            if (desiredState) {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch(err => console.log("Fullscreen allowed only by user interaction"));
                } else if (elem.webkitRequestFullscreen) { /* Safari */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE11 */
                    elem.msRequestFullscreen();
                }

                // Wake Lock try
                if (navigator.wakeLock) {
                    navigator.wakeLock.request('screen').catch(console.warn);
                }
                this.toggleWakeLock();
            } else {
                if (document.exitFullscreen && document.fullscreenElement) {
                    document.exitFullscreen().catch(e => console.log(e));
                } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) { /* Safari */
                    document.webkitExitFullscreen();
                }
            }
        },

        toggleLandscape() {
            app.state.isNightLandscape = !app.state.isNightLandscape;
            localStorage.setItem('moltbot_night_landscape', app.state.isNightLandscape);

            const overlay = document.getElementById('nightClockFullscreen');
            if (overlay) {
                overlay.classList.toggle('is-landscape-forced', app.state.isNightLandscape);
            }

            // Update UI Icons (Bedside Layout)
            const mainIcon = document.getElementById('landscapeMainIcon');
            if (mainIcon) {
                mainIcon.setAttribute('data-lucide', app.state.isNightLandscape ? 'check-circle' : 'layout-template');
            }

            const mainBtn = document.getElementById('landscapeMainBtn');
            if (mainBtn) {
                mainBtn.style.background = app.state.isNightLandscape ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)';
                mainBtn.style.color = app.state.isNightLandscape ? 'white' : 'var(--primary)';
            }

            const toggleText = document.getElementById('landscapeToggleText');
            if (toggleText) {
                toggleText.textContent = app.state.isNightLandscape ? 'Standard-Layout' : 'Nachttisch-Format';
            }

            if (window.lucide) lucide.createIcons();
        },

        saveSettings() {
            const start = document.getElementById('nightModeStart').value;
            const autoEnabled = document.getElementById('autoNightclockAction').checked;

            app.state.nightModeStart = start;
            app.state.isAutoNightclockEnabled = autoEnabled;

            localStorage.setItem('moltbot_night_mode_start', start);
            localStorage.setItem('moltbot_auto_nightclock', autoEnabled);

            // Robust persistence: trigger a full save and sync
            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();
        },

        updateDesign(type, value) {
            const clockEl = document.getElementById('fullscreenClock');
            const overlay = document.getElementById('nightClockFullscreen');

            if (type === 'brightness') {
                app.state.nightModeBrightness = value;
                localStorage.setItem('moltbot_night_brightness', value);

                // Only change content opacity, keep background black (opacity 1)
                if (clockEl) clockEl.style.opacity = value;
                const dateEl = document.getElementById('fullscreenDate');
                if (dateEl) dateEl.style.opacity = value;
                // Also dim controls or hint if preferred, but usually we want to see controls

                // Ensure overlay itself is fully opaque (black background)
                if (overlay) overlay.style.opacity = '1';

                // Sync Inputs
                const in1 = document.getElementById('nightBrightness');
                const in2 = document.getElementById('fsBrightness');
                if (in1 && in1.value !== value) in1.value = value;
                if (in2 && in2.value !== value) in2.value = value;
            } else if (type === 'color') {
                app.state.nightModeColor = value;
                localStorage.setItem('moltbot_night_color', value);
                if (clockEl) {
                    clockEl.style.color = value;
                    clockEl.style.textShadow = `0 0 30px ${value}4D`; // 30% opacity hex
                }

                // Sync Inputs
                const in1 = document.getElementById('nightColor');
                const in2 = document.getElementById('fsColor');
                if (in1 && in1.value !== value) in1.value = value;
                if (in2 && in2.value !== value) in2.value = value;
            }
        },

        add() {
            const timeInput = document.getElementById('newAlarmTime');
            const daySelector = document.querySelectorAll('.day-selector input:checked');

            if (!timeInput.value) return;

            const days = Array.from(daySelector).map(input => parseInt(input.value));

            const newAlarm = {
                id: Date.now().toString(),
                time: timeInput.value,
                days: days,
                active: true
            };

            app.state.alarms.push(newAlarm);
            this.save();
            this.render();
            timeInput.value = '';
        },

        toggle(id) {
            const alarm = app.state.alarms.find(a => a.id === id);
            if (alarm) {
                alarm.active = !alarm.active;
                this.save();
                this.render();
            }
        },

        delete(id) {
            if (confirm("Wecker wirklich löschen?")) {
                app.state.alarms = app.state.alarms.filter(a => a.id !== id);
                app.saveLocal();
                this.render();
                if (app.sync && app.sync.push) app.sync.push();
            }
        },

        save() {
            localStorage.setItem('moltbot_alarms', JSON.stringify(app.state.alarms));
        },

        checkAlarm() {
            if (app.state.alarms.length === 0) return;


            const now = new Date();
            const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
            const currentTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

            app.state.alarms.forEach(alarm => {
                if (alarm.active && alarm.time === currentTime && alarm.days.includes(currentDay)) {
                    // Avoid double trigger in the same minute
                    if (alarm.lastTriggered === currentTime) return;

                    alarm.lastTriggered = currentTime;
                    this.trigger(alarm);
                }
            });
        },

        trigger(alarm) {
            // High-frequency alert
            const stop = window.confirm(`🔔 WECKER! Es ist ${alarm.time} Uhr.\nStoppen?`);
            if (stop) {
                // If it's a non-recurring (once) alarm, we could deactivate it, 
                // but since the user chose days, we keep it active for next week.
            }
        },

        async toggleWakeLock(force = null) {
            const check = document.getElementById('wakeLockCheck');
            if (!check) return;

            const shouldActivate = force !== null ? force : check.checked;
            check.checked = shouldActivate;

            if (shouldActivate) {
                try {
                    if ('wakeLock' in navigator) {
                        if (!app.state.wakeLock) {
                            app.state.wakeLock = await navigator.wakeLock.request('screen');
                            console.log("Wake Lock active");
                        }
                    } else {
                        if (force === null) alert("Dein Browser unterstützt das Wachbleiben leider nicht.");
                        check.checked = false;
                    }
                } catch (err) {
                    console.error(`${err.name}, ${err.message}`);
                    check.checked = false;
                }
            } else {
                if (app.state.wakeLock) {
                    app.state.wakeLock.release().then(() => {
                        app.state.wakeLock = null;
                        console.log("Wake Lock released");
                    });
                }
            }

            // Always persist the preference
            app.state.isWakeLockPersistent = check.checked;
            localStorage.setItem('moltbot_wakelock_persistent', check.checked);
        },

        render() {
            const list = document.getElementById('alarmList');
            if (!list) return;

            // Populate settings inputs FIRST (so they work even if alarm list is empty)
            const startInput = document.getElementById('nightModeStart');
            if (startInput) startInput.value = app.state.nightModeStart;

            const autoNightToggle = document.getElementById('autoNightclockAction');
            if (autoNightToggle) autoNightToggle.checked = app.state.isAutoNightclockEnabled;

            const wakeLockToggle = document.getElementById('wakeLockCheck');
            if (wakeLockToggle) wakeLockToggle.checked = app.state.isWakeLockPersistent;

            const brightInput = document.getElementById('nightBrightness');
            if (brightInput) brightInput.value = app.state.nightModeBrightness || 1;

            const colorInput = document.getElementById('nightColor');
            if (colorInput) colorInput.value = app.state.nightModeColor || '#ffffff';

            // Populate Fullscreen inputs
            const fsBright = document.getElementById('fsBrightness');
            if (fsBright) fsBright.value = app.state.nightModeBrightness || 1;
            const fsColor = document.getElementById('fsColor');
            if (fsColor) fsColor.value = app.state.nightModeColor || '#ffffff';

            // Apply styles immediately
            this.updateDesign('brightness', app.state.nightModeBrightness || 1);
            this.updateDesign('color', app.state.nightModeColor || '#ffffff');

            // Sync Landscape State UI
            const mainBtn = document.getElementById('landscapeMainBtn');
            if (mainBtn) {
                mainBtn.style.background = app.state.isNightLandscape ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)';
                mainBtn.style.color = app.state.isNightLandscape ? 'white' : 'var(--primary)';
            }
            const mainIcon = document.getElementById('landscapeMainIcon');
            if (mainIcon) {
                mainIcon.setAttribute('data-lucide', app.state.isNightLandscape ? 'check-circle' : 'layout-template');
            }
            const toggleText = document.getElementById('landscapeToggleText');
            if (toggleText) {
                toggleText.textContent = app.state.isNightLandscape ? 'Standard-Layout' : 'Nachttisch-Format';
            }

            if (window.lucide) lucide.createIcons();

            // Then render the list
            if (app.state.alarms.length === 0) {
                list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">Noch keine Wecker eingestellt.</div>';
                return;
            }

            const dayNames = { 0: 'So', 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa' };

            list.innerHTML = app.state.alarms.map(alarm => {
                const readableDays = alarm.days.length === 7 ? 'Täglich' :
                    alarm.days.length === 0 ? 'Nie' :
                        alarm.days.sort().map(d => dayNames[d]).join(', ');

                return `
                    <div class="alarm-card ${alarm.active ? '' : 'inactive'}" onclick="app.alarm.toggle('${alarm.id}')" style="cursor:pointer;">
                        <div class="alarm-info-main">
                            <span class="alarm-time-display">${alarm.time}</span>
                            <span class="alarm-days-display">${readableDays}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div class="custom-switch" style="width: 40px; height: 20px; background: ${alarm.active ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; border-radius: 20px; position:relative; transition: 0.3s;">
                                <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position:absolute; top: 2px; ${alarm.active ? 'right: 2px;' : 'left: 2px;'}; transition: 0.3s;"></div>
                            </div>
                            <button onclick="event.stopPropagation(); app.alarm.delete('${alarm.id}')" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;">
                                <i data-lucide="trash-2" size="20"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            if (window.lucide) lucide.createIcons();
        }
    },

    // --- HOLIDAY MODULE ---
    holidays: {
        getForYear(year) {
            const holidays = [];

            // Fixed Holidays
            const fixed = [
                { d: 1, m: 0, t: 'Neujahr' },
                { d: 6, m: 0, t: 'Heilige Drei Könige', bw: true },
                { d: 1, m: 4, t: 'Tag der Arbeit' },
                { d: 3, m: 9, t: 'Tag der Deutschen Einheit' },
                { d: 1, m: 10, t: 'Allerheiligen', bw: true },
                { d: 24, m: 11, t: 'Heiligabend' },
                { d: 25, m: 11, t: '1. Weihnachtstag' },
                { d: 26, m: 11, t: '2. Weihnachtstag' },
                { d: 31, m: 11, t: 'Silvester' }
            ];

            fixed.forEach(h => {
                holidays.push({
                    id: `hol-${year}-${h.m}-${h.d}`,
                    title: h.t,
                    date: `${year}-${String(h.m + 1).padStart(2, '0')}-${String(h.d).padStart(2, '0')}`,
                    category: 'holiday',
                    isBW: h.bw || false,
                    allDay: true
                });
            });

            // Easter Calculation (Gauss)
            const a = year % 19;
            const b = Math.floor(year / 100);
            const c = year % 100;
            const d = Math.floor(b / 4);
            const e = b % 4;
            const f = Math.floor((b + 8) / 25);
            const g = Math.floor((b - f + 1) / 3);
            const h = (19 * a + b - d - g + 15) % 30;
            const i = Math.floor(c / 4);
            const k = c % 4;
            const l = (32 + 2 * e + 2 * i - h - k) % 7;
            const m = Math.floor((a + 11 * h + 22 * l) / 451);

            const easterMonth = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
            const easterDay = ((h + l - 7 * m + 114) % 31) + 1;
            const easterDate = new Date(year, easterMonth, easterDay);

            const addDays = (date, days) => {
                const result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            };

            const variableHolidays = [
                { t: 'Karfreitag', offset: -2 },
                { t: 'Ostermontag', offset: 1 },
                { t: 'Christi Himmelfahrt', offset: 39 },
                { t: 'Pfingstmontag', offset: 50 },
                { t: 'Fronleichnam', offset: 60, bw: true }
            ];

            variableHolidays.forEach(vh => {
                const date = addDays(easterDate, vh.offset);
                holidays.push({
                    id: `hol-var-${year}-${vh.t}`,
                    title: vh.t,
                    date: date.toISOString().split('T')[0],
                    category: 'holiday',
                    isBW: vh.bw || false,
                    allDay: true
                });
            });


            return holidays;
        }
    },

    // --- VOICE CONTROL MODULE ---
    voice: {
        recognition: null,
        wakeWordRecognition: null,
        isListening: false,
        isWakeWordActive: false,

        init() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.warn("Speech Recognition not supported in this browser.");
                return;
            }

            // Main recognition for commands
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'de-DE';
            this.recognition.interimResults = true;
            this.recognition.continuous = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                document.getElementById('voiceOverlay').classList.remove('hidden');
                document.getElementById('voiceTranscript').textContent = "Ich höre zu...";
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                const resultEl = document.getElementById('voiceTranscript');
                if (resultEl) resultEl.textContent = transcript;

                if (event.results[0].isFinal) {
                    this.process(transcript);
                    setTimeout(() => this.stop(), 1500);
                }
            };

            this.recognition.onerror = (e) => {
                console.error("Speech Recognition Error:", e);
                this.stop();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                // Restart wake word listening after command is done
                if (this.isWakeWordActive) {
                    setTimeout(() => this.startWakeWord(), 500);
                }
            };

            // Wake Word Recognition (continuous listening for "Pear")
            this.wakeWordRecognition = new SpeechRecognition();
            this.wakeWordRecognition.lang = 'de-DE';
            this.wakeWordRecognition.interimResults = true;
            this.wakeWordRecognition.continuous = true; // Keep listening

            this.wakeWordRecognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('').toLowerCase();

                // Check for wake word "pear" or "peer" or "pir"
                if (transcript.includes('pear') || transcript.includes('peer') || transcript.includes('pir') || transcript.includes('pia')) {
                    console.log("Wake word detected:", transcript);
                    this.wakeWordRecognition.stop();

                    // Play activation sound
                    this.playActivationSound();

                    // Start main recognition
                    setTimeout(() => this.start(), 300);
                }
            };

            this.wakeWordRecognition.onerror = (e) => {
                if (e.error !== 'no-speech' && e.error !== 'aborted') {
                    console.error("Wake Word Recognition Error:", e);
                }
                // Auto-restart on error
                if (this.isWakeWordActive) {
                    setTimeout(() => this.startWakeWord(), 1000);
                }
            };

            this.wakeWordRecognition.onend = () => {
                // Auto-restart wake word listening
                if (this.isWakeWordActive && !this.isListening) {
                    setTimeout(() => this.startWakeWord(), 500);
                }
            };
        },

        startWakeWord() {
            if (!this.wakeWordRecognition) this.init();
            if (this.wakeWordRecognition && !this.isListening) {
                try {
                    this.isWakeWordActive = true;
                    app.state.isWakeWordEnabled = true;
                    localStorage.setItem('moltbot_wake_word_enabled', 'true');
                    this.wakeWordRecognition.start();
                    console.log("Wake word listening started...");
                } catch (e) {
                    console.error("Wake word start error:", e);
                }
            }
        },

        stopWakeWord() {
            this.isWakeWordActive = false;
            app.state.isWakeWordEnabled = false;
            localStorage.setItem('moltbot_wake_word_enabled', 'false');
            if (this.wakeWordRecognition) {
                try {
                    this.wakeWordRecognition.stop();
                    console.log("Wake word listening stopped.");
                } catch (e) {
                    console.error("Wake word stop error:", e);
                }
            }
        },

        playActivationSound() {
            // Play a short beep to indicate activation
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        },

        start() {
            if (!this.recognition) this.init();
            if (this.recognition && !this.isListening) {
                try {
                    this.recognition.start();
                } catch (e) { console.error(e); }
            }
        },

        stop() {
            if (this.recognition && this.isListening) {
                this.recognition.stop();
            }
            document.getElementById('voiceOverlay').classList.add('hidden');
        },

        process(text) {
            const input = text.toLowerCase();
            console.log("Pear AI Processing:", input);

            const statusTitle = document.getElementById('aiStatusTitle');
            if (statusTitle) statusTitle.textContent = "Verarbeite...";

            // 0. AI PERSONALITY & CONVERSATION
            if (input.includes('wer bist du') || input.includes('was bist du')) {
                this.showFeedback("Ich bin Pear AI, dein intelligenter persönlicher Assistent. Ich helfe dir dabei, dein Leben zu organisieren.");
                return;
            }
            if (input.includes('hallo') || input.includes('hey') || input.includes('moin')) {
                this.showFeedback(`Hallo ${app.state.user.name.split(' ')[0]}! Wie kann ich dich heute unterstützen?`);
                return;
            }
            if (input.includes('danke') || input.includes('vielen dank')) {
                this.showFeedback("Sehr gerne! Sag einfach Bescheid, wenn du noch etwas brauchst.");
                return;
            }
            if (input.includes('was kannst du') || input.includes('hilfe')) {
                this.showFeedback("Ich kann Termine planen, Aufgaben verwalten, Finanzen tracken und deine Kontakte pflegen. Frag mich einfach!");
                return;
            }

            // 1. PROFILE QUERIES
            if (input.includes('wie heiße ich') || input.includes('mein name') || input.includes('wer bin ich')) {
                this.showFeedback(`Dein Name ist ${app.state.user.name}.`);
                return;
            }
            if (input.includes('telefonnummer')) {
                this.showFeedback(`Deine Telefonnummer lautet ${app.state.user.phone || 'nicht hinterlegt'}.`);
                return;
            }
            if (input.includes('email') || input.includes('e-mail')) {
                this.showFeedback(`Deine E-Mail Adresse ist ${app.state.user.email || 'nicht hinterlegt'}.`);
                return;
            }
            if (input.includes('adresse') || input.includes('wohne ich')) {
                this.showFeedback(`Deine Adresse ist ${app.state.user.address || 'nicht hinterlegt'}.`);
                return;
            }
            if (input.includes('geburtstag') || input.includes('wann bin ich geboren')) {
                const bday = app.state.user.birthday;
                this.showFeedback(`Dein Geburtstag ist am ${bday ? new Date(bday).toLocaleDateString('de-DE') : 'nicht hinterlegt'}.`);
                return;
            }

            // 1.5 TEAM QUERIES
            if (input.includes('team') || input.includes('verbunden') || input.includes('online')) {
                const isConnected = !!app.state.user.teamName;
                if (!isConnected) {
                    this.showFeedback("Du bist aktuell nicht mit einem Team verbunden. Du kannst dich im Bereich 'Team Sync' anmelden.");
                    app.navigateTo('team');
                    return;
                }

                const list = document.getElementById('presenceList');
                let memberNames = [];
                if (list) {
                    memberNames = Array.from(list.querySelectorAll('.member-name'))
                        .map(m => m.textContent.replace('(Ich)', '').trim())
                        .filter(name => name !== app.state.user.name);
                }

                if (memberNames.length > 0) {
                    const membersStr = memberNames.join(', ');
                    this.showFeedback(`Du bist aktuell im Team "${app.state.user.teamName}" mit ${membersStr} verbunden.`);
                } else {
                    this.showFeedback(`Du bist im Team "${app.state.user.teamName}", aber aktuell sind keine anderen Mitglieder online.`);
                }
                app.navigateTo('team');
                return;
            }

            // 2. FINANCE DETECTION
            if (input.includes('euro') || input.includes('betrag') || input.includes('ausgabe') || input.includes('kosten') || input.includes('€') || input.includes('budget') || input.includes('gehalt')) {
                // If setting budget/salary
                if ((input.includes('setze') || input.includes('mein') || input.includes('ist')) && (input.includes('budget') || input.includes('gehalt'))) {
                    const amountMatches = text.match(/(\d+([,.]\d+)?)/);
                    if (amountMatches) {
                        const amount = parseFloat(amountMatches[1].replace(',', '.'));
                        app.state.monthlyBudget = amount;
                        localStorage.setItem('moltbot_budget', amount);
                        this.showFeedback(`Dein monatliches Budget (Gehalt) wurde auf ${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} festgelegt.`);
                        app.finance.render();
                        return;
                    }
                }

                // If setting warning threshold
                if ((input.includes('warn-schwelle') || input.includes('warnung')) && input.includes('euro')) {
                    const amountMatches = text.match(/(\d+([,.]\d+)?)/);
                    if (amountMatches) {
                        const amount = parseFloat(amountMatches[1].replace(',', '.'));
                        app.state.budgetWarningLimit = amount;
                        localStorage.setItem('moltbot_budget_warning', amount);
                        this.showFeedback(`Die Warn-Schwelle wurde auf ${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} festgelegt.`);
                        app.finance.render();
                        return;
                    }
                }

                // If just "wie ist mein budget"
                if (input.includes('wie ist') || input.includes('wieviel') || input.includes('kontostand')) {
                    const currentMonth = new Date().toISOString().substring(0, 7);
                    const monthlyExpenses = app.state.finance
                        .filter(e => e.date.startsWith(currentMonth) && e.type === 'expense')
                        .reduce((acc, curr) => acc + curr.amount, 0);
                    const remaining = app.state.monthlyBudget - monthlyExpenses;

                    this.showFeedback(`Dein Budget beträgt ${app.state.monthlyBudget.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}. Aktuell hast du noch ${remaining.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} übrig.`);
                } else {
                    this.handleFinance(text);
                }
                return;
            }

            // 3. APPOINTMENT DETECTION (TERMIN)
            if (input.includes('termin') || input.includes('treffen') || input.includes('meeting') || input.includes('uhr') || input.includes('erinnere')) {
                this.handleEvent(text);
                return;
            }

            // 4. CONTACT DETECTION
            if (input.includes('kontakt') && (input.includes('speichern') || input.includes('neuer') || input.includes('hinzu'))) {
                this.handleContact(text);
                return;
            }

            // 5. TODO DETECTION
            if (input.includes('aufgabe') || input.includes('todo') || input.includes('kaufen') || input.includes('besorgen') || input.includes('erinnerung')) {
                this.handleTodo(text);
                return;
            }

            // 6. DEFAULT: INTELLIGENT NOTE
            this.handleTodo(text, '👤 Privat');
        },

        handleFinance(text) {
            const amountMatches = text.match(/(\d+([,.]\d+)?)/);
            if (!amountMatches) return alert("Habe keinen Betrag verstanden.");

            const amount = parseFloat(amountMatches[1].replace(',', '.'));
            // Remove the keywords to get the source/title
            let source = text.replace(/euro|betrag|ausgabe|kosten|€/gi, '')
                .replace(/(\d+([,.]\d+)?)/, '')
                .replace(/für|ein|eine/gi, '')
                .trim();

            if (!source) source = "Sprach-Eintrag";

            const entry = {
                id: Date.now().toString(),
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                source: source.charAt(0).toUpperCase() + source.slice(1),
                createdAt: Date.now()
            };

            app.state.finance.push(entry);
            app.saveLocal();
            app.navigateTo('finance');
            this.showFeedback(`Betrag gespeichert: ${amount}€ für ${source}`);
            app.finance.checkBudget(); // Trigger Warning Check
        },

        handleTodo(text, forcedCategory = null) {
            let label = text.replace(/aufgabe|todo|kaufen|besorgen|erinnerung|notiere|notiz/gi, '')
                .replace(/bitte|mal/gi, '')
                .trim();

            if (!label) return;

            const category = forcedCategory || (text.includes('kaufen') ? '🛒 Einkauf' : '👤 Privat');

            const newTodo = {
                id: Date.now().toString(),
                text: label.charAt(0).toUpperCase() + label.slice(1),
                category: category,
                completed: false,
                createdAt: Date.now()
            };

            app.state.todos.unshift(newTodo);
            app.saveLocal();
            app.navigateTo('todo');
            this.showFeedback(`Aufgabe hinzugefügt: ${label}`);
        },

        handleEvent(text) {
            let title = "Termin";
            let date = new Date().toISOString().split('T')[0];
            let time = "10:00";
            let location = "";
            let notes = "Via Sprachbefehl erstellt";

            // 1. Parse Name/Title
            const mitMatch = text.match(/mit\s+([a-zA-ZäöüÄÖÜß\s]+)/i);
            if (mitMatch) {
                title = `Treffen mit ${mitMatch[1].trim().split(' ')[0]}`;
            }

            // 2. Parse Location
            const locKeywords = ['in', 'bei', 'nach', 'im', 'am ort', 'adresse'];
            const locRegex = new RegExp(`(?:${locKeywords.join('|')})\\s+([a-zA-ZäöüÄÖÜß0-9\\s,.-]+?)(?=\\s+(?:um|am|im|für|$) )`, 'i');
            const locMatch = text.match(locRegex) || text.match(/(?:in|bei|nach|im)\s+([a-zA-ZäöüÄÖÜß0-9\s,.-]+)$/i);

            if (locMatch) {
                location = locMatch[1].trim();
            }

            // 3. Parse Time
            const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(?:Uhr)/i);
            if (timeMatch) {
                const h = timeMatch[1].padStart(2, '0');
                const m = timeMatch[2] || '00';
                time = `${h}:${m}`;
            }

            // 4. Parse Date
            if (text.includes('morgen')) {
                const d = new Date(); d.setDate(d.getDate() + 1);
                date = d.toISOString().split('T')[0];
            } else if (text.includes('übermorgen')) {
                const d = new Date(); d.setDate(d.getDate() + 2);
                date = d.toISOString().split('T')[0];
            }

            // 5. Parse Recurrence
            let recurrence = 'none';
            if (input.includes('täglich') || input.includes('jeden tag')) recurrence = 'daily';
            else if (input.includes('wöchentlich') || input.includes('jede woche')) recurrence = 'weekly';
            else if (input.includes('monatlich') || input.includes('jeden monat')) recurrence = 'monthly';
            else if (input.includes('jährlich') || input.includes('jedes jahr') || input.includes('jahrestag')) recurrence = 'yearly';

            const newEvent = {
                id: Date.now().toString(),
                title: title,
                date: date,
                time: time,
                location: location,
                category: 'work',
                recurrence: recurrence,
                notes: notes,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            app.state.events.push(newEvent);
            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();

            // Navigate and Open modal
            app.navigateTo('calendar');
            app.editEvent(newEvent.id);

            this.showFeedback(`Termin gespeichert: ${title} in ${location || 'Ort unbekannt'} um ${time}`);
        },

        handleContact(text) {
            // Remove trigger words
            let name = text.replace(/kontakt|speichern|neuer|hinzufügen|trage|ein/gi, '')
                .replace(/mit|den|namen/gi, '') // filtering filler
                .trim();

            // Capitalize
            if (name) name = name.charAt(0).toUpperCase() + name.slice(1);
            else name = "Unbekannt";

            const newContact = {
                id: Date.now().toString(),
                name: name,
                phone: '',
                email: '',
                address: '',
                notes: 'Via Sprache',
                createdAt: Date.now()
            };
            app.state.contacts.unshift(newContact);
            app.saveLocal();
            if (app.sync && app.sync.push) app.sync.push();

            // Navigate and Open modal
            app.navigateTo('contacts');
            app.contacts.edit(newContact.id);

            this.showFeedback(`Kontakt gespeichert: ${name}`);
        },

        showFeedback(msg) {
            const statusTitle = document.getElementById('aiStatusTitle');
            if (statusTitle) statusTitle.textContent = "Antwort";

            const resultEl = document.getElementById('voiceTranscript');
            if (resultEl) {
                resultEl.style.color = 'var(--success)';
                resultEl.textContent = msg;
            }

            // Audible Feedback
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(msg);
                utterance.lang = 'de-DE';
                utterance.rate = 1.0;
                window.speechSynthesis.speak(utterance);
            }
        }
    },

    updateWidgetVisibility(widget, visible) {
        if (!this.state.widgetVisibility) this.state.widgetVisibility = {};
        this.state.widgetVisibility[widget] = visible;
        localStorage.setItem('moltbot_widgets', JSON.stringify(this.state.widgetVisibility));
        if (this.state.view === 'dashboard') this.renderDashboard();
        if (this.state.view === 'settings') this.renderWidgetSettings();
    },

    moveWidget(index, direction) {
        const order = this.state.widgetOrder;
        if (direction === 'up' && index > 0) {
            [order[index], order[index - 1]] = [order[index - 1], order[index]];
        } else if (direction === 'down' && index < order.length - 1) {
            [order[index], order[index + 1]] = [order[index + 1], order[index]];
        }
        this.state.widgetOrder = [...order];
        localStorage.setItem('moltbot_widget_order', JSON.stringify(this.state.widgetOrder));

        if (this.state.view === 'dashboard') this.renderDashboard();
        if (this.state.view === 'settings') this.renderWidgetSettings();
    },

    renderWidgetSettings() {
        const list = document.getElementById('widgetOrderList');
        if (!list) return;

        const widgetNames = {
            'special': 'Besonderheiten (Geburtstage/Feiertage)',
            'drive': 'Drive Mode (Smart Navigation)',
            'kpis': 'Finanz-Kennzahlen & Übersicht',
            'quick_finance': 'Schnell-Eingabe Ausgaben',
            'events': 'Termine & Wichtiges',
            'mini_calendar': 'Mini-Monatskalender'
        };

        const widgetIcons = {
            'special': 'party-popper',
            'drive': 'car',
            'kpis': 'trending-up',
            'quick_finance': 'wallet',
            'events': 'calendar',
            'mini_calendar': 'grid'
        };

        list.innerHTML = this.state.widgetOrder.map((key, index) => {
            const isVisible = this.state.widgetVisibility[key];
            return `
            <div class="widget-settings-item" style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--glass-border);">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button class="btn-icon-mini" onclick="app.moveWidget(${index}, 'up')" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>
                        <i data-lucide="chevron-up" size="14"></i>
                    </button>
                    <button class="btn-icon-mini" onclick="app.moveWidget(${index}, 'down')" ${index === this.state.widgetOrder.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
                        <i data-lucide="chevron-down" size="14"></i>
                    </button>
                </div>
                
                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(var(--primary-rgb), 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                    <i data-lucide="${widgetIcons[key]}" size="20"></i>
                </div>

                <div style="flex: 1;">
                    <span style="font-weight: 600; font-size: 0.95rem;">${widgetNames[key]}</span>
                </div>

                <label class="custom-switch" style="cursor: pointer;">
                    <input type="checkbox" ${isVisible ? 'checked' : ''} onchange="app.updateWidgetVisibility('${key}', this.checked)" style="width: 20px; height: 20px; accent-color: var(--primary);">
                </label>
            </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    },


    showFeedback() {
        const f = prompt("Wie können wir MoltBot verbessern? Deine Meinung ist uns wichtig!");
        if (f) {
            alert("Vielen Dank! Dein Feedback wurde gespeichert.");
            console.log("UX Feedback:", f);
        }
    }
};

// Start the app when ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

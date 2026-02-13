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

    // Add drag and drop functionality
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

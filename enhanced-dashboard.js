/**
 * ENHANCED DASHBOARD SYSTEM
 * Advanced features for premium dashboard experience
 */

class EnhancedDashboard {
    constructor() {
        this.widgets = new Map();
        this.animations = [];
        this.charts = new Map();
        this.init();
    }

    init() {
        this.setupWidgets();
        this.initializeCharts();
        this.startAnimations();
        this.setupInteractions();
    }

    setupWidgets() {
        // Define enhanced widget configurations
        this.widgetConfigs = {
            upcomingEvents: {
                id: 'upcoming-events',
                title: 'Nächste Termine',
                icon: 'calendar',
                span: 2,
                priority: 1
            },
            financeSummary: {
                id: 'finance-summary',
                title: 'Finanz-Übersicht',
                icon: 'wallet',
                span: 1,
                priority: 2
            },
            taskProgress: {
                id: 'task-progress',
                title: 'Aufgaben-Fortschritt',
                icon: 'check-circle',
                span: 1,
                priority: 3
            },
            weatherWidget: {
                id: 'weather',
                title: 'Wetter',
                icon: 'cloud',
                span: 1,
                priority: 4
            },
            activityFeed: {
                id: 'activity-feed',
                title: 'Letzte Aktivitäten',
                icon: 'activity',
                span: 2,
                priority: 5
            },
            quickStats: {
                id: 'quick-stats',
                title: 'Schnellübersicht',
                icon: 'trending-up',
                span: 3,
                priority: 6
            }
        };
    }

    renderEnhancedDashboard() {
        const container = document.querySelector('.dashboard-grid');
        if (!container) return;

        container.innerHTML = '';

        // Render widgets in priority order
        const sortedWidgets = Object.values(this.widgetConfigs)
            .sort((a, b) => a.priority - b.priority);

        sortedWidgets.forEach((config, index) => {
            const widget = this.createWidget(config);
            widget.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(widget);
        });

        // Initialize after rendering
        setTimeout(() => {
            this.populateWidgets();
            lucide.createIcons();
        }, 100);
    }

    createWidget(config) {
        const widget = document.createElement('div');
        widget.className = `widget-card animate-in ${config.span ? `span-${config.span}` : ''}`;
        widget.id = config.id;

        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    <div class="widget-icon">
                        <i data-lucide="${config.icon}"></i>
                    </div>
                    ${config.title}
                </div>
                <div class="widget-actions">
                    <button class="widget-action-btn" onclick="enhancedDashboard.refreshWidget('${config.id}')" title="Aktualisieren">
                        <i data-lucide="refresh-cw" size="16"></i>
                    </button>
                    <button class="widget-action-btn" onclick="enhancedDashboard.expandWidget('${config.id}')" title="Vergrößern">
                        <i data-lucide="maximize-2" size="16"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content" id="${config.id}-content">
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        return widget;
    }

    populateWidgets() {
        this.populateUpcomingEvents();
        this.populateFinanceSummary();
        this.populateTaskProgress();
        this.populateWeatherWidget();
        this.populateActivityFeed();
        this.populateQuickStats();
    }

    populateUpcomingEvents() {
        const content = document.getElementById('upcoming-events-content');
        if (!content) return;

        const events = app.state.events
            .filter(e => !e.archived && new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        if (events.length === 0) {
            content.innerHTML = `
                <div class="widget-empty">
                    <i data-lucide="calendar-x"></i>
                    <p>Keine anstehenden Termine</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const html = events.map(event => {
            const eventDate = new Date(event.date);
            const isToday = this.isToday(eventDate);
            const isTomorrow = this.isTomorrow(eventDate);

            let dateLabel = eventDate.toLocaleDateString('de-DE', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });

            if (isToday) dateLabel = 'Heute';
            if (isTomorrow) dateLabel = 'Morgen';

            return `
                <div class="activity-item" onclick="app.editEvent('${event.id}')">
                    <div class="activity-icon" style="background: ${this.getCategoryColor(event.category)}">
                        <i data-lucide="calendar" size="18"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${event.title}</div>
                        <div class="activity-time">
                            ${dateLabel} ${event.time ? `• ${event.time}` : ''}
                            ${event.location ? `• ${event.location}` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = `<div class="activity-feed">${html}</div>`;
        lucide.createIcons();
    }

    populateFinanceSummary() {
        const content = document.getElementById('finance-summary-content');
        if (!content) return;

        const budget = app.state.user.monthlyBudget || 0;
        const spent = app.finance.calculateTotalExpenses();
        const remaining = budget - spent;
        const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

        content.innerHTML = `
            <div class="metric-value">€${remaining.toFixed(0)}</div>
            <div class="metric-label">Verfügbar</div>
            
            <div class="progress-container">
                <div class="progress-info">
                    <span>Budget-Nutzung</span>
                    <span class="progress-percentage">${percentage.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
            
            <div class="quick-stats" style="margin-top: 20px;">
                <div class="stat-box">
                    <div class="stat-box-value">€${budget.toFixed(0)}</div>
                    <div class="stat-box-label">Budget</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-value">€${spent.toFixed(0)}</div>
                    <div class="stat-box-label">Ausgegeben</div>
                </div>
            </div>
        `;
    }

    populateTaskProgress() {
        const content = document.getElementById('task-progress-content');
        if (!content) return;

        const todos = app.state.todos.filter(t => !t.archived);
        const completed = todos.filter(t => t.done).length;
        const total = todos.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        content.innerHTML = `
            <div class="metric-value">${completed}/${total}</div>
            <div class="metric-label">Erledigt</div>
            
            <div class="progress-container">
                <div class="progress-info">
                    <span>Fortschritt</span>
                    <span class="progress-percentage">${percentage.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
            
            <div class="task-summary" style="margin-top: 20px;">
                ${this.getTaskCategories().map(cat => `
                    <div class="task-category" style="border-left-color: ${cat.color}">
                        <div class="task-category-name">
                            <i data-lucide="${cat.icon}" size="16"></i>
                            ${cat.name}
                        </div>
                        <div class="task-category-count">${cat.count}</div>
                    </div>
                `).join('')}
            </div>
        `;
        lucide.createIcons();
    }

    populateWeatherWidget() {
        const content = document.getElementById('weather-content');
        if (!content) return;

        // Get weather from app state
        const temp = app.state.weather?.temp || '--';
        const location = app.state.weather?.location || 'Unbekannt';
        const condition = app.state.weather?.condition || 'cloudy';

        content.innerHTML = `
            <div class="weather-widget">
                <div class="weather-icon-large">
                    <i data-lucide="${this.getWeatherIcon(condition)}"></i>
                </div>
                <div class="weather-temp">${temp}°C</div>
                <div class="metric-label">${location}</div>
                
                <div class="weather-details">
                    <div class="weather-detail">
                        <div class="weather-detail-value">65%</div>
                        <div class="weather-detail-label">Luftfeuchtigkeit</div>
                    </div>
                    <div class="weather-detail">
                        <div class="weather-detail-value">12 km/h</div>
                        <div class="weather-detail-label">Wind</div>
                    </div>
                    <div class="weather-detail">
                        <div class="weather-detail-value">1013 hPa</div>
                        <div class="weather-detail-label">Luftdruck</div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    populateActivityFeed() {
        const content = document.getElementById('activity-feed-content');
        if (!content) return;

        const activities = this.getRecentActivities();

        if (activities.length === 0) {
            content.innerHTML = `
                <div class="widget-empty">
                    <i data-lucide="inbox"></i>
                    <p>Keine aktuellen Aktivitäten</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const html = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color}">
                    <i data-lucide="${activity.icon}" size="18"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');

        content.innerHTML = `<div class="activity-feed">${html}</div>`;
        lucide.createIcons();
    }

    populateQuickStats() {
        const content = document.getElementById('quick-stats-content');
        if (!content) return;

        const stats = [
            {
                label: 'Termine heute',
                value: this.getTodayEventsCount(),
                icon: 'calendar',
                color: 'var(--primary)'
            },
            {
                label: 'Offene Aufgaben',
                value: app.state.todos.filter(t => !t.done && !t.archived).length,
                icon: 'check-square',
                color: 'var(--secondary)'
            },
            {
                label: 'Kontakte',
                value: app.state.contacts.filter(c => !c.archived).length,
                icon: 'users',
                color: 'var(--accent)'
            },
            {
                label: 'Team-Mitglieder',
                value: app.sync?.onlineUsers?.size || 0,
                icon: 'wifi',
                color: 'var(--success)'
            }
        ];

        const html = stats.map(stat => `
            <div class="stat-box">
                <div class="stat-box-value" style="color: ${stat.color}">${stat.value}</div>
                <div class="stat-box-label">
                    <i data-lucide="${stat.icon}" size="12"></i>
                    ${stat.label}
                </div>
            </div>
        `).join('');

        content.innerHTML = `<div class="quick-stats">${html}</div>`;
        lucide.createIcons();
    }

    // Helper methods
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    }

    getCategoryColor(category) {
        const colors = {
            work: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            private: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
            urgent: 'linear-gradient(135deg, #ef4444, #dc2626)',
            birthday: 'linear-gradient(135deg, #ffd700, #ffa500)',
            holiday: 'linear-gradient(135deg, #ff9f43, #ff6b6b)'
        };
        return colors[category] || colors.private;
    }

    getWeatherIcon(condition) {
        const icons = {
            sunny: 'sun',
            cloudy: 'cloud',
            rainy: 'cloud-rain',
            snowy: 'cloud-snow',
            stormy: 'cloud-lightning'
        };
        return icons[condition] || 'cloud';
    }

    getTaskCategories() {
        const todos = app.state.todos.filter(t => !t.archived);
        return [
            {
                name: 'Dringend',
                count: todos.filter(t => t.urgent && !t.done).length,
                icon: 'alert-circle',
                color: 'var(--urgent)'
            },
            {
                name: 'Heute',
                count: todos.filter(t => !t.done && t.dueDate && this.isToday(new Date(t.dueDate))).length,
                icon: 'calendar',
                color: 'var(--primary)'
            },
            {
                name: 'Erledigt',
                count: todos.filter(t => t.done).length,
                icon: 'check-circle',
                color: 'var(--success)'
            }
        ];
    }

    getTodayEventsCount() {
        return app.state.events.filter(e =>
            !e.archived && this.isToday(new Date(e.date))
        ).length;
    }

    getRecentActivities() {
        const activities = [];

        // Recent events
        const recentEvents = app.state.events
            .filter(e => !e.archived)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 3);

        recentEvents.forEach(event => {
            activities.push({
                title: `Termin erstellt: ${event.title}`,
                time: this.getRelativeTime(event.createdAt),
                icon: 'calendar-plus',
                color: 'linear-gradient(135deg, var(--primary), var(--secondary))'
            });
        });

        // Recent todos
        const recentTodos = app.state.todos
            .filter(t => t.done)
            .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
            .slice(0, 2);

        recentTodos.forEach(todo => {
            activities.push({
                title: `Aufgabe erledigt: ${todo.text}`,
                time: this.getRelativeTime(todo.completedAt),
                icon: 'check-circle',
                color: 'linear-gradient(135deg, var(--success), #059669)'
            });
        });

        return activities.slice(0, 5);
    }

    getRelativeTime(timestamp) {
        if (!timestamp) return 'Gerade eben';

        const now = new Date();
        const then = new Date(timestamp);
        const diff = Math.floor((now - then) / 1000); // seconds

        if (diff < 60) return 'Gerade eben';
        if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
        if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
        return `vor ${Math.floor(diff / 86400)} Tagen`;
    }

    // Widget actions
    refreshWidget(widgetId) {
        const content = document.getElementById(`${widgetId}-content`);
        if (!content) return;

        content.innerHTML = '<div class="widget-loading"><div class="loading-spinner"></div></div>';

        setTimeout(() => {
            this.populateWidgets();
        }, 500);
    }

    expandWidget(widgetId) {
        // Navigate to the relevant view
        const widgetMap = {
            'upcoming-events': 'calendar',
            'finance-summary': 'finance',
            'task-progress': 'todo',
            'activity-feed': 'dashboard'
        };

        const targetView = widgetMap[widgetId];
        if (targetView) {
            app.navigateTo(targetView);
        }
    }

    setupInteractions() {
        // Add smooth scroll behavior
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    initializeCharts() {
        // Initialize Chart.js instances for widgets if needed
        // This can be expanded based on requirements
    }

    startAnimations() {
        // Start any continuous animations
        this.animateMetrics();
    }

    animateMetrics() {
        // Animate metric values with counting effect
        document.querySelectorAll('.metric-value').forEach(element => {
            const target = parseFloat(element.textContent.replace(/[^0-9.-]/g, ''));
            if (isNaN(target)) return;

            let current = 0;
            const increment = target / 30;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = element.textContent.includes('€')
                    ? `€${Math.round(current)}`
                    : Math.round(current).toString();
            }, 30);
        });
    }
}

// Initialize enhanced dashboard
let enhancedDashboard;

document.addEventListener('DOMContentLoaded', () => {
    enhancedDashboard = new EnhancedDashboard();
});

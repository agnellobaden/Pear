/**
 * PREMIUM TODO LIST INTEGRATION
 * Integriert die Premium Todo-Liste in die Pear App
 */

class PremiumTodoList {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // Load todos from app.state if available
        if (typeof app !== 'undefined' && app.state && app.state.todos) {
            this.todos = app.state.todos;
        } else {
            this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('pear_todos');
        if (stored) {
            try {
                this.todos = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading todos:', e);
                this.todos = [];
            }
        }
    }

    save() {
        localStorage.setItem('pear_todos', JSON.stringify(this.todos));

        // Sync with app.state if available
        if (typeof app !== 'undefined' && app.state) {
            app.state.todos = this.todos;
            if (app.saveLocal) {
                app.saveLocal();
            }
        }
    }

    renderTodoView() {
        const container = document.getElementById('view-todo') || document.querySelector('[data-page="todo"]');
        if (!container) {
            console.warn('Todo container not found');
            return;
        }

        container.innerHTML = `
            <div class="todo-container">
                <!-- Hero Section with Stats -->
                <div class="todo-hero">
                    <div class="todo-hero-content">
                        <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Deine Aufgaben 👋</h1>
                        <p style="color: var(--text-muted); font-size: 1.1rem;">Behalte den Überblick über deine To-Dos</p>
                        
                        <div class="todo-stats-row">
                            <div class="todo-stat-card">
                                <div class="todo-stat-value" id="totalTasks">0</div>
                                <div class="todo-stat-label">Gesamt</div>
                            </div>
                            <div class="todo-stat-card">
                                <div class="todo-stat-value" id="activeTasks">0</div>
                                <div class="todo-stat-label">Aktiv</div>
                            </div>
                            <div class="todo-stat-card">
                                <div class="todo-stat-value" id="completedTasks">0</div>
                                <div class="todo-stat-label">Erledigt</div>
                            </div>
                            <div class="todo-stat-card">
                                <div class="todo-stat-value" id="urgentTasks">0</div>
                                <div class="todo-stat-label">Dringend</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Add -->
                <div class="todo-quick-add">
                    <div class="todo-input-row">
                        <div class="todo-input-wrapper">
                            <i data-lucide="plus-circle" class="todo-input-icon"></i>
                            <input 
                                type="text" 
                                class="todo-input" 
                                id="newTodoInput"
                                placeholder="Neue Aufgabe hinzufügen..."
                                onkeypress="if(event.key==='Enter') premiumTodoList.addTodo()"
                            >
                        </div>
                        <button class="todo-add-btn" onclick="premiumTodoList.addTodo()">
                            <i data-lucide="plus" size="20"></i>
                            <span>Hinzufügen</span>
                        </button>
                    </div>
                </div>
                
                <!-- Filters -->
                <div class="todo-filters">
                    <button class="todo-filter-btn active" data-filter="all" onclick="premiumTodoList.filterTodos('all')">
                        <i data-lucide="list" size="16"></i>
                        Alle
                        <span class="filter-count" id="filter-count-all">0</span>
                    </button>
                    <button class="todo-filter-btn" data-filter="active" onclick="premiumTodoList.filterTodos('active')">
                        <i data-lucide="circle" size="16"></i>
                        Aktiv
                        <span class="filter-count" id="filter-count-active">0</span>
                    </button>
                    <button class="todo-filter-btn" data-filter="completed" onclick="premiumTodoList.filterTodos('completed')">
                        <i data-lucide="check-circle" size="16"></i>
                        Erledigt
                        <span class="filter-count" id="filter-count-completed">0</span>
                    </button>
                    <button class="todo-filter-btn" data-filter="urgent" onclick="premiumTodoList.filterTodos('urgent')">
                        <i data-lucide="alert-circle" size="16"></i>
                        Dringend
                        <span class="filter-count" id="filter-count-urgent">0</span>
                    </button>
                </div>
                
                <!-- Todo List -->
                <div class="todo-list" id="todoList"></div>
            </div>
        `;

        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Render todos
        this.renderTodos();
        this.updateStats();
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        if (!todoList) return;

        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="todo-empty">
                    <div class="todo-empty-icon">
                        <i data-lucide="inbox" size="80"></i>
                    </div>
                    <h3>Keine Aufgaben</h3>
                    <p>Füge deine erste Aufgabe hinzu!</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }

        // Separate active and completed todos
        const activeTodos = filteredTodos.filter(t => !t.done);
        const completedTodos = filteredTodos.filter(t => t.done);

        let html = '';

        // Render active todos
        if (activeTodos.length > 0) {
            html += activeTodos.map(todo => this.createTodoHTML(todo)).join('');
        }

        // Render completed section if there are completed todos
        if (completedTodos.length > 0) {
            html += `
                <div class="todo-section-divider">
                    <div class="divider-line"></div>
                    <div class="divider-text">
                        <i data-lucide="check-circle" size="16"></i>
                        Erledigt (${completedTodos.length})
                    </div>
                    <div class="divider-line"></div>
                </div>
            `;
            html += completedTodos.map(todo => this.createTodoHTML(todo)).join('');
        }

        todoList.innerHTML = html;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    createTodoHTML(todo) {
        const urgentClass = todo.urgent ? 'urgent' : '';
        const doneClass = todo.done ? 'done' : '';
        const checked = todo.done ? 'checked' : '';

        return `
            <div class="todo-item ${urgentClass} ${doneClass}" data-id="${todo.id}">
                <div class="todo-content">
                    <div class="todo-checkbox-wrapper">
                        <input type="checkbox" class="todo-checkbox" ${checked} onchange="premiumTodoList.toggleTodo('${todo.id}')">
                    </div>
                    <div class="todo-main">
                        <div class="todo-text" onclick="premiumTodoList.toggleTodo('${todo.id}')">${this.escapeHtml(todo.text)}</div>
                        <div class="todo-meta">
                            ${todo.urgent ? `
                                <span class="todo-tag urgent">
                                    <i data-lucide="alert-circle" size="12"></i>
                                    Dringend
                                </span>
                            ` : ''}
                            ${todo.category ? `
                                <span class="todo-tag category">
                                    <i data-lucide="${this.getCategoryIcon(todo.category)}" size="12"></i>
                                    ${todo.category}
                                </span>
                            ` : ''}
                            ${todo.dueDate ? `
                                <span class="todo-tag due-date">
                                    <i data-lucide="calendar" size="12"></i>
                                    ${this.formatDate(todo.dueDate)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="todo-action-btn ${todo.urgent ? 'urgent-active' : ''}" onclick="premiumTodoList.toggleUrgent('${todo.id}')" title="${todo.urgent ? 'Als normal markieren' : 'Als dringend markieren'}">
                            <i data-lucide="alert-circle" size="16"></i>
                        </button>
                        <button class="todo-action-btn" onclick="premiumTodoList.editTodo('${todo.id}')" title="Bearbeiten">
                            <i data-lucide="edit-3" size="16"></i>
                        </button>
                        <button class="todo-action-btn delete" onclick="premiumTodoList.deleteTodo('${todo.id}')" title="Löschen">
                            <i data-lucide="trash-2" size="16"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addTodo() {
        const input = document.getElementById('newTodoInput');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now().toString(),
            text: text,
            done: false,
            urgent: false,
            category: 'Allgemein',
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.save();
        input.value = '';

        this.renderTodos();
        this.updateStats();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.done = !todo.done;
            if (todo.done) {
                todo.completedAt = new Date().toISOString();
            } else {
                delete todo.completedAt;
            }
            this.save();
            this.renderTodos();
            this.updateStats();
        }
    }

    toggleUrgent(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.urgent = !todo.urgent;
            this.save();
            this.renderTodos();
            this.updateStats();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Aufgabe bearbeiten:', todo.text);
        if (newText && newText.trim()) {
            todo.text = newText.trim();
            this.save();
            this.renderTodos();
        }
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.style.transition = 'all 0.3s ease';
            todoElement.style.opacity = '0';
            todoElement.style.transform = 'translateX(-100%)';

            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.save();
                this.renderTodos();
                this.updateStats();
            }, 300);
        }
    }

    filterTodos(filter) {
        this.currentFilter = filter;

        // Update button states
        document.querySelectorAll('.todo-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.renderTodos();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.done);
            case 'completed':
                return this.todos.filter(t => t.done);
            case 'urgent':
                return this.todos.filter(t => t.urgent && !t.done);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.done).length;
        const active = total - completed;
        const urgent = this.todos.filter(t => t.urgent && !t.done).length;

        // Update stat cards
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        updateElement('totalTasks', total);
        updateElement('activeTasks', active);
        updateElement('completedTasks', completed);
        updateElement('urgentTasks', urgent);

        // Update filter counts
        updateElement('filter-count-all', total);
        updateElement('filter-count-active', active);
        updateElement('filter-count-completed', completed);
        updateElement('filter-count-urgent', urgent);
    }

    // Helper methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCategoryIcon(category) {
        const icons = {
            'Arbeit': 'briefcase',
            'Privat': 'home',
            'Einkaufen': 'shopping-cart',
            'Gesundheit': 'heart',
            'Sport': 'activity',
            'Allgemein': 'circle'
        };
        return icons[category] || 'circle';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Heute';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Morgen';
        } else {
            return date.toLocaleDateString('de-DE', {
                day: 'numeric',
                month: 'short'
            });
        }
    }
}

// Initialize Premium Todo List
let premiumTodoList;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        premiumTodoList = new PremiumTodoList();
    });
} else {
    premiumTodoList = new PremiumTodoList();
}

// Render when navigating to todo view
document.addEventListener('DOMContentLoaded', () => {
    // Watch for navigation to todo view
    const observer = new MutationObserver(() => {
        const todoView = document.getElementById('view-todo') || document.querySelector('[data-page="todo"]');
        if (todoView && todoView.classList.contains('active')) {
            if (premiumTodoList) {
                premiumTodoList.renderTodoView();
            }
        }
    });

    // Observe all page views
    const views = document.querySelectorAll('.page-view, [data-page]');
    views.forEach(view => {
        observer.observe(view, {
            attributes: true,
            attributeFilter: ['class']
        });
    });
});

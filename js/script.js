// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoTextInput = document.getElementById('todo-text');
const todoDateInput = document.getElementById('todo-date');
const todoCategorySelect = document.getElementById('todo-category');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const totalTasksEl = document.getElementById('total-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const tasksCountEl = document.getElementById('tasks-count');
const deleteCompletedBtn = document.getElementById('delete-completed-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const statusFilter = document.getElementById('status-filter');
const categoryFilter = document.getElementById('category-filter');
const dateFilter = document.getElementById('date-filter');
const confirmModal = document.getElementById('confirm-modal');
const modalMessage = document.getElementById('modal-message');
const modalCancelBtn = document.getElementById('modal-cancel');
const modalConfirmBtn = document.getElementById('modal-confirm');

// Error message elements
const textError = document.getElementById('text-error');
const dateError = document.getElementById('date-error');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = {
    status: 'all',
    category: 'all',
    date: 'all'
};
let deleteAction = {
    type: null, // 'single', 'completed', 'all'
    todoId: null
};

// Initialize the app
function init() {
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    todoDateInput.min = today;
    
    // Load todos from localStorage
    loadTodos();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update stats
    updateStats();
}

// Load todos from localStorage
function loadTodos() {
    // If no todos in localStorage, add some sample todos
    if (todos.length === 0) {
        const sampleTodos = [
            {
                id: 1,
                text: 'Complete SEFC assignment',
                date: getFormattedDate(new Date()),
                category: 'work',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                text: 'Buy groceries',
                date: getFormattedDate(new Date(Date.now() + 86400000)), // Tomorrow
                category: 'shopping',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                text: 'Morning workout',
                date: getFormattedDate(new Date()),
                category: 'health',
                completed: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        todos = sampleTodos;
        saveTodos();
    }
    
    renderTodos();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    todoForm.addEventListener('submit', handleAddTodo);
    
    // Input validation on blur
    todoTextInput.addEventListener('blur', validateText);
    todoDateInput.addEventListener('blur', validateDate);
    
    // Filter changes
    statusFilter.addEventListener('change', (e) => {
        currentFilter.status = e.target.value;
        renderTodos();
    });
    
    categoryFilter.addEventListener('change', (e) => {
        currentFilter.category = e.target.value;
        renderTodos();
    });
    
    dateFilter.addEventListener('change', (e) => {
        currentFilter.date = e.target.value;
        renderTodos();
    });
    
    // Delete buttons
    deleteCompletedBtn.addEventListener('click', () => {
        showConfirmModal('Are you sure you want to delete all completed tasks?', 'completed');
    });
    
    deleteAllBtn.addEventListener('click', () => {
        showConfirmModal('Are you sure you want to delete ALL tasks? This action cannot be undone.', 'all');
    });
    
    // Modal buttons
    modalCancelBtn.addEventListener('click', hideConfirmModal);
    modalConfirmBtn.addEventListener('click', handleConfirmDelete);
    
    // Close modal when clicking outside
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            hideConfirmModal();
        }
    });
}

// Handle form submission
function handleAddTodo(e) {
    e.preventDefault();
    
    // Validate inputs
    const isTextValid = validateText();
    const isDateValid = validateDate();
    
    if (!isTextValid || !isDateValid) {
        return;
    }
    
    // Get input values
    const text = todoTextInput.value.trim();
    const date = todoDateInput.value;
    const category = todoCategorySelect.value;
    
    // Create new todo
    const newTodo = {
        id: Date.now(), // Simple unique ID
        text,
        date: formatDateForDisplay(date),
        rawDate: date, // Store for filtering
        category,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to todos array
    todos.push(newTodo);
    
    // Save to localStorage
    saveTodos();
    
    // Clear form
    todoForm.reset();
    
    // Set min date to today again
    const today = new Date().toISOString().split('T')[0];
    todoDateInput.min = today;
    
    // Clear error messages
    clearErrors();
    
    // Update UI
    renderTodos();
    updateStats();
    
    // Show feedback
    showNotification('Task added successfully!');
}

// Validate text input
function validateText() {
    const text = todoTextInput.value.trim();
    
    if (text === '') {
        textError.textContent = 'Task description is required';
        todoTextInput.classList.add('error');
        return false;
    }
    
    if (text.length < 3) {
        textError.textContent = 'Task description must be at least 3 characters';
        todoTextInput.classList.add('error');
        return false;
    }
    
    textError.textContent = '';
    todoTextInput.classList.remove('error');
    return true;
}

// Validate date input
function validateDate() {
    const date = todoDateInput.value;
    
    if (date === '') {
        dateError.textContent = 'Due date is required';
        todoDateInput.classList.add('error');
        return false;
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        dateError.textContent = 'Due date cannot be in the past';
        todoDateInput.classList.add('error');
        return false;
    }
    
    dateError.textContent = '';
    todoDateInput.classList.remove('error');
    return true;
}

// Clear all error messages
function clearErrors() {
    textError.textContent = '';
    dateError.textContent = '';
    todoTextInput.classList.remove('error');
    todoDateInput.classList.remove('error');
}

// Format date for display (e.g., "Mon, Jan 26, 2026")
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Get formatted date for sample todos
function getFormattedDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Render todos based on current filters
function renderTodos() {
    // Filter todos
    const filteredTodos = filterTodos();
    
    // Clear the list
    todoList.innerHTML = '';
    
    // Check if there are no todos
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-clipboard-list"></i>
            <h3>No tasks found</h3>
            <p>${todos.length === 0 ? 'Add your first task using the form above' : 'Try changing your filters'}</p>
        `;
        todoList.appendChild(emptyState);
        return;
    }
    
    // Create todo items
    filteredTodos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
    
    // Update tasks count
    updateTasksCount(filteredTodos.length);
}

// Filter todos based on current filters
function filterTodos() {
    return todos.filter(todo => {
        // Status filter
        if (currentFilter.status !== 'all') {
            if (currentFilter.status === 'completed' && !todo.completed) return false;
            if (currentFilter.status === 'pending' && todo.completed) return false;
        }
        
        // Category filter
        if (currentFilter.category !== 'all' && todo.category !== currentFilter.category) {
            return false;
        }
        
        // Date filter
        if (currentFilter.date !== 'all') {
            const todoDate = new Date(todo.rawDate || todo.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const endOfWeek = new Date(today);
            endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
            
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            switch (currentFilter.date) {
                case 'today':
                    if (todoDate.getTime() !== today.getTime()) return false;
                    break;
                case 'tomorrow':
                    if (todoDate.getTime() !== tomorrow.getTime()) return false;
                    break;
                case 'week':
                    if (todoDate < today || todoDate > endOfWeek) return false;
                    break;
                case 'month':
                    if (todoDate < today || todoDate > endOfMonth) return false;
                    break;
                case 'overdue':
                    if (todoDate >= today || todo.completed) return false;
                    break;
            }
        }
        
        return true;
    });
}

// Create a todo element
function createTodoElement(todo) {
    const todoItem = document.createElement('div');
    todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    // Check if overdue
    const todoDate = new Date(todo.rawDate || todo.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (todoDate < today && !todo.completed) {
        todoItem.classList.add('overdue');
    }
    
    todoItem.innerHTML = `
        <div class="todo-content">
            <div class="todo-text">${todo.text}</div>
            <div class="todo-details">
                <span class="todo-date ${todoDate < today && !todo.completed ? 'overdue' : ''}">
                    <i class="fas fa-calendar-alt"></i> ${todo.date}
                    ${todoDate < today && !todo.completed ? ' (Overdue)' : ''}
                </span>
                <span class="todo-category ${todo.category}">
                    <i class="fas fa-tag"></i> ${capitalizeFirstLetter(todo.category)}
                </span>
            </div>
        </div>
        <div class="todo-actions">
            <button class="toggle-btn" data-id="${todo.id}">
                <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i>
                ${todo.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="delete-btn" data-id="${todo.id}">
                <i class="fas fa-trash-alt"></i> Delete
            </button>
        </div>
    `;
    
    // Add event listeners to buttons
    const toggleBtn = todoItem.querySelector('.toggle-btn');
    const deleteBtn = todoItem.querySelector('.delete-btn');
    
    toggleBtn.addEventListener('click', () => toggleTodoStatus(todo.id));
    deleteBtn.addEventListener('click', () => showConfirmModal('Are you sure you want to delete this task?', 'single', todo.id));
    
    return todoItem;
}

// Toggle todo status (complete/incomplete)
function toggleTodoStatus(id) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        saveTodos();
        renderTodos();
        updateStats();
        
        // Show feedback
        const status = todos[todoIndex].completed ? 'completed' : 'marked as pending';
        showNotification(`Task ${status}`);
    }
}

// Show confirmation modal for delete actions
function showConfirmModal(message, type, todoId = null) {
    modalMessage.textContent = message;
    deleteAction.type = type;
    deleteAction.todoId = todoId;
    confirmModal.style.display = 'flex';
}

// Hide confirmation modal
function hideConfirmModal() {
    confirmModal.style.display = 'none';
    deleteAction.type = null;
    deleteAction.todoId = null;
}

// Handle confirmation of delete action
function handleConfirmDelete() {
    switch (deleteAction.type) {
        case 'single':
            deleteTodo(deleteAction.todoId);
            break;
        case 'completed':
            deleteCompletedTodos();
            break;
        case 'all':
            deleteAllTodos();
            break;
    }
    
    hideConfirmModal();
}

// Delete a single todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
    showNotification('Task deleted');
}

// Delete all completed todos
function deleteCompletedTodos() {
    const initialLength = todos.length;
    todos = todos.filter(todo => !todo.completed);
    
    if (todos.length < initialLength) {
        saveTodos();
        renderTodos();
        updateStats();
        showNotification('Completed tasks deleted');
    } else {
        showNotification('No completed tasks to delete');
    }
}

// Delete all todos
function deleteAllTodos() {
    todos = [];
    saveTodos();
    renderTodos();
    updateStats();
    showNotification('All tasks deleted');
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    
    // Update tasks count text
    updateTasksCount(total);
}

// Update tasks count text
function updateTasksCount(count) {
    const filteredCount = filterTodos().length;
    
    if (filteredCount === 0) {
        tasksCountEl.textContent = `No tasks match your filters`;
    } else if (filteredCount === todos.length) {
        tasksCountEl.textContent = `You have ${totalTasksEl.textContent} task${totalTasksEl.textContent === '1' ? '' : 's'}`;
    } else {
        tasksCountEl.textContent = `Showing ${filteredCount} of ${totalTasksEl.textContent} task${totalTasksEl.textContent === '1' ? '' : 's'}`;
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4a6fa5;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        font-weight: 500;
        transform: translateX(150%);
        transition: transform 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
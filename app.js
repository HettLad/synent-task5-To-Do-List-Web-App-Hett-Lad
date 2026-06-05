/* ==========================================================================
   DoDesk JavaScript - Modular Application Controller & Sound Synthesis
   ========================================================================== */

// --- Application State ---
let tasks = [];
let categories = [];
let settings = {
  theme: 'dark',
  soundOn: true
};
let fileHandle = null; // Stores file handle for direct JSON file syncing

// Filter and View State
let currentFilter = 'all'; // 'all', 'today', 'upcoming', 'completed', 'overdue', or categoryId (string)
let currentSearch = '';
let currentSort = 'due-asc'; // 'due-asc', 'due-desc', 'priority-desc', 'priority-asc', 'created-desc', 'created-asc'

// Predefined Palette for Custom Categories
const COLOR_PALETTE = [
  '#4f46e5', // Indigo
  '#9333ea', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#0ea5e9', // Sky Blue
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#a855f7', // Violet
  '#64748b', // Slate
  '#e11d48'  // Rose
];

let selectedCategoryColor = COLOR_PALETTE[0];

// --- Default Seed Data ---
const DEFAULT_CATEGORIES = [
  { id: 'cat-work', name: 'Work', color: '#4f46e5', isCustom: false },
  { id: 'cat-personal', name: 'Personal', color: '#9333ea', isCustom: false },
  { id: 'cat-shopping', name: 'Shopping', color: '#f59e0b', isCustom: false },
  { id: 'cat-health', name: 'Health', color: '#10b981', isCustom: false }
];

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Welcome to DoDesk! 🌟',
    description: 'This is a premium glassmorphic task manager. Explore priority tags, custom categories, due date alerts, and search.',
    categoryId: 'cat-personal',
    priority: 'medium',
    dueDate: getRelativeDateString(0),
    completed: false,
    notified: true,
    createdAt: Date.now() - 100000
  },
  {
    id: 'task-2',
    title: 'Complete a task to hear satisfaction',
    description: 'Check the checkbox next to this task. Make sure your volume is enabled to hear the procedural synthesizer chime!',
    categoryId: 'cat-work',
    priority: 'high',
    dueDate: getRelativeDateString(0),
    completed: false,
    notified: true,
    createdAt: Date.now() - 50000
  },
  {
    id: 'task-3',
    title: 'Design a customized workflow',
    description: 'Click the "+" icon next to Categories in the sidebar to add a new category with a custom color style.',
    categoryId: 'cat-work',
    priority: 'low',
    dueDate: getRelativeDateString(2),
    completed: false,
    notified: false,
    createdAt: Date.now()
  }
];

// Helper to get offset dates in local datetime-local format
function getRelativeDateString(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(9, 0, 0, 0); // default to 9:00 AM
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// --- Procedural Web Audio API Synthesis ---
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playCompleteSound() {
  if (!settings.soundOn) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    
    // Primary Tone (Chime)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5 slide
    
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    // Harmonic Tone (Slightly delayed sparkly chime)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.08); // C6
    
    gain2.gain.setValueAtTime(0.05, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.warn('Audio synthesis failed to initialize:', err);
  }
}

function playDeleteSound() {
  if (!settings.soundOn) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.linearRampToValueAtTime(130.81, now + 0.18); // slide down
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.warn('Audio synthesis failed:', err);
  }
}

function playToastSound() {
  if (!settings.soundOn) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.setValueAtTime(554.37, now + 0.06); // C#5
    
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.warn('Audio synthesis failed:', err);
  }
}

// Procedural alarm sound synthesis (Beep Beep Beep - pulses for 3 seconds, louder)
function playAlarmSound() {
  if (!settings.soundOn) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    
    const beepCount = 7;
    for (let i = 0; i < beepCount; i++) {
      const delay = i * 0.45; // 7 pulses * 0.45s spacing = ~3.15s total alarm duration
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      // Alternating E5 (660Hz) and G5 (784Hz) siren tones to grab attention
      const freq = i % 2 === 0 ? 660 : 784;
      osc.frequency.setValueAtTime(freq, now + delay);
      
      // Louder alert gain (0.28 peak)
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.28, now + delay + 0.03);
      gain.gain.setValueAtTime(0.28, now + delay + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.42);
    }
  } catch (err) {
    console.warn('Audio alarm synthesis failed:', err);
  }
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupUI();
  setupEventListeners();
  renderAll();
  
  // Active reminders loop checking every 5 seconds
  setInterval(checkReminders, 5000);
});

// --- Local Storage Operations ---
function loadData() {
  // Load settings
  const localSettings = localStorage.getItem('dodesk_settings');
  if (localSettings) {
    settings = JSON.parse(localSettings);
  }
  applyTheme(settings.theme);
  updateSoundButtonUI();

  // Load categories
  const localCats = localStorage.getItem('dodesk_categories');
  if (localCats) {
    categories = JSON.parse(localCats);
  } else {
    categories = [...DEFAULT_CATEGORIES];
    localStorage.setItem('dodesk_categories', JSON.stringify(categories));
  }

  // Load tasks
  const localTasks = localStorage.getItem('dodesk_tasks');
  if (localTasks) {
    tasks = JSON.parse(localTasks);
  } else {
    tasks = [...DEFAULT_TASKS];
    localStorage.setItem('dodesk_tasks', JSON.stringify(tasks));
  }
}

function saveData() {
  localStorage.setItem('dodesk_tasks', JSON.stringify(tasks));
  localStorage.setItem('dodesk_categories', JSON.stringify(categories));
  localStorage.setItem('dodesk_settings', JSON.stringify(settings));
  
  // Save to synced file if linked
  if (fileHandle) {
    saveToLinkedFile();
  }
}

// Write tasks directly to the linked JSON file
async function saveToLinkedFile() {
  if (!fileHandle) return;
  try {
    const writable = await fileHandle.createWritable();
    const dataStr = JSON.stringify({ tasks, categories, settings }, null, 2);
    await writable.write(dataStr);
    await writable.close();
  } catch (err) {
    console.error('Failed to write to linked file:', err);
    // Break the link on failure
    fileHandle = null;
    const statusPill = document.getElementById('db-status');
    statusPill.textContent = 'Local Auto';
    statusPill.classList.remove('synced');
    showToast('File sync connection lost', 'warning');
  }
}

// Selects and registers a local JSON file for live syncing
async function linkLocalFile() {
  try {
    if (!window.showOpenFilePicker) {
      showToast('Browser does not support File System API. Use Import/Export.', 'warning');
      return;
    }

    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] }
      }]
    });

    fileHandle = handle;
    const file = await fileHandle.getFile();
    const text = await file.text();

    let loadData = false;
    if (text.trim().length > 0) {
      loadData = confirm('File contains data. Do you want to LOAD data from the file? (Click Cancel to OVERWRITE it with your current task list)');
    }

    if (loadData) {
      const parsedData = JSON.parse(text);
      if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
        tasks = parsedData.tasks;
        if (parsedData.categories && Array.isArray(parsedData.categories)) {
          categories = parsedData.categories;
        }
        if (parsedData.settings) {
          settings = { ...settings, ...parsedData.settings };
          applyTheme(settings.theme);
          updateSoundButtonUI();
        }
        localStorage.setItem('dodesk_tasks', JSON.stringify(tasks));
        localStorage.setItem('dodesk_categories', JSON.stringify(categories));
        localStorage.setItem('dodesk_settings', JSON.stringify(settings));
        renderAll();
        showToast('JSON file synced and loaded!', 'success');
      } else {
        showToast('Invalid file structure. Overwriting file with current list.', 'warning');
        await saveToLinkedFile();
      }
    } else {
      await saveToLinkedFile();
      showToast('File linked! Syncing current list to it.', 'success');
    }

    const statusPill = document.getElementById('db-status');
    statusPill.textContent = 'Linked';
    statusPill.classList.add('synced');
  } catch (err) {
    if (err.name !== 'AbortError') {
      showToast('Sync failed or browser restricted', 'warning');
      console.warn(err);
    }
  }
}

// --- UI Binding & Configurations ---
function setupUI() {
  // Fill color picker palette in Modal
  const pickerContainer = document.getElementById('color-picker-container');
  pickerContainer.innerHTML = '';
  COLOR_PALETTE.forEach((color, idx) => {
    const colOpt = document.createElement('div');
    colOpt.classList.add('color-option');
    colOpt.style.backgroundColor = color;
    if (idx === 0) colOpt.classList.add('selected');
    
    colOpt.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
      colOpt.classList.add('selected');
      selectedCategoryColor = color;
    });
    
    pickerContainer.appendChild(colOpt);
  });

  // Welcome Date header text
  const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  document.getElementById('date-text').textContent = new Date().toLocaleDateString('en-US', dateOptions);

  // Time-based greeting
  const hours = new Date().getHours();
  let greeting = 'Hello, Creator';
  if (hours < 12) greeting = 'Good morning, Creator 🌅';
  else if (hours < 18) greeting = 'Good afternoon, Creator ☀️';
  else greeting = 'Good evening, Creator 🌙';
  document.getElementById('greeting-text').textContent = greeting;

  // Set default due date in form to next hour
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1);
  nextHour.setMinutes(0);
  const pad = (n) => String(n).padStart(2, '0');
  const localDateTime = `${nextHour.getFullYear()}-${pad(nextHour.getMonth() + 1)}-${pad(nextHour.getDate())}T${pad(nextHour.getHours())}:${pad(nextHour.getMinutes())}`;
  document.getElementById('task-date-input').value = localDateTime;
}

// --- Dynamic Renders ---
function renderAll() {
  renderCategories();
  renderTasks();
  updateStatistics();
  lucide.createIcons(); // Hydrate Lucide icons
}

function renderCategories() {
  // Render sidebar category navigation list
  const listEl = document.getElementById('categories-list');
  listEl.innerHTML = '';

  categories.forEach(cat => {
    const activeClass = (currentFilter === cat.id) ? 'active' : '';
    
    const li = document.createElement('li');
    li.classList.add('category-item');
    if (currentFilter === cat.id) li.classList.add('active');
    li.style.setProperty('--cat-color', cat.color);
    li.setAttribute('data-id', cat.id);

    li.innerHTML = `
      <div class="category-item-left">
        <span class="category-dot" style="background-color: ${cat.color}"></span>
        <span>${cat.name}</span>
      </div>
      <div class="category-item-right">
        ${cat.isCustom ? `
          <button class="btn-icon-sm delete-cat-btn" data-id="${cat.id}" title="Delete Category">
            <i data-lucide="trash-2"></i>
          </button>
        ` : ''}
      </div>
    `;

    // Click filter list item
    li.addEventListener('click', (e) => {
      if (e.target.closest('.delete-cat-btn')) return; // handled separately
      setFilter(cat.id);
    });

    listEl.appendChild(li);
  });

  // Render option categories in task-creation selects (main form & edit modal)
  const taskSelect = document.getElementById('task-category-select');
  const editSelect = document.getElementById('edit-task-category');
  
  const optionsHTML = categories.map(cat => 
    `<option value="${cat.id}">${cat.name}</option>`
  ).join('');

  taskSelect.innerHTML = optionsHTML;
  editSelect.innerHTML = optionsHTML;
}

function renderTasks() {
  const container = document.getElementById('tasks-container');
  const emptyState = document.getElementById('empty-state');
  
  // Clear dynamic elements, keep empty state if needed
  const taskCards = container.querySelectorAll('.task-card');
  taskCards.forEach(card => card.remove());

  // Filter Tasks
  let filtered = tasks.filter(task => {
    // 1. Search Query Filter
    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Main Tab/Category Filter
    const now = new Date();
    const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowTime = now.getTime();
    
    if (currentFilter === 'all') {
      return true;
    } else if (currentFilter === 'today') {
      return task.dueDate && task.dueDate.split('T')[0] === todayLocalStr;
    } else if (currentFilter === 'upcoming') {
      return task.dueDate && new Date(task.dueDate).getTime() > nowTime;
    } else if (currentFilter === 'completed') {
      return task.completed === true;
    } else if (currentFilter === 'overdue') {
      return !task.completed && task.dueDate && new Date(task.dueDate).getTime() < nowTime;
    } else {
      // It is a specific Category ID
      return task.categoryId === currentFilter;
    }
  });

  // Sort Tasks
  filtered.sort((a, b) => {
    if (currentSort === 'due-asc') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    } else if (currentSort === 'due-desc') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return b.dueDate.localeCompare(a.dueDate);
    } else if (currentSort === 'priority-desc') {
      const weights = { high: 3, medium: 2, low: 1 };
      return weights[b.priority] - weights[a.priority];
    } else if (currentSort === 'priority-asc') {
      const weights = { high: 3, medium: 2, low: 1 };
      return weights[a.priority] - weights[b.priority];
    } else if (currentSort === 'created-desc') {
      return b.createdAt - a.createdAt;
    } else if (currentSort === 'created-asc') {
      return a.createdAt - b.createdAt;
    }
    return 0;
  });

  // Empty state handling
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    document.getElementById('current-filter-count').textContent = '0 tasks';
    return;
  } else {
    emptyState.classList.add('hidden');
    document.getElementById('current-filter-count').textContent = `${filtered.length} task${filtered.length > 1 ? 's' : ''}`;
  }

  // Create Task DOM Cards
  filtered.forEach(task => {
    const cat = categories.find(c => c.id === task.categoryId) || { name: 'None', color: '#6b7280' };
    const todayStr = new Date().toISOString().split('T')[0];
    
    const card = document.createElement('div');
    card.classList.add('task-card', 'glass');
    if (task.completed) card.classList.add('completed');
    card.style.setProperty('--priority-color', getPriorityColor(task.priority));
    card.setAttribute('data-id', task.id);

    // Calculate dynamic due date badge text & class
    let dateBadgeHTML = '';
    if (task.dueDate) {
      let dateClass = 'date-tag';
      
      const dueTimestamp = new Date(task.dueDate).getTime();
      const nowTimestamp = Date.now();
      
      const timeOptions = { hour: 'numeric', minute: '2-digit' };
      const dateOptions = { month: 'short', day: 'numeric' };
      const formattedDateTime = `${new Date(task.dueDate).toLocaleDateString('en-US', dateOptions)}, ${new Date(task.dueDate).toLocaleTimeString('en-US', timeOptions)}`;
      let dateLabel = formattedDateTime;
      
      if (!task.completed) {
        if (dueTimestamp < nowTimestamp) {
          dateClass += ' overdue';
          
          // Calculate granularity of overdue time
          const diffMs = nowTimestamp - dueTimestamp;
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHrs < 1) {
            const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
            dateLabel = `Overdue (${diffMins}m ago)`;
          } else if (diffHrs < 24) {
            dateLabel = `Overdue (${diffHrs}h ago)`;
          } else {
            const diffDays = Math.floor(diffHrs / 24);
            dateLabel = `Overdue (${diffDays}d ago)`;
          }
        } else {
          // Future due date label
          const diffMs = dueTimestamp - nowTimestamp;
          const diffMins = Math.floor(diffMs / (1000 * 60));
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          
          const dueDayLocalStr = task.dueDate.split('T')[0];
          const nowLocalStr = new Date().toISOString().split('T')[0];
          
          if (diffMins < 60) {
            dateClass += ' due-today';
            dateLabel = `Due in ${diffMins}m`;
          } else if (dueDayLocalStr === nowLocalStr) {
            dateClass += ' due-today';
            dateLabel = `Today at ${new Date(task.dueDate).toLocaleTimeString('en-US', timeOptions)}`;
          } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowLocalStr = tomorrow.toISOString().split('T')[0];
            
            if (dueDayLocalStr === tomorrowLocalStr) {
              dateLabel = `Tomorrow at ${new Date(task.dueDate).toLocaleTimeString('en-US', timeOptions)}`;
            } else {
              dateLabel = formattedDateTime;
            }
          }
        }
      } else {
        dateLabel = `Done (${formattedDateTime})`;
      }

      dateBadgeHTML = `
        <span class="meta-tag ${dateClass}">
          <i data-lucide="calendar"></i>
          <span>${dateLabel}</span>
        </span>
      `;
    }

    card.innerHTML = `
      <div class="checkbox-wrapper">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="custom-checkbox">
          <i data-lucide="check"></i>
        </div>
      </div>
      <div class="task-content-block">
        <div class="task-title-row">
          <span class="task-title">${escapeHTML(task.title)}</span>
        </div>
        ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
        <div class="task-meta-row">
          <!-- Priority Tag -->
          <span class="meta-tag priority-tag-${task.priority}">
            <i data-lucide="flag"></i>
            <span>${capitalize(task.priority)}</span>
          </span>
          <!-- Category Tag -->
          <span class="meta-tag cat-tag" style="--tag-color: ${cat.color}">
            <span class="category-dot" style="background-color: ${cat.color}"></span>
            <span>${cat.name}</span>
          </span>
          <!-- Due Date Tag -->
          ${dateBadgeHTML}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-task-action edit-task-btn" title="Edit Task">
          <i data-lucide="edit-3"></i>
        </button>
        <button class="btn-task-action delete delete-task-btn" title="Delete Task">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;

    // Attach Event Listeners
    const checkbox = card.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTaskCompleted(task.id, card));

    card.querySelector('.edit-task-btn').addEventListener('click', () => openEditTaskModal(task));
    card.querySelector('.delete-task-btn').addEventListener('click', () => deleteTask(task.id, card));

    container.appendChild(card);
  });
}

function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Counter animations
  animateCounter('stats-total', total);
  animateCounter('stats-completed', completed);
  animateCounter('stats-pending', pending);
  
  // Progress bar animation
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('progress-percentage').textContent = `${progressPercent}%`;

  // Update counts in sidebar filter badges
  const now = new Date();
  const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowTime = now.getTime();
  
  document.getElementById('count-all').textContent = total;
  document.getElementById('count-today').textContent = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === todayLocalStr).length;
  document.getElementById('count-upcoming').textContent = tasks.filter(t => t.dueDate && new Date(t.dueDate).getTime() > nowTime).length;
  document.getElementById('count-completed').textContent = completed;
  
  const overdueCount = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getTime() < nowTime).length;
  const overdueBadge = document.getElementById('count-overdue');
  overdueBadge.textContent = overdueCount;
  if (overdueCount > 0) {
    overdueBadge.classList.remove('hidden');
  } else {
    overdueBadge.classList.add('hidden');
  }
}

// Counter animation helper
function animateCounter(elementId, targetVal) {
  const el = document.getElementById(elementId);
  const currentVal = parseInt(el.textContent) || 0;
  if (currentVal === targetVal) return;

  const duration = 400; // ms
  const startTime = performance.now();

  function update(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quad
    const ease = progress * (2 - progress);
    const val = Math.round(currentVal + (targetVal - currentVal) * ease);
    el.textContent = val;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = targetVal;
    }
  }

  requestAnimationFrame(update);
}

// --- Task Actions ---
function addTask(e) {
  e.preventDefault();
  
  const titleInput = document.getElementById('task-title-input');
  const descInput = document.getElementById('task-desc-input');
  const catSelect = document.getElementById('task-category-select');
  const prioritySelect = document.getElementById('task-priority-select');
  const dateInput = document.getElementById('task-date-input');

  const newTask = {
    id: 'task-' + Date.now(),
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    categoryId: catSelect.value,
    priority: prioritySelect.value,
    dueDate: dateInput.value,
    completed: false,
    notified: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask); // Add to beginning
  saveData();
  renderAll();
  
  // Audio chime on creation
  playToastSound();
  
  // Toast Alert
  showToast('Task added successfully', 'success');

  // Reset Form
  titleInput.value = '';
  descInput.value = '';
  document.getElementById('add-task-form').closest('.task-form-card').classList.remove('has-content');
  
  // Keep focus out to collapse form
  titleInput.blur();
}

function toggleTaskCompleted(id, cardEl) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveData();

  if (task.completed) {
    cardEl.classList.add('completed');
    playCompleteSound();
    
    // Sparkle Confetti on Check!
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 },
        colors: [settings.theme === 'dark' ? '#818cf8' : '#4f46e5', '#34d399', '#c084fc']
      });
    }

    // Check if ALL tasks in current view/all list are completed
    const activeTasks = tasks.filter(t => !t.completed);
    if (activeTasks.length === 0 && tasks.length > 0) {
      setTimeout(() => {
        showCelebrationToast();
      }, 500);
    }
  } else {
    cardEl.classList.remove('completed');
  }

  setTimeout(() => {
    renderAll();
  }, 350); // delay to let completion animation finish nicely
}

function deleteTask(id, cardEl) {
  // Add animation class before removal
  cardEl.style.animation = 'slideOutLeft 0.3s cubic-bezier(0.4, 0, 1, 1) forwards';
  
  playDeleteSound();
  
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    renderAll();
    showToast('Task removed', 'info');
  }, 250);
}

function clearAllCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear', 'info');
    return;
  }

  if (confirm(`Are you sure you want to clear all ${completedCount} completed tasks?`)) {
    tasks = tasks.filter(t => !t.completed);
    saveData();
    renderAll();
    showToast(`Cleared ${completedCount} tasks`, 'success');
  }
}

// --- Category Actions ---
function addCategory(e) {
  e.preventDefault();
  const nameInput = document.getElementById('cat-name-input');
  const catName = nameInput.value.trim();
  
  if (!catName) return;

  // Check unique
  const exists = categories.some(c => c.name.toLowerCase() === catName.toLowerCase());
  if (exists) {
    showToast('Category already exists', 'warning');
    return;
  }

  const newCat = {
    id: 'cat-' + Date.now(),
    name: catName,
    color: selectedCategoryColor,
    isCustom: true
  };

  categories.push(newCat);
  saveData();
  renderAll();
  closeCategoryModal();
  showToast(`Category "${catName}" created`, 'success');
  
  nameInput.value = '';
}

function deleteCategory(catId) {
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;

  // Confirm delete
  const tasksInCat = tasks.filter(t => t.categoryId === catId);
  let msg = `Are you sure you want to delete the category "${cat.name}"?`;
  if (tasksInCat.length > 0) {
    msg += ` This will delete all ${tasksInCat.length} tasks belonging to this category.`;
  }

  if (confirm(msg)) {
    // Delete tasks in category
    tasks = tasks.filter(t => t.categoryId !== catId);
    // Delete category
    categories = categories.filter(c => c.id !== catId);
    
    // Reset filter if we deleted the current active one
    if (currentFilter === catId) {
      currentFilter = 'all';
    }

    saveData();
    renderAll();
    showToast(`Category "${cat.name}" deleted`, 'info');
  }
}

// --- Edit Task Actions ---
function openEditTaskModal(task) {
  document.getElementById('edit-task-id').value = task.id;
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-desc').value = task.description || '';
  document.getElementById('edit-task-category').value = task.categoryId;
  document.getElementById('edit-task-priority').value = task.priority;
  document.getElementById('edit-task-date').value = task.dueDate || '';

  const modal = document.getElementById('edit-task-modal');
  modal.classList.remove('hidden');
}

function closeEditTaskModal() {
  document.getElementById('edit-task-modal').classList.add('hidden');
}

function saveTaskChanges(e) {
  e.preventDefault();
  
  const id = document.getElementById('edit-task-id').value;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newDate = document.getElementById('edit-task-date').value;
  // If the due date/time was updated to something new, reset notified status
  if (task.dueDate !== newDate) {
    task.notified = false;
  }

  task.title = document.getElementById('edit-task-title').value.trim();
  task.description = document.getElementById('edit-task-desc').value.trim();
  task.categoryId = document.getElementById('edit-task-category').value;
  task.priority = document.getElementById('edit-task-priority').value;
  task.dueDate = newDate;

  saveData();
  closeEditTaskModal();
  renderAll();
  showToast('Task updated', 'success');
}

// --- Navigation Filters & Sorters ---
function setFilter(filterVal) {
  currentFilter = filterVal;
  
  // Sidebar active indicators
  document.querySelectorAll('.filter-item').forEach(item => {
    if (item.getAttribute('data-filter') === filterVal) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Render Title mapping
  let filterTitle = 'All Tasks';
  if (filterVal === 'today') filterTitle = 'Today\'s Agenda';
  else if (filterVal === 'upcoming') filterTitle = 'Upcoming Tasks';
  else if (filterVal === 'completed') filterTitle = 'Completed Tasks';
  else if (filterVal === 'overdue') filterTitle = 'Overdue Items';
  else if (filterVal.startsWith('cat-')) {
    const cat = categories.find(c => c.id === filterVal);
    filterTitle = cat ? cat.name : 'Category Tasks';
  }
  document.getElementById('current-filter-name').textContent = filterTitle;

  renderAll();
}

function setSort(sortVal) {
  currentSort = sortVal;
  renderTasks();
  document.getElementById('sort-menu').classList.add('hidden');
}

// --- Backup & Restore (JSON Import/Export) ---
function exportTasksToJSON() {
  const dataStr = JSON.stringify({ tasks, categories, settings }, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const tempLink = document.createElement('a');
  tempLink.href = url;
  tempLink.download = `dodesk_backup_${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  
  showToast('Backup JSON downloaded!', 'success');
}

function triggerImportFileInput() {
  document.getElementById('import-file-input').click();
}

function importTasksFromJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsedData = JSON.parse(evt.target.result);
      
      // Validation Check
      if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
        tasks = parsedData.tasks;
        if (parsedData.categories && Array.isArray(parsedData.categories)) {
          categories = parsedData.categories;
        }
        if (parsedData.settings) {
          settings = { ...settings, ...parsedData.settings };
          applyTheme(settings.theme);
          updateSoundButtonUI();
        }
        
        saveData();
        renderAll();
        showToast('Data restored successfully!', 'success');
        
        // Huge Confetti burst for restore success
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 80 });
        }
      } else {
        showToast('Invalid backup file structure', 'warning');
      }
    } catch (err) {
      showToast('Error parsing file: ' + err.message, 'warning');
    }
  };
  reader.readAsText(file);
  // Clear input
  e.target.value = '';
}

// --- Theme Actions ---
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  settings.theme = theme;
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  saveData();
}

// --- Sound Toggle ---
function toggleSound() {
  settings.soundOn = !settings.soundOn;
  saveData();
  updateSoundButtonUI();
  if (settings.soundOn) {
    playToastSound();
  }
}

function updateSoundButtonUI() {
  const btn = document.getElementById('btn-sound');
  if (settings.soundOn) {
    btn.innerHTML = '<i data-lucide="volume-2"></i>';
    btn.setAttribute('title', 'Mute Sounds');
  } else {
    btn.innerHTML = '<i data-lucide="volume-x"></i>';
    btn.setAttribute('title', 'Unmute Sounds');
  }
  lucide.createIcons();
}

// --- Modals Overlay Actions ---
function openCategoryModal() {
  document.getElementById('category-modal').classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.add('hidden');
}

// --- Toast Messaging ---
function showToast(message, type = 'info', durationMs = 3000) {
  const toastContainer = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.classList.add('toast', `toast-${type}`);
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  else if (type === 'warning') iconName = 'alert-triangle';
  
  // For long warnings, provide a manual dismiss close button
  const showCloseBtn = durationMs > 5000;
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-message">${message}</div>
    ${showCloseBtn ? `
      <button class="btn-close-modal dismiss-toast-btn" style="width: 20px; height: 20px; margin-left: 0.5rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0,0,0,0.05);" title="Dismiss">
        <i data-lucide="x" style="width: 12px; height: 12px;"></i>
      </button>
    ` : ''}
  `;
  
  toastContainer.appendChild(toast);
  lucide.createIcons(); // Hydrate toast icon
  
  if (showCloseBtn) {
    toast.querySelector('.dismiss-toast-btn').addEventListener('click', () => {
      removeToast(toast);
    });
  }
  
  // Play soft chime
  if (type !== 'success' && settings.soundOn) {
    playToastSound();
  }

  // Auto-remove timeout
  const removeTimeout = setTimeout(() => {
    removeToast(toast);
  }, durationMs);

  function removeToast(el) {
    clearTimeout(removeTimeout);
    if (el.parentNode) {
      el.classList.add('removing');
      el.addEventListener('transitionend', () => {
        el.remove();
      });
    }
  }
}

function showCelebrationToast() {
  // Launch colorful double firework confetti!
  if (typeof confetti === 'function') {
    const end = Date.now() + (1 * 1000);
    const colors = ['#818cf8', '#34d399', '#fbbf24', '#ec4899'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  showToast('All caught up! 🎉 Amazing work.', 'success');
}

// --- Global Event Listeners ---
function setupEventListeners() {
  // Theme Toggle click
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);

  // Sound Toggle click
  document.getElementById('btn-sound').addEventListener('click', toggleSound);

  // Sort dropdown trigger
  const sortBtn = document.getElementById('btn-sort');
  const sortMenu = document.getElementById('sort-menu');
  sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sortMenu.classList.toggle('hidden');
  });

  // Sort Menu clicks
  sortMenu.addEventListener('click', (e) => {
    const sortVal = e.target.getAttribute('data-sort');
    if (sortVal) setSort(sortVal);
  });

  // Close menus when clicking outside
  document.addEventListener('click', () => {
    sortMenu.classList.add('hidden');
  });

  // Navigation filtering clicks
  document.querySelectorAll('.filter-item').forEach(item => {
    item.addEventListener('click', () => {
      const filter = item.getAttribute('data-filter');
      setFilter(filter);
    });
  });

  // Category deletion clicks
  document.getElementById('categories-list').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-cat-btn');
    if (deleteBtn) {
      const catId = deleteBtn.getAttribute('data-id');
      deleteCategory(catId);
    }
  });

  // Task creation Form submits
  document.getElementById('add-task-form').addEventListener('submit', addTask);

  // Auto-expand/collapse Add Task box options on focus
  const titleInput = document.getElementById('task-title-input');
  const taskFormCard = titleInput.closest('.task-form-card');
  
  titleInput.addEventListener('focus', () => {
    taskFormCard.classList.add('has-content');
  });

  // Clear completed tasks button
  document.getElementById('btn-clear-all').addEventListener('click', clearAllCompleted);

  // Category Modal actions
  document.getElementById('btn-add-category').addEventListener('click', openCategoryModal);
  document.getElementById('btn-close-cat-modal').addEventListener('click', closeCategoryModal);
  document.getElementById('btn-cancel-cat-modal').addEventListener('click', closeCategoryModal);
  document.getElementById('category-form').addEventListener('submit', addCategory);

  // Edit Task Modal actions
  document.getElementById('btn-close-edit-modal').addEventListener('click', closeEditTaskModal);
  document.getElementById('btn-cancel-edit-modal').addEventListener('click', closeEditTaskModal);
  document.getElementById('edit-task-form').addEventListener('submit', saveTaskChanges);

  // Search filter
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderTasks();
  });

  // Backup & Restore
  document.getElementById('btn-export').addEventListener('click', exportTasksToJSON);
  document.getElementById('btn-export-db').addEventListener('click', exportTasksToJSON);
  document.getElementById('btn-import').addEventListener('click', triggerImportFileInput);
  document.getElementById('btn-import-db').addEventListener('click', triggerImportFileInput);
  document.getElementById('import-file-input').addEventListener('change', importTasksFromJSON);
  document.getElementById('btn-link-file').addEventListener('click', linkLocalFile);

  // Mobile navigation sidebar toggle
  document.querySelector('.top-nav').addEventListener('click', (e) => {
    // If screen is mobile size, checking if clicked left side (menu icon trigger)
    if (window.innerWidth <= 900) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      // Lucide menu is on far left (roughly first 50px)
      if (clickX < 55) {
        document.querySelector('.sidebar').classList.add('mobile-open');
      }
    }
  });

  // Close mobile sidebar clicking outside sidebar or on items
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      const sidebar = document.querySelector('.sidebar');
      const topNav = document.querySelector('.top-nav');
      
      if (!sidebar.contains(e.target) && !topNav.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
      }
    }
  });
}

// --- Utility Helpers ---
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return 'var(--accent-danger)';
    case 'medium': return 'var(--accent-warning)';
    case 'low':
    default:
      return 'var(--accent-primary)';
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check for tasks that have reached their due date and time, and trigger alarms
function checkReminders() {
  const nowTime = Date.now();
  let updated = false;

  tasks.forEach(task => {
    // If the task has a due date/time, is not completed, and has not notified yet
    if (task.dueDate && !task.completed && !task.notified) {
      const taskTime = new Date(task.dueDate).getTime();
      if (nowTime >= taskTime) {
        task.notified = true;
        updated = true;
        
        // Trigger alert beep alarm
        playAlarmSound();
        
        // Show persistent toast warning that lasts for 15 seconds (15000ms) with close button
        showToast(`⏰ REMINDER: "${task.title}" is due now!`, 'warning', 15000);
      }
    }
  });

  if (updated) {
    saveData();
    renderAll();
  }
}

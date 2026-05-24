// Main Application Logic
// Integrates all modules and handles UI interactions

class App {
  constructor() {
    this.timer = null;
    this.pet = null;
    this.reminders = null;
    this.init();
  }

  init() {
    // Initialize modules
    this.timer = new Timer(
      this.onTimerTick.bind(this),
      this.onTimerComplete.bind(this),
      this.onTimerModeChange.bind(this)
    );

    this.pet = new Pet(this.onPetPositionChange.bind(this));
    this.reminders = new Reminders(this.onRemindersChange.bind(this));

    // Request notification permission
    this.timer.requestNotificationPermission();

    // Preload pet images
    this.pet.preloadImages();

    // Initialize UI
    this.initUI();

    // Set initial pet mode based on timer
    this.pet.setMode(this.timer.currentMode);

    // Register service worker
    this.registerServiceWorker();
  }

  initUI() {
    // Timer display
    this.timerDisplay = document.getElementById('timer-display');
    this.modeDisplay = document.getElementById('mode-display');
    this.cycleDisplay = document.getElementById('cycle-display');

    // Timer controls
    this.startBtn = document.getElementById('start-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.settingsBtn = document.getElementById('settings-btn');

    // Settings dropdown
    this.settingsDropdown = document.getElementById('settings-dropdown');

    // Pet display
    this.petImage = document.getElementById('pet-image');

    // Reminders
    this.remindersList = document.getElementById('reminders-list');
    this.addReminderBtn = document.getElementById('add-reminder-btn');

    // Event listeners
    this.startBtn.addEventListener('click', () => this.timer.start());
    this.pauseBtn.addEventListener('click', () => this.timer.pause());
    this.resetBtn.addEventListener('click', () => this.timer.reset());
    this.settingsBtn.addEventListener('click', () => this.toggleSettings());
    this.addReminderBtn.addEventListener('click', () => this.addReminder());

    // Settings dropdown event listeners
    this.initSettingsListeners();

    // Initial UI update
    this.updateTimerDisplay();
    this.updateModeDisplay();
    this.updateCycleDisplay();
    this.updatePetDisplay();
    this.renderReminders();
  }

  initSettingsListeners() {
    // Custom duration inputs
    const customFocus = document.getElementById('custom-focus');
    const customBreak = document.getElementById('custom-break');
    const applyCustom = document.getElementById('apply-custom');

    applyCustom.addEventListener('click', () => {
      const focus = parseInt(customFocus.value);
      const breakTime = parseInt(customBreak.value);
      if (focus > 0 && breakTime > 0) {
        this.timer.setCustomDurations(focus, breakTime);
        this.updateTimerDisplay();
      }
    });

    // Cycle counter
    const cycleInput = document.getElementById('cycle-count');
    const applyCycles = document.getElementById('apply-cycles');

    applyCycles.addEventListener('click', () => {
      const cycles = parseInt(cycleInput.value);
      if (cycles > 0) {
        this.timer.setTotalCycles(cycles);
        this.updateCycleDisplay();
      }
    });

    // Favorites
    this.renderFavorites();

    // Add favorite
    const addFavoriteBtn = document.getElementById('add-favorite');
    addFavoriteBtn.addEventListener('click', () => this.addFavorite());

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.settingsDropdown.contains(e.target) && !this.settingsBtn.contains(e.target)) {
        this.settingsDropdown.classList.add('hidden');
      }
    });
  }

  toggleSettings() {
    this.settingsDropdown.classList.toggle('hidden');
  }

  renderFavorites() {
    const favoritesContainer = document.getElementById('favorites-list');
    favoritesContainer.innerHTML = '';

    this.timer.favorites.forEach((favorite, index) => {
      const div = document.createElement('div');
      div.className = 'favorite-item';
      div.innerHTML = `
        <span>${favorite.name} (${favorite.focus}/${favorite.break})</span>
        <button class="apply-favorite" data-index="${index}">Apply</button>
        <button class="remove-favorite" data-index="${index}">✕</button>
      `;
      favoritesContainer.appendChild(div);
    });

    // Add event listeners
    favoritesContainer.querySelectorAll('.apply-favorite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.timer.applyFavorite(index);
        this.updateTimerDisplay();
      });
    });

    favoritesContainer.querySelectorAll('.remove-favorite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.timer.removeFavorite(index);
        this.renderFavorites();
      });
    });
  }

  addFavorite() {
    const name = document.getElementById('favorite-name').value;
    const focus = parseInt(document.getElementById('favorite-focus').value);
    const breakTime = parseInt(document.getElementById('favorite-break').value);

    if (name && focus > 0 && breakTime > 0) {
      this.timer.addFavorite(name, focus, breakTime);
      this.renderFavorites();

      // Clear inputs
      document.getElementById('favorite-name').value = '';
      document.getElementById('favorite-focus').value = '';
      document.getElementById('favorite-break').value = '';
    }
  }

  onTimerTick(remainingTime) {
    this.updateTimerDisplay();
  }

  onTimerComplete() {
    const mode = this.timer.currentMode === 'focus' ? 'Focus' : 'Break';
    this.timer.sendNotification(`${mode} Complete!`, 'Time to switch modes.');
  }

  onTimerModeChange(mode) {
    this.updateModeDisplay();
    this.pet.setMode(mode);
  }

  onPetPositionChange(position) {
    this.updatePetDisplay();
  }

  onRemindersChange(reminders) {
    this.renderReminders();
  }

  updateTimerDisplay() {
    this.timerDisplay.textContent = this.timer.formatTime(this.timer.remainingTime);
  }

  updateModeDisplay() {
    this.modeDisplay.textContent = this.timer.currentMode === 'focus' ? 'Focus' : 'Break';
    this.modeDisplay.className = this.timer.currentMode === 'focus' ? 'mode-focus' : 'mode-break';
  }

  updateCycleDisplay() {
    this.cycleDisplay.textContent = `Cycle: ${this.timer.currentCycle}/${this.timer.totalCycles}`;
  }

  updatePetDisplay() {
    const position = this.pet.currentPosition;
    this.petImage.src = this.pet.getImagePath(position);
  }

  renderReminders() {
    this.remindersList.innerHTML = '';

    if (this.reminders.all.length === 0) {
      this.remindersList.innerHTML = '<p class="empty-reminders">No reminders yet</p>';
      return;
    }

    this.reminders.all.forEach(reminder => {
      const div = document.createElement('div');
      div.className = 'reminder-item';
      div.innerHTML = `
        <span class="reminder-text">${reminder.text}</span>
        <div class="reminder-actions">
          <button class="edit-reminder" data-id="${reminder.id}">Edit</button>
          <button class="delete-reminder" data-id="${reminder.id}">✕</button>
        </div>
      `;
      this.remindersList.appendChild(div);
    });

    // Add event listeners
    this.remindersList.querySelectorAll('.edit-reminder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.editReminder(id);
      });
    });

    this.remindersList.querySelectorAll('.delete-reminder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.reminders.delete(id);
      });
    });
  }

  addReminder() {
    const text = prompt('Enter reminder:');
    if (text) {
      this.reminders.add(text);
    }
  }

  editReminder(id) {
    const reminder = this.reminders.get(id);
    if (reminder) {
      const newText = prompt('Edit reminder:', reminder.text);
      if (newText) {
        this.reminders.update(id, newText);
      }
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(registration => console.log('Service Worker registered'))
        .catch(error => console.log('Service Worker registration failed:', error));
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing app...');
    new App();
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
});

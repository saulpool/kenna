// Timer Module
// Handles pomodoro timer logic, presets, favorites, and cycles

class Timer {
  constructor(onTick, onComplete, onModeChange) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.onModeChange = onModeChange;
    this.intervalId = null;
    this.data = this.loadData();
  }

  loadData() {
    const timerData = getSection('timer');
    return timerData || {
      focusDuration: 25,
      breakDuration: 5,
      currentMode: 'focus',
      remainingTime: 1500,
      isRunning: false,
      currentCycle: 1,
      totalCycles: 4,
      favorites: [
        { name: '25/5', focus: 25, break: 5 },
        { name: '50/10', focus: 50, break: 10 },
        { name: '30/10', focus: 30, break: 10 }
      ]
    };
  }

  saveData() {
    saveSection('timer', this.data);
  }

  get remainingTime() {
    return this.data.remainingTime;
  }

  get isRunning() {
    return this.data.isRunning;
  }

  get currentMode() {
    return this.data.currentMode;
  }

  get currentCycle() {
    return this.data.currentCycle;
  }

  get totalCycles() {
    return this.data.totalCycles;
  }

  get focusDuration() {
    return this.data.focusDuration;
  }

  get breakDuration() {
    return this.data.breakDuration;
  }

  get favorites() {
    return this.data.favorites;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  start() {
    if (this.data.isRunning) return;
    
    this.data.isRunning = true;
    this.saveData();
    
    this.intervalId = setInterval(() => {
      this.data.remainingTime--;
      
      if (this.data.remainingTime <= 0) {
        this.complete();
      } else {
        this.onTick(this.data.remainingTime);
        this.saveData();
      }
    }, 1000);
  }

  pause() {
    if (!this.data.isRunning) return;
    
    this.data.isRunning = false;
    this.saveData();
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    this.data.remainingTime = this.data.currentMode === 'focus' 
      ? this.data.focusDuration * 60 
      : this.data.breakDuration * 60;
    this.saveData();
    this.onTick(this.data.remainingTime);
  }

  complete() {
    this.pause();
    this.onComplete();
    
    // Switch mode
    if (this.data.currentMode === 'focus') {
      this.data.currentMode = 'break';
      this.data.remainingTime = this.data.breakDuration * 60;
    } else {
      this.data.currentMode = 'focus';
      this.data.currentCycle++;
      
      if (this.data.currentCycle > this.data.totalCycles) {
        this.data.currentCycle = 1;
      }
      
      this.data.remainingTime = this.data.focusDuration * 60;
    }
    
    this.saveData();
    this.onModeChange(this.data.currentMode);
    this.onTick(this.data.remainingTime);
  }

  setCustomDurations(focus, breakTime) {
    this.pause();
    this.data.focusDuration = focus;
    this.data.breakDuration = breakTime;
    
    if (this.data.currentMode === 'focus') {
      this.data.remainingTime = focus * 60;
    } else {
      this.data.remainingTime = breakTime * 60;
    }
    
    this.saveData();
    this.onTick(this.data.remainingTime);
  }

  setTotalCycles(cycles) {
    this.data.totalCycles = cycles;
    if (this.data.currentCycle > cycles) {
      this.data.currentCycle = 1;
    }
    this.saveData();
  }

  addFavorite(name, focus, breakTime) {
    if (this.data.favorites.length >= 3) {
      this.data.favorites.pop();
    }
    this.data.favorites.unshift({ name, focus, break: breakTime });
    this.saveData();
  }

  removeFavorite(index) {
    this.data.favorites.splice(index, 1);
    this.saveData();
  }

  applyFavorite(index) {
    const favorite = this.data.favorites[index];
    if (favorite) {
      this.setCustomDurations(favorite.focus, favorite.break);
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/images/Standing.png' });
    }
  }
}

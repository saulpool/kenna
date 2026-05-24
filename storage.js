// Local Storage Wrapper
// Handles data persistence for the Pomodoro Pet PWA

const STORAGE_KEY = 'pomodoroPetPWA';

// Default data structure
const DEFAULT_DATA = {
  timer: {
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
  },
  reminders: [],
  pet: {
    currentPosition: 'Sleeping',
    lastTransition: Date.now()
  }
};

// Get all data from local storage
function getData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_DATA, ...JSON.parse(stored) };
    }
    return DEFAULT_DATA;
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return DEFAULT_DATA;
  }
}

// Save all data to local storage
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return false;
  }
}

// Get specific section of data
function getSection(section) {
  const data = getData();
  return data[section] || DEFAULT_DATA[section];
}

// Save specific section of data
function saveSection(section, value) {
  const data = getData();
  data[section] = value;
  return saveData(data);
}

// Clear all data
function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing local storage:', error);
    return false;
  }
}

// Export functions to global scope for browser
window.getData = getData;
window.saveData = saveData;
window.getSection = getSection;
window.saveSection = saveSection;
window.clearData = clearData;

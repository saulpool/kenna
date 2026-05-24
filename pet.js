// Pet Module
// Handles pet animation system and position mapping

class Pet {
  constructor(onPositionChange) {
    this.onPositionChange = onPositionChange;
    this.data = this.loadData();
    this.transitionInterval = null;
    this.currentImage = null;
  }

  loadData() {
    const petData = getSection('pet');
    return petData || {
      currentPosition: 'Sleeping',
      lastTransition: Date.now()
    };
  }

  saveData() {
    saveSection('pet', this.data);
  }

  get currentPosition() {
    return this.data.currentPosition;
  }

  // Focus Mode (Inactive positions)
  get focusPositions() {
    return [
      'Sleeping',
      'Sitting',
      'Laying_Down_A',
      'Laying_Down_B',
      'Laying_Down_C',
      'Belly_Up',
      'Curled_Up'
    ];
  }

  // Rest Mode (Active positions)
  get restPositions() {
    return [
      'Standing',
      'Yawning',
      'Running_A',
      'Running_B',
      'Tail_Wagging',
      'Playing'
    ];
  }

  getImagePath(position) {
    const path = `images/${position}.png`;
    console.log('Pet image path:', path);
    return path;
  }

  setPosition(position) {
    this.data.currentPosition = position;
    this.data.lastTransition = Date.now();
    this.saveData();
    this.onPositionChange(position);
  }

  setMode(mode) {
    // Clear any existing transition interval
    if (this.transitionInterval) {
      clearInterval(this.transitionInterval);
      this.transitionInterval = null;
    }

    // Set initial position based on mode
    const positions = mode === 'focus' ? this.focusPositions : this.restPositions;
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    this.setPosition(randomPosition);

    // Start random transitions
    this.startTransitions(mode);
  }

  startTransitions(mode) {
    const positions = mode === 'focus' ? this.focusPositions : this.restPositions;
    
    // Transition every 5-15 seconds
    const transitionTime = () => Math.random() * 10000 + 5000;
    
    const scheduleNextTransition = () => {
      this.transitionInterval = setTimeout(() => {
        const randomPosition = positions[Math.floor(Math.random() * positions.length)];
        this.setPosition(randomPosition);
        scheduleNextTransition();
      }, transitionTime());
    };
    
    scheduleNextTransition();
  }

  stopTransitions() {
    if (this.transitionInterval) {
      clearTimeout(this.transitionInterval);
      this.transitionInterval = null;
    }
  }

  preloadImages() {
    const allPositions = [...this.focusPositions, ...this.restPositions];
    allPositions.forEach(position => {
      const img = new Image();
      img.src = this.getImagePath(position);
    });
  }
}

// Reminders Module
// Handles reminder CRUD operations

class Reminders {
  constructor(onChange) {
    this.onChange = onChange;
    this.data = this.loadData();
  }

  loadData() {
    const remindersData = getSection('reminders');
    return remindersData || [];
  }

  saveData() {
    saveSection('reminders', this.data);
    this.onChange(this.data);
  }

  get all() {
    return this.data;
  }

  add(text) {
    if (!text || text.trim() === '') return;
    
    const reminder = {
      id: Date.now(),
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    
    this.data.push(reminder);
    this.saveData();
  }

  update(id, newText) {
    if (!newText || newText.trim() === '') return;
    
    const reminder = this.data.find(r => r.id === id);
    if (reminder) {
      reminder.text = newText.trim();
      this.saveData();
    }
  }

  delete(id) {
    this.data = this.data.filter(r => r.id !== id);
    this.saveData();
  }

  get(id) {
    return this.data.find(r => r.id === id);
  }
}

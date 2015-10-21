import sum from 'lodash.sum';

export default class EventEmitter {
  constructor() {
    this.observers = {};
  }

  on(event, listener) {
    this.observers[event] = this.observers[event] || [];
    this.observers[event].push(listener);
  }

  off(event, listener) {
    if (!this.observers[event]) {
      return;
    }

    this.observers[event].forEach(() => {
      if (! listener) {
        delete this.observers[event];
      } else {
        var index = this.observers[event].indexOf(listener);
        if (index > -1) {
          this.observers[event].splice(index, 1);
        }
      }
    });
  }

  emit(event, ...args) {
    if (!this.observers[event]) {
      return;
    }

    this.observers[event].forEach(observer => observer(...args));
  }

  numberOfObservers() {
    return sum(this.observers, o => o.length);
  }
}
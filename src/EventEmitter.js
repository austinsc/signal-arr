import sum from 'lodash.sum';

export default class EventEmitter {
  constructor() {
    this.observers = {};
  }

  /**
   *Pushes an event to the passed in listener.
   * @param event
   * @param listener
   */
  on(event, listener) {
    this.observers[event] = this.observers[event] || [];
    this.observers[event].push(listener);
  }

  /**
   * Removes an event from a passed in listener.
   * @param event
   * @param listener
   */
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

  /**
   * Emits the passed in event to all observers.
   * @param event
   * @param args
   */
  emit(event, ...args) {
    if (!this.observers[event]) {
      return;
    }

    this.observers[event].forEach(observer => observer(...args));
  }

  /**
   * Returns the true number of current observers.
   */
  numberOfObservers() {
    return sum(this.observers, o => o.length);
  }
}
import sum from 'lodash.sum';

export default class EventEmitter {
  constructor() {
    this.observers = {};
  }

  /**
   *Pushes an event to the passed in listener.
   * @param {Object} event The event that was fired.
   * @param {Object} listener The listener that the fired event will be pushed to.
   * @function
   * @public
   * @returns {void} Method does not return a value.
   */
  on(event, listener) {
    this.observers[event] = this.observers[event] || [];
    this.observers[event].push(listener);
  }

  /**
   * Removes an event from a passed in listener.
   * @param {Object} event Event to be removed from the listener.
   * @param {Object} listener The listener the event will be removed from.
   * @function
   * @public
   * @returns {void} Method does not return a value.
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
   * @param {Object} event The event to be broadcasted to all available observers.
   * @param {Object} args A variable number of objects passed in to attatch.
   * @function
   * @public
   * @returns {void} Returns if there is no current observers for the passed in event.
   */
  emit(event, ...args) {
    if (!this.observers[event]) {
      return;
    }

    this.observers[event].forEach(observer => observer(...args));
  }

  /**
   * Returns the true number of current observers.
   * @returns {int} The current number of observers.
   * @function
   * @public
   */
  numberOfObservers() {
    return sum(this.observers, o => o.length);
  }
}
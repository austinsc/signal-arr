import {CLIENT_STATES,CONNECTION_STATES} from './Constants';

export default class ConnectingMessageBuffer {
  /**
   * Takes the client and drainCallback and creates an efficient buffer for buffering recieved messages.
   * @param client
   * @param drainCallback
   */
  constructor(client, drainCallback) {
    this.buffer = [];
    this.client = client;
    this.drainCallback = drainCallback;
  }

  /**
   * Attempts to add a passed in message to the buffer.
   * @param message
   * @returns {boolean}
   */
  tryBuffer(message) {
    if(this.client.transport === CONNECTION_STATES.connecting) {
      this.buffer.push(message);
      return true;
    }
    return false;
  }

  /**
   * Drains the current buffer and removes all messages.
   */
  drain() {
    // Ensure that the connection is connected when we drain (do not want to drain while a connection is not active)
    if(this.client.transport === CONNECTION_STATES.connected) {
      while(this.buffer.length > 0) {
        this.drainCallback(buffer.shift());
      }
    }
  }
}
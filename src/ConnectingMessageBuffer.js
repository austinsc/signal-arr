import {STATES} from './Constants';

export default class ConnectingMessageBuffer {
  constructor(client, drainCallback) {
    this.buffer = [];
    this.client = client;
    this.drainCallback = drainCallback;
  }

  tryBuffer(message) {
    if(this.client.state === STATES.connecting) {
      this.buffer.push(message);
      return true;
    }
    return false;
  }

  drain() {
    // Ensure that the connection is connected when we drain (do not want to drain while a connection is not active)
    if(this.client.state === STATES.connected) {
      while(this.buffer.length > 0) {
        this.drainCallback(buffer.shift());
      }
    }
  }

  clear() {
    this.buffer = [];
  }
}
import {CONNECTION_STATES} from './Constants';

export default class ConnectingMessageBuffer {
  /**
   * Takes the client and drainCallback and creates an efficient buffer for buffering recieved messages.
   * @param {Client} client The current instance of the user's client.
   * @param {bool} drainCallback A boolean to decide wherer to drain the buffer.
   * @constructor
   * @returns {ConnectingMessageBuffer} Creates a new ConnectingMessageBuffer.
   */
  constructor(client, drainCallback) {
    this.buffer = [];
    this.client = client;
    this.drainCallback = drainCallback;
  }

  /**
   * Attempts to add a passed in message to the buffer.
   * @param {Object} message The message to be pushed into the buffer.
   * @returns {boolean} Returns false if the client is currently not connecting.
   * @function
   * @public
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
   * @function
   * @public
   * @returns {void} Method does not return any value.
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
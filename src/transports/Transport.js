import Logdown from 'logdown';
import {expandResponse} from '../Utilities';
import {CLIENT_EVENTS, CLIENT_STATES} from '../Constants';
import takeRight from 'lodash.takeright';

export default class Transport {
  /**
   * Initializes the transport instance
   * @param name the name of the transport (must be the same value as the server's corresponding transport name)
   * @param {Connection} connection the parent connection
   */
  constructor(name, connection) {
    this.name = name;
    this._client = connection._client;
    this._connection = connection;
    this._logger = new Logdown({prefix: `${this.name}`});
    this._abortRequest = false;
    this._lastMessages = [];

  }

  /**
   * Initiates a new transport and begins the connection process.
   *  @returns {Promise} that will reject due to the method needing to be overridden.
   */

  start() {
    return new Promise((resolve, reject) => {
      reject(new Error('Not Implemented: The `start()` function on the `Transport` class must be overridden in a derived type.'));
    });
  }

  /**
   * Haults the current connection and safely disconnects.
   *  @returns {Promise} that will reject due to the method needing to be overridden.
   */
  stop() {
    return new Promise((resolve, reject) => {
      reject(new Error('Not Implemented: The `stop()` function on the `Transport` class must be overridden in a derived type.'));
    });
  }

  send() {
    return new Promise((resolve, reject) => {
      reject(new Error('Not Implemented: The `send()` function on the `Transport` class must be overridden in a derived type.'));
    });
  }

  _processMessages(compressedResponse) {
    const expandedResponse = expandResponse(compressedResponse);
    this._client.emit(CLIENT_EVENTS.onReceiving);
    this._lastMessageAt = new Date().getTime();
    this._lastMessages.push(expandedResponse);
    this._lastMessages = takeRight(this._lastMessages, 5);
    this._client.emit(CLIENT_EVENTS.onReceived, expandedResponse.messages);
  }

  set _lastMessageAt(newTimestamp) {
    if(this._supportsKeepAlive()) {
      this._keepAliveTimeoutId = setTimeout(this._reconnect, this._connection._keepAliveData.timeout);
    }
      this._latestMessageTime = newTimestamp;
  }

  get _lastMessageAt() {
    return this._latestMessageTime;
  }


  _supportsKeepAlive() {
    return this._connection._keepAliveData.activated && this._connection._transport && this._connection._transport.supportsKeepAlive;
  }


}

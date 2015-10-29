import Logdown from 'logdown';
import {expandResponse} from '../Utilities';
import {CLIENT_EVENTS} from '../Constants';
import takeRight from 'lodash.takeright';

export default class Transport {
  /**
   * Initializes the transport instance
   * @param name the name of the transport (must be the same value as the server's corresponding transport name)
   * @param {Client} client the parent SignalR client
   * @param treaty the response from the negotiate request created by the SignalR server
   */
  constructor(name, client, treaty) {
    this.name = name;
    this._client = client;
    this._logger = new Logdown({prefix: `${this.name}`});
    this._abortRequest = false;
    this._lastMessages = [];
    this._lastActiveAt = new Date().getTime();
    this._keepAliveData = {};

    if(treaty) {
      this._connectionToken = treaty.ConnectionToken;
      this._connectionId = treaty.ConnectionId;
      this._keepAliveData = {
        monitor: false,
        activated: !!treaty.KeepAliveTimeout,
        timeout: treaty.KeepAliveTimeout * 1000,
        timeoutWarning: (treaty.KeepAliveTimeout * 1000) * (2 / 3),
        transportNotified: false
      };
      this._disconnectTimeout = treaty.DisconnectTimeout * 1000;
      this._connectionTimeout = treaty.ConnectionTimeout;
      this._tryWebSockets = treaty.TryWebSockets;
      this._protocolVersion = treaty.ProtocolVersion;
      this._transportConnectTimeout = treaty.TransportConnectTimeout;
      this._longPollDelay = treaty.LongPollDelay;
      this._pollTimeout = treaty.ConnectionTimeout * 1000 + 10000;
      this._reconnectWindow = (treaty.KeepAliveTimeout + treaty.DisconnectTimeout) * 1000;
      this._beatInterval = (this._keepAliveData.timeout - this._keepAliveData.timeoutWarning) / 3;
    }
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
      this._keepAliveTimeoutId = setTimeout(this._keepAliveTimeoutDisconnect, this._keepAliveData.timeout);
    }
    this._latestMessageTime = newTimestamp;
  }

  get _lastMessageAt() {
    return this._latestMessageTime;
  }

  _supportsKeepAlive() {
    return this._keepAliveData.activated && this.supportsKeepAlive;
  }
}

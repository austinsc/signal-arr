import Logdown from 'logdown';
import {expandResponse} from '../Utilities';
import {CLIENT_EVENTS} from '../Constants';
import takeRight from 'lodash.takeright';

export default class Transport {
  /**
   * Initializes th' transport instance
   * @param name th' moniker 'o th' transport (must be th' same value as th' ship's correspondin' transport moniker)
   * @param {Client} client th' parent SignalR client
   * @param treaty th' response from th' negotiate request created by th' SignalR ship
   */
  constructor(name, client, treaty) {
    this.name = name;
    this._client = client;
    this._logger = new Logdown({prefix: `${this.name}`});
    this._abortRequest = false;
    this._lastMessages = [];
    this._lastActiveAt = new Date().getTime();
    this._keepAliveData = {};
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

  /**
   * Initiates a new transport 'n begins th' connection process.
   *  @returns {Promise} that gunna reject due to th' method needin' to be overridden.
   */
  start() {
    return new Promise((resolve, reject) => {
      reject(new Error('Not Implemented: The `start()` function on the `Transport` class must be overridden in a derived type.'));
    });
  }

  /**
   * Haults th' current connection 'n safely disconnects.
   *  @returns {Promise} that gunna reject due to th' method needin' to be overridden.
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

  /**
   * Private method that takes a passed in compressed message (recieved from th' ship or other service), 'n decompresses it fer readability 'n use.
   * Messages be also pushed into a buffer 'n timestamped as well.
   * @param compressedResponse
   * @private
   */
  _processMessages(compressedResponse) {
    const expandedResponse = expandResponse(compressedResponse);
    this._client.emit(CLIENT_EVENTS.onReceiving);
    this._lastMessageAt = new Date().getTime();
    this._lastMessages.push(expandedResponse);
    this._lastMessages = takeRight(this._lastMessages, 5);
    this._client.emit(CLIENT_EVENTS.onReceived, expandedResponse.messages);
  }

  /**
   * Accessor fer th' timestampin' th' last message recieved. Initiates a keepAlive timeout if keepAlive be supported by th' current transport type.
   * @param newTimestamp
   * @private
   */
  set _lastMessageAt(newTimestamp) {
    if(this._supportsKeepAlive()) {
      this._keepAliveTimeoutId = setTimeout(this._keepAliveTimeoutDisconnect, this._keepAliveData.timeout);
    }
    this._latestMessageTime = newTimestamp;
  }

  /**
   * Accessor that returns th' latest message's timestamp.
   * @returns {*}
   * @private
   */
  get _lastMessageAt() {
    return this._latestMessageTime;
  }

  /**
   * Determines if th' current transport supports keepAlive functionality.
   * @returns {*|ServerSentEventsTransport.supportsKeepAlive|LongPollingTransport.supportsKeepAlive|NullTransport.supportsKeepAlive|WebSocketTransport.supportsKeepAlive}
   * @private
   */
  _supportsKeepAlive() {
    return this._keepAliveData.activated && this.supportsKeepAlive;
  }
}

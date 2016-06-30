//import Logdown from 'logdown';
import Protocol from '../Protocol';
import {CONNECTION_EVENTS, CONNECTION_STATES} from '../Constants';
import takeRight from 'lodash.takeright';
import EventEmitter from '../EventEmitter';

export default class Transport extends EventEmitter {
  /**
   * Initializes th' transport instance
   * @param {string} name th' moniker 'o th' transport (must be th' same value as th' ship's correspondin' transport moniker)
   * @param {Client} client th' parent SignalR client
   * @param {Object} treaty th' response from th' negotiate request created by th' SignalR ship
   * @constructor
   */
  constructor(name, client, treaty) {
    super();
    this.state = CONNECTION_STATES.disconnected;
    this.name = name;
    this._client = client;
    //this._logger = new Logdown({prefix: `${this.name}`});
    this._abortRequest = false;
    this._lastMessages = [];
    this._keepAliveData = {};
    this._connectionToken = treaty.ConnectionToken;
    this._connectionId = treaty.ConnectionId;
    this._reconnectWindow = (treaty.KeepAliveTimeout + treaty.DisconnectTimeout) * 1000;
    this._keepAliveData = {
      monitor: false,
      activated: !!treaty.KeepAliveTimeout,
      timeout: treaty.KeepAliveTimeout * 1000,
      timeoutWarning: (treaty.KeepAliveTimeout * 1000) * (2 / 3),
      transportNotified: false
    };
  }

  /**
   * Initiates a new transport 'n begins th' connection process.
   *  @returns {Promise} that gunna reject due to th' method needin' to be overridden.
   *  @abstract
   *  @public
   */
  start() {
    return new Promise((resolve, reject) => {
      reject(new Error('Not Implemented: The `start()` function on the `Transport` class must be overridden in a derived type.'));
    });
  }

  /**
   * Accessor fer th' state property 'o th' transport. Sets th' state to newState 'n automatically emits th' correct events.
   * @param {string} newState The new state of the connection.
   * @emits stateChanging
   * @emits stateChanged
   * @public
   * @returns {void} This method does not return a value directly, it is used as an accessor to set a new state.
   */
  set state(newState) {
    if(!this._state) {
      this._state = newState;
    } else {
      this.emit(CONNECTION_EVENTS.stateChanging, {oldState: this.state, newState});
      this._state = newState;
      this.emit(CONNECTION_EVENTS.stateChanged, newState);
    }
  }

  /**
   *Accessor fer th' state property 'o th' transport. Returns th' current state 'o th' client.
   * @returns {string} Returns the current state of the connection
   * @public
   */
  get state() {
    return this._state;
  }

  /**
   * Accessor fer th' connection token 'o th' transport. Returns th' current connection token 'o th' client.
   * @returns {Object} Returns the current connection's transport token.
   * @public
   */
  get connectionToken() {
    return this._connectionToken;
  }

  /**
   * Haults th' current connection 'n safely disconnects.
   *  @returns {Promise} that gunna reject due to th' method needin' to be overridden.
   *  @function
   *  @abstract
   *  @public
   */
  stop() {
    return new Promise((resolve, reject) => {
      reject(new Error('Not Implemented: The `stop()` function on the `Transport` class must be overridden in a derived type.'));
    });
  }

  /**
   * Sends a message to th' connected ship.
   * @returns {Promise} thta gunna reject due to th' method needin' to be overridden.
   * @function
   * @abstract
   * @public
   */
  send() {
    return new Promise((resolve, reject) => {
      reject(new Error('Not Implemented: The `send()` function on the `Transport` class must be overridden in a derived type.'));
    });
  }

  /**
   * Emits an event at both th' Transport 'n Client levels without needin' to invoke both emits seperately.
   * @param {Object} event Th' event that be to be emitted.
   * @param {Object} args Arguments that correspond to th' event.
   * @function
   * @public
   * @extends emit
   * @returns {void} This method does not return a value.
   */
  emit(event, ...args) {
    this._client.emit(event, ...args);
    super.emit(event, ...args);
  }

  /**
   * Private method that takes a passed in compressed message (recieved from th' ship or other service), 'n decompresses it fer readability 'n use.
   * Messages be also pushed into a buffer 'n timestamped as well.
   * @param {Object} compressedResponse The compressed response from the server.
   * @emits receiving
   * @emits received
   * @returns {void} Method does not return a value.
   * @protected
   * @function
   */
  _processMessages(compressedResponse) {
    this.emit(CONNECTION_EVENTS.receiving, compressedResponse);
    const expandedResponse = Protocol.expandResponse(compressedResponse);
    this._lastMessageAt = new Date().getTime();
    this._lastMessages = takeRight([...this._lastMessages, expandedResponse], 5);
    this.emit(CONNECTION_EVENTS.received, expandedResponse.messages);
  }

  /**
   * Accessor fer th' timestampin' th' last message recieved. Initiates a keepAlive timeout if keepAlive be supported by th' current transport type.
   * @param {Object} newTimestamp A timestamp of the last received message.
   * @private
   * @function
   * @returns {void} Method does not return a value.
   */
  set _lastMessageAt(newTimestamp) {
    if(this._supportsKeepAlive()) {
      this._keepAliveTimeoutId = setTimeout(this._keepAliveTimeoutDisconnect, this._keepAliveData.timeout);
    }
    this._latestMessageTime = newTimestamp;
  }

  /**
   * Accessor that returns th' latest message's timestamp.
   * @returns {Object} Returns the timestamp of the last received message.
   * @private
   */
  get _lastMessageAt() {
    return this._latestMessageTime;
  }

  /**
   * Determines if th' current transport supports keepAlive functionality.
   * @returns {*|ServerSentEventsTransport.supportsKeepAlive|LongPollingTransport.supportsKeepAlive|NullTransport.supportsKeepAlive|WebSocketTransport.supportsKeepAlive}
   * Returns true if the transport type supports keepAlive or false if it does not.
   * @private
   */
  _supportsKeepAlive() {
    return this._keepAliveData.activated && this.supportsKeepAlive;
  }


  /**
   * prepareQueryString
   *
   * Prepares and returns query string
   *
   * qs: query string (object|string)
   */
  prepareQueryString(url, qs) {
    let appender = url.indexOf('?') !== -1 ? '&' : '?';
    let firstChar;

    if (!qs) {
      return url;
    }

    if (typeof (qs) === 'object') {
      let queryString = this._objectToQueryString(qs);
      if (queryString.length > 0) {
        queryString = appender + queryString;
      }
      return url + queryString;
    }

    if (typeof (qs) === 'string') {
      firstChar = qs.charAt(0);

      if (firstChar === '?' || firstChar === '&') {
        appender = '';
      }

      return url + appender + qs;
    }

    throw new Error(Constants.invalidQueryString);
  }

  /**
   * _objectToQueryString
   *
   * Converts an object of query string parameters to a string
   *
   * obj: parameters object
   */
  _objectToQueryString(obj) {
    if (!obj || typeof (obj) !== 'object') {
      throw new Error(Constants.notValidObject);
    }

    return Object.keys(obj).map(function(k) {
      /*if (k === 'clientProtocol') {
        return '';
        }*/
      return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
    }).join('&');
  }
}


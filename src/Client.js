import async from 'async';
import Logdown from 'logdown';
import request from 'superagent';
import PromiseMaker from './PromiseMaker';
import EventEmitter from './EventEmitter';
import ConnectingMessageBuffer from './ConnectingMessageBuffer';
import {CLIENT_STATES, CLIENT_EVENTS} from './Constants';
import {AvailableTransports} from './transports/index';

export const CLIENT_CONFIG_DEFAULTS = {
  url: '/signalr',
  logging: false,
  logger: new Logdown({prefix: 'SignalR Client'}),
  hubClient: false,
  totalTransportConnectTimeout: 10000
};

/**
 * The public API for managing communications with a SignalR server
 */
export default class Client extends EventEmitter {
  constructor(options) {
    super();
    this._config = Object.assign({}, CLIENT_CONFIG_DEFAULTS, options || {});
    this._logger = this._config.logger;
    this.state = CLIENT_STATES.disconnected;
  }

  /**
   * Starts the underlying connection to the server.
   * @param {Object} options contains any updated treaty values that should be used to start the connection.
   * @returns {Promise} that resolves once the connection is opened successfully.
   */
  start(options) {
    this._config = Object.assign(this._config, options);
    if(this.state !== CLIENT_STATES.disconnected) {
      throw new Error('The SignalR client is in an invalid state. You only need to call `start()` once and it cannot be called while reconnecting.');
    }
    this.emit(CLIENT_EVENTS.onConnecting);
    return this._negotiate()
      .then(this._connect.bind(this))
      .then(() => {
        this.emit(CLIENT_EVENTS.onConnected);
        return this;
      });
  }

  /**
   * Stops the connection to the server
   * //@param {boolean} force the current operation to end prematurely (default: false)
   * @returns {Promise} that resolves once the connection has closed successfully.
   */
  stop() {
    this._disconnect();
  }

  error(callback) {
    this.on(CLIENT_EVENTS.onError, callback);
  }

  connectionSlow(callback) {
    this.on(CLIENT_EVENTS.onConnectionSlow, callback);
  }

  receiving(callback) {
    this.on(CLIENT_EVENTS.onReceiving, callback);
  }

  received(callback) {
    this.on(CLIENT_EVENTS.onReceived, callback);
  }

  stateChanging(callback) {
    this.on(CLIENT_EVENTS.onStateChanging, callback);
  }

  stateChanged(callback) {
    this.on(CLIENT_EVENTS.onStateChanged, callback);
  }

  disconnecting(callback) {
    this.on(CLIENT_EVENTS.onDisconnecting, callback);
  }

  disconnected(callback) {
    this.on(CLIENT_EVENTS.onDisconnected, callback);
  }

  reconnecting(callback) {
    this.on(CLIENT_EVENTS.onReconnecting, callback);
  }

  reconnected(callback) {
    this.on(CLIENT_EVENTS.onReconnected, callback);
  }

  connecting(callback) {
    this.on(CLIENT_EVENTS.onConnecting, callback);
  }

  connected(callback) {
    this.on(CLIENT_EVENTS.onConnected, callback);
  }

  set state(newState) {
    this.emit(CLIENT_EVENTS.onStateChanging, {oldState: this.state, newState});
    this._state = newState;
    this.emit(CLIENT_EVENTS.onStateChanged, newState);
  }

  get state(){
    return this._state;
  }

  _negotiate() {
    return request
      .get(`${this._config.url}/negotiate`)
      .query({clientProtocol: 1.5})
      .use(PromiseMaker)
      .promise()
      .then(treaty => {
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
        this._connectingMessageBuffer = new ConnectingMessageBuffer(this, this.emit.bind(this, CLIENT_EVENTS.onReceived));
        this._beatInterval = (this._keepAliveData.timeout - this._keepAliveData.timeoutWarning) / 3;
        this._lastActiveAt = new Date().getTime();
        return this;
      });
  }

  _connect() {
    this.state = CLIENT_STATES.connecting;
    return this._findTransport()
      .then(transport => {
        this._logger.info(`Using the *${transport.constructor.name}*.`);
        this._transport = transport;
        this.state = CLIENT_STATES.connected;
        this._connectingMessageBuffer.drain();
        return this;
      });
  }

  _disconnect() {
    if(this._transport) {
      this._transport.stop();
    }
  }

  _findTransport() {
    return new Promise((resolve, reject) => {
        const availableTransports = AvailableTransports();
        if(this._config.transport && this._config.transport !== 'auto') {
          const transportConstructor = availableTransports.filter(x => x.name === this._config.transport)[0];
          if(transportConstructor) {
            // If the transport specified in the treaty is found in the available transports, use it
            const transport = new transportConstructor(this);
            transport.start().then(() => resolve(transport));
          } else {
            reject(new Error(`The transport specified (${this._config.transport}) was not found among the available transports [${availableTransports.map(x => `'${x.name}'`).join(' ')}].`));
          }
        } else {
          // Otherwise, Auto Negotiate the transport
          this._logger.info(`Negotiating the transport...`);
          async.detectSeries(availableTransports.map(x => new x(this)),
            (t, c) => t.start().then(() => c(t)).catch(() => c()),
              transport => transport ? resolve(transport) : reject('No suitable transport was found.'));
        }
      }
    );
  }
}

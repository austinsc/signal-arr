import Logdown from 'logdown';
import request from 'superagent';
import PromiseMaker from './PromiseMaker';
import EventEmitter from './EventEmitter';
import Connection from './Connection';
import HubConnection from './HubConnection';
import {CLIENT_STATES, CLIENT_EVENTS} from './Constants';

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
    this.config = Object.assign({}, CLIENT_CONFIG_DEFAULTS, options || {});
    this.logger = this.config.logger;
    this.state = CLIENT_STATES.disconnected;
  }

  /**
   * Starts the underlying connection to the server.
   * @param {Object} options contains any updated config values that should be used to start the connection.
   * @returns {Promise} that resolves once the connection is opened successfully.
   */
  start(options) {
    this.config = Object.assign(this.config, options);
    if(this.state !== CLIENT_STATES.disconnected) {
      throw new Error('The SignalR client is in an invalid state. You only need to call `start()` once and it cannot be called while reconnecting.');
    }
    this.emit(CLIENT_EVENTS.onConnecting);
    return this._negotiate()
      .then(connection => connection._connect())
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
    this._connection._disconnect();
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
      .get(`${this.config.url}/negotiate`)
      .query({clientProtocol: 1.5})
      .use(PromiseMaker)
      .promise()
      .then(data => this._connection = this.config.hubClient
        ? new HubConnection(this, data)
        : new Connection(this, data)
    );
  }
}

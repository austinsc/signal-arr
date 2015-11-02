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
  /**
   * Initializes th' client object wit' userdefined options. Options can include a multitude 'o properties, includin' th' ship URL,
   * a set transport protocol th' user wishes to use, a hub client, th' timeout to use when connection, 'n loggin' mechanisms.
   * @param options
   */
  constructor(options) {
    super();
    this._config = Object.assign({}, CLIENT_CONFIG_DEFAULTS, options || {});
    this._logger = this._config.logger;
    this.state = CLIENT_STATES.disconnected;
    this._connectingMessageBuffer = new ConnectingMessageBuffer(this, this.emit.bind(this, CLIENT_EVENTS.onReceived));

  }

  /**
   * Accessor fer th' state property 'o th' client. Sets th' state to newState 'n automatically emits th' correct events.
   * @param newState
   */
  set state(newState) {
    this.emit(CLIENT_EVENTS.onStateChanging, {oldState: this.state, newState});
    this._state = newState;
    this.emit(CLIENT_EVENTS.onStateChanged, newState);
  }

  /**
   *Accessor fer th' state property 'o th' client. Returns th' current state 'o th' client.
   * @returns {*}
   */
  get state(){
    return this._state;
  }

  /**
   * Starts th' underlyin' connection to th' ship.
   * @param {Object} options contains any updated treaty values that be used to start th' connection.
   * @returns {Promise} that resolves once th' connection be opened successfully.
   */
  start(options) {
    this._config = Object.assign(this._config, options);
    if(this.state !== CLIENT_STATES.disconnected) {
      throw new Error('The SignalR client is in an invalid state. You only need to call `start()` once and it cannot be called while reconnecting.');
    }
    this.state = CLIENT_STATES.connecting;
    this.emit(CLIENT_EVENTS.onConnecting);
    return this._negotiate()
      .then(this._findTransport.bind(this))
      .then(transport => {
        this._logger.info(`Using the *${transport.constructor.name}*.`);
        this._transport = transport;
        this.emit(CLIENT_EVENTS.onConnected);
        this.state = CLIENT_STATES.connected;
        this._connectingMessageBuffer.drain();
        return this;
      });
  }


  /**
   * Stops th' connection to th' ship
   * @returns {Promise} that resolves once th' connection has closed successfully.
   */
  stop() {
    if(this._transport) {
      this._transport.stop();
    }
  }
  send(data){
    if(this._transport){
      this._transport.send(data);
    }
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

  /**
   * Negotiates th' request to th' ship 'n returns th' consequental promise that be created as a result.
   * @returns {*}
   * @private
   */
  _negotiate() {
    return request
      .get(`${this._config.url}/negotiate`)
      .query({clientProtocol: 1.5})
      .use(PromiseMaker)
      .promise();
  }

  /**
   * Takes a treaty (result 'o _negotiate()) 'n uses that 'n th' client configuration to find th' best transport protocol to use.
   * A user may specify a transport as well if they would like to not use th' automated selection 'o one.
   * @param treaty
   * @returns {Promise}
   * @private
   */
  _findTransport(treaty) {
    return new Promise((resolve, reject) => {
        const availableTransports = AvailableTransports();
        if(this._config.transport && this._config.transport !== 'auto') {
          const transportConstructor = availableTransports.filter(x => x.name === this._config.transport)[0];
          if(transportConstructor) {
            // If the transport specified in the config is found in the available transports, use it
            const transport = new transportConstructor(this, treaty, this._config.url);
            transport.start().then(() => resolve(transport));
          } else {
            reject(new Error(`The transport specified (${this._config.transport}) was not found among the available transports [${availableTransports.map(x => `'${x.name}'`).join(' ')}].`));
          }
        } else {
          // Otherwise, Auto Negotiate the transport
          this._logger.info(`Negotiating the transport...`);
          async.detectSeries(availableTransports.map(x => new x(this, treaty,this._config.url)),
            (t, c) => t.start().then(() => c(t)).catch(() => c()),
              transport => transport ? resolve(transport) : reject('No suitable transport was found.'));
        }
      }
    );
  }
}

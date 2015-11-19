import async from 'async';
import Logdown from 'logdown';
import request from 'superagent';
import PromiseMaker from './PromiseMaker';
import EventEmitter from './EventEmitter';
import ConnectingMessageBuffer from './ConnectingMessageBuffer';
import {CLIENT_STATES, CLIENT_EVENTS, CONNECTION_EVENTS, CLIENT_PROTOCOL_VERSION} from './Constants';
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
 * @class
 * @access public
 */
export default class Client extends EventEmitter {
  /**
   * Initializes th' client object wit' userdefined options. Options can include a multitude 'o properties, includin' th' ship URL,
   * a set transport protocol th' user wishes to use, a hub client, th' timeout to use when connection, 'n loggin' mechanisms.
   * @param options
   * @constructs
   */
  constructor(options) {
    super();
    this._config = Object.assign({}, CLIENT_CONFIG_DEFAULTS, options || {});
    this._logger = this._config.logger;
    this.state = CLIENT_STATES.stopped;
    this._connectingMessageBuffer = new ConnectingMessageBuffer(this, this.emit.bind(this, CLIENT_EVENTS.onReceived));
    this.connectionData = [];

  }

  /**
   * Accessor fer th' state property 'o th' client. Sets th' state to newState 'n automatically emits th' correct events.
   * @param newState
   */
  set state(newState) {
    if(!this._state) {
      this._state = newState;
    } else {
      this.emit(CONNECTION_EVENTS.onStateChanging, {oldState: this.state, newState});
      this._state = newState;
      this.emit(CONNECTION_EVENTS.onStateChanged, newState);
    }
  }

  /**
   *Accessor fer th' state property 'o th' client. Returns th' current state 'o th' client.
   * @returns {*}
   */
  get state() {
    return this._state;
  }

  /**
   * Starts th' underlyin' connection to th' ship.
   * @param {Object} options contains any updated treaty values that be used to start th' connection.
   * @returns {Promise} that resolves once th' connection be opened successfully.
   * @access public
   * @function
   */
  start(options) {
    this._config = Object.assign(this._config, options);
    if(this.state !== CLIENT_STATES.stopped) {
      this.emit(CLIENT_EVENTS.onError);
      throw new Error('The SignalR client is in an invalid state. You only need to call `start()` once and it cannot be called while reconnecting.');
    }
    this.emit(CLIENT_EVENTS.onStarting);
    this.state = CLIENT_STATES.starting;
    return this._negotiate()
      .then(this._findTransport.bind(this))
      .then(transport => {
        this._logger.info(`Using the *${transport.constructor.name}*.`);
        this._transport = transport;
        this.emit(CLIENT_EVENTS.onStarted);
        this.state = CLIENT_STATES.started;
        this._connectingMessageBuffer.drain();
        return this;
      });
  }


  /**
   * Stops th' connection to th' ship
   * @returns {Promise} that resolves once th' connection has closed successfully.
   * @access public
   * @function
   */
  stop() {
    if(this._transport) {
      this.state = CLIENT_STATES.stopping;
      this.emit(CLIENT_EVENTS.onStopping);
      this._transport.stop();
      this.state = CLIENT_STATES.stopped;
      this.emit(CLIENT_EVENTS.onStopped);
      this._logger.info('Client stopped');
    }
  }

  /**
   * Sends a message to th' connected ship if th' transport be valid.
   * @param data Th' message to send.
   * @access public
   * @function
   */
  send(data) {
    if(this._transport) {
      this._transport.send(data);
    }
  }

  /**
   * A connnection and client event handler that is listening for an 'onError' event.
   * Event is emitted when an error is thrown.
   * @param callback Contains the error message. //TODO: Implement error events
   * @function
   * @access public
   */
  error(callback) {
    this.on(CLIENT_EVENTS.onError, callback);
  }

  /**
   * A client event handler that is listening for a 'onStarting' event.
   * Event is emitted when the client begins initialization.
   * @param callback
   * @function
   * @access public
   */
  starting(callback) {
    this.on(CLIENT_EVENTS.onStarting, callback);
  }

  /**
   * A client event handler that is listening for a 'onStarted' event.
   * Event is emitted once the client has secured a connection successfully.
   * @param callback
   * @function
   * @access public
   */
  started(callback) {
    this.on(CLIENT_EVENTS.onStarted, callback);
  }

  /**
   * A client event handler that is listening for a 'onStopping' event.
   * Event is emitted once the client has initiated a disconnect.
   * @param callback
   * @function
   * @access public
   */
  stopping(callback) {
    this.on(CLIENT_EVENTS.onStopping, callback);
  }

  /**
   * A client event handler that is listening for a 'onStopped' event.
   * Event is emitted once the client has successfully disconnected from the server.
   * @param callback
   * @function
   * @access public
   */
  stopped(callback) {
    this.on(CLIENT_EVENTS.onStopped, callback);
  }

  /**
   * A connection and client event handler that is listening for a 'onReceiving' event.
   * Event is emitted whenever a message is received by the client from the server. (Message is in compressed, raw form from server).
   * @param callback Contains the compressed message data that the client is currently receiving.
   * @function
   * @access public
   */
  receiving(callback) {
    this.on(CLIENT_EVENTS.onReceiving, callback);
  }

  /**
   * A connection and client event handler that is listening for a 'onReceived' event.
   * Event is emitted whenever a message is received by the client from the server. (Message is decompressed by client, making it more managable).
   * @param callback Contains the received decompressed message data.
   * @function
   * @access public
   */
  received(callback) {
    this.on(CLIENT_EVENTS.onReceived, callback);
  }

  /**
   * A connection and client event handler that is listening for a 'onStateChanging' event.
   * Event is emitted whenever the client's state or the connection's state is in the process of changing.
   * @param callback Contains both the old and new state.
   * @function
   * @access public
   */
  stateChanging(callback) {
    this.on(CLIENT_EVENTS.onStateChanging, callback);
  }

  /**
   * A connection and client event handler that is listening for a 'onStateChanged' event.
   * Event is emitted whenever the client's state or the connection's state has changed.
   * @param callback Contains the new state.
   * @function
   * @access public
   */
  stateChanged(callback) {
    this.on(CLIENT_EVENTS.onStateChanged, callback);
  }

  /**
   * A connection event handler that is listening for a 'onDisconnecting' event.
   * Event is emitted once the connection is in the process of stopping, initiated by the user, or automatically if the connection is lost unexpectedly.
   * @param callback
   * @function
   * @access public
   */
  disconnecting(callback) {
    this.on(CONNECTION_EVENTS.onDisconnecting, callback);
  }

  /**
   * A connection event handler that is listening for a 'onDisconnected' event.
   * Event is emitted once the connection has been completely haulted by the uesr, or has been lost unexpectedly.
   * @param callback
   */
  disconnected(callback) {
    this.on(CONNECTION_EVENTS.onDisconnected, callback);
  }

  /**
   * A connection event handler that is listening for a 'onReconnecting' event.
   * Event is emitted if the connection has been lost unexpectedly and is automatically attempting to reconnect.
   * @param callback
   * @function
   * @access public
   */
  reconnecting(callback) {
    this.on(CONNECTION_EVENTS.onReconnecting, callback);
  }

  /**
   * A connection event handler that is listening for a 'onReconnected' event.
   * Event is emitted if the connection has been successfully re-established after an unexpected disconnect.
   * @param callback
   * @function
   * @access public
   */
  reconnected(callback) {
    this.on(CONNECTION_EVENTS.onReconnected, callback);
  }

  /**
   * A connection event listener that is listening for a 'onConnecting' event.
   * Event is emitted if the user has used the client to try and negotiate a connection to a server.
   * @param callback
   * @function
   * @access public
   */
  connecting(callback) {
    this.on(CONNECTION_EVENTS.onConnecting, callback);
  }

  /**
   * A connection event listener that is listening for a 'onConnected' event.
   * Event is emitted if the connection to the server was successfully established.
   * @param callback
   * @function
   * @access public
   */
  connected(callback) {
    this.on(CONNECTION_EVENTS.onConnected, callback);
  }

  /**
   * A connection event listener that is listeing for a 'onConnectionSlow' event.
   * Currently not implemented.
   * @param callback
   * @function
   * @access public
   */
  connectionSlow(callback) {
    this.on(CLIENT_EVENTS.onConnectionSlow, callback);
  }

  /**
   * Negotiates th' request to th' ship 'n returns th' consequental promise that be created as a result.
   * @returns {*}
   * @protected
   */
  _negotiate() {
    return request
      .get(`${this._config.url}/negotiate`)
      .query({clientProtocol: CLIENT_PROTOCOL_VERSION})
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
          async.detectSeries(availableTransports.map(x => new x(this, treaty, this._config.url)),
            (t, c) => t.start().then(() => c(t)).catch(() => c()),
            transport => transport ? resolve(transport) : reject('No suitable transport was found.'));
        }
      }
    );
  }
}

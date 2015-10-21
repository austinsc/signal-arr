import async from 'async';
import Logdown from 'logdown';
import request from 'superagent';
import PromiseMaker from './PromiseMaker';
import {CLIENT_EVENTS, CLIENT_STATES} from './Constants';
import {AvailableTransports} from './transports';
import ConnectingMessageBuffer from './ConnectingMessageBuffer';

export const CONNECTION_CONFIG_DEFAULTS = {
  logger: new Logdown({prefix: 'SignalR Connection'}),
  KeepAliveTimeout: 0
};

export default class Connection {
  constructor(client, config) {
    config = Object.assign({}, CONNECTION_CONFIG_DEFAULTS, config);
    this._client = client;
    this._url = config.Url;
    this._logger = config.logger;
    this._connectionToken = config.ConnectionToken;
    this._connectionId = config.ConnectionId;
    this._keepAliveData = {
      activated: !!config.KeepAliveTimeout,
      timeout: config.KeepAliveTimeout * 1000,
      timeoutWarning: (config.KeepAliveTimeout * 1000) * (2 / 3)
    };
    this._disconnectTimeout = config.DisconnectTimeout * 1000;
    this._connectionTimeout = config.ConnectionTimeout;
    this._tryWebSockets = config.TryWebSockets;
    this._protocolVersion = config.ProtocolVersion;
    this._transportConnectTimeout = config.TransportConnectTimeout;
    this._longPollDelay = config.LongPollDelay;
    this._pollTimeout = config.ConnectionTimeout * 1000 + 10000;
    this._reconnectWindow = (config.KeepAliveTimeout + config.DisconnectTimeout) * 1000;
    this._connectingMessageBuffer = new ConnectingMessageBuffer(client, client.emit.bind(client, CLIENT_EVENTS.onReceived));
    this._beatInterval = (this._keepAliveData.timeout - this._keepAliveData.timeoutWarning) / 3;
    this._lastActiveAt = new Date().getTime();
  }

  _supportsKeepAlive() {
    return this._keepAliveData.activated && this._client.transport.supportsKeepAlive;
  }

  //TODO: WIP
  //startHeartBeat() {
  //  this._lastActiveAt = new Date().getTime();
  //  beat();
  //}
  //
  //beat(){
  //  if(this._supportsKeepAlive()) {
  //    // TODO: Implement monitorKeepAlive
  //  }
  //  startHeartBeat();
  //
  //
  //}

  _connect() {
    this._client._setState(CLIENT_STATES.connecting);

    this._findTransport()
      .then(transport => {
        this._logger.info(`Using the *${transport.constructor.name}*.`);
        this.transport = transport;
      })
      .then(transport => {
        // TODO:
        //if(this._supportsKeepAlive()) {
        //  Logic.monitorKeepAlive(this);
        //}
        //
        //Logic.startHeartbeat(this);
        //
        //// Used to ensure low activity clients maintain their authentication.
        //// Must be configured once a transport has been decided to perform valid ping requests.
        //this._.configurePingInterval(this);
        this._client._setState(CLIENT_STATES.connected);
        this._connectingMessageBuffer.drain();
      })
      .catch(err => this._logger.error(err))
  }

  _findTransport() {
    return new Promise((resolve, reject) => {
        const availableTransports = AvailableTransports();
        if(this._client.config.transport && this._client.config.transport !== 'auto') {
          if(availableTransports[this._client.config.transport]) {
            // If the transport specified in the config is found in the available transports, use it
            resolve(new availableTransports[this._client.config.transport](this));
          } else {
            reject(new Error(`The transport specified (${this._client.config.transport}) was not found among the available transports [${availableTransports.map(x => `'${x.name}'`).join(' ')}].`))
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

//
//_send(data) {
//
//}
//
//_abort(async = true) {
//
//}
}

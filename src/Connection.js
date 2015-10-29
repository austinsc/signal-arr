import async from 'async';
import Logdown from 'logdown';
import {AvailableTransports} from './transports/index';
import {CLIENT_EVENTS, CLIENT_STATES} from './Constants';
import ConnectingMessageBuffer from './ConnectingMessageBuffer';

export const CONNECTION_CONFIG_DEFAULTS = {
  logger: new Logdown({prefix: 'SignalR Connection'}),
  KeepAliveTimeout: 0
};

export default class Connection {
  constructor(client, config) {
    config = Object.assign({}, CONNECTION_CONFIG_DEFAULTS, config);
    //this._client = client;
    this._url = config.Url;
    this._logger = config.logger;
    this._connectionToken = config.ConnectionToken;
    this._connectionId = config.ConnectionId;
    this._keepAliveData = {
      monitor: false,
      activated: !!config.KeepAliveTimeout,
      timeout: config.KeepAliveTimeout * 1000,
      timeoutWarning: (config.KeepAliveTimeout * 1000) * (2 / 3),
      transportNotified: false
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


}

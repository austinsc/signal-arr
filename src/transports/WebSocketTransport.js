//import {w3cwebsocket} from 'websocket/lib/browser';
import Transport from './Transport';
import {expect} from 'chai';
import {CLIENT_STATES, CLIENT_EVENTS} from '../Constants';

export default class WebSocketTransport extends Transport {
  static supportsKeepAlive = true;

  constructor(connection) {
    super('webSockets', connection);
  }

  start() {
    return new Promise((resolve, reject) => {

      if(!WebSocket) {
        return reject(new Error('The type `WebSocket` could not be resolved.'));
      }
      if(this._socket) {
        return reject(new Error('A socket has already been initialized. Call `stop()` before attempting to `start()` again.'));
      }

      this._logger.info(`*${this.constructor.name}* starting...`);
      this.connection._client._setState(CLIENT_STATES.connecting);

      const url = this.connection._client.config.url.replace(/http(s)?:/, 'ws:');

      this._logger.info(`Connecting to ${url}`);
      this._socket = new WebSocket(url);

      this._socket.onopen = () => {
        this.connection._openedWebSocket = true;
        this._logger.info(`*${this.constructor.name}* connection opened.`);
        this.connection._client._setState(CLIENT_STATES.connected);
      };

      resolve(this);
    });
  }

  _messageObserver() {


  }

  _reconnect() {


  }

  stop() {
    if(this._socket && this.connection._openedWebSocket) {
      this._socket.close();
      this.connection._abortRequest = true;
    }

  }
}

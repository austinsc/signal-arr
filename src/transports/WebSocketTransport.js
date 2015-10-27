//import {w3cwebsocket} from 'websocket/lib/browser';
import Transport from './Transport';
import {expect} from 'chai';
import {CLIENT_STATES, CLIENT_EVENTS} from '../Constants';

export default class WebSocketTransport extends Transport {
  static supportsKeepAlive = true;

  constructor(connection) {
    super('webSockets', connection);
  }

  _send(data) {
    return new Promise((resolve, reject) => {
      if(!this._socket) {
        return reject(new Error('The WebSocket has not yet been initialized.'));
      }
      this._socket.send(JSON.stringify(data));
      resolve();
    })
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

      let url = this.connection._client.config.url.replace(/http(s)?:/, 'ws:');
      this._logger.info(`Connecting to ${url}`);
      url += `/connect?transport=webSockets&connectionToken=${encodeURIComponent(this.connection._connectionToken)}`;
      url += '&tid=' + Math.floor(Math.random() * 11);

      this._socket = new WebSocket(url);
      this._socket.onopen = e => {
        if(e.type === 'open') {
          this._logger.info(`*${this.constructor.name}* connection opened.`);
          this.connection._client._setState(CLIENT_STATES.connected);
        }
      };
      this._socket.onmessage = e => {
        this.connection._processMessages(e.data);
      };
      this._socket.onerror = e => {
        this._logger.error(`*${this.constructor.name}* connection errored: ${e}`);
      };
      this._socket.onclose = e => {
        this.connection._client._setState(CLIENT_STATES.disconnected);
      };

      resolve();
    });
  }


  _reconnect() {

  }

  stop() {
    if(this._socket) {
      this._socket.close();
    }
  }
}


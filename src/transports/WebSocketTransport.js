import {w3cwebsocket} from 'websocket';
import Transport from './Transport';

export default class WebSocketTransport extends Transport {
  static supportsKeepAlive = true;
  constructor(connection) {
    super('webSockets', connection);
  }

  start() {
    return new Promise((resolve, reject) => {
      reject();
      if(!w3cwebsocket) {
        return reject(new Error('The type `WebSocket` could not be resolved.'));
      }
      if(this._socket) {
        return reject(new Error('A socket has already been initialized. Call `stop()` before attempting to `start()` again.'));
      }
      this._logger.info(`*${this.constructor.name}* starting...`);

      const url = this.connection._client.config.url.replace(/http(s)?:/, 'ws:');

      this._logger.info(`Connecting to ${url}`);
      this._socket = new w3cwebsocket(url);

      this._socket.onopen = () => {
        this._logger.info(`*${this.constructor.name}* connection opened.`);
      };

      resolve(this);
    });
  }
}

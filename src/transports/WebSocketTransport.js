import Transport from './Transport';
import {CONNECTION_EVENTS, CONNECTION_STATES} from '../Constants';

export default class WebSocketTransport extends Transport {
  static supportsKeepAlive = true;

  /**
   * Uses th' current client, treaty from th' initial negotiation, 'n target URL to construct a new WebSocket transport.
   * @param client
   * @param treaty
   * @param url
   */
  constructor(client, treaty, url) {
    super('webSockets', client, treaty);
    this._intentionallyClosed = null;
    this._url = url;
  }

  /**
   * Returns a promise to send th' passed in data to th' target URL.
   * @param data
   * @returns {Promise}
   * @private
   */
  send(data) {
    return new Promise((resolve, reject) => {
      if(!this._socket) {
        return reject(new Error('The WebSocket has not yet been initialized.'));
      }
      this._socket.send(JSON.stringify(data));
      resolve();
    });
  }

  /**
   * Initates th' WebSocket connection, as well as handles onmessage, onerror, onclose, 'n onopen events.
   * @returns {Promise}
   */
  start() {
    return new Promise((resolve, reject) => {
      if(!WebSocket) {
        return reject(new Error('The type `WebSocket` could not be resolved.'));
      }
      if(this._socket && this._intentionallyClosed) {
        return reject(new Error('A socket has already been initialized. Call `stop()` before attempting to `start()` again.'));
      }

      this._logger.info(`*${this.constructor.name}* starting...`);
      let url = this._url.replace(/http(s)?:/, 'ws:');
      this._logger.info(`Connecting to ${url}`);

      if(!this._intentionallyClosed && this.state === CONNECTION_STATES.reconnecting) {
        url += `/reconnect?transport=webSockets&connectionToken=${encodeURIComponent(this._connectionToken)}`;
        this.emit(CONNECTION_EVENTS.reconnecting);
      } else {
        url += `/connect?transport=webSockets&connectionToken=${encodeURIComponent(this._connectionToken)}`;
        this.emit(CONNECTION_EVENTS.connecting);
        this.state = CONNECTION_STATES.connecting;
      }
      if(this._client.connectionData) {
        url += `&connectionData=${JSON.stringify(this._client.connectionData)}`;
      }
      url += '&tid=' + Math.floor(Math.random() * 11);
      this._socket = new WebSocket(url);
      this._socket.onopen = e => {
        if(e.type === 'open') {
          this._logger.info(`*${this.constructor.name}* connection opened.`);
          if(!this._intentionallyClosed && this.state === CONNECTION_STATES.reconnecting) {
            this.emit(CONNECTION_EVENTS.reconnected);
          } else {
            this.emit(CONNECTION_EVENTS.onConnected);
          }
          this.state = CONNECTION_STATES.connected;
          resolve();
        }
      };
      this._socket.onmessage = e => {
        this._processMessages(e.data);
      };
      this._socket.onerror = e => {
        this._logger.error(`*${this.constructor.name}* connection errored: ${e}`);
      };
      this._socket.onclose = () => {
        if(this._intentionallyClosed) {
          this._logger.info(`*${this.constructor.name}* connection closed.`);
          this.state = CONNECTION_STATES.disconnected;
          this.emit(CONNECTION_EVENTS.disconnected);
        } else {
          this._logger.info(`*${this.constructor.name}* connection closed unexpectedly... Attempting to reconnect.`);
          this.state = CONNECTION_STATES.reconnecting;
          this._reconnectTimeoutId = setTimeout(this.start(), this._reconnectWindow);
        }
      };
    });
  }
  /**
   * Cleanly disconnects from th' target ship.
   */
  stop() {
    if(this._socket) {
      this.emit(CONNECTION_EVENTS.disconnecting);
      this._intentionallyClosed = true;
      this._socket.close();
    }
  }

  /**
   * If th' keepAlive times out, closes th' connection cleanly 'n attempts to reconnect.
   * @private
   */
  _keepAliveTimeoutDisconnect() {
    this.emit(CONNECTION_EVENTS.disconnecting);
    this._socket.close();
  }
}


import Transport from './Transport';
import {CLIENT_STATES, CLIENT_EVENTS} from '../Constants';
import EventSourcePolyfill from 'EventSource';

const EventSource = window.EventSource || EventSourcePolyfill;

export default class ServerSentEventsTransport extends Transport {
  static supportsKeepAlive = true;

  constructor(client, treaty) {
    super('serverSentEvents', client, treaty);
    this._intentionallyClosed = null;
  }
  start(){
    return new Promise((resolve, reject) => {
      if(this._eventSource) {
        return reject(new Error('An EventSource has already been initialized. Call `stop()` before attempting to `start()` again.'));
      }

      this._logger.info(`*${this.constructor.name}* starting...`);
      let url = this._client._config.url;
      this._logger.info(`Connecting to ${url}`);
      url += `/connect?transport=serverSentEvents&connectionToken=${encodeURIComponent(this._connectionToken)}`;
      this._client.emit(CLIENT_EVENTS.onConnecting);
      this._client.state = CLIENT_STATES.connecting;
      url += '&tid=' + Math.floor(Math.random() * 11);

      this._eventSource = new EventSource(url);
      this._eventSource.onopen = e => {
        if(e.type === 'open') {
          this._logger.info(`*${this.constructor.name}* connection opened.`);
          this._client.emit(CLIENT_EVENTS.onConnected);
          this._client.state = CLIENT_STATES.connected;
          resolve();
        }
      };
      this._eventSource.onmessage = e => {
        this._processMessages(e.data);
      };
      this._eventSource.onerror = e => {
        this._logger.error(`*${this.constructor.name}* connection errored: ${e}`);
      };
    });
  }
  stop(){
    if(this._eventSource){
      this._client.emit(CLIENT_EVENTS.onDisconnecting);
      this._intentionallyClosed = true;
      this._eventSource.close();
      this._client.state = CLIENT_STATES.disconnected;
      this._client.emit(CLIENT_EVENTS.onDisconnected);
    }
  }
  _send(data) {
    return new Promise((resolve, reject) => {
      if(!this._eventSource) {
        return reject(new Error('The ServerSentEvent has not yet been initialized.'));
      }
      this._socket.send(JSON.stringify(data));
      resolve();
    });
  }














}

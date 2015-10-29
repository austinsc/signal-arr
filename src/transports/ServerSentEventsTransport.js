import Transport from './Transport';
import {CLIENT_STATES, CLIENT_EVENTS} from '../Constants';
import EventSourcePolyfill from 'eventsource';
import request from 'superagent';
import PromiseMaker from '../PromiseMaker';

const EventSource = (window && window.EventSource) || EventSourcePolyfill;

export default class ServerSentEventsTransport extends Transport {
  static supportsKeepAlive = true;

  constructor(client, treaty, url) {
    super('serverSentEvents', client, treaty);
    this._intentionallyClosed = null;
    this._url = url;
  }
  start(){
    return new Promise((resolve, reject) => {
      if(this._eventSource && this._intentionallyClosed) {
        return reject(new Error('An EventSource has already been initialized. Call `stop()` before attempting to `start()` again.'));
      }

      this._logger.info(`*${this.constructor.name}* starting...`);
      let url = this._url;
      if(!this._intentionallyClosed && this._client.state === CLIENT_STATES.reconnecting) {
        this._logger.info(`Reconnecting to ${url}`);
        url += `/reconnect?transport=serverSentEvents&connectionToken=${encodeURIComponent(this._connectionToken)}`;
        this._client.emit(CLIENT_EVENTS.onReconnecting);
      }else {
        this._logger.info(`Connecting to ${url}`);
        url += `/connect?transport=serverSentEvents&connectionToken=${encodeURIComponent(this._connectionToken)}`;
        this._client.emit(CLIENT_EVENTS.onConnecting);
        this._client.state = CLIENT_STATES.connecting;
      }
      url += '&tid=' + Math.floor(Math.random() * 11);

      this._eventSource = new EventSource(url);
      this._eventSource.onopen = e => {
        if(e.type === 'open') {
          this._logger.info(`*${this.constructor.name}* connection opened.`);
          if(!this._intentionallyClosed && this._client.state === CLIENT_STATES.reconnecting) {
            this._client.emit(CLIENT_EVENTS.onReconnected);
          } else {
            this._client.emit(CLIENT_EVENTS.onConnected);
          }
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
      this._logger.info(`*${this.constructor.name}* connection closed.`);
      this._client.state = CLIENT_STATES.disconnected;
      this._client.emit(CLIENT_EVENTS.onDisconnected);
    }
  }
  _send(data) {
    return request
      .post(this._url + '/send')
      .query({connectionToken: this._connectionToken})
      .query({transport: 'serverSentEvents'})
      .send(`data=${JSON.stringify(data)}`)
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .use(PromiseMaker)
      .promise();
  }
  _keepAliveTimeoutDisconnect(){
    this._client.emit(CLIENT_EVENTS.onDisconnecting);
    this._intentionallyClosed = false;
    this._eventSource.close();
    this._logger.info(`*${this.constructor.name}* connection closed unexpectedly... Attempting to reconnect.`);
    this._client.state = CLIENT_STATES.reconnecting;
    this._reconnectTimeoutId = setTimeout(this.start(), this._reconnectWindow);
  }
}

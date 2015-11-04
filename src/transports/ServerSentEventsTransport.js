import Transport from './Transport';
import {CONNECTION_EVENTS, CONNECTION_STATES} from '../Constants';
import EventSourcePolyfill from 'eventsource';
import request from 'superagent';
import PromiseMaker from '../PromiseMaker';

const EventSource = (typeof window !== 'undefined' && window.EventSource) || EventSourcePolyfill;
/**
 * The ServerSentEvents transport protocol.
 */
export default class ServerSentEventsTransport extends Transport {
  static supportsKeepAlive = true;

  /**
   * Uses th' current client, treaty from th' initial negotiation, 'n target URL to construct a new ServerSentEvents transport.
   * @param client
   * @param treaty
   * @param url
   */
  constructor(client, treaty, url) {
    super('serverSentEvents', client, treaty);
    this._intentionallyClosed = null;
    this._url = url;
  }

  /**
   * Initates th' ServerSentEvents connection, as well as handles onmessage, onerror,  'n onopen events.
   * @returns {Promise}
   */
  start(){
    return new Promise((resolve, reject) => {
      if(this._eventSource && this._intentionallyClosed) {
        return reject(new Error('An EventSource has already been initialized. Call `stop()` before attempting to `start()` again.'));
      }

      this._logger.info(`*${this.constructor.name}* starting...`);
      let url = this._url;
      if(!this._intentionallyClosed && this.state === CONNECTION_STATES.reconnecting) {
        this._logger.info(`Reconnecting to ${url}`);
        url += `/reconnect?transport=serverSentEvents&connectionToken=${encodeURIComponent(this._connectionToken)}`;
        this.emit(CONNECTION_EVENTS.onReconnecting);
      }else {
        this._logger.info(`Connecting to ${url}`);
        url += `/connect?transport=serverSentEvents&connectionToken=${encodeURIComponent(this._connectionToken)}`;
        this.emit(CONNECTION_EVENTS.onConnecting);
        this.state = CONNECTION_STATES.connecting;
      }
      url += '&tid=' + Math.floor(Math.random() * 11);

      this._eventSource = new EventSource(url);
      this._eventSource.onopen = e => {
        if(e.type === 'open') {
          this._logger.info(`*${this.constructor.name}* connection opened.`);
          if(!this._intentionallyClosed && this.state === CONNECTION_STATES.reconnecting) {
            this.emit(CONNECTION_EVENTS.onReconnected);
          } else {
            this.emit(CONNECTION_EVENTS.onConnected);
          }
          this.state = CONNECTION_STATES.connected;
          resolve();
        }
      };
      this._eventSource.onmessage = e => {
        if (e.data === 'initialized') {
          return;
        }
        this._processMessages(e.data);
      };
      this._eventSource.onerror = e => {
        this._logger.error(`*${this.constructor.name}* connection errored: ${e}`);
      };
    });
  }

  /**
   * Cleanly disconnects from th' target ship.
   */
  stop(){
    if(this._eventSource){
      this.emit(CONNECTION_EVENTS.onDisconnecting);
      this._intentionallyClosed = true;
      this._eventSource.close();
      this._logger.info(`*${this.constructor.name}* connection closed.`);
      this.state = CONNECTION_STATES.disconnected;
      this.emit(CONNECTION_EVENTS.onDisconnected);
    }
  }

  /**
   * Returns a promise that resolves when a message be sent with th' passed in data to th' target URL.
   * @param data
   * @returns {Promise}
   * @private
   */
  send(data) {
    return request
      .post(this._url + '/send')
      .query({connectionToken: this._connectionToken})
      .query({transport: 'serverSentEvents'})
      .send(`data=${JSON.stringify(data)}`)
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .use(PromiseMaker)
      .promise();
  }
  /**
   * If th' keepAlive times out, closes th' connection cleanly 'n attempts to reconnect.
   * @private
   */
  _keepAliveTimeoutDisconnect(){
    this.emit(CONNECTION_EVENTS.onDisconnecting);
    this._intentionallyClosed = false;
    this._eventSource.close();
    this._logger.info(`*${this.constructor.name}* connection closed unexpectedly... Attempting to reconnect.`);
    this.state = CONNECTION_STATES.reconnecting;
    this._reconnectTimeoutId = setTimeout(this.start(), this._reconnectWindow);
  }
}

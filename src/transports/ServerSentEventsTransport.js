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
   * @param {Client} client The client that will be initiating the new ServerSentEvents connection.
   * @param {Object} treaty An object that holds the reults from the original negotiation between client-server. Contains critical connection information.
   * @param {string} url The URL of the server the client is connecting to.
   * @constructor
   */
  constructor(client, treaty, url, qs) {
    super('serverSentEvents', client, treaty);
    this._intentionallyClosed = null;
    this._url = url;
    this._qs = qs;
  }

  /**
   * Initates th' ServerSentEvents connection, as well as handles onmessage, onerror,  'n onopen events.
   * @returns {Promise} Resolves when the client hasb een successfully connected to the server via a ServerSentEvents transport.
   * @public
   * @function
   * @extends start
   * @emits reconnecting
   * @emits connecting
   * @emits connected
   * @emits reconnected
   */
  start(){
    return new Promise((resolve, reject) => {
      if(this._eventSource && this._intentionallyClosed) {
        return reject(new Error('An EventSource has already been initialized. Call `stop()` before attempting to `start()` again.'));
      }

      //console.info(`*${this.constructor.name}* starting...`);
      let url = this._url;
      if(!this._intentionallyClosed && this.state === CONNECTION_STATES.reconnecting) {
        //console.info(`Reconnecting to ${url}`);
        url += `/reconnect?transport=serverSentEvents&connectionToken=${encodeURIComponent(this._connectionToken)}`;
        this.emit(CONNECTION_EVENTS.reconnecting);
      }else {
        //console.info(`Connecting to ${url}`);
        url += `/connect?transport=serverSentEvents&connectionToken=${encodeURIComponent(this._connectionToken)}`;
        this.emit(CONNECTION_EVENTS.connecting);
        this.state = CONNECTION_STATES.connecting;
      }
      url += '&tid=' + Math.floor(Math.random() * 11);

      // Query String
      url = this.prepareQueryString(url, this._qs);

      this._eventSource = new EventSource(url);
      this._eventSource.onopen = e => {
        if(e.type === 'open') {
          //console.info(`*${this.constructor.name}* connection opened.`);
          if(!this._intentionallyClosed && this.state === CONNECTION_STATES.reconnecting) {
            this.emit(CONNECTION_EVENTS.reconnected);
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
        //console.error(`*${this.constructor.name}* connection errored: ${e}`);
      };
    });
  }

  /**
   * Cleanly disconnects from th' target ship.
   * @returns {Promise} Resolves once the connection has been halted successfully.
   * @function
   * @public
   * @extends stop
   * @emits disconnecting
   * @emits disconnected
   */
  stop(){
    if(this._eventSource){
      this.emit(CONNECTION_EVENTS.disconnecting);
      this._intentionallyClosed = true;
      this._eventSource.close();
      //console.info(`*${this.constructor.name}* connection closed.`);
      this.state = CONNECTION_STATES.disconnected;
      this.emit(CONNECTION_EVENTS.disconnected);
    }
  }

  /**
   * Returns a promise that resolves when a message be sent with th' passed in data to th' target URL.
   * @param {Object} data The message to send to the server.
   * @returns {Promise} Resolves once the message has been sent successfully.
   * @private
   * @function
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
   * @returns {void} Method does not return a value.
   * @emits disconnecting
   */
  _keepAliveTimeoutDisconnect(){
    this.emit(CONNECTION_EVENTS.disconnecting);
    this._intentionallyClosed = false;
    this._eventSource.close();
    //console.info(`*${this.constructor.name}* connection closed unexpectedly... Attempting to reconnect.`);
    this.state = CONNECTION_STATES.reconnecting;
    this._reconnectTimeoutId = setTimeout(this.start(), this._reconnectWindow);
  }
}

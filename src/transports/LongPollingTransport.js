import _ from 'lodash';
import request from 'superagent';
import Transport from './Transport';
import PromiseMaker from '../PromiseMaker';
import {CONNECTION_STATES, CONNECTION_EVENTS} from '../Constants';


/**
 * Th' long pollin' transport protocol.
 * @class
 */
export default class LongPollingTransport extends Transport {
  static supportsKeepAlive = false;

  /**
   * Uses th' current client, treaty from th' initial negotiation, 'n target URL to construct a new Longpollin' transport.
   * @param {Client} client The current instance of the user's client.
   * @param {Object} treaty An Object that is the result of the initial client-server negotiation. Contains vital connection information.
   * @param {string} url The URL of the server the user wishes to connect to.
   * @constructor
   */
  constructor(client, treaty, url) {
    super('longPolling', client, treaty);
    this._maxReconnectedTimeout = 3600000;
    this._url = url;
  }

  /**
   * Initiates th' long pollin' transport protocol fer th' current connection.
   * @returns {Promise} That resolves once th' long pollin' transport has started successfully 'n has begun pollin'.
   * @param {Promise} current The current connection promise.
   * @private
   * @function
   */
  _queryData(current) {
    return current
      .query({clientProtocol: 1.5})
      .query({connectionToken: this._connectionToken})
      .query({transport: 'longPolling'})
      .query({connectionData: this._data || ''});
  }

  /**
   *Initiates th' connection after th' LongPollin'Transport transport type be declared via th' initial negotiation.
   * @returns {Promise.<T>} Resolves once the client has successfully connected and has started to poll the server for a response.
   * @function
   * @public
   * @extends start
   * @emits connected
   */
  start() {
    if(this._pollTimeoutId) {
      throw new Error('A polling session has already been initialized. Call `stop()` before attempting to `start()` again.');
    }
    console.info(`*${this.constructor.name}* starting...`);
    return this._connect()
      //.then(this._startConnection.bind(this))
      .then(() => {
        this.state = CONNECTION_STATES.connected;
        this.emit(CONNECTION_EVENTS.onConnected);
        this._reconnectTries = 0;
        this._reconnectTimeoutId = null;
      })
      .then(this._poll.bind(this));
  }

  /**
   * Initiates th' long pollin' transport protocol fer th' current connection.
   * @returns {Promise} that resolves once th' long pollin' transport has started successfully 'n has begun pollin'.
   * @function
   * @private
   * @emits connecting
   */
  _connect() {
    const url = this._url + '/connect';
    console.info(`Connecting to ${url}`);
    this.state = CONNECTION_STATES.connecting;
    this.emit(CONNECTION_EVENTS.connecting);
    this._current = request
      .post(url);
    this._current = this._queryData(this._current);
    return this._current
      .use(PromiseMaker)
      .promise()
      .then(this._processMessages.bind(this));
  }

  //_startConnection() {
  //  this._current = request
  //    .post(this._url + '/start');
  //  this._current = this._queryData(this._current);
  //  return this._current
  //    .use(PromiseMaker)
  //    .promise();
  //}

  /**
   * Initiates a poll to th' ship 'n hold th' poll open 'til th' ship be able to send new information.
   * @returns {Promise} That resolves if th' client must reconnect due to bad connection.
   * Else, th' method be called recursively after it recieves new information from th' ship.
   * @emits reconnected
   * @function
   * @private
   */
  _poll() {
    const poll = () => {
      const {messageId, groupsToken, shouldReconnect} = this._lastMessages;
      this._current = request
        .post(this._url + '/poll');
      this._current = this._queryData(this._current);
      if(groupsToken) {
        this._current = this._current
          .send({messageId, groupsToken});
      } else {
        this._current = this._current
          .send({messageId});
      }
      this._current = this._current
        .end((err, res) => {
          if(err && shouldReconnect) {
            return this._reconnectTimeoutId = setTimeout(this._reconnect(), Math.min(1000 * (Math.pow(2, this._reconnectTries) - 1), this._maxReconnectedTimeout))
              .then(this._poll);
          }
          if(res) {
            if(this.state === CONNECTION_STATES.reconnecting) {
              this.state = CONNECTION_STATES.connected;
              this.emit(CONNECTION_EVENTS.reconnected);
              this._reconnectTries = 0;
            }
            if(!_.isString(res.body)) {
              this._processMessages(res.body);
            }
          }
          if(!this._abortRequest) {
            this._poll();
          }
        });

    };
    this._currentTimeoutId = setTimeout(poll.bind(this), 250);
  }

  /**
   * Initiates th' long pollin' transport protocol fer th' current connection.
   *  @param {data} data contains th' information that th' client wishes to send to th' ship.
   *  @returns {Promise} that resolves once th' message has be sent..
   *  @function
   *  @public
   *  @extends send
   */
  send(data) {
    return request
      .post(this._url + '/send')
      .query({connectionToken: this._connectionToken})
      .query({transport: 'longPolling'})
      .send(`data=${JSON.stringify(data)}`)
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .use(PromiseMaker)
      .promise();
  }

  /**
   * Initiates a reconnection to th' ship in th' case that th' connection be too slow or be lost completely.
   *  @returns {Promise} that resolves once th' client has be successfully reconnected.
   *  @function
   *  @private
   *  @emits reconnecting
   */
  _reconnect() {
    const url = this._url + '/connect';
    this.emit(CONNECTION_EVENTS.reconnecting);
    this.state = CONNECTION_STATES.reconnecting;
    console.info(`Attempting to reconnect to ${url}`);
    this._reconnectTries++;
    this._current = request
      .post(url);
    this._current = this._queryData(this._current);

    if((Math.min(1000 * (Math.pow(2, this._reconnectTries) - 1)) >= this._maxReconnectedTimeout)) {
      this.stop();
    }
    return this._current
      .use(PromiseMaker)
      .promise()
      .then(this._processMessages.bind(this));

  }

  /**
   * Clears th' timeouts 'n stops th' connection to th' ship cleanly.
   * @returns {Promise} Resolves once the transport has successfully halted.
   * @public
   * @function
   * @extends stop
   * @emits disconnecting
   * @emits disconnected
   */
  stop() {
    clearTimeout(this._currentTimeoutId);
    clearTimeout(this._reconnectTimeoutId);
    this._abortRequest = true;
    if(this._current) {
      this._current.abort();
    }
    this.emit(CONNECTION_EVENTS.disconnecting);
    console.info(`Disconnecting from ${this._url}.`);
    this.state = CONNECTION_STATES.disconnected;
    this.emit(CONNECTION_EVENTS.disconnected);
    console.info('Successfully disconnected.');
  }
}

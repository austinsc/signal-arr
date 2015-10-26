import request from 'superagent';
import Transport from './Transport';
import PromiseMaker from '../PromiseMaker';
import {expandResponse} from '../Utilities';
import {CLIENT_STATES, CLIENT_EVENTS} from '../Constants';

function inspect(x) {
  console.dir(x);
  return x;
}

/**
 * The long polling transport protocol
 */
export default class LongPollingTransport extends Transport {
  static supportsKeepAlive = false;

  constructor(connection) {
    super('longPolling', connection);
  }

  /**
   * Initiates th' long pollin' transport protocol fer th' current connection.
   * @returns {Promise} That resolves once th' long pollin' transport has started successfully 'n has begun pollin'.
   */
  start() {
    if(this._pollTimeoutId) {
      throw new Error('A polling session has already been initialized. Call `stop()` before attempting to `start()` again.');
    }
    this._logger.info(`*${this.constructor.name}* starting...`);
    this.connection._reconnectTries = 0;
    this.connection._reconnectTimeoutId = null;
    return this._connect()
      //.then(this._startConnection.bind(this))
      .then(() => this.connection._client.state = CLIENT_STATES.connected)
      .then(this._poll.bind(this));
  }

  /**
   * Initiates th' long pollin' transport protocol fer th' current connection.
   * @returns {Promise} that resolves once th' long pollin' transport has started successfully 'n has begun pollin'.
   */
  _connect() {
    const url = this.connection._client.config.url + '/connect';
    this._logger.info(`Connecting to ${url}`);
    this._current = request
      .post(url)
      .query({clientProtocol: 1.5})
      .query({connectionToken: this.connection._connectionToken})
      .query({transport: 'longPolling'})
      .query({connectionData: this.connection._data || ''});
    return this._current
      .use(PromiseMaker)
      .promise()
      .then(this.connection._processMessages.bind(this.connection));
  }

  _startConnection() {
    this._current = request
      .post(this.connection._client.config.url + '/start')
      .query({clientProtocol: 1.5})
      .query({connectionToken: this.connection._connectionToken})
      .query({transport: 'longPolling'})
      .query({connectionData: this.connection._data || ''});

    return this._current
      .use(PromiseMaker)
      .promise();
  }

  /**
   * Initiates a poll to th' ship 'n hold th' poll open 'til th' ship be able to send new information.
   * @returns {Promise} That resolves if th' client must reconnect due to bad connection.
   * Else, th' method be called recursively after it recieves new information from th' ship.
   */
  _poll() {
    this._currentTimeoutId = setTimeout(() => {
      const {messageId, groupsToken, shouldReconnect} = this.connection._lastMessages;
      this._current = request
        .post(this.connection._client.config.url + '/poll')
        .query({clientProtocol: 1.5})
        .query({connectionToken: this.connection._connectionToken})
        .query({transport: 'longPolling'})
        .query({connectionData: this.connection._data || ''});
      if(groupsToken) {
        this._current = this._current
          .send({messageId, groupsToken});
      } else {
        this._current = this._current
          .send({messageId});
      }
      this._current = this._current
        .end((err, res) => {
          if(err && shouldReconnect){
            return this._reconnect()
              .then(this._poll)
          }
          if(res) {
            if(this.connection._client.state === CLIENT_STATES.reconnecting){
              this.connection._client.state = CLIENT_STATES.connected;
              this.connection._client.emit(CLIENT_EVENTS.onReconnected);
            }
            this.connection._processMessages(res.body);
          }
          this._poll();
        });
    }, 250);
  }

  /**
   * Initiates th' long pollin' transport protocol fer th' current connection.
   *  @params {data} data contains th' information that th' client wishes to send to th' ship.
   *  @returns {Promise} that resolves once th' message has be sent..
   */
  _send(data) {
    return request
      .post(this.connection._client.config.url + '/send')
      .query({connectionToken: this.connection._connectionToken})
      .query({transport: 'longPolling'})
      .send(`data=${JSON.stringify(data)}`)
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .use(PromiseMaker)
      .promise();
  }

  /**
   * Initiates a reconnection to th' ship in th' case that th' connection be too slow or be lost completely.
   *  @returns {Promise} that resolves once th' client has be successfully reconnected.
   */
  _reconnect() {
    const url = this.connection._client.config.url + '/connect';
    this.connection.client.emit(CLIENT_EVENTS.onReconnecting);
    this.connection.client.state = CLIENT_STATES.reconnecting;
    this._logger.info(`Attempting to reconnect to ${url}`);
    this.connection._reconnectTries++;
    this._current = request
      .post(url)
      .query({clientProtocol: 1.5})
      .query({connectionToken: this.connection._connectionToken})
      .query({transport: 'longPolling'})
      .query({connectionData: this.connection._data || ''});
    return this._current
      .use(PromiseMaker)
      .promise()
      .then(this.connection._processMessages.bind(this.connection));
  }

  stop() {
    window.clearTimeout(this._currentTimeoutId);
    this.connection._client.emit(CLIENT_EVENTS.onDisconnecting);
    this._logger.info(`Disconnecting from ${this.connection._client.config.url}.`);
    this.connection.transport = null;
    delete this.connection.messageId;
    delete this.connection._connectionToken;
    delete this.connection._lastActiveAt;
    delete this.connection._lastMessageAt;
    delete this.connection._lastMessages;
    delete this.connection.config;
    this.connection._client.state = CLIENT_STATES.disconnected;
    this.connection._client.emit(CLIENT_EVENTS.onDisconnected);
    this._logger.info('Successfully disconnected.');
  }
}

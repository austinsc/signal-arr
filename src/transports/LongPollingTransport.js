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
   * Initiates the long polling transport protocol for the current connection.
   * @returns {Promise} that resolves once the long polling transport has started successfully and has begun polling.
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
   * Initiates the long polling transport protocol for the current connection.
   * @returns {Promise} that resolves once the long polling transport has started successfully and has begun polling.
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

  /**
   * Initiates the long polling transport protocol for the current connection.
   * @returns {Promise} that resolves once the long polling transport has started successfully and has begun polling.
   */
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
   * Initiates a poll to the server and hold the poll open until the server is able to send new information.
   * @returns {Promise} that resolves if the client must reconnect due to bad connection.
   *                    Else, the method is called recursively after it recieves new information from the server.
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
   * Initiates the long polling transport protocol for the current connection.
   *  @params {data} data contains the information that the client wishes to send to the server.
   *  @returns {Promise} that resolves once the message has been sent.
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
   * Initiates a reconnection to the server in the case that the connection is too slow or has been lost completely.
   *  @returns {Promise} that resolves once the client has been successfully reconnected.
   */
  _reconnect() {
    const url = this.connection._client.config.url + '/connect';
    this.connection.client.emit(CLIENT_EVENTS.onReconnecting);
    this.connection.client.state = CLIENT_STATES.reconnecting;
    this._logger.info(`Attempting to reconnect to ${url}`);
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
}

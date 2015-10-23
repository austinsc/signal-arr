import request from 'superagent';
import Transport from './Transport';
import PromiseMaker from '../PromiseMaker';
import {expandResponse} from '../Utilities';
import {CLIENT_STATES, CLIENT_EVENTS} from '../Constants';

function inspect(x) {
  console.dir(x);
  return x;
}

export default class LongPollingTransport extends Transport {
  static supportsKeepAlive = false;

  constructor(connection) {
    super('longPolling', connection);
  }

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

import {expect} from 'chai';
import Client, {CLIENT_CONFIG_DEFAULTS} from '../src/Client';
import {CLIENT_STATES} from '../src/Constants';

const URL = 'http://signalr.pwnt.co:1984/raw-connection';
const PROTOCOL_VERSION = '1.5';
const QUERY_STRING = {
  'access_token': 'xxxxxxxxxxxxxxxxxxxxx'
};

describe('Client', function() {
  it('Initializes with the default configuration', function() {
    const client = new Client();
    expect(client._config).to.be.deep.equal(CLIENT_CONFIG_DEFAULTS);
  });

  it('Negotiates the connection', function(done) {
    const client = new Client({
      url: URL,
      protocolVersion: PROTOCOL_VERSION
    });
    client.qs = QUERY_STRING;
    client._negotiate()
      .then(connection => {
        expect(connection).to.not.be.empty;
        expect(connection.ConnectionId).to.be.a('string');
        done();
      }, err => {
        console.log(err);
      });
  });

  it('Starts', function(done) {
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;
    client.start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.started);
        done();
      });
  });

  it('Starts with a query string', function(done) {
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;

    client.start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.started);
        done();
      });
  });

  it('Stops', function(done) {
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;
    client.start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.started);
        client.stop();
        setTimeout(() => {
          expect(client.state).to.be.equal(CLIENT_STATES.stopped);
          done();
        }, 100);
      });
  });
  it('Can handle events: Starting and Started', function(done) {
    let starting = false;
    let started = false;
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;
    client.starting(() => {
      starting = true;
    });
    client.started(() => {
      started = true;
    });
    client.start()
      .then(() => {
        expect(starting).to.be.equal(true);
        expect(started).to.be.equal(true);
        done();
      });
  });
  it('Can handle events: Stopping and Stopped', function(done) {
    let stopping = false;
    let stopped = false;
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;
    client.stopping(() => {
      stopping = true;
    });
    client.stopped(() => {
      stopped = true;
    });
    client.start()
      .then(client => {
        client.stop();
        setTimeout(() => {
          expect(stopping).to.be.equal(true);
          expect(stopped).to.be.equal(true);
          done();
        }, 100);
      });
  });
  it('Can handle events: onStateChanging and onStateChanged', function(done) {
    let stateChanging = false;
    let stateChanged = false;
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;
    client.stateChanging(() => {
      stateChanging = true;
    });
    client.stateChanged(() => {
      stateChanged = true;
    });
    client.start()
      .then(() => {
        expect(stateChanging).to.be.equal(true);
        expect(stateChanged).to.be.equal(true);
        done();
      });
  });
  it('Can handle events: onReceiving and onReceived', function(done) {
    let received = false;
    let receiving = false;
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;
    client.receiving(() => {
      receiving = true;
    });
    client.received(() => {
      received = true;
    });
    client.start()
      .then(() => {
        client.send({type: 1, value: 'Jack Sparrow!'});
        setTimeout(() => {
          expect(receiving).to.be.equal(true);
          expect(received).to.be.equal(true);
          done();
        }, 500);
      });
  });
});


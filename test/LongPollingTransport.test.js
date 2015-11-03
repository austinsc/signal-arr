import {expect} from 'chai';
import Client from '../src/Client';
import Transport from '../src/transports/Transport';
import {CONNECTION_STATES} from '../src/Constants';

function createClient() {
  return new Client({url: 'http://signalr.pwnt.co:1984/raw-connection', transport: 'LongPollingTransport'});
}

function writeFakeTreaty() {
  const treaty = {
    connectionToken : '',
    connectionId : 7110,
    keepAliveData : {
      monitor: false,
      activated: !!1000,
      timeout: 100000,
      timeoutWarning: (100000 * 1000) * (2 / 3),
      transportNotified: false
    },
    disconnectTimeout: 20000,
    connectionTimeout: 20000,
    tryWebSockets: false,
    protocolVersion: 1.5,
    transportConnectTimeout: 10000,
    longPollDelay: 5000,
    pollTimeout: 20000 * 1000 + 10000,
    reconnectWindow: (100000 + 20000) * 1000,
    beatInterval: (100000 - (100000 * 1000) * (2 / 3)) / 3
  };
  return treaty;
}

describe('LongPollingTransport', function() {
  this.timeout(15000);

  it('Can connect to the server', function(done) {
    createClient()
      .start()
      .then(client => {
        //debugger;
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        done();
      });
  });

  it('Sends the test message', function(done) {
    createClient()
      .start()
      .then(client => {
        client.send({type: 1, value: 'Jack Sparrow!'});
        done();
      });
  });

  it('Can process recieved message', function() {
    const transport = new Transport('longPolling', createClient(), writeFakeTreaty());
    const testMessage = {
      C: 25,
      M: {type: 1, value: 'Arrrg me mateys!'},
      S: true,
      T: false,
      L: 1000,
      G: 'help'
    };

    transport._processMessages(testMessage);
    expect(transport._lastMessages).to.have.length(1);
  });

  it('Has a valid GroupsToken', function(done) {
    createClient()
      .start()
      .then(client => {
        client.send({type: 4, value: 'Black Beards Crew'});
        done();
      });
  });

  it('Successfully disconnected from server', function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        setTimeout(() => {
          client.stop();
          expect(client._transport.state).to.be.equal(CONNECTION_STATES.disconnected);
          setTimeout(() => done(), 1000);
        }, 500);
      });
  });
});


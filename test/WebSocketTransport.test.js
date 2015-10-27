import {expect} from 'chai';
import Client, {CLIENT_CONFIG_DEFAULTS} from '../src/Client';
import Connection from '../src/Connection';
import {CLIENT_STATES, CLIENT_EVENTS} from '../src/Constants';

describe('WebSocketTransport', function() {
  this.timeout(15000);

  it('Initiates WebSocket connection successfully', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client.start()
      .then(client => {
        expect(client.connection.transport.name).to.be.equal('webSockets');
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        done();
      })
      .catch(err => {
        console.error('ERROR', err);
        expect(true).to.be.equal(false);
        done();
      });
  });

  it('Closes a WebSocket connection sucessfully.', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client.start()
      .then(client => {
        console.log(`Connection state after initiating connection: ${client.connection.state}`);
        expect(client.connection.state).to.be.equal(CLIENT_STATES.connected);
        setTimeout(() => {
          client.connection.transport.stop();
          expect(client.state).to.be.equal(CLIENT_STATES.disconnected);
          console.log(`State of client after disconnection: ${client.state}`);
          setTimeout(() => done(), 1000);
        }, 500);
      })
      .catch(err => {
        console.error('ERROR', err);
        expect(true).to.be.equal(false);
        done();
      })
  })
});
import {expect} from 'chai';
import Client from '../src/Client';
import {CLIENT_STATES} from '../src/Constants';

function createClient() {
  return new Client({url: 'http://signalr.pwnt.co:1984/raw-connection', transport: 'WebSocketTransport'});
}

describe('WebSocketTransport', function() {
  this.timeout(15000);

  it('Starts a WebSocket connection successfully', !process.env.CI ? function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client._connection._transport.name).to.be.equal('webSockets');
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        done();
        return client;
      });
  } : null);

  it('Closes a WebSocket connection sucessfully.', !process.env.CI ? function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        setTimeout(() => {
          client.stop();
          setTimeout(() => {
            expect(client.state).to.be.equal(CLIENT_STATES.disconnected);
            done();
          }, 50);
        }, 50);
      });

  } : null);

  it('Can successfully send messages to the server.', !process.env.CI ? function(done) {
    createClient().start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        setTimeout(() => {
          client._connection._transport._send({type: 1, value: 'Jack Sparrow!'});
          done();
        }, 1000);
      });
  } : null);

  it('Handles an unexpected disconnect and reconnects sucessfully.', !process.env.CI ? function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        setTimeout(() => {
          client._connection._transport._intentionallyClosed = false;
          client._connection._transport._socket.close();
          setTimeout(() => {
            expect(client.state).to.be.equal(CLIENT_STATES.connected);
            done();
          }, 150);
        }, 50);
      });
  } : null);
});
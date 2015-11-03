import {expect} from 'chai';
import Client from '../src/Client';
import {CONNECTION_STATES} from '../src/Constants';

function createClient() {
  return new Client({url: 'http://signalr.pwnt.co:1984/raw-connection', transport: 'WebSocketTransport'});
}

describe('WebSocketTransport', function() {
  this.timeout(15000);

  it('Starts a WebSocket connection successfully', !process.env.CI ? function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client._transport.name).to.be.equal('webSockets');
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        done();
        return client;
      });
  } : null);

  it('Closes a WebSocket connection sucessfully.', !process.env.CI ? function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        setTimeout(() => {
          client.stop();
          setTimeout(() => {
            expect(client._transport.state).to.be.equal(CONNECTION_STATES.disconnected);
            done();
          }, 100);
        }, 100);
      });

  } : null);

  it('Can successfully send messages to the server.', !process.env.CI ? function(done) {
    createClient().start()
      .then(client => {
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        setTimeout(() => {
          client.send({type: 1, value: 'Jack Sparrow!'});
          done();
        }, 1000);
      });
  } : null);

  it('Handles an unexpected disconnect and reconnects sucessfully.', !process.env.CI ? function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        setTimeout(() => {
          client._transport._intentionallyClosed = false;
          client._transport._socket.close();
          setTimeout(() => {
            expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
            done();
          }, 100);
        }, 50);
      });
  } : null);
});
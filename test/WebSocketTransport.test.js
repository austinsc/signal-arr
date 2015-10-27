import {expect} from 'chai';
import Client from '../src/Client';
import {CLIENT_STATES} from '../src/Constants';

function createClient() {
  return new Client({url: 'http://signalr.pwnt.co:1984/raw-connection', transport: 'WebSocketTransport'});
}

describe('WebSocketTransport', function() {
  this.timeout(15000);

  it('Starts a WebSocket connection successfully', function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client._connection.transport.name).to.be.equal('webSockets');
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        done();
        return client;
      });
  });

  it('Closes a WebSocket connection sucessfully.', function(done) {
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

  });

  it('Can successfully send messages to the server.', function(done) {
    createClient().start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        setTimeout(() => {
          client._connection.transport._send({type: 1, value: 'Jack Sparrow!'});
          done();
        }, 1000);
      });
  });
});
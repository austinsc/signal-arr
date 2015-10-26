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
        console.log(client.connection._lastMessages);
      })
      .then(() => done())
      .catch(err => {
        console.error('ERROR', err);
        expect(true).to.be.equal(false);
        done();
      });
  });
});
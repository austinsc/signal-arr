import {expect} from 'chai';
import Client from '../src/Client';
import Transport from '../src/transports/Transport';
import {CLIENT_STATES} from '../src/Constants';

function createClient() {
  return new Client({url: 'http://signalr.pwnt.co:1984/raw-connection', transport: 'ServerSentEventsTransport'});
}

describe('ServerSentEventsTransport', function() {
  this.timeout(15000);

  it('Can connect to the server', function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        done();
      });
  });
  it('Closes a ServerSentEvents connection sucessfully.', function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        setTimeout(() => {
          client.stop();
          expect(client.state).to.be.equal(CLIENT_STATES.disconnected);
          done();
        }, 50);
      });
  });
});
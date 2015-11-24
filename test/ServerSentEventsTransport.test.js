import {expect} from 'chai';
import Client from '../src/Client';
import {CONNECTION_STATES} from '../src/Constants';

function createClient() {
  return new Client({url: 'http://signalr.pwnt.co:1984/raw-connection', transport: 'ServerSentEventsTransport'});
}

describe('ServerSentEventsTransport', function() {
  this.timeout(15000);

  it('Can connect to the server', function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        done();
      });
  });
  it('Closes a ServerSentEvents connection sucessfully.', function(done) {
    createClient()
      .start()
      .then(client => {
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        setTimeout(() => {
          client.stop();
          expect(client._transport.state).to.be.equal(CONNECTION_STATES.disconnected);
          done();
        }, 50);
      });
  });
  it('Can successfully send messages to the server.', function(done) {
    createClient().start()
      .then(client => {
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        setTimeout(() => {
          client.send({type: 1, value: 'Yarg fer ServerSentMevents!'});
          done();
        }, 1000);
      });
  });
  it('Can successfullly reconnect after a keepAliveTimeout.', function(done){
    createClient()
      .start()
      .then(client => {
        expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
        setTimeout(() => {
          client._transport._keepAliveTimeoutDisconnect();
          setTimeout(() => {
            expect(client._transport.state).to.be.equal(CONNECTION_STATES.connected);
            done();
          }, 500);
        }, 50);
      });
  });
});
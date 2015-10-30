import {expect} from 'chai';
import Client from '../src/Client';
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
  it('Can successfully send messages to the server.', function(done) {
    createClient().start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        setTimeout(() => {
          client._transport._send({type: 1, value: 'Yarg fer ServerSentMevents!'});
          done();
        }, 1000);
      });
  });
  it('Can successfullly reconnect after a keepAliveTimeout.', function(done){
    createClient()
      .start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
        setTimeout(() => {
          client._transport._keepAliveTimeoutDisconnect();
          setTimeout(() => {
            expect(client.state).to.be.equal(CLIENT_STATES.connected);
            done();
          }, 100);
        }, 50);
      });
  });
});
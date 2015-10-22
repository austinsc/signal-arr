import {expect} from 'chai';
import Client, {CLIENT_CONFIG_DEFAULTS} from '../src/Client';

describe('LongPollingTransport', function() {
  this.timeout(15000);
  it('Sends the test message', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client.start()
      .then(client => client.connection.transport._send({type: 1, value: 'poopypants'}))
      .then(() => done())
      .catch(err => {
        console.error('ERRROROROROROR', err);
        expect(true).to.be.equal(false);
        done();
      });
  });
});

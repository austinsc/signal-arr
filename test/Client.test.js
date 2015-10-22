//import {describe, it} from 'mocha';
import {expect} from 'chai';
import Client, {CLIENT_CONFIG_DEFAULTS} from '../src/Client';
import {STATES} from '../src/Constants';

describe('Client', function() {
  this.timeout(15000);

  it('Initializes with the default configuration', function() {
    const client = new Client();
    expect(client.config).to.be.deep.equal(CLIENT_CONFIG_DEFAULTS);
  });

  it('Negotiates the connection', function(done) {
    const client = new Client({url: 'http://localhost:5004/signalr'});
    client._negotiate()
      .then(connection => {
        expect(connection).to.not.be.empty;
        done();
      })
      .catch(err => {
        console.error('ERRROROROROROR');
        expect(true).to.be.equal(false);
      });
  });

  it('Connects', function(done) {
    const client = new Client({url: 'http://localhost:5004/signalr'});
    client._negotiate()
      .then(connection => connection._findTransport())
      .then(() => done())
      .catch(err => {
        console.error('ERRROROROROROR', err);
        expect(true).to.be.equal(false);
        done();
      });
  });
});

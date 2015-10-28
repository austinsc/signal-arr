import {expect} from 'chai';
import Client, {CLIENT_CONFIG_DEFAULTS} from '../src/Client';

describe('Client', function() {
  it('Initializes with the default configuration', function() {
    const client = new Client();
    expect(client.config).to.be.deep.equal(CLIENT_CONFIG_DEFAULTS);
  });

  it('Negotiates the connection', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client._negotiate()
      .then(connection => {
        expect(connection).to.not.be.empty;
        done();
      });
  });

  it('Connects', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client._negotiate()
      .then(connection => connection._findTransport())
      .then(() => done());
  });
});

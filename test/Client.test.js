import {expect} from 'chai';
import Client, {CLIENT_CONFIG_DEFAULTS} from '../src/Client';
import {CLIENT_STATES} from '../src/Constants';

describe('Client', function() {
  it('Initializes with the default configuration', function() {
    const client = new Client();
    expect(client._config).to.be.deep.equal(CLIENT_CONFIG_DEFAULTS);
  });

  it('Negotiates the connection', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client._negotiate()
      .then(connection => {
        expect(connection).to.not.be.empty;
        done();
      });
  });

  it('Starts', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client.start()
      .then(client => {
        expect(client.state).to.be.equal(CLIENT_STATES.started);
        done();
      });
  });
});


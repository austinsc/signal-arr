//import {describe, it} from 'mocha';
import {expect} from 'chai';
import Client from '../src/Client';
import {CONNECTION_STATES} from '../src/Constants';

const URL = 'http://signalr.pwnt.co:1984/raw-connection';
const PROTOCOL_VERSION = '1.5';
const QUERY_STRING = {
  'access_token': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
};

describe('Connection', function() {
  this.timeout(15000);

  it('Initializes with the default configuration', () => {
    const client = new Client();
    expect(client).is.not.empty;
  });
  it('Can handle events: Connecting and Connected.', function(done) {
    let connecting = false;
    let connected = false;
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;
    client.connecting(() => {
      connecting = true;
    });
    client.connected(() => {
      connected = true;
    });
    client.start()
      .then(() => {
        expect(connecting).to.be.equal(true);
        expect(connected).to.be.equal(true);
        done();
      });
  });
  it('Can handle events: Disconnecting and Disconnected.', function(done) {
    let disconnecting = false;
    let disconnected = false;
    const client = new Client({url: URL, protocolVersion: PROTOCOL_VERSION});
    client.qs = QUERY_STRING;
    client.disconnecting(() => {
      disconnecting = true;
    });
    client.disconnected(() => {
      disconnected = true;
    });
    client.start()
      .then(client => {
        client.stop();
        setTimeout(() => {
          expect(disconnecting).to.be.equal(true);
          expect(disconnected).to.be.equal(true);
          done();
        }, 100);
      });
  });
  //it('Can handle events: Reconnecting and Reconnected', function(done) {
  //  let reconnecting = false;
  //  let reconnected = false;
  //  const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
  //  client.reconnecting(() => {
  //    reconnecting = true;
  //  });
  //  client.reconnected(() => {
  //    reconnected = true;
  //  });
  //  client.start()
  //    .then(client => {
  //      setTimeout(() => {
  //        client._transport._intentionallyClosed = false;
  //        client._transport._socket.close();
  //        setTimeout(() => {
  //          expect(reconnecting).to.be.equal(true);
  //          expect(reconnected).to.be.equal(true);
  //          done();
  //        }, 100);
  //      }, 50);
  //    });
  //});
});

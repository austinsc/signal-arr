import {expect} from 'chai';
import Client, {CLIENT_CONFIG_DEFAULTS} from '../src/Client';
import Connection from '../src/Connection';
import {CLIENT_STATES, CLIENT_EVENTS} from '../src/Constants';

describe('LongPollingTransport', function() {
  this.timeout(15000);
  it('Sends the test message', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client.start()
      .then(client => client.connection.transport._send({type: 1, value: 'Jack Sparrow!'}))
      .then(() => done())
      .catch(err => {
        console.error('ERROR', err);
        expect(true).to.be.equal(false);
        done();
      });
  });
  it('Can process recieved message', function() {
    const client = new Client();
    const connection = new Connection(client);
    let testMessage = {
      C: 25,
      M: {type: 1, value: 'poopypants'},
      S: true,
      T: false,
      L: 1000,
      G: 'help'
    };

    connection._processMessages(testMessage);
    expect(connection._lastMessages).to.have.length(1);
    console.log(connection._lastMessages);
  });
  it('Can poll from server', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client.start()
      .then(client => {
        expect(client.connection.transport._current).to.not.be.empty
        expect(client.connection._lastMessages).to.not.be.empty
        console.log(client.connection._lastMessages);
      })
      .then(() => done())
      .catch(err => {
        console.error('ERROR', err);
        expect(true).to.be.equal(false);
        done();
      })
  });
  it('Has a valid GroupsToken', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client.start()
      .then(client => client.connection.transport._send({type: 4, value: 'Black Beards Crew'}))
      .then(() => done())
      .catch(err => {
        console.error('ERROR', err);
        expect(true).to.be.equal(false);
        done();
      })
  });
  it('Successfully set connection state', function(done) {
    const client = new Client({url: 'http://signalr.pwnt.co:1984/raw-connection'});
    client.start()
      .then(client => {
        console.log(`State of client after connection ${client.state}`);
        expect(client.state).to.be.equal(CLIENT_STATES.connected);
      })
      .then(()=> done());
  })
});

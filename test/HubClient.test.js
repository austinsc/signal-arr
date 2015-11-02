import {expect} from 'chai';
import HubClient from '../src/HubClient';

function createHubClient() {
  return new HubClient({url: 'http://signalr.pwnt.co:1984/raw-connection', transport: 'ServerSentEventsTransport'});
}

describe('HubProxy', () => {
  it('Successfully starts a Hub Connection and generates a corresponding proxy.', function (done){
    createHubClient()
      .start()
      .then(client => {
        expect(client.proxies).to.not.be.empty;
        done();
      });
  });
});

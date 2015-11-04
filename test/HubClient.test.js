import {expect} from 'chai';
import HubClient from '../src/HubClient';

function createHubClient() {
  return new HubClient({url: 'http://signalr.pwnt.co:1984/signalr'});
}

describe('HubClient', function() {
  this.timeout(5000);

  it('Successfully starts a Hub Connection and generates a corresponding proxy.', function(done) {
    var client = createHubClient();

    client._registerHubProxies = () => {
      client.proxies.demo = client.createHubProxy('demo');
    };

    client
      .start()
      .then(client => {
        expect(client.proxies).to.not.be.empty;
        done();
      });
  });

  //it('Invokes a function defined by the client.', function(done) {
  //  var client = createHubClient();
  //
  //  client._registerHubProxies = () => {
  //    client.proxies.demo = client.createHubProxy('demo');
  //    client.proxies.demo.funcs.clientMethd = done;
  //  };
  //  client.start()
  //    .then(client => {
  //      expect(client.proxies).to.not.be.empty;
  //      client.proxies.demo.invoke('MispelledClientMethod');
  //    });
  //});

  it('Invokes a function defined by the server.', function(done) {
    var client = createHubClient();

    client._registerHubProxies = () => {
      client.proxies.demo = client.createHubProxy('demo');
      client.proxies.demo.funcs.done = done;
    };
    client
      .start()
      .then(client => {
        expect(client.proxies).to.not.be.empty;
        client.proxies.demo.invoke('InvokeDynamic', 'done');
        done();
      });
  });
});

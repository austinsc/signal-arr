import Client, {CLIENT_CONFIG_DEFAULTS} from './Client';
import {isUndefined, extend} from 'lodash';
import HubProxy from './HubProxy';
import Protocol from './Protocol';


export const HUB_CLIENT_CONFIG_DEFAULTS = {
  logger: new Logdown({prefix: 'SignalR Hub-Client'}),
  hubClient: true
};

export default class HubClient extends Client {
  constructor(options) {
    super(options);
    this._config = Object.assign({}, CLIENT_CONFIG_DEFAULTS, HUB_CLIENT_CONFIG_DEFAULTS, options || {});
    // Object to store hub proxies for this connection
    this.proxies = {};
    this.invocationCallbackId = 0;
    this.invocationCallbacks = {};

    this.connecting(function (minData) {
     let data;
      data = Protocol.expandClientHubInvocation(minData);
     //Creating the hubProxy during the connecting event.
      this.createHubProxy(data.Hub);
    });

    this.received(function(minData) {
      let data, foundProxy;
      if(!minData) {
        return;
      }
      data = Protocol.expandClientHubInvocation(minData);
      //Search proxies for message's hubProxy.
      this._logger.info(`Message received. Looking for ${data.Hub} proxy to invoke client-side method.`);
      for(let proxy in this.proxies){
        if(proxy._hubName === data.Hub) {
          this._logger.info('Hub proxy found, invoking method.');
          proxy.invoke(data.Method, data);
          foundProxy = true;
        } else {
          foundProxy = false;
        }
      }
      //Proxy not found for hub.
      if(!foundProxy){
        this._logger.error(`Proxy for ${data.Hub} not found.`);
      }
    });
  }

  createHubProxy(hubName) {
    const hubNameLower = hubName.toLowerCase();
    return proxy = this.proxies[hubNameLower] || (this.proxies[hubNameLower] = new HubProxy(this, hubNameLower));
  }

}
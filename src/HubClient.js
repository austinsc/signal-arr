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
          proxy.invoke(data.Method, data);
          foundProxy = true;
        } else {
          foundProxy = false;
        }
      }
      //Proxy not found for hub, creating one..
      if(!foundProxy){
        this._logger.info(`HubProxy for ${data.Hub} not found. Generating proxy...`);
        this.proxies[data.Hub] = createHubProxy(data.Hub);
        this.proxies[data.Hub].invoke(data.Hub, data);
      }
    });
  }

  createHubProxy(hubName) {
    const hubNameLower = hubName.toLowerCase();
    return proxy = this.proxies[hubNameLower] || (this.proxies[hubNameLower] = new HubProxy(this, hubNameLower));
  }

}
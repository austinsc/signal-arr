import Logdown from 'logdown';
import Client, {CLIENT_CONFIG_DEFAULTS} from './Client';
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

    this.starting(() => {
      this._logger.info(`Registering Hub Proxies...`);
      this._registerHubProxies();
    });

    this.received((minData) => {

      if(!minData || !minData.length) {
        return;
      }
      const data = Protocol.expandClientHubInvocation(minData);
      //Search proxies for message's hubProxy.
      this._logger.info(`Message received. Looking for ${data.Hub} proxy to invoke client-side method.`);
      const proxy = this.proxies[data.Hub];
      if(proxy) {
        this._logger.info('Hub proxy found, invoking method.');
        const func = proxy.funcs[data.Method];
        if(func) {
          func.apply(data.State, ...data.Args);
        } else {
          this._logger.info(`Client function not found for method \`${data.Method}\` on hub \`${data.Hub}\`.`);
        }

      } else {
        this._logger.error(`Proxy for ${data.Hub} not found.`);
      }
    });
  }

  createHubProxy(hubName) {
    const hubNameLower = hubName.toLowerCase();
    return this.proxies[hubNameLower] || (this.proxies[hubNameLower] = new HubProxy(this, hubNameLower));
  }




}
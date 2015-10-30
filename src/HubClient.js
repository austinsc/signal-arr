import Client, {CLIENT_CONFIG_DEFAULTS} from './Client';
import HubProxy from './HubProxy';



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
  }

  createHubProxy(hubName) {
    const hubNameLower = hubName.toLowerCase();
    return proxy = this.proxies[hubNameLower] || (this.proxies[hubNameLower] = new HubProxy(this, hubNameLower));
  }
}
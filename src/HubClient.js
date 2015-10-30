import Client from './Client';

export const HUB_CLIENT_CONFIG_DEFAULTS = {
  url: '/signalr',
  logging: false,
  logger: new Logdown({prefix: 'SignalR Hub-Client'}),
  hubClient: true,
  totalTransportConnectTimeout: 10000
};

export default class HubClient extends Client{
  constructor(options){
    super(options);
    this._config = Object.assign({}, HUB_CLIENT_CONFIG_DEFAULTS, options || {});
    // Object to store hub proxies for this connection
    this._proxies = {};
    this._invocationCallbackId = 0;
    this._invocationCallbacks = {};
  }

  _expandClientHubInvocation(compressedClientHubInvocation) {
    return {
      Hub: compressedClientHubInvocation.H,
      Method: compressedClientHubInvocation.M,
      Args: compressedClientHubInvocation.A,
      State: compressedClientHubInvocation.S
    };
  }
  createHubProxy(hubName) {
    const hubNameLower = hubName.toLowerCase();
    return proxy = this._proxies[hubNameLower] || (this._proxies[hubNameLower] = new HubProxy(this, hubNameLower));
  }
}
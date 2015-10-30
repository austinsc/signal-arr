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
  }
}
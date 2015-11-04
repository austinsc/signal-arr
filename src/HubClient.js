import request from 'superagent';
import Logdown from 'logdown';
import {CLIENT_PROTOCOL_VERSION} from './Constants';
import Client, {CLIENT_CONFIG_DEFAULTS} from './Client';
import HubProxy from './HubProxy';
import Protocol from './Protocol';
import PromiseMaker from './PromiseMaker';


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
    this.connectionData = [];

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
    this.connectionData.push({name: hubName});
    return this.proxies[hubNameLower] || (this.proxies[hubNameLower] = new HubProxy(this, hubNameLower));
  }

  start(options) {
    return super.start(options);
    // TODO: figure out why this is needed/not needed
      //.then(() => request
      //  .get(`${this._config.url}/start`)
      //  .query({clientProtocol: CLIENT_PROTOCOL_VERSION})
      //  .query({connectionData: JSON.stringify(this.connectionData)})
      //  .query({connectionToken: this._transport.connectionToken})
      //  .query({transport: this._transport.name})
      //  .use(PromiseMaker)
      //  .promise());
  }

  _negotiate() {
    return request
      .get(`${this._config.url}/negotiate`)
      .query({clientProtocol: CLIENT_PROTOCOL_VERSION})
      .query({connectionData: JSON.stringify(this.connectionData)})
      .use(PromiseMaker)
      .promise();
  }
}
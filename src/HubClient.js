import request from 'superagent';
import Logdown from 'logdown';
import {CLIENT_PROTOCOL_VERSION} from './Constants';
import Client, {CLIENT_CONFIG_DEFAULTS} from './Client';
import HubProxy from './HubProxy';
import Protocol from './Protocol';
import PromiseMaker from './PromiseMaker';
import _ from 'lodash';


export const HUB_CLIENT_CONFIG_DEFAULTS = {
  //logger: new Logdown({prefix: 'SignalR Hub-Client'}),
  hubClient: true
};
/**
 *Th' Client that be used fer Hub connections.
 * @class
 */
export default class HubClient extends Client {
  /**
   *Uses passed in configuration settin's to initialize th' HubClient. Attatches event handlers that handle client invocations sent from th' ship,
   * as well as registerin' th' proxies fer each Hub on startup.
   * @param {Object} options The initial options defined by the user to initialize the HubClient with.
   * @constructor
   */
  constructor(options) {
    super(options);
    this._config = Object.assign({}, CLIENT_CONFIG_DEFAULTS, HUB_CLIENT_CONFIG_DEFAULTS, options || {});
    // Object to store hub proxies for this connection
    this.proxies = {};
    this.invocationCallbackId = 0;
    this.invocationCallbacks = {};
    this.connectionData = [];

    this.starting(() => {
      console.info(`Registering Hub Proxies...`);
      this._registerHubProxies();
    });

    this.received((minData) => {
      if(!minData || !minData.length) {
        return;
      }
      _.each(minData, md => {
        const data = Protocol.expandClientHubInvocation(md);
        const proxy = this.proxies[data.Hub];
        if(proxy) {
          console.info(`\`${data.Hub}\` proxy found, invoking \`${data.Method}\`.`);
          const func = proxy.funcs[data.Method];
          if(func) {
            const arrrrgs = Array.prototype.join(...data.Args, ', ');
            console.info(`Invoking \`${data.Method}(${arrrrgs})\`. `);
            func(data.State, ...data.Args);
          } else {
            console.warn(`Client function not found for method \`${data.Method}\` on hub \`${data.Hub}\`.`);
          }
        } else {
          console.error(`Proxy for ${data.Hub} not found.`);
        }
      });
    });
  }

  /**
   * Creates a new hub proxy based on th' actual hub moniker.
   * @param {string} hubName The name of the hub that the proxy will be created for.
   * @returns {*|HubProxy} If th' proxy already exists, it return that individual proxy, else it creates a new one.
   * @function
   * @public
   */
  createHubProxy(hubName) {
    const hubNameLower = hubName.toLowerCase();
    this.connectionData.push({name: hubName});
    return this.proxies[hubNameLower] || (this.proxies[hubNameLower] = new HubProxy(this, hubNameLower));
  }

  /**
   * Calls th' base client's start method, initializin' th' connection. Currently unknown if extra code be needed.
   * @param {Object} options Th' configuration to start th' client wit'.
   * @returns {Promise} Returns a promise signifying that the connection has been intialized.
   * @function
   * @public
   */
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

  /**
   *Overridden negotiate method that adds connectionData to th' initial query. ConnectionData holds th' names 'o th' current connected hubs.
   * @returns {Promise} Returns the
   * @private
   * @function
   */
  _negotiate() {
    return request
      .get(`${this._config.url}/negotiate`)
      .query({clientProtocol: CLIENT_PROTOCOL_VERSION})
      .query({connectionData: JSON.stringify(this.connectionData)})
      .use(PromiseMaker)
      .promise();
  }
}

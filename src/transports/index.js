import ServerSentEventsTransport from './ServerSentEventsTransport';
import LongPollingTransport from './LongPollingTransport';
import WebSocketTransport from './WebSocketTransport';
import NullTransport from './NullTransport';

export function AvailableTransports() {
  /*
   // If jsonp with no/auto transport is specified, then set the transport to long polling
   // since that is the only transport for which jsonp really makes sense.
   // Some developers might actually choose to specify jsonp for same origin requests
   // as demonstrated by Issue #623.
   if(config.transport === 'auto' && config.jsonp === true) {
   config.transport = 'longPolling';
   }

   // If the url is protocol relative, prepend the current windows protocol to the url.
   if(this.url.indexOf('//') === 0) {
   this.url = window.location.protocol + this.url;
   _u.logger.info(`Protocol relative URL detected, normalizing it to \`${this.url}\`.`);
   }

   if(_u.isCrossDomain(this.url)) {
   this.log('Auto detected cross domain url.');

   if(config.transport === 'auto') {
   // TODO: Support XDM with foreverFrame
   config.transport = ['webSockets', 'serverSentEvents', 'longPolling'];
   }

   if(_u.isUndefined(config.withCredentials)) {
   config.withCredentials = true;
   }

   // Determine if jsonp is the only choice for negotiation, ajaxSend and ajaxAbort.
   // i.e. if the browser doesn't supports CORS
   // If it is, ignore any preference to the contrary, and switch to jsonp.
   if(!config.jsonp) {
   config.jsonp = !_u.cors;

   if(config.jsonp) {
   this.log('Using jsonp because this browser doesn\'t support CORS.');
   }
   }
   }
   */

  return [
    WebSocketTransport,
    ServerSentEventsTransport,
    LongPollingTransport,
    NullTransport
  ];
}


//function requireAll(r) { r.keys().forEach(r); }
//requireAll(require.context('./', true, /\.test\.js$/));

require('./LongPollingTransport.test.js');
require('./WebSocketTransport.test');
require('./Client.test.js');
require('./Connection.test.js');
require('./HubProxy.test.js');
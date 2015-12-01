# LongPollingTransport

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:11-184](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L11-L184 "Source code on GitHub")

Th' long pollin' transport protocol.

**Parameters**

-   `client`  
-   `treaty`  
-   `url`  

## _connect

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:62-74](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L62-L74 "Source code on GitHub")

Initiates th' long pollin' transport protocol fer th' current connection.

Returns **Promise** that resolves once th' long pollin' transport has started successfully 'n has begun pollin'.

## _poll

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:90-126](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L90-L126 "Source code on GitHub")

Initiates a poll to th' ship 'n hold th' poll open 'til th' ship be able to send new information.

Returns **Promise** That resolves if th' client must reconnect due to bad connection.
Else, th' method be called recursively after it recieves new information from th' ship.

## _queryData

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:30-36](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L30-L36 "Source code on GitHub")

Initiates th' long pollin' transport protocol fer th' current connection.

**Parameters**

-   `current`  

Returns **Promise** That resolves once th' long pollin' transport has started successfully 'n has begun pollin'.

## _reconnect

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:148-166](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L148-L166 "Source code on GitHub")

Initiates a reconnection to th' ship in th' case that th' connection be too slow or be lost completely.

Returns **Promise** that resolves once th' client has be successfully reconnected.

## constructor

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:20-24](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L20-L24 "Source code on GitHub")

Uses th' current client, treaty from th' initial negotiation, 'n target URL to construct a new Longpollin' transport.

**Parameters**

-   `client`  
-   `treaty`  
-   `url`  

## send

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:133-142](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L133-L142 "Source code on GitHub")

Initiates th' long pollin' transport protocol fer th' current connection.

**Parameters**

-   `data`  

Returns **Promise** that resolves once th' message has be sent..

## start

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:42-56](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L42-L56 "Source code on GitHub")

Initiates th' connection after th' LongPollin'Transport transport type be declared via th' initial negotiation.

Returns **Promise&lt;T&gt;** 

## stop

[C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js:171-183](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\LongPollingTransport.js#L171-L183 "Source code on GitHub")

Clears th' timeouts 'n stops th' connection to th' ship cleanly.

# Client

[C:\Users\saustin\Code\signal-arr\src\Client.js:21-296](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L21-L296 "Source code on GitHub")

The public API for managing communications with a SignalR server

**Parameters**

-   `options`  

## _negotiate

[C:\Users\saustin\Code\signal-arr\src\Client.js:259-265](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L259-L265 "Source code on GitHub")

Negotiates th' request to th' ship 'n returns th' consequental promise that be created as a result.

Returns **Any** 

## connected

[C:\Users\saustin\Code\signal-arr\src\Client.js:241-243](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L241-L243 "Source code on GitHub")

A connection event listener that is listening for a 'onConnected' event.
Event is emitted if the connection to the server was successfully established.

**Parameters**

-   `callback`  

## connecting

[C:\Users\saustin\Code\signal-arr\src\Client.js:232-234](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L232-L234 "Source code on GitHub")

A connection event listener that is listening for a 'onConnecting' event.
Event is emitted if the user has used the client to try and negotiate a connection to a server.

**Parameters**

-   `callback`  

## connectionSlow

[C:\Users\saustin\Code\signal-arr\src\Client.js:250-252](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L250-L252 "Source code on GitHub")

A connection event listener that is listeing for a 'onConnectionSlow' event.
Currently not implemented.

**Parameters**

-   `callback`  

## constructor

[C:\Users\saustin\Code\signal-arr\src\Client.js:27-35](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L27-L35 "Source code on GitHub")

Initializes th' client object wit' userdefined options. Options can include a multitude 'o properties, includin' th' ship URL,
a set transport protocol th' user wishes to use, a hub client, th' timeout to use when connection, 'n loggin' mechanisms.

**Parameters**

-   `options`  

## disconnected

[C:\Users\saustin\Code\signal-arr\src\Client.js:205-207](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L205-L207 "Source code on GitHub")

A connection event handler that is listening for a 'onDisconnected' event.
Event is emitted once the connection has been completely haulted by the uesr, or has been lost unexpectedly.

**Parameters**

-   `callback`  

## disconnecting

[C:\Users\saustin\Code\signal-arr\src\Client.js:196-198](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L196-L198 "Source code on GitHub")

A connection event handler that is listening for a 'onDisconnecting' event.
Event is emitted once the connection is in the process of stopping, initiated by the user, or automatically if the connection is lost unexpectedly.

**Parameters**

-   `callback`  

## error

[C:\Users\saustin\Code\signal-arr\src\Client.js:115-117](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L115-L117 "Source code on GitHub")

A connnection and client event handler that is listening for an 'onError' event.
Event is emitted when an error is thrown.

**Parameters**

-   `callback`  Contains the error message. 

## received

[C:\Users\saustin\Code\signal-arr\src\Client.js:169-171](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L169-L171 "Source code on GitHub")

A connection and client event handler that is listening for a 'onReceived' event.
Event is emitted whenever a message is received by the client from the server. (Message is decompressed by client, making it more managable).

**Parameters**

-   `callback`  Contains the received decompressed message data.

## receiving

[C:\Users\saustin\Code\signal-arr\src\Client.js:160-162](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L160-L162 "Source code on GitHub")

A connection and client event handler that is listening for a 'onReceiving' event.
Event is emitted whenever a message is received by the client from the server. (Message is in compressed, raw form from server).

**Parameters**

-   `callback`  Contains the compressed message data that the client is currently receiving.

## reconnected

[C:\Users\saustin\Code\signal-arr\src\Client.js:223-225](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L223-L225 "Source code on GitHub")

A connection event handler that is listening for a 'onReconnected' event.
Event is emitted if the connection has been successfully re-established after an unexpected disconnect.

**Parameters**

-   `callback`  

## reconnecting

[C:\Users\saustin\Code\signal-arr\src\Client.js:214-216](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L214-L216 "Source code on GitHub")

A connection event handler that is listening for a 'onReconnecting' event.
Event is emitted if the connection has been lost unexpectedly and is automatically attempting to reconnect.

**Parameters**

-   `callback`  

## send

[C:\Users\saustin\Code\signal-arr\src\Client.js:104-108](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L104-L108 "Source code on GitHub")

Sends a message to th' connected ship if th' transport be valid.

**Parameters**

-   `data`  Th' message to send.

## start

[C:\Users\saustin\Code\signal-arr\src\Client.js:64-82](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L64-L82 "Source code on GitHub")

Starts th' underlyin' connection to th' ship.

**Parameters**

-   `options` **Object** contains any updated treaty values that be used to start th' connection.

Returns **Promise** that resolves once th' connection be opened successfully.

## started

[C:\Users\saustin\Code\signal-arr\src\Client.js:133-135](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L133-L135 "Source code on GitHub")

A client event handler that is listening for a 'onStarted' event.
Event is emitted once the client has secured a connection successfully.

**Parameters**

-   `callback`  

## starting

[C:\Users\saustin\Code\signal-arr\src\Client.js:124-126](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L124-L126 "Source code on GitHub")

A client event handler that is listening for a 'onStarting' event.
Event is emitted when the client begins initialization.

**Parameters**

-   `callback`  

## state

[C:\Users\saustin\Code\signal-arr\src\Client.js:41-49](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L41-L49 "Source code on GitHub")

Accessor fer th' state property 'o th' client. Sets th' state to newState 'n automatically emits th' correct events.

**Parameters**

-   `newState`  

## state

[C:\Users\saustin\Code\signal-arr\src\Client.js:55-57](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L55-L57 "Source code on GitHub")

Accessor fer th' state property 'o th' client. Returns th' current state 'o th' client.

Returns **Any** 

## stateChanged

[C:\Users\saustin\Code\signal-arr\src\Client.js:187-189](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L187-L189 "Source code on GitHub")

A connection and client event handler that is listening for a 'onStateChanged' event.
Event is emitted whenever the client's state or the connection's state has changed.

**Parameters**

-   `callback`  Contains the new state.

## stateChanging

[C:\Users\saustin\Code\signal-arr\src\Client.js:178-180](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L178-L180 "Source code on GitHub")

A connection and client event handler that is listening for a 'onStateChanging' event.
Event is emitted whenever the client's state or the connection's state is in the process of changing.

**Parameters**

-   `callback`  Contains both the old and new state.

## stop

[C:\Users\saustin\Code\signal-arr\src\Client.js:89-98](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L89-L98 "Source code on GitHub")

Stops th' connection to th' ship

Returns **Promise** that resolves once th' connection has closed successfully.

## stopped

[C:\Users\saustin\Code\signal-arr\src\Client.js:151-153](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L151-L153 "Source code on GitHub")

A client event handler that is listening for a 'onStopped' event.
Event is emitted once the client has successfully disconnected from the server.

**Parameters**

-   `callback`  

## stopping

[C:\Users\saustin\Code\signal-arr\src\Client.js:142-144](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Client.js#L142-L144 "Source code on GitHub")

A client event handler that is listening for a 'onStopping' event.
Event is emitted once the client has initiated a disconnect.

**Parameters**

-   `callback`  

# constructor

[C:\Users\saustin\Code\signal-arr\src\transports\WebSocketTransport.js:13-17](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\WebSocketTransport.js#L13-L17 "Source code on GitHub")

Uses th' current client, treaty from th' initial negotiation, 'n target URL to construct a new WebSocket transport.

**Parameters**

-   `client`  
-   `treaty`  
-   `url`  

# start

[C:\Users\saustin\Code\signal-arr\src\transports\WebSocketTransport.js:39-95](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\WebSocketTransport.js#L39-L95 "Source code on GitHub")

Initates th' WebSocket connection, as well as handles onmessage, onerror, onclose, 'n onopen events.

Returns **Promise** 

# stop

[C:\Users\saustin\Code\signal-arr\src\transports\WebSocketTransport.js:99-105](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\WebSocketTransport.js#L99-L105 "Source code on GitHub")

Cleanly disconnects from th' target ship.

# ServerSentEventsTransport

[C:\Users\saustin\Code\signal-arr\src\transports\ServerSentEventsTransport.js:11-117](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\ServerSentEventsTransport.js#L11-L117 "Source code on GitHub")

The ServerSentEvents transport protocol.

**Parameters**

-   `client`  
-   `treaty`  
-   `url`  

## constructor

[C:\Users\saustin\Code\signal-arr\src\transports\ServerSentEventsTransport.js:20-24](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\ServerSentEventsTransport.js#L20-L24 "Source code on GitHub")

Uses th' current client, treaty from th' initial negotiation, 'n target URL to construct a new ServerSentEvents transport.

**Parameters**

-   `client`  
-   `treaty`  
-   `url`  

## start

[C:\Users\saustin\Code\signal-arr\src\transports\ServerSentEventsTransport.js:30-73](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\ServerSentEventsTransport.js#L30-L73 "Source code on GitHub")

Initates th' ServerSentEvents connection, as well as handles onmessage, onerror,  'n onopen events.

Returns **Promise** 

## stop

[C:\Users\saustin\Code\signal-arr\src\transports\ServerSentEventsTransport.js:78-87](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\ServerSentEventsTransport.js#L78-L87 "Source code on GitHub")

Cleanly disconnects from th' target ship.

# _processMessages

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:111-117](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L111-L117 "Source code on GitHub")

Private method that takes a passed in compressed message (recieved from th' ship or other service), 'n decompresses it fer readability 'n use.
Messages be also pushed into a buffer 'n timestamped as well.

**Parameters**

-   `compressedResponse`  

# connectionToken

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:71-73](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L71-L73 "Source code on GitHub")

Accessor fer th' connection token 'o th' transport. Returns th' current connection token 'o th' client.

Returns **Any** 

# constructor

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:14-33](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L14-L33 "Source code on GitHub")

Initializes th' transport instance

**Parameters**

-   `name`  th' moniker 'o th' transport (must be th' same value as th' ship's correspondin' transport moniker)
-   `client` **Client** th' parent SignalR client
-   `treaty`  th' response from th' negotiate request created by th' SignalR ship

# emit

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:100-103](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L100-L103 "Source code on GitHub")

Emits an event at both th' Transport 'n Client levels without needin' to invoke both emits seperately.

**Parameters**

-   `event`  Th' event that be to be emitted.
-   `args` **...** Arguments that correspond to th' event.

# send

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:89-93](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L89-L93 "Source code on GitHub")

Sends a message to th' connected ship.

Returns **Promise** thta gunna reject due to th' method needin' to be overridden.

# start

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:39-43](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L39-L43 "Source code on GitHub")

Initiates a new transport 'n begins th' connection process.

Returns **Promise** that gunna reject due to th' method needin' to be overridden.

# state

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:49-57](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L49-L57 "Source code on GitHub")

Accessor fer th' state property 'o th' transport. Sets th' state to newState 'n automatically emits th' correct events.

**Parameters**

-   `newState`  

# state

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:63-65](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L63-L65 "Source code on GitHub")

Accessor fer th' state property 'o th' transport. Returns th' current state 'o th' client.

Returns **Any** 

# stop

[C:\Users\saustin\Code\signal-arr\src\transports\Transport.js:79-83](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\Transport.js#L79-L83 "Source code on GitHub")

Haults th' current connection 'n safely disconnects.

Returns **Promise** that gunna reject due to th' method needin' to be overridden.

# constructor

[C:\Users\saustin\Code\signal-arr\src\ConnectingMessageBuffer.js:9-13](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\ConnectingMessageBuffer.js#L9-L13 "Source code on GitHub")

Takes the client and drainCallback and creates an efficient buffer for buffering recieved messages.

**Parameters**

-   `client`  
-   `drainCallback`  

# drain

[C:\Users\saustin\Code\signal-arr\src\ConnectingMessageBuffer.js:31-38](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\ConnectingMessageBuffer.js#L31-L38 "Source code on GitHub")

Drains the current buffer and removes all messages.

# tryBuffer

[C:\Users\saustin\Code\signal-arr\src\ConnectingMessageBuffer.js:20-26](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\ConnectingMessageBuffer.js#L20-L26 "Source code on GitHub")

Attempts to add a passed in message to the buffer.

**Parameters**

-   `message`  

Returns **boolean** 

# emit

[C:\Users\saustin\Code\signal-arr\src\EventEmitter.js:44-50](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\EventEmitter.js#L44-L50 "Source code on GitHub")

Emits the passed in event to all observers.

**Parameters**

-   `event`  
-   `args` **...** 

# numberOfObservers

[C:\Users\saustin\Code\signal-arr\src\EventEmitter.js:55-57](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\EventEmitter.js#L55-L57 "Source code on GitHub")

Returns the true number of current observers.

# off

[C:\Users\saustin\Code\signal-arr\src\EventEmitter.js:23-37](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\EventEmitter.js#L23-L37 "Source code on GitHub")

Removes an event from a passed in listener.

**Parameters**

-   `event`  
-   `listener`  

# on

[C:\Users\saustin\Code\signal-arr\src\EventEmitter.js:13-16](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\EventEmitter.js#L13-L16 "Source code on GitHub")

Pushes an event to the passed in listener.

**Parameters**

-   `event`  
-   `listener`  

# NullTransport

[C:\Users\saustin\Code\signal-arr\src\transports\NullTransport.js:5-11](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\transports\NullTransport.js#L5-L11 "Source code on GitHub")

A default, empty transport.

**Parameters**

-   `client`  
-   `treaty`  

# Protocol

[C:\Users\saustin\Code\signal-arr\src\Protocol.js:5-44](https://github.com/RoviSys/signal-arr/blob/e454d3c0b97840867b69e29eb02614a62979fb9f/C:\Users\saustin\Code\signal-arr\src\Protocol.js#L5-L44 "Source code on GitHub")

A utility tavern that contains methods fer decompressin'/compressin' incomin' 'n outgoin' messages.

**Parameters**

-   `compressedClientHubInvocation`  

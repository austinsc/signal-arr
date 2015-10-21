export const CLIENT_STATES = {
  connecting: 0,
  connected: 1,
  reconnecting: 2,
  disconnected: 4
};

export const CLIENT_EVENTS = {
  onError: 'onError',
  onConnectionSlow: 'onConnectionSlow',
  onStarting: 'onStarting',
  onStarted: 'onStarted',
  onReceiving: 'onReceiving',
  onReceived: 'onReceived',
  onReconnecting: 'onReconnecting',
  onReconnected: 'onReconnected',
  onStateChanging: 'onStateChanging',
  onStateChanged: 'onStateChanged',
  onDisconnecting: 'onDisconnecting',
  onDisconnected: 'onDisconnected'
};

export const RESOURCES = {
  nojQuery: 'jQuery was not found. Please ensure jQuery is referenced before the SignalR client JavaScript file.',
  noTransportOnInit: 'No transport could be initialized successfully. Try specifying a different transport or none at all for auto initialization.',
  errorOnNegotiate: 'Error during negotiation request.',
  stoppedWhileLoading: 'The connection was stopped during page load.',
  stoppedWhileNegotiating: 'The connection was stopped during the negotiate request.',
  errorParsingNegotiateResponse: 'Error parsing negotiate response.',
  errorDuringStartRequest: 'Error during start request. Stopping the connection.',
  stoppedDuringStartRequest: 'The connection was stopped during the start request.',
  errorParsingStartResponse: 'Error parsing start response: \'{0}\'. Stopping the connection.',
  invalidStartResponse: 'Invalid start response: \'{0}\'. Stopping the connection.',
  protocolIncompatible: 'You are using a version of the client that isn\'t compatible with the server. Client version {0}, server version {1}.',
  sendFailed: 'Send failed.',
  parseFailed: 'Failed at parsing response: {0}',
  longPollFailed: 'Long polling request failed.',
  eventSourceFailedToConnect: 'EventSource failed to connect.',
  eventSourceError: 'Error raised by EventSource',
  webSocketClosed: 'WebSocket closed.',
  pingServerFailedInvalidResponse: 'Invalid ping response when pinging server: \'{0}\'.',
  pingServerFailed: 'Failed to ping server.',
  pingServerFailedStatusCode: 'Failed to ping server.  Server responded with status code {0}, stopping the connection.',
  pingServerFailedParse: 'Failed to parse ping server response, stopping the connection.',
  noConnectionTransport: 'Connection is in an invalid state, there is no transport active.',
  webSocketsInvalidState: 'The Web Socket transport is in an invalid state, transitioning into reconnecting.',
  reconnectTimeout: 'Couldn\'t reconnect within the configured timeout of {0} ms, disconnecting.',
  reconnectWindowTimeout: 'The client has been inactive since {0} and it has exceeded the inactivity timeout of {1} ms. Stopping the connection.'
};
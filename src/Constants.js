export const CLIENT_PROTOCOL_VERSION = 1.3;

/**
 * A collection of the different states a connection may be in.
 * @exports CONNECTION_STATES
 * @type {{connecting: number, connected: number, reconnecting: number, disconnected: number}}
 * @readonly
 * @public
 */
export const CONNECTION_STATES = {
  connecting: 0,
  connected: 1,
  reconnecting: 2,
  disconnected:4
};
/**
 * A collection of different states that the client may be in.
 * @exports CLIENT_STATES
 * @type {{starting: number, started: number, stopping: number, stopped: number}}
 * @readonly
 * @public
 */
export const CLIENT_STATES = {
  starting: 8,
  started: 16,
  stopping: 32,
  stopped: 64
};

/**
 * A collection of all of the currently defined events that may be fired off during different stages of a connection's lifecycle.
 * @exports CONNECTION_EVENTS
 * @type {{error: string, connectionSlow: string, connecting: string, onConnected: string, receiving: string, received: string, reconnecting: string, reconnected: string, stateChanging: string, stateChanged: string, disconnecting: string, disconnected: string}}
 * @readonly
 * @public
 */
export const CONNECTION_EVENTS = {
  error: 'error',
  connectionSlow: 'connectionSlow',
  connecting: 'connecting',
  onConnected: 'onConnected',
  receiving: 'receiving',
  received: 'received',
  reconnecting: 'reconnecting',
  reconnected: 'reconnected',
  stateChanging: 'stateChanging',
  stateChanged: 'stateChanged',
  disconnecting: 'disconnecting',
  disconnected: 'disconnected'
};
/**
 * A collection of all of the currently defined events that may be fired off during the different stages of the client's lifecycle.
 * @exports CLIENT_EVENTS
 * @type {{starting: string, started: string, stopping: string, stopped: string, error: string, stateChanging: string, stateChanged: string, receiving: string, received: string}}
 * @readonly
 * @public
 */
export const CLIENT_EVENTS = {
  starting: 'starting',
  started: 'started',
  stopping: 'stopping',
  stopped: 'stopped',
  error: 'error',
  stateChanging: 'stateChanging',
  stateChanged: 'stateChanged',
  receiving: 'receiving',
  received: 'received'
};

/**
 * A collection of different messages that may be written to the console when certain conditions are met.
 * @exports RESOURCES
 * @type {{nojQuery: string, noTransportOnInit: string, errorOnNegotiate: string, stoppedWhileLoading: string, stoppedWhileNegotiating: string, errorParsingNegotiateResponse: string, errorDuringStartRequest: string, stoppedDuringStartRequest: string, errorParsingStartResponse: string, invalidStartResponse: string, protocolIncompatible: string, sendFailed: string, parseFailed: string, longPollFailed: string, eventSourceFailedToConnect: string, eventSourceError: string, webSocketClosed: string, pingServerFailedInvalidResponse: string, pingServerFailed: string, pingServerFailedStatusCode: string, pingServerFailedParse: string, noConnectionTransport: string, webSocketsInvalidState: string, reconnectTimeout: string, reconnectWindowTimeout: string}}
 * @readonly
 * @public
 */
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
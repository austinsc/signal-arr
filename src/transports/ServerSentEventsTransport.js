import Transport from './Transport';

export default class ServerSentEventsTransport extends Transport {
  static supportsKeepAlive = true;

  constructor(client) {
    super('serverSentEvents', client);
  }
}

import Transport from './Transport';

export default class ServerSentEventsTransport extends Transport {
  static supportsKeepAlive = true;

  constructor(client, treaty) {
    super('serverSentEvents', client, treaty);
  }
}

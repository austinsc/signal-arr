import Transport from './Transport';

export default class ForeverFrameTransport extends Transport {
  static supportsKeepAlive = true;

  constructor(client) {
    super('foreverFrame', client);
  }
}

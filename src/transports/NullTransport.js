import Transport from './Transport';

export default class NullTransport extends Transport {
  static supportsKeepAlive = false;

  constructor(client, treaty) {
    super('null', client, treaty);
  }
}

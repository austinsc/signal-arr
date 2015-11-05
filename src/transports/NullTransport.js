import Transport from './Transport';
/**
 * A default, empty transport.
 */
export default class NullTransport extends Transport {
  static supportsKeepAlive = false;

  constructor(client, treaty) {
    super('null', client, treaty);
  }
}

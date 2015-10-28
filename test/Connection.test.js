//import {describe, it} from 'mocha';
import {expect} from 'chai';
import Client from '../src/Client';

describe('Connection', function() {
  this.timeout(15000);

  it('Initializes with the default configuration', () => {
    const client = new Client();
    expect(client).is.not.empty;
  });
});

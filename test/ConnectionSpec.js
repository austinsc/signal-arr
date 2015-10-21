import {describe, it} from 'mocha';
import {expect} from 'chai';
import Client from '../src/Client';
import {STATES} from '../src/Constants';

describe('Connection', function() {
  this.timeout(15000);

  it('Initializes with the default configuration', () => {
    const client = new Client();
  });
});

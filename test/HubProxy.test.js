//import {describe, it} from 'mocha';
import {expect} from 'chai';
import HubProxy from '../src/HubProxy';

describe('HubProxy', () => {
  it('Starts with no events', () => {
    const proxy = new HubProxy();
    expect(proxy.observers).to.be.empty;
  });

  it('Can register new events', () => {
    const proxy = new HubProxy();
    const callback = () => console.log('callback invoked');
    proxy.on('test', callback);
    expect(proxy.observers).to.not.be.empty;
  });

  it('Can count the number of observers', () => {
    const proxy = new HubProxy();
    expect(proxy.numberOfObservers()).to.be.equal(0);
    const callback = () => console.log('callback invoked');
    proxy.on('test1', callback);
    expect(proxy.numberOfObservers()).to.be.equal(1);
    proxy.on('test2', callback);
    expect(proxy.numberOfObservers()).to.be.equal(2);
    proxy.off('test1', callback);
    expect(proxy.numberOfObservers()).to.be.equal(1);
    proxy.off('test2', callback);
    expect(proxy.numberOfObservers()).to.be.equal(0);
  });

});

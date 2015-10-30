import Transport from './Transport';

export default class ForeverFrameTransport extends Transport {
  static supportsKeepAlive = true;

  constructor(client, treaty, url) {
    super('foreverFrame', client, treaty);
    this._url = url;
    this._frameCount= 0;
    this._connections = {};
  }
  start(){
    return new Promise((resolve, reject) => {
      if(this._frame) {
        return reject(new Error('An iFrame has already been initialized. Call `stop()` before attempting to `start()` again.'));
      }
      this._frameId = this._frameCount + 1;
      this._frame = this.createFrame();
      this._frame.setAttribute('data-signalr-connection-id', this.id);

      this._url += '&frameId=' + this._frameId;
      document.documentElement.appendChild(this._frame);
      this._logger.info('Binding to iframe\'s event.');

      this._frame.src = this._url;
    });
  }
  stop(){

  }
  _reconnect(){

  }
  createFrame(){
    let frame = document.createElement('iframe');
    frame.setAttribute('style', 'position:absolute;top:0;left:0;width:0;height:0;visibility:hidden;');
    return frame;
  }

}

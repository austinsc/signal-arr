import {isEmpty, isFunction, isUndefined, extend} from 'lodash';
import {EventEmitter} from './EventEmitter';

export class HubProxy extends EventEmitter {
  constructor(client, hubName) {
    //super();
    this._state = {};
    this._client = client;
    this._hubName = hubName;
    this._logger = this._client._logger;
  }

  /// <summary>Invokes a server hub method with the given arguments.</summary>
  /// <param name="methodName" type="String">The name of the server hub method.</param>
  invoke(methodName, ...args) {
    let data = {
      H: this._hubName,
      M: methodName,
      A: args.map(a => (isFunction(a) || isUndefined(a)) ? null : a),
      I: this._client._invocationCallbackId
    };

    const callback = minResult => {
      const result = this._maximizeHubResponse(minResult);

      // Update the hub state
      extend(this._state, result.State);

      if(result.Progress) {
        // TODO: Progress in promises?
      } else if(result.Error) {
        // Server hub method threw an exception, log it & reject the deferred
        if(result.StackTrace) {
          this._logger.error(`${result.Error}\n${result.StackTrace}.`);
        }

        // result.ErrorData is only set if a HubException was thrown
        const source = result.IsHubException ? 'HubException' : 'Exception';
        const error = new Error(result.Error);
        error.source = source;
        error.data = result.ErrorData;

        this._logger.error(`${this._hubName}.${methodName} failed to execute. Error: ${error.message}`);
        reject(error);
      } else {
        // Server invocation succeeded, resolve the deferred
        this._logger.info(`Invoked ${this._hubName}\.${methodName}`);
        return result.Result;
      }
    };

   this._client._invocationCallbacks[this._client._invocationCallbackId.toString()] = {scope: this, method: callback};
   this._client._invocationCallbackId += 1;

    if(!isEmpty(this.state)) {
      data.S = this.state;
    }

    this._logger.info(`Invoking ${this._hubName}\.${methodName}`);
    return this._client.send(data);
  }

  _maximizeHubResponse(minHubResponse) {
    return {
      State: minHubResponse.S,
      Result: minHubResponse.R,
      Progress: minHubResponse.P && {
        Id: minHubResponse.P.I,
        Data: minHubResponse.P.D
      },
      Id: minHubResponse.I,
      IsHubException: minHubResponse.H,
      Error: minHubResponse.E,
      StackTrace: minHubResponse.T,
      ErrorData: minHubResponse.D
    };
  }
}
import _ from 'lodash';
/**
 * A utility tavern that contains methods fer decompressin'/compressin' incomin' 'n outgoin' messages.
 * @class
 * @exports Protocol
 */
export default class Protocol {
  /**
   * Decompresses a message received from the server that is meant to contain information about invoking a method client-side.
   * @param compressedClientHubInvocation
   * @returns {{Hub: *, Method: (testMessage.M|{type, value}), Args: (*|string), State: (boolean|*)}}
   * @function
   * @public
   */
  static expandClientHubInvocation(compressedClientHubInvocation) {
    return {
      Hub: compressedClientHubInvocation.H,
      Method: compressedClientHubInvocation.M,
      Args: compressedClientHubInvocation.A,
      State: compressedClientHubInvocation.S
    };
  }

  /**
   * Decompresses a message received from a server hub into a more readible and workable form.
   * @param compressedServerHubResponse
   * @returns {{State: (boolean|*), Result: *, Progress: (*|{Id: *, Data: (string|D)}), Id: *, IsHubException: *, Error: (string|number), StackTrace: boolean, ErrorData: (string|D)}}
   * @function
   * @public
   */
  static expandServerHubResponse(compressedServerHubResponse) {
    return {
      State: compressedServerHubResponse.S,
      Result: compressedServerHubResponse.R,
      Progress: compressedServerHubResponse.P && {
        Id: compressedServerHubResponse.P.I,
        Data: compressedServerHubResponse.P.D
      },
      Id: compressedServerHubResponse.I,
      IsHubException: compressedServerHubResponse.H,
      Error: compressedServerHubResponse.E,
      StackTrace: compressedServerHubResponse.T,
      ErrorData: compressedServerHubResponse.D
    };
  }

  /**
   * Decompresses a response from the server to a more readible and workable form.
   * @param min
   * @returns {{messageId: (string|number), messages: (testMessage.M|{type, value}|Array), initialized: boolean, shouldReconnect: boolean, longPollDelay: number, groupsToken: string}}
   * @function
   * @public
   */
  static expandResponse(min) {
    if(_.isString(min)) {
      min = JSON.parse(min);
    }
    return {
      messageId: min.C,
      messages: min.M || [],
      initialized: !_.isUndefined(min.S),
      shouldReconnect: !_.isUndefined(min.T),
      longPollDelay: min.L,
      groupsToken: min.G
    };
  }
}
import _ from 'lodash';
/**
 * A utility tavern that contains methods fer decompressin'/compressin' incomin' 'n outgoin' messages.
 * @class
 * @exports Protocol
 */
export default class Protocol {
  /**
   * Decompresses a message received from the server that is meant to contain information about invoking a method client-side.
   * @param {Object} compressedClientHubInvocation The compressed message received from the server.
   * @returns {Object} The decompressed message from the server. Contains client-side method invocation data.
   * @function
   * @static
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
   * @param {Object} compressedServerHubResponse The compressed, raw message received from the server.
   * @returns {Object}  The decompressed message received from the server.
   * @function
   * @static
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
   * @param {Object} min The message that has been received from the server.
   * @returns {Object} The decompressed message received from the server.
   * @function
   * @static
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
import _ from 'lodash';
/**
 * A utility tavern that contains methods fer decompressin'/compressin' incomin' 'n outgoin' messages.
 */
export default class Protocol {
  static expandClientHubInvocation(compressedClientHubInvocation) {
    return {
      Hub: compressedClientHubInvocation.H,
      Method: compressedClientHubInvocation.M,
      Args: compressedClientHubInvocation.A,
      State: compressedClientHubInvocation.S
    };
  }

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
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
}
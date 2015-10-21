export function expandResponse(min) {
  return {
    messageId: min.C,
    messages: min.M,
    initialized: typeof (min.S) !== 'undefined',
    shouldReconnect: typeof (min.T) !== 'undefined',
    longPollDelay: min.L,
    groupsToken: min.G
  };
}

export default {

};
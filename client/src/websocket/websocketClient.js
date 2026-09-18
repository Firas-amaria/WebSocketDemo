// Keep the connection here so students can follow connect → send → receive in one file.
export function createWebSocketClient({ onStatus, onMessage, onError }) {
  let socket = null;
  let connectionTimer;

  function disconnect() {
    clearTimeout(connectionTimer);
    const oldSocket = socket;
    socket = null;
    oldSocket?.close();
    onStatus('disconnected');
  }

  function connect(webSocketUrl) {
    disconnect();
    let address;
    try {
      address = new URL(webSocketUrl);
      if (
        !['ws:', 'wss:'].includes(address.protocol) ||
        address.hash ||
        address.username ||
        address.password
      )
        throw new Error();
      socket = new WebSocket(address.href);
    } catch {
      onError('invalidUrl');
      return;
    }
    const currentSocket = socket;
    let opened = false;
    onStatus('connecting');
    connectionTimer = setTimeout(() => {
      if (socket !== currentSocket) return;
      disconnect();
      onError('connectFailed');
    }, 8000);

    currentSocket.onopen = () => {
      if (socket !== currentSocket) return;
      clearTimeout(connectionTimer);
      opened = true;
      currentSocket.send('BROWSER_CONNECTED');
      onStatus('connected');
    };
    currentSocket.onmessage = (event) => {
      if (socket !== currentSocket) return;
      // Server envelopes carry status; an ordinary raw string is still readable.
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        /* Plain text is welcome too. */
      }
      if (
        !message ||
        typeof message !== 'object' ||
        !['status', 'message', 'sent', 'error'].includes(message.type)
      ) {
        message = {
          type: 'message',
          message: String(event.data),
          time: new Date().toISOString(),
        };
      }
      onMessage(message, event.data);
    };
    currentSocket.onerror = () => {
      if (socket === currentSocket)
        onError(opened ? 'connectionLost' : 'connectFailed');
    };
    currentSocket.onclose = () => {
      if (socket !== currentSocket) return;
      clearTimeout(connectionTimer);
      socket = null;
      // Reconnect manually: the student can see the loss and check the server address.
      onStatus('disconnected');
      onError(opened ? 'connectionLost' : 'connectFailed');
    };
  }

  function sendMessage(message) {
    if (!message.trim() || socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(message);
    return true;
  }

  return { connect, disconnect, sendMessage };
}

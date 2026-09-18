import { WebSocket, WebSocketServer } from 'ws';

const port = Number(process.env.PORT || 8080);
const server = new WebSocketServer({ port, host: '0.0.0.0', maxPayload: 8192 });
let esp32 = null;
let lastSeen = null;

function send(socket, data) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data));
}

function broadcastStatus() {
  for (const client of server.clients) {
    if (client.role === 'browser') {
      send(client, { type: 'status', online: esp32 !== null, lastSeen });
    }
  }
}

server.on('listening', () =>
  console.log(`WebSocket server started on port ${server.address().port}`),
);
server.on('error', (error) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? 'Port is already in use. Stop the other server or change PORT.'
      : `Server error: ${error.message}`,
  );
  process.exit(1);
});

server.on('connection', (socket) => {
  socket.isAlive = true;
  socket.on('pong', () => {
    socket.isAlive = true;
  });
  socket.on('error', () =>
    console.log('A connection encountered a network error.'),
  );

  // The first text message identifies the connection. All later text is lesson content.
  socket.on('message', (data, isBinary) => {
    if (isBinary) return send(socket, { type: 'error', code: 'textOnly' });
    const text = data.toString();
    if (!socket.role) {
      if (text === 'ESP32_CONNECTED') {
        if (esp32) return socket.close(1008, 'One ESP32 is already connected');
        socket.role = 'esp32';
        esp32 = socket;
        lastSeen = new Date().toISOString();
        console.log('ESP32 connected');
        broadcastStatus();
      } else if (text === 'BROWSER_CONNECTED') {
        socket.role = 'browser';
        console.log('Browser connected');
        send(socket, { type: 'status', online: esp32 !== null, lastSeen });
      } else
        socket.close(1008, 'Send BROWSER_CONNECTED or ESP32_CONNECTED first');
      return;
    }
    if (!text.trim()) return;

    if (socket.role === 'browser') {
      if (!esp32 || esp32.readyState !== WebSocket.OPEN) {
        return send(socket, { type: 'error', code: 'deviceOffline' });
      }
      // The ESP32 receives plain text: no JSON parsing is needed in the firmware.
      esp32.send(text);
      send(socket, {
        type: 'sent',
        message: text,
        time: new Date().toISOString(),
      });
    } else {
      lastSeen = new Date().toISOString();
      // Wrap incoming device text so the browser can distinguish messages from status updates.
      for (const client of server.clients) {
        if (client.role === 'browser')
          send(client, { type: 'message', message: text, time: lastSeen });
      }
    }
  });

  socket.on('close', () => {
    if (socket === esp32) {
      esp32 = null;
      console.log('ESP32 disconnected');
      broadcastStatus();
    } else if (socket.role === 'browser') console.log('Browser disconnected');
  });
});

// Wi-Fi can disappear without a close event. Ping/pong detects these silent disconnects.
const heartbeat = setInterval(() => {
  for (const socket of server.clients) {
    if (!socket.isAlive) {
      socket.terminate();
      continue;
    }
    socket.isAlive = false;
    socket.ping();
  }
}, 15000);
server.on('close', () => clearInterval(heartbeat));

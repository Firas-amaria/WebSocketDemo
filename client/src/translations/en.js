export default {
  motto: 'CONNECT · SEND · RECEIVE',
  home: 'Home',
  classroom: 'Classroom',
  learn: 'Learn',
  language: 'Language',
  brand: 'ESP32 WebSocket Classroom',
  badge: 'A hands-on introduction',
  hero: 'Small messages.\nBig understanding.',
  subtitle:
    'Learn how your computer and ESP32 can send messages to each other in real time.',
  start: 'Start the classroom',
  how: 'Learn how it works',
  computer: 'Computer / Website',
  device: 'ESP32 touchscreen',
  network: 'Wi-Fi',
  diagramNote: 'One network. Two directions. A conversation you can see.',
  basics: 'Your first three steps',
  noExtras: 'Just your computer, ESP32, and Wi-Fi. No extra hardware needed.',
  steps: [
    [
      'Connect',
      'Bring your website and ESP32 together through a small server.',
    ],
    ['Send', 'Type a message and see it arrive on your ESP32.'],
    ['Receive', 'Send a reply from your ESP32 and watch it appear here.'],
  ],
  footer: 'Built for curiosity. Keep it simple: connect, send, receive.',
  classroomIntro: 'Make a connection. Start a conversation.',
  classroomNote:
    'Start the Node server first, then connect your website and ESP32.',
  connection: 'Connection',
  websiteStatus: 'Website → Server',
  serverUrl: 'WebSocket Server URL',
  urlHint: 'Use the local IP address of the computer running the Node server.',
  connect: 'Connect',
  disconnect: 'Disconnect',
  connected: 'Connected',
  disconnected: 'Disconnected',
  connecting: 'Connecting…',
  espStatus: 'ESP32 status',
  online: 'ESP32 connected',
  offline: 'ESP32 offline',
  unknown: 'Connect the website to check',
  lastSeen: 'Last seen',
  deviceHint: 'The ESP32 must connect to this same server and identify itself.',
  sendTitle: 'Send to ESP32',
  message: 'Message',
  placeholder: 'Hello ESP32!',
  send: 'Send message',
  sendHint: 'Plain text is all you need. Press Enter to send.',
  sent: '✓ Message relayed to ESP32',
  sentNote:
    'This confirms forwarding by the server, not that the device displayed it.',
  waiting: 'Connect the website and ESP32 to send a message.',
  messages: 'Messages',
  clear: 'Clear messages',
  empty: 'Your conversation starts here',
  emptyHint:
    'Messages sent and received will appear here with a time and direction.',
  outgoing: 'Website → ESP32',
  incoming: 'ESP32 → Website',
  logLimit: 'Latest 100 messages · stored only in this tab',
  advanced: 'Advanced · raw WebSocket messages',
  rawHint:
    'These are the latest server messages, including status updates. Normal use does not require JSON.',
  rawEmpty: 'No raw messages yet.',
  connectFailed: 'Could not connect to the WebSocket server.',
  connectionLost:
    'Connection lost. Check the server, then press Connect to reconnect.',
  invalidUrl:
    'Enter a valid WebSocket URL, for example ws://192.168.1.10:8080.',
  deviceOffline: 'ESP32 is offline. Connect it before sending.',
  textOnly: 'Please send a text message.',
  sendFailed: 'Message could not be sent. Check your connection.',
  checkConnection: [
    'Make sure the Node server is running.',
    'Check the address and port.',
    'Use the same Wi-Fi network for the computer and ESP32.',
  ],
  learnLabel: 'THE SHORT GUIDE',
  learnTitle: 'Understand the connection.',
  learnIntro:
    'No extra sensors. No complicated commands. Just a message going there and back.',
  lesson1: 'What is WebSocket?',
  lesson1Text:
    'WebSocket keeps a connection open between two devices. This allows both sides to send messages at any time.',
  lesson2: 'What are we doing?',
  lesson2Text:
    'The browser connects to a WebSocket server. The ESP32 also connects to the same server. The server passes messages between them.',
  browser: 'Browser',
  server: 'WebSocket Server',
  lesson3: 'Connect the computer',
  computerSteps: [
    'Start the WebSocket server with npm run dev in the project folder.',
    'Find the computer’s local IPv4 address. On Windows, run ipconfig and look under your Wi-Fi adapter.',
    'Enter the WebSocket URL in the classroom.',
    'Press Connect.',
  ],
  ipNote:
    'This is only an example. Your computer’s IP address may be different. localhost works for a browser on the server computer, but the ESP32 needs the computer’s local IP.',
  lesson4: 'Connect the ESP32',
  deviceIntro:
    'We use the JC3248W535EN touchscreen board. Its firmware (the program on the board) should let you enter these four settings on the screen and change Wi-Fi whenever needed. The code below only shows example values:',
  configNotes: [
    'WIFI_NAME: your Wi-Fi network name (SSID).',
    'WIFI_PASSWORD: the password for your selected Wi-Fi network.',
    'WEBSOCKET_SERVER: the computer’s local IP, without ws://.',
    'WEBSOCKET_PORT: the Node server’s port, normally 8080.',
  ],
  deviceNetwork:
    'The computer and ESP32 should normally use the same network. Connect the firmware to ws://<computer-ip>:8080 and send ESP32_CONNECTED after every connection.',
  firmwareNote:
    'The board firmware and touchscreen settings screen still need to be implemented; they are not included here. The firmware must also display incoming messages. After changing Wi-Fi, update the computer IP if it changed. See esp32/README.md for the firmware guide.',
  exercise: 'Your first exchange',
  exerciseSend: 'Send your first message',
  exerciseSteps: [
    'Connect the website.',
    'Connect the ESP32 with its firmware.',
    'Type Hello ESP32 and press Send.',
    'Check whether it appears on the ESP32 screen.',
  ],
  exerciseBack: 'Send a message back',
  exerciseReply:
    'Have the ESP32 firmware send Hello computer. The reply should appear in the website’s message history.',
  troubleshooting: 'Need a little help?',
  troubleshootItems: [
    [
      'Website cannot connect',
      'Is the Node server running? Check the URL, IP address, and port.',
    ],
    [
      'ESP32 cannot connect',
      'Check Wi-Fi, SSID, password, and server address. Are both devices on the same network?',
    ],
    [
      'Website connects but ESP32 is offline',
      'Is the ESP32 powered on and connected to Wi-Fi? Check that it uses the same server IP and port and sends ESP32_CONNECTED.',
    ],
    [
      'Messages are not appearing',
      'Check both connections and the firmware message callback. Look for errors in the ESP32 Serial Monitor.',
    ],
    [
      'Still cannot connect on Wi-Fi',
      'Allow Node.js through the firewall on your trusted private network. School or guest Wi-Fi may block communication between devices; ask your teacher.',
    ],
  ],
};

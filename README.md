# ESP32 WebSocket Classroom

A small bilingual website for learning how a browser and an ESP32 exchange text messages in real time. Both connect to a tiny Node WebSocket server, which relays messages between them. Students connect, send, and receive using plain text. English and Arabic are included, with RTL layouts for Arabic. No extra hardware, accounts, database, or cloud service is needed.

## What you need

- Node.js 22.12 or newer (with npm)
- A browser and computer
- An ESP32-S3 touchscreen device and its firmware project
- Wi-Fi shared by the computer and ESP32

The website does not flash your ESP32 or implement its display firmware. The device must run firmware that connects to this server and displays received text. See [the ESP32 guide](esp32/README.md). You can first test the relay without a physical board with `npm test`.

## Install

Open a terminal in this repository:

```bash
npm install
npm run dev
```

This starts the WebSocket server on port **8080** and the website on port **5173**. Leave this terminal running. Press **Ctrl+C** to stop both.

To start them separately after installing at the root, use two terminals:

```bash
npm run server
```

```bash
npm run client
```

You can also run `npm start` inside `server/` and `npm run dev` inside `client/` after the root install. One root lockfile records dependency versions for both folders.

## Open the website

Open the **Classroom** network URL printed by `npm run dev`, for example **http://192.168.1.10:5173**. Share that same URL with students on your Wi-Fi or Ethernet network. Choose **Start the classroom**. The WebSocket field automatically uses that computer address, for example `ws://192.168.1.10:8080`. Press **Connect**.

Opening `http://localhost:5173` on the server computer redirects to its detected LAN address. If more than one network address is listed, choose the adapter connected to the students' network. After changing networks, restart `npm run dev` to refresh the addresses. Both servers listen on all network interfaces; devices still need network access to each other and permission through the computer's firewall.

The website and WebSocket server are two different programs, using two different ports. A green website status means the browser reached the server. The separate ESP32 status becomes green only after the device connects and identifies itself.

On another computer or tablet on the same Wi-Fi, open `http://<server-computer-ip>:5173` and connect to `ws://<server-computer-ip>:8080`.

## Connect the ESP32

1. Find the server computer’s local IPv4 address in its Wi-Fi network settings. On Windows, open a terminal, run `ipconfig`, and look for **IPv4 Address** under the active Wi-Fi adapter. On macOS/Linux, use network settings.
2. For example, if the address is `192.168.1.10`, use `ws://192.168.1.10:8080` in the website and firmware.
3. Configure the firmware’s Wi-Fi SSID, password, server IP, and port. Keep Wi-Fi credentials in the firmware project, not this repository.
4. On every successful WebSocket connection, the firmware must send the exact text `ESP32_CONNECTED` as its first message.
5. Subsequent messages are plain text. Show incoming messages on the touchscreen and send `Hello computer` back.

Do not use `localhost` in the ESP32 firmware: that refers to the ESP32 itself. See [esp32/README.md](esp32/README.md) for a small, explicitly conceptual example.

## First test

1. Run `npm run dev` and open the website.
2. Connect the website to the server.
3. Connect the ESP32; check that both status labels are green.
4. Type `Hello ESP32` and press **Send message** (or Enter).
5. Check the device screen. A website confirmation means the server forwarded the text; it does not prove the display rendered it.
6. Make the firmware send `Hello computer`. Check the incoming message in the website.

```text
Website → ESP32:
Hello ESP32

ESP32 → Website:
Hello computer
```

The **Learn** page contains the lesson, exercise, and troubleshooting in English and Arabic. Select **العربية** to switch languages. Language choice is remembered when browser storage is available.

## How messages travel

```text
Browser  ↔  Node WebSocket Server  ↔  ESP32
```

There are two WebSocket connections, one from each client to Node. On connection, the browser sends `BROWSER_CONNECTED`; the device sends `ESP32_CONNECTED`. The server remembers their roles. These identifiers are required only as the first message of each connection, including reconnects.

After identification:

| Direction | Data on the wire |
| --- | --- |
| Browser → server → ESP32 | Plain text, unchanged |
| ESP32 → server | Plain text, unchanged |
| Server → browser | Small JSON envelopes for messages, forwarding confirmations, errors, and device status |

For example, the server tells the browser `{"type":"message","message":"Hello computer","time":"..."}`. The UI shows only the message text. The collapsed **Advanced** section shows server frames for curious students. The browser connection code also accepts non-JSON text as a received message. JSON text sent by the ESP32 is preserved as text; it is not treated as a command.

Only one ESP32 is supported. A second device is rejected without disconnecting the first. Browser tabs receive device messages and status, but only the sending tab receives its send confirmation. Messages are not stored on the server; the website keeps the latest 100 messages and raw frames in memory. Refreshing clears them.

## Project structure

```text
client/                       React website
  index.html                  Page that loads main.jsx
  src/
    main.jsx                  React starts here
    App.jsx                   Navigation, language, classroom state
    components/               Connection panel, sender, log, language, status
    pages/                    HomePage, ClassroomPage, LearnPage
    websocket/
      websocketClient.js      connect(), disconnect(), sendMessage(), receive events
    translations/             en.js and ar.js (UI and lessons)
    styles.css                Responsive design and RTL styles
server/
  server.js                   Identify clients, receive and forward messages
  server.test.js              Real WebSocket relay tests
  .env.example                Optional port setting
esp32/README.md               Firmware protocol and conceptual example
package.json                  Start both programs with one command
```

### Read the code in this order

1. `client/src/main.jsx`: where React starts.
2. `client/src/websocket/websocketClient.js`: where the browser opens the WebSocket, sends text, and handles incoming frames.
3. `server/server.js`: the `message` event receives text; `esp32.send(text)` forwards it to the board; the browser loop forwards replies.
4. `client/src/App.jsx`: received messages update React state.
5. `client/src/components/ConnectionPanel.jsx` and `MessageLog.jsx`: state becomes visible status and conversation history.
6. `client/src/translations/ar.js`: Arabic text. The `lang` and `dir` attributes are set in `App.jsx`.

The app uses JavaScript, ordinary React state, and hash links for its three pages. Navigating between pages keeps the connection and message history alive. No routing or state-management library is needed.

## Configuration

No configuration file is needed by default. To change the server port, copy `server/.env.example` to `server/.env` and edit `PORT=8080`. Restart the server and change the port in the website and firmware too. An existing `PORT` environment variable takes precedence.

The browser reconnects manually so the connection state stays visible. After a server restart, press **Connect** again. The ESP32 firmware should reconnect and send its identification again. The server uses WebSocket ping/pong to detect a lost Wi-Fi connection, normally within about 15–30 seconds. The firmware’s WebSocket library must answer ping with pong.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Website cannot connect | Is Node running? Check `ws://`, local IP, and port 8080. Do not use the website’s port 5173. |
| ESP32 cannot connect | Check power, SSID, password, server IP, port, and that both devices share a network. |
| Website connects but ESP32 is offline | Firmware must send `ESP32_CONNECTED` immediately after connecting. Use the same server for both clients. |
| Messages do not appear | Check both status labels, the firmware receive callback, screen-update code, and ESP32 Serial Monitor. |
| Local browser works but the board cannot connect | Allow Node.js through the firewall on your trusted private network. Guest/school Wi-Fi may isolate devices; ask your teacher. |
| Port already in use | Stop the existing process or change the server port. The website requires port 5173 to be free. |
| Connection lost | Restart the server if needed, then press Connect. Device status is unknown while the browser is disconnected. |

Use this unauthenticated demo on a trusted classroom LAN. It has no TLS or authentication and is not intended for public internet exposure. Open the local website using HTTP; an HTTPS page generally cannot connect to an insecure `ws://` server.

## Check the project

```bash
npm test
npm run build
```

Tests start an isolated server on a free port and use real WebSocket clients to check identification, relay in both directions, Arabic and raw text, status updates, offline errors, and a second-device rejection. They do not prove that physical ESP32 firmware or its touchscreen works. `npm run build` writes the website to `client/dist/`; it does not bundle or start the Node server.

## بداية سريعة بالعربية

هذا المشروع يربط المتصفح وجهاز ESP32 بخادم Node بسيط لتبادل الرسائل النصية. لا تحتاج إلى مستشعرات أو قطع إضافية.

1. ثبّت Node.js، ثم افتح الطرفية داخل مجلد المشروع.
2. شغّل `npm install` ثم `npm run dev`.
3. افتح عنوان **Classroom** الذي يظهر في الطرفية، مثل `http://192.168.1.10:5173`، وشاركه مع الطلاب على الشبكة نفسها. اختر **العربية** ثم **ابدأ التجربة**.
4. اضغط **اتصل** لربط الموقع بالخادم.
5. اضبط برنامج ESP32 باستخدام اسم Wi-Fi وكلمة المرور وعنوان IP المحلي للحاسوب والمنفذ `8080`.
6. يجب أن يرسل الجهاز `ESP32_CONNECTED` بعد كل اتصال. لا تستخدم `localhost` كعنوان للحاسوب في برنامج الجهاز.
7. أرسل `Hello ESP32` من الموقع، ثم `Hello computer` من الجهاز.

الموقع لا يثبّت برنامج الشاشة على الجهاز. راجع [دليل ESP32](esp32/README.md). صفحة **تعلّم** تشرح الخطوات والمشكلات الشائعة بالعربية. لإيقاف المشروع اضغط `Ctrl+C` في الطرفية.

## Reference documentation

- [Vite getting started](https://vite.dev/guide/)
- [ws examples and heartbeat guidance](https://github.com/websockets/ws#readme)

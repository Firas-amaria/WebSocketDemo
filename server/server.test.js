import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { WebSocket } from 'ws';

test(
  'classroom relay: identify, send, receive, and disconnect',
  { timeout: 15000 },
  async (context) => {
    const server = spawn(process.execPath, ['server/server.js'], {
      env: { ...process.env, PORT: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    context.after(() => server.kill());
    const output = await new Promise((resolve, reject) => {
      let text = '';
      server.stdout.on('data', (data) => {
        text += data;
        if (/port \d+/.test(text)) resolve(text);
      });
      server.on('error', reject);
      server.on('exit', (code) =>
        reject(new Error(`Server exited early: ${code}`)),
      );
    });
    const url = `ws://127.0.0.1:${output.match(/port (\d+)/)[1]}`;
    async function client() {
      const socket = new WebSocket(url);
      context.after(() => socket.terminate());
      await once(socket, 'open');
      return socket;
    }
    async function receiveAfter(socket, action) {
      const received = once(socket, 'message');
      action();
      const [data] = await received;
      return data.toString();
    }
    const browser = await client();
    const initial = JSON.parse(
      await receiveAfter(browser, () => browser.send('BROWSER_CONNECTED')),
    );
    assert.equal(initial.online, false);
    assert.equal(initial.type, 'status');
    const offline = JSON.parse(
      await receiveAfter(browser, () => browser.send('Hello?')),
    );
    assert.equal(offline.code, 'deviceOffline');

    const esp32 = await client();
    const online = JSON.parse(
      await receiveAfter(browser, () => esp32.send('ESP32_CONNECTED')),
    );
    assert.equal(online.online, true);
    assert.ok(online.lastSeen);

    const acknowledgement = once(browser, 'message');
    assert.equal(
      await receiveAfter(esp32, () => browser.send('Hello ESP32')),
      'Hello ESP32',
    );
    assert.equal(JSON.parse((await acknowledgement)[0]).type, 'sent');
    for (const text of [
      'Hello computer',
      'مرحبًا بالحاسوب',
      '{not valid JSON',
      '{"message":"hello"}',
      'ESP32_CONNECTED',
    ]) {
      const received = JSON.parse(
        await receiveAfter(browser, () => esp32.send(text)),
      );
      assert.equal(received.type, 'message');
      assert.equal(received.message, text);
    }

    const secondBrowser = await client();
    assert.equal(
      JSON.parse(
        await receiveAfter(secondBrowser, () =>
          secondBrowser.send('BROWSER_CONNECTED'),
        ),
      ).online,
      true,
    );
    const secondDevice = await client();
    const rejected = once(secondDevice, 'close');
    secondDevice.send('ESP32_CONNECTED');
    assert.equal((await rejected)[0], 1008);

    const invalidClient = await client();
    const invalidClosed = once(invalidClient, 'close');
    invalidClient.send('unknown identity');
    assert.equal((await invalidClosed)[0], 1008);

    const secondOffline = once(secondBrowser, 'message');
    const disconnected = JSON.parse(
      await receiveAfter(browser, () => esp32.close()),
    );
    assert.equal(disconnected.online, false);
    assert.ok(disconnected.lastSeen);
    assert.equal(JSON.parse((await secondOffline)[0]).online, false);

    const reconnectedDevice = await client();
    assert.equal(
      JSON.parse(
        await receiveAfter(browser, () =>
          reconnectedDevice.send('ESP32_CONNECTED'),
        ),
      ).online,
      true,
    );
  },
);

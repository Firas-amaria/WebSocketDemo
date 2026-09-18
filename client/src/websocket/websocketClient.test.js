import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { WebSocketServer } from 'ws';
import { createWebSocketClient } from './websocketClient.js';

test(
  'browser connection handles raw text, loss, and manual reconnect',
  { timeout: 10000 },
  async (context) => {
    const server = new WebSocketServer({ port: 0 });
    await once(server, 'listening');
    context.after(() => {
      for (const socket of server.clients) socket.terminate();
      server.close();
    });
    const statuses = [];
    const errors = [];
    const messages = [];
    const client = createWebSocketClient({
      onStatus: (value) => statuses.push(value),
      onError: (value) => errors.push(value),
      onMessage: (value) => messages.push(value),
    });
    context.after(() => client.disconnect());
    async function waitFor(check) {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (check()) return;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      assert.fail('Expected event did not arrive');
    }
    client.connect('http://localhost:8080');
    assert.equal(errors.at(-1), 'invalidUrl');
    assert.equal(client.sendMessage('offline'), false);
    const url = `ws://127.0.0.1:${server.address().port}`;
    async function connect() {
      const accepted = once(server, 'connection');
      client.connect(url);
      const [socket] = await accepted;
      const [identity] = await once(socket, 'message');
      assert.equal(identity.toString(), 'BROWSER_CONNECTED');
      await waitFor(() => statuses.at(-1) === 'connected');
      return socket;
    }
    const socket = await connect();
    assert.equal(client.sendMessage('   '), false);
    const outgoing = once(socket, 'message');
    assert.equal(client.sendMessage('Hello ESP32'), true);
    assert.equal((await outgoing)[0].toString(), 'Hello ESP32');
    socket.send('raw reply مرحبًا');
    await waitFor(() => messages.length === 1);
    assert.equal(messages[0].message, 'raw reply مرحبًا');
    socket.send(JSON.stringify({ type: 'status', online: true }));
    await waitFor(() => messages.length === 2);
    assert.equal(messages[1].online, true);
    socket.terminate();
    await waitFor(() => errors.at(-1) === 'connectionLost');
    assert.equal(statuses.at(-1), 'disconnected');
    await connect();
    const errorCount = errors.length;
    client.disconnect();
    assert.equal(statuses.at(-1), 'disconnected');
    assert.equal(errors.length, errorCount);
  },
);

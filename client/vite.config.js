import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { networkInterfaces } from 'node:os';

// Show the addresses students can use from another device on the same network.
// Ignore common VPN and virtual adapters; keep both Wi-Fi and Ethernet addresses.
const networkAddresses = Object.entries(networkInterfaces()).flatMap(
  ([name, addresses]) =>
    /loopback|tailscale|vethernet|vmware|virtualbox|docker|wsl|vpn/i.test(name)
      ? []
      : addresses
          .filter(
            (address) =>
              address.family === 'IPv4' &&
              !address.internal &&
              !address.address.startsWith('169.254.'),
          )
          .map((address) => ({ name, ip: address.address })),
);
const classroomAddress = networkAddresses[0]?.ip || '';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'classroom-network-address',
      configureServer(server) {
        // Opening localhost on the teacher's computer also leads to a shareable LAN URL.
        server.middlewares.use((request, response, next) => {
          const host = request.headers.host?.replace(/:\d+$/, '');
          if (
            classroomAddress &&
            ['localhost', '127.0.0.1', '[::1]'].includes(host)
          ) {
            response.writeHead(302, {
              Location: `http://${classroomAddress}:${server.config.server.port}${request.url || '/'}`,
            });
            response.end();
            return;
          }
          next();
        });
        server.printUrls = () => {
          if (!networkAddresses.length) {
            console.log(
              '  No LAN IPv4 address found. Connect to Wi-Fi or Ethernet, then restart npm run dev.',
            );
          }
          for (const { name, ip } of networkAddresses) {
            console.log(`  Classroom (${name}): http://${ip}:${server.config.server.port}/`);
            console.log(
              `  WebSocket: ws://${ip}:8080 (or your configured server port)`,
            );
          }
        };
      },
    },
  ],
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
});

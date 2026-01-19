const { createServer } = require('http');
const next = require('next');
const WebSocket = require('ws');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    return handle(req, res);
  });

  // Attach a WebSocket server to the same HTTP server so WS and Next share the same port
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    console.log('WS connection', req.url);

    ws.on('message', (message) => {
      // Broadcast to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      // optional cleanup
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port} (WS attached)`);
  });
}).catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});

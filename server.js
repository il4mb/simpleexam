// server.js
const { createServer } = require("http");
const next = require("next");
const WebSocket = require("ws");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.NEXT_PUBLIC_PORT || 3000;

app.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res);
    });

    // WebSocket Server
    const wss = new WebSocket.Server({ server }); // attach to same HTTP server

    wss.on("connection", (ws) => {
        ws.on("message", (message) => {
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on("close", () => console.log("Client disconnected"));
    });

    server.listen(PORT, () => {
        console.log(`> Next.js running on http://localhost:${PORT}`);
        console.log(`> WebSocket relay running on ws://localhost:${PORT}`);
    });
});

// server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 1234 });

wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        // naive: broadcast to all other clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

console.log("Automerge relay running on ws://localhost:1234");

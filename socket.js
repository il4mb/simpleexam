const WebSocket = require("ws");

const PORT = process.env.PORT || 3020;

const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", (socket) => {
    socket.on("message", (data) => {
        wss.clients.forEach(client => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

console.log("🔥 WebSocket server running on port", PORT);

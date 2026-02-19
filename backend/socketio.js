import http from "http";
import { Server } from "socket.io";

let io;

let onlineUsers = {};
let lastSeen = {};

export const initSocket = (app) => {
    const server = http.createServer(app);

    io = new Server(server, {
        cors: {
            origin: "http://localhost:5174",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        // Think of a socket as a live communication channel between the server and one client (browser/app).
        console.log("Connected:", socket.id);

        // socket.on(eventName, callback) listens for messages/events from the client.
        socket.on("registerUser", (userId) => {
            if (!userId) return;
            if (!onlineUsers[userId]) {
                onlineUsers[userId] = new Set();
            }
            onlineUsers[userId].add(socket.id);
            socket.userId = userId;
            lastSeen[userId] = new Date();

            // io.emit(eventName, data) sends an event to all connected clients.
            io.emit("getOnlineUsers", {
                online: Object.keys(onlineUsers),
                lastSeen,
            });
        });

        // Handle disconnect per socket
        socket.on("disconnect", () => {
            const userId = socket.userId;
            if (userId && onlineUsers[userId]) {
                onlineUsers[userId].delete(socket.id);
                if (onlineUsers[userId].size === 0) {
                    delete onlineUsers[userId];
                    lastSeen[userId] = new Date();
                }
                io.emit("getOnlineUsers", {
                    online: Object.keys(onlineUsers),
                    lastSeen,
                });
            }
        });
    });

    // Return the HTTP server so caller can listen on it
    return server;
};

export const getSocketId = (userId) => {
    return onlineUsers[userId] ? [...onlineUsers[userId]] : null;
};

export default io;
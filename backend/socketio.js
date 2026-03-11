import http from "http";
import { Server } from "socket.io";
import Message from "./models/message.model.js";

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
    socket.on("registerUser", (user) => {
      if (!user) return;

      const userId = typeof user === "string" ? user : user._id;
      const userName =
        typeof user === "string" ? undefined : user.userName || user.name;

      if (!userId) return;

      if (!onlineUsers[userId]) {
        onlineUsers[userId] = new Set();
      }
      onlineUsers[userId].add(socket.id);
      socket.userId = userId;
      socket.userName = userName;
      lastSeen[userId] = new Date();

      // io.emit(eventName, data) sends an event to all connected clients.
      io.emit("getOnlineUsers", {
        online: Object.keys(onlineUsers),
        lastSeen,
      });
    });

    // Join a conversation room so that "io.to(conversationId).emit" works
    socket.on("joinConversation", (conversationId) => {
      if (!conversationId) return;
      const roomId = conversationId.toString();
      console.log(`Socket ${socket.id} joining conversation room ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit("userJoined", {
        userId: socket.userId,
        userName: socket.userName,
        conversationId: roomId,
      });
    });

    socket.on("messagesSeen", async ({ conversationId, userId }) => {
  try {
    const updatedMessages = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId }, // only messages from other user
        status: { $ne: "seen" }
      },
      { status: "seen" }
    );
    io.to(conversationId).emit("messagesSeenUpdate", {
      conversationId,
      seenBy: userId
    });
  } catch (error) {
    console.error("messagesSeen error:", error);
  }
});

    // Optional: allow leaving a conversation room
    socket.on("leaveConversation", (conversationId) => {
      if (!conversationId) return;
      const roomId = conversationId.toString();
      console.log(`Socket ${socket.id} leaving conversation room ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit("userLeft", {
        userId: socket.userId,
        userName: socket.userName,
        conversationId: roomId,
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

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket first.");
  }
  return io;
};

export default io;

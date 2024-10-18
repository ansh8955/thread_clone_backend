import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://thread-frontend-inky.vercel.app", // Ensure this matches the frontend URL
    methods: ["GET", "POST"],
  },
});

export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {}; // userId: socketId

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  const userId = socket.handshake.query.userId;

  // Ensure userId is not null or undefined before adding to userSocketMap
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit the list of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany({ conversationId, seen: false }, { $set: { seen: true } });
      await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });

      // Ensure the recipient exists in userSocketMap before emitting
      if (userSocketMap[userId]) {
        io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
      }
    } catch (error) {
      console.log("Error updating message seen status:", error); // This is 
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);

    // Get the userId associated with the disconnected socket
    const userId = Object.keys(userSocketMap).find((key) => userSocketMap[key] === socket.id);

    // Ensure userId exists before deleting
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, server, app };

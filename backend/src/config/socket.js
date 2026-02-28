// Socket configuration placeholder
const socketService = require("../services/socket.service");

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    socketService.registerSocketEvents(io, socket);

    socket.on("disconnect", () => {
      socketService.handleDisconnect(io, socket);
      console.log("❌ User disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;
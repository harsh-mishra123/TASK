const Room = require("../models/Room.model");

const activeUsers = new Map();
// socketId -> { roomCode, username }

const registerSocketEvents = (io, socket) => {

  // =========================
  // JOIN ROOM
  // =========================
  socket.on("join-room", async ({ roomCode }) => {
    try {
      const username = socket.user.username;
      const room = await Room.findOne({ roomCode });
      if (!room) return;

      socket.join(roomCode);
      activeUsers.set(socket.id, { roomCode, username });

      // Send full initial state (video + chat + participants)
      socket.emit("initial-state", {
        currentVideoId: room.currentVideoId,
        isPlaying: room.isPlaying,
        currentTime: room.currentTime,
        messages: room.messages.map((m) => ({
          username: m.username,
          text: m.message,
        })),
        participants: room.participants.map((p) => ({
          username: p.username,
          role: p.role,
        })),
      });

      // Broadcast updated participants to everyone
      io.to(roomCode).emit(
        "participants-update",
        room.participants.map((p) => ({
          username: p.username,
          role: p.role,
        }))
      );

    } catch (error) {
      console.error("Join room error:", error);
    }
  });


  // =========================
  // PLAY
  // =========================
  socket.on("play", async () => {
    await handlePlaybackUpdate(io, socket, { isPlaying: true });
  });


  // =========================
  // PAUSE
  // =========================
  socket.on("pause", async () => {
    await handlePlaybackUpdate(io, socket, { isPlaying: false });
  });


  // =========================
  // SEEK
  // =========================
  socket.on("seek", async ({ currentTime }) => {
    await handlePlaybackUpdate(io, socket, { currentTime });
  });


  // =========================
  // CHANGE VIDEO
  // =========================
  socket.on("change-video", async ({ videoId }) => {
    await handlePlaybackUpdate(io, socket, {
      currentVideoId: videoId,
      currentTime: 0,
      isPlaying: false,
    });
  });


  // =========================
  // ASSIGN MODERATOR
  // =========================
  socket.on("assign-moderator", async ({ roomCode, targetUsername }) => {
    try {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const room = await Room.findOne({ roomCode });
      if (!room) return;

      const requester = room.participants.find(
        (p) => p.username === user.username
      );

      if (!requester || requester.role !== "host") return;

      const target = room.participants.find(
        (p) => p.username === targetUsername
      );
      if (!target) return;

      target.role = "moderator";
      await room.save();

      io.to(roomCode).emit(
        "participants-update",
        room.participants.map((p) => ({
          username: p.username,
          role: p.role,
        }))
      );

    } catch (error) {
      console.error("Assign moderator error:", error);
    }
  });


  // =========================
  // REMOVE PARTICIPANT
  // =========================
  socket.on("remove-participant", async ({ roomCode, targetUsername }) => {
    try {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const room = await Room.findOne({ roomCode });
      if (!room) return;

      const requester = room.participants.find(
        (p) => p.username === user.username
      );

      if (!requester || requester.role !== "host") return;
      if (targetUsername === user.username) return;

      room.participants = room.participants.filter(
        (p) => p.username !== targetUsername
      );
      await room.save();

      // Notify the removed user
      io.to(roomCode).emit("user-removed", { username: targetUsername });

      // Broadcast updated participants
      io.to(roomCode).emit(
        "participants-update",
        room.participants.map((p) => ({
          username: p.username,
          role: p.role,
        }))
      );

    } catch (error) {
      console.error("Remove participant error:", error);
    }
  });


  // =========================
  // TRANSFER HOST
  // =========================
  socket.on("transfer-host", async ({ roomCode, username: targetUsername }) => {
    try {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const room = await Room.findOne({ roomCode });
      if (!room) return;

      const requester = room.participants.find(
        (p) => p.username === user.username
      );

      if (!requester || requester.role !== "host") return;

      room.participants.forEach((p) => {
        if (p.username === targetUsername) {
          p.role = "host";
          room.host = targetUsername;
        } else if (p.role === "host") {
          p.role = "user";
        }
      });

      await room.save();

      io.to(roomCode).emit(
        "participants-update",
        room.participants.map((p) => ({
          username: p.username,
          role: p.role,
        }))
      );

    } catch (error) {
      console.error("Transfer host error:", error);
    }
  });


  // =========================
  // SEND MESSAGE
  // =========================
  socket.on("send-message", async ({ text }) => {
    try {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const room = await Room.findOne({ roomCode: user.roomCode });
      if (!room) return;

      // Save to DB with schema field name
      room.messages.push({
        username: user.username,
        message: text,
      });
      await room.save();

      // Emit to clients with frontend field name
      io.to(user.roomCode).emit("receive-message", {
        username: user.username,
        text,
      });

    } catch (error) {
      console.error("Send message error:", error);
    }
  });


  // =========================
  // TYPING
  // =========================
  socket.on("typing", () => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    socket.to(user.roomCode).emit("user-typing", {
      username: user.username,
    });
  });

  socket.on("stop-typing", () => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    socket.to(user.roomCode).emit("user-stop-typing", {
      username: user.username,
    });
  });
};


// =========================
// PLAYBACK UPDATE HANDLER
// =========================
const handlePlaybackUpdate = async (io, socket, updates) => {
  try {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    const room = await Room.findOne({ roomCode: user.roomCode });
    if (!room) return;

    const participant = room.participants.find(
      (p) => p.username === user.username
    );

    // Permission check
    if (!participant || !["host", "moderator"].includes(participant.role)) {
      return;
    }

    Object.assign(room, updates);
    await room.save();

    io.to(user.roomCode).emit("sync-update", updates);

  } catch (error) {
    console.error("Playback update error:", error);
  }
};


// =========================
// DISCONNECT HANDLER
// =========================
const handleDisconnect = async (io, socket) => {
  try {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    const room = await Room.findOne({ roomCode: user.roomCode });
    if (!room) return;

    const leavingUser = room.participants.find(
      (p) => p.username === user.username
    );

    // Remove user
    room.participants = room.participants.filter(
      (p) => p.username !== user.username
    );

    // Auto host transfer
    if (leavingUser?.role === "host" && room.participants.length > 0) {
      const newHost = room.participants[0];
      newHost.role = "host";
      room.host = newHost.username;

      io.to(user.roomCode).emit("host-transferred", {
        newHost: newHost.username,
      });
    }

    await room.save();

    activeUsers.delete(socket.id);

    // Broadcast updated participants
    io.to(user.roomCode).emit(
      "participants-update",
      room.participants.map((p) => ({
        username: p.username,
        role: p.role,
      }))
    );

  } catch (error) {
    console.error("Disconnect error:", error);
  }
};


module.exports = {
  registerSocketEvents,
  handleDisconnect,
};
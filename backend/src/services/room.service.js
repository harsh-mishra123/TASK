const Room = require("../models/Room.model");
const generateRoomCode = require("../utils/generateRoomCode");

const createRoom = async (username) => {
  const roomCode = generateRoomCode();

  const room = await Room.create({
    roomCode,
    host: username,
    participants: [
      {
        userId: username,
        username,
        role: "host",
      },
    ],
  });

  return room;
};

const joinRoom = async (roomCode, username) => {
  const room = await Room.findOne({ roomCode });

  if (!room) throw new Error("Room not found");

  room.participants.push({
    userId: username,
    username,
    role: "user",
  });

  await room.save();
  return room;
};



const assignModerator = async (roomCode, targetUsername, requesterUsername) => {
  const room = await Room.findOne({ roomCode });
  if (!room) throw new Error("Room not found");

  const requester = room.participants.find(
    (p) => p.username === requesterUsername
  );

  if (!requester || requester.role !== "host") {
    throw new Error("Only host can assign moderator");
  }

  const participant = room.participants.find(
    (p) => p.username === targetUsername
  );

  if (!participant) throw new Error("User not found");

  participant.role = "moderator";

  await room.save();
  return room;
};
const transferHost = async (roomCode, newHostUsername, requesterUsername) => {
  const room = await Room.findOne({ roomCode });
  if (!room) throw new Error("Room not found");

  const requester = room.participants.find(
    (p) => p.username === requesterUsername
  );

  if (!requester || requester.role !== "host") {
    throw new Error("Only host can transfer host");
  }

  room.participants.forEach((p) => {
    if (p.username === newHostUsername) {
      p.role = "host";
      room.host = newHostUsername;
    } else if (p.role === "host") {
      p.role = "user";
    }
  });

  await room.save();
  return room;
};

const removeParticipant = async (roomCode, targetUsername, requesterUsername) => {
  const room = await Room.findOne({ roomCode });
  if (!room) throw new Error("Room not found");

  const requester = room.participants.find(
    (p) => p.username === requesterUsername
  );

  if (!requester || requester.role !== "host") {
    throw new Error("Only host can remove participants");
  }

  if (targetUsername === requesterUsername) {
    throw new Error("Host cannot remove themselves");
  }

  room.participants = room.participants.filter(
    (p) => p.username !== targetUsername
  );

  await room.save();
  return room;
};

module.exports = {
  createRoom,
  joinRoom,
  assignModerator,
  transferHost,
  removeParticipant,
};
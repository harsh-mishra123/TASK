// Room controller placeholder
const roomService = require("../services/room.service");

const createRoom = async (req, res) => {
  try {
    const username = req.user.username; 
    const room = await roomService.createRoom(username);
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const username = req.user.username;
    const room = await roomService.joinRoom(roomCode, username);
    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const assignModerator = async (req, res) => {
  try {
    const { roomCode, username } = req.body;
    const requesterUsername = req.user.username;

    const room = await roomService.assignModerator(
      roomCode,
      username,
      requesterUsername
    );

    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const transferHost = async (req, res) => {
  try {
    const { roomCode, username } = req.body;
    const requesterUsername = req.user.username;

    const room = await roomService.transferHost(
      roomCode,
      username,
      requesterUsername
    );

    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeParticipant = async (req, res) => {
  try {
    const { roomCode, username } = req.body;
    const requesterUsername = req.user.username;

    const room = await roomService.removeParticipant(
      roomCode,
      username,
      requesterUsername
    );

    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  createRoom,
  joinRoom,
  assignModerator,
  transferHost,
  removeParticipant,
};
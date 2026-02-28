const mongoose = require("mongoose");

// =====================
// Participant Schema
// =====================
const participantSchema = new mongoose.Schema({
  userId: { type: String },
  username: { type: String, required: true },
  role: {
    type: String,
    enum: ["host", "moderator", "user"],
    default: "user",
  },
});

// =====================
// Message Schema (DEFINE FIRST)
// =====================
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// =====================
// Room Schema
// =====================
const roomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    host: { type: String, required: true },
    participants: [participantSchema],
    currentVideoId: { type: String, default: "" },
    isPlaying: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
    messages: [messageSchema], // 👈 now this works
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
// Entry point for app
const express = require('express');
const cors = require('cors');
const roomRoutes = require("./routes/room.routes");
const authRoutes = require("./routes/auth.routes");



const app = express();



app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the YouTube Video Sync API!" });
});


app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

module.exports = app;
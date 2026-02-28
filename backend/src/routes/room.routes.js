const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const authenticate = require("../middleware/auth.middleware");

router.post("/create", authenticate, roomController.createRoom);
router.post("/join", authenticate, roomController.joinRoom);

router.post("/assign-moderator", authenticate, roomController.assignModerator);
router.post("/transfer-host", authenticate, roomController.transferHost);
router.post("/remove", authenticate, roomController.removeParticipant);

module.exports = router;
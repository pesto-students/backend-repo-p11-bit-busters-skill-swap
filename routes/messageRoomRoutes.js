const express = require("express");
const router = express.Router();
const messageRoomController = require("../controllers/messageRoomController.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
    "/:room_id/message",
    isAuthenticated,
    upload.fields([{ name: "file", maxCount: 1 }]),
    messageRoomController.addMessage
);
router.post(
    "/:room_id/messages",
    isAuthenticated,
    messageRoomController.getMessages
);
router.get("/", isAuthenticated, messageRoomController.getRooms);
router.post("/create", isAuthenticated, messageRoomController.createRoom);

module.exports = router;

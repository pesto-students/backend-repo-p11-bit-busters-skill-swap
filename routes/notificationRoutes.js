const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js");

router.post("/", isAuthenticated, notificationController.getNotifications);
router.post("/:notification_id/mark_read_unread", isAuthenticated, notificationController.markNotificationReadUnread);

module.exports = router;

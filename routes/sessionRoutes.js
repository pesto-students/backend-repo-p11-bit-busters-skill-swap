const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js");
const validate = require("../middlewares/validate.js");

router.post(
    "/create",
    isAuthenticated,
    validate("createSession"),
    sessionController.createSession
);
router.post(
    "/list",
    isAuthenticated,
    validate("getSessions"),
    sessionController.getSessions
);
router.post(
    "/:session_id/update_status",
    isAuthenticated,
    validate("updateSessionStatus"),
    sessionController.updateStatus
);
router.post(
    "/:session_id/add_review",
    isAuthenticated,
    validate("addReview"),
    sessionController.addReview
);

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js");
const validate = require("../middlewares/validate.js");

router.post("/profile", isAuthenticated, validate("userProfile"), userController.updateProfile);
router.get("/profile", isAuthenticated, userController.getUserProfile);
router.get("/:user_id/profile", isAuthenticated, userController.getUserProfile);

module.exports = router;

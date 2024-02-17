const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js");
const validate = require("../middlewares/validate.js");

router.post("/login", validate("login"), authController.loginUser);
router.post("/register", validate("register"), authController.registerUser);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification-link", validate("resend_verification"), authController.resendVerificationLink);

module.exports = router;

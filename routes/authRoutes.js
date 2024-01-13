const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js");
const validate = require("../middlewares/validate.js");

router.post("/login", validate("login"), authController.loginUser);
// router.post("/register", isAuthenticated, authController.profile  );
// router.get("/profile", isAuthenticated, authController.profile  );

module.exports = router;

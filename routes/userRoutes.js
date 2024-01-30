const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js");
const validate = require("../middlewares/validate.js");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
    "/profile",
    isAuthenticated,
    validate("userProfile"),
    userController.updateProfile
);
router.post(
    "/profile_picture",
    isAuthenticated,
    upload.fields([{ name: "profile_picture", maxCount: 1 }]),
    userController.updateProfilePicture
);
router.get("/profile", isAuthenticated, userController.getUserProfile);
router.get("/:user_id/profile", isAuthenticated, userController.getUserProfile);
router.post("/search", isAuthenticated, userController.searchUsers);
router.post("/reviews", isAuthenticated, userController.getUserReviews);
router.post("/:user_id/reviews", isAuthenticated, userController.getUserReviews);

module.exports = router;

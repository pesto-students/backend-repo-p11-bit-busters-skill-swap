const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/response");

const userController = {
    async updateProfile(req, res) {
        try {
            const { _id } = req.user;
            const data = req.body;

            await User.findByIdAndUpdate(_id, data);
            const user = await User.findById(_id);

            return sendResponse(
                res,
                200,
                "Your profile is updated successfully.",
                { user }
            );
        } catch (error) {
            console.error("Error register user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async getUserProfile(req, res) {
        try {
            const { user_id } = req.params;

            let user = req.user;
            if (user_id) {
                user = await User.findById(user_id);
            }

            return sendResponse(
                res,
                200,
                "User profile fetched successfully.",
                { user }
            );
        } catch (error) {
            console.error("Error register user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },
};

module.exports = userController;

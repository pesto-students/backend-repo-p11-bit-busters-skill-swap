const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResponse = require('../utils/response');

const authController = {
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return sendResponse(res, 400, "Email does not exists.", null, {
                    email: { message: "Email does not exists." },
                });
            }

            const checkPassword = await bcrypt.compare(password, user.password);
            if (!checkPassword) {
                return sendResponse(res, 400, "Your credentials does not match.", null, {
                    email: { message: "Your credentials does not match." },
                });
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return sendResponse(res, 200, "User logged in successfully.", { token, user });
        } catch (error) {
            console.error("Error login user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async registerUser(req, res) {
        try {
            const { name, email, password } = req.body;

            const user = await User.findOne({ email });
            if (user) {
                return sendResponse(res, 400, "Your credentials does not match.", null, {
                    email: {
                        message: "Email already exists",
                    },
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const new_user = new User({
                name,
                email,
                password: hashedPassword,
            });
            await new_user.save();

            const token = jwt.sign(
                { userId: new_user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return sendResponse(res, 200, "Your registration is successfull.", { token: `JWT ${token}`, user: new_user });
        } catch (error) {
            console.error("Error register user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },
};

module.exports = authController;

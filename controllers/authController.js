const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/response");
const { sendVerificationMail } = require("../utils/sendMails");

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

            if (!user.verified_at) {
                return sendResponse(res, 400, "Your email is not verified.", null, {
                    email: { message: "Your email is not verified." },
                });
            }

            const checkPassword = await bcrypt.compare(password, user.password);
            if (!checkPassword) {
                return sendResponse(
                    res,
                    400,
                    "Your credentials does not match.",
                    null,
                    {
                        email: { message: "Your credentials does not match." },
                    }
                );
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return sendResponse(res, 200, "User logged in successfully.", {
                token: `JWT ${token}`,
                user,
            });
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
                return sendResponse(res, 400, "Email already exists.", null, {
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

            // const token = jwt.sign(
            //     { userId: new_user._id },
            //     process.env.JWT_SECRET,
            //     { expiresIn: "7d" }
            // );

            // return sendResponse(
            //     res,
            //     200,
            //     "Your registration is successfully.",
            //     { token: `JWT ${token}`, user: new_user }
            // );

            sendVerificationMail(new_user)
                .then((info) => {
                    console.log("Message sent: %s", info.messageId);
                    sendResponse(
                        res,
                        200,
                        "Verification email sent to your mail.",
                        { user: new_user }
                    );
                })
                .catch((error) => {
                    console.error("Error sending verification email:", error);
                    sendResponse(
                        res,
                        500,
                        "Internal server error while sending verification email.",
                        null,
                        {
                            email: {
                                message:
                                    error.message ||
                                    "Error sending verification mail.",
                            },
                        }
                    );
                });
        } catch (error) {
            console.error("Error register user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return sendResponse(res, 400, "Token is required.", null, {
                    error: "Token is required.",
                });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_OTHER_SECRET);
            } catch (error) {
                return sendResponse(
                    res,
                    401,
                    "Invalid or expired token.",
                    null,
                    { error: "Invalid or expired token." }
                );
            }

            const userId = decoded.userId;
            const user = await User.findById(userId);

            if (!user) {
                return sendResponse(res, 404, "User not found.", null, {
                    error: "User not found.",
                });
            }

            if (user.verified_at) {
                return sendResponse(res, 400, "User already verified.", null, {
                    error: "User already verified.",
                });
            }

            user.verified_at = new Date();
            await user.save();

            sendResponse(
                res,
                200,
                "Email successfully verified. Please login to continue.",
                {
                    success:
                        "Email successfully verified. Please login to continue.",
                }
            );
        } catch (error) {
            console.error("Verification error:", error);
            sendResponse(res, 500, "Internal server error.", null, {
                error: "An unexpected error occurred.",
            });
        }
    },
};

module.exports = authController;

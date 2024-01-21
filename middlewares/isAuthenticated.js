const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendResponse = require("../utils/response");

const isAuthenticated = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return sendResponse(res, 401, "No token provided", null, {
            app: { message: "No token provided" }
        });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, 401, "Invalid token", null, {
                app: { message: "Invalid token" }
            });
        }

        req.user = user;

        next();
    } catch (err) {
        console.log(err);
        return sendResponse(res, 401, "Invalid token", null, {
            app: { message: "Invalid token" }
        });
    }
};

module.exports = isAuthenticated;
